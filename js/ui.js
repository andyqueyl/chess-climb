// Small shared helpers: escaping, formatting, SVG charts.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const fmtDate = t => new Date(t * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
export const fmtDateLong = t => new Date(t * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const THEME_NAMES = {
  hangingPiece: 'Hanging pieces', fork: 'Forks', pin: 'Pins', skewer: 'Skewers', discoveredAttack: 'Discovered attacks',
  doubleCheck: 'Double check', backRankMate: 'Back-rank mate', mateIn1: 'Mate in 1', mateIn2: 'Mate in 2', mateIn3: 'Mate in 3',
  deflection: 'Deflection', attraction: 'Attraction', capturingDefender: 'Remove the defender', trappedPiece: 'Trapped piece',
  sacrifice: 'Sacrifices', interference: 'Interference', xRayAttack: 'X-ray', intermezzo: 'Intermezzo', quietMove: 'Quiet moves',
  defensiveMove: 'Defensive moves', advancedPawn: 'Advanced pawns', promotion: 'Promotion', exposedKing: 'Exposed king',
  kingsideAttack: 'Kingside attack', smotheredMate: 'Smothered mate', clearance: 'Clearance', rookEndgame: 'Rook endgames',
  pawnEndgame: 'Pawn endgames',
};
export const WHY_NAMES = {
  'hung-piece': 'Left a piece hanging', 'missed-threat': "Missed the opponent's threat", 'allowed-mate': 'Walked into mate',
  'bad-trade': 'Bad capture / trade', 'tactic-allowed': 'Allowed a tactic',
};
export const HOW_NAMES = { checkmated: 'Checkmated', resigned: 'Resigned', timeout: 'Lost on time', abandoned: 'Abandoned' };

/** Horizontal bar list. items: [{label, value, display?}] */
export function bars(items, { max = null, fmt = v => v } = {}) {
  const m = max ?? Math.max(1, ...items.map(i => i.value));
  return `<div class="bars">${items.map(i => `<div class="bar"><span>${esc(i.label)}</span>
    <div class="track"><div class="fill" style="width:${(i.value / m) * 100}%"></div></div>
    <span class="val">${esc(i.display ?? fmt(i.value))}</span></div>`).join('')}</div>`;
}

/** Single-series line chart with hover. points: [{x(Date ms), y, label}] */
export function lineChart(el, points, { goal = null, height = 220, yPad = 40 } = {}) {
  if (!points.length) { el.innerHTML = '<div class="empty">No games yet</div>'; return; }
  const W = 720, H = height, L = 40, R = 14, T = 14, B = 26;
  const ys = points.map(p => p.y).concat(goal ? [goal] : []);
  const ymin = Math.floor((Math.min(...ys) - yPad) / 50) * 50, ymax = Math.ceil((Math.max(...ys) + yPad / 2) / 50) * 50;
  const n = points.length;
  const X = i => L + (n === 1 ? (W - L - R) / 2 : (i / (n - 1)) * (W - L - R));
  const Y = v => T + (1 - (v - ymin) / (ymax - ymin)) * (H - T - B);
  const step = Math.max(50, Math.ceil((ymax - ymin) / 5 / 50) * 50);
  let grid = '';
  for (let v = ymin; v <= ymax; v += step) grid += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${d}L${X(n - 1)},${H - B}L${X(0)},${H - B}Z`;
  const ticks = [0, Math.floor(n / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i)
    .map(i => `<text x="${X(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${new Date(points[i].x).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</text>`).join('');
  const goalEl = goal && goal <= ymax ? `<line class="goal" x1="${L}" x2="${W - R}" y1="${Y(goal)}" y2="${Y(goal)}"/><text class="goal-l" x="${W - R}" y="${Y(goal) - 5}" text-anchor="end">Goal ${goal}</text>` : '';
  el.classList.add('chart');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rating over time">
    <g class="grid axis">${grid}</g><g class="axis">${ticks}</g>${goalEl}
    <path class="area" d="${area}"/><path class="series" d="${d}"/>
    <line class="hover-line" y1="${T}" y2="${H - B}" style="display:none"/><circle class="hover-dot" r="5" style="display:none"/>
    <rect x="${L}" y="0" width="${W - L - R}" height="${H}" fill="transparent"/></svg><div class="tip" style="display:none"></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), hl = el.querySelector('.hover-line'), hd = el.querySelector('.hover-dot');
  svg.addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(((vx - L) / (W - L - R)) * (n - 1))));
    const p = points[i];
    hl.setAttribute('x1', X(i)); hl.setAttribute('x2', X(i)); hl.style.display = '';
    hd.setAttribute('cx', X(i)); hd.setAttribute('cy', Y(p.y)); hd.style.display = '';
    tip.style.display = ''; tip.style.left = `${(X(i) / W) * 100}%`; tip.style.top = `${(Y(p.y) / H) * r.height}px`;
    tip.innerHTML = p.label;
  });
  svg.addEventListener('pointerleave', () => { tip.style.display = hl.style.display = hd.style.display = 'none'; });
}

/** Eval graph for a game. evals: white-POV cp per position (length plies+1). marks: [{i, cls}] */
export function evalGraph(el, evals, { marks = [], cur = 0, onPick } = {}) {
  const W = 720, H = 120, n = evals.length;
  const wp = cp => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-1500, Math.min(1500, cp)))) - 1);
  const X = i => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const Y = cp => H - (wp(cp) / 100) * H;
  const d = evals.map((e, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(e).toFixed(1)}`).join('');
  const colors = { blunder: 'var(--bad)', mistake: 'var(--serious)', inaccuracy: 'var(--warn)' };
  el.classList.add('chart', 'evalgraph');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">
    <rect class="bfill" x="0" y="0" width="${W}" height="${H}"/>
    <path class="wfill" d="${d}L${W},${H}L0,${H}Z"/>
    <line class="mid" x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}"/>
    ${marks.map(m => `<circle class="mk" cx="${X(m.i)}" cy="${Y(evals[m.i])}" r="4.5" fill="${colors[m.cls]}"/>`).join('')}
    <line class="cur" x1="${X(cur)}" x2="${X(cur)}" y1="0" y2="${H}"/></svg>`;
  el.querySelector('svg').onclick = e => {
    const r = e.currentTarget.getBoundingClientRect();
    onPick && onPick(Math.round(((e.clientX - r.left) / r.width) * (n - 1)));
  };
}

export function evalText(cp) {
  if (Math.abs(cp) >= 9000) { const m = Math.round((10000 - Math.abs(cp)) / 10); return m === 0 ? '#' : `${cp > 0 ? '+' : '-'}M${m}`; }
  return (cp > 0 ? '+' : '') + (cp / 100).toFixed(1);
}
