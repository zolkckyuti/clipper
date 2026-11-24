#!/bin/bash
# Boeshi "same guy btw" contrast meme: render part A (KreekV2-<n>, high-pitched stream moment) and part B (BoFit-<n>,
# physique reveal + GigaChad drop), join them hard (B opens on its own white flash), master loudness -> renders/boeshi_<n>_1080p60.mp4
cd /home/user/clipper; mkdir -p out/bo6
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for n in "$@"; do
  rm -rf /tmp/remotion-webpack-bundle-*
  npx remotion render src/index.ts KreekV2-$n out/bo6/a_$n.mp4 --concurrency=4 --browser-executable=$B --crf=14 --log=error || { echo "FAIL A $n"; continue; }
  npx remotion render src/index.ts BoFit-$n out/bo6/b_$n.mp4 --concurrency=4 --browser-executable=$B --crf=14 --log=error || { echo "FAIL B $n"; continue; }
  ffmpeg -v error -y -i out/bo6/a_$n.mp4 -i out/bo6/b_$n.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a];[a]loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=disabled,aresample=48000[ao]" \
    -map "[v]" -map "[ao]" -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p -r 60 -c:a aac -b:a 256k -movflags +faststart -map_metadata -1 renders/boeshi_${n}_1080p60.mp4
  rm -f out/bo6/a_$n.mp4 out/bo6/b_$n.mp4; echo "DONE $n"
done
rm -rf /tmp/remotion-webpack-bundle-*
