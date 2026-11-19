---
tags: [project, campaign, kreekcraft, gta6]
date: 2026-11-19
---
# KreekCraft GTA 6 clipping (ClipLaunch)

Back to [[START HERE]] · style: [[VverPaldo style]] (hook + hard cut)

- Brief (Notion, read with Playwright, `domcontentloaded` + 15 s wait; `networkidle` never fires on Notion):
  `app.notion.com/p/KreekCraft-GTA-6-Clipping-Full-Rules-Brief-41c8e335832380cc8667c9359e8c61b7`
- **Rules:**
  - only KreekCraft's official GTA 6 livestreams / replays (YouTube @Kreek streams, twitch.tv/kreekcraft/videos);
  - **official logo overlay visible the WHOLE video** (Drive folder 1sVDw2Ok_eYElCh5a5OmycyPYW_6R2AGr → `KreekCraft Overlay` PNG 2172×724, an "@KreekCraft" pill with Twitch/YouTube icons; local `public/kreek/kreek_overlay.png`, gitignored);
  - caption must include **"Watch KreekCraft on YouTube and Twitch"** + **#GTA6 #KreekCraft #GrandTheftAutoVI**, **no links/URLs**;
  - true to what happened; funny reactions / encounters / fails; drive viewers to his streams;
  - TikTok / Reels / Shorts; 40 %+ Tier-1 audience; public 30+ days; ≥0.8 % engagement, likes visible. $1 CPM, $400 max per clip.
- Source: Twitch VOD **v2932147800** "GTA 6 LIVE ⭐ DAY 1" (19.3 h, 1080p60 max; Twitch has no 4K). YouTube is blocked from the cloud box.

## Pipeline (reuse)
1. yt-dlp's HLS download runs at ~1.3× realtime here. Instead: `yt-dlp -f Audio_Only -g <vod>` → playlist → `curl` the 10 s segments with `xargs -P 16`, then `cat init + segments` (19 h of audio in ~2 min).
2. `.work/kreek/peaks.py` (per-second loudness vs 5-min rolling baseline, sustained spikes, ≥4 min apart) → `.work/kreek/txc.py` (faster-whisper small.en on 75 s windows of the top 14) → pick by transcript.
3. Video for the chosen window: 1080p60 playlist, segments `floor(t/10)`, concat, `-output_ts_offset 0`.
4. Words: faster-whisper large-v3 (`txw.py`). Edit: `kreek/make_croc.py` (one ffmpeg per segment = low memory; a single graph with 6 trims of 1080p60 got OOM-killed),
   facecam crop `410x266+0+136` → 1080×700 on top, gameplay crop → 1080×1100 below, 120 px black hook bar, ASS one-word captions (Montserrat Black instanced from the variable woff2 at wght 900 → `.work/fonts/`), 2-frame white flash on cuts, logo at (500, 660) 560 px wide over the facecam corner, swear muted.
5. Output: 1080×1920 60 fps master (CRF 15) + 2160×3840 lanczos upscale (4K uploads get a better platform codec). 4K files are >100 MB: not committed.

## Candidate moments found (Day 1, stream time)
- **11:28:50 crocodile bet** (used, test clip): "If I get eaten by a crocodile I'll give away an extra copy… there's no way" → gets grabbed → "somebody clip that… a crocodile bites my leg".
- 7:01:18 "grand theft mobility scooter" → "granny is after me".
- 10:50:07 runs out of gas right after a giveaway promise.
- 12:00:52 drops the dog he was carrying, panics. 17:13:54 dog-poop throwing (gross, lower priority).
- Avoid: 13:34 (Mandy comments), 7:43:51 (NSFW scene, "there goes my stream").

## Feedback log
- Test clip: user asked which caption field gets the phrase + hashtags → YouTube: title + 3 hashtags (<100 chars), phrase + hashtags in the description; TikTok/IG one box. User uploads the 4K versions.
- 2026-11-19 "make 5 more" → "just give me the best 5": gas, swim, plane, scooter, dance (`kreek/clips/*.json`, `kreek/make_clip.py`, swears auto-muted + starred).
  Rejected: "lady" (he knocks a woman NPC down: promo risk), "dog" (too dark / unclear), 16:16 camera bit, 17:27 'run over a disabled person' joke, 3:47 shower.
- 2026-11-19 user: **"apply some vverpaldo editing style… flashing lights and phonk in the background so viewers won't swipe off"** → `vv` block per clip config:
  CapCut grade (contrast 1.1, sat 1.25, unsharp), 5 % black flicker every 3 frames, punch-in zoom 1.13 on key words (gameplay half only, zoompan),
  red/green tint hits (0.27 s) + white blow-out + shock/rizz SFX, camera-flash SFX + 2-frame white flash on cuts, pop on punches,
  phonk from BGSONGS (aura, funk abnormal, alquimia, empire, sentamento, brevis; loudnorm −20, drop offset) at 0.7, **sidechain-ducked under the stream audio**
  (≈ −23 dB in gaps, voice stays on top). Dance clip: music OFF during "there's no music because of the copyright" (the joke). Outputs `kreek_<name>_vv_{1080p60,4k60}.mp4`.
