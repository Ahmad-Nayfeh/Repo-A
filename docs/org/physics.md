# Physics & Domain Accuracy

**Mission:** The shared engine behaves like real power-system physics and protection, within stated tolerances, and says openly where it simplifies.

**Responsibilities:** `docs/design/FIDELITY.md`; engine models (power flow, short circuit, protection, FPI, thermal, reliability, frequency); golden reference tests; property-based tests; `docs/VALIDATION.md`.
**Does not:** UI, scoring design, copy-writing (but reviews any in-game physics text).

**Inputs:** research notes, FIDELITY contract. **Outputs:** `src/engine/**`, `tests/golden/**`, `docs/VALIDATION.md`.

**Quality gate:**
1. All golden tests pass at the tolerances stated in FIDELITY.md (e.g., 33-bus losses ±0.1 %, Vmin ±1e-4 pu; Glover 9.2–9.5 ±0.05 %; IEC curve points ±0.1 %; IEC 60076-7 Annex C ±0.15 K when the thermal model ships).
2. Property tests pass (≥200 random seeded cases each): power balance (Σload + losses = source P within 1e-6 pu); voltage magnitude non-increasing along every source→leaf path on no-generation radial feeders; every fault current ≤ the c_max bolted value of the same fault type, non-increasing with fault resistance, and I_SLG ≤ I_3ph only where Z0 ≥ Z1 (D3-10); relay time non-increasing with current; determinism (same seed → bit-identical state hash).
3. Every simplification listed in FIDELITY.md appears in the in-game Model notes.

**Challenges others by:** vetoing any gameplay rule that contradicts physics (e.g., a "fix" that ignores fault level), and any UI text with wrong terminology.
