# Course sources

The opening courses are written as Python (lines with `{notes}` inline) and built to JSON, then every line is checked with Stockfish.

```
cd scripts/courses/jobava && python build.py ../../../data/jobava.json && python verify_jobava.py ../../../data/jobava.json 18 mistakes.json
cd scripts/courses/black  && python build.py ../../../data/black.json  && python verify.py ../../../data/black.json 18 opp.json
```

- `~N:Move` marks an opponent mistake; the verifier checks it really costs at least N centipawns.
- The repertoire side's moves may never lose more than ~110cp vs Stockfish's best, and every line must end playable.
- Keep notes free of em/en dashes (the verifier flags them).
