#!/bin/bash
# Slight warm grade on a prepped clip source (in place) so re-posts of similar footage aren't fingerprinted as duplicates.
# Footage only (run on public/kreek/v2/<name>_src.mp4 before rendering, never on text/overlays). Usage: kreek/warm.sh <src.mp4>...
for f in "$@"; do
  ffmpeg -v error -y -i "$f" -vf "colorbalance=rs=0.06:gs=0.01:bs=-0.06:rm=0.04:bm=-0.04:rh=0.03:bh=-0.03,eq=saturation=1.05:contrast=1.02" \
    -c:v libx264 -preset medium -crf 15 -pix_fmt yuv420p -c:a copy -movflags +faststart "${f%.mp4}_w.mp4" && mv "${f%.mp4}_w.mp4" "$f" && echo "warmed $f"
done
