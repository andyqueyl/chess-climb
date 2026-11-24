import { esc, md, $, $$, THEME_NAMES, fmtDateLong } from '../ui.js';
import { Board, Chess } from '../board.js';
import { store, DAY } from '../store.js';

const TAG_TO_THEME = { fork: 'fork', mate: 'mateIn2', 'free-piece': 'hangingPiece', 'winning-capture': 'hangingPiece', discovered: 'discoveredAttack', promotion: 'advancedPawn', 'quiet-move': 'quietMove' };
const MODES = {
  smart: { title: 'Smart mix', blurb: 'At your level, tilted toward the themes you miss most, with retries mixed in.' },
  mine: { title: 'From my games', blurb: 'Moments from your own games where one move won and you missed it.' },
  retry: { title: 'Retry missed', blurb: 'Puzzles you failed, spaced out until they stick.' },
  london: { title: 'London & Jobava positions', blurb: 'Tactics that came out of London System and Jobava games.' },
};

let pools = null;
function buildPools(data) {
  if (pools) return pools;
  const lich = data.lichess.puzzles.map(r => ({ key: 'l:' + r[0], id: r[0], fen: r[1], setup: r[2].split(' ')[0], sol: r[2].split(' ').slice(1), rating: r[3], themes: r[4], src: 'lichess' }));
  const lon = (data.lichess.london || []).map(r => ({ key: 'l:' + r[0], id: r[0], fen: r[1], setup: r[2].split(' ')[0], sol: r[2].split(' ').slice(1), rating: r[3], themes: r[4], src: 'lichess', opening: r[5] }));
  const mine = [...data.myPuzzles].sort((a, b) => b.date - a.date).map(p => ({
    key: 'm:' + p.id, id: p.id, fen: p.fen, setup: null, sol: [p.solution], accept0: p.accept, rating: null,
    themes: p.tags.map(t => TAG_TO_THEME[t]).filter(Boolean), tags: p.tags, src: 'mine', line: p.line, played: p.played, game: p.game, ply: p.ply, date: p.date, kind: p.kind,
  }));
  const byKey = Object.fromEntries([...lich, ...lon, ...mine].map(p => [p.key, p]));
  const themeCount = {};
  lich.forEach(p => p.themes.forEach(t => THEME_NAMES[t] && (themeCount[t] = (themeCount[t] || 0) + 1)));
  pools = { lich, lon, mine, byKey, themeCount };
  return pools;
}

export function renderTactics(ctx) {
  const [sub, arg] = ctx.params;
  if (sub === 'practice') return renderTrainer(ctx, arg || 'smart');
  if (sub === 'lesson') return renderLesson(ctx, arg);
  if (sub === 'endgame') return renderEndgame(ctx, arg);
  renderHub(ctx);
}

function renderHub({ app, data }) {
  const P = buildPools(data);
  const s = store.get();
  const ts = store.themeStats(90);
  const due = store.dueRetries().length;
  const mineLeft = P.mine.filter(p => !s.puzzles[p.key]?.ok).length;
  const L = data.lessons;
  const counts = { smart: `${P.lich.length} puzzles`, mine: `${mineLeft} of ${P.mine.length} unsolved`, retry: `${due} due now`, london: `${P.lon.length} puzzles` };
  app.innerHTML = `
  <div class="spread"><div><h1>Tactics <em>trainer</em></h1><p class="muted">Most games at 1100-1600 are decided by a tactic someone missed. Train the patterns, then the habit.</p></div>
    <div class="card stat" style="padding:10px 16px"><div class="v">${s.prating}</div><div class="l">Site puzzle rating</div></div></div>
  <section class="grid g4 section" style="margin-top:12px">
    ${Object.entries(MODES).map(([k, mo]) => `<a class="card" href="#/tactics/practice/${k}" style="color:inherit;text-decoration:none">
      <h3>${mo.title}</h3><p class="muted" style="font-size:14px">${mo.blurb}</p><span class="chip">${counts[k]}</span></a>`).join('')}
  </section>

  <section class="section"><h2>Practice by theme</h2>
    <div class="grid g4" style="gap:8px">${Object.keys(THEME_NAMES).filter(t => P.themeCount[t]).map(t => {
      const st = ts[t];
      return `<a class="lesson-item" href="#/tactics/practice/${t}"><span>${THEME_NAMES[t]}</span><span class="faint" style="font-size:13px">${st ? `${Math.round((st.ok / st.n) * 100)}% of ${st.n}` : ''}</span></a>`;
    }).join('')}</div></section>

  <section class="section grid g2">
    <div><h2>Lessons</h2>
      ${L ? `<div class="lesson-list">
        ${L.process ? `<a class="lesson-item" href="#/tactics/lesson/process"><span><b>${esc(L.process.title)}</b><br><span class="faint" style="font-size:13px">The every-move habit. Start here.</span></span>${s.read.process ? '<span class="done">✓ read</span>' : ''}</a>` : ''}
        ${L.tactics.map(l => `<a class="lesson-item" href="#/tactics/lesson/${l.id}"><span>${esc(l.title)}<br><span class="faint" style="font-size:13px">${esc(l.summary)}</span></span>${s.read[l.id] ? '<span class="done">✓ read</span>' : ''}</a>`).join('')}
      </div>` : '<div class="empty">Lessons are being written.</div>'}
    </div>
    <div><h2>Endgame essentials</h2>
      ${L?.endgames?.length ? `<div class="lesson-list">${L.endgames.map(l => `<a class="lesson-item" href="#/tactics/endgame/${l.id}"><span>${esc(l.title)}<br><span class="faint" style="font-size:13px">${esc(l.summary)}</span></span>${s.read['eg:' + l.id] ? '<span class="done">✓ read</span>' : ''}</a>`).join('')}</div>` : '<div class="empty">Coming soon.</div>'}
    </div>
  </section>`;
}

/* ---------- picking puzzles ---------- */

function pickNext(mode, P, sessionSeen, query) {
  const s = store.get();
  const fresh = p => !sessionSeen.has(p.key) && !(s.puzzles[p.key]?.ok && s.puzzles[p.key].last > Date.now() - 30 * DAY);
  const near = (list, spread) => list.filter(p => p.rating == null || Math.abs(p.rating - s.prating) <= spread);
  const rand = a => a[Math.floor(Math.random() * a.length)];
  const wanted = query.get('id');
  if (wanted && !sessionSeen.has('m:' + wanted) && P.byKey['m:' + wanted]) return P.byKey['m:' + wanted];
  if (mode === 'mine') return P.mine.find(p => !sessionSeen.has(p.key) && !s.puzzles[p.key]?.ok) || P.mine.find(p => !sessionSeen.has(p.key));
  if (mode === 'retry') { const k = store.dueRetries().find(k => !sessionSeen.has(k) && P.byKey[k]); return k ? P.byKey[k] : null; }
  if (mode === 'london') return rand(near(P.lon.filter(fresh), 300)) || rand(P.lon.filter(fresh)) || null;
  if (THEME_NAMES[mode]) {
    const list = P.lich.filter(p => p.themes.includes(mode) && fresh(p));
    return rand(near(list, 200)) || rand(near(list, 400)) || rand(list) || null;
  }
  // smart mix
  const r = Math.random();
  const due = store.dueRetries().filter(k => !sessionSeen.has(k) && P.byKey[k]);
  if (due.length && r < 0.2) return P.byKey[due[0]];
  const mineLeft = P.mine.filter(p => fresh(p) && !s.puzzles[p.key]?.ok);
  if (mineLeft.length && r < 0.35) return rand(mineLeft);
  const ts = store.themeStats(60), weights = {};
  for (const t of Object.keys(THEME_NAMES)) { const st = ts[t]; weights[t] = 1 + (st && st.n >= 4 ? 2 * (1 - st.ok / st.n) : 0.5); }
  P.mine.forEach(p => p.themes.forEach(t => (weights[t] = (weights[t] || 1) + 0.15)));
  const cands = near(P.lich.filter(fresh), 150);
  if (!cands.length) return rand(P.lich);
  let best = null, bestW = -1;
  for (let i = 0; i < 40; i++) { const c = rand(cands); const w = Math.max(...c.themes.map(t => weights[t] || 1), 1) * Math.random(); if (w > bestW) { best = c; bestW = w; } }
  return best;
}

/* ---------- trainer ---------- */

function renderTrainer({ app, data, query, onLeave }, mode) {
  const P = buildPools(data);
  const title = MODES[mode]?.title || THEME_NAMES[mode] || 'Puzzles';
  const lesson = data.lessons?.tactics?.find(l => l.theme === mode);
  app.innerHTML = `
  <a href="#/tactics">← Tactics</a>
  <div class="spread"><h1 style="margin-top:6px">${esc(title)}</h1><div class="row" id="sess"></div></div>
  <section class="play">
    <div><div id="board"></div></div>
    <div class="side">
      <div class="status" id="st">Loading…</div>
      <div class="row"><button class="btn" id="hint">Hint</button><button class="btn" id="sol">Show solution</button><button class="btn primary" id="next">Next puzzle</button></div>
      <div class="card" id="meta"></div>
      ${lesson ? `<a href="#/tactics/lesson/${lesson.id}">Read the ${esc(lesson.title)} lesson →</a>` : ''}
    </div>
  </section>`;

  const board = new Board($('#board', app));
  const sessionSeen = new Set();
  const sess = { n: 0, ok: 0, streak: 0 };
  let pz = null, step = 0, failed = false, finished = false, chess = null, timer = null;
  const st = $('#st', app), meta = $('#meta', app);
  const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  onLeave(() => clearTimeout(timer));

  const drawSess = () => {
    $('#sess', app).innerHTML = `<span class="chip">${sess.ok}/${sess.n} solved</span><span class="chip">streak ${sess.streak}</span><span class="chip">rating ${store.get().prating}</span>`;
  };
  const record = ok => {
    if (finished) return;
    finished = true;
    sess.n++; if (ok) { sess.ok++; sess.streak++; } else sess.streak = 0;
    store.recordPuzzle(pz.key, ok, { rating: pz.src === 'lichess' ? pz.rating : null, themes: pz.themes, src: pz.src });
    drawSess();
  };
  const showMeta = (revealed) => {
    const bits = [];
    if (pz.src === 'mine') {
      bits.push(`<div class="eyebrow">From your game · ${fmtDateLong(pz.date)}</div>`);
      if (revealed) {
        bits.push(`<p>In the game you played <b>${esc(pz.played)}</b>. The engine line: <span class="mono">${esc(pz.line.join(' '))}</span></p>`);
        bits.push(`<p class="faint">Pattern: ${pz.tags.map(t => esc(t.replace('-', ' '))).join(', ')}</p>`);
        const gid = data.games.find(g => g.url === pz.game)?.id;
        if (gid) bits.push(`<a href="#/game/${gid}">See it in the game →</a>`);
      } else bits.push(`<p class="muted">${pz.kind === 'missed-win' ? 'Your opponent just slipped. Punish it.' : 'There is one clearly best move here.'}</p>`);
    } else {
      bits.push(`<div class="eyebrow">Lichess puzzle ${esc(pz.id)} · rated ${pz.rating}</div>`);
      bits.push(revealed ? `<p class="faint">${pz.themes.filter(t => THEME_NAMES[t]).map(t => THEME_NAMES[t]).join(' · ') || '—'}</p><a href="https://lichess.org/training/${esc(pz.id)}" target="_blank" rel="noopener">Open on Lichess ↗</a>` : '<p class="faint">Themes hidden until you solve it.</p>');
    }
    meta.innerHTML = bits.join('');
  };

  const solverColor = () => chess.turn();
  const prompt = () => { st.className = 'status'; st.textContent = `${solverColor() === 'w' ? 'White' : 'Black'} to move. Find the best move.`; };

  const load = () => {
    pz = pickNext(mode, P, sessionSeen, query);
    if (!pz) { st.className = 'status info'; st.innerHTML = mode === 'retry' ? 'No retries due. Nice. <a href="#/tactics/practice/smart">Do a smart mix →</a>' : 'Out of puzzles here. <a href="#/tactics">Pick another set →</a>'; meta.innerHTML = ''; board.setMovable(null); return; }
    sessionSeen.add(pz.key);
    step = 0; failed = false; finished = false;
    chess = new Chess(pz.fen);
    board.setArrows([]); board.clearMarks();
    if (pz.setup) {
      const setupColor = chess.turn();
      board.setOrientation(setupColor === 'w' ? 'black' : 'white');
      board.setFen(pz.fen); board.setMovable(null);
      st.className = 'status'; st.textContent = 'Watch the opponent\'s move…';
      later(() => { const m = chess.move(uci(pz.setup)); board.setFen(chess.fen(), [m.from, m.to]); board.setMovable(chess.turn()); prompt(); }, 700);
    } else {
      board.setOrientation(chess.turn() === 'w' ? 'white' : 'black');
      board.setFen(pz.fen); board.setMovable(chess.turn()); prompt();
    }
    showMeta(false);
    $('#next', app).classList.remove('primary');
  };

  const done = ok => {
    record(ok);
    board.setMovable(null);
    st.className = 'status ' + (ok ? 'good' : 'bad');
    st.innerHTML = ok ? `<b>Solved!</b> ${failed ? '' : 'Clean.'}` : '<b>Not this time.</b> It\'ll come back in your retry queue.';
    showMeta(true);
    $('#next', app).classList.add('primary');
    if (pz.src === 'mine' && pz.line.length > 1) playLine(pz.line.slice(1), 0);
  };
  const playLine = (sans, i) => {
    if (i >= sans.length || i >= 5) return;
    later(() => { try { const m = chess.move(sans[i]); board.setFen(chess.fen(), [m.from, m.to]); playLine(sans, i + 1); } catch {} }, 900);
  };

  board.onMove = mv => {
    if (finished && !failed) return;
    const exp = pz.sol[step];
    const u = mv.from + mv.to + (mv.promotion && exp?.length === 5 ? exp[4] : mv.promotion ? 'q' : '');
    const test = new Chess(chess.fen());
    let res; try { res = test.move({ from: mv.from, to: mv.to, promotion: u[4] || 'q' }); } catch { return; }
    const ok = u === exp || u.slice(0, 4) === exp.slice(0, 4) && !exp[4] || (step === 0 && pz.accept0?.includes(u)) || test.isCheckmate();
    if (ok) {
      chess.move({ from: mv.from, to: mv.to, promotion: u[4] || 'q' });
      board.setFen(chess.fen(), [mv.from, mv.to]);
      board.mark(mv.to, 'good');
      step++;
      if (step >= pz.sol.length || test.isCheckmate()) return done(!failed);
      board.setMovable(null);
      st.className = 'status good'; st.textContent = 'Good. Keep going…';
      later(() => {
        const r = chess.move(uci(pz.sol[step])); step++;
        board.setFen(chess.fen(), [r.from, r.to]); board.setMovable(chess.turn());
        st.className = 'status'; st.textContent = 'Your move again.';
      }, 500);
    } else {
      if (!failed) { failed = true; record(false); }
      board.setFen(test.fen(), [mv.from, mv.to]); board.mark(mv.to, 'bad'); board.setMovable(null);
      st.className = 'status bad'; st.textContent = `${res.san} isn't it. Try again, or show the solution.`;
      later(() => { board.setFen(chess.fen()); board.setMovable(chess.turn()); }, 900);
    }
  };

  $('#hint', app).onclick = () => {
    if (!pz || finished && !failed) return;
    const exp = pz.sol[step]; if (!exp) return;
    if (!failed) { failed = true; record(false); }
    board.mark(exp.slice(0, 2), 'hint');
    st.className = 'status info'; st.textContent = 'Hint: move the highlighted piece. (Counts as a miss.)';
  };
  $('#sol', app).onclick = () => {
    if (!pz) return;
    if (!finished) record(false);
    failed = true;
    board.setMovable(null);
    const rest = pz.sol.slice(step);
    const run = i => { if (i >= rest.length) { st.className = 'status bad'; st.innerHTML = 'That was the solution. Try the next one.'; showMeta(true); $('#next', app).classList.add('primary'); if (pz.src === 'mine' && pz.line.length > 1) playLine(pz.line.slice(1), 0); return; }
      later(() => { const m = chess.move(uci(rest[i])); board.setFen(chess.fen(), [m.from, m.to]); board.setArrows([{ from: m.from, to: m.to, cls: 'good' }]); run(i + 1); }, 700); };
    run(0);
  };
  $('#next', app).onclick = () => load();
  drawSess();
  load();
}

const uci = u => ({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });

/* ---------- lessons ---------- */

function exampleBoard(el, ex, { lichess = false } = {}) {
  // lichess examples: fen is before opponent's setup move; everything else plays from fen.
  const moves = ex.moves.split(' ').filter(Boolean);
  const chess = new Chess(ex.fen);
  const fens = [ex.fen], last = [null];
  for (const u of moves) { const m = chess.move(uci(u)); fens.push(chess.fen()); last.push([m.from, m.to]); }
  const solver = lichess ? (new Chess(ex.fen).turn() === 'w' ? 'black' : 'white') : (new Chess(ex.fen).turn() === 'w' ? 'white' : 'black');
  el.innerHTML = `<div class="bd" style="max-width:340px"></div><div class="row" style="margin-top:8px"><button class="btn small" data-a="prev">◀</button><button class="btn small" data-a="next">▶</button><span class="faint" style="font-size:13px" data-pos></span></div>`;
  const b = new Board(el.querySelector('.bd'), { orientation: solver, coords: true });
  let i = lichess ? 1 : 0;
  const show = () => { b.setFen(fens[i], last[i]); el.querySelector('[data-pos]').textContent = i === (lichess ? 1 : 0) ? 'Puzzle position. Find it, then press ▶' : `move ${i - (lichess ? 1 : 0)} of ${moves.length - (lichess ? 1 : 0)}`; };
  el.querySelector('[data-a=prev]').onclick = () => { i = Math.max(lichess ? 1 : 0, i - 1); show(); };
  el.querySelector('[data-a=next]').onclick = () => { i = Math.min(fens.length - 1, i + 1); show(); };
  show();
}

function renderLesson({ app, data }, id) {
  const L = data.lessons;
  if (!L) { app.innerHTML = '<div class="empty">Lessons are still being written.</div>'; return; }
  store.update(s => (s.read[id] = Date.now()));
  if (id === 'process') {
    const p = L.process;
    app.innerHTML = `<a href="#/tactics">← Tactics</a><article class="prose section" style="margin-top:10px"><h1>${esc(p.title)}</h1>
      ${p.body.map(x => `<p>${md(x)}</p>`).join('')}
      <div class="grid g2 section"><div class="card"><h3>Every move</h3><ol class="tight">${p.checklist.map(x => `<li>${md(x)}</li>`).join('')}</ol></div>
      <div class="card"><h3>Your 10-minute clock</h3><ul class="tight">${p.time_plan.map(x => `<li>${md(x)}</li>`).join('')}</ul></div></div></article>`;
    return;
  }
  const l = L.tactics.find(x => x.id === id);
  if (!l) { app.innerHTML = '<div class="empty">Lesson not found.</div>'; return; }
  const idx = L.tactics.indexOf(l), nxt = L.tactics[idx + 1];
  app.innerHTML = `<a href="#/tactics">← Tactics</a>
  <article class="section prose" style="margin-top:10px">
    <div class="spread"><h1>${esc(l.title)}</h1><a class="btn primary" href="#/tactics/practice/${l.theme}">Practice ${esc(THEME_NAMES[l.theme] || l.title)} →</a></div>
    ${l.body.map(x => `<p>${md(x)}</p>`).join('')}
    <div class="grid g2"><div class="card"><h3>How to spot it</h3><ul class="tight">${l.spot_it.map(x => `<li>${md(x)}</li>`).join('')}</ul></div>
    <div class="card"><h3>Watch out for</h3><ul class="tight">${l.pitfalls.map(x => `<li>${md(x)}</li>`).join('')}</ul></div></div>
  </article>
  <section class="section"><h2>Examples</h2><div class="grid g3">${l.examples.map((ex, i) => `<div class="card"><div data-ex="${i}"></div><p style="margin-top:10px">${md(ex.caption)}</p></div>`).join('')}</div></section>
  ${nxt ? `<p class="section"><a href="#/tactics/lesson/${nxt.id}">Next lesson: ${esc(nxt.title)} →</a></p>` : ''}`;
  l.examples.forEach((ex, i) => exampleBoard($(`[data-ex="${i}"]`, app), ex, { lichess: true }));
}

function renderEndgame({ app, data }, id) {
  const l = data.lessons?.endgames?.find(x => x.id === id);
  if (!l) { app.innerHTML = '<div class="empty">Lesson not found.</div>'; return; }
  store.update(s => (s.read['eg:' + id] = Date.now()));
  app.innerHTML = `<a href="#/tactics">← Tactics</a><article class="section prose" style="margin-top:10px"><h1>${esc(l.title)}</h1>${l.body.map(x => `<p>${md(x)}</p>`).join('')}</article>
  <section class="section grid g2">${l.examples.map((ex, i) => `<div class="card"><div data-ex="${i}"></div><p style="margin-top:10px">${md(ex.caption)}</p></div>`).join('')}</section>`;
  l.examples.forEach((ex, i) => exampleBoard($(`[data-ex="${i}"]`, app), ex));
}
