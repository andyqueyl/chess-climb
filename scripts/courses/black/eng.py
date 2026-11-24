import chess.engine, time
class Eng:
    def __init__(self): self._start()
    def _start(self):
        self.e = chess.engine.SimpleEngine.popen_uci(__import__("shutil").which("stockfish") or "/opt/homebrew/bin/stockfish")
        self.e.configure({"Threads": 8, "Hash": 256})
    def analyse(self, *a, **k):
        for t in range(6):
            try:
                return self.e.analyse(*a, **k)
            except chess.engine.EngineTerminatedError:
                time.sleep(1); self._start()
        raise RuntimeError("engine keeps dying")
    def quit(self):
        try: self.e.quit()
        except Exception: pass
