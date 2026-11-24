"""Verify data/jobava.json: schema, legality, engine soundness of White moves, Black-mistake claims, quiz answers."""
import json, re, sys, os, chess, chess.engine
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eng import Eng
PATH = sys.argv[1]
DEPTH = int(sys.argv[2]) if len(sys.argv) > 2 else 18
BLACK_MISTAKES = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
LOSS_HARD = 120   # a White move may never drop more than this vs Stockfish best
LOSS_SOFT = 60    # ...nor more than this if it leaves White worse than equal
END_MIN = -50     # final position of every line must be >= this for White
PLAN_MARGIN = 50
errors, warns = [], []
d = json.load(open(PATH))
eng = Eng()
cache = {}
def ev(b):
    k = b.fen()
    if b.is_checkmate(): return -10000 if b.turn == chess.WHITE else 10000
    if k not in cache:
        cache[k] = eng.analyse(b, chess.engine.Limit(depth=DEPTH))["score"].pov(chess.WHITE).score(mate_score=10000)
    return cache[k]
def best_of(b, n=1):
    return eng.analyse(b, chess.engine.Limit(depth=DEPTH), multipv=n)
def textcheck(where, s):
    if "—" in s or "–" in s: errors.append(f"{where}: dash character")
    if re.search(r"[一-鿿]", s): errors.append(f"{where}: CJK text")
for k in ("title", "intro", "chapters"):
    if k not in d: errors.append(f"missing top key {k}")
textcheck("intro", d["intro"])
ids = set(); nles = nq = 0
for ch in d["chapters"]:
    for k in ("id", "title", "summary", "lessons", "quiz"):
        if k not in ch: errors.append(f"chapter {ch.get('id')} missing {k}")
    if ch["id"] in ids: errors.append(f"dup id {ch['id']}")
    ids.add(ch["id"])
    textcheck(ch["id"], ch["summary"] + ch["title"])
    for L in ch["lessons"]:
        nles += 1
        lid = L["id"]
        for k in ("id", "title", "intro", "start", "moves", "train", "key_ideas"):
            if k not in L: errors.append(f"{lid} missing {k}")
        if lid in ids: errors.append(f"dup id {lid}")
        ids.add(lid)
        if L["train"] not in ("white", "black"): errors.append(f"{lid} bad train")
        for s in L["intro"] + L["key_ideas"] + [L["title"]]: textcheck(lid, s)
        b = chess.Board(L["start"]) if L["start"] else chess.Board()
        for i, mv in enumerate(L["moves"]):
            textcheck(f"{lid}#{i}", mv["note"])
            if len(re.findall(r"[.!?](\s|$)", mv["note"])) > 2: warns.append(f"{lid}#{i} note has >2 sentences")
            try:
                m = b.parse_san(mv["san"])
            except Exception:
                errors.append(f"{lid} ply {i}: ILLEGAL {mv['san']} at {b.fen()}"); break
            if b.san(m) != mv["san"]:
                errors.append(f"{lid} ply {i}: non-canonical SAN {mv['san']} (want {b.san(m)})")
            mover = b.turn
            b2 = b.copy(); b2.push(m)
            after = ev(b2)
            key = f"{lid}:{i}"
            if mover == chess.WHITE or key in BLACK_MISTAKES:
                info = best_of(b)[0]
                bestv = info["score"].pov(chess.WHITE).score(mate_score=10000)
            if mover == chess.WHITE:
                loss = bestv - after
                if loss > LOSS_HARD or (loss > LOSS_SOFT and after < 0):
                    errors.append(f"{lid} ply {i}: White {mv['san']} loses {loss}cp -> {after} (best {b.san(info['pv'][0])} {bestv})")
            if key in BLACK_MISTAKES:
                if mover != chess.BLACK: errors.append(f"{key} not a Black move")
                if after - bestv < BLACK_MISTAKES[key]:
                    errors.append(f"{lid} ply {i}: claimed Black mistake {mv['san']} only costs {after-bestv}cp (Black best {b.san(info['pv'][0])})")
                else:
                    print(f"     trap ok {key} {mv['san']} costs Black {after-bestv}cp")
            b.push(m)
        else:
            e = ev(b)
            if e < END_MIN: errors.append(f"{lid}: line ends at {e}cp for White")
            print(f"  ok {lid:34s} plies={len(L['moves']):2d} end={e:+d}", flush=True)
    for qi, q in enumerate(ch["quiz"]):
        nq += 1
        where = f"{ch['id']} quiz {qi}"
        textcheck(where, q["prompt"] + q["explain"])
        try:
            b = chess.Board(q["fen"])
        except Exception:
            errors.append(f"{where}: bad fen"); continue
        if not b.is_valid(): errors.append(f"{where}: invalid position")
        infos = best_of(b, 8)
        sign = 1 if b.turn == chess.WHITE else -1
        vals = [(i["pv"][0].uci(), sign * i["score"].pov(chess.WHITE).score(mate_score=10000)) for i in infos]
        top = vals[0][1]
        for a in q["answer"]:
            try:
                m = chess.Move.from_uci(a)
            except Exception:
                errors.append(f"{where}: bad uci {a}"); continue
            if m not in b.legal_moves: errors.append(f"{where}: illegal answer {a}"); continue
            mv_vals = dict(vals)
            if a in mv_vals: v = mv_vals[a]
            else:
                b2 = b.copy(); b2.push(m); v = sign * ev(b2)
            if top - v > PLAN_MARGIN: errors.append(f"{where}: answer {a} ({v}) is {top-v}cp worse than best {vals[0][0]} ({top})")
        for u, v in vals:
            if top - v <= 40 and u not in q["answer"]:
                warns.append(f"{where}: engine move {u} ({v}) within 40cp of best not in answers {q['answer']}")
        print(f"  ok {where:34s} engine={vals} answers={q['answer']}", flush=True)
eng.quit()
for w in warns: print("WARN", w)
for e in errors: print("ERROR", e)
print(f"RESULT: {len(d['chapters'])} chapters, {nles} lessons, {nq} quiz positions, depth {DEPTH}, {len(errors)} errors, {len(warns)} warnings")
