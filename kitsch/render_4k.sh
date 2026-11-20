#!/bin/bash
# render Kitsch storytime batch 3 (music + no-music) -> loudness master in renders/
cd /home/user/clipper; mkdir -p out/kitsch
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for n in "$@"; do for v in "" "-nomusic"; do
  rm -rf /tmp/remotion-webpack-bundle-*
  npx remotion render src/index.ts Kitsch3-$n$v out/kitsch/raw4k_$n$v.mp4 --scale=2 --concurrency=4 --crf=16 --browser-executable=$B --log=error || { echo "FAIL $n$v"; continue; }
  o=out/kitsch/kitsch_${n}${v/-/_}_4k.mp4
  ffmpeg -v error -y -i out/kitsch/raw4k_$n$v.mp4 -c:v copy \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.8:level=disabled,aresample=48000" -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 $o
  rm -f out/kitsch/raw4k_$n$v.mp4; echo "DONE $o"
done; done
rm -rf /tmp/remotion-webpack-bundle-*
