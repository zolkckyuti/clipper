#!/bin/bash
# render Backyard Breaks clips (1080x1920 60 fps, 9:16 per the SOP) -> loudness master in renders/
cd /home/user/clipper; mkdir -p out/byb
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for n in "$@"; do
  rm -rf /tmp/remotion-webpack-bundle-*
  npx remotion render src/index.ts Byb-$n out/byb/raw_$n.mp4 --concurrency=4 --browser-executable=$B --crf=14 --log=error || { echo "FAIL $n"; continue; }
  ffmpeg -v error -y -i out/byb/raw_$n.mp4 -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=disabled,aresample=48000" -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 renders/byb_${n}_1080p60.mp4
  rm -f out/byb/raw_$n.mp4; echo "DONE $n"
done
rm -rf /tmp/remotion-webpack-bundle-*
