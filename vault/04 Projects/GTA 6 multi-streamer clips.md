---
tags: [project, gta6, n3on, kaicenat, ishowspeed]
date: 2026-11-20
---
# GTA 6 clips — N3on, Kai Cenat, IShowSpeed

Back to [[START HERE]] · style: [[KreekCraft GTA 6 campaign]] (KreekV2 edit, pop-ups, hook first, never cut early, native 4K60)

- User: "non duplicate non lazy edit… don't disrespect the streamer in any way". No campaign brief given → KreekCraft rules adapted
  (caption: "Watch <streamer> on <platform>" + #GTA6 #<Streamer> #GrandTheftAutoVI, no links, true to what happened). Text badge instead of a logo.
- **Sources**
  - N3on: Kick (`kick.com/api/v2/channels/n3on/videos` lists VODs with an IVS `master.m3u8`; 1080p60 `.ts` segments; **English auto-subtitles** at `subtitles/en/playlist.m3u8` → whole-stream transcript in seconds).
    Kick blocks Python's default user agent → `kreek/fetch_hls.py` sends a curl UA. Clips API: `/api/v2/channels/n3on/clips?sort=view&time=week`.
  - Kai Cenat: Twitch VOD v2932305259 "PLAYING GTA 6 FOR THE FIRST TIME" (46 h, public, 1080p60). Top clips are mostly cutscenes (lazy) → scanned the first 14 h of audio
    (`kreek/fetch_audio_part.sh … 5040`), peaks + transcripts.
  - IShowSpeed: GTA 6 only on YouTube (bot-check from the cloud box) and no Twitch clips → **not reachable**; needs a file/Dropbox from the user.
- **Respect filter:** skipped strip-club/"gyatt"/lap-dance/nudity clips and any line that makes the streamer the joke; N3on's lead-in line ("I need money to get…") cut out; swears auto-muted.
- **n3onclip** (Kick VOD 2026-11-18, 2:10:54 + 2:15:35): NPC says "clip that" → "Did he just say clip that?" → "this game was literally meant for IRL streamers" → "I can't believe a civilian said clip it". 33 s.
  Facecam [0,0,428,292], Kick-green badge (`badge_color`, `badge_tag`).
- **kaigame** (Twitch 4:21:30–4:23:40): finds a playable game ("Tenebrae Lux") on the TV inside GTA 6 → "Chat, we got a game inside of a game!". 35 s. Facecam [0,432,391,220].
  Whisper disagreed on the hook ("Child/Tell me/Chat, we got…") → used "Chat, we got"; title card confirms "ink of destiny".

## 2026-11-21 — "replicate the Easter-egg win" batch
- Our YT Short xEy3AgqQeSw ("KreekCraft said NO EASTER EGG = NO STREAM", @zolkckyuteCLIPS / "GTA Clipped") popped off.
  Why: stakes/bet in the title → hook teases the payoff → suspense (climb, fake-out) → a real reveal. **Formula: goal/bet → tension → payoff.**
- Found moments with that shape: KreekCraft Twitch top clips (7d) + `kreek/locate_clip.py` (audio-envelope cross-correlation finds a clip's offset in the VOD audio, score >0.9),
  N3on Kick subtitle transcript grep for "six stars / first person / I bet / let's see if".
- **jetski** (Day 2 4:05–4:08): chat vote "type 1 if real" → "if a dog on a jet ski comes and picks me up…" → it does → "greatest game of all time" → "can I take a selfie with him?". 40 s.
- **sixstars** (N3on Kick 3:27–3:32): "I want to be the first person to get six stars" → "I got four stars… I need six!" → "bleeding out" → "you cannot beat six stars, we learned a very valuable lesson". 36 s.
- **heli** (Day 2 0:31–0:34): "I think we can pull this off" → "I want this one" → "Oh my god, we got it" → 4 stars → "lock in". 43 s. (Not confirmed military → title says "from the airport".)
- Memory: never run whisper large-v3 next to a 4K Remotion render (both got OOM-killed). Run heavy jobs one at a time.
