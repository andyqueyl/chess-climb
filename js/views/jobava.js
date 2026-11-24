import { esc, md, $, $$ } from '../ui.js';
import { Board, Chess } from '../board.js';
import { store } from '../store.js';

export function renderJobava(ctx) {
  const J = ctx.data.jobava;
  if (!J) { ctx.app.innerHTML = '<div class="empty">The Jobava London course is still being written. Check back soon.</div>'; return; }
  const [chId, lId] = ctx.params;
  if (chId && lId === 'quiz') return renderQuiz(ctx, J.chapters.find(c => c.id === chId));
  if (chId && lId) return renderLesson(ctx, J, chId, lId);
  renderIndex(ctx, J);
}

function renderIndex({ app, data }, J) {
  const s = store.get();
  const all = J.chapters.flatMap(c => c.lessons);
  const clean = all.filter(l => s.jobava[l.id]?.clean).length;
  const mine = data.games.filter(g => g.color === 'white' && /London|Jobava|Zukertort|Queens Pawn/i.test(g.opening));
  const score = mine.length ? Math.round(((mine.filter(g => g.result === 'win').length + mine.filter(g => g.result === 'draw').length / 2) / mine.length) * 100) : null;
  app.innerHTML = `
  <div class="spread"><div><h1>${esc(J.title).replace(/(\S+)$/, '<em>$1</em>')}</h1><p class="muted prose">${md(J.intro)}</p></div>
    <div class="card stat" style="padding:12px 16px"><div class="v">${clean}/${all.length}</div><div class="l">lessons drilled clean</div></div></div>
  ${mine.length ? `<p class="faint">Your 1.d4 + Bf4 type games as White so far: ${mine.length} games, ${score}% score.</p>` : ''}
  <div class="progress"><span style="width:${(clean / Math.max(1, all.length)) * 100}%"></span></div>
  <section class="section grid g2">${J.chapters.map((c, ci) => `
    <div class="card"><div class="eyebrow">Chapter ${ci + 1}</div><h3>${esc(c.title)}</h3><p class="muted" style="font-size:14px">${md(c.summary)}</p>
      <div class="lesson-list">${c.lessons.map(l => {
        const p = s.jobava[l.id];
        return `<a class="lesson-item" href="#/jobava/${c.id}/${l.id}"><span>${esc(l.title)}</span>${p?.clean ? '<span class="done">✓ drilled</span>' : p?.seen ? '<span class="faint" style="font-size:13px">seen</span>' : ''}</a>`;
      }).join('')}
      ${c.quiz?.length ? `<a class="lesson-item" href="#/jobava/${c.id}/quiz"><span><b>Quiz</b> · ${c.quiz.length} positions</span><span class="faint" style="font-size:13px">${quizScore(c)}</span></a>` : ''}</div>
    </div>`).join('')}</section>`;
}

const quizScore = c => { const q = store.get().quiz; const done = c.quiz.filter((_, i) => q[`${c.id}:${i}`]?.ok).length; return done ? `${done}/${c.quiz.length} right` : ''; };

function lineData(lesson) {
  const ch = new Chess(lesson.start || undefined);
  const fens = [ch.fen()], moves = [];
  for (const m of lesson.moves) { const r = ch.move(m.san); moves.push({ ...m, from: r.from, to: r.to, color: r.color, san: r.san }); fens.push(ch.fen()); }
  return { fens, moves };
}

function renderLesson({ app, onLeave }, J, chId, lId) {
  const ch = J.chapters.find(c => c.id === chId), lesson = ch?.lessons.find(l => l.id === lId);
  if (!lesson) { app.innerHTML = '<div class="empty">Lesson not found. <a href="#/jobava">Back</a></div>'; return; }
  store.update(s => (s.jobava[lId] = { ...(s.jobava[lId] || {}), seen: Date.now() }));
  const flat = J.chapters.flatMap(c => c.lessons.map(l => ({ c, l })));
  const idx = flat.findIndex(x => x.l.id === lId), nxt = flat[idx + 1];
  let line;
  try { line = lineData(lesson); } catch (e) { app.innerHTML = `<div class="empty">This line has a bad move in it (${esc(e.message)}).</div>`; return; }
  const side = lesson.train === 'black' ? 'b' : 'w';
  app.innerHTML = `
  <a href="#/jobava">← ${esc(J.title)}</a> <span class="faint">· ${esc(ch.title)}</span>
  <h1 style="margin-top:6px">${esc(lesson.title)}</h1>
  <div class="prose">${lesson.intro.map(p => `<p>${md(p)}</p>`).join('')}</div>
  <div class="tabs"><button class="chip on" data-mode="learn">Learn the line</button><button class="chip" data-mode="drill">Drill it (you play ${lesson.train})</button></div>
  <section class="play">
    <div><div id="board"></div>
      <div class="row" style="margin-top:10px;justify-content:center" id="navrow">
        <button class="btn" data-nav="start">⏮</button><button class="btn" data-nav="prev">◀</button><button class="btn primary" data-nav="next">▶</button><button class="btn" data-nav="end">⏭</button></div></div>
    <div class="side">
      <div class="note" id="note"></div>
      <div class="moves" id="moves"></div>
      <div class="card"><h3>Key ideas</h3><ul class="tight">${lesson.key_ideas.map(k => `<li>${md(k)}</li>`).join('')}</ul></div>
      ${nxt ? `<a href="#/jobava/${nxt.c.id}/${nxt.l.id}">Next: ${esc(nxt.l.title)} →</a>` : ''}
    </div>
  </section>`;

  const board = new Board($('#board', app), { orientation: lesson.train === 'black' ? 'black' : 'white' });
  const note = $('#note', app);
  let cur = 0, mode = 'learn', timer = null, errors = 0;
  onLeave(() => clearTimeout(timer));
  const startNo = Math.floor(new Chess(lesson.start || undefined).moveNumber());
  const blackFirst = new Chess(lesson.start || undefined).turn() === 'b';
  $('#moves', app).innerHTML = (blackFirst ? `<div class="no">${startNo}</div><div></div>` : '') + line.moves.map((m, i) => {
    const k = i + (blackFirst ? 1 : 0);
    return `${k % 2 === 0 ? `<div class="no">${startNo + Math.floor(k / 2)}</div>` : ''}<div class="mv" data-i="${i + 1}">${esc(m.san)}${m.note ? '<span class="c faint">•</span>' : ''}</div>`;
  }).join('');

  const show = i => {
    cur = Math.max(0, Math.min(line.fens.length - 1, i));
    const m = line.moves[cur - 1];
    board.setFen(line.fens[cur], m ? [m.from, m.to] : null);
    board.setArrows([]);
    $$('.mv', app).forEach(el => el.classList.toggle('on', +el.dataset.i === cur));
    $(`.mv[data-i="${cur}"]`, app)?.scrollIntoView({ block: 'nearest' });
    note.innerHTML = m ? `<b>${esc(m.san)}</b>${m.note ? ' ' + md(m.note) : ''}` : '<span class="muted">Start. Press ▶ or the → key to step through the line.</span>';
  };

  // drill: learner plays their side, the other side replies automatically
  const drillPrompt = () => {
    const m = line.moves[cur];
    if (!m) {
      const clean = errors === 0;
      store.update(s => { const p = s.jobava[lId] || {}; p.drills = (p.drills || 0) + 1; p.last = Date.now(); if (clean) p.clean = Date.now(); s.jobava[lId] = p; });
      note.innerHTML = clean ? '<b>Clean run!</b> Lesson marked as drilled. Do it again tomorrow to lock it in.' : `<b>Done</b> with ${errors} slip${errors > 1 ? 's' : ''}. Run it again until it's clean.`;
      board.setMovable(null);
      return;
    }
    if (m.color !== side) {
      board.setMovable(null);
      timer = setTimeout(() => { cur++; board.setFen(line.fens[cur], [m.from, m.to]); markList(); drillPrompt(); }, 450);
    } else {
      board.setMovable(side);
      const prev = line.moves[cur - 1];
      note.innerHTML = `Your move.${prev?.note ? ` <span class="muted">(${esc(prev.san)}: ${md(prev.note)})</span>` : ''}`;
    }
  };
  const markList = () => $$('.mv', app).forEach(el => { el.classList.toggle('on', +el.dataset.i === cur); el.style.visibility = mode === 'drill' && +el.dataset.i > cur ? 'hidden' : ''; });
  board.onMove = mv => {
    if (mode !== 'drill') return;
    const m = line.moves[cur];
    if (m && mv.from === m.from && mv.to === m.to) {
      cur++; board.setFen(line.fens[cur], [m.from, m.to]); markList(); drillPrompt();
    } else {
      errors++;
      board.mark(mv.to, 'bad');
      note.innerHTML = `Not the book move. ${errors >= 2 ? `It's <b>${esc(m.san)}</b>.` : 'Think about the plan and try again.'}`;
      if (errors >= 2) board.setArrows([{ from: m.from, to: m.to, cls: 'info' }]);
      timer = setTimeout(() => board.clearMarks(), 600);
    }
  };
  const setMode = md2 => {
    mode = md2; clearTimeout(timer);
    $$('[data-mode]', app).forEach(b => b.classList.toggle('on', b.dataset.mode === md2));
    $('#navrow', app).style.visibility = md2 === 'drill' ? 'hidden' : '';
    if (md2 === 'drill') { cur = 0; errors = 0; board.setFen(line.fens[0]); board.setArrows([]); markList(); drillPrompt(); }
    else { board.setMovable(null); $$('.mv', app).forEach(el => (el.style.visibility = '')); show(0); }
  };
  $$('[data-mode]', app).forEach(b => (b.onclick = () => setMode(b.dataset.mode)));
  $$('[data-nav]', app).forEach(b => (b.onclick = () => show({ start: 0, prev: cur - 1, next: cur + 1, end: line.fens.length - 1 }[b.dataset.nav])));
  $$('.mv', app).forEach(el => (el.onclick = () => mode === 'learn' && show(+el.dataset.i)));
  const key = e => { if (mode !== 'learn' || e.target.closest('input,textarea')) return; if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); };
  document.addEventListener('keydown', key);
  onLeave(() => { clearTimeout(timer); document.removeEventListener('keydown', key); });
  show(0);
}

function renderQuiz({ app, onLeave }, ch) {
  if (!ch?.quiz?.length) { app.innerHTML = '<div class="empty">No quiz here.</div>'; return; }
  let i = 0, tries = 0, timer = null;
  app.innerHTML = `<a href="#/jobava">← Jobava London</a><h1 style="margin-top:6px">${esc(ch.title)} · quiz</h1>
  <section class="play"><div><div id="board"></div></div>
    <div class="side"><div class="status" id="st"></div><div class="note" id="exp" style="display:none"></div>
      <div class="row"><button class="btn" id="reveal">Show answer</button><button class="btn primary" id="nx">Next</button></div><span class="faint" id="cnt"></span></div></section>`;
  const board = new Board($('#board', app));
  onLeave(() => clearTimeout(timer));
  const key = () => `${ch.id}:${i}`;
  const rec = ok => store.update(s => { const q = s.quiz[key()] || { n: 0, ok: 0 }; q.n++; if (ok) q.ok++; s.quiz[key()] = q; });
  const load = () => {
    const q = ch.quiz[i]; tries = 0;
    const c = new Chess(q.fen);
    board.setOrientation(c.turn() === 'w' ? 'white' : 'black'); board.setFen(q.fen); board.setArrows([]); board.setMovable(c.turn());
    $('#st', app).className = 'status'; $('#st', app).innerHTML = md(q.prompt);
    $('#exp', app).style.display = 'none';
    $('#cnt', app).textContent = `${i + 1} of ${ch.quiz.length}`;
  };
  const reveal = ok => {
    const q = ch.quiz[i];
    board.setMovable(null);
    board.setArrows(q.answer.slice(0, 3).map(u => ({ from: u.slice(0, 2), to: u.slice(2, 4), cls: 'good' })));
    $('#exp', app).style.display = ''; $('#exp', app).innerHTML = md(q.explain);
    $('#st', app).className = 'status ' + (ok ? 'good' : 'bad');
    $('#st', app).innerHTML = ok ? '<b>Correct.</b>' : '<b>Here\'s the idea.</b>';
  };
  board.onMove = mv => {
    const q = ch.quiz[i];
    const u = mv.from + mv.to;
    if (q.answer.some(a => a.slice(0, 4) === u)) { if (!tries) rec(true); board.play(mv); reveal(true); }
    else {
      if (!tries) rec(false);
      tries++; board.mark(mv.to, 'bad');
      $('#st', app).className = 'status bad'; $('#st', app).innerHTML = `${md(q.prompt)}<br>Not quite. Try again.`;
      timer = setTimeout(() => board.clearMarks(), 600);
    }
  };
  $('#reveal', app).onclick = () => { if (!tries) rec(false); tries++; reveal(false); };
  $('#nx', app).onclick = () => { i = (i + 1) % ch.quiz.length; load(); };
  load();
}
