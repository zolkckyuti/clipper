#!/bin/bash
# fetch_audio.sh <twitch vod id> <out dir>: whole VOD audio fast via parallel segment curl
set -e; V=$1; D=$2; mkdir -p $D/aseg
U=$(yt-dlp -f Audio_Only -g "https://www.twitch.tv/videos/${V#v}" | head -1); B=${U%/*}
curl -s "$U" > $D/a.m3u8
grep -v '^#' $D/a.m3u8 | awk -v b="$B" -v d="$D/aseg" '{printf "url = \"%s/%s\"\noutput = \"%s/%06d.ts\"\n", b, $0, d, NR}' > $D/curl.cfg
split -n l/16 -d $D/curl.cfg $D/cc_ 2>/dev/null || true
# keep url/output pairs together: split by pairs instead
rm -f $D/cc_*; awk 'NR%2==1{u=$0;next}{print u"\n"$0 > sprintf("'$D'/cc_%02d", int((NR/2-1)%16))}' $D/curl.cfg
ls $D/cc_* | xargs -P 16 -I{} curl -s --retry 4 -K {}
init=$(grep -o 'URI="[^"]*"' $D/a.m3u8 | head -1 | cut -d'"' -f2)
{ [ -n "$init" ] && curl -s "$B/$init"; cat $D/aseg/*.ts; } > $D/audio_raw
ffmpeg -v error -y -i $D/audio_raw -vn -c:a copy $D/audio.m4a 2>/dev/null || ffmpeg -v error -y -i $D/audio_raw -vn -ac 1 -ar 16000 $D/audio.wav
rm -rf $D/aseg $D/audio_raw $D/cc_* $D/curl.cfg; ls -la $D
