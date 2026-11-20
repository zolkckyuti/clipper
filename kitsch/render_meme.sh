#!/bin/bash
# render Kitsch meme batch (music + no-music) -> loudness master in renders/
cd /home/user/clipper; mkdir -p out/kitsch
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for n in "$@"; do for v in "" "-nomusic"; do
  rm -rf /tmp/remotion-webpack-bundle-*
  npx remotion render src/index.ts KitschMeme-$n$v out/kitsch/rawm_$n$v.mp4 --concurrency=4 --crf=14 --browser-executable=$B --log=error || { echo "FAIL $n$v"; continue; }
  o=renders/kitsch_meme_${n}${v/-/_}_1080p.mp4
  ffmpeg -v error -y -i out/kitsch/rawm_$n$v.mp4 -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.8:level=disabled,aresample=48000" -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 $o
  rm -f out/kitsch/rawm_$n$v.mp4; echo "DONE $o"
done; done
rm -rf /tmp/remotion-webpack-bundle-*
