---
tags: [style, asmr, 3d]
date: 2026-11-19
---
# Cartoon ASMR style ("tingly cartoony ASMR")

Back to [[START HERE]]

User ask (2026-11-19): "tingly cartoony asmr as a niche, **no meme sound effects**, **no phonk music in the background**, **1 minute long**, **entertaining at the start**."

## Rules
- **60 s**, ~10 scenes of ~6 s, each one satisfying action repeated 4–20× with a clear rhythm.
- **Sound is the product:** close, crisp tingle sounds only (slices, crunch, taps, pops, scrapes, squish, pours, drops), panned L/R per hit
  for the binaural feel, very quiet room tone under everything. **No music, no meme SFX, no voice.**
- **Hook in the first second:** something cute + instantly satisfying (#1: a rainbow jelly cube with a face blinks, goes "wow" and gets sliced at 0.95 s; the face splits). Small "headphones on" pill for the first 3 s.
- **Loop:** the last scene answers the first (the jelly puts itself back together and smiles), end text "which one gave you tingles?".
- Look: pastel gradient studio, glossy clearcoat "candy" materials, soft shadows, cartoon hand (index finger), slow camera drift, white 0.15 s dip between scenes.

## Code
- `asmr/make_asmr.py` = the timeline (scene windows + every event time) AND the synthesized sound bank → `src/asmr/timeline.json` + `public/asmr/asmr1.wav`. Change timing there only; the picture reads the same JSON.
- `src/asmr/AsmrShort.tsx` (comp `Asmr1`): JellyScene, SandScene, KeysScene, PopScene, SoapScene, SlimeScene, HoneyScene, CandyScene, DropsScene, FinaleScene.
- Stills: `node .work/st3d.mjs Asmr1 out/bl/asmr <ms…>`; render `.work/render3d.sh Asmr1` (~1 h for 60 s, software GL).

## Gotchas
- `RoundedBox` radius must be < half the smallest side, or the box bulges and swallows what sits on it (pop-it bubbles vanished).
- 9:16 at fov 32–36 is narrow: `Cam` pulls every camera back by `k = 1.5` from its target.
- A flipped (negative-scale) dome renders under the surface: flatten pressed bubbles (scale y ≈ 0.22) instead.

## Feedback log
- **#1 verdict (2026-11-19): "not tingly enough" and "kinda bland from the audience's perspective".** User: use ASMR triggers like Jojo ASMR and other top ASMR creators (fast/aggressive layered tapping, scratching, crinkles, brushing, personal attention). → Synthesized sounds alone are too clean; pacing + camera too distant/static.
