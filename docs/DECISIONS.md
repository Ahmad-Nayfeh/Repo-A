# Decision log

Format: **D-NNN — title** (date). Context → Decision → Alternatives rejected → Evidence → Reversibility.

## D-001 — Work on branch `claude/new-session-k41b2n` (2026-11-13)
- Context: The session can only push to this development branch.
- Decision: All work is committed there. Deployment/merge to `main` handled per D-later (see NEEDS-AHMAD if blocked).
- Reversible: yes.

## D-002 — Research split into 8 parallel topics (2026-11-13)
- Context: Brief requires broad then deep research before design.
- Decision: 8 independent topics (see STATUS). Each agent writes notes + a per-topic bibliography with stable IDs (KSA-, SC-, PR-, PF-, TH-, PQ-, OP-, GD-). The lead merges into research/SOURCES.md and writes SYNTHESIS.md, then a second, deeper round targets gaps.
- Alternatives: one sequential researcher (too slow, less breadth); finer split (more overlap/merge cost).
- Reversible: yes.

## D-003 — Deployment path deferred until a deployable build exists (2026-11-13)
- Evidence: repo has a single branch `claude/new-session-k41b2n` (no `main`). Enabling GitHub Pages (Source = GitHub Actions) is a repository setting this session cannot change through its tools.
- Decision: build a Pages workflow that deploys on push; create `main` via PR when the first playable build passes gates; document the one-time Pages settings click in NEEDS-AHMAD.
- Reversible: yes.

## D-004 — No employer-sourced data in the model, even if public (2026-11-13)
- Context: Research round 1 (topic 05) cited the alfanar public MV cable catalogue. alfanar is the owner's employer; the brief forbids anything from any employer.
- Decision: alfanar documents may remain in research notes only as a flagged cross-check; the game model must take every value from non-employer sources (NKT, Nexans, Top Cable, Eland, Schneider, ABB, standards). Round 2 must supply replacements.
- Alternatives: use it since it is public (rejected — rule 5 is about avoiding any appearance of using employer material).
- Reversible: yes.

## D-005 — Golden tests store published results, not third-party input files (2026-11-13)
- Evidence: IEEE PES test-feeder files say "All rights reserved" with no open licence; MATPOWER excludes its case files from its BSD licence [PF-01, PF-09].
- Decision: The repo contains (a) our own original networks, (b) short published *result* values with citations (facts used for comparison), and (c) where an input network from a paper is needed (e.g., Baran & Wu 33-bus line/load table), it is re-typed from the published paper as numeric data with a citation, treated as factual data — and flagged in VALIDATION.md. Raw .m/.zip/.xls files are never committed. Cross-validation with pandapower (BSD-3) happens offline/dev-only.
- Alternatives: commit raw files (licence risk); skip published cases (loses validation).
- Risk/uncertainty: whether numeric tables from papers are protected is a legal question we cannot settle; impact is small and reversible (remove the fixture).
- Reversible: yes.

## D-006 — Saudi parameters default to SEC public documents, labelled by edition (2026-11-13)
- Decision: Network defaults follow SEC DPS 2004 / Grid Code 2021 / SDMS specs (13.8 kV, 60 Hz, open loop between grid stations, 50 % loading, ≤7.5 km to NOP, 3×300 Al XLPE, package substations 500/1000/1500 kVA Dyn11, RMU 400 A 21 kA 1 s). Where SEC data is not public (NER value, FPI settings, crew times, UFLS table), values are labelled **assumption** in Model notes, and made scenario parameters.
- MV earthing default: low-resistance earthed (SEC has an NER spec, 57-SDMS-01) with an assumed limit chosen in FIDELITY.md; solid earthing is selectable.
- Operational procedure (halving by customers, backfeed via NOP, re-energisation delays, duty counts) follows documented UK DNO practice (SSEN), labelled as such, because no SEC operating manual is public.
- Reversible: yes (data tables).

## D-007 — Ten departments as gates (2026-11-13)
- See docs/org/README.md for the list and rationale. Merged Performance into Engineering (physics cost negligible per PF benchmark); added Safety & Integrity (operational content risk); omitted marketing/community (no server).
- Departments run as CI checks + fresh-context review subagents. Reversible: yes.
