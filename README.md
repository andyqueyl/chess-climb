# Chess Climb

Personal training site for getting from ~1100 to 1600 rapid on chess.com.

- **Home**: rating vs goal, last-20-game form, and a ranked "work on next" list built from my games and puzzle results.
- **My games**: every chess.com game run through Stockfish: blunders by cause, phase and clock, how I lose, openings table, and a game viewer with eval graph and best-move arrows.
- **Tactics**: puzzles from my own missed wins, a smart mix weighted to my weak themes, 28 themed sets from the Lichess puzzle database, spaced retries for misses, plus lessons for each motif and endgame basics.
- **Jobava London**: an engine-checked course with a step-through mode and a drill mode where you play the moves.
- **Plan**: the 1100 → 1600 roadmap with self-checking targets, an editable queue, and a training log.

Progress is stored in the browser (export/import on the Plan page). Game data refreshes daily via GitHub Actions.

Run locally: `python3 -m http.server` then open http://127.0.0.1:8000. Refresh games by hand: `python scripts/update.py` (needs `pip install chess` and Stockfish).

Credits: games from the chess.com public API; puzzles from the [Lichess puzzle database](https://database.lichess.org/#puzzles) (CC0); [chess.js](https://github.com/jhlywa/chess.js) (BSD-2); pieces by Colin M.L. Burnett (via Wikimedia Commons).
