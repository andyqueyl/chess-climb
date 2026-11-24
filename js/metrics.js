// Numbers the dashboard, plan targets and recommendations all share.
import { store, DAY } from './store.js';
import { THEME_NAMES, WHY_NAMES } from './ui.js';

export const MAIN_CLASS = 'rapid';
const mine = (g, i) => (i % 2 === 0) === (g.color === 'white');

export function recentGames(games, n = 20, cls = MAIN_CLASS) {
  return games.filter(g => g.class === cls).slice(-n);
}

export function gameMetrics(list) {
  const n = list.length;
  if (!n) return null;
  const avg = f => list.reduce((s, g) => s + (f(g) || 0), 0) / n;
  const w = list.filter(g => g.result === 'win').length, d = list.filter(g => g.result === 'draw').length;
  return {
    n, wins: w, draws: d, losses: n - w - d,
    score: Math.round(((w + d / 2) / n) * 100),
    accuracy: +avg(g => g.acc).toFixed(1),
    blunders_per_game: +avg(g => g.blunders).toFixed(2),
    mistakes_per_game: +avg(g => g.mistakes).toFixed(2),
    rating: list[n - 1].rating,
  };
}

export function puzzleMetrics() {
  const s = store.get();
  const recent = s.attempts.slice(-100);
  const week = s.attempts.filter(a => a.t > Date.now() - 7 * DAY);
  return {
    puzzle_accuracy: recent.length ? Math.round((recent.filter(a => a.ok).length / recent.length) * 100) : null,
    puzzles_per_week: week.length,
    puzzle_rating: s.prating,
    attempts: s.attempts.length,
  };
}

export function allMetrics(games) {
  return { ...(gameMetrics(recentGames(games)) || {}), ...puzzleMetrics() };
}

export function ratingSeries(games, cls = MAIN_CLASS) {
  return games.filter(g => g.class === cls).map(g => ({
    x: g.end * 1000, y: g.rating,
    label: `<b>${g.rating}</b> · ${g.result} vs ${g.opp} (${g.opp_rating})<br>${new Date(g.end * 1000).toLocaleDateString()}`,
  }));
}

/** Count my blunders by reason / phase / clock across a list of games. */
export function blunderBreakdown(list) {
  const why = {}, phase = {};
  let lowClock = 0, total = 0;
  for (const g of list) g.plies.forEach((p, i) => {
    if (!mine(g, i) || p.cls !== 'blunder') return;
    total++;
    why[p.why || 'tactic-allowed'] = (why[p.why || 'tactic-allowed'] || 0) + 1;
    phase[p.phase] = (phase[p.phase] || 0) + 1;
    if (p.clk != null && g.base && p.clk < Math.max(30, g.base * 0.1)) lowClock++;
  });
  return { why, phase, lowClock, total };
}

const TAG_TO_THEME = { fork: 'fork', mate: 'mateIn2', 'free-piece': 'hangingPiece', 'winning-capture': 'hangingPiece', discovered: 'discoveredAttack', promotion: 'advancedPawn', 'quiet-move': 'quietMove', check: 'exposedKing' };

/** Ranked "what to work on next" list built from games + puzzle log + course progress. */
export function recommendations(data) {
  const { games, myPuzzles, lessons, jobava } = data;
  const recs = [];
  const lessonFor = theme => lessons?.tactics?.find(l => l.theme === theme);
  const recent = recentGames(games, 30);
  const m = gameMetrics(recent);
  const s = store.get();

  if (m) {
    const bd = blunderBreakdown(recent);
    const top = Object.entries(bd.why).sort((a, b) => b[1] - a[1])[0];
    if (m.blunders_per_game > 0.6 && top) {
      const [why, count] = top;
      const map = { 'hung-piece': 'hangingPiece', 'missed-threat': 'defensiveMove', 'allowed-mate': 'mateIn2', 'bad-trade': 'hangingPiece', 'tactic-allowed': 'defensiveMove' };
      const theme = map[why];
      const lesson = why === 'missed-threat' || why === 'tactic-allowed' ? (lessons?.tactics?.find(l => /defen|threat/i.test(l.id)) || lessonFor(theme)) : lessonFor(theme);
      recs.push({
        score: 100 + count * 3, title: `Stop the #1 leak: ${WHY_NAMES[why].toLowerCase()}`,
        why: `${m.blunders_per_game} blunders per rapid game lately. "${WHY_NAMES[why]}" caused ${count} of ${bd.total} blunders in your last ${recent.length} rapid games.`,
        href: lesson ? `#/tactics/lesson/${lesson.id}` : `#/tactics/practice/${theme}`, label: lesson ? 'Study it' : 'Practice',
      });
    }
    if (bd.total && bd.lowClock / bd.total >= 0.3) {
      recs.push({ score: 70 + bd.lowClock, title: 'Fix your clock', why: `${bd.lowClock} of ${bd.total} recent blunders came with under 10% of your time left. Spend less in the opening, more on critical moves.`, href: '#/tactics/lesson/process', label: 'Time plan' });
    }
    const timeouts = recent.filter(g => g.result === 'loss' && g.how === 'timeout').length;
    if (timeouts >= 3) recs.push({ score: 65 + timeouts, title: 'Losing on time', why: `${timeouts} of your last ${recent.length} rapid games were lost on time.`, href: '#/tactics/lesson/process', label: 'Time plan' });
  }

  // my own missed tactics
  const unsolvedMine = myPuzzles.filter(p => !(s.puzzles['m:' + p.id]?.ok));
  if (unsolvedMine.length) {
    const tagCount = {};
    myPuzzles.forEach(p => p.tags.forEach(t => (tagCount[t] = (tagCount[t] || 0) + 1)));
    recs.push({ score: 90, title: `Re-solve ${unsolvedMine.length} moments from your own games`, why: 'Positions where you had a clearly winning move and missed it, or blundered instead. Your mistakes, your patterns.', href: '#/tactics/practice/mine', label: 'Start' });
    const topTag = Object.entries(tagCount).filter(([t]) => TAG_TO_THEME[t] && t !== 'check').sort((a, b) => b[1] - a[1])[0];
    if (topTag) {
      const th = TAG_TO_THEME[topTag[0]], l = lessonFor(th);
      recs.push({ score: 75 + topTag[1], title: `Drill ${THEME_NAMES[th].toLowerCase()}`, why: `The winning idea you missed most often in your games was a ${topTag[0].replace('-', ' ')} (${topTag[1]} times).`, href: `#/tactics/practice/${th}`, label: 'Practice', extra: l ? `#/tactics/lesson/${l.id}` : null });
    }
  }

  // retry queue
  const due = store.dueRetries().length;
  if (due) recs.push({ score: 95, title: `${due} missed puzzle${due > 1 ? 's' : ''} due for a retry`, why: 'Puzzles you failed come back until you solve them clean.', href: '#/tactics/practice/retry', label: 'Retry' });

  // weakest theme on the site
  const ts = store.themeStats();
  const weak = Object.entries(ts).filter(([t, v]) => v.n >= 8 && THEME_NAMES[t]).map(([t, v]) => [t, v.ok / v.n]).sort((a, b) => a[1] - b[1])[0];
  if (weak && weak[1] < 0.65) recs.push({ score: 80, title: `Weakest theme: ${THEME_NAMES[weak[0]]}`, why: `You're solving ${Math.round(weak[1] * 100)}% of these lately.`, href: `#/tactics/practice/${weak[0]}`, label: 'Practice' });

  // opening course
  if (jobava) {
    const all = jobava.chapters.flatMap(c => c.lessons.map(l => ({ c, l })));
    const next = all.find(({ l }) => !(s.jobava[l.id]?.clean));
    const done = all.length - all.filter(({ l }) => !(s.jobava[l.id]?.clean)).length;
    if (next) recs.push({ score: 60, title: `Jobava London: ${next.l.title}`, why: `${done}/${all.length} lessons drilled clean. Next up in "${next.c.title}".`, href: `#/jobava/${next.c.id}/${next.l.id}`, label: 'Open' });
  }

  // worst opening (enough games)
  const fam = {};
  recent.forEach(g => { const k = `${g.color}|${g.family}`; (fam[k] ||= []).push(g); });
  const worst = Object.entries(fam).filter(([, v]) => v.length >= 4).map(([k, v]) => [k, gameMetrics(v)]).sort((a, b) => a[1].score - b[1].score)[0];
  if (worst && worst[1].score < 45) {
    const [color, family] = worst[0].split('|');
    recs.push({ score: 55, title: `Rough opening: ${family} as ${color}`, why: `You scored ${worst[1].score}% in ${worst[1].n} recent games with it.`, href: `#/review?family=${encodeURIComponent(family)}`, label: 'See games' });
  }

  // fresh puzzles if nothing else
  recs.push({ score: 30, title: 'Daily mixed tactics', why: '15 to 25 puzzles at your level, weighted toward what you miss.', href: '#/tactics/practice/smart', label: 'Go' });
  return recs.sort((a, b) => b.score - a.score);
}
