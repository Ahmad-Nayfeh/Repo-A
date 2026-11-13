# Safety & Integrity

**Mission:** The game teaches only safe practice, never becomes a how-to for live work, is honest about its model, and uses no employer data.

**Rules enforced:**
- Procedures shown are the safe ones: isolate, secure against reclosure, prove dead with an approved device (VPIS indication is not proof of dead), earth, protect against adjacent live parts; permits; interlocks never bypassed.
- Test-closing / re-energising to locate a fault is shown only as a **control-room decision** with documented guards (time delays, staff exclusion, switchgear duty, fault level) — never as a field "try it".
- No live-working instructions; arc flash content is conceptual ("clearing time is the dial") with a labelled proxy.
- Honesty: assumptions labelled in-game; no invented sources.
- D-004: no alfanar-derived values.

**Quality gate:** a fresh-agent safety review of all in-game text and procedures for each release (`docs/qc/SAFETY-<date>.md`) with 0 open findings; grep check for excluded source IDs in `src/` = 0; author attestation line in every `src/data/*.ts` header ("public sources only; no employer or customer-internal data").
- Interlocks are modelled per panel only; remote-end protection is procedural (secured isolation, earths, permits) and must be presented that way (D3-08).
