# Needs Ahmad

Only items that truly need the owner. Nothing here asks for data (D-004a).

## 1. Enable GitHub Pages (one-time, ~1 minute) — needed for the public link

**Why:** the deploy workflow builds and tests successfully, but GitHub refuses to publish because Pages is not enabled on the repository (Actions log: `Get Pages site failed … Not Found`). Enabling Pages is a repository setting this session cannot change.

**Steps:**
1. Open https://github.com/Ahmad-Nayfeh/Repo-A/settings/pages
2. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch").
3. Open https://github.com/Ahmad-Nayfeh/Repo-A/actions/workflows/pages.yml and click **Run workflow** (branch: `claude/new-session-k41b2n`, or `main` once it exists) → **Run workflow**.
4. When the run is green, the game is live at **https://ahmad-nayfeh.github.io/Repo-A/** (the exact URL is shown on the run's `deploy` job and on the Settings → Pages screen).

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
