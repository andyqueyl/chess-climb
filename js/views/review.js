import { store } from '../store.js';
import { esc, md, bars, evalGraph, evalText, fmtDateLong, $, $$, WHY_NAMES, HOW_NAMES } from '../ui.js';
import { gameMetrics, blunderBreakdown } from '../metrics.js';
import { gameTable, bindGameRows } from './home.js';
import { Board, Chess } from '../board.js';

const PHASES = { opening: 'Opening (moves 1-10)', middlegame: 'Middlegame', endgame: 'Endgame' };

export function renderReview({ app, data, query }) {
  const { games, review } = data;
  const f = { cls: query.get('class') || 'rapid', result: query.get('result') || 'all', color: query.get('color') || 'all', family: query.get('family') || 'all' };
  const setQ = patch => {
    const q = new URLSearchParams({ ...f, ...patch });
    for (const [k, v] of [...q]) if (v === 'all' && k !== 'class') q.delete(k);
    location.hash = '#/review?' + q.toString();
  };
  const pool = games.filter(g => f.cls === 'all' || g.class === f.cls);
  const list = pool.filter(g => (f.result === 'all' || g.result === f.result) && (f.color === 'all' || g.color === f.color) && (f.family === 'all' || g.family === f.family));
  const m = gameMetrics(pool);
  const bd = blunderBreakdown(pool);
  const losses = pool.filter(g => g.result === 'loss');
  const how = {};
  losses.forEach(g => (how[g.how] = (how[g.how] || 0) + 1));
  const fam = {};
  pool.forEach(g => (fam[`${g.color}|${g.family}`] ||= []).push(g));
  const openings = Object.entries(fam).map(([k, v]) => ({ color: k.split('|')[0], family: k.split('|')[1], ...gameMetrics(v) })).sort((a, b) => b.n - a.n);
  const byColor = ['white', 'black'].map(c => ({ c, ...gameMetrics(pool.filter(g => g.color === c)) }));
  const lostWinning = losses.filter(g => { const e = g.plies.map(p => p.eval * (g.color === 'white' ? 1 : -1)); return Math.max(...e) >= 300; }).length;
  const firstBlunders = pool.filter(g => g.first_blunder_ply != null).map(g => Math.floor(g.first_blunder_ply / 2) + 1);
  const medFirst = firstBlunders.sort((a, b) => a - b)[Math.floor(firstBlunders.length / 2)];

  app.innerHTML = `
  <h1>Game <em>review</em></h1>
  <p class="muted">Every rapid game since you joined (blitz and bullet are left out), run through Stockfish ${games.length ? `(${games.length} games, last ${fmtDateLong(games.at(-1).end)})` : ''}. Same idea as chess.com's Game Review: big win-chance drops are blunders (≥30%), mistakes (≥20%) and inaccuracies (≥10%). Accuracy here uses Lichess's formula, which runs a few points higher than chess.com's.</p>

  ${review ? reviewSummary(review, data) : `<div class="card"><p class="muted">Coach's written review not generated yet. Stats below are live from the engine data.</p></div>`}

  <section class="section grid g4">
    ${stat(m ? `${m.score}%` : '–', 'Score', m ? `${m.wins}W ${m.losses}L ${m.draws}D` : '')}
    ${stat(m?.accuracy ?? '–', 'Avg accuracy', byColor.map(b => `${b.c} ${b.accuracy ?? '–'}`).join(' · '))}
    ${stat(m?.blunders_per_game ?? '–', 'Blunders / game', medFirst ? `first one ~move ${medFirst} (median)` : '')}
    ${stat(lostWinning, 'Losses from winning spots', losses.length ? `of ${losses.length} losses you were +3 or better at some point` : '')}
  </section>

  <section class="section grid g3">
    <div class="card"><h3>Why your blunders happen</h3>${bd.total ? bars(Object.entries(bd.why).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: WHY_NAMES[k] || k, value: v }))) : '<p class="faint">No blunders. Nice.</p>'}
      <p class="faint" style="margin-top:10px;font-size:13px">Auto-labeled from the position, so treat it as a rough guide.</p></div>
    <div class="card"><h3>When they happen</h3>${bd.total ? bars(['opening', 'middlegame', 'endgame'].map(k => ({ label: PHASES[k], value: bd.phase[k] || 0 }))) : ''}
      <p class="muted" style="margin-top:12px">${bd.lowClock} of ${bd.total} blunders with under 10% of your clock left.</p></div>
    <div class="card"><h3>How you lose</h3>${losses.length ? bars(Object.entries(how).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: HOW_NAMES[k] || k, value: v }))) : '<p class="faint">No losses here.</p>'}</div>
  </section>

  <section class="section card table-wrap">
    <h3>Openings</h3>
    <table><thead><tr><th>Opening</th><th>As</th><th class="num">Games</th><th class="num">Score</th><th class="num">Acc</th><th class="num">Blunders/g</th></tr></thead><tbody>
    ${openings.slice(0, 14).map(o => `<tr class="click" data-fam="${esc(o.family)}" data-color="${o.color}"><td>${esc(o.family)}</td><td>${o.color}</td><td class="num">${o.n}</td>
      <td class="num ${o.score >= 55 ? 'res-win' : o.score <= 40 ? 'res-loss' : ''}">${o.score}%</td><td class="num">${o.accuracy}</td><td class="num">${o.blunders_per_game}</td></tr>`).join('')}
    </tbody></table>
  </section>

  <section class="section">
    <div class="spread"><h2>Games</h2>
      <div class="row">
        ${['all', 'win', 'loss', 'draw'].map(r => `<button class="chip ${f.result === r ? 'on' : ''}" data-res="${r}">${r}</button>`).join('')}
        <span class="faint">·</span>
        ${['all', 'white', 'black'].map(c => `<button class="chip ${f.color === c ? 'on' : ''}" data-col="${c}">${c}</button>`).join('')}
        ${f.family !== 'all' ? `<button class="chip on" data-fam-clear>${esc(f.family)} ×</button>` : ''}
      </div></div>
    <div class="card table-wrap">${gameTable([...list].reverse(), data)}</div>
  </section>`;

  $$('[data-res]', app).forEach(b => (b.onclick = () => setQ({ result: b.dataset.res })));
  $$('[data-col]', app).forEach(b => (b.onclick = () => setQ({ color: b.dataset.col })));
  $$('tr[data-fam]', app).forEach(tr => (tr.onclick = () => setQ({ family: tr.dataset.fam, color: tr.dataset.color })));
  const fc = $('[data-fam-clear]', app); if (fc) fc.onclick = () => setQ({ family: 'all' });
  bindGameRows(app);
}

const stat = (v, l, d) => `<div class="card stat"><div class="v">${esc(v)}</div><div class="l">${esc(l)}</div><div class="d">${esc(d)}</div></div>`;

function reviewSummary(r, data) {
  const link = id => data.gameById[id] ? `<a href="#/game/${id}">${esc(data.gameById[id].opp)} (${fmtDateLong(data.gameById[id].end)})</a>` : '';
  return `<div class="card">
    <div class="eyebrow">Takeaways · ${esc(r.games_reviewed)} rapid games read · ${esc(r.generated || '')}</div>
    <p style="font-size:17px">${md(r.headline)}</p>
    ${r.leaks?.length ? `<h3 style="margin-top:16px">What you do wrong</h3>
    <div class="grid" style="gap:10px">${r.leaks.map((l, i) => `<div class="rec top" style="grid-template-columns:40px 1fr"><span class="n">${i + 1}</span><div>
      <div class="t">${md(l.title)}</div><div class="w" style="margin:3px 0 6px">${md(l.detail)}</div>
      <div><b>Fix:</b> ${md(l.fix)}</div>
      ${l.evidence?.length ? `<div class="faint" style="font-size:13px;margin-top:4px">Examples: ${l.evidence.map(link).filter(Boolean).join(', ')}</div>` : ''}
      ${l.href ? `<a class="btn small" style="margin-top:8px" href="${esc(l.href)}">${esc(l.cta || 'Work on it')}</a>` : ''}</div></div>`).join('')}</div>` : ''}
    ${r.strengths?.length ? `<h3 style="margin-top:16px">What you do well</h3><ul class="tight">${r.strengths.map(s => `<li>${md(s)}</li>`).join('')}</ul>
    ${r.strength_games?.length ? `<div class="faint" style="font-size:13px">Your best games: ${r.strength_games.map(link).filter(Boolean).join(', ')}</div>` : ''}` : ''}
    ${r.openings ? `<h3 style="margin-top:16px">Openings</h3><p>${md(r.openings)}</p>` : ''}
    ${r.one_fix ? `<div class="status good" style="margin-top:16px"><b>The one habit:</b> ${md(r.one_fix)}</div>` : ''}
  </div>`;
}

/* ---------------- single game viewer ---------------- */

export function renderGame({ app, data, params, onLeave }) {
  const g = data.gameById[params[0]];
  if (!g) { app.innerHTML = '<div class="empty">Game not found. <a href="#/review">Back to games</a></div>'; return; }
  const note = data.review?.games?.[g.id];
  store.update(st => (st.viewed = Date.now()));
  const meWhite = g.color === 'white';
  const isMine = i => (i % 2 === 0) === meWhite;
  // rebuild positions
  const ch = new Chess(g.start || undefined);
  const fens = [ch.fen()], ucis = [], bestUci = [];
  for (const p of g.plies) {
    let bu = null;
    if (p.best) { try { const t = new Chess(ch.fen()); const mv = t.move(p.best); bu = mv.from + mv.to; } catch {} }
    bestUci.push(bu);
    ch.move({ from: p.uci.slice(0, 2), to: p.uci.slice(2, 4), promotion: p.uci[4] });
    fens.push(ch.fen()); ucis.push(p.uci);
  }
  const evals = [g.plies[0] ? 20 : 0, ...g.plies.map(p => p.eval)];
  const myMarks = g.plies.map((p, i) => ({ i: i + 1, cls: p.cls, mine: isMine(i) })).filter(x => x.cls && x.mine && x.cls !== 'inaccuracy');
  const puzzleAt = Object.fromEntries(data.myPuzzles.filter(p => p.game === g.url).map(p => [p.ply, p]));

  app.innerHTML = `
  <div class="spread"><div><a href="#/review">← All games</a>
    <h1 style="margin-top:6px"><span class="res-${g.result}">${g.result === 'win' ? 'Won' : g.result === 'loss' ? 'Lost' : 'Drew'}</span> vs ${esc(g.opp)} <span class="faint" style="font-size:.6em">${g.opp_rating}</span></h1>
    <div class="muted">${fmtDateLong(g.end)} · ${esc(g.tc)} ${esc(g.class)} · you had ${g.color} (${g.rating}) · ${esc(g.opening)} · ended by ${esc(g.how)}</div></div>
    <a class="btn" href="${esc(g.url)}" target="_blank" rel="noopener">Open on chess.com ↗</a></div>

  ${note ? `<div class="card section" style="margin-top:16px"><div class="eyebrow">Coach's note</div><p>${md(note.summary)}</p>${note.lesson ? `<p><b>Takeaway:</b> ${md(note.lesson)}</p>` : ''}
    ${note.key_moment != null ? `<button class="btn small" id="km">Jump to the key moment (move ${Math.floor(note.key_moment / 2) + 1})</button>` : ''}</div>` : ''}

  <section class="play section">
    <div><div id="board"></div>
      <div class="row" style="margin-top:10px;justify-content:center">
        <button class="btn" data-nav="start">⏮</button><button class="btn" data-nav="prev">◀</button>
        <button class="btn" data-nav="next">▶</button><button class="btn" data-nav="end">⏭</button>
        <button class="btn" id="nextMistake">Next mistake</button><button class="btn" id="flip">Flip</button></div></div>
    <div class="side">
      <div class="grid g3" style="gap:8px">
        <div class="card stat" style="padding:10px 12px"><div class="v" style="font-size:22px">${g.acc ?? '–'}</div><div class="l">Your accuracy</div></div>
        <div class="card stat" style="padding:10px 12px"><div class="v" style="font-size:22px">${g.acc_opp ?? '–'}</div><div class="l">Opponent's</div></div>
        <div class="card stat" style="padding:10px 12px"><div class="v" style="font-size:22px"><span class="tag-blunder">${g.blunders}</span>/<span class="tag-mistake">${g.mistakes}</span>/<span class="tag-inaccuracy">${g.inaccuracies}</span></div><div class="l">Bl / Mist / Inacc</div></div>
      </div>
      <div id="eg"></div>
      <div class="status" id="info"></div>
      <div class="moves" id="moves"></div>
    </div>
  </section>`;

  const board = new Board($('#board', app), { orientation: g.color });
  let cur = 0;
  const CLS_SYM = { blunder: '??', mistake: '?', inaccuracy: '?!' };
  $('#moves', app).innerHTML = g.plies.map((p, i) => `${i % 2 === 0 ? `<div class="no">${i / 2 + 1}</div>` : ''}<div class="mv" data-i="${i + 1}">${esc(p.san)}${p.cls ? `<span class="c tag-${p.cls}">${CLS_SYM[p.cls]}</span>` : ''}</div>`).join('') + (g.plies.length % 2 ? '<div></div>' : '');

  const show = i => {
    cur = Math.max(0, Math.min(fens.length - 1, i));
    const u = ucis[cur - 1];
    board.setFen(fens[cur], u ? [u.slice(0, 2), u.slice(2, 4)] : null);
    const p = g.plies[cur - 1];
    const arrows = [];
    if (p?.cls && bestUci[cur - 1]) arrows.push({ from: bestUci[cur - 1].slice(0, 2), to: bestUci[cur - 1].slice(2, 4), cls: 'good' });
    board.setArrows(arrows);
    $$('.mv', app).forEach(el => el.classList.toggle('on', +el.dataset.i === cur));
    $(`.mv[data-i="${cur}"]`, app)?.scrollIntoView({ block: 'nearest' });
    evalGraph($('#eg', app), evals, { marks: myMarks, cur, onPick: show });
    const info = $('#info', app);
    const ev = evalText(evals[cur]);
    if (!p) { info.className = 'status'; info.textContent = 'Start position. Use ← → keys to step through.'; return; }
    const who = isMine(cur - 1) ? 'You' : g.opp;
    const clk = p.clk != null ? ` · ${Math.floor(p.clk / 60)}:${String(Math.floor(p.clk % 60)).padStart(2, '0')} left` : '';
    const pz = puzzleAt[cur - 1];
    if (p.cls) {
      info.className = 'status ' + (isMine(cur - 1) ? (p.cls === 'inaccuracy' ? 'info' : 'bad') : 'good');
      info.innerHTML = `<b>${esc(who)} played ${esc(p.san)}</b>, ${p.cls === 'inaccuracy' ? 'an' : 'a'} <span class="tag-${p.cls}">${p.cls}</span> (win chance −${Math.round(p.drop)}%). Eval ${ev}${clk}.
        ${p.best ? `<br>Better was <b>${esc(p.best)}</b> (green arrow).` : ''}${p.why && isMine(cur - 1) ? `<br><span class="muted">${esc(WHY_NAMES[p.why] || p.why)}.</span>` : ''}
        ${!isMine(cur - 1) && p.cls !== 'inaccuracy' ? '<br>Opponent slipped here. Did you punish it?' : ''}
        ${pz ? `<br><a href="#/tactics/practice/mine?id=${pz.id}">Solve this as a puzzle →</a>` : ''}`;
    } else {
      info.className = 'status';
      info.innerHTML = `${esc(who)} played <b>${esc(p.san)}</b>. Eval ${ev}${clk}.`;
    }
  };
  $$('[data-nav]', app).forEach(b => (b.onclick = () => show({ start: 0, prev: cur - 1, next: cur + 1, end: fens.length - 1 }[b.dataset.nav])));
  $$('.mv', app).forEach(el => (el.onclick = () => show(+el.dataset.i)));
  $('#flip', app).onclick = () => { board.flip(); show(cur); };
  $('#nextMistake', app).onclick = () => { const nx = myMarks.find(mk => mk.i > cur) || myMarks[0]; if (nx) show(nx.i); };
  if ($('#km', app)) $('#km', app).onclick = () => show(note.key_moment + 1);
  const key = e => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); };
  document.addEventListener('keydown', key);
  onLeave(() => document.removeEventListener('keydown', key));
  show(myMarks[0] ? 0 : 0);
}
