# Sprogånder · Gul udgave

A retro creature-collecting RPG for learning Danish, set in Copenhagen.

**Play:** https://brunorutyna.github.io/sprogaander/

Every *sprogånd* (language spirit) is a piece of Danish grammar or vocabulary: Sin-hans-slangen, Inverrotte, Ladcykelokse, Datidsdrage … To hit a spirit, or to catch it, you answer a question about its topic:

| Move | Question | Power |
|---|---|---|
| Hurtigsvar | choose the answer | 10 |
| Lytteøre | listen, then choose | 12 |
| Sætningsbyg | put the words in order | 14 |
| Skriveslag | type the answer | 18 (can crit) |

Wrong answers miss, and the opponent hits back harder. Spirits only **evolve when you have mastered their topic** (60 %), so leveling up and learning go together.

## Features
- 308 questions: Studieskolen Modul 1–2 topics (greetings, numbers, en/et, inversion, modal verbs, datid, pronouns, sin/hans …) plus everyday Copenhagen Danish (Rejsekort, kommune, hygge phrases, the doctor, the weather).
- Spaced repetition: the questions you get wrong come back more often, and the fox (SELECT) offers to drill them.
- Every line of dialogue is in Danish. Tap **EN** for the translation, or 🔊 to hear it (if your device has a Danish voice).
- 6 masters, 6 badges with grammar boards, the Skifterbanden ("let's just switch to English") and a final exam at Studieskolen in Borgergade.
- Modern pixel art: day/night that follows your clock, weather, particles, seamless maps.
- Original chiptune soundtrack and ambience (harbour gulls, bike bells, birds, crickets), with separate volume controls.
- Progress saves in your browser. Use *Indstillinger → Kopiér gemt spil* to move it to another device.

## Controls
Phone: on-screen D-pad, A, B, START (menu), SELECT (talk to the fox).
Keyboard: arrows/WASD to walk, Z/Space = A, X/Esc = B, Enter = START, Shift = SELECT.

## Development
No build step: plain JavaScript files in `src/`, loaded by `index.html`. Open `index.html` in a browser, or serve the folder with any static server. GitHub Pages serves it from the `main` branch.

All art and music is generated in code. No external assets apart from Google Fonts.
