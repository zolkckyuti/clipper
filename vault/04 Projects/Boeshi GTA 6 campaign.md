---
tags: [project, campaign, boeshi, gta6]
date: 2026-11-21
---
# Boeshi GTA 6 (ClipLaunch)

Back to [[START HERE]] · style: [[KreekCraft GTA 6 campaign]] (KreekV2) + [[VverPaldo style]]

- Brief (Notion, read with Playwright): app.notion.com/p/Boeshi-GTA-6-Clipping-Full-Rules-Brief-4158e335832381febd29c4548e838f42
- **Rules:** only recent GTA 6 Twitch VODs (twitch.tv/darealboeshi/videos); **overlay visible the whole clip** (Drive folder 1KECKu4u44NuzAgd6MsoJxL2qUsPbFzw9 → `Boeshi Overlay.png`,
  2172×724 "@darealboeshi" Twitch pill → `public/boeshi/overlay.png`, gitignored); **caption must include twitch.tv/darealboeshi**; 40 %+ Tier-1; 0.8 %+ engagement; 30 days up;
  no misleading titles / reuploads / near-identical clip >5×. $1 CPM, $300 max/clip.
- Priorities: voice jokes / his voice bits, mewing when focused/scared (visual — only claim it if it's on screen), funny reactions, chad edits, Sam-Sulek-style relatable meme captions.
- User (2026-11-21): 10 clips, KreekCraft style + transitions + meme sfx + pop-ups + zooms + phonk, **never cut mid-sentence, ≤35 s, 1080p60 only (no 4K, no no-music version)**.
- VODs: v2934693823 (6.1 h — **2:26–5:10 is Resident Evil, not GTA**), v2933399801 (2 h), v2933364081 (27 min). Facecam [12,148,406,274] (top-left box), social bar bottom-left.
- KreekV2 now: `transitions: true` (rotating zoom-blur / whip / flash at every cut + whoosh), `meme: {fahh, airhorn, boom, ooh}`, `overlay` path; comp ids replace `_` with `-`.
  Render: `kreek/render_1080.sh bo-<name>` → `renders/gta6_bo-<name>_1080p60.mp4`.
- Batch 1 (10): block (blocks Mandy from chat "with her body"), paint (watching paint dry), birds (killed 4 birds), pool (on purpose), height (ankle monitor + "who are your height"),
  plane (can't get in the plane), doom (doomscrolling in GTA, fed the rat), voice ("my voice gives them the creeps… innocent little child"), shoot (fight the street, gun controls), cops (lost the cops → Lambo).
- Skipped: apples (IRL facecam, not GTA), revive (sensitive "condition" line), RE4 segments, "straight/gay" chat banter.
- **Batch 2 (2026-11-21, overnight)** from new VOD **v2935956182** "Streaming GTA 6 At 3AM (GONE WRONG)" (2.8 h; playlist uses `N.ts` segments → fetch with `kreek/fetch_hls.py`, not fetch_vid.sh).
  Anti-viewjail changes vs batch 1: user's SFX pack (`sfx2: true` + named `sfx`), music from the user's library (`music_src: tl/music/*.wav`), music held **15 dB under speech**
  (`music_gain` via kreek/music_gain.py), captions at `cap_y: 1150`, relatable-meme titles, ends snapped to real pauses (kreek/finish_cuts.py).
  Clips: **mozart** (chores → "I listen to Beethoven and Mozart on GTA… we are not the same", phonk muted during the in-game symphony via vv.music_off, drops on "we"),
  **donnie** (begging Donnie to open the trailer door), **meditate** (meditated until he teared up), **gym** (225 ×5 → "I'm doing 410 for RDLs… is that kind of crazy?"), **buckme** (BuckMe app name, "fire the marketing team", ad).
  Skipped: voice-filter bit (no setup/payoff), haram cutscene (1:42), shootouts with no reaction.
- **Batch 4 (2026-11-23)** — user: "good hooks, shorter clips, just 3… higher quality videos that go viral rather than none reaching the minimum".
  New VOD **v2938193982** "Streaming GTA 6 (gone right)" (he was live; first 42 min used). 17–22 s each, cold-open hooks, one flash colour, music 15 dB under.
  **bo4_cool** (red; "am I cool so far?" → "I'm gonna fail this mission" → "yeah I failed the mission bro" → "I just spat on my screen"; no cutaway on the fail-screen hook),
  **bo4_secret** (green; "I actually have a secret, only people in the live will know… I'm making a Roblox game"; Roblox sfx from the pack),
  **bo4_glasses** (blue; "why do you have glasses?" → "I'm LARPing being blind" → "why do you have a microphone? what is this trend…").
  large-v3 missed "Am I entertaining? Am I cool so far?" → used the small.en full-VOD words for that window.
  Other candidates in this VOD: pre-workout anxiety (24:04), "I feel like I'm third wheeling" (7:44), "not a good Samaritan" car wreck (14:48), "she looked like me in my videos" (31:48).
