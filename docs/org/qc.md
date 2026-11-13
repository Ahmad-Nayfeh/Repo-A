# QC — Quality Control

**Mission:** Check that outputs match their specifications and references. (Conformance: "did we build it right?")

**Scope vs QA:** QC checks artefacts against specs (golden values, string coverage, source traceability, FIDELITY↔Model-notes consistency, data tables vs research). QA asks whether the product and process serve the goal.

**Quality gate (QC report `docs/qc/QC-<date>.md`):**
1. Golden tests: list each, reference value, engine value, tolerance, pass/fail — all pass.
2. Parameter table audit: random sample of 20 data values traced to sources; 0 mismatches.
3. FIDELITY.md vs in-game Model notes: every simplification present in both.
4. Localisation key coverage and glossary checks pass.
5. Scoring formulas match the reliability definitions in research 07 (Ofgem GT-1 example and GT-2 night-fault example reproduce exactly).
