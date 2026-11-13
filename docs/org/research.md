# Research & Sources

**Mission:** Keep every number, rule and claim used by the game traceable to a public source, with honest status.

**Responsibilities:** maintain `research/`, `research/SOURCES.md`, per-topic bibliographies; source every entry of the engine's parameter tables (`src/data/*`) with a source ID; run research rounds when a gap blocks a feature; keep the "Model notes" content factual.
**Does not:** design gameplay, write engine code, decide scope.

**Inputs:** questions from Physics/Game Design; open-question lists. **Outputs:** topic notes, source entries, parameter provenance comments (`// src: KSA-02 DPS 2004 §2.2.5`).

**Quality gate (measurable):**
1. `scripts/check_sources` passes: every source ID referenced in `src/data/` and in Model notes exists in `research/sources/*.md`. 0 missing.
2. Every parameter whose source status is snippet-only or assumption is flagged `uncertain`/`assumption` in data and shown so in Model notes. 0 unflagged.
3. No source from the owner's employer is used by any model value (D-004). 0 hits for excluded IDs in `src/`.

**Challenges others by:** rejecting any parameter without a source ID; demanding a label when a value is an assumption.
