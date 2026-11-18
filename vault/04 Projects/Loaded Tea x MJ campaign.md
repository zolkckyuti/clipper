# Clipfarm x Michael Jackson — The Loaded Tea Shop (Nov 16, 2026)

- Brief: https://docs.google.com/document/d/1Ju2FBCZkab_cCIHbBW0__FPL_qR8ULFLgCcnNMb12HI
- Footage (Drive): https://drive.google.com/drive/folders/1QHFRXmc4DhK8PBIAyBoiHuBSVjlJ9MO8 (doc's own link: folder 1iqJFMSL-pmwz1D_0_D7qUIXJ-vf6lQy6)
  - Drive often hits "too many downloads" → use the brief's **backup WeTransfer**: https://we.tl/t-GacpBPv1Ej6A15Ub (16 GB, 5 files)
  - Files: `A009C003_261020JC-005.mp4` (1080p, 22 min), `IMG_3763 2-004.MOV` (4K vertical, 8 min), `IMG_3764 2.MOV` (4K vertical, 5.5 min),
    `IMG_8112-003.MOV` (4K vertical 120 fps, 22 min), `Loaded Tea MJ .mp4` (4K, 3 min)
- Watermark: https://crusercontent.com/organizations/07f11898-4a1a-5b98-a340-ca5b8b7d83ba/campaigns/references/assets/c1537988-0656-4cf1-80cd-6f89a11a69fa.webp
  (transparent 1600×900: "SHOP AT loadedtea.com" | "GET 2 FREE TEAS CODE: 4FUNTEA Add 3+ teas to cart"). Brief's WeTransfer for it: https://we.tl/t-i1ku5tUmtO7pMjuA

## Rules
- Pay: $1 CPM, max $350/clip, min payout $2.
- **ONLY their footage** (nothing from outside the folder: no outside clips, memes or B-roll). Clip the best MJ moments.
- **Watermark REQUIRED on every video, the whole video**: transparent, big and clearly visible, ".com" not cut off, never covered, cropped or blurred, no UI blocking.
- Caption relevant to the clip, **English only**. Instagram: tag **@theogloadedtea first word**. Hashtag **#TheLoadedTeaShop**.
- Platforms: TikTok, Instagram, YouTube Shorts (+ Facebook). Keep the post up 30 days, likes visible, ≥0.20 % engagement.
- 40 %+ of views from US/UK/CA/AU; submit demographics.
- Not paid: outside clips, NSFW/violent/off-topic, spam (same video on many pages), paid boosts/bots, bait posting, reposting others' content, missing or altered watermark.
- Questions: discord.gg/clipfarm

## Batch 1 (Nov 16): 5 clips, VverPaldo template (redo)
The first cut (plain ffmpeg, `viral-short/mj_loadedtea.py`) did NOT look like the user's style; it was redone in the template. **Always use the template for this campaign.**
- `viral-short/plan_mj.py <proxies> <transcripts>`: builds the pre-graded (67) excerpts `public/g67_mj<id>.mp4` and writes the scenes and `src/mj.cfg.json`. Comps `Guess-mj*`.
- Vertical iPhone footage: a 1080 square (top = y0 per scene) is centred in a 1920x1080 canvas so the template's 16:9 box shows it.
- New template options: `wm` (watermark image, drawn last = nothing covers it) sits in the black band above the box at x80 y140 w920. `topY` 436 puts the top text on the box with a stroke. `srcVol` sets the party audio volume (0.35 on the dance clips, under the song).
- Effects come from the resources only (emoji PNGs + meme SFX), never the video overlays (greenflash/cashfall): the rule is ONLY their footage. Resource songs at 53 %.
- Hooks must not say "MJ said" when a guest is speaking.
