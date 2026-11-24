// Everything Andy does on the site lives in localStorage under one key. Export/import on the Plan page.
const KEY = 'chessclimb:v1';
const DAY = 86400000;

const fresh = () => ({
  created: Date.now(),
  prating: 1100,                 // site puzzle rating (Elo-style, starts at his game rating)
  puzzles: {},                   // id -> {n, ok, last, due, box}
  attempts: [],                  // [{t, id, ok, theme[], src}] (capped)
  jobava: {},                    // lessonId -> {seen, drills, clean, last}
  quiz: {},                      // quizKey -> {n, ok}
  read: {},                      // lesson id -> timestamp
  queue: null,                   // [{id, text, done, auto}] (null = seed from recommendations)
  log: [],                       // [{t, mins, kind, note}]
  goal: 1600,
  start: 1100,
});

let state;
try { state = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { state = fresh(); }

export const store = {
  get: () => state,
  save() { localStorage.setItem(KEY, JSON.stringify(state)); },
  update(fn) { fn(state); this.save(); },
  export() { return JSON.stringify(state, null, 1); },
  import(json) { state = { ...fresh(), ...JSON.parse(json) }; this.save(); },
  reset() { state = fresh(); this.save(); },

  /** Record a puzzle attempt; Leitner-style spacing for retries. */
  recordPuzzle(id, ok, { rating = null, themes = [], src = 'lichess' } = {}) {
    const p = state.puzzles[id] || { n: 0, ok: 0, box: 0 };
    p.n++; if (ok) p.ok++;
    p.last = Date.now();
    p.box = ok ? Math.min(p.box + 1, 5) : 0;
    p.due = Date.now() + (ok ? [1, 3, 7, 21, 60, 120][p.box] : 0.5) * DAY;
    p.src = src;
    state.puzzles[id] = p;
    if (rating) {
      const exp = 1 / (1 + 10 ** ((rating - state.prating) / 400));
      const k = state.attempts.length < 30 ? 40 : 20;
      state.prating = Math.round(state.prating + k * ((ok ? 1 : 0) - exp));
    }
    state.attempts.push({ t: Date.now(), id, ok, th: themes, src, pr: state.prating });
    if (state.attempts.length > 5000) state.attempts = state.attempts.slice(-5000);
    this.save();
  },

  /** Puzzles I got wrong that are due for a retry now. */
  dueRetries() {
    const now = Date.now();
    return Object.entries(state.puzzles).filter(([, p]) => p.box === 0 && p.n > 0 && p.due <= now).map(([id]) => id);
  },

  themeStats(days = 60) {
    const since = Date.now() - days * DAY, out = {};
    for (const a of state.attempts) {
      if (a.t < since) continue;
      for (const th of a.th || []) { (out[th] ||= { n: 0, ok: 0 }); out[th].n++; if (a.ok) out[th].ok++; }
    }
    return out;
  },
};

export { DAY };
