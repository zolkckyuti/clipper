"""Write TrevClip props for the Dulude podcast+b-roll clips (src/kreek/v2/<name>.json) from .work/gd/<name>.words.json.
Brief (Clipping Culture): professional and clean, NO memes / jokes / humorous edits, no logos, he must be in every clip.
So: no freeze stamp (pushed past the end, which also silences its meme boom), no stickers, no meme sfx; flash only where it fits.
3-second rule: hook line on frame 0 (cold open), striking b-roll shot first, curiosity title.
Usage: python3 kreek/gd/make_props.py"""
import json, re, subprocess

CLIPS = {
    'gd_anx': dict(top='The first thing you must fix when you meet anyone', music='thelema',
                   hl=['ANXIETY', 'THREAT', 'NEUTRALIZE', 'FIX'], punch=['NEUTRALIZE', 'THREAT'],
                   pops=[('s1', 0.05, '⏪ here is why'), ('s2', 0.1, 'new = threat to the brain 🧠')]),
    'gd_rel': dict(top='Why you can never force a connection with someone', music='luminary',
                   hl=['VULNERABILITY', 'RELATIONSHIP', 'CANNOT', 'FORCE'], punch=['VULNERABILITY', 'COMPENSATION'],
                   pops=[('s1', 0.05, '⏪ the full idea'), ('s1', -6.5, 'connection = a response 🤝')]),
    'gd_trust': dict(top='How he earns a tribe’s trust without saying a word', music='landing',
                     hl=['MIMIC', 'EYE', 'CONTACT', 'MOVEMENT', 'THREAT', 'TRUST'], punch=['MIMIC', 'MOVEMENT'],
                     pops=[('s1', 0.05, '⏪ his method'), ('s1', 6.2, 'mirror their body language')]),
    'gd_hier': dict(top='The first thing to read in any group of people', music='br2049',
                    hl=['HIERARCHY', 'SURVIVAL', 'READ'], punch=['HIERARCHY'],
                    pops=[('s1', 0.05, '⏪ why it matters'), ('s1', -6.0, 'this applies to you too 👀')]),
    'gd_money': dict(top='How he traveled the world with no money', music='dragonfly',
                     hl=['MONEY', 'VALUABLE', 'CONNECTION', 'TRUST', 'COMMUNICATION'], punch=['VALUABLE', 'MONEY'],
                     pops=[('s1', 0.05, '⏪ the challenge'), ('s2', 0.1, 'be valuable to people')]),
    'gd_olymp': dict(top='He trained for the Olympics and had no plan B', music='echosax',
                     hl=['OLYMPICS', 'PLAN', 'B', 'PSYCHOLOGIST', 'FUNDING', 'DREAM'], punch=['OLYMPICS', 'FUNDING', 'PSYCHOLOGIST'],
                     pops=[('s1', 0.05, '⏪ his story'), ('s2', 0.1, 'the turning point')]),
    'gd_special': dict(top='A tribe would tell you: you are NOT special', music='thelema',
                     hl=['SPECIAL', 'SPECIAL.', 'UNIQUE,', 'PROOF', 'PROOF?', 'SELF-ESTEEM.', 'DONE?'], punch=['SPECIAL.', 'PROOF?', 'DONE?'],
                     pops=[('s1', 0.05, '⏪ the tribe\'s rule'), ('s2', 0.1, 'proof > self-esteem')]),
    'gd_respect': dict(top='Respect is not a value. It is a science.', music='luminary',
                     hl=['RESPECT', 'SCIENCE.', 'SPORT.', 'READ', 'SOMEONE.', 'OBSERVING'], punch=['SCIENCE.', 'SPORT.', 'OBSERVING'],
                     pops=[('s1', 0.05, '⏪ what he means')]),
    'gd_food': dict(top='Why he never refuses food a tribe offers him', music='landing',
                     hl=['VULNERABLE.', 'VULNERABLE,', 'REJECTED,', 'OFFER,', 'MOUTH.', 'TIC', 'TACS.', 'SACRIFICING'], punch=['VULNERABLE.', 'REJECTED,', 'MOUTH.'],
                     pops=[('s1', 0.05, '⏪ the wrong answer'), ('s2', 0.1, 'food = trust 🤝')]),
}
norm = lambda t: re.sub(r"[^A-Za-z0-9*'$]", '', t).upper()
import sys
ONLY = sys.argv[1:]
for name, c in CLIPS.items():
    if ONLY and name not in ONLY: continue
    W = json.load(open(f'.work/gd/{name}.words.json'))
    dur = W['dur']; seg_at = {sid: (o, b - a) for sid, a, b, o in W['segs']}
    cuts = [{'id': sid, 'a': o, 'b': round(o + b - a, 3), 'src': a} for sid, a, b, o in W['segs']]
    FIX = {'naturalize': 'neutralize', 'disapplies': 'this applies', 'naturalize.': 'neutralize.'}
    words = [{'t': FIX.get(w[2].lower(), w[2]), 'a': w[0], 'b': w[1], 'seg': w[3]} for w in W['words']]
    def T(sid, off):
        o, d = seg_at[sid]; return round(o + (off if off >= 0 else d + off), 3)
    props = {'name': name, 'dur': dur, 'top': c['top'], 'cuts': cuts, 'words': words, 'hl': c['hl'],
             'src_wh': [1080, 1150], 'focus': [[0, 540, 575, 1.0]], 'music': c['music'],
             'vv': {'red': [], 'green': [], 'punch': c['punch']},
             'freeze': [dur + 30, ''], 'react': [], 'chip': [T('s1', 0.4), 'DR. GUILLAUME DULUDE · PSYCHOLOGIST'],
             'drop': T('s1', 0), 'pops': [[T(s, o), txt] for s, o, txt in c['pops']],
             'brand': ['Dr. Guillaume Dulude', ' · psychology'],
             'sfx': [[0.0, 'riser', 0.18]]}
    json.dump(props, open(f'src/kreek/v2/{name}.json', 'w'), indent=1, ensure_ascii=False)
    out = subprocess.run(['python3', 'kreek/music_gain.py', f'src/kreek/v2/{name}.json', f'public/kreek/v2/{name}_src.mp4',
                          f'public/tl/music/{c["music"]}.wav'], capture_output=True, text=True).stdout.strip()
    print(out)
