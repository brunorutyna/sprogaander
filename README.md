# Mellemrum

A story-driven narrative adventure for learning Danish at Danskuddannelse **Modul 2** level (*På vej til dansk*, Kapitel 1–2). Play it on your phone: <https://brunorutyna.github.io/sprogaander/>

- Tap where to walk; tap people and things to interact.
- Every Danish word is tappable. You get a Danish explanation first, then grammar, a picture, and English last.
- Each line has ↻ replay, 🐢 slow, *enklere* (simpler Danish) and EN.
- Every character has their own voice, pre-recorded with an offline Danish neural voice (Piper, `da_DK-nst_talesyntese`), shaped per character.
- The exercises are woven into the story: building sentences (V2 and inversion), fixing real learner mistakes, past tense forms, time prepositions (i / for … siden / om), listening, typing, and free answers (with optional speech input).
- The notesbog collects the words and chunks you met, the exercises you got wrong, and the sentences you wrote yourself.

## Structure

```
index.html, style.css
src/lex.js      lexicon: forms | kind | Danish explanation | English | grammar | picture  (+ chunks)
src/story.js    characters (with voice profiles), scenes, scripts (lines + challenges)
src/art.js      layered side-view scene painters + character drawing
src/engine.js   state, scene loading, parallax camera, tap-to-walk, script runner
src/ui.js       dialogue panel, gloss card, challenges, notebook, settings
src/music.js    WebAudio psych/prog score + ambience
audio/          l.ogg + w.ogg (packed voice clips) and index.json
tools/          words.js (coverage), lines.js (voice manifest), voices.py (Piper), pack.py, bundle.py
```

## Regenerating voices after editing the story

```
node tools/lines.js                         # writes tools/manifest.json
python3 tools/voices.py <path/to/da-nst_talesyntese-medium.onnx>
python3 tools/pack.py                       # rebuilds audio/l.ogg, audio/w.ogg, audio/index.json
node tools/words.js                         # every word form should have a lexicon entry
```
