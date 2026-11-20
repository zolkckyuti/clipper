---
tags: [project, campaign, kitsch]
date: 2026-11-19
---
# ClipFarm x Kitsch x Nic Vans ("Saint Nic")

Back to [[START HERE]] · style: [[VverPaldo style]] (vertical-source version)

- Brief: Google Doc 115eJPoUVmSA6Tnc_Mfrksnp4ee6-eWz0hxpaCs4bcBY. Footage: Dropbox folder → one 65 s ProRes 1080x1920 spot → `.work/kitsch/nic.mp4` (H.264 copy).
- **Rules:** Kitsch product on screen in EVERY clip; NO raw reposts (cut a story, unique hook); make Nic look good (sweet, fun, kind), no mocking, no Love Island drama;
  never name/guess the "special someone"; only folder footage; tag **TikTok @kitsch, IG + YT @mykitsch**; own English captions, name Kitsch in some (not salesy);
  one edit per post (new post = new edit + caption + on-screen text); 30 days up, likes visible, ≥0.5 % engagement, 40 %+ Tier-1; no boosting; don't comment/DM Nic or Kitsch.
- Spelling: "Saint Nic" (whisper writes "Nick"), "Kitsch" (whisper writes "Kish").
- Pipeline: `kitsch/make_vert.py` (VverPaldo for vertical footage: grade, flicker, green/white hits only, punch-in zoompan, cut flashes, one-word ASS captions,
  slowed song ducked) + `kitsch/clips/*.json`. 1080p only (user). Final peak fix: extra `volume=-1dB,alimiter=0.75` pass if AAC overshoots.

## Batch 1 (2026-11-19): tax, mystery, mom, sister, town (5 different structures/hooks/songs)

## v2 — narrated storytime (anti-view-jail rebuild)
- Why: raw re-cuts of the ad = same fingerprint as every other clipper + the brand's own post → YouTube's unoriginal-content downrank (Oct 2026 Shorts update) and TikTok duplicate filter.
- What's original: ElevenLabs narrator tells the story in our words (`public/kitsch/narr.wav`), real lines play between at full volume ("🔊 REAL" tag); footage is NOT full 9:16 — tilted white-bordered card (0.73–0.76 scale) on our own animated red gift-wrap + snow background; SIS ✓ / MOM ✓ / ??? gift tracker; product pills (Kitsch holiday sets, Kitsch Curl Cream); stamps NICE LIST ✓ / 10/10 SON / SAINT NIC TAX; karaoke captions (narrator white, real lines yellow).
- Code: `src/kitsch/KitschStory.tsx` (comps `KitschStory`, `KitschStoryNoMusic`, 30 fps, 36.2 s). Master: loudnorm −14 + alimiter 0.8.
- Renders: `renders/kitsch_storytime_1080p.mp4` (soft bed), `renders/kitsch_storytime_nomusic_1080p.mp4` (add a trending sound in-app at ~10 %).
- Title: "Love Island's Nic turned into Santa for his family 🎅"

## Batch 3 (2026-11-20) — 3 more storytime edits from the NEW folder
- New Dropbox folder (scl/fo/cc9cai8o70khdf1xqdfn3): `Holiday Vid V7 Music 7` (69 s re-cut: NEW intro "I'm not gonna name names, but there are a few women in my life who mean everything to me… I go all out for them",
  NEW ending: "Saint Nic signing off for now" / mirror hype "Who's Saint Nic? You're Saint Nic… you look good, Santa" (Jeep full of Kitsch from behind) / "More deliveries coming. Stay nice.")
  + 2× 12 s BTS BFCM promo (only 3.3–8.3 s clean: Jeep door, Jeep stuffed with Kitsch, box avalanche; rest has "up to 70% off" overlay — not used).
  → `public/kitsch/v1.mp4`, `v2.mp4` (gitignored). V7 intro has burned-in subtitles at y≈1260–1380 → card crop [0,1240].
- Brief re-read 2026-11-20: unchanged.
- Component `src/kitsch/KitschStory3.tsx` (data-driven: theme, particles snow/hearts/sparkle, widget route/list/rank, labels, stamps), configs from `kitsch/build_v3.py`,
  render `kitsch/render_v3.sh` (music + no-music). Narration: ElevenLabs voice tZEvztCqUteWskYtEb5e ("Alex"), eleven_v4, 1 take each → `public/kitsch/narr{A,B,C}.wav`.
- **delivery** (green/gold, delivery-route widget SIS → MOM → ???): "turned his Jeep into a KITSCH delivery truck", ends on "More deliveries coming. Stay nice."
- **women** (blush pink + hearts, "Saint Nic's list"): hook = his own intro line, ends on the mirror hype "you look good, Santa".
- **ranking** (midnight + gold, #4 → #1 countdown): sister's sets / Curl Cream "Saint Nic tax" / mom's haul / #1 ??? → "Who's that one for?" "No." (+ NO COMMENT stamp).

## Performance + meme-frame batch (2026-11-20)
- Our narrated storytime v2 (YT P9g212NrErU on @CLIPFarmClips2026): **10 engaged views, 12.1 % stayed to watch** (88 % swiped in the first 1–2 s).
  Diagnosis: frame 0 = Nic from behind (no face, no product), small hook text in a busy frame (card + tracker + stripes), footage only ~70 % wide, 31 s with narrator setup.
- Benchmark: @arenaclipshq 30PJ_HH2oEs "Saint Nic pulled up with a trunk full of Kitsch and took the Curl Cream tax 😂" — **1.2k views in 8 h**.
  Format (from YT auto-thumbnails): white meme frame, one big emotional hook line ("BRO SPOILED HIS MOM LIKE CRAZY THIS YEAR 😭"), large footage,
  opens on the trunk stuffed with Kitsch, real audio, small one-word captions in the middle.
- **Swipe-test rules now:** frame 0 = big hook text + the strongest picture (face or product) + a real line inside 0.5 s; footage ~full width; 7–10 s; cut every 1–2 s;
  payoff stamp + punch-in; end loops into the start; captions middle-centre.
- `src/kitsch/KitschMeme.tsx` (comps `KitschMeme-<clip>[-nomusic]`, seg `a` = J-cut audio start), render `kitsch/render_meme.sh` → `renders/kitsch_meme_*_1080p.mp4`.
  Clips: **mom** (opens on mom "You did all this?" → "Mother, come outside!"), **tax** (sister "Okay fine, this is cute" → Curl Cream into the belt → "Saint Nic tax"),
  **mystery** (opens on the red Kitsch bag, "Who's that one for?" J-cut → "No." → "Saint Nic, signing off"), **mirror** ("Who's Saint Nic? You're Saint Nic… you look good, Santa" → sister "What are you wearing?"),
  **sister** (POV: your brother is Nic from Love Island → "I'm Saint Nic. Get it?" → "Okay fine. This is cute.").
- Nic source cut points: bag shot starts at 55.55 s (before = sister walking). Disk: GTA sources moved to `.work/archive_public/kreek/v2` (move back to `public/kreek/v2` to re-render KreekV2).
