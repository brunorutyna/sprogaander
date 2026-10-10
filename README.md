# Sprogånder

A story-driven creature-collecting RPG for learning Danish, set in Copenhagen. For adults, with dry humour.

**Play:** https://brunorutyna.github.io/sprogaander/ (made for phones, works with a keyboard too)

Every *sprogånd* (language spirit) is a piece of Danish: inversion, sin/hans, datid, numbers, the kommune, mild swearing … To hit a spirit, or to catch it in a lava lamp, you answer a question about its topic:

| Move | Question | Power |
|---|---|---|
| Hurtigsvar | choose the answer | 10 |
| Lytteøre | listen, then choose | 12 |
| Sætningsbyg | put the words in order | 14 |
| Skriveslag | type the answer | 18 (can crit) |

Wrong answers miss, and the opponent hits back harder. Spirits only evolve (and they evolve *a lot*) when you have mastered their topic.

## Features
- About 320 questions at A2/Modul 2 level, plus everyday Copenhagen Danish.
- Spaced repetition: questions you get wrong come back; the fox offers to drill them.
- All dialogue in Danish, with an **EN** button for the translation and read-aloud where the device has a Danish voice.
- Day/night that follows your clock, weather, original psychedelic/prog soundtrack and city ambience.
- Progress saves in the browser. *Indstillinger → Kopiér gemt spil* moves it to another device.

## Controls
Phone: D-pad, A, B, MENU, RÆV (talk to the fox). Keyboard: arrows/WASD, Z/Space = A, X/Esc = B, Enter = MENU, Shift = RÆV.

## Development
Plain JavaScript in `src/`, loaded by `index.html`, no build step. All art and music is generated in code; the only external assets are Google Fonts.
