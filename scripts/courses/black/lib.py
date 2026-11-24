import re, chess
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
            out.append({"san": tok.rstrip("!?"), "note": ""})
    return out
def fen_after(moves):
    b = chess.Board()
    for s in moves.split(): b.push_san(s)
    return b.fen()
def L(id, title, intro, line, ideas):
    return {"id": id, "title": title, "intro": intro, "start": None, "moves": parse_line(line, id), "train": "black", "key_ideas": ideas}
def Q(moves, prompt, answer, explain):
    return {"fen": fen_after(moves), "prompt": prompt, "answer": answer, "explain": explain}
