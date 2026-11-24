import re, json, chess
MISTAKES = {}
def parse_line(s, lid):
    out = []
    for tok in re.findall(r"\{[^}]*\}|\S+", s):
        if tok.startswith("{"):
            out[-1]["note"] = tok[1:-1].strip()
        else:
            m = re.match(r"~(\d+):(.+)", tok)
            if m:
                MISTAKES[f"{lid}:{len(out)}"] = int(m.group(1)); tok = m.group(2)
            out.append({"san": tok, "note": ""})
    return out
def fen_after(moves, start=None):
    b = chess.Board(start) if start else chess.Board()
    for s in moves.split(): b.push_san(s)
    return b.fen()
def L(id, title, intro, line, ideas, start=None):
    return {"id": id, "title": title, "intro": intro, "start": start, "moves": parse_line(line, id), "train": "white", "key_ideas": ideas}
def Q(moves, prompt, answer, explain, start=None):
    return {"fen": fen_after(moves, start), "prompt": prompt, "answer": answer, "explain": explain}
