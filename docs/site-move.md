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

## `.github/workflows/pages.yml`

It builds the game and deploys it to **this repository's own GitHub Pages site** (the `/Repo-A/` address on the
owner's github.io host) on every push to `main` or `claude/new-session-k41b2n`, and on manual runs. It does not
write to the old hub repository or to the new site. It was left as it is. On 2026-11-20 that Pages address still
answered (HTTP 200), so a second public copy of the game exists there, at an address that is not the new site.
Pushes to `claude/epic-feynman-hu09zj` do not trigger it. Whether to keep it is the owner's decision (below).

## Waiting for the owner

1. **Review and merge this branch.** `claude/epic-feynman-hu09zj` is pushed but not merged. Merge it into the
   default branch (`claude/new-session-k41b2n`, or `main` if you create it). Note: a push to either of those
   branches also runs `pages.yml` (item 3).
2. **Publish.** A build of this branch was handed to the site work on 2026-11-20 (to be placed in
   `public/apps/grid-shift/app/`). If the live game still shows the old explainer link, run
   `scripts/deploy-site.sh <site checkout>` as described above. Check: on the live game's home screen, "Watch the
   explainer" must open `https://ahmadnayfeh.com/apps/grid-shift/#video`.
3. **Decide about this repository's own Pages copy.** If you do not want a second copy of the game on the
   github.io address: Settings → Pages → unpublish the site (or set Source to "None"), then delete
   `.github/workflows/pages.yml` in a commit. If you want to keep it as a preview, do nothing.
4. **Decide about the in-game document links before making the repository private.** They only work while this
   repository is public. Options: keep the repository public; or copy the five documents to a public place and
   change `REPO` in `src/ui/Pages.tsx`; or remove the links from the two screens. Nothing was removed.
5. **Optional: create `main`** and make it the default branch (see `docs/NEEDS-AHMAD.md` §2). The in-game links
   need no change for that. The CI badge in `README.md` names the branch `claude/new-session-k41b2n`; change it to
   `main` at the same time.
6. **Optional: the video outro.** The published video
   (`public/apps/grid-shift/media/grid-shift-explainer-ar.mp4` in the site repository) still shows the old address
   `ahmad-nayfeh.github.io/grid-shift` on its last scene. The old address forwards to the new site, so it still
   leads somewhere. `video/stage.html` is already corrected; to fix the video itself, re-run the video pipeline
   (D-020: `video/record.cjs`, `video/encode.cjs`, needs the TTS audio and ffmpeg) and replace the file in the site
   repository by hand.

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
