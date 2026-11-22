#!/bin/sh
# Builds the Chrome Web Store upload zip from the committed source.
# Only the files Chrome needs go in; README, LICENSE, store/ and scripts/ stay out.
set -eu
cd "$(dirname "$0")/.."
version=$(sed -n 's/^ *"version": *"\([^"]*\)".*/\1/p' manifest.json)
[ -n "$version" ] || { echo "Could not read version from manifest.json" >&2; exit 1; }
mkdir -p dist
out="dist/search-grid-$version.zip"
rm -f "$out"
zip -q -r -X "$out" manifest.json content.js grid.css popup.html popup.js icons
echo "Wrote $out"
