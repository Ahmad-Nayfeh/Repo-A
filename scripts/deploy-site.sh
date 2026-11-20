#!/usr/bin/env bash
# Publish the built game to the site repository Ahmad-Nayfeh/ahmadnayfeh.com, folder public/apps/grid-shift/app/
# (served at https://ahmadnayfeh.com/apps/grid-shift/app/). The site rebuilds itself on every push to its main.
#
# Usage:
#   scripts/deploy-site.sh /path/to/ahmadnayfeh.com-checkout            build, copy, commit, push to main
#   scripts/deploy-site.sh /path/to/ahmadnayfeh.com-checkout --no-push  the same, but stop before the push
#
# What it does: builds the game, updates the site checkout (git pull --rebase on main), empties and refills
# ONLY public/apps/grid-shift/app/, commits only that folder, pulls again and pushes to main.
# The old about/ page is not published any more: its text lives in the site repository
# (content/apps/details/grid-shift.ts) and the game links to it with ../#video. Details: docs/site-move.md
set -euo pipefail
site="${1:?path to a checkout of Ahmad-Nayfeh/ahmadnayfeh.com}"
push=1
[ "${2:-}" = "--no-push" ] && push=0
here="$(cd "$(dirname "$0")/.." && pwd)"
rel="public/apps/grid-shift/app"

site="$(cd "$site" && pwd)"
git -C "$site" rev-parse --is-inside-work-tree >/dev/null
origin="$(git -C "$site" remote get-url origin)"
case "$origin" in
  *[Aa]hmadnayfeh.com|*[Aa]hmadnayfeh.com.git|*[Aa]hmadnayfeh.com/) ;;
  *) echo "Refusing: $site is not a checkout of ahmadnayfeh.com (origin: $origin)" >&2; exit 1 ;;
esac
if [ "$(git -C "$site" rev-parse --abbrev-ref HEAD)" != "main" ]; then
  echo "Refusing: the site checkout is not on main" >&2; exit 1
fi
if [ -n "$(git -C "$site" status --porcelain)" ]; then
  echo "Refusing: the site checkout has uncommitted changes" >&2; exit 1
fi

(cd "$here" && npx vite build)
if grep -rIlE 'ahmad-nayfeh\.github\.io|ahmadnayfeh\.vercel\.app|about/#video' "$here/dist" >/dev/null; then
  echo "Refusing: the build still contains an old address" >&2; exit 1
fi

git -C "$site" pull --rebase origin main
dest="$site/$rel"
rm -rf "$dest"
mkdir -p "$dest"
cp -r "$here/dist/." "$dest/"
git -C "$site" add -A -- "$rel"
if git -C "$site" diff --cached --quiet -- "$rel"; then
  echo "Nothing to publish: $rel is already up to date."; exit 0
fi
rev="$(git -C "$here" rev-parse --short HEAD)"
git -C "$site" commit -m "Grid Shift: publish build from Repo-A@$rev" -- "$rel"
if [ "$push" = 0 ]; then
  echo "Committed in $site (not pushed: --no-push)."; exit 0
fi
git -C "$site" pull --rebase origin main
git -C "$site" push origin HEAD:main
echo "Published to https://ahmadnayfeh.com/apps/grid-shift/app/ (live after the site's deploy workflow finishes)."
