---
tags: [style, blocky, 3d]
date: 2026-11-18
---
# Blocky story style ("In this town…" / "What if…")

Back to [[START HERE]]

User ask (2026-11-18): "roblox videos like the ones on TikTok that use roblox models to tell a story, like 'what if' or 'in this town'".
User picks: **I build the blocky 3D** (no real game footage, the cloud box can't run the game), **3 test videos first**, voice **ElevenLabs**
(user declined to share a key → Kokoro fallback; ElevenLabs free tier is disabled on this account anyway, see the inside-impossible skill).

## Rules
- Our own look only: block-built avatars, studded baseplate, generic town. **No game logos, names, UI, sounds ("oof") or assets.**
- Story = premise line in the first 2–3 s ("In this town, …" / "What if …"), a named kid breaks/meets the rule, escalation in 3 beats, twist or wholesome payoff. 70–80 words, ~21–23 s.
- Narration is the clock: every shot, pop and SFX keys off the words JSON (`wordAt`, punctuation-insensitive).
- New image every 1–2.5 s, cameras always moving, a 140 ms white flash on every cut, characters never static (idle/walk/float clips, blinks).
- Captions: Montserrat 800 ALL CAPS, 96 px, 14 px black stroke, 1–3 words, always on, one yellow keyword set per story, y≈1180.
- Sound: VO full, BGSONGS bed ducked under the voice, resource SFX on every visual beat, master −14 LUFS.

## Code
- Kit: `src/blocky/kit.tsx` (Avatar with faces smile/grin/sad/shock/smug/worried/cry/happy/angry, hair styles, headScale, sit, float poses; Baseplate, Road, House, School, Tree, Cloud, Rain, Bench, Car+Chain, Clock, Umbrella, Dog, Bread, Basket, Sun; Captions + Soundtrack).
- Videos: `src/blocky/LieShort.tsx` (BlockyLie), `GravityShort.tsx` (BlockyGravity), `RainShort.tsx` (BlockyRain); scripts in `blocky/videos/*.txt`.
- VO: `python3 inside-impossible/audio/tts.py blocky/videos/<s>.txt vo_<s> "am_michael:0.55+am_fenrir:0.45" 1.0` → move wav to `public/blocky/`, words JSON to `src/blocky/`; trim Whisper's hallucinated repeat at the end.
- Stills: `node .work/st3d.mjs <Comp> out/bl/<name> <ms…>` (one bundle, many stills). Small grid tiles hide size changes: check a full-size still.
- Render: `.work/render3d.sh <Comp…>` (`--gl=angle`, software GL: slow, ~20–40 min per video on 4 cores).

## Gotchas
- 9:16 at vfov 44–46 only covers ±6–7 units at 25–30 units distance: keep groups within ~12 units wide or pull back.
- Props in a raised hand inherit the arm pitch: undo it (umbrella rotation x = +armR).
- Rain must stop at the umbrella (`stop` / `y1`), clouds must sit on the subject's path in "past the clouds" shots.

## Feedback log
- (waiting for the user's verdict on the 3 tests)
