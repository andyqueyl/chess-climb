// Plain-English explanation of a chess move, worked out from the position (no engine needed).
// Used to annotate every move of a puzzle after it's done. Heuristic but grounded: every claim
// (check, fork, pin, hanging piece, mate threat) is computed on the board.
import { Chess } from '../vendor/chess.js';

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const FILES = 'abcdefgh';
const other = c => (c === 'w' ? 'b' : 'w');
const list = a => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a.at(-1));

function pieces(ch, color) {
  const out = [];
  for (const row of ch.board()) for (const p of row) if (p && p.color === color) out.push(p);
  return out;
}
const attackedBy = (ch, sq, color) => ch.attackers(sq, color);
const defended = (ch, sq, color) => ch.attackers(sq, color).length > 0;

/** Can `color` mate in one in this position if it were their move? Returns the mating SAN or null. */
function mateThreat(fen, color) {
  const ch = new Chess(fen);
  if (ch.inCheck()) return null;
  if (ch.turn() !== color) { try { ch.setTurn(color); } catch { return null; } }
  for (const m of ch.moves({ verbose: true })) {
    ch.move(m);
    const mate = ch.isCheckmate();
    ch.undo();
    if (mate) return m.san;
  }
  return null;
}

/** Enemy pieces the piece on `sq` attacks that are worth something to attack (bigger than it, or loose, or the king). */
function targetsFrom(ch, sq, me) {
  const mover = ch.get(sq);
  const out = [];
  for (const p of pieces(ch, other(me))) {
    if (!attackedBy(ch, p.square, me).includes(sq)) continue;
    if (p.type === 'k' || VAL[p.type] > VAL[mover.type] || (!defended(ch, p.square, other(me)) && p.type !== 'p')) out.push(p);
  }
  return out;
}

/** Slider on `sq` pins an enemy piece to something bigger behind it. */
function pinFrom(ch, sq, me) {
  const p = ch.get(sq);
  if (!p || !'brq'.includes(p.type)) return null;
  const dirs = [];
  if (p.type !== 'b') dirs.push([1, 0], [-1, 0], [0, 1], [0, -1]);
  if (p.type !== 'r') dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  const f0 = FILES.indexOf(sq[0]), r0 = +sq[1];
  for (const [df, dr] of dirs) {
    let f = f0 + df, r = r0 + dr, first = null;
    while (f >= 0 && f < 8 && r >= 1 && r <= 8) {
      const q = ch.get(FILES[f] + r);
      if (q) {
        if (!first) { if (q.color === me) break; first = q; }
        else {
          if (q.color !== me && (q.type === 'k' || VAL[q.type] > VAL[first.type])) return { pinned: first, behind: q };
          break;
        }
      }
      f += df; r += dr;
    }
  }
  return null;
}

/**
 * Explain `move` (SAN or {from,to,promotion}) played in `fen`.
 * opts: { solver: 'w'|'b' (the puzzle-solver's color), setup: bool (opponent's blunder that starts the puzzle), last: bool }
 */
export function explainMove(fen, move, { solver, setup = false, last = false, first = false, prev = null } = {}) {
  const ch = new Chess(fen);
  const me = ch.turn(), them = other(me);
  const wasCheck = ch.inCheck();
  const beforeAttacked = new Set(pieces(ch, me).filter(p => p.type !== 'p' && ch.attackers(p.square, them).length).map(p => p.square));
  // what each of my sliders attacked before (for discovered attacks)
  const sliderHits = {};
  for (const p of pieces(ch, me)) if ('brq'.includes(p.type)) sliderHits[p.square] = new Set(pieces(ch, them).filter(t => ch.attackers(t.square, me).includes(p.square)).map(t => t.square));
  let m;
  try { m = ch.move(move); } catch { return { text: '', sac: false }; }
  const after = ch;
  const mine = me === solver;
  const bits = [];
  const moverName = NAME[m.piece];

  if (after.isCheckmate()) return { text: mine ? `**Checkmate.** The ${moverName} delivers mate.` : 'Checkmate.', sac: false };

  if (setup) {
    let s = `Your opponent plays **${m.san}**`;
    if (m.captured) s += `, taking a ${NAME[m.captured]}`;
    s += '. That is the mistake. ';
    // `me` is the opponent here; `them` is the solver. Which of the opponent's pieces are now hanging?
    const loose = pieces(after, me).filter(p => p.type !== 'p' && p.type !== 'k' && after.attackers(p.square, them).length && !defended(after, p.square, me))
      .sort((a, b) => VAL[b.type] - VAL[a.type]).slice(0, 1);
    s += loose.length ? `Their ${NAME[loose[0].type]} on ${loose[0].square} is hanging, but check for something even better first.` : 'Look for checks, captures and threats.';
    return { text: s, sac: false, capture: !!m.captured };
  }

  if (!mine) {
    // the defender's reply
    if (wasCheck) {
      if (m.piece === 'k') bits.push(m.captured ? `The king takes the ${NAME[m.captured]} to get out of check` : 'Forced: the king has to step out of check');
      else if (m.captured) bits.push(`Forced: takes the checking ${NAME[m.captured]}`);
      else bits.push('Forced: blocks the check');
    } else if (m.captured) {
      if (prev && prev.capture && prev.to === m.to && !prev.sac) bits.push(`Takes back on ${m.to}`);
      else bits.push(prev?.sac ? `Takes the ${NAME[m.captured]}. That's the bait` : `Takes the ${NAME[m.captured]}`);
    } else if (beforeAttacked.has(m.from)) bits.push(`Saves the attacked ${moverName}`);
    else bits.push('The best defense');
    if (after.inCheck()) bits.push('with check');
    const thr = mateThreat(after.fen(), them);
    if (!thr && mateThreat(fen, solver) && !wasCheck) bits.push('and stops the mate threat');
    return { text: bits.join(' ') + '.', sac: false, capture: !!m.captured };
  }

  // solver's move
  if (m.promotion) bits.push(`Promotes to a ${NAME[m.promotion]}`);
  if (m.captured) {
    const capVal = VAL[m.captured], movVal = VAL[m.piece];
    const freshDef = after.attackers(m.to, them).length;
    if (!freshDef) bits.push(`Takes the ${NAME[m.captured]} for free`);
    else if (capVal > movVal) bits.push(`Takes the ${NAME[m.captured]}, which is worth more than your ${moverName}`);
    else if (capVal < movVal) bits.push(`Sacrifices the ${moverName} for a ${NAME[m.captured]}`);
    else bits.push(`Trades on ${m.to}`);
  } else if (after.attackers(m.to, them).length && !after.attackers(m.to, me).length && VAL[m.piece] >= 3) {
    bits.push(after.inCheck() ? `Sacrifices the ${moverName}` : `Sacrifices the ${moverName}: it can be taken`);
  }
  const sac = bits.some(b => b.startsWith('Sacrifices'));
  if (m.piece === 'p' && !m.promotion && (m.to[1] === '7' && me === 'w' || m.to[1] === '2' && me === 'b')) bits.push('Pushes the pawn one step from queening');

  if (after.inCheck()) {
    const kingSq = pieces(after, them).find(p => p.type === 'k').square;
    const checkers = after.attackers(kingSq, me);
    if (checkers.length > 1) bits.push('**Double check**, so the king must move');
    else if (!checkers.includes(m.to)) bits.push(`**Discovered check** from the ${NAME[after.get(checkers[0]).type]}`);
    else bits.push(bits.length ? 'with **check**' : '**Check**');
  }

  if (last && m.captured) { // the payoff move: keep it simple
    const out = bits.map((b, i) => (i ? (b.startsWith('with ') ? ' ' + b : '. ' + b[0].toUpperCase() + b.slice(1)) : b[0].toUpperCase() + b.slice(1))).join('');
    return { text: out + (after.inCheck() ? '.' : '. You come out ahead.'), sac, capture: true };
  }
  const order = { k: 0, q: 1, r: 2, b: 3, n: 3, p: 4 };
  const targets = targetsFrom(after, m.to, me).filter(t => t.type !== 'k' || after.inCheck()).sort((a, b) => order[a.type] - order[b.type]);
  const names = ts => { const n = ts.map(t => NAME[t.type]); return n.length === 2 && n[0] === n[1] ? [`both ${n[0]}s`] : n; };
  if (targets.length >= 2) bits.push(`**Fork**: the ${moverName} hits the ${list(names(targets))}`);
  else if (targets.length === 1 && targets[0].type !== 'k' && !m.captured) bits.push(`Attacks the ${NAME[targets[0].type]}${m.piece === 'p' ? ' with a pawn' : ''}`);

  // discovered attack: a slider of mine that now hits something new and valuable
  for (const [sq, hitsBefore] of Object.entries(sliderHits)) {
    if (sq === m.from) continue;
    const s = after.get(sq); if (!s || s.color !== me) continue;
    const now = pieces(after, them).filter(t => after.attackers(t.square, me).includes(sq) && !hitsBefore.has(t.square) && (t.type === 'q' || t.type === 'r' || !defended(after, t.square, them)) && t.type !== 'k');
    if (now.length) { bits.push(`Uncovers an attack: your ${NAME[s.type]} now hits the ${list(now.map(t => NAME[t.type]))}`); break; }
  }

  const pin = pinFrom(after, m.to, me);
  if (pin) bits.push(`**Pins** the ${NAME[pin.pinned.type]} to the ${NAME[pin.behind.type]}`);

  const thr = !after.inCheck() && mateThreat(after.fen(), me);
  if (thr) bits.push(`Threatens **${thr}** mate`);

  if (!bits.length) bits.push(last ? 'Keeps the extra material and the position is won' : first ? 'A quiet move. No check or capture, but it sets up a threat you can\'t meet' : beforeAttacked.has(m.from) ? `Moves the ${moverName} out of danger` : 'Improves the position');
  const cap = t => t[0].toUpperCase() + t.slice(1);
  let s = cap(bits[0]);
  for (const b of bits.slice(1)) s += b.startsWith('with ') ? ' ' + b : '. ' + cap(b);
  return { text: s + '.', sac, capture: !!m.captured };
}
