#!/bin/bash
# Recursively process PNG images:
#   - Create "-lowRes.png" if missing
#   - Always recreate "-thumbnail.png" (for testing different scales)

find . -type f \( \
    -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.bmp" -o -iname "*.webp" \
\) ! -iname "*-lowRes.*" ! -iname "*-thumbnail.*" | while read -r img; do
    dir=$(dirname "$img")
    base=$(basename "$img")
    name="${base%.*}"
    ext="${base##*.}"

    lowres="${dir}/${name}-lowRes.${ext}"
    thumb="${dir}/${name}-thumbnail.${ext}"

    # --- Low-res version ---
    if [[ ! -f "$lowres" ]]; then
        echo "Creating low-res: $lowres"
        ffmpeg -i "$img" -vf scale=20:-1 "$lowres"
    else
        echo "Skipping existing low-res: $lowres"
    fi

    # --- Thumbnail version ---
    echo "Recreating thumbnail: $thumb"
    ffmpeg -y -i "$img" -vf scale=80:-1 "$thumb"
done