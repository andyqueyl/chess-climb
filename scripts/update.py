#!/usr/bin/env python3
"""Pull Andy's chess.com games, run Stockfish over every one, and write the site data.

Usage:  python scripts/update.py            (incremental: only new games get analyzed)
        python scripts/update.py --redo     (re-analyze everything)

Writes data/games.json, data/my-puzzles.json, data/profile.json.
Cache of finished analysis lives in data/cache/analysis.json (keyed by game url).
"""
import io, json, math, os, re, shutil, sys, time, urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone

import chess, chess.engine, chess.pgn

USER = "xxrolypolyxx"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
CACHE = os.path.join(DATA, "cache", "analysis.json")
UA = {"User-Agent": "chess-climb personal tracker (github.com/andyqueyl/chess-climb)"}
DEPTH = 13          # per-ply eval depth for the whole game
PUZZLE_DEPTH = 18   # deeper multipv check for candidate puzzle positions
ANALYZE_VERSION = 3 # bump to force a re-run when the analysis logic changes

VAL = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}


def get(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return json.load(r)
        except Exception as e:
            if attempt == 3:
                raise
            time.sleep(2 + attempt * 3)


def win_pct(cp):
    """Lichess win-probability curve (cp from the mover's side)."""
    cp = max(-1500, min(1500, cp))
    return 50 + 50 * (2 / (1 + math.exp(-0.00368208 * cp)) - 1)


def move_accuracy(wp_before, wp_after):
    d = max(0.0, wp_before - wp_after)
    return max(0.0, min(100.0, 103.1668 * math.exp(-0.04354 * d) - 3.1669))


def score_cp(info_score, pov):
    """Centipawns from `pov` side, mates mapped to +-10000 (minus distance)."""
    s = info_score.pov(pov)
    if s.is_mate():
        m = s.mate()
        return (10000 - abs(m) * 10) * (1 if m > 0 else -1)
    return s.score()


def material(board, color):
    return sum(VAL[p.piece_type] for p in board.piece_map().values() if p.color == color)


def non_pawn_material(board):
    return sum(VAL[p.piece_type] for p in board.piece_map().values() if p.piece_type not in (chess.PAWN, chess.KING))


def phase_of(board, ply):
    if ply < 20:
        return "opening"
    if non_pawn_material(board) <= 20:
        return "endgame"
    return "middlegame"


def is_hanging(board, sq):
    """Piece on sq can be taken with profit (attacked and either undefended or attacked by something cheaper)."""
    p = board.piece_at(sq)
    if not p or p.piece_type == chess.KING:
        return False
    attackers = board.attackers(not p.color, sq)
    if not attackers:
        return False
    defenders = board.attackers(p.color, sq)
    if not defenders:
        return True
    cheapest = min(VAL[board.piece_at(a).piece_type] or 100 for a in attackers)
    return cheapest < VAL[p.piece_type]


def tag_best_move(board, move, pv_scores_mate):
    """Rough motif tags for the winning move in `board` (side to move = solver)."""
    tags = []
    me = board.turn
    moved = board.piece_at(move.from_square)
    captured = board.piece_at(move.to_square)
    if board.is_en_passant(move):
        captured = chess.Piece(chess.PAWN, not me)
    if pv_scores_mate:
        tags.append("mate")
    if board.gives_check(move):
        tags.append("check")
    if captured:
        if is_hanging(board, move.to_square) or VAL[captured.piece_type] > VAL[moved.piece_type]:
            tags.append("free-piece" if not board.attackers(not me, move.to_square) else "winning-capture")
    after = board.copy(stack=False)
    after.push(move)
    # fork: moved piece now attacks 2+ valuable targets (king counts)
    targets = []
    for sq in after.attacks(move.to_square):
        t = after.piece_at(sq)
        if t and t.color != me and (t.piece_type == chess.KING or VAL[t.piece_type] > VAL[moved.piece_type] or not after.attackers(not me, sq)):
            if t.piece_type != chess.PAWN:
                targets.append(t)
    if len(targets) >= 2:
        tags.append("fork")
    # discovered attack: a different piece of ours now attacks something big
    if not tags or tags == ["check"]:
        for sq, pc in after.piece_map().items():
            if pc.color == me and sq != move.to_square:
                for t_sq in after.attacks(sq):
                    t = after.piece_at(t_sq)
                    if t and t.color != me and t.piece_type in (chess.QUEEN, chess.ROOK, chess.KING) and not board.is_attacked_by(me, t_sq):
                        if "discovered" not in tags and t_sq not in board.attacks(sq):
                            tags.append("discovered")
    if move.promotion:
        tags.append("promotion")
    return tags or ["quiet-move"]


def parse_clocks(pgn_text):
    return [ _clk_to_s(m) for m in re.findall(r"\[%clk ([0-9:.]+)\]", pgn_text)]


def _clk_to_s(s):
    parts = [float(x) for x in s.split(":")]
    while len(parts) < 3:
        parts.insert(0, 0)
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def classify(drop):
    if drop >= 30: return "blunder"
    if drop >= 20: return "mistake"
    if drop >= 10: return "inaccuracy"
    return None


def analyze_game(engine, g):
    pgn = chess.pgn.read_game(io.StringIO(g["pgn"]))
    me_white = g["white"]["username"].lower() == USER
    me = chess.WHITE if me_white else chess.BLACK
    board = pgn.board()
    moves = list(pgn.mainline_moves())
    clocks = parse_clocks(g["pgn"])

    evals = []   # white-POV cp before each ply, plus final
    bests = []   # engine best move (uci) before each ply
    for i in range(len(moves) + 1):
        if board.is_game_over():
            if board.is_checkmate():
                evals.append(-10000 if board.turn == chess.WHITE else 10000)
            else:
                evals.append(0)
            bests.append(None)
        else:
            info = engine.analyse(board, chess.engine.Limit(depth=DEPTH, time=0.5))
            evals.append(score_cp(info["score"], chess.WHITE))
            bests.append(info["pv"][0].uci() if info.get("pv") else None)
        if i < len(moves):
            board.push(moves[i])

    board = pgn.board()
    plies, my_acc, opp_acc = [], [], []
    for i, mv in enumerate(moves):
        mover = board.turn
        sign = 1 if mover == chess.WHITE else -1
        wb, wa = win_pct(sign * evals[i]), win_pct(sign * evals[i + 1])
        drop = wb - wa
        cls = classify(drop) if bests[i] != mv.uci() else None
        acc = move_accuracy(wb, wa)
        (my_acc if mover == me else opp_acc).append(acc)
        san = board.san(mv)
        best_san = board.san(chess.Move.from_uci(bests[i])) if bests[i] else None
        plies.append({
            "san": san, "uci": mv.uci(), "eval": evals[i + 1],
            "best": best_san if bests[i] != mv.uci() else None,
            "cls": cls, "drop": round(drop, 1),
            "clk": clocks[i] if i < len(clocks) else None,
            "phase": phase_of(board, i),
        })
        board.push(mv)

    # missed wins: opponent blundered (my win% jumped >= 25) and my next move gave back >= 20
    for i, p in enumerate(plies):
        mover_is_me = (i % 2 == 0) == me_white
        if mover_is_me and i >= 1 and plies[i - 1]["cls"] in ("blunder", "mistake") and p["cls"] in ("blunder", "mistake"):
            p["missed"] = True

    def mean(a):
        return round(sum(a) / len(a), 1) if a else None

    return {"plies": plies, "evals": evals, "acc_me": mean(my_acc), "acc_opp": mean(opp_acc), "v": ANALYZE_VERSION}


def puzzle_candidates(engine, g, an, me_white):
    """Positions from my own games where there was a clearly best, winning move I didn't play."""
    pgn = chess.pgn.read_game(io.StringIO(g["pgn"]))
    board = pgn.board()
    out = []
    plies = an["plies"]
    for i, p in enumerate(plies):
        mover_is_me = (i % 2 == 0) == me_white
        if mover_is_me and p["cls"] in ("blunder", "mistake"):
            info = engine.analyse(board, chess.engine.Limit(depth=PUZZLE_DEPTH, time=1.5), multipv=3)
            if info and "pv" in info[0]:
                me = board.turn
                s1 = score_cp(info[0]["score"], me)
                s2 = score_cp(info[1]["score"], me) if len(info) > 1 else -10000
                best = info[0]["pv"][0]
                # A puzzle needs: the best move leaves me clearly better, it's clearly the best,
                # and it's not just "don't blunder" (I'm not already winning by a mile anyway).
                before_wp = win_pct(s1)
                if s1 >= 150 and (s1 - s2 >= 150 or (s1 >= 9000 and s2 < 9000)) and best.uci() != p["uci"]:
                    accept = [best.uci()] + [x["pv"][0].uci() for x in info[1:] if "pv" in x and score_cp(x["score"], me) >= 9000 and s1 >= 9000]
                    pv_board = board.copy(stack=False)
                    line = []
                    for mv in info[0]["pv"][:7]:
                        line.append(pv_board.san(mv))
                        pv_board.push(mv)
                    kind = "missed-win" if i >= 1 and plies[i - 1]["cls"] in ("blunder", "mistake") else "found-the-move"
                    out.append({
                        "id": f'{g["uuid"][:8]}-{i}',
                        "fen": board.fen(), "game": g["url"], "ply": i,
                        "solution": best.uci(), "accept": sorted(set(accept)),
                        "line": line, "played": p["san"],
                        "eval_best": s1, "eval_played": (1 if me == chess.WHITE else -1) * p["eval"],
                        "tags": tag_best_move(board, best, s1 >= 9000),
                        "kind": kind, "phase": p["phase"],
                        "date": g["end_time"], "time_class": g["time_class"],
                    })
        board.push(chess.Move.from_uci(p["uci"]))
    return out


def blunder_kind(board_before, move_uci, plies, i, me):
    """Why my blunder was bad: what the opponent's best reply exploits."""
    board = board_before
    mv = chess.Move.from_uci(move_uci)
    after = board.copy(stack=False)
    after.push(mv)
    nxt_eval = plies[i]["eval"] * (1 if me == chess.WHITE else -1)
    if nxt_eval <= -9000:
        return "allowed-mate"
    # Did I leave something hanging?
    for sq, pc in after.piece_map().items():
        if pc.color == me and pc.piece_type != chess.PAWN and is_hanging(after, sq):
            return "hung-piece"
    if board.is_capture(mv):
        return "bad-trade"
    # Ignored a threat: before my move, one of my pieces was already en prise
    for sq, pc in board.piece_map().items():
        if pc.color == me and pc.piece_type != chess.PAWN and is_hanging(board, sq):
            return "missed-threat"
    return "tactic-allowed"


_ENGINE = None


def _init_worker():
    global _ENGINE
    _ENGINE = chess.engine.SimpleEngine.popen_uci(shutil.which("stockfish") or "stockfish")
    _ENGINE.configure({"Threads": 1, "Hash": 64})
    # quit the engine before multiprocessing joins threads at worker exit (otherwise the pool hangs)
    import multiprocessing.util
    multiprocessing.util.Finalize(None, _ENGINE.quit, exitpriority=10)


def _analyze_one(g):
    engine = _ENGINE
    me_white = g["white"]["username"].lower() == USER
    an = analyze_game(engine, g)
    an["puzzles"] = puzzle_candidates(engine, g, an, me_white)
    board = chess.pgn.read_game(io.StringIO(g["pgn"])).board()
    me = chess.WHITE if me_white else chess.BLACK
    for i, p in enumerate(an["plies"]):
        if board.turn == me and p["cls"] == "blunder":
            p["why"] = blunder_kind(board, p["uci"], an["plies"], i, me)
        board.push(chess.Move.from_uci(p["uci"]))
    return an


def main():
    redo = "--redo" in sys.argv
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    cache = {} if redo or not os.path.exists(CACHE) else json.load(open(CACHE))

    archives = get(f"https://api.chess.com/pub/player/{USER}/games/archives")["archives"]
    games = []
    for a in archives:
        games += get(a)["games"]
        time.sleep(0.3)
    games = [g for g in games if g.get("rules") == "chess" and "pgn" in g]
    games.sort(key=lambda g: g["end_time"])
    stats = get(f"https://api.chess.com/pub/player/{USER}/stats")
    print(f"{len(games)} games, {sum(1 for g in games if g['url'] not in cache or cache[g['url']].get('v') != ANALYZE_VERSION)} to analyze")

    todo = [g for g in games if not (cache.get(g["url"]) and cache[g["url"]].get("v") == ANALYZE_VERSION)]
    workers = max(1, min(int(os.environ.get("WORKERS", (os.cpu_count() or 2) - 1)), len(todo) or 1))
    t0 = time.time()
    if todo:
        from concurrent.futures import ProcessPoolExecutor, as_completed
        with ProcessPoolExecutor(max_workers=workers, initializer=_init_worker) as pool:
            futs = {pool.submit(_analyze_one, g): g for g in todo}
            for n, f in enumerate(as_completed(futs)):
                g = futs[f]
                cache[g["url"]] = f.result()
                if n % 10 == 9 or n == len(todo) - 1:
                    json.dump(cache, open(CACHE, "w"))
                    print(f"  {n+1}/{len(todo)}  {time.time()-t0:.0f}s", flush=True)
    json.dump(cache, open(CACHE, "w"))

    build_outputs(games, cache, stats)


RESULT_WORDS = {"win": "win", "checkmated": "loss", "resigned": "loss", "timeout": "loss", "abandoned": "loss",
                "lose": "loss", "agreed": "draw", "repetition": "draw", "stalemate": "draw", "insufficient": "draw",
                "50move": "draw", "timevsinsufficient": "draw", "bughousepartnerlose": "loss", "kingofthehill": "loss",
                "threecheck": "loss"}


def opening_name(g):
    eco = g.get("eco") or ""
    name = eco.rstrip("/").split("/")[-1].replace("-", " ")
    name = re.sub(r"\s\d.*$", "", name).strip()  # drop move-number tail
    return name or "Unknown"


def opening_family(name):
    for key in ["Englund Gambit", "London System", "Jobava", "Queens Pawn", "Queens Gambit", "Scotch", "Italian",
                "Giuoco Piano", "Sicilian", "French", "Caro Kann", "Scandinavian", "Bishops Opening", "Kings Pawn",
                "Philidor", "Petrovs", "Ruy Lopez", "Four Knights", "Three Knights", "Vienna", "Birds", "Dutch",
                "Nimzowitsch Larsen", "Van t Kruijs", "Kings Indian", "English", "Pirc", "Alekhine", "Modern", "Slav", "Center Game",
                "Danish", "Kings Gambit", "Owens", "Indian Game", "Zukertort", "Mieses", "Van Geet", "Polish",
                "Two Knights", "Ponziani", "Elephant", "Latvian", "Bishops", "Horwitz", "Mikenas", "Nimzo", "Grob"]:
        if name.lower().startswith(key.lower()) or key.lower() in name.lower():
            return key
    return name.split(" ")[0] + " " + (name.split(" ")[1] if len(name.split(" ")) > 1 else "")


def build_outputs(games, cache, stats):
    out_games, puzzles = [], []
    for g in games:
        an = cache.get(g["url"])
        if not an:
            continue
        me_white = g["white"]["username"].lower() == USER
        mine, opp = (g["white"], g["black"]) if me_white else (g["black"], g["white"])
        res = RESULT_WORDS.get(mine["result"], "loss") if mine["result"] != "win" else "win"
        how = opp["result"] if res == "win" else mine["result"]
        my_plies = [p for i, p in enumerate(an["plies"]) if (i % 2 == 0) == me_white]
        counts = Counter(p["cls"] for p in my_plies if p["cls"])
        first_blunder = next((i for i, p in enumerate(an["plies"]) if (i % 2 == 0) == me_white and p["cls"] == "blunder"), None)
        tc = g.get("time_control", "")
        base = int(tc.split("+")[0]) if tc and tc.split("+")[0].isdigit() else None
        hdr = dict(re.findall(r'\[(\w+) "([^"]*)"\]', g["pgn"]))
        out_games.append({
            "id": g["uuid"][:8], "url": g["url"], "end": g["end_time"], "tc": tc, "base": base, "class": g["time_class"],
            "color": "white" if me_white else "black", "rating": mine["rating"], "opp": opp["username"], "opp_rating": opp["rating"],
            "result": res, "how": how, "opening": opening_name(g), "family": opening_family(opening_name(g)),
            "acc": an["acc_me"], "acc_opp": an["acc_opp"],
            "blunders": counts.get("blunder", 0), "mistakes": counts.get("mistake", 0), "inaccuracies": counts.get("inaccuracy", 0),
            "first_blunder_ply": first_blunder, "moves": math.ceil(len(an["plies"]) / 2),
            "start": hdr.get("FEN") if hdr.get("SetUp") == "1" else None,
            "plies": an["plies"],
        })
        for pz in an.get("puzzles", []):
            puzzles.append(pz)

    json.dump(out_games, open(os.path.join(DATA, "games.json"), "w"), separators=(",", ":"))
    json.dump(puzzles, open(os.path.join(DATA, "my-puzzles.json"), "w"), separators=(",", ":"))
    json.dump(build_profile(out_games, stats), open(os.path.join(DATA, "profile.json"), "w"), indent=1)
    print(f"wrote {len(out_games)} games, {len(puzzles)} puzzles from your own games")


def build_profile(games, stats):
    def rate(sub):
        n = len(sub)
        if not n:
            return None
        w = sum(1 for g in sub if g["result"] == "win"); d = sum(1 for g in sub if g["result"] == "draw")
        return {"n": n, "w": w, "d": d, "l": n - w - d, "score": round((w + d / 2) / n * 100, 1),
                "acc": round(sum(g["acc"] or 0 for g in sub) / n, 1),
                "bpg": round(sum(g["blunders"] for g in sub) / n, 2)}

    prof = {"user": USER, "updated": datetime.now(timezone.utc).isoformat(timespec="minutes"),
            "ratings": {k.replace("chess_", ""): {"now": v["last"]["rating"], "best": v.get("best", {}).get("rating")}
                        for k, v in stats.items() if k.startswith("chess_") and isinstance(v, dict) and "last" in v},
            "by_class": {}, "openings": {}, "blunder_why": {}, "blunder_phase": {}, "losses_how": {}, "time_trouble": {}}
    for cls in sorted({g["class"] for g in games}):
        sub = [g for g in games if g["class"] == cls]
        prof["by_class"][cls] = {"all": rate(sub), "white": rate([g for g in sub if g["color"] == "white"]),
                                 "black": rate([g for g in sub if g["color"] == "black"])}
        fam = defaultdict(list)
        for g in sub:
            fam[(g["color"], g["family"])].append(g)
        prof["openings"][cls] = sorted([{"color": c, "family": f, **rate(v)} for (c, f), v in fam.items()], key=lambda x: -x["n"])
        why, phase = Counter(), Counter()
        tt = {"blunders_low_clock": 0, "blunders_total": 0}
        for g in sub:
            mw = g["color"] == "white"
            for i, p in enumerate(g["plies"]):
                if (i % 2 == 0) == mw and p["cls"] == "blunder":
                    why[p.get("why", "tactic-allowed")] += 1
                    phase[p["phase"]] += 1
                    tt["blunders_total"] += 1
                    if p["clk"] is not None and g["base"] and p["clk"] < max(30, g["base"] * 0.1):
                        tt["blunders_low_clock"] += 1
        prof["blunder_why"][cls] = dict(why)
        prof["blunder_phase"][cls] = dict(phase)
        prof["losses_how"][cls] = dict(Counter(g["how"] for g in sub if g["result"] == "loss"))
        prof["time_trouble"][cls] = tt
    return prof


if __name__ == "__main__":
    main()
