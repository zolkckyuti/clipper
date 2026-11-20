#!/bin/bash
# native 4K60 render of KreekV2 comps (--scale=2) -> loudness master
cd /home/user/clipper; mkdir -p out/gta
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for n in "$@"; do
  npx remotion render src/index.ts KreekV2-$n out/gta/raw_$n.mp4 --scale=2 --concurrency=4 --browser-executable=$B --crf=16 --log=error || { echo "FAIL $n"; continue; }
  rm -rf /tmp/remotion-webpack-bundle-*
  ffmpeg -v error -y -i out/gta/raw_$n.mp4 -map_metadata -1 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.85:level=disabled" -ar 48000 -c:a aac -b:a 256k -movflags +faststart out/gta/gta6_${n}_4k60.mp4
  rm -f out/gta/raw_$n.mp4; echo "DONE $n"
done
