import { store } from './store.js';
import { esc, md, $, $$ } from './ui.js';
import { renderHome, renderPlan } from './views/home.js';
import { renderReview, renderGame } from './views/review.js';
import { renderTactics } from './views/tactics.js';
import { renderJobava } from './views/jobava.js';

const V = '5';
const load = (f, fallback) => fetch(`data/${f}?v=${V}`).then(r => (r.ok ? r.json() : fallback)).catch(() => fallback);

export const data = {};

async function boot() {
  const [games, profile, myPuzzles, lichess, jobava, lessons, review] = await Promise.all([
    load('games.json', []), load('profile.json', null), load('my-puzzles.json', []), load('puzzles-lichess.json', { puzzles: [], london: [] }),
    load('jobava.json', null), load('lessons.json', null), load('review.json', null),
  ]);
  // Rapid only: blitz and bullet games (and puzzles from them) are left out on purpose.
  const rapidGames = games.filter(g => g.class === 'rapid');
  const rapidPuzzles = myPuzzles.filter(p => p.time_class === 'rapid');
  Object.assign(data, { games: rapidGames, profile, myPuzzles: rapidPuzzles, lichess, jobava, lessons, review });
  data.gameById = Object.fromEntries(rapidGames.map(g => [g.id, g]));
  window.addEventListener('hashchange', route);
  route();
}

let cleanup = null;
function route() {
  const app = $('#app');
  if (cleanup) { cleanup(); cleanup = null; }
  const [hash, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const [page, ...rest] = hash.split('/');
  $$('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + (page === 'game' ? 'review' : page)));
  window.scrollTo(0, 0);
  const ctx = { app, data, store, params: rest.map(decodeURIComponent), query: new URLSearchParams(qs || ''), onLeave: fn => (cleanup = fn) };
  try {
    switch (page) {
      case '': return renderHome(ctx);
      case 'review': return renderReview(ctx);
      case 'game': return renderGame(ctx);
      case 'tactics': return renderTactics(ctx);
      case 'jobava': return renderJobava(ctx);
      case 'plan': return renderPlan(ctx);
      default: app.innerHTML = `<div class="empty">Page not found. <a href="#/">Go home</a></div>`;
    }
  } catch (e) {
    console.error(e);
    app.innerHTML = `<div class="empty">Something broke on this page: ${esc(e.message)}</div>`;
  }
}

boot();
export { md };
