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

## Engine status (Phase 4, evidence = `npx vitest run`, 38 tests green)
- dmath (exp/log/pow from exact ops, ≤4e-16 rel. error), sfc32 RNG, complex dense LU.
- Power flow: GOLDEN 33-bus (MATPOWER data fetched at test time): 202.677 kW, Vmin 0.91309 @ B18.
- Short circuit: GOLDEN Glover 9.2–9.5, CT158 §2.4, CT18 §4.1/§4.3 (NER + C0), NER example R2-A.
- Protection: GOLDEN IEC/IEEE curve tables, ABB grading example, Chakrabarti (±6 %).
- Scenario generator (SEC template), simulation (events, trips, FPIs, crews, safety gates, CLPU, overload trips), evidence logic, reference bot + informed reference.
- Gates: bot finishes 40/40 seeds per difficulty, replay determinism, pre-fault physics sanity.

## Next
1. CI workflow + Pages workflow (D-003); minimal app shell so main is deployable.
2. UI (Preact/SVG): Night Shift screens, i18n AR/EN, onboarding, results, Model notes, glossary.
3. docs/VALIDATION.md; e2e (Playwright); review agents (D-012); README AR/EN with screenshots.

## Known problems / open
- Riyadh MV earthing practice, SEC FPI settings, crew times, cold-load pickup magnitude: not public → labelled assumptions.
- `main` branch does not exist yet; Pages not enabled (see D-003).
