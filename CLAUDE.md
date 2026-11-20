# Notes for Claude Code sessions

## Site move (2026-11-20): read `docs/site-move.md`

Grid Shift moved from the old hub (the owner's github.io address, folder `grid-shift/`) to the owner's own domain:

- The running game: https://ahmadnayfeh.com/apps/grid-shift/app/
- Its information page (text, screenshots, explainer video at `#video`): https://ahmadnayfeh.com/apps/grid-shift/ (Arabic: https://ahmadnayfeh.com/ar/apps/grid-shift/)

What this means when you work here:

- Publishing is `scripts/deploy-site.sh <checkout of Ahmad-Nayfeh/ahmadnayfeh.com>`. It writes only `public/apps/grid-shift/app/` in that repository and pushes to its `main`. Nothing is published to the old hub repository any more.
- The game is served one level below its information page. Keep the build's relative paths (`base: './'`) and hash routes. The home screen's explainer link is `../#video`.
- The old `about/` page is gone. The page text lives in the site repository (`content/apps/details/grid-shift.ts`), not here.
- Do not reintroduce the old address anywhere.

`docs/site-move.md` has the full record: every change, how to publish, how to test, and what is still waiting for the owner. Start-of-session reading is still `docs/STATUS.md`.
