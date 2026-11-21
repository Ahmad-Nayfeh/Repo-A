# Needs Ahmad

Only items that truly need the owner. Nothing here asks for data (D-004a).

## 0. Site move to ahmadnayfeh.com (2026-11-20): steps waiting for you

See **docs/site-move.md**. On 2026-11-21 the open decisions were taken for you: the repository stays public, this repository's own GitHub Pages address now only forwards to the game on ahmadnayfeh.com, and the video's last scene shows the new address. What is left is in "Still waiting for the owner" there.

## 1. ✅ DONE (2026-11-20) — GitHub Pages enabled for this repository (its own Pages address, `<owner>.github.io/Repo-A/`)

(Original instructions kept for reference.)

**Why:** the deploy workflow builds and tests successfully, but GitHub refuses to publish because Pages is not enabled on the repository (Actions log: `Get Pages site failed … Not Found`). Enabling Pages is a repository setting this session cannot change.

**Steps:**
1. Open https://github.com/Ahmad-Nayfeh/Repo-A/settings/pages
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch").
3. Open https://github.com/Ahmad-Nayfeh/Repo-A/actions/workflows/pages.yml and click **Run workflow** (branch: `claude/new-session-k41b2n`, or `main` once it exists) → **Run workflow**.
4. When the run is green, the game is live at this repository's own Pages address, `/Repo-A/` on the owner's github.io host (the exact URL is shown on the run's `deploy` job and on the Settings → Pages screen).

**If step 3 fails at the `deploy` job with "Branch … is not allowed to deploy to github-pages due to environment protection rules":**
open https://github.com/Ahmad-Nayfeh/Repo-A/settings/environments → `github-pages` → **Deployment branches and tags** → add `claude/new-session-k41b2n` (or merge the branch into `main` and deploy from `main`), then re-run.

**Until then:** the game runs locally with
```bash
npm ci && npx vite build && npx vite preview
```
and opens at http://localhost:4173.

## 2. Optional: merge to `main`

The repository currently has a single branch, `claude/new-session-k41b2n`. The brief asks that `main` always holds a deployable build. This session may only push to its working branch. To create `main`: open a pull request from `claude/new-session-k41b2n` into a new `main` branch (or rename the branch in Settings → Branches), then set `main` as the default branch. The Pages workflow already deploys on pushes to `main`.

## 3. Optional (opinion only, not data): playtest checklist

If you have 10 minutes, play Training 1–3 and one Hard free-play seed, and note: Was anything physically wrong? Was any Arabic term unnatural for SEC engineers? Was any decision boring or confusing? Put the notes in a GitHub issue; the next session will act on them. (Please do not share any employer or SEC-internal data — public documents only.)

## 4. Making this repository private (optional, owner's choice)

The game is served from the site repository at https://ahmadnayfeh.com/apps/grid-shift/app/ (built files only, no sourcemaps). You can set this repository to private (Settings → General → Danger Zone → Change visibility). On the GitHub Free plan this repository's own Pages copy (/Repo-A/) will then stop; the copy on ahmadnayfeh.com keeps working. **But:** the game links to five documents in this repository (Model notes and About screens: FIDELITY.md, VALIDATION.md, SOURCES.md, SYNTHESIS.md, DECISIONS.md). Those links work only while the repository is public; decide what to do with them first (docs/site-move.md). Copies made while the repository was public under MIT cannot be withdrawn.

## 5. Optional: your own voice for the explainer video

The narration in the explainer video uses Microsoft's neural Arabic voice through the free `edge-tts` client (D-020). Microsoft does not clearly publish terms for this use outside the Edge browser. If you prefer zero doubt, record the 17 short lines in `video/script.json` with your phone (one file per line, any format), put them in `video/audio/<id>.mp3`, and the next session re-renders the video with your voice.
