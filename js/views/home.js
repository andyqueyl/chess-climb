import { esc, md, lineChart, fmtDate, $, $$ } from '../ui.js';
import { allMetrics, ratingSeries, recommendations, recentGames, gameMetrics, MAIN_CLASS } from '../metrics.js';
import { DAY } from '../store.js';


export function renderHome({ app, data, store }) {
  const { games, profile, review } = data;
  const s = store.get();
  const rapid = games.filter(g => g.class === MAIN_CLASS);
  const now = profile?.ratings?.[MAIN_CLASS]?.now ?? rapid.at(-1)?.rating ?? s.start;
  const best = profile?.ratings?.[MAIN_CLASS]?.best;
  const monthAgo = rapid.filter(g => g.end * 1000 < Date.now() - 30 * DAY).at(-1)?.rating ?? rapid[0]?.rating;
  const delta = monthAgo ? now - monthAgo : 0;
  const start = Math.min(s.start, rapid[0]?.rating ?? s.start);
  const prog = Math.max(0, Math.min(1, (now - start) / (s.goal - start)));
  const MILESTONES = [start, ...[1000, 1100, 1200, 1300, 1400, 1500].filter(v => v > start + 50), s.goal];
  const m = allMetrics(games);
  const prev = gameMetrics(recentGames(games, 40).slice(0, -20));
  const recs = recommendations(data).slice(0, 5);
  const trend = (cur, old, better) => (old == null || cur == null ? '' : cur === old ? 'same as the 20 before' :
    `${(better === 'up' ? cur > old : cur < old) ? '▲ better' : '▼ worse'} than the 20 before (${old})`);

  app.innerHTML = `
  <section class="hero">
    <div class="card">
      <div class="eyebrow">Rapid rating · chess.com/${esc(profile?.user || '')}</div>
      <div class="big">${now} <small>/ ${s.goal}</small></div>
      <div class="muted">${delta >= 0 ? '+' : ''}${delta} in the last 30 days · started at ${start}${best ? ` · best ${best}` : ''} · ${s.goal - now > 0 ? `${s.goal - now} to go` : 'goal hit!'}</div>
      <div class="progress"><span style="width:${prog * 100}%"></span></div>
      <div class="milestones">${MILESTONES.map(v => `<span class="${now >= v ? 'hit' : ''}">${v}</span>`).join('')}</div>
    </div>
    <div class="card"><div class="spread"><div class="eyebrow">Rating, every rapid game</div><span class="eyebrow">${rapid.length} games</span></div><div id="rchart"></div></div>
  </section>

  ${todayCard(data, s)}

  <section class="section grid g4">
    ${tile(m.accuracy ?? '–', 'Accuracy, last 20 rapid', trend(m.accuracy, prev?.accuracy, 'up'))}
    ${tile(m.blunders_per_game ?? '–', 'Blunders per game', trend(m.blunders_per_game, prev?.blunders_per_game, 'down'))}
    ${tile(m.n ? `${m.wins}-${m.losses}${m.draws ? '-' + m.draws : ''}` : '–', 'W-L last 20 rapid', m.n ? `${m.score}% score` : '')}
    ${tile(m.puzzle_rating, 'Site puzzle rating', m.attempts ? `${m.puzzle_accuracy}% of last ${Math.min(100, m.attempts)} · ${m.puzzles_per_week} this week` : 'Solve some puzzles to start it')}
  </section>

  ${review?.leaks?.length ? `<section class="section">
    <div class="spread"><h2>What your games <em>say</em></h2><a href="#/review">Full write-up with your games →</a></div>
    ${review.headline ? `<p class="muted" style="max-width:80ch;font-size:16px">${md(review.headline)}</p>` : ''}
    <div class="takeaways">
      <div class="card"><div class="eyebrow" style="color:var(--bad)">What you do wrong</div>
        <ol class="tlist bad">${review.leaks.map((l, i) => `<li><span class="k">${String(i + 1).padStart(2, '0')}</span><span>${md(l.title)}</span></li>`).join('')}</ol></div>
      <div class="card"><div class="eyebrow" style="color:var(--good)">What you do well</div>
        <ul class="tlist good">${(review.strengths || []).slice(0, 6).map(x => `<li><span class="k">+</span><span>${md(x.split(':')[0].replace(/\.$/, ''))}</span></li>`).join('')}</ul></div>
    </div>
    ${review.one_fix ? `<div class="habit" style="margin-top:16px"><span class="lab">The one habit</span><span>${md(review.one_fix)}</span></div>` : ''}
  </section>` : ''}

  <section class="section">
    <div class="spread"><h2>Work on <em>next</em></h2><a href="#/plan">Your plan & queue →</a></div>
    <div class="recs">${recs.map((r, i) => `<div class="rec"><span class="n">${i + 1}</span>
      <div><div class="t">${esc(r.title)}</div><div class="w">${esc(r.why)}</div></div>
      <a class="btn ${i === 0 ? 'primary' : ''}" href="${r.href}">${esc(r.label)}</a></div>`).join('')}</div>
  </section>

  <section class="section">
    <div class="spread"><h2>Recent <em>games</em></h2><a href="#/review">All games & patterns →</a></div>
    <div class="card table-wrap">${gameTable(games.slice(-10).reverse(), data)}</div>
  </section>`;

  lineChart($('#rchart', app), ratingSeries(games), { goal: s.goal });
  bindGameRows(app);
}

/* ---------- today: daily goal, streak, 12-week activity ---------- */
const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
function todayCard(data, s) {
  const today = dayKey(Date.now());
  const isToday = t => t && dayKey(t) === today;
  const perDay = {};
  for (const a of s.attempts) perDay[dayKey(a.t)] = (perDay[dayKey(a.t)] || 0) + 1;
  const lessonDays = new Set([...Object.values(s.jobava).flatMap(p => [p.seen, p.last, p.clean]), ...Object.values(s.read), s.viewed, ...s.log.map(l => l.t)].filter(Boolean).map(dayKey));
  const active = k => (perDay[k] || 0) > 0 || lessonDays.has(k);
  let streak = 0;
  for (let i = active(today) ? 0 : 1; ; i++) { const k = dayKey(Date.now() - i * DAY); if (active(k)) streak++; else break; }
  const pz = perDay[today] || 0, GOAL = 15;
  const lessonToday = Object.values(s.jobava).some(p => isToday(p.seen) || isToday(p.last)) || Object.values(s.read).some(isToday);
  const courses = [data.jobava, data.black].filter(Boolean);
  const nextLesson = (() => { for (const [J, base] of [[data.jobava, '#/jobava'], [data.black, '#/black']]) { if (!J) continue;
    for (const c of J.chapters) for (const l of c.lessons) if (!s.jobava[l.id]?.clean) return { href: `${base}/${c.id}/${l.id}`, title: l.title }; } return null; })();
  const last = data.games.at(-1);
  const tasks = [
    { done: pz >= GOAL, t: `${GOAL} puzzles`, d: `${Math.min(pz, GOAL)}/${GOAL} today`, href: '#/tactics/practice/smart', cta: 'Puzzles' },
    { done: lessonToday, t: 'One opening lesson', d: nextLesson ? esc(nextLesson.title) : 'Any lesson', href: nextLesson?.href || '#/jobava', cta: 'Open' },
    { done: isToday(s.viewed), t: 'Review a game', d: last ? `Your last one: vs ${esc(last.opp)}` : 'Pick any game', href: last ? `#/game/${last.id}` : '#/review', cta: 'Review' },
  ];
  // 12-week heatmap, columns = weeks (oldest left), rows = Mon..Sun
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const dow = (now.getDay() + 6) % 7, startT = now.getTime() - (7 * 11 + dow) * DAY;
  let cells = '';
  for (let w = 0; w < 12; w++) for (let d = 0; d < 7; d++) {
    const t = startT + (w * 7 + d) * DAY; if (t > now.getTime()) { cells += '<i class="hm-x"></i>'; continue; }
    const k = dayKey(t), n = perDay[k] || 0, lv = n === 0 ? (lessonDays.has(k) ? 1 : 0) : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4;
    cells += `<i class="hm-${lv}" title="${new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${n} puzzle${n === 1 ? '' : 's'}${lessonDays.has(k) ? ' + study' : ''}"></i>`;
  }
  const doneN = tasks.filter(x => x.done).length;
  // Rotate through the coach's leaks, one per week (ISO-ish week number), so the focus changes but stays put for a week.
  const leaks = data.review?.leaks || [];
  const focus = leaks.length ? leaks[Math.floor(Date.now() / (7 * DAY)) % Math.min(leaks.length, 4)] : null;
  return `<section class="section today">
    <div class="card">
      <div class="spread"><h2 style="margin:0">Today <em>${doneN}/3</em></h2><span class="eyebrow" style="margin:0">${streak ? `${streak}-day streak` : 'Start a streak today'}</span></div>
      <div class="tasks">${tasks.map(x => `<a class="task ${x.done ? 'done' : ''}" href="${x.href}"><span class="tick">${x.done ? '✓' : ''}</span>
        <span><b>${x.t}</b><span class="faint">${x.d}</span></span></a>`).join('')}</div>
      ${focus ? `<div class="focus"><span class="eyebrow" style="margin:0">This week's focus</span><div><b>${md(focus.title)}.</b> ${md(focus.fix)}</div></div>` : ''}
    </div>
    <div class="card"><div class="spread"><div class="eyebrow">Last 12 weeks</div><div class="eyebrow">${(n => `${n} puzzle${n === 1 ? '' : 's'}`)(Object.values(perDay).reduce((a, b) => a + b, 0))}</div></div>
      <div class="heat">${cells}</div>
      <div class="hm-key faint">less <i class="hm-0"></i><i class="hm-1"></i><i class="hm-2"></i><i class="hm-3"></i><i class="hm-4"></i> more</div></div>
  </section>`;
}

const tile = (v, l, d) => `<div class="card stat"><div class="v">${esc(v)}</div><div class="l">${esc(l)}</div><div class="d">${esc(d || '')}</div></div>`;

export function gameTable(list, data) {
  if (!list.length) return '<div class="empty">No games yet. Run scripts/update.py.</div>';
  const notes = data.review?.games || {};
  return `<table><thead><tr><th>Date</th><th>Result</th><th>Opponent</th><th>Opening</th><th class="num">Acc</th><th class="num">Blunders</th></tr></thead><tbody>
  ${list.map(g => `<tr class="click" data-game="${g.id}" title="${esc(notes[g.id]?.summary || '')}">
    <td>${fmtDate(g.end)}</td>
    <td><span class="res-${g.result}">${g.result}</span> <span class="faint">${g.how !== 'win' && g.result !== 'draw' ? '· ' + esc(g.how) : ''}</span></td>
    <td><span class="pill-dot" style="background:${g.color === 'white' ? '#f1ede4;box-shadow:0 0 0 1px var(--line)' : '#3b3a36'}"></span>${esc(g.opp)} <span class="faint">${g.opp_rating}</span></td>
    <td>${esc(g.opening)}</td>
    <td class="num">${g.acc ?? '–'}</td>
    <td class="num">${g.blunders ? `<span class="tag-blunder">${g.blunders}</span>` : '0'}</td></tr>`).join('')}</tbody></table>`;
}

export function bindGameRows(root) {
  $$('tr[data-game]', root).forEach(tr => (tr.onclick = () => (location.hash = `#/game/${tr.dataset.game}`)));
}

/* ---------------- Plan page ---------------- */

export function renderPlan({ app, data, store }) {
  const s = store.get();
  const m = allMetrics(data.games);
  const roadmap = data.lessons?.roadmap || [];
  if (s.queue === null) {
    store.update(st => (st.queue = recommendations(data).slice(0, 4).map((r, i) => ({ id: Date.now() + i, text: r.title, href: r.href, done: false, auto: true }))));
  }
  const now = m.rating ?? s.start;
  const stageIdx = roadmap.findIndex(st => { const [lo, hi] = st.band.split('-').map(Number); return now >= lo && now < hi; });
  const lessonTitle = id => data.lessons?.tactics?.find(l => l.id === id)?.title || data.lessons?.endgames?.find(l => l.id === id)?.title || id;
  const lessonHref = id => data.lessons?.endgames?.find(l => l.id === id) ? `#/tactics/endgame/${id}` : id === 'process' ? '#/tactics/lesson/process' : `#/tactics/lesson/${id}`;
  const weekMins = s.log.filter(l => l.t > Date.now() - 7 * DAY).reduce((a, l) => a + (+l.mins || 0), 0);

  app.innerHTML = `
  <h1>Your <em>plan</em></h1>
  <p class="muted">Roadmap targets check themselves against your last 20 rapid games and your puzzle log here. The queue is yours to edit.</p>

  <section class="section grid g2">
    <div class="card">
      <h3>Up next (your queue)</h3>
      <div class="queue" id="queue"></div>
      <form class="row" id="qadd" style="margin-top:10px"><input type="text" id="qtext" placeholder="Add something to work on…" style="flex:1"><button class="btn">Add</button></form>
      <div class="row" style="margin-top:8px"><button class="btn small" id="qrefill">Add today's suggestions</button><button class="btn small" id="qclear">Clear finished</button></div>
    </div>
    <div class="card">
      <div class="spread"><h3>Training log</h3><span class="faint">${weekMins} min this week</span></div>
      <form id="logf" class="grid" style="gap:8px">
        <div class="row"><input type="number" id="lmins" min="1" max="600" value="30" style="width:90px"> <span class="muted">min of</span>
          <select id="lkind"><option>Tactics</option><option>Played games</option><option>Game review</option><option>Opening study</option><option>Endgames</option><option>Video / book</option></select></div>
        <input type="text" id="lnote" placeholder="What did you notice? (optional)">
        <button class="btn primary" style="justify-self:start">Log it</button>
      </form>
      <div id="loglist" style="margin-top:12px"></div>
    </div>
  </section>

  <section class="section">
    <h2>Roadmap: 1100 → 1600</h2>
    ${roadmap.length ? `<div class="grid" style="gap:12px">${roadmap.map((st, i) => `
      <div class="card stage ${i === stageIdx ? 'current' : i < stageIdx ? 'done' : ''}">
        <div class="spread"><h3>${esc(st.band)} · ${esc(st.title)}</h3>${i === stageIdx ? '<span class="chip on">You are here</span>' : ''}</div>
        <div class="grid g3" style="margin-top:6px">
          <div><div class="eyebrow">Focus</div><ul class="tight">${st.focus.map(f => `<li>${md(f)}</li>`).join('')}</ul></div>
          <div><div class="eyebrow">Weekly routine</div><ul class="tight">${st.routine.map(f => `<li>${md(f)}</li>`).join('')}</ul></div>
          <div><div class="eyebrow">Targets</div>${st.targets.map(t => target(t, m)).join('')}
            <div class="eyebrow" style="margin-top:10px">Lessons</div>
            <div class="row">${st.lessons.map(id => `<a class="chip" href="${lessonHref(id)}">${esc(lessonTitle(id))}</a>`).join('')}</div></div>
        </div>
      </div>`).join('')}</div>` : '<div class="empty">Roadmap content is still being written.</div>'}
  </section>

  <section class="section card">
    <h3>Your data</h3>
    <p class="muted">Puzzle history, course progress, queue and log live in this browser. Export to back it up or move it to another device.</p>
    <div class="row"><button class="btn" id="exp">Export</button><label class="btn">Import<input type="file" id="imp" accept=".json" hidden></label><button class="btn" id="rst">Reset everything</button></div>
  </section>`;

  const drawQueue = () => {
    $('#queue').innerHTML = s.queue.length ? s.queue.map(q => `<div class="qi ${q.done ? 'done' : ''}" data-id="${q.id}">
      <input type="checkbox" ${q.done ? 'checked' : ''}><span class="tx">${q.href ? `<a href="${q.href}">${esc(q.text)}</a>` : esc(q.text)}</span><button class="x" title="Remove">×</button></div>`).join('')
      : '<div class="empty">Nothing queued.</div>';
    $$('#queue .qi').forEach(el => {
      const id = +el.dataset.id;
      el.querySelector('input').onchange = e => { store.update(st => (st.queue.find(q => q.id === id).done = e.target.checked)); drawQueue(); };
      el.querySelector('.x').onclick = () => { store.update(st => (st.queue = st.queue.filter(q => q.id !== id))); drawQueue(); };
    });
  };
  const drawLog = () => {
    $('#loglist').innerHTML = s.log.slice(-8).reverse().map(l => `<div class="spread" style="padding:5px 0;border-bottom:1px solid var(--line)">
      <span>${esc(l.kind)} · ${l.mins} min${l.note ? ` <span class="muted">· ${esc(l.note)}</span>` : ''}</span><span class="faint">${new Date(l.t).toLocaleDateString()}</span></div>`).join('') || '<div class="faint">No sessions logged yet.</div>';
  };
  drawQueue(); drawLog();
  $('#qadd').onsubmit = e => { e.preventDefault(); const t = $('#qtext').value.trim(); if (!t) return; store.update(st => st.queue.push({ id: Date.now(), text: t, done: false })); $('#qtext').value = ''; drawQueue(); };
  $('#qrefill').onclick = () => {
    const have = new Set(s.queue.map(q => q.text));
    store.update(st => recommendations(data).slice(0, 4).forEach((r, i) => !have.has(r.title) && st.queue.push({ id: Date.now() + i, text: r.title, href: r.href, done: false, auto: true })));
    drawQueue();
  };
  $('#qclear').onclick = () => { store.update(st => (st.queue = st.queue.filter(q => !q.done))); drawQueue(); };
  $('#logf').onsubmit = e => {
    e.preventDefault();
    store.update(st => st.log.push({ t: Date.now(), mins: +$('#lmins').value || 0, kind: $('#lkind').value, note: $('#lnote').value.trim() }));
    $('#lnote').value = ''; drawLog();
  };
  $('#exp').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.export()], { type: 'application/json' }));
    a.download = `chess-climb-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };
  $('#imp').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { store.import(await f.text()); location.reload(); } catch { $('#imp').closest('.card').insertAdjacentHTML('beforeend', '<p class="tag-blunder">That file did not look like a Chess Climb export.</p>'); } };
  let armed = false;
  $('#rst').onclick = e => {
    if (!armed) { armed = true; e.target.textContent = 'Click again to wipe all progress'; return; }
    store.reset(); location.reload();
  };
}

function target(t, m) {
  const metric = t.metric, v = m[metric];
  const ok = v != null && (t.max != null ? v <= t.max : v >= t.min);
  return `<div class="target"><span class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '○'}</span><span>${esc(t.label)} <span class="faint">(now ${v ?? '–'})</span></span></div>`;
}
