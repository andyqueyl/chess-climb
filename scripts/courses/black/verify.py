"""Verify black.json: legality, canonical SAN, every BLACK move sound (Black is the repertoire side),
claimed White mistakes (~N) really cost N, lines end OK for Black, quiz answers near-best."""
import json, re, sys, chess, chess.engine
from eng import Eng
d = json.load(open(sys.argv[1])); DEPTH = int(sys.argv[2]); OPP = json.load(open(sys.argv[3]))
LOSS_HARD, LOSS_SOFT, END_MIN, PLAN_MARGIN = 110, 60, -70, 50
errors, warns = [], []
eng = Eng(); cache = {}
def evb(b):  # eval from Black's POV
    if b.is_checkmate(): return 10000 if b.turn == chess.WHITE else -10000
    k = b.fen()
    if k not in cache: cache[k] = eng.analyse(b, chess.engine.Limit(depth=DEPTH))["score"].pov(chess.BLACK).score(mate_score=10000)
    return cache[k]
def best(b, n=1): return eng.analyse(b, chess.engine.Limit(depth=DEPTH), multipv=n)
def tc(w, s):
    if "—" in s or "–" in s: errors.append(f"{w}: dash")
nl = nq = 0
for ch in d["chapters"]:
    tc(ch["id"], ch["title"] + ch["summary"])
    for L in ch["lessons"]:
        nl += 1; lid = L["id"]; b = chess.Board()
        for s in L["intro"] + L["key_ideas"] + [L["title"]]: tc(lid, s)
        for i, mv in enumerate(L["moves"]):
            tc(f"{lid}#{i}", mv["note"])
            try: m = b.parse_san(mv["san"])
            except Exception: errors.append(f"{lid} ply {i}: ILLEGAL {mv['san']} at {b.fen()}"); break
            if b.san(m) != mv["san"]: errors.append(f"{lid} ply {i}: SAN {mv['san']} should be {b.san(m)}")
            key = f"{lid}:{i}"; mover = b.turn
            b2 = b.copy(); b2.push(m); after = evb(b2)
            if mover == chess.BLACK or key in OPP:
                info = best(b)[0]; bv = info["score"].pov(chess.BLACK).score(mate_score=10000); bsan = b.san(info["pv"][0])
            if mover == chess.BLACK:
                loss = bv - after
                if loss > LOSS_HARD or (loss > LOSS_SOFT and after < -40):
                    errors.append(f"{lid} ply {i}: Black {mv['san']} loses {loss} -> {after} (best {bsan} {bv})")
            if key in OPP:
                cost = after - bv  # White mistake gain for Black
                if mover != chess.WHITE: errors.append(f"{key} not a White move")
                elif cost < OPP[key]: errors.append(f"{lid} ply {i}: claimed White mistake {mv['san']} only gives Black {cost} (White best {bsan})")
                else: print(f"     trap ok {key} {mv['san']} gives Black {cost}")
            b.push(m)
        else:
            e = evb(b)
            if e < END_MIN: errors.append(f"{lid}: ends at {e} for Black")
            print(f"  ok {lid:28s} plies={len(L['moves']):2d} end(Black)={e:+d}", flush=True)
    for qi, q in enumerate(ch["quiz"]):
        nq += 1; w = f"{ch['id']} quiz {qi}"; tc(w, q["prompt"] + q["explain"])
        b = chess.Board(q["fen"]); infos = best(b, 6); sign = 1 if b.turn == chess.BLACK else -1
        vals = [(x["pv"][0].uci(), sign * x["score"].pov(chess.BLACK).score(mate_score=10000)) for x in infos]
        top = vals[0][1]; dv = dict(vals)
        for a in q["answer"]:
            m = chess.Move.from_uci(a)
            if m not in b.legal_moves: errors.append(f"{w}: illegal {a}"); continue
            if a in dv: v = dv[a]
            else: b2 = b.copy(); b2.push(m); v = sign * evb(b2)
            if top - v > PLAN_MARGIN: errors.append(f"{w}: {a} ({v}) is {top-v} worse than {vals[0][0]} ({top})")
        for u, v in vals:
            if top - v <= 30 and u not in q["answer"]: warns.append(f"{w}: {u} ({v}) near-best, not in answers {q['answer']}")
        print(f"  ok {w:28s} {vals[:4]} ans={q['answer']}", flush=True)
eng.quit()
for x in warns: print("WARN", x)
for x in errors: print("ERROR", x)
print(f"RESULT: {len(d['chapters'])} chapters, {nl} lessons, {nq} quiz, depth {DEPTH}, {len(errors)} errors, {len(warns)} warnings")
