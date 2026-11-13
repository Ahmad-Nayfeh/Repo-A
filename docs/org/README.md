# Organisation

Derived from Phase 1 research (see `research/SYNTHESIS.md`). Each department is a **gate**, not a document.
A department is "passed" for a release only when its gate is met **with evidence** (test output, script output, screenshot, review file).
Departments are run as (a) automated checks in CI and (b) explicit review passes by fresh-context subagents using the charter as their instruction.

| # | Department | One-line mission | Gate evidence lives in |
|---|---|---|---|
| 1 | [Research & Sources](research.md) | Every fact traceable; uncertainty labelled | `scripts/check_sources` output, SOURCES.md |
| 2 | [Physics & Domain Accuracy](physics.md) | Engine reproduces references within tolerance | `docs/VALIDATION.md`, golden test output |
| 3 | [Game Design](game-design.md) | Modes are fun, replayable, scored on real metrics | GDD, automated playthrough metrics |
| 4 | [UX, Visual & Audio](ux.md) | Clear, accessible, mobile + desktop | screenshots, a11y audit output |
| 5 | [Localisation AR/EN](localisation.md) | Arabic is first-class, terms correct | key-coverage check, RTL screenshots, glossary |
| 6 | [Engineering](engineering.md) | Clean, deterministic, fast, deployable code | CI: typecheck, lint, unit, build, perf budget |
| 7 | [QC — Quality Control](qc.md) | Outputs match specs & references | QC check report |
| 8 | [QA & Testing](qa.md) | Product & process serve the goal | e2e results, fresh-agent playtest report |
| 9 | [Safety & Integrity](safety.md) | Only safe practice; honesty; no employer data | safety review file |
| 10 | [Release](release.md) | Deployed, documented, recoverable | live URL check, README, STATUS |

**Why these and not others** (D-007): Research showed credibility with engineers is the moat (GD-06/11), so Research & Sources and Physics are separate, strong gates. Safety gets its own gate because the operational content (switching, re-energisation, arc flash) can drift towards unsafe how-to. Performance is folded into Engineering (physics is ~0.04 ms per solve; rendering is the only budget risk). Marketing/community is omitted (no server, no accounts; out of scope for v1).

**Challenge protocol:** any department can file a blocking objection against another's output in `docs/org/OBJECTIONS.md` (ID, raised by, against, evidence, resolution). Release is blocked while a Critical objection is open.

**v1 process (D-012):** the ten gates are run as CI checks plus **two** independent review agents per release: (1) Physics + Safety + Research trace (incl. QC sampling), (2) Game + UX + Localisation playtest in both languages and viewports. QA's process audit checks that both ran.
