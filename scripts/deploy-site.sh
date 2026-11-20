#!/usr/bin/env bash
# Copy the built game into the site repository (ahmad-nayfeh.github.io/grid-shift/), keeping the intro page
# (grid-shift/about/: explainer video, poster, screenshots). Usage: scripts/deploy-site.sh /path/to/site-repo
set -euo pipefail
site="${1:?path to the ahmad-nayfeh.github.io checkout}"
here="$(cd "$(dirname "$0")/.." && pwd)"
(cd "$here" && npx vite build)
dest="$site/grid-shift"
mkdir -p "$dest"
find "$dest" -mindepth 1 -maxdepth 1 ! -name about -exec rm -rf {} +
cp -r "$here/dist/." "$dest/"
echo "Copied build to $dest (about/ kept). Commit and push the site repository."
