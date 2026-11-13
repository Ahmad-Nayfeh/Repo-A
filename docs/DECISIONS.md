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

## D-004a — Employer rule extended (2026-11-13, after review R1-02)
- No values from the owner's work knowledge, type-test reports, supplier data/TCCs, tenders, or customer-internal (SEC) documents. Only publicly posted documents (e.g., SEC specifications published on se.com.sa) are allowed. NEEDS-AHMAD must never ask for data.

## D-005 (revised, after review R1-05/R1-06) — Golden-test data
- Supersedes D-005 (c). Committed golden tests use: (1) textbook/vendor worked examples (published numbers, cited); (2) **our own authored feeders**, cross-checked offline with pandapower *code* (BSD-3) on *our* data — these are the primary power-flow golden tests; (3) the 33-bus case only via a **test-time fetch** of MATPOWER `case33bw.m` from its public repository (never committed); expected values labelled [D]+[S]. The 1989 paper is not re-typed (not read; known inconsistency).

## D-008 — Scoring keeps safety separate from performance (2026-11-13, after review R1-03)
- Re-energisation guards (delay, staff exclusion, duty limit, risk-assessment step) are hard gates in Night Shift; a separate safety & asset record is shown and cannot be traded for CML. Any recorded violation removes stars.

## D-009 — Transformer thermal parameters from SEC 51-SDMS-04 Rev.02 (2026-11-13, after review R1-10)
- Δθor 45 K, hot-spot 98 °C at rating with 35 °C design temperature ⇒ Δθhr 18 K [D]; R from SEC max-loss table; IEC 60076-7:2005 exponents and time constants. Validated against the SEC emergency-loading table as a one-sided check. Alternatives rejected: IEC normal-ambient defaults (would predict ~76× ageing on Riyadh afternoons — not representative of SEC units).

## D-010 — Versioned seeds and links (2026-11-13, after review R1-15)
- Every seed/share/replay carries `v=<engine+data version>`; a model changelog maps changes to source IDs; old links show a notice when replayed on a newer engine.

## D-011 — v1 cut line (2026-11-13, after design review D3-21)
- Adopted the reviewer's cut line (REVIEW-phase3.md §F) with one change: **tee-off fuse operation and transformer tee-off faults are also cut**, because no fuse time-current curves were sourced (the lead caught an unsupported "digitised curves" claim in its own FIDELITY draft).
- Above the line (v1): dmath/PRNG; topology; per-island power flow; full SC (4 types, Zf, NER/solid, C0, rest-of-bus C0); IEC + DT source-CB protection with travel integral; FPIs (earth-only/3-ph, latch, reset, [A] reliability); conductor & screen I²t; cable steady rating 35/40 °C; CLPU [A]; crews; reliability log (Ofgem 3-min + IEEE 5-min CML); Night Shift with training (3 faded faults), daily, free play, Easy/Normal/Hard, evidence sources, safety model, end state with permit, reference bot + oracle; replay URLs; results timeline; Model notes; glossary; AR/EN; themes; keyboard; phone ring view; CI; Pages.
- Below the line (v1.x, absent from v1 UI — not placeholders): transformer thermal (Heatwave), IEEE curves, CT saturation, self-powered relays, switchgear derating, fuse operation, tee-off faults, SAIFI/SAIDI system display, 69-bus golden, Expert, evolving/second faults, career, home district, phasor views, audio beyond one chime, PWA, paralleling, Live shift.
- Evidence: reviewer's scope analysis; measured progress (engine core + 3 golden suites done in ~1 h).

## D-012 — Two review agents per release instead of ten passes (D3-30)
- Gates still exist; CI covers Engineering/Localisation key coverage; two independent agents cover the rest. Reversible.

## D-013 — Dense LU kept for v1; versioned builds for long-lived links (D3-23, D3-25)
- Measured LU cost (n=80: 0.40 ms) is within budget for v1 island sizes; sparse ordering deferred. Release tags build into `/v/<n>/`.

## D-008a — Safety scoring clarified (D3-11)
- Pre-switching checklist verified by the engine (not a click-through); blocked attempts are logged as near misses (no star loss); stars are removed only by events that actually happened (energising a section with an unattended damage report; exceeding switchgear duty).

## D-014 — Remaining design-review findings
- D3-01..D3-07, D3-09, D3-12..D3-20, D3-22, D3-24, D3-26..D3-29: adopted as written into GDD v2 / FIDELITY v2 / ARCHITECTURE v2 / charters. None rejected. D3-13 LBS making-class counts and D3-17 rest-of-bus C0 remain [A] pending sources.

## D-015 — Release review 2 (playtest) resolution (2026-11-13)
- Fixed: G-01 replay double-advance (regression test `tests/unit/replay.test.ts`); G-02 keyboard focus (lowercase `tabindex`, feeder breakers in the switching-points list; e2e keyboard test); G-03 protection settles within 5 s of any action; G-04 1-based crew numbers; G-05 checklist confirm disabled until all items pass, focus trap and Esc; G-06 stage-based training hints incl. repair and return-to-normal; G-07 quiet advance capped at 30 min; G-08 repaired state; G-09 read-but-dark FPI marker ○; G-10 non-sticky header on phones; G-13 SCADA reads show flag timestamps or "predates this shift"; G-14 earth closes when the crew finishes and prove-dead is required; G-15 Arabic template digits normalised (Arabic-Indic applied by setting); G-16 units/share text localised; G-17 wording (مُفعَّل, أقفِل); G-18 IDs wrapped in <bdi>; G-19 44 px targets and labelled sound toggle; G-20 breaker IDs shown beside grid stations with a hit area; G-21 duplicate breaker label; G-22 locked switches hide close buttons, CML 3-min note, "permit issued/cancelled", earth-only sentence only when relevant; G-23 notes table scrolls with readable values.
- G-11 handled with release review 1 (P-01 fault-type mix).
- **G-12 (overload had no consequence):** ★★★ now also requires minutes above cable rating ≤ the reference strategy's. CML stays a pure regulatory metric. Relays still do not trip below their 400 A pickup — that is physically correct; managing overload is the operator's job.
- Deferred to v1.x (ROADMAP): compact replay encoding (G-22), Hard always 15:00 summer (variety comes with the condition-of-the-day rotation), stronger par on Easy.

## D-016 — Next mode is Grading (relay chain), not Heatwave (2026-11-13)
- Evidence: in the v1 network model, moving normally-open points does not change transformer load (each transformer serves its own customers), so a Heatwave mode would need LV load-transfer or demand-response modelling first (D3-14 observed the same). The transformer thermal engine is built and validated (VALIDATION §3b) and waits for that.
- Grading uses only validated parts (IEC curves, short circuit) plus sourced constraints (CTI 0.25–0.4 s, inrush 12×In 100 ms, pickup above load). Fuse curves remain unsourced, so the chain uses a breaker-type RMU tee-off (SEC 32-SDMS-04).
- Reversible: yes.

## D-017 — Condition-of-the-day rotation for the daily (2026-11-13, D3-04)
- Seven conditions cycle by UTC day: standard, solidly earthed district, heat (40 °C ground, 15:00 summer), one crew, SCADA comms trouble, stale indicators, digger strike with damage report. Each is a generator override; every condition is gated by the reference bot finishing 20/20 seeds (tests/property/nightshift.test.ts).
