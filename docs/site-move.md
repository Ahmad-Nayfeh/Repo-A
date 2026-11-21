# Site move: Grid Shift now lives on ahmadnayfeh.com

Date of this work: **2026-11-20**. Branch: `claude/epic-feynman-hu09zj`.

## What happened

The owner moved his site and all his apps from the old hub (`ahmad-nayfeh.github.io`, repository
`Ahmad-Nayfeh/Ahmad-Nayfeh.github.io`, now retired) to his own domain. The new site is one repository,
`Ahmad-Nayfeh/ahmadnayfeh.com` (Next.js built to plain files, published by GitHub Pages on every push to its `main`).

There were no players besides the owner, so nothing is kept working at the old address and nothing is migrated.

## New addresses

| What | Address |
|---|---|
| The running game | https://ahmadnayfeh.com/apps/grid-shift/app/ |
| Information page (English) | https://ahmadnayfeh.com/apps/grid-shift/ |
| Information page (Arabic) | https://ahmadnayfeh.com/ar/apps/grid-shift/ |
| Explainer video section | https://ahmadnayfeh.com/apps/grid-shift/#video |
| Explainer video file | https://ahmadnayfeh.com/apps/grid-shift/media/grid-shift-explainer-ar.mp4 |
| The owner's site | https://ahmadnayfeh.com/ |

Old addresses: the game was at `ahmad-nayfeh.github.io/grid-shift/` and the video page at `.../grid-shift/about/`.

## Where Grid Shift lives in the site repository

| Path in `Ahmad-Nayfeh/ahmadnayfeh.com` | What it is | Who writes it |
|---|---|---|
| `public/apps/grid-shift/app/` | The built game (contents of `dist/`) | `scripts/deploy-site.sh` in this repository |
| `public/apps/grid-shift/media/` | Explainer video, Arabic captions, poster | By hand when the video changes |
| `content/apps/details/grid-shift.ts` | Text of the game's page, English and Arabic | By hand when features change |
| `public/images/apps/grid-shift/` | Screenshots on the page | By hand when screens change |
| `content/apps/index.ts` | The one-line entry in the apps list | Only this app's entry |

## What changed in this repository, and why

| File | Old | New | Why |
|---|---|---|---|
| `src/ui/Pages.tsx` (home screen) | `href="./about/#video"` | `href="../#video"` | The `about/` page is gone. The information page with the video is one level above the game. |
| `src/ui/Pages.tsx` (`REPO`, used by 7 links on the Model notes and About screens) | `https://github.com/ahmad-nayfeh/repo-a/blob/claude/new-session-k41b2n` | `https://github.com/Ahmad-Nayfeh/Repo-A/blob/HEAD` | The links named the working branch. `HEAD` means the repository's default branch, so the links keep working when `main` is created and made the default. See "In-game document links" below. |
| `scripts/deploy-site.sh` | Copied `dist/` into `<hub checkout>/grid-shift/`, keeping `about/`; no git steps | Publishes `dist/` to `public/apps/grid-shift/app/` in a checkout of `Ahmad-Nayfeh/ahmadnayfeh.com`: pull, empty and refill that folder only, commit only that folder, pull again, push to `main` | New home of the built game. |
| `README.md` | 4 links to `https://ahmad-nayfeh.github.io/grid-shift/` (one of them `.../about/`) | `https://ahmadnayfeh.com/apps/grid-shift/app/`, `https://ahmadnayfeh.com/apps/grid-shift/#video`, plus the information page in both languages; new "Publishing" paragraph | Old address retired. |
| `video/stage.html` (outro scene of the explainer video) | `ahmad-nayfeh.github.io/grid-shift` | `ahmadnayfeh.com/apps/grid-shift` | Source of the video only. The published video file was NOT re-rendered (see "Waiting for the owner"). |
| `docs/STATUS.md` | "LIVE at https://ahmad-nayfeh.github.io/grid-shift/" | The new addresses and a pointer to this file | Keep notes true. |
| `docs/DECISIONS.md` | D-020 named the old `about/` address | D-020 updated; new entry D-021 records the move | Decision log. |
| `docs/NEEDS-AHMAD.md` | Named the old hub address and this repository's Pages address | New §0 pointing here; §1 and §4 reworded (§4 now warns about the in-game links before making the repository private) | Keep notes true. |
| `CLAUDE.md` | (did not exist) | Short summary of the move, pointing here | So a new session finds this record. |
| `docs/site-move.md` | (did not exist) | This file | The record. |

Not changed: the engine, the tests, `vite.config.ts` (`base: './'` already makes every path relative), the CI
workflow, `.github/workflows/pages.yml` (see below), dependencies.

Other things the move touches, with no code change needed:

- **Share and replay links** are built from the page's own address (`location.href` up to `#`), so they now start
  with `https://ahmadnayfeh.com/apps/grid-shift/app/#/`.
- **Saved progress** (local storage keys starting with `gs.`) is tied to the address. The new address starts
  empty. Accepted by the owner; no migration was built.
- **Updates:** a browser game has no updater. Players get the new version when the page is reloaded after a publish.
- **The old `about/` page:** its source was never in this repository (it lived only in the old hub). Its text now
  lives in the site repository, `content/apps/details/grid-shift.ts`. The site repository currently holds a small
  forwarding file `public/apps/grid-shift/app/about/index.html`; the next publish removes it, which is intended
  now that the link is fixed.

## How publishing works now

1. Have a clean checkout of `Ahmad-Nayfeh/ahmadnayfeh.com` on its `main` branch, with push access.
2. In this repository run the checks: `npm ci`, `npm run typecheck`, `npm run lint`, `node scripts/check_sources.mjs`, `npm test`.
3. Run `scripts/deploy-site.sh /path/to/ahmadnayfeh.com-checkout`
   (add `--no-push` to stop after the local commit and look at it first).
   The script:
   - refuses to run if the folder is not a checkout of `ahmadnayfeh.com`, is not on `main`, or has uncommitted changes;
   - runs `npx vite build`, and refuses to go on if the build contains an old address;
   - runs `git pull --rebase origin main` in the site checkout;
   - deletes `public/apps/grid-shift/app/` and refills it with `dist/`;
   - commits only that folder ("Grid Shift: publish build from Repo-A@<commit>");
   - runs `git pull --rebase origin main` again and pushes to `main`.
4. Wait for the site's `deploy` workflow to finish, then test the live address (below).
5. If the release changed what the page says (features, screenshots), edit `content/apps/details/grid-shift.ts` and
   `public/images/apps/grid-shift/` in the site repository in the same push.

Never hand-edit the built files with hashed names.

## In-game document links

The Model notes and About screens link to five documents in this repository: `docs/design/FIDELITY.md`,
`docs/VALIDATION.md`, `docs/DECISIONS.md`, `research/SOURCES.md`, `research/SYNTHESIS.md`.

Facts checked on 2026-11-20:

- This repository (`Ahmad-Nayfeh/Repo-A`) is **public** (GitHub API: `"visibility": "public"`).
- It has **no `main` branch**. Its only branch before this work, and its default branch, is `claude/new-session-k41b2n`.
- All five documents open without signing in under `.../blob/HEAD/...` (HTTP 200). Under `.../blob/main/...` they return 404.

So the links now use `blob/HEAD`, which follows the default branch. They work today and will keep working after
`main` is created and made the default. They stop working for players if the repository is made private.

## `.github/workflows/pages.yml` (changed on 2026-11-21)

Until 2026-11-21 this workflow built the game and deployed a **second public copy** to this repository's own
GitHub Pages address (the `/Repo-A/` address on the owner's github.io host). Two public copies at two addresses
confuse players and search engines, and the copy could drift from the real one.

The owner left the decision to the session that did the move. Decision: the Pages address now only forwards.

- `pages-redirect/index.html` is a small page that sends the visitor to
  `https://ahmadnayfeh.com/apps/grid-shift/app/` and keeps the in-game route (the part after `#`).
- `pages.yml` deploys only that folder (the same file also as `404.html`). It runs when `pages-redirect/` or the
  workflow itself changes on the default branch, and on a manual run. It no longer builds or tests the game
  (`ci.yml` does the tests).
- The game is published only with `scripts/deploy-site.sh`.

## Decisions taken on 2026-11-21 (the owner delegated them)

1. **The repository stays public.** The game links to five documents here (Model notes and About screens). They
   only open while the repository is public, the game is an educational project with no secrets, and it is under
   the MIT licence. If it is ever made private, first move those documents somewhere public and change `REPO` in
   `src/ui/Pages.tsx`, or remove the links.
2. **The second copy was turned into a forwarding page** (section above).
3. **The explainer video's last scene now shows the new address.** Only the outro was recorded again and joined
   to the published video; the sound track is unchanged. Tool: `node video/outro-only.cjs <existing.mp4> <result.mp4>`.
   It needs `video/serve/` (not in git) with a copy of `video/stage.html` and `fonts/fonts.css` plus the four
   IBM Plex Sans Arabic `.woff2` files (400, 500, 600, 700; copies are in `app/font-files/` of the site
   repository). Checked by looking at frames at 222 s (previous scene, untouched) and 230 s (new address). The new
   file replaced `public/apps/grid-shift/media/grid-shift-explainer-ar.mp4` in the site repository; the subtitle
   file did not change. For any other change to the video, use the full pipeline (D-020).

## Still waiting for the owner

1. **Optional: create `main`** and make it the default branch (see `docs/NEEDS-AHMAD.md` section 2). The in-game
   links need no change for that. The CI badge in `README.md` names the branch `claude/new-session-k41b2n`; change
   it to `main` at the same time.
2. Play the game once on a phone at `https://ahmadnayfeh.com/apps/grid-shift/app/` (not tested on a real device).

## How to test

Locally, from a sub-folder that matches the live layout:

```bash
npm ci && npm run build
mkdir -p /tmp/gs/apps/grid-shift && cp -r dist /tmp/gs/apps/grid-shift/app
echo '<div id="video">info page</div>' > /tmp/gs/apps/grid-shift/index.html
(cd /tmp/gs && python3 -m http.server 8080)
```

Open http://localhost:8080/apps/grid-shift/app/ and check:

- it loads with no failed requests; every route works after a reload: `#/daily`, `#/training`, `#/play`,
  `#/tutorial`, `#/glossary`, `#/about`, `#/grading`, `#/notes`;
- "Watch the explainer" on the home screen opens `/apps/grid-shift/#video`;
- a share link made in the game starts with the page's own address followed by `#/`;
- play one lesson to the end and reload: progress is kept;
- `grep -rE 'ahmad-nayfeh\.github\.io|github\.io/grid-shift|ahmadnayfeh\.vercel\.app' dist src scripts README.md video .github`
  finds nothing.

After a publish, repeat the same checks on https://ahmadnayfeh.com/apps/grid-shift/app/ and check that the video
plays with captions on https://ahmadnayfeh.com/apps/grid-shift/#video.

Results on 2026-11-20 (local, Chromium, served from `/apps/grid-shift/app/`): typecheck, lint and
`check_sources` pass; 75 unit/golden/property tests pass; 12 end-to-end tests pass on Chromium (Firefox and WebKit
were not available in the work container; CI runs them); all routes load after reload with no failed requests and no
console errors; the explainer link resolves to `/apps/grid-shift/#video`. The publish script was tested against a
throwaway local repository, not against the real site. The live site was not tested with the new build because
it was not published by this work.
