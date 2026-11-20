#!/bin/bash
# fetch_vid.sh <dir with v.m3u8 + vurl.txt> <start s> <end s> <out.mp4>: cut a window from the 1080p60 VOD (10 s segments)
D=$1; A=$2; E=$3; O=$4; U=$(cat $D/vurl.txt); B=${U%/*}; T=$(mktemp -d -p $D)
s=$(( ${A%.*} / 10 )); e=$(( ${E%.*} / 10 ))
init=$(grep -o 'URI="[^"]*"' $D/v.m3u8 | head -1 | cut -d'"' -f2)
[ -n "$init" ] && curl -s "$B/$init" -o $T/init.mp4
seq $s $e | xargs -P 12 -I{} sh -c "curl -s --retry 4 '$B/{}.mp4' -o $T/\$(printf %06d {}).mp4 || curl -s --retry 4 '$B/{}-muted.mp4' -o $T/\$(printf %06d {}).mp4"
{ [ -f $T/init.mp4 ] && cat $T/init.mp4; cat $T/0*.mp4; } > $T/all.mp4
ffmpeg -v error -y -ss $(python3 -c "print($A - $s*10)") -i $T/all.mp4 -t $(python3 -c "print($E-$A)") -c:v libx264 -preset fast -crf 14 -c:a aac -b:a 256k -output_ts_offset 0 $O
rm -rf $T; ffprobe -v error -show_entries format=duration -of csv=p=0 $O
