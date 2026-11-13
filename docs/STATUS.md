# STATUS — read this first

_Last updated: 2026-11-13 (session 1)_

## Current phase
Phase 4 — Build (engine first). Engine so far: dmath, RNG, complex LU, topology, power flow, short circuit, protection — all golden suites green.

## Gates passed (evidence)
- **Phase 1 exit: PASS** — independent reviewer (fresh context) found 31 issues (1 Critical); all resolved; re-verification PASS: research/REVIEW-phase1.md §E.
- Phase 2: charters with measurable gates in docs/org/ (D-007), quantified after design review.
- **Phase 3 exit: PASS** — independent design review (30 findings, 2 Critical) resolved; re-verification PASS: docs/design/REVIEW-phase3.md §H. v1 scope = D-011.

## Done
- Phase 0 bootstrap.
- Research rounds 1 + 2 + lead research 12 (SEC transformer specs): research/01..12, SOURCES.md (merged by scripts/merge_sources.py), SYNTHESIS.md v3.
- Decisions D-001..D-010.

## Next
1. Engine: FPI, cable rating & I²t, loads, scenario generator, simulation/events, crews, reliability log, observation layer, reference bot; docs/VALIDATION.md.
3. Night Shift mode end-to-end; CI + Pages.

## Known problems / open
- Riyadh MV earthing practice, SEC FPI settings, crew times, cold-load pickup magnitude: not public → labelled assumptions.
- `main` branch does not exist yet; Pages not enabled (see D-003).
