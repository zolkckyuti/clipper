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
- 2026-11-19 user: **all Shorts stuck at 1–10 views ("view jail")**, asked for higher-quality, less "lazy/duplicate" edits.
  Diagnosis given: 1–10 views = not distributed at all → usually duplicate/reused-content fingerprint (same moments, same facecam-top layout as every other clipper),
  copyrighted phonk (muted/limited), or account trust. Advice: keep clips public (brief: 30 days; unlisting can void payout), never re-upload the same clip, one niche per account,
  post 1–3/day fast after streams, first frame = action + hook, check retention graphs, add music in-app on TikTok instead of baking it in.
  → **Edit v2** (`src/kreek/KreekV2.tsx`, comps `KreekV2-<clip>`, props `src/kreek/v2/<clip>.json` from `kreek/prep_v2.py`, render `.work/render_kv2.sh`):
  full-height gameplay window (source x≈520–1400, facecam excluded) + facecam PiP (crop 50..370 × 136..402) that bounces on hits and grows into a big
  **reaction cutaway** on his loudest lines (`react` windows), **freeze-frame + red stamp** on the payoff (`freeze`), context chip ("HOUR 11 OF THE GTA 6 STREAM"),
  karaoke captions (3 words, active word yellow / red for key words), title visible from frame 0, grade + flicker + tints + punch-ins + cut flashes,
  phonk at 40 % until the `drop` then full, ducked under voice; whoosh on cutaway in/out. Logo pill bottom-center always.

## 2026-11-20 — Day 2 batch (2 clips, native 4K60)
- Source: Twitch VOD **v2933758895** "GTA 6 LIVE (FULL GAME) ALL ENDINGS | DAY 2" (10.6 h). Fetch: `kreek/fetch_audio.sh` (audio) + `kreek/fetch_vid.sh <dir> <a> <b> <out>` (1080p60 window).
- **Day 2 layout changed:** facecam is a green-screen cutout top-left (no box) → `cam: [20,110,380,360]`, sub counter under it.
- KreekV2 template now takes per-clip `src_wh`, `cam`, `game` (centre x, y range), `badge` (text pill instead of the Kreek logo — Kreek clips keep the official logo). Captions now clear 0.7 s after the last word.
- 4K: rendered natively with Remotion `--scale=2` (`kreek/render_gta.sh`), not upscaled after.
- **kidsgame** (VOD 9:29:50–9:31:00, tower climb): kid in chat asks him to explain GTA 6 so his mom buys it → "learn how to drive… help grandmas… rescue cats… really good game for kids, you learn a lot". Freeze stamp "GTA 6 IS RATED M".
- **easteregg** (VOD 9:32:00–9:34:20): "if there's not an Easter egg up here I'm ending the stream" → do not fall off → parachute fake-out → "Shut the front door" → nest of real Easter eggs. Hook "Bro… are you serious?" at the nest.
- Rejected: bird knocks itself out (1:40:32, bird too small to see), pool-bed cutscene (2:05, mostly scripted dialogue), naked old man (4:45, nudity), Karen (1:46, weaker).

## 2026-11-20 — Day 2 batch 2 (3 clips, 15–22 s, pop-ups, native 4K60)
- User: same style as the last Kreek clips + **pop-ups + hook at the start + 15–22 s** + 4K.
- Day 2 VOD grew to 11.6 h; re-scanned all of it (`.work/gta/kd2b`, 45 candidates, 31 new ones transcribed with small.en → `txc_rest.log`).
- KreekV2 now takes `pops: [[t, text], …]` (white bubbles right side, alternating tilt, pop sfx).
- **fixher** (VOD 2:33:20): hook "But, but, but, I can fix her" → Mandy is a murderer (finger / bone saw / acid / duct tape pop-ups) → "she might be a serial killer" → freeze "But who isn't?". (whisper: "bond salt" = "bone saw").
- **joking** (1:54:00): hook "Now, Mandy th— no, I'm joking!" (freeze "HE SAID MANDY") → chat: make Lucia look like your wife → "I could never make Lucia as attractive as my IRL wife… good answer, right chat?" → "I'm joking" spiral.
- **mike** (1:34:20): hook "I look like a stripper" (shirtless blazer) → chat picks black jacket + pants → "what's that movie with Channing Tatum?" → freeze "MAGIC MIKE" → "our shoes even match".
- Rejected from the re-scan: shoe-store / "booty cheeks" (5:27), porn-set cutscene (11:17), blur-or-McDonald's (10:11, ok but weaker), old man (6:17), containers (3:06, weaker).

## 2026-11-21 — Day 3 batch (5 clips, 1080p60, Boeshi-style extras)
- Source: Twitch VOD **v2934981732** "🔴LIVE! BEATING GTA 6 (ALL ENDINGS) | GIVEAWAYS | DAY 3" (grabbed at 10.5 h while still live). Same green-screen cam as Day 2 (`cam [20,110,380,360]`).
- User: same Kreek format + phonk, pop-ups, zooms, meme sfx, fahh, transitions; 1080p only. Work dir `.work/kd3` (45 peaks, all transcribed small.en → `tx.log`).
- **d3_bank** (1:35:40 Fleeca back office → "did I just accidentally break into a bank?" → "if it didn't save I'm deleting the game" → "it saved!" at 1:43).
- **d3_never** (4:00:14 sub counter 657,000 → drops; "who wants a free car? Oh never mind… we didn't hit the sub goal"); cam widened `[10,110,400,465]` so the counter shows.
- **d3_crash** (6:38 reads chat, runs a red light: "I gotta stop reading the chat" ×4). **d3_roblox** (8:00 Roblox kid NPC + 8:13 "this is gonna be me in 10 years… I'm the Roblox guy").
- **d3_ending** (3:22 "did IShowSpeed get the bad ending? don't tell me" → 4:01 $2M family savings for the best ending → 6:13 "we're gonna get the good ending").
- Rejected: wife/club bit (13:52, his IRL wife), "don't clip that" (4:56, unclear cause), Three Plate Club + showers (suggestive), "Can I play Roblox?" (not the NPC kid).
