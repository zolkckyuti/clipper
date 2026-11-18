---
tags: [project, batch, vverpaldo]
date: 2026-11-18
---
# Batch Y: 5 Trevor stream clips in VverPaldo style (2026-11-18)

Back to [[START HERE]] · style: [[VverPaldo style]]

User ask: "create nba goat, redemption and 3 other videos using VverPaldo style, push to my repository and send the video here".

## Pipeline (reuse this)
1. Sources from the clip sheet (Trevor stream tab, gid 1029565171), one at a time with `scripts/drive_dl.sh` → `viral-short/public/<name>.mp4`.
2. Editing resources Drive folder `11RA-8-Am7HJW5Hzr0051f_eUgl0YBtMw` (BGSONGS, SFX, OVERLAYS, emoji PNGs) → `viral-short/public/res/`.
   Folder listing works without the API: `https://drive.google.com/embeddedfolderview?id=<folder>`.
3. Grade SOURCE only (CapCut 4K filter, sharpness 67 + saturation 67) → `<name>_g.mp4` (softlight glow 24.5 %, unsharp 1.74 + 0.79, contrast 1.11, sat 1.26).
4. Songs: `loudnorm=I=-20` → `res/m_*_n.mp3`, energetic offset from a 1 s RMS scan.
5. `python3 planY.py` (slices plan7 scenes, writes `src/y.cfg.json` + `edits.gen.json`, validates every word ref).
6. One 6x2 stills grid for the batch, render `Guess-<id>`, master: loudnorm −14 LUFS / TP −1.5 + alimiter, metadata stripped.
- `@remotion/fonts` was missing from `viral-short/package.json` (now added).
- The template adds the 💀 itself after the top line: don't put 💀 in `top`.

## Edits (all hook + straight cut, hook line never replayed, story ends right before the hook → loops)
| id | source | length | hook (top) | song (offset) |
|---|---|---|---|---|
| tvgoatY | goat_input | 16.0 s | He had ONE job: name the NBA GOAT | CANTO DE LUNA (0) |
| tvredeemY | u3_redemptions | 21.5 s | A $20,000 card turned into $500… here's why | BREGA DO LOVE (11) |
| tvfansY | t3_traveling_trevors | 17.6 s | When the NFL star finds your fan account | X-COOL 2! (21) |
| tvticketY | t4_natty_ticket | 18.6 s | The most awkward gift you can give an NFL QB | Sybau (48.5) |
| tvcellyY | u2_psa10_celly | 17.5 s | Every card collector needs this TD celly | Flyday chinatown (14) |

## Feedback log
- (waiting for user feedback)
