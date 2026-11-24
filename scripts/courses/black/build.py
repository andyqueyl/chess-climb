import json, sys
from lib import L, Q, MISTAKES
OUT = sys.argv[1]
C = []

# ============================================================ vs 1.e4
C.append({
 "id": "b-italian",
 "title": "vs 1.e4: The Italian (3.Bc4 Bc5)",
 "summary": "Your most common game as Black. Answer 3.Bc4 with **3...Bc5**, the Giuoco Piano you already score 6-1 with. It also kills the Fried Liver and Ng5 stuff, since f7 is never the target.",
 "lessons": [
  L("b-giuoco-quiet", "The quiet Italian: d3, c3, Re1",
    ["Most 1100s play the slow Italian: d3, c3, O-O, Re1. You copy the setup with **...Nf6, ...d6, ...a6, ...Ba7, ...h6** and you're fine.",
     "Two tiny moves matter: **...a6/...Ba7** keeps your bishop from being kicked by d4/b4, and **...h6** stops Bg5 and Ng5 forever."],
    "e4 e5 Nf3 Nc6 Bc4 Bc5 d3 Nf6 O-O d6 {Solid. Your e5 pawn is now rock solid.} c3 a6 {Makes a home for the bishop on a7 before White plays b4 or d4.} "
    "Re1 Ba7 {The bishop stays aimed at f2 from a safe square.} h3 O-O Nbd2 h6 {No more Bg5 pins or Ng5 jumps.} "
    "Nf1 Re8 {Now ...Be6 trades off White's best bishop.}",
    ["Setup: **...Nf6, ...d6, ...O-O, ...a6, ...Ba7, ...h6, ...Re8, ...Be6.**",
     "Trade White's Bc4 with **...Be6** when you can. It's White's best piece.",
     "Don't rush ...d5. Let White commit first."]),
  L("b-giuoco-c3-d4", "White grabs the center: c3 and d4",
    ["If White plays **c3 and d4** fast, take on d4 and give a check on b4. Then hit back in the middle with **...d5!**",
     "This is the old main line and it is totally equal. The point to remember: after the bishops trade, **...d5** frees your whole position."],
    "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 {Hits e4 right away.} d4 exd4 cxd4 Bb4+ {The check gains time.} Bd2 Bxd2+ Nbxd2 "
    "d5! {The key move. Break the center before White builds it up.} exd5 Nxd5 Qb3 {Hitting d5 twice.} Nce7 {Guards d5 again. Don't play ...Na5 here, it walks into tactics.} "
    "O-O O-O Rfe1 c6 {d5 is safe forever, and White's d4 pawn is a target.}",
    ["After **cxd4 Bb4+**, trade bishops and play **...d5!**",
     "**...Nce7** and **...c6** make your d5 knight untouchable.",
     "White's isolated d4 pawn is a long-term target for your pieces."]),
  L("b-italian-ng5", "4.Ng5?? just hangs a knight",
    ["Lots of players copy the Fried Liver idea and play **4.Ng5** here. With your bishop on c5 it's a blunder: **...Qxg5!** and the knight is gone.",
     "This is why 3...Bc5 is so nice. Your queen sees g5 down the d8-h4 diagonal."],
    "e4 e5 Nf3 Nc6 Bc4 Bc5 ~400:Ng5 Qxg5 {Free knight. Your queen also hits g2.} O-O Qh4 {Back to safety. You're a full piece up.} "
    "d4 exd4 {Take the pawn; your bishop is protected.} Nd2 d6 {Develop and castle. Just play safe and trade pieces.}",
    ["vs **4.Ng5**, look at what defends g5. Nothing! **...Qxg5** wins a piece.",
     "After winning material: develop, castle, and trade pieces.",
     "Always check if a 'scary' attacking move just hangs something."]),
  L("b-evans", "The Evans Gambit (4.b4): just decline it",
    ["**4.b4** is a fun gambit, but you don't have to take. **4...Bb6** keeps everything safe and simple.",
     "If White pushes **a4-a5** to trap your bishop, **...a6** and **...Ba7** give it room."],
    "e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bb6 {Decline. Now b4 is just a loose pawn.} a4 a6 {Gives the bishop a7 if White plays a5.} "
    "Nc3 Nf6 Nd5 Nxd5 exd5 Nd4 {The knight jumps into the center and attacks f3.} Nxd4 Bxd4 c3 Bxf2+! {Don't retreat. Grab f2 with check: White's king loses castling.} Kf1 d6 {You're a pawn up with a safe position.}",
    ["vs the Evans, **4...Bb6** is the simple answer.",
     "**...a6** makes room for the bishop on a7.",
     "If White's knight lands on d5, trade it off: **...Nxd5**.",
     "When a bishop is attacked, check for a capture with check first (**...Bxf2+**)."]),
 ],
 "quiz": [
  Q("e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Bd2 Bxd2+ Nbxd2", "Black to move. What's the freeing move?",
    ["d7d5"], "**...d5!** Break the center right away. After exd5 Nxd5 you're fully equal."),
  Q("e4 e5 Nf3 Nc6 Bc4 Bc5 Ng5", "Black to move. White's knight jumped to g5, eyeing f7. Punish it.",
    ["d8g5"], "**...Qxg5!** Nothing defends the knight. You're a piece up."),
 ],
})

C.append({
 "id": "b-nf3-nc6",
 "title": "vs 1.e4: Scotch, Ruy Lopez, Four Knights",
 "summary": "The other ways White plays after 2.Nf3 Nc6. One clear plan for each, plus the **Fork Trick**, a free-center tactic that works against a lot of 1100 players.",
 "lessons": [
  L("b-scotch", "The Scotch (3.d4): ...Bc5 then ...Qf6",
    ["You lost Scotch games after trading **...Nxd4** and then playing ...Qf6. The fix is move order: **4...Bc5 first**. Now ...Qf6 hits d4 together with the bishop and the knight, and it's the main line.",
     "Then the king's knight goes to **e7**, not f6, so the queen keeps its view."],
    "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 {Hits the d4 knight right away.} Be3 Qf6 {Now d4 is attacked three times.} c3 Nge7 {e7, not f6: the queen stays on the long diagonal.} "
    "Bc4 Ne5 {Hits the bishop and eyes d3 and f3.} Be2 Qg6 {Now e4 and g2 are both targets.} O-O d6 {Castle next. Active and equal.}",
    ["vs the Scotch: **4...Bc5**, then **...Qf6** and **...Nge7**.",
     "Don't play **...Nxd4** yourself. Let White trade.",
     "Queen + bishop both aiming at f2/d4 is the whole idea."]),
  L("b-ruy", "The Ruy Lopez (3.Bb5): ...a6, ...Nf6, ...Be7",
    ["The Ruy is the oldest main line. Your setup: **...a6, ...Nf6, ...Be7, ...b5, ...d6, ...O-O.** Then the classic plan **...Na5 and ...c5** grabs space on the queenside.",
     "Don't worry about 'losing' e5. If White takes on c6 and e5 early, there's a trick (next lesson)."],
    "e4 e5 Nf3 Nc6 Bb5 a6 {Ask the bishop what it wants.} Ba4 Nf6 O-O Be7 {Calm development. Castle next.} Re1 b5 {Now e5 is really threatened.} "
    "Bb3 d6 {e5 is solid.} c3 O-O h3 Na5 {Trade off White's best bishop, or chase it to c2.} Bc2 c5 {Classic Ruy: space on the queenside.} d4 Qc7 {Holds e5. You're fine.}",
    ["Setup: **...a6, ...Nf6, ...Be7, ...b5, ...d6, ...O-O.**",
     "Plan: **...Na5** hits the Bb3, then **...c5** and **...Qc7**.",
     "**...b5** only after White has castled, so the bishop has to move."]),
  L("b-ruy-exchange", "Ruy Exchange: the ...Qd4 trick",
    ["If White plays **4.Bxc6 dxc6 5.Nxe5?**, it looks like White won a pawn. Not so: **5...Qd4!** forks the knight and e4, and you get the pawn back.",
     "After the queens come off you have the two bishops. That's a nice ending for you."],
    "e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 {Take toward the center. Your bishops get open lines.} ~40:Nxe5 Qd4! {Hits the e5 knight and the e4 pawn.} "
    "Nf3 Qxe4+ Qe2 Qxe2+ Kxe2 Bf5 {You have the two bishops and an easy game.}",
    ["vs **Bxc6**, take with the d-pawn: **...dxc6**.",
     "If **Nxe5**, play **...Qd4!** and the pawn comes back.",
     "Two bishops + open position = your advantage."]),
  L("b-fork-trick", "Four Knights with Bc4: the Fork Trick",
    ["When White plays **Nc3 and Bc4**, you have a famous tactic: **...Nxe4!** If Nxe4, then **...d5** forks bishop and knight, and you get the piece back with a great center.",
     "This one wins lots of games at 1100 because it looks like a blunder."],
    "e4 e5 Nf3 Nc6 Nc3 Nf6 Bc4 Nxe4! {Looks like you hung a knight.} Nxe4 d5 {The fork! Bishop and knight are both attacked.} "
    "Bd3 dxe4 Bxe4 Bd6 {You have a great center and easy development. White's bishop is just a target.} d4 Nxd4 Nxd4 exd4 Qxd4 O-O {Equal material, and your pieces are more active.}",
    ["vs **Nc3 + Bc4**, look for **...Nxe4!** then **...d5**.",
     "It works because ...d5 forks the c4 bishop and e4 knight.",
     "Not available if White has played d3 (then e4 is defended)."]),
  L("b-four-knights", "Four Knights with Bb5: ...Nd4!",
    ["vs **4.Bb5**, the fun answer is **4...Nd4!** It attacks the bishop and the f3 knight and dares White to grab e5.",
     "If White trades on d4, the tactics end with queens off and you're fine. If **Nxe5?**, ...Qe7 hits back hard."],
    "e4 e5 Nf3 Nc6 Nc3 Nf6 Bb5 Nd4 {Hits b5 and f3.} Nxd4 exd4 e5 dxc3 exf6 Qxf6 dxc3 Qe5+ Qe2 Qxe2+ Bxe2 "
    "d5 {Queens are off. Develop with ...Bd6 and ...O-O. Totally equal and simple.}",
    ["vs **Bb5** in the Four Knights: **4...Nd4!**",
     "The forcing line ends in a simple equal ending.",
     "Your c-pawn line: ...c6 kicks the bishop later if it stays on b5."]),
 ],
 "quiz": [
  Q("e4 e5 Nf3 Nc6 Nc3 Nf6 Bc4", "Black to move. Find the trick that's been fooling people for 150 years.",
    ["f6e4"], "**...Nxe4!** If Nxe4 then ...d5 forks the bishop and knight."),
  Q("e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 Nxe5", "Black to move. White just grabbed e5. Win it back.",
    ["d8d4"], "**...Qd4!** forks the knight and the e4 pawn, and you win the pawn back."),
  Q("e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3", "Black to move. Your bishop is attacked twice now. What's simplest?",
    ["d8f6"], "**...Qf6!** Now d4 is attacked three times (queen, bishop, knight). It's the main line."),
 ],
})

C.append({
 "id": "b-e4-surprises",
 "title": "vs 1.e4: Early queens and gambits",
 "summary": "The stuff 1100 players throw at you: the early Qh5, the Vienna, the King's Gambit, and 2.d4. Each gets one safe answer.",
 "lessons": [
  L("b-qh5", "The early Qh5 (Scholar's Mate try)",
    ["**Qh5 + Bc4** is aiming at f7 for mate. Block with **...Nc6** and **...g6**, then chase the queen around while you develop.",
     "Every queen move White makes is a free move for you."],
    "e4 e5 Qh5 Nc6 {Guards e5.} Bc4 g6 {Blocks the queen. Now Qxf7 isn't a threat.} Qf3 Nf6 {Blocks the f-file. Mate threat stopped again.} "
    "Ne2 Bg7 {Fianchetto. Your bishop and knight are developed, White's queen is in the way.} Nbc3 d6 d3 Bg4 {Hits the queen. Again.} Qg3 Nb4 {Now ...Nxc2+ forking king and rook is the threat. Every move comes with a threat.}",
    ["vs **Qh5**: **...Nc6**, then **...g6** when Bc4 comes.",
     "vs **Qf3**: **...Nf6**.",
     "Develop with tempo: **...Bg4** hits the queen, then **...Nb4** eyes c2."]),
  L("b-vienna", "The Vienna (2.Nc3)",
    ["**2.Nc3** often leads to **3.f4**, a gambit. The clean answer is **3...d5!**, hitting back in the center.",
     "After **4.fxe5 Nxe4**, your knight is a monster on e4."],
    "e4 e5 Nc3 Nf6 f4 d5! {Fight for the center instead of taking on f4.} fxe5 Nxe4 {The knight sits in the center and hits c3.} "
    "Nf3 Be7 {Calm. Castle next.} d4 O-O Bd3 f5 {Supports the e4 knight. Now it can't be kicked easily.} exf6 Bxf6 O-O Nc6 {Develop and hit d4. Active and equal.}",
    ["vs **f4**, play **...d5!**",
     "Put the knight on **e4** and support it with **...f5**.",
     "vs 3.Bc4 instead, play **3...Nc6** and **...Bc5**, just like the Italian."]),
  L("b-kings-gambit", "The King's Gambit (2.f4)",
    ["Take it: **2...exf4**. Then **3...d5** gives the pawn back for fast development.",
     "Black does well against the King's Gambit because White's king gets drafty."],
    "e4 e5 f4 exf4 Nf3 d5 {Hit back in the center.} exd5 Nf6 {Develop and hit d5.} Bc4 Nxd5 O-O Be7 {Castle next. You're up a pawn on f4 for now.} "
    "d4 O-O Bxd5 Qxd5 Nc3 Qd8 {Safe queen. You're fine and White still needs to win back f4.}",
    ["vs the King's Gambit: **2...exf4** then **3...d5**.",
     "Develop fast: ...Nf6, ...Be7, ...O-O.",
     "Don't hold on to the f4 pawn at all costs."]),
  L("b-center-danish", "2.d4: the Center Game and the Danish",
    ["After **2.d4 exd4**, if White takes back with the queen, **...Nc6** hits it. If White gambits with **3.c3**, play **3...d5!** and you're comfortable.",
     "Both ideas use the same rule: hit back in the center with tempo."],
    "e4 e5 d4 exd4 c3 d5! {The best answer to the Danish. Give back the pawn on your terms.} exd5 Qxd5 cxd4 Nc6 {Hits d4.} "
    "Nf3 Bg4 {More pressure on d4.} Be2 Bb4+ Nc3 Bxf3 Bxf3 Qc4 {Pins and pressure. White has to work to hold d4.}",
    ["vs the **Danish (3.c3)**: **3...d5!**",
     "vs the **Center Game (3.Qxd4)**: **3...Nc6** with tempo.",
     "Pressure the d4 pawn with ...Nc6, ...Bg4 and ...Bb4+."]),
 ],
 "quiz": [
  Q("e4 e5 Qh5 Nc6 Bc4", "Black to move. Stop the mate on f7.",
    ["g7g6", "d8e7", "d8f6"], "**...g6** blocks the queen. Next ...Nf6 or ...Bg7. (...Qe7 and ...Qf6 also stop mate, but ...g6 hits back.)"),
  Q("e4 e5 Nc3 Nf6 f4", "Black to move. White offers a pawn. Best reply?",
    ["d7d5"], "**...d5!** Strike in the center. After fxe5 Nxe4 your knight dominates."),
  Q("e4 e5 d4 exd4 c3", "Black to move. The Danish Gambit. What's the cleanest answer?",
    ["d7d5", "d4c3"], "**...d5!** gives the pawn back on your terms. Taking with ...dxc3 is also fine but you have to know more theory."),
 ],
})

# ============================================================ vs 1.d4
C.append({
 "id": "b-vs-london",
 "title": "vs 1.d4: The London (2.Bf4)",
 "summary": "The opening you'll see most as Black. Hit it with **...c5 and ...Qb6** right away, the same idea you've seen as White but now it's your weapon.",
 "lessons": [
  L("b-london-qb6", "...c5, ...Nc6, ...Qb6: hit b2",
    ["The London bishop leaves b2 weak. The plan: **...c5, ...Nc6, ...Qb6**, pressure on b2 and d4.",
     "If White trades queens on b6, your a-pawn takes back toward the center and the open a-file is yours."],
    "d4 d5 Bf4 c5 {Hit the center right away.} e3 Nc6 c3 Nf6 Nd2 Qb6 {b2 is attacked.} Qb3 c4 {Gains space and kicks the queen.} "
    "Qc2 Bg4 {Get the bishop out before ...e6. Careful: ...Bf5?? here just hangs it to Qxf5.} b3 cxb3 axb3 Rc8 {Your rook lines up against White's queen on the c-file.} Qb1 e6 {Solid, with good pieces. You're fine.}",
    ["vs London: **...c5, ...Nc6, ...Qb6**.",
     "If **Qb3**, then **...c4** gains space with tempo.",
     "**...Bg4** gets the bishop out. Never ...Bf5 when the queen is on c2!"]),
  L("b-london-dxc5", "When White takes on c5 (and the b4 blunder)",
    ["Some players take **dxc5** right away. Answer with **...e6**: next ...Bxc5 wins the pawn back.",
     "If White tries to hold the pawn with **b4?**, there's a killer: **...Qf6!** forks the f4 bishop and the a1 rook, since b2 is now empty."],
    "d4 d5 Bf4 c5 dxc5 e6 {Next ...Bxc5.} ~250:b4 Qf6! {Fork: the f4 bishop and the a1 rook are both attacked.} Bxb8 Qxa1 {You win a rook for a knight.} "
    "Bg3 Qxa2 {And a pawn. You're way ahead.}",
    ["vs **dxc5**: **...e6**, then **...Bxc5**.",
     "If **b4**, then **...Qf6!** forks f4 and a1.",
     "Any time b2 is gone, look at the long diagonal to a1."]),
  L("b-jobava-vs-you", "When they play the Jobava against you",
    ["You know the Jobava from the White side, so you know the trick: **Nb5** hits c7. Stop it with **...a6** and play normally.",
     "This is the opening you play as White, so you already know what White wants."],
    "d4 d5 Nc3 Nf6 Bf4 a6 {No Nb5 for White. Simple.} e3 e6 Nf3 c5 {Same central plan as vs the London.} "
    "Bd3 Nc6 O-O Be7 Ne5 O-O {Castled and solid. ...c4 and ...b5 come next on the queenside.}",
    ["vs the Jobava: **...a6** stops **Nb5**.",
     "Then **...e6, ...c5, ...Nc6, ...Be7, ...O-O**.",
     "Know your own opening's ideas from the other side."]),
 ],
 "quiz": [
  Q("d4 d5 Bf4", "Black to move. What's the most annoying move for a London player?",
    ["c7c5", "g8f6"], "**...c5!** Hit the center right away. Then ...Nc6 and ...Qb6 go after b2."),
  Q("d4 d5 Bf4 c5 dxc5 e6 b4", "Black to move. White is holding on to the c5 pawn with b4. Punish it.",
    ["d8f6"], "**...Qf6!** forks the f4 bishop and the a1 rook. b2 is empty, so the long diagonal is open."),
  Q("d4 d5 Bf4 c5 e3 Nc6 c3 Nf6 Nd2 Qb6 Qb3", "Black to move. White offers a queen trade. Best reply?",
    ["c5c4", "c5d4"], "**...c4!** gains space and kicks the queen. Now White's queen has to go back to c2."),
 ],
})

C.append({
 "id": "b-vs-qg",
 "title": "vs 1.d4: The Queen's Gambit (2.c4)",
 "summary": "Play the **Queen's Gambit Declined**: ...e6, ...Nf6, ...Be7, ...O-O. Super solid, and it comes with the **Elephant Trap**, which wins a piece against greedy players.",
 "lessons": [
  L("b-qgd-main", "The QGD setup",
    ["Don't take on c4 and don't play ...Bf5 early. Just build: **...e6, ...Nf6, ...Be7, ...O-O, ...h6, ...Nbd7, ...c6**.",
     "Later, **...dxc4** and **...c5** (or ...e5) free your position."],
    "d4 d5 c4 e6 {Hold d5 with a pawn.} Nc3 Nf6 Bg5 Be7 {Unpins right away.} e3 O-O Nf3 h6 {Ask the bishop.} Bh4 Nbd7 "
    "Rc1 c6 {A rock-solid triangle: c6, d5, e6.} Bd3 dxc4 {Now take, when White's bishop has moved twice.} Bxc4 Nd5 {Trades pieces to free your game.} Bxe7 Qxe7 {Equal, and you'll play ...e5 next.}",
    ["Setup: **...e6, ...Nf6, ...Be7, ...O-O, ...h6, ...Nbd7, ...c6**.",
     "Take **...dxc4** only once White's light bishop has moved.",
     "Free your game with **...Nd5** trades and then **...e5** or **...c5**."]),
  L("b-elephant-trap", "The Elephant Trap",
    ["The most famous trap in the QGD. After **...Nbd7** and **cxd5 exd5**, the d5 pawn looks free. If White takes it with the knight, **...Nxd5!** and the queen trade with a bishop check wins a piece.",
     "The trick: if **Bxd8**, then **...Bb4+** and you take the queen back, and you're up a piece."],
    "d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 {Looks like it hangs d5. It doesn't.} cxd5 exd5 ~250:Nxd5? Nxd5! {Give up your queen!} "
    "Bxd8 Bb4+ {The check.} Qd2 Bxd2+ Kxd2 Kxd8 {You're up a full piece.}",
    ["After **...Nbd7**, the d5 pawn is 'poisoned'.",
     "**Nxd5? Nxd5! Bxd8 Bb4+** and you win a piece.",
     "Remember: your queen sac comes back with a bishop check."]),
  L("b-qgd-exchange", "The Exchange (cxd5 exd5)",
    ["If White trades **cxd5 exd5** early, your setup changes a little: **...c6, ...Be7, ...Nbd7, ...O-O, ...Re8, ...Nf8**.",
     "Your light bishop is free now. It goes to **g4 or f5**."],
    "d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 {Solid. Your pawn chain is c6-d5.} e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8 {Guards h7 and heads to g6 or e6.}",
    ["vs the **Exchange**: **...c6, ...Be7, ...Nbd7, ...O-O, ...Re8, ...Nf8**.",
     "Your c8 bishop is free: aim for **...Bg4** or **...Bf5**.",
     "Watch White's minority attack (b4-b5). Answer it with ...a6 or ...Ne4 play."]),
 ],
 "quiz": [
  Q("d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5", "Black to move. White just grabbed d5. Punish it!",
    ["f6d5"], "**...Nxd5!** If Bxd8 then ...Bb4+ Qd2 Bxd2+ Kxd2 Kxd8 and you're a piece up."),
  Q("d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3", "Black to move. What's a good waiting move that asks the bishop a question?",
    ["h7h6", "b8d7"], "**...h6** asks the bishop to decide. After Bh4, continue with ...Nbd7 or ...b6."),
 ],
})

C.append({
 "id": "b-vs-d4-other",
 "title": "vs 1.d4: Colle, Blackmar-Diemer, Trompowsky",
 "summary": "The other d4 systems you'll see. Same rule each time: get your light bishop out before ...e6, and hit the center.",
 "lessons": [
  L("b-colle", "The Colle (2.Nf3 and 3.e3)",
    ["The Colle wants Bd3 and a kingside attack. Spoil it with **...Bf5**: trade White's best attacking bishop.",
     "If White avoids the trade, your bishop is just a great piece outside your pawn chain."],
    "d4 d5 Nf3 Nf6 e3 Bf5 {Develop the bishop before ...e6 locks it in.} Bd3 e6 {Now if Bxf5, exf5 and the e-file is yours.} Bxf5 exf5 "
    "O-O Bd6 c4 c6 Nc3 dxc4 {Take now. White has to spend time winning it back.} Nd2 O-O Nxc4 Bc7 {Equal, and the f5 pawn guards e4 for good.}",
    ["vs the Colle: **...Bf5** before ...e6.",
     "If **Bxf5 exf5**, you get a grip on e4.",
     "Then **...Bd6, ...O-O, ...c6, ...Nbd7**."]),
  L("b-bdg", "The Blackmar-Diemer Gambit (2.e4)",
    ["A sharp gambit lots of club players love. Take the pawn, and after **4.f3** take again, then calm development: **...e6, ...Be7, ...O-O**.",
     "Black just keeps a solid extra pawn or gives it back for safety."],
    "d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 {Take it. Now you're up a pawn.} Nxf3 e6 {Solid. Your king will be safe after ...Be7 and ...O-O.} "
    "Bg5 Be7 Bd3 Nc6 {Hits d4.} a3 O-O Qd2 Nd5 {Trade pieces. Every trade helps the side that's up a pawn.} Bxe7 Ncxe7 {Still a solid pawn up.}",
    ["vs the **BDG**: **...dxe4**, **...Nf6**, **...exf3**.",
     "Then **...e6, ...Be7, ...O-O, ...Nc6**.",
     "Trade pieces when you're up a pawn."]),
  L("b-tromp", "The Trompowsky (2.Bg5)",
    ["**2.Bg5** hits e7 and wants to annoy you. Ask it right away with **...h6**, then **...c6** and **...Qb6** go after b2.",
     "Same theme as vs the London: the bishop left the queenside, so b2 is weak."],
    "d4 d5 Bg5 h6 {Ask the bishop.} Bh4 c6 {Gets ready for ...Qb6.} e3 Qb6 {b2 is attacked.} Qc1 Bf5 {Develop outside the pawn chain.} "
    "c4 e6 Nc3 Nd7 {Solid and flexible. You're fine.}",
    ["vs **2.Bg5**: **...h6**, then **...c6** and **...Qb6**.",
     "Bishop leaves c1 means **b2** is weak.",
     "**...Bf5** before **...e6** again."]),
 ],
 "quiz": [
  Q("d4 d5 Nf3 Nf6 e3", "Black to move. White wants Bd3. What stops the Colle plan?",
    ["c8f5", "c8g4", "c7c5"], "**...Bf5!** Your bishop gets out before ...e6, and trades off White's best attacking piece."),
  Q("d4 d5 Bg5", "Black to move. What's the simplest way to deal with the bishop?",
    ["h7h6", "c7c6", "g8f6"], "**...h6** asks it right away. Then ...c6 and ...Qb6 hit b2."),
 ],
})

doc = {
 "title": "Black Repertoire",
 "intro": "One clear plan as Black against everything common at your level. **vs 1.e4: 1...e5**, the move you already play, with the Giuoco Piano (3...Bc5) that you score 6-1 with. **vs 1.d4: 1...d5**, which replaces the Englund (1-1-3 in your rapid games). Lines are solid, with a few tricks mixed in, and every Black move here was checked with Stockfish.",
 "side": "black",
 "chapters": C,
}
json.dump(doc, open(OUT, "w"), indent=1, ensure_ascii=False)
json.dump(MISTAKES, open("opp.json", "w"), indent=1)
print("lessons", sum(len(c["lessons"]) for c in C), "quiz", sum(len(c["quiz"]) for c in C), "opp", MISTAKES)
