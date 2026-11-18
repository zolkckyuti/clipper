---
tags: [project, batch, vverpaldo, hardscope]
date: 2026-11-18
---
# Batch H: HardScope R3born Ep2, 5 fresh moments, VverPaldo style (2026-11-18)

Back to [[START HERE]] · style: [[VverPaldo style]] · earlier R3 edits: plan6–plan13, [[Titles used]]

- Brief: Google Doc 1PyhV_PLtHw63VKe899CpTYcMl3QMZM8U3Xt2gi1ythM (same rules as before: @HardScope / @hardscope + #r3born in every caption,
  NEVER FaZe, no politics, Ep2 only, ≥7 s, big subs, hook in 2 s, cut before it resolves, no invented context, clippers may not comment).
- Footage: new Frame.io link `next.frame.io/share/0d2583e0-…/view/089ee9a9-…` = same "R3BORN_EP2_ FINAL v4" (1080p proxy 401 MB, 786.5 s).
  **Download recipe:** Playwright → click "Download" → click the item matching `/1920.1080/` → the `download` event gives a
  `stream-download.frame.io/manifest/hls?...` URL → `curl -L` it to `viral-short/public/r3ep2.mp4`.
- Transcript: faster-whisper large-v3 int8 on CPU (~20 min) → TX format `[{t, w: [[s, e, word]]}]`.
- **Why fresh moments:** 43 R3 edits already exist; reusing their seconds risks "slop reposting"/duplicate rejection.
  Already used (episode s): 27–60, 112–117, 132–161, 169–177, 183–188, 198–268, 331–356, 379–400, 415–457, 467–486, 506–516, 528–537, 548–568, 601–616, 638–700, 701–780.
- Pipeline: `python3 planH.py <tx.json>` → `src/h.cfg.json` + scenes in `edits.gen.json` + `src/h.windows.json`;
  per-edit graded excerpt `public/g_<id>.mp4` (source-only CapCut 4K grade, 30 fps) so scenes use excerpt-relative times.

| id | episode s | length | hook (top) | song |
|---|---|---|---|---|
| r3hOpen | 0–29 | 22.8 s | 3 "women's workouts" vs N3on… who breaks first? | Impostor Syndrome |
| r3hPrison | 61–84 | 15.9 s | Pilates was invented WHERE?! | Get Out (Trap Remix) |
| r3hTough | 270–293 | 21.8 s | "This won't be too tough"… then she did THIS | wtf u tryna say |
| r3hTurn | 301–332 | 22.3 s | Everyone else struggled… then it was HIS turn | CANTO DE LUNA |
| r3hSilks | 569–598 | 18.6 s | She made it look EASY… now it's N3on's turn | Flyday chinatown |

Still unused after this batch: 84–112 (glasses / "I'm not losing"), 189–197, 296–301, 484–506 (silks intro), 574–584, 780–786.

## Feedback log
- Burned-in episode subtitles show in the pole + intro sections: blur band y 940–1080 (boxblur 40:4) baked into those excerpts.
- (waiting for user feedback)
