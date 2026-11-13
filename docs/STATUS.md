# STATUS — read this first

_Last updated: 2026-11-13 (session 1)_

## Current phase
Loop (Phase 4→5): v1 released on the branch (Night Shift) + **Grading mode v1.1** added. Transformer thermal engine validated, waiting for its mode.

## What exists (evidence)
- **Night Shift** (training ×3, daily, free play easy/normal/hard) and **Grading** (relay chain, TCC chart, reference grading), AR/EN, desktop + phone.
- Tests: 64 Vitest (unit, golden, property, gates, replay) + 8 Playwright e2e (CI runs them on Chromium, Firefox, WebKit); `node scripts/check_sources.mjs` in CI (source IDs, S-ID coverage, employer-data check).
- Golden results: docs/VALIDATION.md (power flow, short circuit, protection, reliability, thermal, grading).
- Release reviews: physics/safety — PASS on re-verification; playtest/UX/Arabic — pass-after-fixes, leftovers fixed (log translation regression, hints, Arabic gender, tap sizes). Reports in docs/qc/.
- README with screenshots + gameplay GIF/MP4 (refreshed after fixes).
- Deployment: Pages workflow builds & tests OK; **blocked only by Pages not enabled** → docs/NEEDS-AHMAD.md §1.

## Gates passed (evidence)
- Phase 1 exit: PASS — research/REVIEW-phase1.md §E.
- Phase 3 exit: PASS — docs/design/REVIEW-phase3.md §H.
- Release 1 physics/safety: PASS — docs/qc/REVIEW-release1-physics-safety.md (Re-verification).
- Grading review: engineering items GR-01..06 PASS on re-verification (docs/qc/REVIEW-grading.md).
- Daily condition-of-the-day rotation (D-017): 7 conditions, all gated solvable.
- Release 1 playtest: pass-after-fixes → fixes applied — docs/qc/REVIEW-release1-playtest.md (Re-verification) + D-015.

## Next (priority)
1. ~~Independent review of Grading mode~~ done: docs/qc/REVIEW-grading.md — fail → fixes (D-018) → re-verification pass-after-fixes; GR-07 phone layout fixed afterwards (sticky compact status, failing-rule count, larger chart labels).
2. Roadmap: home district & condition-of-the-day; earth-fault grading; Heatwave once LV transfer/demand response is modelled (D-016).

## Known problems / open
- Riyadh MV earthing practice, SEC FPI settings, crew times, cold-load pickup magnitude: not public → labelled assumptions.
- `main` branch does not exist (single working branch is the default) — see NEEDS-AHMAD §2.
