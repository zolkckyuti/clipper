"""MJ x Loaded Tea clip builder. Usage: python3 -I mj.py <clip_id> [preview]
Footage-only grade 67, 4% flicker on footage only, 2-frame white flash + camflash on cuts,
watermark on top for the whole video (nothing drawn over it), Montserrat Black captions."""
import json, subprocess, sys, os

D = os.path.dirname(os.path.abspath(__file__))
PX = D + '/px/'
RES = '/home/user/Me-editing/viral-short/public/res/'
OUT = D + '/out'
os.makedirs(OUT, exist_ok=True)
A9, V63, V64 = 'A009C003_261020JC-005.mp4', 'IMG_3763_2-004.mp4', 'IMG_3764_2.mp4'

G67 = ("split[ga][gb];[gb]gblur=sigma=14[gg];[ga][gg]blend=all_mode=softlight:all_opacity=0.245,"
       "unsharp=5:5:1.74:5:5:0,eq=contrast=1.113:saturation=1.26:gamma=0.98,"
       "curves=all='0/0 0.25/0.21 0.75/0.81 1/1',unsharp=3:3:0.79,format=yuv420p")

Y = r'{\c&H00E5FF&}'  # yellow
W = r'{\c&HFFFFFF&}'

CLIPS = {
    'mjpepsi': dict(layout='box', hook='MJ party verdict:\\N' + Y + 'BETTER' + W + ' than Pepsi',
        segs=[(A9, 701.0, 703.6), (A9, 689.0, 707.2)],
        caps=[(0, 701.0, 702.0, "YOU KNOW WHAT?"), (0, 702.4, 703.6, "THIS IS BETTER THAN PEPSI"),
              (1, 689.3, 692.5, "ZERO GRAMS"), (1, 692.5, 693.2, "OF FAT"), (1, 693.2, 694.1, "ZERO SUGAR"),
              (1, 694.1, 695.4, "NO CARBS, NO CARBS"), (1, 697.3, 698.8, "SO GOOD"),
              (1, 701.0, 702.0, "YOU KNOW WHAT?"), (1, 702.4, 702.84, "THIS IS"),
              (1, 702.84, 703.7, "BETTER THAN PEPSI"), (1, 705.4, 707.2, "IT'S BETTER THAN PEPSI")]),
    'mjpaused': dict(layout='v', hook='They ' + Y + 'PAUSED' + W + ' the MJ show\\Nfor these drinks',
        segs=[(V63, 435.5, 437.9), (V63, 386.3, 390.9), (V63, 404.9, 410.95), (V63, 424.6, 430.0)],
        caps=[(0, 435.66, 436.9, "DELICIOUS"), (0, 437.18, 437.9, "I'M ALIVE"),
              (1, 386.4, 388.0, "WE HAVE FULLY"), (1, 388.0, 388.81, "PAUSED THE PERFORMANCE"),
              (1, 388.81, 390.7, "TO JUST GIVE THEM DRINKS"),
              (2, 405.2, 407.2, "OH, THERE'S STRAWS HERE TOO"), (2, 410.0, 410.95, "THIS PARTY IS GREAT"),
              (3, 424.8, 425.62, "CHEERS,"), (3, 425.62, 426.6, "EVERYBODY, LET'S CHEERS"),
              (3, 428.94, 429.95, "CHEERS!")]),
    'mjsugar': dict(layout='v', hook='No sugar. No carbs.\\NThe MJ party ' + Y + 'DREAM' + W + ' drink',
        segs=[(V63, 450.1, 451.8), (V63, 439.9, 457.1)],
        caps=[(0, 450.18, 451.8, "IT WAS LIKE THE DREAM DRINK"),
              (1, 440.02, 440.9, "THAT'S REFRESHING"), (1, 443.02, 444.34, "YEAH, THERE'S NO SUGAR"),
              (1, 445.0, 446.2, "OH MY GOSH, Y'ALL"), (1, 446.2, 447.76, "SERIOUSLY, THERE IS NO SUGAR"),
              (1, 448.7, 449.66, "NO CARBS"), (1, 450.18, 451.72, "IT WAS LIKE THE DREAM DRINK"),
              (1, 454.6, 455.2, "YES"), (1, 456.2, 457.05, "YES, GIRL")]),
    'mjdance': dict(layout='v', hook='Blue MJ vs Black MJ\\N' + Y + 'DANCE-OFF',
        segs=[(V63, 48.0, 50.0), (V63, 14.0, 31.0), (V63, 46.5, 52.0)],
        caps=[(1, 14.0, 15.8, "MOVE IT. MOVE IT."), (1, 16.0, 19.5, "THEY ROLLED UP THE RUG"),
              (1, 22.0, 26.0, "BLUE MJ VS BLACK MJ"), (2, 46.8, 49.5, "THE KICK THOUGH")]),
    'mjred': dict(layout='v', hook='When the ' + Y + 'RED JACKET' + W + ' MJs\\Ntake the floor',
        segs=[(V64, 179.0, 181.5), (V64, 116.0, 130.0), (V64, 183.0, 190.0)],
        caps=[(1, 116.3, 120.0, "RED JACKETS ONLY"), (2, 183.2, 187.0, "THEN EVERYONE JOINED IN")]),
}


def ts(t):
    t = max(t, 0)
    return '%d:%02d:%05.2f' % (t // 3600, t % 3600 // 60, t % 60)


def build(cid, preview=False):
    c = CLIPS[cid]
    box = c['layout'] == 'box'
    segs = c['segs']
    durs = [b - a for _, a, b in segs]
    starts = [sum(durs[:i]) for i in range(len(segs))]
    total = sum(durs)
    cuts = starts[1:]
    hook_y, cap_y = (525, 1470) if box else (580, 1300)

    # ASS
    ass = [
        '[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 2', '',
        '[V4+ Styles]',
        'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
        'Style: Hook,MontBlackX,80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,6,2,5,40,40,0,1',
        'Style: Cap,MontBlackX,86,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,3,5,60,60,0,1',
        '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    ass.append('Dialogue: 1,%s,%s,Hook,,0,0,0,,{\\pos(540,%d)\\fscx85\\fscy85\\t(0,120,\\fscx100\\fscy100)}%s'
               % (ts(0), ts(total + 1), hook_y, c['hook']))
    for si, a, b, text in c['caps']:
        _, sa, sb = segs[si]
        o0 = starts[si] + max(a, sa) - sa
        o1 = starts[si] + min(b, sb) - sa
        if o1 - o0 < 0.15:
            continue
        ass.append('Dialogue: 2,%s,%s,Cap,,0,0,0,,{\\pos(540,%d)\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}%s'
                   % (ts(o0), ts(o1), cap_y, text))
    assf = '%s/%s.ass' % (OUT, cid)
    open(assf, 'w').write('\n'.join(ass) + '\n')

    cmd = ['ffmpeg', '-v', 'error', '-y']
    for f, a, b in segs:
        cmd += ['-ss', '%.3f' % a, '-t', '%.3f' % (b - a), '-i', PX + f]
    n = len(segs)
    cmd += ['-loop', '1', '-i', D + '/wm_crop.png', '-i', RES + 's_camflash.mp3']
    fc = []
    for i, d in enumerate(durs):
        if box:
            base = '[%d:v]fps=30,setpts=PTS-STARTPTS,crop=1200:1080' % i
        else:
            base = '[%d:v]fps=30,setpts=PTS-STARTPTS,scale=1080:1920' % i
        if i == 0:  # hook punch-in that eases out
            z = "(1.12-0.12*min(t/%.3f,1))" % d
            base += ",crop=w='iw/%s':h='ih/%s':x='(iw-ow)/2':y='(ih-oh)/2'" % (z, z)
            base += ',scale=1080:972' if box else ',scale=1080:1920'
        elif box:
            base += ',scale=1080:972'
        fc.append(base + ',setsar=1,format=yuv420p[v%d]' % i)
        fc.append('[%d:a]asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a%d]' % (i, i))
    fc.append(''.join('[v%d][a%d]' % (i, i) for i in range(n)) + 'concat=n=%d:v=1:a=1[cv][ca]' % n)
    flick = "drawbox=c=black@0.04:t=fill:enable='lt(mod(t,0.1),0.05)'"
    if box:
        # grade the footage (fg + its blurred bg), then lay out
        fc.append('[cv]' + G67 + ',' + flick + ',split[f1][f2]')
        fc.append('[f2]scale=2560:1920,crop=1080:1920,boxblur=28:2,eq=brightness=-0.12[bg]')
        fc.append('[bg][f1]overlay=0:610[lay]')
    else:
        fc.append('[cv]' + G67 + ',' + flick + '[lay]')
    flashes = ','.join("drawbox=c=white@0.9:t=fill:enable='between(t,%.3f,%.3f)'" % (t, t + 0.066) for t in cuts)
    fc.append('[lay]' + flashes + '[fl]')
    fc.append('[%d:v]format=rgba,scale=1000:-1,split[wm][ws]' % n)
    fc.append('[ws]colorchannelmixer=rr=0:gg=0:bb=0:aa=0.5,gblur=sigma=9[sh]')
    fc.append("[fl]subtitles=filename='%s':fontsdir='%s/fonts'[sub]" % (assf, D))
    wm_y = 150 if box else 170
    fc.append('[sub][sh]overlay=42:%d:shortest=1[subs]' % (wm_y + 4))
    fc.append('[subs][wm]overlay=40:%d:shortest=1,format=yuv420p[vout]' % wm_y)
    sfx = '[%d:a]volume=0.55,asplit=%d' % (n + 1, len(cuts)) + ''.join('[s%d]' % i for i in range(len(cuts)))
    fc.append(sfx)
    for i, t in enumerate(cuts):
        fc.append('[s%d]adelay=%d|%d[sd%d]' % (i, t * 1000 - 40, t * 1000 - 40, i))
    fc.append('[ca]' + ''.join('[sd%d]' % i for i in range(len(cuts))) +
              'amix=inputs=%d:normalize=0:duration=first[aout]' % (1 + len(cuts)))
    raw = '%s/%s_raw.mp4' % (OUT, cid)
    cmd += ['-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]', '-t', '%.3f' % total,
            '-c:v', 'libx264', '-preset', 'veryfast' if preview else 'slow', '-crf', '20', '-profile:v', 'high',
            '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'pcm_s16le', '-ar', '48000', raw.replace('.mp4', '.mov')]
    subprocess.run(cmd, check=True)
    raw = raw.replace('.mp4', '.mov')
    # two-pass loudnorm, video copied, metadata stripped
    m = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
    ln = ('loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:'
          'offset=%s:linear=true' % (j['input_i'], j['input_tp'], j['input_lra'], j['input_thresh'], j['target_offset']))
    final = '%s/%s.mp4' % (OUT, cid)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', ln + ',aresample=48000', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '192k', '-map_metadata', '-1', '-map_chapters', '-1',
                    '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact',
                    '-movflags', '+faststart', final], check=True)
    os.remove(raw)
    print(cid, 'done %.2fs' % total, final)


if __name__ == '__main__':
    build(sys.argv[1], len(sys.argv) > 2)
