# STATUS — read this first

_Last updated: 2026-11-13 (session 1)_

## Current phase
Phase 5 — Verify & release (v1: engine + Night Shift). Two independent release reviews running (D-012).

## What exists (evidence)
- Playable game (Night Shift: training ×3, daily, free play easy/normal/hard), AR/EN, desktop + phone. Builds to a static site (53 KB gz JS).
- Tests: 41 Vitest (unit, golden, gates) + 5 Playwright e2e; CI green on Chromium, Firefox, WebKit (run 43453723047: 15/15).
- docs/VALIDATION.md (golden results), README with screenshots + gameplay GIF/MP4.
- Deployment: Pages workflow builds & tests OK; **blocked only by Pages not enabled** → docs/NEEDS-AHMAD.md §1.

## Gates passed (evidence)
- Phase 1 exit: PASS — research/REVIEW-phase1.md §E.
- Phase 3 exit: PASS — docs/design/REVIEW-phase3.md §H. v1 scope = D-011.

## Next
1. Resolve findings of the release reviews (docs/qc/REVIEW-release1-*.md).
2. Refresh README media if the UI changes.
3. Roadmap items (docs/ROADMAP.md).

## Known problems / open
- Riyadh MV earthing practice, SEC FPI settings, crew times, cold-load pickup magnitude: not public → labelled assumptions.
- `main` branch does not exist (single working branch is the default) — see NEEDS-AHMAD §2.
