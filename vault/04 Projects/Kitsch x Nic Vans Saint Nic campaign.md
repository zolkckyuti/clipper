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
