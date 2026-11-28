#!/usr/bin/env bash
# Search Grid export pipeline
# Rebuilds exports/*.png and *.ico from the vector sources in exports/svg/.
# Run from anywhere:  bash search-grid-export.sh
# Needs rsvg-convert (librsvg) or cairosvg, and ImageMagick for the .ico files.
# To change the artwork itself, use the brand kit (see notes.txt).

set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$HERE/exports/svg"
OUT="$HERE/exports"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

ras() {   # ras SOURCE.svg OUT.png WIDTH HEIGHT   (empty WIDTH keeps the aspect)
  local src="$SRC/$1" out="$OUT/$2" w=$3 h=$4
  mkdir -p "$(dirname "$out")"
  if command -v rsvg-convert >/dev/null; then
    if [ -n "$w" ]; then rsvg-convert -w "$w" -h "$h" "$src" -o "$out"
    else rsvg-convert -h "$h" "$src" -o "$out"; fi
  else
    if [ -n "$w" ]; then cairosvg "$src" --output-width "$w" --output-height "$h" -o "$out"
    else cairosvg "$src" --output-height "$h" -o "$out"; fi
  fi
  echo "  ✓ $2"
}

ico() {   # ico SOURCE.svg OUT.ico SIZE...
  local src=$1 out=$2; shift 2
  local parts=()
  for n in "$@"; do
    SRC_SAVE="$OUT"; OUT="$TMP"; ras "$src" "ico-$n.png" "$n" "$n" >/dev/null; OUT="$SRC_SAVE"
    parts+=("$TMP/ico-$n.png")
  done
  if command -v magick >/dev/null; then magick "${parts[@]}" "$OUT/$out"; else convert "${parts[@]}" "$OUT/$out"; fi
  echo "  ✓ $out"
}

echo "Search Grid exports -> $OUT"
ras "card-1280x640.svg" "github-social-1280x640.png" 1280 640
ras "card-1200x630.svg" "og-image-1200x630.png" 1200 630
ras "icon.svg" "chrome-extension-icon16.png" 16 16
ras "icon.svg" "chrome-extension-icon32.png" 32 32
ras "icon.svg" "chrome-extension-icon48.png" 48 48
ras "icon-cws128.svg" "chrome-extension-icon128.png" 128 128
ras "cws-promo-small-440x280.svg" "cws-promo-small-440x280.png" 440 280
ras "cws-marquee-1400x560.svg" "cws-marquee-1400x560.png" 1400 560
echo "── Complete: 8 exports ──"
