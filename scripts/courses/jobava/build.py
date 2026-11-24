import json, sys
from lib import L, Q, MISTAKES

OUT = sys.argv[1]
chapters = []

# ---------------------------------------------------------------- 1
chapters.append({
 "id": "setup-and-big-ideas",
 "title": "The Setup and the Big Ideas",
 "summary": "What the Jobava London is, how you get there from your normal London, and the three attacking ideas you will use in every game.",
 "lessons": [
  L("from-your-london", "Getting there from your London",
    ["The Jobava London is just your London with the queen's knight on **c3** instead of d2. That one change makes it way more aggressive.",
     "You already play 1.d4 and an early Bf4, so you can reach it with 1.d4 d5 2.Bf4 Nf6 3.Nc3 or 1.d4 d5 2.Nc3 Nf6 3.Bf4. Same position, same plans."],
    "d4 d5 Bf4 {Your usual London start.} Nf6 Nc3 {This is the Jobava move. The knight eyes **b5**, from where it hits c7.} e6 "
    "Nb5 {The signature jump. It threatens Nxc7+, forking king and rook.} Na6 {The normal defense: the knight guards c7.} "
    "e3 {Opens the diagonal for your light bishop and supports d4.} Be7 Nf3 O-O Bd3 {Bishop aims at h7, right at Black's castled king.} c5 "
    "c3 {Keeps the d4 pawn solid and gives the b5 knight a retreat square later.}",
    ["Knight to **c3** (not d2) is the whole difference from a normal London.",
     "**Nb5** hits c7. Black usually has to spend a move like ...Na6 or ...c6 to deal with it.",
     "Pieces go to the same homes every game: e3, Nf3, Bd3, c3."]),
  L("nb5-in-action", "Nb5 in action vs an early ...Qb6",
    ["At 1100, Black loves to hit b2 with ...Qb6. In the Jobava you have a cool answer: **Nb5**, which blocks the queen's view of b2 and attacks c7 at the same time.",
     "Then **a4** gives the knight a permanent home and threatens a4-a5 to kick the queen."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 {Simple and solid. Don't rush into tactics yet.} Qb6 {Attacking b2.} "
    "Nb5 {Now the b-file is blocked, and Nc7+ is a threat.} Na6 {Only good defense: the knight covers c7.} "
    "a4 {Supports the knight and gets ready for a5, kicking the queen.} e6 Nf3 Be7 c3 {Your knight can always drop back to d4 or a3 if needed.} O-O "
    "h4 {A Jobava favorite. Even after Black castles, the h-pawn can march and help an attack.}",
    ["Answer ...Qb6 with **Nb5**: it blocks the b-file and hits c7.",
     "**a4** props up the knight and threatens a5 against the queen.",
     "dxc5 is also a fine answer to ...Qb6 if you prefer simple chess."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 Nbd7", "White to move. Black's knight just went to d7. What's the most annoying move for Black?",
    ["c3b5"], "**Nb5!** With the knight on d7, nothing guards c7 well. Black has no comfortable way to stop Nxc7+."),
  Q("d4 d5 Nc3 Nf6 Bf4 c5 e3 Qb6", "White to move. Black is attacking b2. Find a good answer.",
    ["c3b5", "d4c5"], "**Nb5** blocks the b-file and hits c7, or **dxc5** simply takes the pawn. Both are good."),
 ],
})

# ---------------------------------------------------------------- 2
chapters.append({
 "id": "vs-e6",
 "title": "vs ...d5, ...Nf6, ...e6",
 "summary": "The most common setup you'll face. Learn the Nb5 / ...Na6 main line, what to do when Black kicks your knight, and the ...Bd6 trade.",
 "lessons": [
  L("e6-main-line", "Main line: Nb5 and ...Na6",
    ["Black plays the classic solid setup with ...e6. You jump **Nb5** right away, and most players defend with ...Na6.",
     "The knight on a6 is a little offside, which is a small win for you. Then you develop normally and aim your pieces at Black's king."],
    "d4 d5 Nc3 Nf6 Bf4 e6 Nb5 {Hits c7 immediately.} Na6 e3 Be7 Nf3 O-O Bd3 c5 c3 {Holds d4 and gives the queen's bishop a safe home.} "
    "c4 {Black gains space and kicks your bishop.} Bb1 {Keep the bishop on the **b1-h7 diagonal**, pointing at h7.} "
    "Bd7 {Black wants to trade off your strong knight.} a4 {If ...Bxb5 then axb5 opens the a-file for your rook and kicks the a6 knight.}",
    ["After ...c4, retreat the bishop to **b1 or c2**, not e2. It belongs on the diagonal toward h7.",
     "**a4** supports the b5 knight. If Black trades it, axb5 hits the a6 knight.",
     "Later plans: **Ne5**, **Qc2** (battery at h7), and the e3-e4 break."]),
  L("e6-c6-kick", "Black kicks the knight with ...c6",
    ["Sometimes Black plays ...Na6 and then ...c6 to kick your knight back. That costs Black time, but it is not a mistake.",
     "Here is a nice trick: once your knight retreats to c3, the a6 knight is loose. **Bxa6** wrecks Black's pawns."],
    "d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Na6 e3 c6 {Kicking the knight.} Nc3 {Just go back. Your knight did its job: Black's knight is on a6.} Be7 "
    "Bxa6 {Trade bishop for knight and give Black **doubled a-pawns**.} bxa6 Nf3 O-O O-O",
    ["When Black's knight sits on a6, **Bxa6** gives Black ugly doubled pawns.",
     "Retreating Nb5-c3 is totally fine. You don't lose anything.",
     "Later, Black's queenside pawns are weak targets for your queen and rooks."]),
  L("e6-bd6-trade", "Black offers ...Bd6",
    ["A natural 1100 move is ...Bd6, offering to trade bishops. With the knight on b5, you can just take it: **Nxd6+**.",
     "You win the **bishop pair** (two bishops vs bishop and knight), and Black gets a clumsy pawn on d6."],
    "d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Bd6 Nxd6+ {Grab the bishop. Your knight was going to be traded anyway.} cxd6 e3 O-O c3 Re8 Bd3 e5 "
    "Bg3 {Keep the bishop. It pressures the d6 and e5 pawns.}",
    ["vs ...Bd6, play **Nxd6+** and enjoy the two bishops.",
     "Black's pawn on d6 can become a target later.",
     "Keep your dark bishop: drop it back to g3 if it gets hit."]),
  L("e6-bb4-check", "Black gives a check on b4",
    ["Some players throw in ...Bb4+ after ...Na6. Just block with **c3**. Now the bishop has to move again, so Black wasted time.",
     "Don't panic about checks. Block with a pawn when it also helps your position."],
    "d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Na6 e3 Bb4+ c3 {Blocks the check and gains time on the bishop.} Be7 Nf3 O-O Bd3 c5 "
    "h4 {Stockfish likes this. With Black's king on g8, the h-pawn can become a battering ram.}",
    ["Meet ...Bb4+ with **c3**: it blocks and kicks the bishop.",
     "c3 was a move you wanted anyway, so Black's check just helped you."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Na6 e3 Be7 Nf3 O-O Bd3 c5 c3 c4", "White to move. Your bishop is attacked. Where should it go?",
    ["d3b1", "d3c2"], "Keep it on the **b1-h7 diagonal**: Bb1 or Bc2. Be2 is passive and lets Black off the hook."),
  Q("d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Bd6", "White to move. Black offers a bishop trade. What's the most direct answer?",
    ["b5d6", "e2e3"], "**Nxd6+** wins the bishop pair and leaves Black with a pawn on d6. Calm e3 is also fine."),
 ],
})

# ---------------------------------------------------------------- 3
chapters.append({
 "id": "vs-c5",
 "title": "vs 3...c5",
 "summary": "When Black hits back with ...c5, play e3 first. Then watch for Nb5 tricks, especially if Black puts a knight on c6.",
 "lessons": [
  L("c5-nc6-punish", "...c5 and ...Nc6? Punish with Nb5!",
    ["After 3...c5 4.e3, the most natural move is ...Nc6. But it's actually a mistake: **Nb5!** and Black can't cover c7 well.",
     "Stockfish says White is clearly better in every line. Black's best try is ...e5, and even then you come out ahead."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 {Always e3 first vs ...c5. Nb5 before e3 is a mistake: ...Qa5+ hits your king and the b5 knight.} ~100:Nc6 "
    "Nb5 {Threatens Nc7+. Black has no good defense.} e5 {Best try: counterattack.} dxe5 Qa5+ Qd2 Qxd2+ Kxd2 Ne4+ Ke1 g5 "
    "f3 {Kick the knight. Don't worry about the bishop yet.} gxf4 fxe4 fxe3 Nc7+ {Here comes the fork.} Kd8 Nxa8 {You win a whole rook.}",
    ["vs ...c5, play **e3** first, then look for Nb5.",
     "If Black plays ...Nc6 before dealing with c7, **Nb5** is very strong.",
     "Stay calm in the tactics. The Nc7+ fork is your goal."]),
  L("c5-cxd4-bf5", "...cxd4 exd4 ...Bf5",
    ["If Black trades on d4, take back with the **e-pawn**: exd4. Now your light bishop and queen are free.",
     "If Black then develops ...Bf5, the c7 square is weak again. Jump in with **Nb5**."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 cxd4 exd4 {Always recapture with the pawn.} Bf5 Nb5 {Threat: Nc7+.} Na6 "
    "Nf3 e6 c3 {Solid. The knight now has a retreat on a3 if it gets kicked.}",
    ["Recapture **exd4** to open lines for your pieces.",
     "When Black's bishop leaves c8 and the queen can't cover c7, **Nb5** gets stronger.",
     "Black has an isolated-ish center to deal with. Your pieces are active."]),
  L("c5-a6", "...cxd4 and ...a6 (stopping Nb5)",
    ["Smart players stop Nb5 with ...a6. That's fine. You just develop normally: Nf3, Be2, O-O.",
     "Don't force anything here. The position is equal, and you play for good piece placement and Ne5."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 cxd4 exd4 a6 {Takes away b5 from your knight.} Nf3 Nc6 "
    "Be2 {Simple. From e2 the bishop also guards f3, so ...Bg4 isn't scary.} Bg4 O-O e6 "
    "h3 {Ask the bishop. If it takes on f3, you get the bishop pair.} Bxf3 Bxf3 Bd6",
    ["...a6 stops Nb5, so switch to normal development.",
     "**h3** questions the g4 bishop. Getting the two bishops is a small plus.",
     "Plans: Ne2-c1 or Re1, and the knight jump to e5 when possible."]),
  L("c5-e6-solid", "...c5 and ...e6 (the solid way)",
    ["Black plays ...c5 and ...e6 together. Nb5 still works. Black defends with ...Na6, just like in chapter 2.",
     "Then **c3**, Nf3, Bd3 and you get your favorite setup."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 e6 Nb5 Na6 c3 Be7 Nf3 O-O Bd3 {Bishop to its best diagonal.} Bd7 "
    "a4 {Same idea as before: support the knight, and recapture axb5 if Black trades.}",
    ["Same setup as the ...e6 main line: Nb5, c3, Nf3, Bd3.",
     "**a4** is the standard answer to ...Bd7."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 c5 e3 Nc6", "White to move. Black's last move was a mistake. Punish it!",
    ["c3b5"], "**Nb5!** threatens Nc7+. Black can't defend c7 comfortably, and Stockfish gives White a big edge."),
  Q("d4 d5 Nc3 Nf6 Bf4 c5 e3 cxd4 exd4 Bf5", "White to move. Find the strongest move.",
    ["c3b5"], "**Nb5** hits c7 now that the c8 bishop has left. Black has to play the awkward ...Na6."),
  Q("d4 d5 Nc3 Nf6 Bf4 c5 e3 Nc6 Nb5 e6", "White to move. Win material!",
    ["b5c7"], "**Nc7+** forks the king and the a8 rook."),
 ],
})

# ---------------------------------------------------------------- 4
chapters.append({
 "id": "vs-bf5",
 "title": "vs ...Bf5 setups",
 "summary": "When Black copies your London with ...Bf5, chase the bishop with f3, g4 and h4. Know the ...c5 counter too.",
 "lessons": [
  L("bf5-f3-g4-h4", "Chasing the bishop: f3, g4, h4",
    ["When Black develops ...Bf5, you can go after it with **f3 and g4**. The bishop runs to g6, and then **h4-h5** keeps chasing it.",
     "Stockfish calls these positions about equal, but they are sharp and Black has to be careful. Great for 10-minute games."],
    "d4 d5 Nc3 Nf6 Bf4 Bf5 f3 {Prepares g4 and e4.} e6 g4 {Kicks the bishop.} Bg6 h4 {Threat: h5, trapping the bishop.} h5 "
    "g5 {Kick the f6 knight too.} Nfd7 e4 {Now you grab the center while Black's pieces are pushed back.}",
    ["**f3, g4, h4** chases the f5 bishop.",
     "If Black stops h5 with ...h5, push **g5** to kick the knight.",
     "**e4** next, while Black's pieces are passive."]),
  L("bf5-h6", "If Black plays ...h6 instead",
    ["Black can make room for the bishop with ...h6. Then you push **h5** anyway and the bishop has to hide on h7.",
     "A bishop on h7 behind its own pawns is out of play for a long time."],
    "d4 d5 Nc3 Nf6 Bf4 Bf5 f3 e6 g4 Bg6 h4 h6 h5 {Push it all the way.} Bh7 "
    "e3 {Calm. Develop and remember Black's bishop is buried on h7.}",
    ["vs ...h6, push **h5** and bury the bishop on h7.",
     "Your kingside pawns take space. Castle queenside later."]),
  L("bf5-c5-e4", "Black hits back with ...c5",
    ["After 4.f3, Black can counter with ...c5. Play **e4!** and if ...dxe4, push **d5** for a big center.",
     "Then **Qd2 and O-O-O** to connect your pieces fast."],
    "d4 d5 Nc3 Nf6 Bf4 Bf5 f3 c5 e4 {Strike in the center.} dxe4 d5 {Space! Your d-pawn cramps Black.} Nbd7 Qd2 h6 "
    "O-O-O {King safe, rook on the d-file behind your pawn.}",
    ["vs ...c5, play **e4** and then **d5**.",
     "**Qd2 + O-O-O** gets your rook to the d-file quickly."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 Bf5 f3 e6 g4 Bg6 h4 h5", "White to move. Black stopped h5. What's the next aggressive push?",
    ["g4g5"], "**g5** kicks the f6 knight back. Then e4 grabs the center."),
 ],
})

# ---------------------------------------------------------------- 5
chapters.append({
 "id": "vs-kings-indian",
 "title": "vs King's Indian and ...g6",
 "summary": "When Black fianchettoes, play Qd2, castle long, trade bishops with Bh6 and throw the h-pawn at Black's king.",
 "lessons": [
  L("kid-qd2-ooo", "The attack: Qd2, O-O-O, Bh6",
    ["Against ...g6 and ...Bg7, grab the center with **e4** first. Then the plan is famous and simple: **Qd2, Bh6** to trade off Black's best defender, **O-O-O**, then **h4-h5**.",
     "Black usually attacks on the queenside with ...b5. It's a race, and your attack usually lands first."],
    "d4 Nf6 Nc3 g6 Bf4 Bg7 e4 {Take the center first. Stockfish likes this more than an instant Qd2.} d6 Qd2 {Queen and bishop team up to play Bh6.} O-O O-O-O {Castle long. Your king goes away from the attack.} "
    "c6 Bh6 {Trade off the g7 bishop, the key defender of Black's king.} b5 f3 {Solid: protects e4 and supports g4 later.} Qa5 "
    "h4 {The h-pawn storm begins. h5 is next.}",
    ["**Qd2 + Bh6** trades off Black's fianchetto bishop.",
     "Castle **queenside**, then push **h4-h5** to open the h-file.",
     "f3 keeps e4 safe so you can focus on attacking."]),
  L("kid-d5-e5", "Black plays ...d5: push e5",
    ["Sometimes Black castles and then hits your center with ...d5. Push **e5** and kick the f6 knight.",
     "The knight usually goes to h5, where it can get trapped by g4!"],
    "d4 Nf6 Nc3 g6 Bf4 Bg7 Qd2 O-O e4 d5 e5 {Kick the knight.} Nh5 Be3 {Keep the bishop away from the knight.} c5 "
    "h3 {Threat: g4, trapping the h5 knight.} cxd4 Bxd4",
    ["vs ...d5, push **e5** to kick the knight.",
     "A knight on h5 can get trapped by **g4**.",
     "Your space on the kingside is perfect for an attack."]),
  L("g6-h4-h5", "vs ...d5 and ...g6: the h-pawn storm",
    ["When Black plays ...d5, ...Nf6 and ...g6, you can attack before Black even finishes developing: **h4-h5**.",
     "After hxg6, your rook on h1 is already on the open h-file."],
    "d4 d5 Nc3 Nf6 Bf4 g6 e3 Bg7 h4 {Straight at the king.} O-O h5 {Pressure on g6.} c5 hxg6 {Open the h-file.} hxg6 "
    "Qd2 {Next is Bh6 to trade off the g7 bishop.} Nc6 O-O-O Qa5 a3 {Stops ...Nb4 and protects your king's pawn cover.} Rd8 "
    "Bh6 {Trade the defender. Now Qh2 or Qg5 ideas follow.}",
    ["Push **h4-h5** early, even if Black has castled.",
     "**hxg6** opens the h-file for your rook.",
     "**Bh6** trades off the g7 bishop and weakens Black's king."]),
 ],
 "quiz": [
  Q("d4 Nf6 Nc3 g6 Bf4 Bg7 e4 d6 Qd2 O-O O-O-O c6", "White to move. Start your attack. Find a good move.",
    ["f4h6", "f2f3", "h2h4", "c1b1", "g1f3"], "**Bh6** trades the key defender, and f3 or h4 push the attack. Kb1 and Nf3 are fine too, but Bh6 is the most direct."),
  Q("d4 Nf6 Nc3 g6 Bf4 Bg7 Qd2 O-O e4 d5 e5 Nh5", "White to move. Your bishop is attacked by the h5 knight. Where should it go?",
    ["f4e3", "f4h6"], "**Be3** keeps the bishop safe and sets up h3 and g4 against the knight. **Bh6** to trade bishops is also good."),
 ],
})

# ---------------------------------------------------------------- 6
chapters.append({
 "id": "vs-c6",
 "title": "vs ...c6 (Slav setups)",
 "summary": "Slav players put their bishop on f5 or g4. Kick it with f3 and g4, or keep it calm with Bd3.",
 "lessons": [
  L("slav-bf5-storm", "...c6 and ...Bf5: the pawn storm",
    ["Same plan as the ...Bf5 chapter: **f3, g4, h4**. With ...c6 instead of ...e6, Black has even less play in the center.",
     "After Black's knight goes to d7, bring your king's knight out via **h3**, heading to f4."],
    "d4 d5 Nc3 Nf6 Bf4 c6 e3 Bf5 f3 e6 g4 Bg6 h4 h5 g5 Nfd7 "
    "Nh3 {The knight heads to f4, where it hits the g6 bishop and the e6 pawn.}",
    ["f3, g4, h4, g5: chase both the bishop and the knight.",
     "**Nh3-f4** is the knight's best route here."]),
  L("slav-bg4-chase", "...c6 and ...Bg4",
    ["If the bishop goes to g4, kick it with **f3**. After ...Bh5, **g4** and the bishop runs to g6.",
     "Then h4-h5 or g5 and Black's pieces get pushed around. Stockfish rates White clearly better here."],
    "d4 d5 Nc3 Nf6 Bf4 c6 e3 Bg4 f3 {Kick it.} Bh5 g4 Bg6 h4 {Threat: h5 trapping the bishop.} h5 "
    "g5 {Now the f6 knight has to go backward.}",
    ["vs ...Bg4, play **f3** then **g4**.",
     "Black's pieces get pushed to bad squares. Take space and attack."]),
  L("slav-calm-bd3", "The calm option: Bd3",
    ["If you don't want a wild pawn storm, just offer a bishop trade with **Bd3**. After Qxd3, your queen and pieces are nicely placed.",
     "This is equal and simple. Good for when you're low on time."],
    "d4 d5 Nc3 Nf6 Bf4 c6 e3 Bf5 Bd3 {Offer the trade.} Bxd3 Qxd3 e6 Nf3 Nbd7 O-O",
    ["**Bd3** is a safe way to deal with ...Bf5.",
     "Then simple development and castle short."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 c6 e3 Bf5 f3 e6 g4 Bg6 h4 h5", "White to move. Black stopped h5. What's the next push?",
    ["g4g5"], "**g5!** kicks the f6 knight back to d7. Black's pieces keep getting pushed around."),
 ],
})

# ---------------------------------------------------------------- 7
chapters.append({
 "id": "odd-stuff",
 "title": "Weird Stuff at 1100",
 "summary": "...Nc6, ...e6 with ...Bb4, the Dutch, early ...e5 breaks and ...a6. What to do when Black doesn't play the book.",
 "lessons": [
  L("nc6-e5-break", "1...Nc6 and an early ...e5",
    ["Some players go 1...Nc6 and 2...d5, then push ...e5 to break your center. Just take with the bishop: **Bxe5**.",
     "You win a pawn. Stockfish says Black gets enough activity to make it about equal, so just develop and stay safe."],
    "d4 Nc6 Nc3 d5 Bf4 e5 {A gambit-ish break.} Bxe5 {Take with the bishop. dxe5 is worse.} Nxe5 dxe5 d4 "
    "Ne4 {Knight to a central square.} Bf5 Nd2 {Safe square. Next you develop with Ngf3 and keep the pawn.}",
    ["vs an early ...e5, **Bxe5** wins a pawn.",
     "Don't get greedy after that. Just develop and keep things safe."]),
  L("nc6-e5-d5", "1...Nc6 2.Nc3 e5",
    ["If Black plays ...e5 on move 2, the simplest answer is **d5**, kicking the knight.",
     "The knight has to go backward, and you follow with e4 for a big center."],
    "d4 Nc6 Nc3 e5 d5 {Kick the knight. It has no great square.} Nce7 e4 {Big center.} Nf6 Nf3 d6",
    ["vs 2...e5, push **d5** and then **e4**.",
     "dxe5 is also fine, but d5 is easy to play."]),
  L("e6-bb4", "1...e6 2.Nc3 Bb4",
    ["After 1...e6 2.Nc3, Black might pin your knight with ...Bb4. Ask it right away with **a3**.",
     "If Black takes on c3, you get the two bishops and a strong pawn center."],
    "d4 e6 Nc3 Bb4 a3 {Ask the question.} Bxc3+ bxc3 {You get two bishops.} d5 Nf3 Nf6 e3 O-O c4 {Use your center pawns.}",
    ["vs ...Bb4, play **a3** and take the bishop pair if offered.",
     "After bxc3, push **c4** to put your center pawns to work.",
     "If Black plays 2...d5 instead, just play 3.Bf4 and you're back in chapter 2."]),
  L("dutch", "The Dutch: 1...f5",
    ["Against 1...f5, the Jobava setup works great. Same moves: Nc3, Bf4, and **Nb5** if Black plays ...e6.",
     "Black's pawn on f5 weakens the e6 and e5 squares, so your pieces have nice homes."],
    "d4 f5 Nc3 Nf6 Bf4 e6 Nb5 {Same trick: hitting c7.} Na6 e3 Be7 Nf3 O-O Be2 {Simple development.}",
    ["vs the Dutch, keep the same setup: **Nc3, Bf4, Nb5**.",
     "The **e5** square is a great spot for your knight later."]),
  L("d6-e5-break", "1...Nf6 2.Nc3 d6 3.Bf4 e5",
    ["Black plays ...d6 and then ...e5. Take it: **dxe5**. The most common reply is ...Ng4, hitting e5, but you still come out a pawn up.",
     "If Black takes back with ...dxe5, see the traps chapter: you trade queens and win the e5 pawn."],
    "d4 Nf6 Nc3 d6 Bf4 ~80:e5 {A mistake, but a common one.} dxe5 {Take!} Ng4 {Hits e5. Stockfish slightly prefers ...Nh5, but White is better either way.} exd6 Bxd6 Bxd6 cxd6 "
    "Qd2 {Develop and keep the extra pawn.} Nc6 f3 {Kick the knight.} Nge5 e4",
    ["vs ...d6 + ...e5, play **dxe5**.",
     "After ...Ng4, trade on d6 and keep your extra pawn.",
     "**f3** kicks the g4 knight."]),
  L("a6-anti-nb5", "Black plays ...a6 early",
    ["...a6 stops Nb5. Smart, but it costs a move. Just develop normally: e3, Nf3, Be2, O-O.",
     "Later the **Ne5** jump is a good plan."],
    "d4 d5 Nc3 Nf6 Bf4 a6 e3 e6 Nf3 c5 Be2 b5 O-O c4 Ne5 {A strong central knight.}",
    ["If Black stops Nb5 with ...a6, don't force it. Just develop.",
     "**Ne5** is your best knight square in quiet lines."]),
 ],
 "quiz": [
  Q("d4 Nc6 Nc3 d5 Bf4 e5", "White to move. Black pushed ...e5. Take it, but with what?",
    ["f4e5"], "**Bxe5!** wins a pawn. After dxe5, Black plays ...d4, kicks your knight and is fine."),
  Q("d4 Nc6 Nc3 e5", "White to move. Black hit your center. Find a good reply.",
    ["d4e5", "d4d5", "g1f3", "e2e3"], "**d5** kicks the knight, or **dxe5** grabs the pawn. Calm moves like Nf3 or e3 are fine too."),
 ],
})

# ---------------------------------------------------------------- 8
chapters.append({
 "id": "englund-gambit",
 "title": "The Englund Gambit (1.d4 e5)",
 "summary": "Take the pawn, then know the one big trap: after ...Qb4+ Bd2 ...Qxb2, play Nc3, never Bc3.",
 "lessons": [
  L("englund-main-trap", "...Qe7, ...Qb4+ and the b2 grab",
    ["The Englund trap: 1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4 Qb4+ 5.Bd2 Qxb2 and now the natural **6.Bc3??** loses to **...Bb4!** If 7.Qd2, then ...Bxc3 8.Qxc3 Qc1# is checkmate.",
     "The right move is **6.Nc3!** It defends everything, and Black's queen is the one in trouble."],
    "d4 e5 dxe5 {Take the pawn.} Nc6 Nf3 {Protect e5.} Qe7 Bf4 {Protect e5 again.} Qb4+ Bd2 {Block with the bishop.} Qxb2 "
    "Nc3 {The key move, NOT Bc3. Rb1 is coming next to hit the queen.} Bb4 Rb1 {Hit the queen.} Qa3 "
    "Nd5 {Threat: Nxc7+, and Black's bishop on b4 is loose.} Ba5 e4 Nge7 Be2 O-O O-O {You're up material with a huge lead in development.}",
    ["After ...Qxb2, play **Nc3!**, never Bc3.",
     "**Rb1** chases the queen. **Nd5** threatens Nxc7+.",
     "The mate pattern to remember: ...Bb4 pins, then ...Qc1#."]),
  L("englund-simple", "The simple way: 4.Nc3",
    ["If you don't want any ...Qb4+ stuff, play **4.Nc3** instead of Bf4. Black takes back the pawn, but you get a big center with e4.",
     "Stockfish rates this clearly better for White, and it's easy to play."],
    "d4 e5 dxe5 Nc6 Nf3 Qe7 Nc3 {Develop and protect against ...Qb4+ ideas.} Nxe5 e4 {Big center. Black's queen blocks the f8 bishop.} d6 "
    "Bf4 c6 Qd2 {Get ready to castle long.} Nf6 O-O-O",
    ["**4.Nc3** avoids the trap completely.",
     "Black's queen on e7 blocks their own bishop. Take the center with **e4**.",
     "Castle **queenside** and attack."]),
  L("englund-d6", "Englund with ...d6",
    ["Some players offer a second pawn with ...d6. Just take it: **exd6**. Black's bishop recaptures, and you're simply a pawn up.",
     "Then **Nc3** and Nb5 ideas, hitting the d6 bishop and c7. Feels like home, right?"],
    "d4 e5 dxe5 Nc6 Nf3 d6 exd6 {Take it. You're a pawn up.} Bxd6 Nc3 Nf6 Nb5 {Jobava style: hitting the bishop and c7.} O-O c3 a5 "
    "Nxd6 {Grab the bishop pair.} cxd6 Bg5",
    ["vs ...d6, just **exd6**. You're a clean pawn up.",
     "**Nb5** hits the d6 bishop and c7. Trade it off for the bishop pair."]),
 ],
 "quiz": [
  Q("d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2", "White to move. Black just grabbed b2. There is only one good move. Find it!",
    ["b1c3"], "**Nc3!** Every other move is bad. 6.Bc3?? runs into ...Bb4! and Qd2 allows ...Bxc3 Qxc3 Qc1#."),
  Q("d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Nc3 Bb4 Rb1 Qa3", "White to move. Black's queen and bishop are on the queenside. Find the strongest move.",
    ["c3d5"], "**Nd5!** threatens Nxc7+ and attacks the b4 bishop. Black's pieces are way out of position."),
  Q("d4 e5 dxe5 Nc6 Nf3 Qe7", "White to move. How do you protect your extra e5 pawn?",
    ["c1f4", "c1g5", "b1c3"], "**Bf4** protects e5, **Bg5** hits the queen, and **Nc3** develops safely. All are good."),
 ],
})

# ---------------------------------------------------------------- 9
chapters.append({
 "id": "traps-and-tricks",
 "title": "Traps and Tricks",
 "summary": "Short lines where Black's natural move loses material. Each mistake here is confirmed by Stockfish.",
 "lessons": [
  L("trap-nbd7-fork", "...Nbd7? and the Nc7+ fork",
    ["After 3.Bf4, ...Nbd7 looks normal, but it blocks the queen's protection of c7. **Nb5!** and c7 is in big trouble.",
     "If Black plays the natural ...e6, **Nxc7+** wins the rook."],
    "d4 d5 Nc3 Nf6 Bf4 ~60:Nbd7 {A mistake: now the queen on d8 can't easily help c7.} Nb5 {Threat: Nxc7+.} ~300:e6 {Black doesn't see it.} "
    "Nxc7+ {Fork!} Ke7 Nxa8 {You won a rook.}",
    ["When Black's knight goes to **d7**, always check **Nb5**.",
     "Nxc7+ forks the king and the a8 rook."]),
  L("trap-nc6-e6-fork", "...Nc6 and ...e6? Nc7+",
    ["This is the line from chapter 3 where Black doesn't find ...e5. After **Nb5**, the natural ...e6 drops the rook."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 ~100:Nc6 Nb5 ~200:e6 {Natural, but it loses.} Nc7+ Ke7 Nxa8",
    ["After ...Nc6, **Nb5** threatens Nc7+.",
     "Black needs a real answer. ...e6 isn't one."]),
  L("trap-qb6-e5", "...Qb6, Nb5, ...e5?",
    ["After ...Qb6 Nb5, some players push ...e5 to hit your bishop. But **dxe5** and now if ...Ne4, **Qxd5** wins big.",
     "The d5 pawn was only guarded by the f6 knight. Once it moves, the pawn falls with tempo."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 Qb6 Nb5 ~150:e5 {Looks active but it's a mistake.} dxe5 {Hits the knight.} ~150:Ne4 "
    "Qxd5 {Grab the pawn and hit the e4 knight.} a6 Nc7+ {Fork!} Qxc7 Qxe4 {You win material.}",
    ["vs ...e5 here, **dxe5** is strong.",
     "Watch for **Qxd5** when the d5 pawn loses its defender."]),
  L("trap-qa5-bf5-bc7", "...Qa5+ c3 ...Bf5? Bc7!",
    ["After ...Nc6 Nb5, Black might check with ...Qa5+. Block with **c3**. If Black then develops ...Bf5, **Bc7!** hits the queen, and Black can't untangle without losing material.",
     "Stockfish says White is completely winning after Bc7."],
    "d4 d5 Nc3 Nf6 Bf4 c5 e3 ~100:Nc6 Nb5 Qa5+ c3 {Block with a pawn.} ~150:Bf5 {Natural, but a blunder.} "
    "Bc7 {Attacks the queen. Black is in big trouble.} b6 dxc5 {Black's queenside falls apart.}",
    ["**Bc7** can trap a queen on a5. Look for it!",
     "After ...Qa5+, always block with **c3**."]),
  L("trap-d6-e5-queen-trade", "...d6, ...e5, ...dxe5? Qxd8+",
    ["After 1.d4 Nf6 2.Nc3 d6 3.Bf4 e5 4.dxe5, taking back with ...dxe5 is a mistake. **Qxd8+** and then you grab e5.",
     "After the queen trade Black can't castle, and you're a pawn up."],
    "d4 Nf6 Nc3 d6 Bf4 ~80:e5 dxe5 ~80:dxe5 {Natural, but it drops a pawn.} Qxd8+ {Trade queens with check.} Kxd8 "
    "O-O-O+ {Check, and your rook takes the d-file.} Nbd7 Bxe5 {Pawn up.}",
    ["vs ...dxe5, play **Qxd8+** and then win e5.",
     "Castle long with check to grab the d-file."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 Nbd7 Nb5 e6", "White to move. Black missed something. Win material!",
    ["b5c7"], "**Nxc7+** forks the king and rook."),
  Q("d4 d5 Nc3 Nf6 Bf4 c5 e3 Qb6 Nb5 e5", "White to move. Black attacked your bishop. What's best?",
    ["d4e5", "f4e5"], "**dxe5** (or Bxe5) wins a pawn. After dxe5, ...Ne4? loses to Qxd5."),
  Q("d4 Nf6 Nc3 d6 Bf4 e5 dxe5 dxe5", "White to move. Win a pawn.",
    ["d1d8"], "**Qxd8+** Kxd8 and then O-O-O+ or Bxe5 wins the e5 pawn."),
  Q("d4 d5 Nc3 Nf6 Bf4 c5 e3 Nc6 Nb5 Qa5+ c3 Bf5", "White to move. Black just developed the bishop. Find the strongest move.",
    ["f4c7"], "**Bc7!** hits the queen and Black can't untangle. Nc7+ also wins material, but Bc7 is even stronger."),
 ],
})

# ---------------------------------------------------------------- 10
chapters.append({
 "id": "middlegame-plans",
 "title": "Middlegame Plans",
 "summary": "What to do after the opening: the queenside squeeze, the kingside pawn storm, and quiz positions to test your plans.",
 "lessons": [
  L("plan-a4-then-kingside", "Plan: a4, then g4 on the kingside",
    ["From the main line in chapter 2. Black closes the queenside with ...c4. Your plan: **a4** to keep the knight on b5, then a **kingside pawn storm** with h4 and g4.",
     "When the center is locked, attack where your pieces point. Your bishops point at Black's king."],
    "d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Na6 e3 Be7 Nf3 O-O Bd3 c5 c3 c4 Bb1 Bd7 a4 Bxb5 axb5 {The a-file opens and the a6 knight is attacked.} Nb8 "
    "h4 {Center is locked, so attack on the kingside.} Nbd7 g4 {Pawns go forward to open lines at Black's king.}",
    ["When the center is locked (...c4), attack with **h4 and g4**.",
     "**axb5** opens the a-file for your rook.",
     "Your king can stay in the middle a while because the center is closed."]),
  L("plan-kid-race", "Plan: winning the opposite-castling race",
    ["From the King's Indian chapter. Kings on opposite sides means a **race**. Whoever opens lines first usually wins.",
     "Trade Black's fianchetto bishop and push your h-pawn. Don't waste time defending unless you have to."],
    "d4 Nf6 Nc3 g6 Bf4 Bg7 e4 d6 Qd2 O-O O-O-O c6 Bh6 b5 f3 Qa5 h4 b4 Nb1 {The knight steps back, but it guards a3 and c3.} Ba6 "
    "Bxa6 Nxa6 Bxg7 Kxg7 h5 {Rip open the h-file.}",
    ["In opposite-side castling, **speed** matters most.",
     "**Bxg7** removes Black's best defender, then **h5** opens the h-file."]),
 ],
 "quiz": [
  Q("d4 d5 Nc3 Nf6 Bf4 e6 Nb5 Na6 e3 Be7 Nf3 O-O Bd3 c5 c3 c4 Bb1 Bd7", "White to move. Black wants to trade your b5 knight. What's the plan?",
    ["a2a4"], "**a4** supports the knight. If ...Bxb5 axb5, your rook gets the a-file and the a6 knight is hit."),
  Q("d4 Nf6 Nc3 g6 Bf4 Bg7 e4 d6 Qd2 O-O O-O-O c6 Bh6 b5 f3 Qa5 h4 b4", "White to move. Your knight is attacked. Where does it go?",
    ["c3b1"], "**Nb1!** It looks ugly, but it guards a3 and c3 and keeps your king safe. Every other knight move loses material."),
 ],
})

doc = {
 "title": "Jobava London",
 "intro": "The Jobava London is 1.d4, 2.Nc3 and 3.Bf4: your London setup with the knight on c3 instead of d2. It's aggressive, easy to learn, and full of tricks like the Nb5 jump that hits c7. Every line in this course was checked with Stockfish, so you can play it with confidence.",
 "chapters": chapters,
}
json.dump(doc, open(OUT, "w"), indent=1, ensure_ascii=False)
json.dump(MISTAKES, open("mistakes.json", "w"), indent=1)
print("lessons", sum(len(c["lessons"]) for c in chapters), "quiz", sum(len(c["quiz"]) for c in chapters))
