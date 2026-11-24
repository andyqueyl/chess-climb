# Chess Climb: context for Claude

Andy's personal chess-improvement site: chess.com **xxrolypolyxx**, rapid ~1085 (Nov 2026, started at 800 in Sept), goal **1600 rapid**. Wants: tactics focus, learn the **Jobava London** as White, track progress, know what to work on next. Static site (no build step), hosted on GitHub Pages.

## Layout
- `index.html`, `css/style.css`, `js/` (ES modules, no bundler). Bump `?v=` on css/js links in index.html and `V` in `js/app.js` after code/data changes (Pages caches).
  - `board.js` own board component (click/drag, arrows) on top of vendored `vendor/chess.js` (BSD-2, v1.4.0).
  - `store.js` all user progress in localStorage key `chessclimb:v1` (puzzle log + Leitner retries, site puzzle Elo, course progress, queue, training log). Export/import on Plan page.
  - `metrics.js` shared numbers + `recommendations()` ("Work on next" ranking). Main time class = rapid.
  - `views/` home+plan, review (stats + single-game viewer), tactics (hub, trainer, lessons, endgames), jobava (course, drill mode, quizzes).
- `scripts/update.py` pulls every game from the chess.com public API, runs Stockfish (depth 13 per ply, multipv-3 depth 18 on Andy's mistakes for puzzle extraction), writes `data/games.json`, `data/my-puzzles.json`, `data/profile.json`. Incremental via `data/cache/analysis.json` (keyed by game url; bump `ANALYZE_VERSION` to force re-analysis). Parallel engines (`WORKERS` env).
- `.github/workflows/update.yml` runs update.py daily (10:00 UTC) and commits new data → Pages redeploys.

## Content files (hand/agent-written, engine-verified)
- `data/puzzles-lichess.json` themed subset of the Lichess puzzle DB (CC0). Lichess format: FEN is before the opponent's setup move; `moves[0]` is the setup move.
- `data/jobava.json` Jobava London course (chapters → lessons with SAN lines + notes, drill side, quizzes). Every line checked legal with python-chess and sound with Stockfish.
- `data/lessons.json` tactics lessons (examples are real Lichess puzzle ids), thinking process, endgames, 1100→1600 roadmap with measurable targets (`blunders_per_game`, `accuracy`, `mistakes_per_game`, `puzzle_accuracy`, `puzzles_per_week`, `rating`).
- `data/review.json` coach-style written review of all games (made by Claude agents reading the engine output; NOT refreshed by the daily Action; regenerate by re-running a review when Andy asks).

## Rules / gotchas
- Accuracy uses the Lichess formula (simple mean) → runs higher than chess.com's numbers. Say so, don't pretend it matches.
- Blunder "why" labels (hung-piece etc.) and puzzle tags are heuristics; the UI says so.
- Never teach a line that isn't engine-checked. Verify tactics on the board before claiming them.
- Local dev: `python3 -m http.server` in the repo, open http://127.0.0.1:8000. Python env: `.venv` (python-chess); Stockfish via `brew install stockfish`.
- Andy's prefs: short chat replies, fun > work-flavored, plain friendly tone, no em dashes in site copy.
