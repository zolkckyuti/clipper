---
tags: [style, viral, all-campaigns]
date: 2026-11-25
---
# Viral Shorts playbook (ALL campaigns, from 2026-11-25)

Back to [[START HERE]] · builds on [[VverPaldo style]] (3-second rule) · assets: editing-resources Drive `11RA-8-Am7HJW5Hzr0051f_eUgl0YBtMw` → `public/res/`

## The user's rule (2026-11-25, every video from now on)
Every clip is built in three jobs, in this order:
1. **HOOK** (first 1–3 s): visual + audio + on-screen text all hook (see [[VverPaldo style]] 3-second rule).
2. **RETENTION** (make them watch to the END): something changes every ≤3 s (cut / zoom / pop-up / sfx, never the same pattern twice in a row),
   open a question in the hook that is only answered at the end, end on the payoff or a seamless loop back into the hook. 15–25 s.
3. **ENGAGEMENT** (like, comment, subscribe): a debate/comment prompt mid-video (italic `cta`, e.g. "*comment your NBA GOAT*"),
   caption ends with a question, short "like + follow" `endcta` in the last 1.6 s.

## What the reference shorts do (41 BYB × Trevor shorts in the user's REFERENCES doc, 2026-11-25)
- **Layout:** black frame, short white bold title on top (1–2 lines, always ends in 💀 or another emoji), footage box under it.
- **Titles/hooks:** money framing ("$20,000 card", "player worth $40M"), "Imagine being so famous…", "POV: …", "Bro …💀", reaction framing
  ("…Made Trevor Lawrence Lose It 😭"), debate bait ("Do y'all agree with him?💀", "Is this glaze valid?💀", "Who is your NBA GOAT?").
- **Captions:** ONE word at a time, white, active/key words green; action tags in green italics with asterisks (*thinking*, *impressed*).
  Clear the caption as soon as the word is spoken (guideline flaw: "player" stayed on screen while he was silent).
- **Pop-ups:** big centred images (NBA GOAT photos etc.) with a GREEN flash (good pick: ding/correct/cash sfx) or RED flash (meme/bad pick:
  fahhh/shocked sfx); raining money overlay BEHIND images on money moments; red circle + arrow and red italic "*TREVOR LAWRENCE*" call-out;
  green "+10,000$ USD" style number call-outs; mid-video italic "*comment your …*" line.
- **Idle moments:** slow zoom in + suspense sfx instead of cutting them out when the pause IS the joke (GOAT pick thinking).
- **Finish:** sharpen (pop-ups extra), noise reduction, colour/contrast boost (CapCut 4K-filter look), 1080×1920.
- **Music (guideline):** the dialogue must be clearly audible, music still noticeable; vocal songs 10–12 dB under the voice.
  BGSONGS: Wtf u tryna say / Ts Pmo / Kai Cenat suspense (0:00–0:15), Joyful-chess (0:02–0:17), Say Goodbye-Lodoni (0:00–0:15).

## BYB specific (user, 2026-11-25)
- On-screen text for card-value clips (e.g. the **redemption** $20,000 → $500 card) relates to **PS5 / GTA 6**, YouTube-Shorts humour:
  "Bro could've bought 20 PS5 Pros with this card 💀" · "Bro's card value got robbed like GTA 6 💀" · (more: "This card dropped faster than GTA 6
  delays 💀", "$20,000 → $500… that's not even a PS5 Pro anymore 💀"). Keep numbers true to what's said in the clip.

## Implementation
- `src/kreek/ViralFX.tsx` (used by **TrevClip** and **KreekV2**): props `cap_word: true`, `cta: [t, text]`, `imgpops: [[t, img, 'good'|'meme', size]]`,
  `money: [[t, dur]]`, `callout: [[t, text, x, y]]`, `endcta: "text"`; sfx + panel flash are added automatically.
- Assets in `public/res/` (gitignored): skull/sob/laugh/think/rizz PNGs, circle_arrow.png, money_fall.webm (keyed from the green-screen mp4),
  money/ding/correct/awkward/fahhh/shock/swoosh/suspense/huh/mogged sfx.
- Brand campaigns with "no memes" briefs (Dr Dulude) keep the hook/retention/engagement structure but skip meme pop-ups and meme sfx.
