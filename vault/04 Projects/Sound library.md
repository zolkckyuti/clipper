---
tags: [resource, audio, sfx, music]
date: 2026-11-21
---
# Sound library (user-provided, use from now on)

Back to [[START HERE]] · used by [[KreekCraft GTA 6 campaign]], [[Boeshi GTA 6 campaign]], [[Backyard Breaks campaign]]

User (2026-11-21): "lets use these sound effects next time". Prefer these over the ElevenLabs-generated sfx in `public/byb/`.

## SFX — Drive folder 1R3gdzPcuvUwBfOX-VPlr_MTrfDWGAEpn → `public/sfx2/` (gitignored, 868 KB)
25 files, snake_case names: among_us, bang, bone_crack, boom, camera_flash, cha_ching, click, core, ding, discord_notification,
**fah**, glitter, intro_sound_correct, keyboard_typing, magic_reveal, **meme_boom**, pew, piano_meme, pop, riser, riser_1, riser_2, **rizz**, **roblox**, spongebob.
Re-download: parse the folder page (`["<id>",["<folder id>"],"<name>","audio/mpeg"`) → `drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`.
Suggested map: fahh → `fah`, boom → `meme_boom`, cash → `cha_ching`, pop-ups → `pop`, cuts → `camera_flash`/`click`, reveal → `magic_reveal`,
fails → `bone_crack`/`spongebob`/`piano_meme`, sus → `among_us`, Kreek/Roblox moments → `roblox`, build-ups → `riser*`, chat → `discord_notification`.

## Music — Notion "Background Music Library" (creator-economy.notion.site/Background-Music-Library-492fde9e1dc24f978608c66871789e44)
77 tracks → `.work/lib/music/` (349 MB, NOT in public/ — copy only the chosen track into public/ per batch, bundles copy public/ on every render).
Catalog with vibes: `kreek/music_library.json` (key, title, vibe). Phonk/Hard picks: GigaChad Theme, Close Eyes, Dream Space (DVRST), ESSENCE, METAMORPHOSIS,
Memory Reboot, Suicide Year, INSOMNIA slowed, better off alone (slowed), Vampire Heart.
Download: Notion file cells open a popup with a signed S3 URL (Playwright: click the filename, catch `ctx.waitForEvent('page')`, curl the URL).
⚠️ Many are instrumentals of major-label songs (Kendrick, Drake, Kanye, Metro Boomin…) → Content ID claims/mutes likely on YouTube; prefer the phonk/library-style tracks for Shorts.
