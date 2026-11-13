# 10 — Short-circuit & protection, round 2 (gap closing)

Follow-up to `02-faults-short-circuit.md` and `03-protection.md`. Source list: `research/sources/10-sp2.md` (IDs `[S2-xx]`).
Claim IDs `[SP2-xx]`. Status: **verified** (passage read in the fetched text), **snippet-only** (search snippet only), **uncertain** (read, but garbled or ambiguous), **NOT FOUND**.
"Recomputed" means arithmetic I redid from the published inputs (not a new source). No alfanar documents were used.
Access note: direct `curl` to most vendor hosts was refused by this session's egress proxy (403). PDFs were read with WebFetch, which saves the binary, followed by `pdftotext`.

(Work in progress — sections are filled as sources are read.)

## 1. SLG with transformer + neutral earthing resistor; earthing transformers

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-01] | HRG practice: the let-through current of a high-resistance earthing should be **equal to or slightly higher than the system capacitive charging current**. The resistor is rated V_LL/√3, the earthing transformer V_LL. For systems at **6,900 V and above, charging current "must be carefully calculated … no rule of thumb"**. | S2-05 §5, §4 p.6–7 | verified |
| [SP2-02] | Charging-current estimating data at **13,800 V** (Table 4.2). XLPE shielded 3-conductor cable: 1/0–4/0 AWG **0.65 A per 1000 ft**; 250–500 kcmil **0.75 A/1000 ft**; 600–1000 kcmil **1.15 A/1000 ft**. Transformers 0.05 A/MVA; surge-suppression capacitors 2.25 A per set. Converted (recomputed): 2.13 / 2.46 / 3.77 A per km. Compare the round-1 rule of thumb of ~1.63 A/km for a 15 kV 3-core cable (E-08); same order of magnitude. | S2-05 Table 4.2 p.7 | verified |
| [SP2-03] | Zig-zag earthing transformer, simple case: Z0 = 9 Ω/phase on 11 kV gives I_SLG = 3·6351/9 ≈ 2,117 A (recomputed 2,117 A). | S2-06 | snippet-only (Scribd upload, author unknown) |

## 5. Overcurrent coordination worked examples (fully numeric)

### GT-R2-1 — Glover/Sarma/Overbye 5e, Example 10.4: radial 34.5 kV, CO-8 relays [S2-01 pp. 538–541]  — verified
Inputs. Loads: bus 1 11 MVA, bus 2 4 MVA, bus 3 6 MVA, all at 0.95 pf. Maximum (bolted 3-ph) / minimum (L-G or L-L) fault currents: bus 1 3000/2200 A, bus 2 2000/1500 A, bus 3 1000/700 A. Breakers B1, B2, B3 each take 5 cycles (0.083 s). CTs: B1 400:5, B2 200:5, B3 200:5. CO-8 relays. CTI 0.3 s. Voltage 34.5 kV.
Steps and outputs (published):
- B3 load 100.4 A → 2.51 A secondary → **TS 3 A**. B2 load 167.3 A → 4.18 A → **TS 5 A**. B1 load 351.4 A → 4.39 A → **TS 5 A**.
- Fault at bus 2 (2000 A): B3 multiple 16.7 → TDS ½ → T3 = 0.05 s, clearing 0.133 s. B2 multiple 10.0; required T2 = 0.05 + 0.083 + 0.3 ≈ 0.43 s → **TDS2 = 2**.
- Fault at bus 1 (3000 A): B2 multiple 15.0 → T2 = 0.38 s (TDS 2 curve). B1 multiple 7.5; required T1 = 0.38 + 0.083 + 0.3 ≈ 0.76 s → **TDS1 = 3**.
- Result (Table 10.6): B1 CO-8 TS 5, TDS 3; B2 TS 5, TDS 2; B3 TS 3, TDS ½. Rule: the fault/pickup ratio at minimum fault should be > 2.
Caution: the times are read from the Westinghouse CO-8 curve graph (Fig. 10.12), so they are not an IEC/IEEE formula. Use as a "curve-read" tolerance test (±10 %), or re-derive with the IEEE U.S. Moderately/Inverse (U2) equation as an approximation (engine choice, not from the source).

### GT-R2-2 — Glover 5e, 13.8 kV fuse/recloser/relay scheme (Section 10.5, Fig. 10.18) [S2-01 pp. 541–544] — verified
Inputs (Table 10.7): bus / max load / 3-ph fault / L-G fault (A): 1: 60 / 1000 / 850; 2: 95 / 1500 / 1300; 3: 95 / 2000 / 1700; 4: 250 / 3000 / 2600; 5: 250 / 4000 / 4050.
Published choices: type T fuses, 65T at bus 1 tap (60 A load), 100T at bus 2 and 3 taps (95 A). Recloser minimum trip **200–250 % of maximum load** (phase), ground unit at about maximum load (above allowable unbalance) → **560 A phase, 280 A ground** for 250 A load. Standard recloser minimum trips: 50, 70, 100, 140, 200, 280, 400, 560, 800, 1120, 1600 A. Sequence: two fast + two delayed; reclose **12 s after the 1st fast trip, 2 s after the 2nd, 5–10 s after a delayed trip**. Substation relay: CT 300:5 (4.17 A at max load), CO-11 (extremely inverse) **tap 9 A, TDS 2** (pickup > 2× max load; delayed recloser trips ≥ 0.2 s before relay); ground relay **tap 4 A, TDS 1**. ">80 % of faults on overhead distribution circuits are temporary."
Use: overhead context (not all-cable), but gives a full 13.8 kV setting set.

### GT-R2-3 — NPAG-derived current-grading example, 11 kV cable + 4 MVA transformer [S2-02 pp. ~4–6] — verified (secondary: CED course text paraphrasing NPAG §9.6/9.20)
Inputs: 11 kV, source 250 MVA (Zs = 0.485 Ω); 130 MVA minimum (Zs ≈ 0.93 Ω). Cable C→B 200 m 240 mm² Z = 0.24 Ω; cable B→transformer 200 m 240 mm² Z = 0.04 Ω (as printed); transformer 4 MVA 11/3.3 kV 7 % → 2.12 Ω. Source voltage 6350 V.
Outputs (published): F1 (just after C) **8800 A**. At 130 MVA, a fault near C "would not surpass 6800 A". F4 (3.3 kV side, referred to 11 kV) **I = 6350/(0.485+0.24+0.04+2.12) ≈ 2200 A**. Relay B setting = 1.3 × 2200 = **2860 A** (20 % relay error + 10 % impedance variation). F3 (end of cable at transformer) **8300 A** at 250 MVA and **5250 A** at 130 MVA, so relay B covers the whole cable.
Recomputed: 6350/0.485 = 13,093 A (so the published 8800 A at F1 must include the 0.24 Ω cable: 6350/0.725 = 8,759 A ✓); 6350/2.885 = 2,201 A ✓; 6350/0.765 = 8,301 A ✓; 6350/(0.93+0.24+0.04) = 5,248 A ✓; 6350/0.931 = 6,821 A ✓. One printed denominator shows "0.214", a typo for 0.24.
Lesson for game: current grading only works where there is significant impedance (a transformer) between relays; between two RMUs on the same cable it fails (0.1 % current difference between F1 and F2).

## 5b. Grading margins and setting rules (NPAG via S2-02)

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-10] | Typical relay errors and margins (Table 3; NPAG Table 9.2 equivalent). Basic timing error: electromechanical 7.5 %, static 5 %, digital 5 %, numerical 5 %. Overshoot: 0.05 / 0.03 / 0.02 / 0.02 s. Safety margin: 0.1 / 0.05 / 0.03 / 0.03 s. **Typical total relay-to-relay margin: 0.4 / 0.35 / 0.3 / 0.3 s.** "At one time 0.5 s was typical … 0.4 s is fair." Closes round-1 open item "NPAG Table 9.2". | S2-02 | verified (secondary transcription; NPAG original not read) |
| [SP2-11] | Calculated margin t' = (2ER + ECT)·t/100 + tCB + to + ts. Example: for t = 0.5 s, 0.375 s (electromechanical + conventional CB) down to 0.25 s (static + vacuum CB). For definite-time relays the CT error term is dropped. Formula image garbled in the extract; the variable list (ER, ECT, t, tCB, to, ts) and the "+2E plus 10 % CT error" rule were read. | S2-02 | verified (variables, numbers); formula shape **uncertain** |
| [SP2-12] | Fuse–fuse: discrimination is usually achieved if the **ratio of fuse ratings is > 2**. Relay upstream of a fuse: EI curve preferred; relay primary setting ≈ **3 × fuse rating**; margin ≥ **0.4 s** fixed, or a variable minimum (printed "0.4 … 0.15" — read as t' = 0.4t + 0.15 s, where t is the fuse operating time). | S2-02 | verified; variable formula **uncertain** (garbled) |
| [SP2-13] | Earth-fault relays: "common settings … are **30 % to 40 % of the total load current or minimum ground short-circuit current** on the portion of the system being protected." | S2-02 | verified (secondary) |
| [SP2-14] | Sensitive earth fault with a core-balance CT: settings **down to 10 % of the line current rating**. Where the cable sheath is earthed, the sheath earth lead must pass back **through** the CBCT, or sheath faults are not seen. Needed in high-resistivity (e.g. desert) soils and for downed conductors. | S2-02 | verified (secondary) |
| [SP2-15] | Directional relays at receiving ends of parallel feeders: common practice **50 % of normal full load and TMS 0.1**. | S2-02 | verified (secondary) |
| [SP2-16] | Blocking-based (logic-selectivity) overcurrent: upstream relay trips with a **short delay of 0.15–0.20 s** unless blocked by the downstream relay. | S2-03 §8.5.1.5 p.12 | verified |

## 3. Cable fault statistics (partial)

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-20] | ABB DA Handbook shows Swedish failure rates for **power cables** (0.4, 11, 22 kV; 2 of 5.4 million customers; 1995–97) in faults per 100 circuit-km·yr, and states "the failure rate decreases with an increasing system voltage". The bar values are graphic only (not extractable). It also says MV owners "often collect … data … but do not publish". | S2-03 §8.5.1.2 pp.3–5 | verified (values NOT readable) |

## Open items still to fill in this file
NER + Dyn SLG worked example with full numbers; cable R0/X0 datasheets; cable fault rates per 100 km and SLG shares; AR on cables source; fault-location methods; FPI thresholds; fuse tables at 13.8 kV; transfer current.
