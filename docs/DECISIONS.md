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
