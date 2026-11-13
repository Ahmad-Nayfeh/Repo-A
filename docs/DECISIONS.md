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
