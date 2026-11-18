"""Anti-dupe re-edits (Nov 15): clone the 6 hook+straight-cut edits under new ids with a NEW text hook, a NEW song
(editing-resources BGSONGS, loudness-matched *_n.mp3 + energetic start) and extra effects from the editing resources only
(emoji PNG pops, greenflash2/cashfall overlays, meme SFX). Run after plan6/plan7(+speaker2)/plan8 — it copies their scenes.
The CapCut-style "4K filter" grade is applied in the master step (scratchpad render script), output stays 1080x1920."""
import json
G = json.load(open('src/edits.gen.json'))
C = {}
for f in ['r3', 'r3b', 'tv']: C.update(json.load(open(f'src/{f}.cfg.json')))

def png(at, f, x=870, y=1290, size=200): return dict(at=at, kind='png', file=f, x=x, y=y, size=size)
def ov(at, f, dur=34): return dict(at=at, kind='ov', file=f, dur=dur)
def sfx(at, f, v=0.5): return dict(at=at, kind='sfx', file=f, v=v)

NEW = {
  'tvredeemX': ('tvredeem4', dict(top='Promised $20,000… now it\'s $500', hl={'$20,000…': '#58EE28', '$500': '#FF2A2A'}, music=['suspense_n', 0], cutSfx='s_camflash.mp3',
      extras=[ov(['s1', '$20,000'], 'cashfall.mp4', 52), sfx(['s1', '$20,000'], 's_ding.mp3', 0.4), png(['s1', '$500'], 'e_sob.png'), sfx(['s1', '$500'], 's_fahhh.mp3', 0.45),
              sfx(['s3', 'really'], 's_huh.mp3', 0.5), png(['s3', 'really'], 'e_laugh.png', 260), ov(['s4', 'ripped'], 'greenflash2.mp4')])),
  'r3ripX': ('r3ripH', dict(top='"I got good lawyers" then THIS', hl={'THIS': '#FF2A2A'}, music=['sentamento_n', 55], cutSfx='s_camflash.mp3',
      extras=[sfx(['c1', 'lawyers'], 's_huh.mp3', 0.45), png(['c1', 'one'], 'e_sob.png'), sfx(['c1', 'one'], 's_fahhh.mp3', 0.45),
              ov(['c1', 'wow'], 'greenflash2.mp4'), sfx(['c1', 'wow'], 's_wow.mp3', 0.45), png(['c2', 'suffer'], 'e_laugh.png', 260)])),
  'r3cheatX': ('r3cheatH', dict(top='N3on\'s "bathroom break" got EXPOSED', hl={'EXPOSED': '#FF2A2A'}, music=['montagem_n', 25], cutSfx='s_camflash.mp3',
      extras=[ov(['c1', 'restroom'], 'greenflash2.mp4'), sfx(['c1', 'restroom'], 's_ding.mp3', 0.4), sfx(['c3', 'doing'], 's_huh.mp3', 0.5),
              png(['c3', 'calories'], 'e_laugh.png'), sfx(['c3', 'calories'], 's_awk.mp3', 0.45), png(['c3', 'sorry'], 'e_sob.png', 260)])),
  'r3poleX': ('r3poleH', dict(top='N3on begged them to STOP him', hl={'STOP': '#FF2A2A'}, music=['funkabn_n', 4], cutSfx='s_camflash.mp3',
      extras=[sfx(['c1', 'manly'], 's_huh.mp3', 0.45), png(['c1', 'stupid', 1], 'e_sob.png'), sfx(['c1', 'stupid', 1], 's_fahhh.mp3', 0.45),
              ov(['c2', 'whoa'], 'greenflash2.mp4'), sfx(['c2', 'whoa'], 's_wow.mp3', 0.45), png(['c2', 'stop', 1], 'e_laugh.png', 260)])),
  'r3chatgptX': ('r3chatgptH', dict(top='N3on\'s ChatGPT excuse is CRAZY', hl={'CRAZY': '#FF2A2A'}, music=['empire_n', 20], cutSfx='s_camflash.mp3',
      extras=[png(['c1', 'crushed'], 'e_sob.png'), sfx(['c1', 'crushed'], 's_fahhh.mp3', 0.4), ov(['c2', 'chatgpt'], 'greenflash2.mp4'),
              sfx(['c2', 'chatgpt'], 's_correct.mp3', 0.45), png(['c2', 'lebron'], 'e_laugh.png', 260), sfx(['c2', 'lebron'], 's_awk.mp3', 0.45)])),
  'r3handX': ('r3handH', dict(top='N3on\'s biggest fear doing a HANDSTAND', hl={'HANDSTAND': '#FF2A2A'}, music=['brevis_n', 4], cutSfx='s_camflash.mp3',
      extras=[ov(['c1', 'kick'], 'greenflash2.mp4'), sfx(['c1', 'butt'], 's_huh.mp3', 0.5), png(['c1', 'pop'], 'e_laugh.png'),
              sfx(['c2', 'stripper'], 's_awk.mp3', 0.45), png(['c2', 'stripper'], 'e_sob.png', 260)])),
  'tvgoatX': ('tvgoat', dict(top='He picked WHO as the NBA GOAT?', hl={'WHO': '#FF2A2A'}, music=['empire_n', 20], cutSfx='s_camflash.mp3', hardcut=True, src='goat_g67.mp4',
      extras=[ov(['s1', 'goat?'], 'greenflash2.mp4'), sfx(['s1', 'goat?'], 's_ding.mp3', 0.4), sfx(['s2', 'dellavedova'], 's_huh.mp3', 0.5),
              png(['s2', 'dellavedova'], 'e_laugh.png'), png(['s2', 'tension'], 'e_sob.png', 260), sfx(['s2', 'tension'], 's_awk.mp3', 0.45)])),
}
out = {}
for nid, (old, d) in NEW.items():
    G[nid] = [x for x in G[old] if x['id'] != 'rw'] if d.get('hardcut') else G[old]  # hook + straight cut: no rewind scene
    c = {**C[old], **d}
    sc = {s['id']: s for s in G[old]}
    for e in c['extras']:  # validate refs the same way Guess.tsx resolves them
        s, w, n = (e['at'] + [0])[:3]
        hits = [x for x in sc[s]['words'] if x['word'].lower().startswith(w.lower())]
        assert len(hits) > n, (nid, e['at'])
    out[nid] = c
json.dump(G, open('src/edits.gen.json', 'w'))
json.dump(out, open('src/x.cfg.json', 'w'), indent=1)
print('ok', list(out))
