# Release 1 review: Physics & Domain Accuracy, Safety & Integrity, Research trace, QC

_Reviewer: an independent agent (not the producer), per D3-29. Date: 2026-11-13. Commit reviewed: `77311c1`._
_Method: a fresh `git clone` of Repo-A into a scratch directory, then `npm ci` and `npx vitest run`. I read the charters `docs/org/{physics,safety,qc,research}.md` and applied their gates. I also ran throw-away probe scripts in the scratch clone; nothing in Repo-A was changed except adding this file._

## 0. Test run (clean checkout)

`npx vitest run`: **7 files, 41 tests, all pass** (3.0 s). 33-bus result: losses 202.6771 kW, Vmin 0.913090 pu at B18, 9 iterations. The test count and the numbers match `docs/VALIDATION.md`. I did not run Playwright e2e.

Probe results (scratch-only test, 60 seeds per difficulty, simulated to the first trip):

| | Easy | Normal | Hard |
|---|---|---|---|
| Fault mix | SLG 32 · 3PH 28 · LL/DLG 0 | same | same |
| Seeds where **no** FPI flags (stale ones excluded) | 0/60 | 8/60 | **28/60** (all 3PH faults) |

Other probe values:
- Bus fault level at the feeder node, max case: 3PH 18.83 kA, SLG 1.09 kA (NER 1000 A, c = 1.1), DLG 16.6 kA. κ = 1.814, ip = 48.3 kA.
- Typical trips: bolted 3PH clears at 0.287 s (M capped at 20 → 0.227 s, plus 60 ms breaker); SLG with Rf 1.8 Ω clears on the earth element at 0.52 s.
- Fault current falls monotonically with Rf for Rf = 0 to 10 Ω.
- Capacitive 3I0 in healthy-ring cables during an external SLG: 4–8 A, well below the 60 A FPI pickup.

## 1. Golden values re-derived from the research notes (QC gate 6)

| # | Case (research/02) | Re-derived from the note's inputs | Engine / test | Result |
|---|---|---|---|---|
| 1 | GT-3 SLG, Glover Ex 9.3: Ia = 3·1.05/(0.13893+0.14562+0.25) | 5.89281 pu | 5.8928 pu | match |
| 2 | GT-4 CT18 §4.3: E/Rn + j3ωC0E, with E = 5500/√3 | 31.754 + j2.991 A, \|I\| 31.895 A | 31.895 A | match |
| 3 | GT-1 CT158 §2.4: Zup 0.8 Ω (R 0.2·Z, X 0.98·Z), line 0.72 + j0.8 Ω | Z 1.8120 Ω, I 6,372 A, κ 1.205, ip 10,860 A | 6,373 A / 10,861 A (VALIDATION) | match; 0.65 % from the published 6,415 A, as VALIDATION states |

Also re-checked: ABB TMS 0.201 at 4× gives 1.00093 s, and C0 = 2.46/(3ω·7967) gives 273.0 nF/km. Both match the engine.

## 2. Parameter sample (QC gate 2): 20 values traced

| # | Value (src/data/params.ts) | Label | Traced to | Verdict |
|---|---|---|---|---|
| 1 | fHz 60 | V | KSA-03, K2-01 (Grid Code) | OK |
| 2 | mvKV 13.8 | V | KSA-02 | OK |
| 3 | service band 13.1–14.5 kV | V | 01 §(table, l.43), KSA-02/04 | OK |
| 4 | MV planning VD 1.5 % | V | 01 l.51, REVIEW R1-12 | OK |
| 5 | ringMaxKm 7.5 | V | 01 l.106 ("up to the normal open point") | OK value. Applied as a whole-ring cap, see P-17 |
| 6 | ring loading 0.5 | V | 01 l.105 (single loop) | OK |
| 7 | 21 kA 1 s | V | KSA-07/08 | OK |
| 8 | skMVA 450 | D | 67 MVA / 29.5 % ⇒ 227 MVA ×2. The 29.5 % comes from **K2-07** (09 l.82, snippet), not KSA-31 | **Citation mismatch** (P-15) |
| 9 | NER 1000 A | A | E-03 in research/02 (100–2000 A, SC-03) | OK |
| 10 | r20 0.100 / rOp 0.130 / x 0.108 Ω/km | V/D | DPS Table 1.9 via REVIEW R1-04, 01 l.152 | OK |
| 11 | c0 273 nF/km | D | SP2-02 = S2-05 Table 4.2 (2.46 A/km). Recomputed 273.0. Cross-check NKT 0.27 µF/km | OK |
| 12 | r0 1.9 / x0 0.08 | D/A | SP2-06: 0.125 + 3·0.6 = 1.93 (NKT 3×240/50) | OK (borrowed, labelled) |
| 13 | ampacity 300 A | V | KSA-02 (35 °C / 2.0 K·m/W / 1.0 m) | OK |
| 14 | ampacity40C 278 A | D | R1-19: 384 × 0.90 × 0.82 × 0.98 = 277.7 | OK |
| 15 | conductorK 94 | comment says [V] TH-11 | 11: "k = 94 **derived** from IEC 60949 constants [TH-11]" | **Mislabel V→D** (P-15) |
| 16 | screen 7.0 kA 1 s | A | NKT 3×240/50 (10 l.59) | OK |
| 17 | Trafo 500/1000/1500: Z 5/6/6 %, P0 0.75/1.1/1.7, Pk 4.7/9.0/14.0 kW | V | T12-c, T12-h | OK |
| 18 | power factor 0.85 | V | DPS Table 2.2 voltage-drop basis (R1-12). This is a planning basis, not a measured load pf | **Mislabel V→Vsec/D** (P-15) |
| 19 | delays 5 / 20 min, night 22–06 | V | OP-06 Table 10.1 (07 l.88) | OK (UK, labelled) |
| 20 | EPRI 1.3/0.4/0.2; third-party 0.5 | V | SP2-20 / AS2-06; SC-12 via C-01 | OK |
| (+) | FPI minDurationS 0.04 s | A | FIDELITY F8 says "inrush restraint time 100 ms [A]" | **Mismatch with FIDELITY** (P-16) |
| (+) | earth pickup 150 A (15 % of NER) | A | SP2-41 (10–20 %, low authority) | OK |

Result: 20 sampled values plus 2 extras; **4 mismatches or mislabels**, all Minor (P-15, P-16). Several `src` strings are topic-note finding IDs (E-03, P-05, SP2-xx), not IDs in `research/sources/*.md`. Without `scripts/check_sources` (P-14), nothing checks them mechanically.

D-004: `grep -rni "alfanar\|TH-10" src` → **0 hits**. The attestation line is present in `src/data/params.ts`.

## 3. Findings

### Physics & domain

**P-01 · Important · The fault-type generator is unsourced and physically doubtful for screened cable**
- *Location:* `src/engine/scenario/district.ts` `generateFault` (l.185–188).
- *Evidence:*
  - Every third-party (excavation) fault is a pure 3PH fault with no earth path (Rf 0–0.5 Ω). Third-party damage is 50 % of faults.
  - LL faults occur only at terminations; DLG is never generated.
  - On cable with individually screened cores (params l.34), an excavator strike or insulation breakdown almost always involves the earthed screens, so the fault is earth-connected and usually starts as SLG. A balanced, earth-free 3PH fault in a cable body is the least likely type. research/02 F-07 puts 3-ph at about 2–5 %, though in an overhead context.
  - Consequence: on Hard (earth-only FPIs), **28/60 seeds give no FPI indication at all**. The game teaches that earth-fault indicators are commonly blind to dig-ins.
  - The mix is not in FIDELITY and not in the Model notes.
- *Fix:*
  - Model third-party damage as an earth-involving fault: SLG or DLG, or 3PH-E with a small asymmetry or an evolving SLG→3PH sequence.
  - Keep a small sourced or labelled share of 3PH.
  - Generate DLG.
  - Document the mix as [A] in FIDELITY F2 and the Model notes.

**P-02 · Important · FIDELITY claims models and checks that the code does not implement**
- *Location:* `docs/design/FIDELITY.md` F2, F3, F4, F8, against `src/engine/**`.
- *Evidence:* none of the following exists in code.
  - Equipment rating check of 21 kA 1 s against max(I3ph, ISLG, IDLG). `SYSTEM.equipmentIk` is unused.
  - Conductor adiabatic I²t check (`conductorK` unused).
  - Lumped "rest-of-busbar" C0 (D3-17, F8 "10 feeders × 6 km").
  - KT correction (the source is entered as S″k, so KT does not apply; the claim is moot).
  - "CT saturation as a flag" (F3). F9 and S-F9-01 say it is not modelled, so FIDELITY contradicts itself.
  - FPI timer reset and minimum duration (`FPI.timerResetH`, `minDurationS` unused).
  - Tee-off fuses "present as rated parts": `fuseA` is never set.
  - FIDELITY "Validation" lines list tests that do not exist: 69-bus ±0.2 %; NPAG 11 kV grading (8,759 / 2,201 / 8,301 / 5,248 A); ABB 150 ms DT margin; DOE FLISR arithmetic; SCC↔DPS 293 vs 300 A sanity test.
  - FIDELITY F2 gives ±0.5 % for Glover while the physics charter and the test use ±0.05 %.
- *Fix:* either implement each item (the 21 kA check and the rest-of-bus C0 are cheap) or move it to "v1.x / not in v1" in FIDELITY and the notes. Split each "Validation" line into *implemented* (with the test file named) and *planned*.

**P-03 · Important · The physics charter's property-test gate is not met**
- *Location:* `tests/` (no property tests on the engine).
- *Evidence:* physics.md gate 2 requires ≥ 200 seeded cases each for the following. None exist; `tests/property/nightshift.test.ts` covers bot, determinism and pre-fault sanity only.
  - power balance;
  - voltage non-increasing along source→leaf paths;
  - fault current ≤ the c_max bolted value and non-increasing with Rf;
  - I_SLG ≤ I_3ph only where Z0 ≥ Z1;
  - relay time non-increasing with current.

  The 33-bus balance check and one curve test are single cases. My probe found the Rf monotonicity holds on one case.
- *Fix:* add `tests/property/engine.test.ts` with the five properties over ≥ 200 generated networks or fault points.

**P-04 · Minor · The "minimum" fault case is not a minimum at the busbar**
- *Location:* `shortcircuit.ts` l.174, `sim.ts` l.247.
- *Evidence:* Z_Q = c·U²/S″k, so I″k at the source bus = S″k/(√3U) for any c. The min case (c = 1.0, cables at rOp) uses the same 450 MVA, i.e. both 67 MVA transformers in parallel. FIDELITY F8 says the TMS is "chosen so the CB clears ring faults in ≤ 1 s at the minimum fault level", but this is never tested at a real minimum (one transformer, S″k ≈ 227 MVA).
- *Fix:* add `SOURCE.skMinMVA` (one unit) [D] for the min case, and add a test that the far-end SLG with Rf = 3 Ω clears in ≤ 1 s.

**P-05 · Minor · FPI current excludes the cable's own half-shunt at the sensing end**
- *Location:* `shortcircuit.ts` l.214–221, `sim.ts` l.247–259.
- *Evidence:* branch zero-sequence current is the π-model series current. The sensor at the cable end also carries the C0/2 shunt current at its own node, so capacitive 3I0 seen on external faults (P-04 threshold principle) is under-stated by up to half one cable's charging current (about 1 A/km). This is negligible at a 60 A pickup today, but wrong if pickups or C0 change.
- *Fix:* report sensor current = series current + (ωC0·L/2)·V0 at the sensor's node.

**P-06 · Minor (latent) · Relay current lookup picks the wrong fault segment if the fault is on an end cable**
- *Location:* `sim.ts` l.285 and l.307 (`sc.cables.get(firstCable) ?? …#2`).
- *Evidence:* for CB-B the first cable is `C(n+1)`, whose `from` is the RMU side. With a fault on that cable, the un-suffixed segment is RMU→fault (capacitive current only), not the CB side. The bug is masked because `generateFault` excludes end cables (l.179).
- *Fix:* choose the segment whose endpoint is the CB's feeder node.

**P-07 · Minor · Switchgear duty bookkeeping**
- *Location:* `sim.ts`.
- *Evidence:*
  - A CB that closes onto the fault decrements `faultMakeLeft` twice: once on the make (l.568) and once on the trip (l.315).
  - `dutyExceeded` can never fire because `Math.max(0, …)` never goes below 0.
  - The earthing duration is hard-coded at 5 min (l.453), while `OPERATIONS.earthAndPermitMin` (15) is unused.
- *Fix:* count CB breaks and LBS makes separately (as FIDELITY F6 describes); remove or fix the dead check; use the parameter.

### Safety & integrity

**P-08 · Important · The in-game isolation sequence omits "prove dead"**
- *Location:*
  - `sim.ts` `earth` action (l.440–455);
  - `en.ts`/`ar.ts`: `tr1_5`, `permitNeeds`, `actEarthOn`;
  - FIDELITY F6.
- *Evidence:*
  - The glossary correctly says "isolate, secure, **verify absence of voltage with an approved device**, then earth".
  - The playable sequence and the training hint go lock & tag → apply earth → permit → repair. Whether the cable is dead is decided by the engine's topology, and the player never performs or sees a test step.
  - OP-05 §14 (07 l.111) also requires the cable to be **identified and proved dead at the excavation before cutting**; this is absent.
  - safety.md lists "prove dead with an approved device (VPIS indication is not proof of dead)" as a mandatory shown procedure.
- *Fix:*
  - Add a crew step "Verify absence of voltage (approved detector; VPIS alone is not proof)" as a precondition for the earth action, a few minutes [A].
  - Add "identify and spike/prove the cable dead at the work point" as part of starting the repair.
  - Update tr1_5 in EN and AR, and the notes.

**P-09 · Important · A field crew can manually close an RMU switch onto an unproven, possibly faulted section**
- *Location:* `sim.ts` `checkClose` (l.613–623, operating crew exempt) and `crewOp`.
- *Evidence:*
  - Through the checklist, a crew standing at a manual RMU can close an LBS onto a suspect cable, and the device uses a fault-make operation.
  - The operator exemption is sourced (OP-05 §13.15).
  - But research 07 ("Assessment", l.114) and safety.md say test-closing is a **control-room decision, preferably remote, from a CB or switch rated for the duty**, and **never a field "try it"**. OP-05 §13.18 prefers a CB trial close.
  - The reference bot never does this (it dead-switches, then trial-closes the CB), so restricting it does not affect solvability.
- *Fix:*
  - Option 1: refuse manual (crew) closes that newly energise unproven sections, with the message "Trial-close from the feeder CB or a remote-controlled switch; staff excluded".
  - Option 2: if kept, label it explicitly in-game as a controller instruction with the operator using the remote-operating facility or standing off per local rules.
  - Add a note in S-F6-xx.

**P-10 · Important · False or over-broad "validated" claims in user-facing text**
- *Location:*
  - About page `src/ui/Pages.tsx` l.148 (EN and AR);
  - footer `en.ts`/`ar.ts` `footer`.
- *Evidence:*
  - The About page says the engine's "power flow, short circuit, protection, **fault indicators**, reliability indices" are "validated against published examples". There is **no FPI golden test**. FPI logic is only exercised by the bot gate.
  - The About page also says "every value has a public source or is labelled as an assumption", which P-11 contradicts.
- *Fix:*
  - Remove "fault indicators" from the validated list, or add a sourced FPI test, e.g. SC-11 P-03 "all indicators between source and fault activate" on a constructed ring.
  - Reword the footer to "Core calculations are checked against published examples (see Validation)".

**P-11 · Important · Assumed values are missing from the in-game Model notes (research gate 2)**
- *Location:* `src/ui/notes.ts` against params/FIDELITY F8.
- *Evidence:* these [A]/[D] values are not shown to players:
  - the source-CB relay settings (phase 400 A IEC SI TMS 0.1, earth 150 A IEC SI TMS 0.1);
  - the source fault level 450 MVA [D, snippet-based], R/X 0.07 [A], Z0/Z1 = 1 [A];
  - the fault-type mix (P-01);
  - damage-report probability 0.7 [A];
  - FPI read 2 min, damage attendance 20 min, earthing time [A];
  - winter factor 0.55 [A];
  - the stale-FPI mechanic.
- *Fix:* add notes, e.g. S-F3-04 "Feeder relay settings are assumptions…" and S-F8-02 "Grid-station fault level 450 MVA derived from a snippet…". Mirror them in FIDELITY.

**P-12 · Minor · The pre-switching checklist is a one-click confirm, unlike FIDELITY F6/D-008**
- *Location:* `src/ui/Game.tsx` `Checklist` (l.300–323).
- *Evidence:*
  - FIDELITY says "justification selected and checked, named crews confirmed clear … not a click-through confirmation".
  - The UI offers only "Confirm and close" and always sends `'delay'`. Confirming with ❌ items is possible; the engine then refuses and counts a near miss.
  - The engine gates are therefore enforced and nothing unsafe passes, but the specified teaching interaction is not built.
- *Fix:* either add a justification choice (delay elapsed / FPI evidence / automation) plus per-crew confirmation, and disable Confirm while any item is ❌; or amend FIDELITY.

**P-13 · Minor · Safety text reviewed: no live-work how-to found**
- *Location:* `en.ts`, `ar.ts`, `notes.ts`, `Pages.tsx` glossary.
- *Evidence:*
  - No live-working instructions or arc-flash numbers. S-F6-05 explicitly excludes live working.
  - Interlocks are described as per-panel only, and the remote end as procedural (blk_permitBlock, S-F6-02). This is correct (D3-08).
  - "Trial close" is defined as a control-room decision. The UK rule-set is never presented as SEC practice (`rulesetNote`, S-F6-01).
  - EN and AR key sets match (0 missing, 0 extra). The safety-critical AR strings carry the same meaning.
  - Engine checks:
    - earthing requires the panel open, locked and a dead cable;
    - closing an earthed switch is blocked;
    - the permit needs both ends open, earthed and locked;
    - earths cannot be removed while a permit is open;
    - an unattended damage report blocks re-energisation;
    - paralleling grid stations is blocked.
- *Fix:* none beyond P-08, P-09 and P-10. A formal `docs/qc/SAFETY-<date>.md` is still owed per safety.md.

### Research trace & QC process

**P-14 · Important · The research and QC gate tooling is missing**
- *Location:* `scripts/` (only `merge_sources.py`) and `docs/design/FIDELITY.md`.
- *Evidence:*
  - research.md gate 1 requires `scripts/check_sources`; it does not exist. `src` strings mix source IDs (KSA-02) with finding IDs (E-03, P-05, SP2-02, AS2-13), and some are empty (`''`) for [A] values.
  - qc.md gate 3 requires `S-Fx-nn` IDs in FIDELITY. FIDELITY contains **none** (only the header mentions the scheme; REVIEW-phase3 asked for it). Two-way coverage can therefore be checked only by meaning (section 4).
- *Fix:*
  - Add the IDs to FIDELITY bullets.
  - Add `scripts/check_sources` that resolves each `src` token against `research/sources/*.md` or a finding-ID→source map, and checks that each S-F ID appears in both files. Run it in CI.

**P-15 · Minor · Parameter label and citation errors**
- *Location:* `src/data/params.ts`.
- *Evidence:*
  - `conductorK` comment says [V] TH-11, but research 11 says it was derived → should be D.
  - `powerFactor` 0.85 is labelled V, but it is the DPS voltage-drop basis, not a measured load pf → Vsec/D.
  - `skMVA` cites KSA-31, but the 29.5 % impedance is K2-07 (snippet) → cite K2-07 and flag it uncertain.
- *Fix:* correct the labels and citations.

**P-16 · Minor · FPI inrush or minimum-duration value differs between FIDELITY and data**
- *Location:* FIDELITY F8 ("100 ms [A]") against `FPI.minDurationS` 0.04 s.
- *Evidence:* the two values disagree, and the value is unused (P-02).
- *Fix:* pick one value and either use it or remove it.

**P-17 · Minor · The ring-length rule is applied to the whole ring, not to each half up to the NOP**
- *Location:* `district.ts` l.82.
- *Evidence:* DPS (01 l.106) says ≤ 7.5 km "up to the normal open point". The code caps the total at 2 × 7.5 × 0.9 km, so an unbalanced NOP can leave one half above 7.5 km.
- *Fix:* check each half after NOP placement, or label the rule as indicative.

**P-18 · Minor · Small VALIDATION.md and FIDELITY wording issues**
- *Evidence:*
  - VALIDATION is accurate against the test code and output: 41 tests, the GT-1 engine values, curve points, 60 pre-fault seeds (20 × 3), bot gates.
  - FIDELITY F2 lists CT158 §3.5 as validation, while VALIDATION says it is not yet a golden test. VALIDATION is right.
  - VALIDATION does not mention that the engine has no physics property tests (P-03).
- *Fix:* align FIDELITY with VALIDATION and add a "missing property tests" line to VALIDATION §8 until P-03 is closed.

## 4. Simplification coverage FIDELITY ↔ Model notes (by meaning)

**Covered:**

| FIDELITY item | Model note |
|---|---|
| F1 balanced positive-sequence | S-F1-01 |
| F1 no OLTC, no charging | S-F1-02 |
| F2 IEC 60909, loads/motors neglected, no DC | S-F2-01 |
| F2 screen-return Z0 | S-F2-02 |
| F3 IEC/DT, ideal relay, 60 ms | S-F3-01 |
| F3 fuses not simulated | S-F3-02 |
| FPI thresholds and reset | S-F3-03 |
| F4 steady rating | S-F4-01 |
| F4 borrowed screen data | S-F4-02 |
| F5 customers, shape, cold-load | S-F5-01 |
| F6 SSEN rules | S-F6-01 |
| F6 interlocks per panel | S-F6-02 |
| F6 crew times | S-F6-03 |
| F6 paralleling, duty | S-F6-04 |
| F6 fault-level reduction | S-F6-05 |
| F7 Ofgem/IEEE | S-F7-01 |
| F8 NER | S-F8-01 |
| F9 subset | S-F9-01 |

**FIDELITY items missing from the notes:**
- F1 constant-power loads.
- F2 Petersen coil not offered.
- F2 rest-of-bus C0 [A] and KT. Not implemented either, see P-02.
- F3 cold-load as a scripted multiplier (partly in S-F5-01).
- F4 switchgear ambient derating not modelled.
- F4 conductor and switchgear I²t checks.
- F6 damage-report rule.
- F6 FPI type: earth-only FPIs are blind to phase faults and are never trusted negative. This is in the glossary only.
- F6 the 13.1–14.5 kV backfeed band and the DPS 1.5 % reference.
- F8 source fault level, R/X and Z0/Z1.
- F8 relay settings (P-11).
- F9: IEC 60076-7:2018 not read, arcing-fault physics, generator dynamics, "no real geographic Riyadh data".

**Notes items missing from FIDELITY:**
- S-F2-03 fault resistance 0–3 Ω / near-zero for excavation.
- S-F6-03 road factor 1.4.
- S-F6-05 "single permit per section".
- S-F3-03 stale (un-reset) FPIs.

**Result: QC gate 3 fails (coverage is incomplete both ways, and there are no IDs in FIDELITY).**

## 5. What is right (for the record)

- **Sequence networks:**
  - Z2 = Z1;
  - Dyn11 distribution transformers block zero sequence;
  - NER enters as 3Rn in source Z0;
  - C0 is a π shunt in zero sequence only.
- **Fault-type algebra:** the 3PH/SLG/LL/DLG formulas with Zf (DLG Zf in the earth leg) and phase reconstruction are correct.
- **Golden agreement:** results match Glover, CT18 and GT-R2-A to tolerance.
- **Units:** Ω/km, nF/km at 60 Hz, and kA/A conversions are consistent.
- **IDMT:** IEC/IEEE constants are correct. The travel integral, the 20× cap and the breaker time are applied.
- **Relay elements:** the earth element is chosen correctly on SLG via NER (e.g. 677 A → 0.52 s), and the phase element on 3PH (0.287 s).
- **FPI logic:**
  - flags on current through the sensor's own segment;
  - earth-only FPIs never give negative evidence (OP-05 §11.3);
  - reset on voltage return;
  - the narrowing logic is correct for an open ring fed from one end.
- **Backfeed:** overload is measured against the 300/278 A rating, and undervoltage against the 13.1 kV band.
- **Data hygiene:** no alfanar data in `src/`.

## 6. Verdict

**PASS-AFTER-FIXES.** There are no Critical findings: nothing in the game teaches live work or bypasses an interlock.

Must fix before release:
- Safety and honesty: P-08 (prove dead), P-09 (no field trial-close by a crew), P-10 (FPI "validated" claim), P-11 (unlabelled assumptions).
- Physics and gates: P-01 (fault-type mix), P-02 (FIDELITY overclaims), P-03 (property tests), P-14 (S-F IDs and check_sources).

The Minor findings (P-04 to P-07, P-12, P-15 to P-18) can follow in v1.0.x.

## Re-verification

_Fresh clone at `8532c59` (fixes in `47a31d5` "Release review 1 fixes" and `9636dfd` "Release review 2 fixes"). Results: `npm ci` OK; `npx vitest run` 9 files, 50 tests, all pass; `node scripts/check_sources.mjs` passes (23 source IDs; 30 S-IDs in FIDELITY and 30 in Model notes; employer-data check clean)._

- **P-01 — Resolved.** `FAULT_WEIGHTS.typeMix` [A] is now applied in `generateFault`. Insulation faults are SLG 0.85 / DLG 0.15. Third-party faults are SLG 0.3 / DLG 0.4 / 3PH 0.3. DLG faults are now generated. The mix is shown in note S-F2-04.
- **P-02 — Resolved.**
  - The 21 kA equipment check and the conductor I²t check are now in `sim.ts`. The rest-of-busbar C0 is in `shortcircuit.ts`.
  - FIDELITY v3 marks each validation item as "implemented" (with the test file named) or "planned". CT saturation is listed as not modelled (S-F9-01).
- **P-03 — Resolved.** `tests/property/physics.test.ts` covers:
  - power balance (210 cases);
  - voltage monotonic along each half-ring;
  - fault current monotonic with Rf;
  - fault current ≤ the c_max bolted value, and I_SLG ≤ I_3PH where |Z0| ≥ |Z1|;
  - relay time monotonic with current;
  - FPI logic.
- **P-08 — Resolved, with one Minor residual.**
  - Added: a `proveDead` crew action ("Test for absence of voltage (approved tester)"). Earthing is now blocked with `notProved` until the cable has been proved dead. Hint tr1_5 is updated.
  - Residual: there is still no "identify/prove the cable dead at the work point before cutting" step at repair (OP-05 §14). I recommend a one-line note or hint.
- **P-09 — Resolved.** `checkClose` now refuses a close by a crew onto unproven sections (`trialRemoteOnly`). Such trial closes must be made from a remote-controlled CB or switch.
- **P-10 — Resolved, with one Minor residual.**
  - The About page now names only power flow, short circuit, relay curves and reliability indices as validated. It says the FPI logic is tested, not validated.
  - Residual: the EN footer still says "Physics validated against published references". I recommend "Core calculations checked against published examples".
- **P-11 — Resolved.** New notes S-F3-04 (relay settings), S-F2-06 (source fault level, R/X, Z0/Z1), S-F2-04 (fault-type mix) and S-F3-05/06 (FPI). The coverage script passes.
- **P-14 — Resolved.** FIDELITY now carries S-F IDs. `scripts/check_sources.mjs` exists and passes, and is run in CI per the fix commit.

**Re-verification verdict: PASS.** All 8 Important findings are closed. The two Minor residuals above (repair-site prove-dead note, footer wording) do not block release.
