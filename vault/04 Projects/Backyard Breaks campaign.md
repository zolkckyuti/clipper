---
tags: [project, campaign, backyardbreaks, byb]
date: 2026-11-21
---
# Backyard Breaks x ClipHouse

Back to [[START HERE]] · style: [[VverPaldo style]] + [[KreekCraft GTA 6 campaign]] energy

- Tracker (source of truth, footage + values): Google Sheet 1eX0vqF73N9x2gtkRbalnKMHRd3nbd-CEv0Rt4D2glM4 — tabs: 1203111212 historical big pulls (value column!),
  1029565171 "most important" Trevor Lawrence stream moments (no card values), 133317179 recent moments (980 rows, PSA column), 183567664 published viral references (not footage).
  Export: `…/export?format=csv&gid=<gid>`. Drive footage: `drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`.
- Guides: SOP doc 1dG6Moh7TzSKqKfHtB_QL8HngdG_y015Q, brand/niche guide 1iGL3Px-ymZSCK36iE5jKv9W6vpT5bX_i.
- **Rules:** caption has **@backyardbreaks AND #BackyardBreaks** (3–5 hashtags: `@backyardbreaks #BackyardBreaks #BBPulls #Whatnot`), ≥15 s, 9:16 1080x1920,
  hosts' real audio, one moment per clip, only tracker footage, **price on screen = tracker value** (ranges ok / "$100K+"), no other streamers/celebs, nothing that makes hosts look bad,
  account name has BYB/Backyard Breaks, bio `whatnot.com/invite/backyardbuzz`, ≥50 % US, don't reply to comments/delete, screen-recorded analytics proof per clip (form), $2/1K, $250 max.
- Caption formula: [value/rarity] + [reaction] + "Watch the next break live on Whatnot 👇" + tags. First 3 s = money/rarity/reaction/tension.
- Template `src/byb/BybClip.tsx` (comps `Byb-<name>`), configs `kreek/clips/byb_*.json` (prep via `kreek/prep_v2.py`, snap via `kreek/snap_segs.py`), render `kreek/render_byb.sh` → `renders/byb_<name>_1080p60.mp4`.
  Look: hook text + green price badge + rarity pill, captions in the band between host cam and card, zoom into reactions (`react`) and cards (`byb.cards`),
  **rotating transitions at every cut** (zoom-blur / whip pan / flash+shake, whoosh), phonk ducked under hosts, sfx: FAHH, deep boom, cash-register cha-ching (price + reveal), crowd "ooh", air horn
  (all ElevenLabs-generated in `public/byb/`, gitignored).
- **Never put the price on the wrong card:** hosts often hold OTHER cards while describing the chase → `byb.price_hide` windows (Flagg until the pink Papa appears at 48.0 s; Star Wars until the triple auto at 57.5 s).
- Batch 1 (2026-11-21): **clark** ($234,000 gold vinyl auto 1/1 — host jumps in the trash can), **flagg** ($100,000+ Papa auto 1/1 — "we do that!"),
  **dart** ($200K–$250K Papa auto 1/1 — "I wasn't leaving without hitting it"; skipped his Superfractor line, different tracker row/value), **starwars** ($12,000+ triple auto super 1/1 — delayed realization).
  LeBron triple logoman ($2.4M) is a 15-min horizontal multi-cam recording; reveal ~9:00–9:50 needs frame-by-frame check before clipping.

## 2026-11-21 — Trevor Lawrence batch (5 clips, 1080p60) — `src/byb/TrevClip.tsx`
- User: 5 × 1080p Trevor Lawrence BYB clips (NBA GOAT + anything Trevor), follow the BYB Whop/Content Rewards rules, copy the *approach* of youtube.com/@backyardbreaks_clipzz
  (YouTube download is bot-checked from the cloud box → studied titles + thumbnails only): formula "The #1 Football Player / Trevor Lawrence … 💀 @BackyardBreaks",
  16:9 footage centred in a 9:16 frame, white title on top, word captions, meme cutaways. Their best: PSA 10 celly 24k, coaches/left 12k, autograph roast 7.9k, sPnX late auto 5.5k, GOAT 4.9k.
- Footage = tracker tab 1029565171 (19 Drive clips of the 10.20.26 stream, Grant + Bugsy "Traveling Trevors" in wigs). Downloaded 8 → `.work/tl/src/`. ("trevors" Drive file is actually the roll-left story.)
- New template **TrevClip** (comps `Trev-<name>`): blurred backdrop, 1080×1150 footage panel with `focus` keyframes [t, cx, cy, zoom] (eased 0.35 s reframes onto the speaker),
  punch-ins, react zoom, rotating cut transitions, freeze stamp, pop-ups, emoji `stickers` (public/emoji-ios), named `sfx` from the user's pack (public/sfx2), phonk from the
  user's library (public/tl/music/*.wav, loudnorm −20), captions at y≈1040 (user: middle-center, slightly below). beats.py now anchors focus/stickers/sfx. Render `kreek/render_trev.sh`.
- Clips: **goat** (6-s silence → "gotta be Matthew Dellavedova"), **celly** (PSA 10 celly), **josh** (Josh Allen true gold → "the real Josh Hines-Allen before he changed his name"),
  **ticket** (Grant gifts Trevor his own signed national-championship ticket — he never had one), **sig** (goated pen → Peyton Manning called him about signatures).
- Skipped the Anthony Richardson autograph roast (respect) and anything already posted as-is by the reference channel's edit; no price badges (Trevor tab has no card values).

## 2026-11-22 — Trevor batch 2 (5 clips, 1080p60) — "keep milking Trevor, make them different, high effort"
- User: same format, add flashes but **ONE colour only per clip** (not the blue/red/green cycle of the Kreek Day 4 edit). TrevClip `flash_color` (blue|green|red) +
  `flash` times; hit tints (vv.red/green) also switch to that colour when flash_color is set.
- **Cold-open hooks** (punchline first → "⏪ rewind" pop → setup → payoff). When the hook's source window overlaps a story segment, snap_segs transcribes those words twice →
  dedupe the snap words (same word within 0.15 s) before prep, or captions show "65 65".
- Clips: **tl2_goat** (green; hook "gotta be Matthew Dellavedova"), **left** (red; throws better moving left — youth coaches only rolled right; superfan "best QB I've ever seen"),
  **presnap** (blue; "50–65% of the time"), **peyton** (green; texts Peyton, called him when his rookie year wasn't going well, Peyton led the league in INTs),
  **redeem** (red; late autograph $20K → $500, "your most expensive sale ever").
- Skipped: playbook segment (only first 60 s has speech, dry), golf dream 4 (not downloaded).
