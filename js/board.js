// Minimal interactive chessboard: click or drag to move, legal-move dots, last-move + check highlights, arrows.
import { Chess } from '../vendor/chess.js';

const FILES = 'abcdefgh';
const PIECE_SRC = (color, type) => `assets/pieces/${color === 'w' ? 'l' : 'd'}${type}.svg`;

export function sqName(fileIdx, rankIdx) { return FILES[fileIdx] + (rankIdx + 1); }

export class Board {
  /**
   * @param {HTMLElement} el
   * @param {{orientation?: 'white'|'black', onMove?: (m:{from,to,promotion})=>void, coords?: boolean}} opts
   */
  constructor(el, opts = {}) {
    this.el = el;
    this.orientation = opts.orientation || 'white';
    this.onMove = opts.onMove || null;
    this.movable = null;           // 'w' | 'b' | 'both' | null
    this.chess = new Chess();
    this.selected = null;
    this.lastMove = null;
    this.marks = {};               // square -> css class
    this.arrowList = [];
    this.coords = opts.coords !== false;
    el.classList.add('board-wrap');
    el.innerHTML = `<div class="board"></div><svg class="arrows" viewBox="0 0 800 800"><defs>${['good', 'bad', 'info'].map(c =>
      `<marker id="ah-${uid}-${c}" markerWidth="4" markerHeight="4" refX="2.05" refY="2" orient="auto"><path d="M0,0 V4 L3,2 Z" class="ah ${c}"/></marker>`).join('')}</defs></svg>`;
    this.arrowMarker = `ah-${uid++}`;
    this.boardEl = el.querySelector('.board');
    this.svg = el.querySelector('svg.arrows');
    this._bindPointer();
    this.render();
  }

  setFen(fen, lastMove = null) {
    const before = lastMove ? this.chess.get(lastMove[0]) : null;
    this.chess.load(fen);
    if (lastMove && before) {
      const after = this.chess.get(lastMove[1]);
      if (after && after.color === before.color && !this.chess.get(lastMove[0])) this._anim = lastMove;
    }
    this.lastMove = lastMove;
    this.selected = null;
    this.marks = {};
    this.render();
  }
  fen() { return this.chess.fen(); }
  setOrientation(o) { this.orientation = o; this.render(); }
  flip() { this.setOrientation(this.orientation === 'white' ? 'black' : 'white'); }
  setMovable(side) { this.movable = side; this.selected = null; this.render(); }
  setArrows(list) { this.arrowList = list || []; this._drawArrows(); }
  mark(square, cls) { this.marks[square] = cls; this.render(); }
  clearMarks() { this.marks = {}; this.render(); }

  /** Play a move on the internal position (used for scripted replies). Returns the chess.js move or null. */
  play(move) {
    try {
      const m = typeof move === 'string' && /^[a-h][1-8][a-h][1-8]/.test(move)
        ? this.chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] || 'q' })
        : this.chess.move(move);
      this.lastMove = [m.from, m.to];
      this.selected = null;
      this._anim = this.lastMove;
      this.render();
      return m;
    } catch { return null; }
  }

  _squareAt(clientX, clientY) {
    const r = this.boardEl.getBoundingClientRect();
    const x = Math.floor((clientX - r.left) / (r.width / 8));
    const y = Math.floor((clientY - r.top) / (r.height / 8));
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    return this.orientation === 'white' ? sqName(x, 7 - y) : sqName(7 - x, y);
  }

  _canMoveFrom(sq) {
    const p = this.chess.get(sq);
    if (!p || !this.movable) return false;
    if (p.color !== this.chess.turn()) return false;
    return this.movable === 'both' || this.movable === p.color;
  }

  _tryMove(from, to) {
    const legal = this.chess.moves({ square: from, verbose: true }).filter(m => m.to === to);
    if (!legal.length) return false;
    const promotion = legal.some(m => m.promotion) ? 'q' : undefined;
    const m = { from, to, promotion };
    this.selected = null;
    if (this.onMove) this.onMove(m);
    if (this._dragging) this._anim = null; // a dragged piece is already where it landed
    return true;
  }

  _bindPointer() {
    let drag = null;
    this.boardEl.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      const sq = this._squareAt(e.clientX, e.clientY);
      if (!sq) return;
      if (this.selected && this.selected !== sq && !this._canMoveFrom(sq)) {
        this._tryMove(this.selected, sq) || (this.selected = null, this.render());
        return;
      }
      if (this._canMoveFrom(sq)) {
        this.selected = sq;
        this.render();
        const pieceEl = this.boardEl.querySelector(`[data-sq="${sq}"] img`);
        if (pieceEl) {
          drag = { from: sq, el: pieceEl, startX: e.clientX, startY: e.clientY, moved: false };
          this.boardEl.setPointerCapture(e.pointerId);
        }
      } else {
        this.selected = null; this.render();
      }
    });
    this.boardEl.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      drag.el.classList.add('dragging');
      drag.el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      d.el.classList.remove('dragging');
      d.el.style.transform = '';
      if (!d.moved) return;
      const to = this._squareAt(e.clientX, e.clientY);
      this._dragging = true;
      const ok = to && to !== d.from && this._tryMove(d.from, to);
      this._dragging = false;
      if (!ok) this.render();
    };
    this.boardEl.addEventListener('pointerup', end);
    this.boardEl.addEventListener('pointercancel', end);
  }

  render() {
    const b = this.chess.board(); // b[0] = rank 8
    const dests = this.selected ? new Set(this.chess.moves({ square: this.selected, verbose: true }).map(m => m.to)) : new Set();
    let checkSq = null;
    if (this.chess.inCheck()) {
      const turn = this.chess.turn();
      for (const row of b) for (const p of row) if (p && p.type === 'k' && p.color === turn) checkSq = p.square;
    }
    let html = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const fileIdx = this.orientation === 'white' ? x : 7 - x;
        const rankIdx = this.orientation === 'white' ? 7 - y : y;
        const sq = sqName(fileIdx, rankIdx);
        const p = b[7 - rankIdx][fileIdx];
        const cls = ['sq', (fileIdx + rankIdx) % 2 ? 'light' : 'dark'];
        if (this.lastMove && this.lastMove.includes(sq)) cls.push('last');
        if (sq === this.selected) cls.push('sel');
        if (sq === checkSq) cls.push('check');
        if (this.marks[sq]) cls.push(this.marks[sq]);
        let inner = '';
        if (p) inner += `<img src="${PIECE_SRC(p.color, p.type)}" alt="${p.color}${p.type}" draggable="false">`;
        if (dests.has(sq)) inner += `<span class="${p ? 'cap' : 'dot'}"></span>`;
        if (this.coords && x === 0) inner += `<span class="coord r">${rankIdx + 1}</span>`;
        if (this.coords && y === 7) inner += `<span class="coord f">${FILES[fileIdx]}</span>`;
        html += `<div class="${cls.join(' ')}" data-sq="${sq}">${inner}</div>`;
      }
    }
    this.boardEl.innerHTML = html;
    this._drawArrows();
    if (this._anim && !this._animQueued) {
      // Animate after the last synchronous re-render this frame (setMovable/mark re-render right after setFen).
      this._animQueued = true;
      requestAnimationFrame(() => {
        const a = this._anim; this._anim = null; this._animQueued = false;
        if (!a || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const img = this.boardEl.querySelector(`[data-sq="${a[1]}"] img`);
        if (!img) return;
        const [x1, y1] = this._center(a[0]), [x2, y2] = this._center(a[1]);
        img.style.transition = 'none'; img.style.zIndex = 5;
        img.style.transform = `translate(${x1 - x2}%, ${y1 - y2}%)`;
        img.getBoundingClientRect();
        img.style.transition = 'transform 190ms cubic-bezier(.2,.8,.2,1)';
        img.style.transform = '';
        img.addEventListener('transitionend', () => { img.style.zIndex = ''; img.style.transition = ''; }, { once: true });
      });
    }
  }

  _center(sq) {
    const f = FILES.indexOf(sq[0]), r = +sq[1] - 1;
    const x = this.orientation === 'white' ? f : 7 - f;
    const y = this.orientation === 'white' ? 7 - r : r;
    return [x * 100 + 50, y * 100 + 50];
  }

  _drawArrows() {
    this.svg.querySelectorAll('line').forEach(l => l.remove());
    for (const a of this.arrowList) {
      const [x1, y1] = this._center(a.from), [x2, y2] = this._center(a.to);
      const len = Math.hypot(x2 - x1, y2 - y1), k = (len - 28) / len;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Object.entries({ x1, y1, x2: x1 + (x2 - x1) * k, y2: y1 + (y2 - y1) * k, 'stroke-width': 16, 'stroke-linecap': 'round',
        class: 'arrow ' + (a.cls || 'good'), 'marker-end': `url(#${this.arrowMarker}-${a.cls || 'good'})` }).forEach(([k2, v]) => line.setAttribute(k2, v));
      this.svg.appendChild(line);
    }
  }
}
let uid = 0;

export function uciToMove(uci) { return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }; }
export { Chess };
