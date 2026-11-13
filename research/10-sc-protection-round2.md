# 10 — Short-circuit & protection, round 2 (gap closing)

Follow-up to `02-faults-short-circuit.md` and `03-protection.md`. Source list: `research/sources/10-sp2.md` (IDs `[S2-xx]`).
Claim IDs are `[SP2-xx]`. Status tags:
- **verified**: I read the passage in the fetched text.
- **snippet-only**: I saw only a search snippet or a tool summary.
- **uncertain**: I read it, but it is garbled or ambiguous.
- **NOT FOUND**: no source was located.

"Recomputed" means I redid the arithmetic in Python from the published inputs; it is not a new source. No alfanar documents were used.

How sources were accessed: this session's egress proxy refused direct `curl` to most vendor hosts (403). PDFs were read through WebFetch, which saves the binary, and then `pdftotext`. Blocked: se.com NPAG C1 (404), ENWL/SPEN policy PDFs (403), mdpi.com (403), megger.com (403), electrical-engineering-portal (403). Not resolvable from this session: lpnu.ua.

---

## 1. SLG fault with a transformer and a neutral earthing resistor; earthing transformers

Round-1 gap: GT-4 covers a neutral earthing resistor (NER) plus capacitance, but no transformer.

**Result:** I did not find a textbook, standard or major-vendor worked example of an MV-side SLG fault through a Dyn transformer with an NER. Two lower-authority numeric examples were found. Both are internally consistent (recomputed) and usable as simple golden tests, with the provenance stated.

### GT-R2-A: Dyn 33/11 kV transformer with an NER (blog worked example) [S2-07, Worked Example 1] (verified as published; low authority)
The author states the data are "assumed, practice-based".
- **Inputs:** 20 MVA, 33/11 kV Dyn, Z = 10 %, infinite upstream. On the 11 kV base, Zbase = 6.05 Ω and X1 = X2 = X0 ≈ 0.605 Ω (resistance neglected). Target earth-fault current 400 A.
- **Published results:** E = 6,351 V. Solid SLG = 10,497 A. NER = **15.9 Ω**, rated 6.35 kV, 400 A, 10 s, about 2.54 MW. Check: |Z| ≈ 47.7 Ω gives If ≈ 400 A. Seen on the 33 kV side: ≈ 77 A (published as 400 A ÷ 5.196). Recomputed: 400 × 6351/33000 = 77.0 A, i.e. the delta-winding current, flowing in two HV lines for a Dyn SLG. Suggested 51N pickup is 40–80 A (10–20 % of 400 A).
- **Recomputed:** 3E/(3·0.605) = 10,497 A ✓. 3E/|3·15.9 + j3·0.605| = 399.1 A ✓.
- **Model it validates:** Z0 = ZT0 + 3Rn, with the delta winding blocking zero sequence upstream. The 33 kV current is 400/5.196 = 77 A in two phases (Dyn).

### GT-R2-B: generator neutral resistor / reactor sizing (EEPower, L. Mari, 8 Jun 2020) [S2-08] (snippet-only; WebFetch summary, page not quoted verbatim)
- **Inputs:** 500 MVA, 22 kV wye solidly grounded generator, unloaded. X1 = X2 = 15 %, X0 = 5 %, Zb ≈ 0.968 Ω, so X1 = 0.1452 Ω and X0 = 0.0484 Ω.
- **Published results:** SLG 112.47 kA. 3-ph 87.48 kA (ratio 1.286). Xn for SLG = 100 / 60 / 25 % of 3-ph: 0.03226 / 0.1291 / 0.4679 Ω, giving X0/X1 = 1 / 3 / 10. Rn for 100 % = 0.0914 Ω. **Rn for 400 A = 31.75 Ω** (≈ VLN/If).
- **Recomputed:** Rn(400 A) = 31.754 Ω ✓. This is a generator, not a transformer; the sequence algebra is the same.

### Earthing-transformer, HRG and NER practice

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-01] | High-resistance earthing (HRG): the resistor let-through current should be **equal to or slightly higher than the system capacitive charging current**. Resistor voltage rating = V_LL/√3; earthing-transformer rating = V_LL. For systems **6,900 V and above**, charging current "must be carefully calculated … no 'Rule of Thumb' sizing can be used". | S2-05 §4–5, pp. 6–7 | verified |
| [SP2-02] | Charging-current estimating data at **13,800 V** (Table 4.2), XLPE-shielded 3-conductor cable: **1/0–4/0 AWG 0.65 A, 250–500 kcmil 0.75 A, 600–1000 kcmil 1.15 A per 1000 ft**. Transformers 0.05 A/MVA; surge-suppression capacitors 2.25 A per set. Recomputed per km: 2.13 / 2.46 / 3.77 A/km. | S2-05 Table 4.2, p. 7 | verified |
| [SP2-03] | Zig-zag example: 6.6 kV delta bus, limit 300 A for 10 s, zig-zag and other impedance ≈ 2.5 Ω, total loop 38.1 Ω, **NER 12.7 Ω**, ~1,143 kVA for 10 s. Typical NER limit "100–1000 A, normally for 10 s". | S2-07 Ex. 6 | verified as published (low authority; the 38.1 Ω loop is 3·VLN/300 = 38.1 Ω ✓; how the 2.5 Ω is split is not explained, so treat as uncertain) |
| [SP2-04] | Zig-zag, 11 kV, Z0 = 9 Ω/phase → I_SLG = 3·6351/9 ≈ 2,117 A. | S2-06 | snippet-only |
| [SP2-05] | Effectiveness of an NER on an autotransformer with delta tertiary vs a Dyn transformer: 10 Ω limits a Dyn case to ≈ 660 A but only to ≈ 1,371 A on the autotransformer. | S2-09 | snippet-only (PDF 404) |

Engine implication: the NER enters as 3Rn in Z0 on the yn side only. For 13.8 kV, if the owner confirms a low-resistance NER (value TBD), GT-R2-A is the template.

---

## 2. Zero-sequence and positive-sequence data of MV 3-core XLPE cables

### NKT AXAL-TT PRO 3.0 Endurance 12/20(24) kV, 3-core Al, Al-wire + foil screen (SS 424 14 16) [S2-10, p. 2] (verified)
Datasheet (NKT, via distributor Esvika), dated 05/2023. "Ground connection current at UN" means the capacitive earth-fault current at 20 kV.

| Size | R20 cond. Ω/km | R screen Ω/km | **R0 Ω/km** | **X0 Ω/km** | L mH/km | C µF/km | Earth-fault current A/km (20 kV) | Ik 1 s cond./screen kA |
|---|---|---|---|---|---|---|---|---|
| 3×25/25 | 1.20 | 1.2 | 4.80 | 0.10 | 0.43 | 0.13 | 1.4 | 2.4 / 3.2 |
| 3×50/25 | 0.641 | 1.2 | 4.24 | 0.10 | 0.39 | 0.15 | 1.7 | 4.7 / 3.2 |
| 3×95/35 | 0.320 | 0.8 | 2.72 | 0.09 | 0.35 | 0.19 | 2.1 | 9.0 / 5.0 |
| 3×150/35 | 0.206 | 0.8 | 2.61 | 0.09 | 0.33 | 0.23 | 2.5 | 14.2 / 5.0 |
| **3×240/50** | **0.125** | **0.6** | **1.93** | **0.08** | **0.30** | **0.27** | **3.0** | 22.7 / 7.0 |
| 3×300/50 | 0.100 | 0.6 | 1.90 | 0.08 | 0.29 | 0.30 | 3.3 | 28.3 / 7.0 |
| 3×400/50 | 0.0778 | 0.6 | 1.88 | 0.08 | 0.28 | 0.33 | 3.6 | 37.8 / 7.0 |

- [SP2-06] **Derived pattern (recomputed, exact for every row): R0 = Rconductor + 3·Rscreen**, e.g. 0.125 + 3·0.6 = 1.925 ≈ 1.93. So this datasheet's Z0 assumes **return through the cable's own screen only** (screen bonded at both ends, no parallel earth return). X0 (0.08–0.10 Ω/km) is *smaller* than X1 (2πf·L = 0.094 Ω/km for 240 mm²). This is typical of a close coaxial screen return. It contrasts with overhead lines (X0 ≈ 3·X1, round-1 GT-2).
- The earth-fault current column matches 3ωC·U/√3 at 20 kV, 50 Hz (recomputed: 2.94 A/km for 240 mm²). At 13.8 kV, 60 Hz the same C gives **2.43 A/km** (recomputed). This sits close to Post Glover's 2.46 A/km for 250–500 kcmil at 13.8 kV [SP2-02], which is a good cross-check.

### Reka AHXAMK-W 12/20(24) kV 3-core Al (positive-sequence data only) [S2-11] (verified)
Datasheet in Finnish, generated 2026-11-13.
- **R20 (max, Ω/km):** 50 mm²: 0.641; 95: 0.320; 185: 0.164; 240: 0.125; 300: 0.100.
- **AC resistance, screen bonded both ends (Ω/km), 240 mm²:** 0.1356 at 40 °C, 0.1482 at 65 °C, 0.1607 at 90 °C. For 185 mm²: 0.1776 / 0.1941 / 0.2106.
- **Inductance, trefoil touching (mH/km):** 240: 0.34; 185: 0.35; 95: 0.39; 50: 0.43. Recomputed X1 at 50 Hz for 240 mm² = 0.107 Ω/km.
- **Capacitance (µF/km):** 240: 0.29; 185: 0.26; 95: 0.20.
- **Calculated earth-fault current at 20 kV (A/km):** 240: 3.2; 185: 2.9; 95: 2.2.
- **Al-foil screen R20 (Ω/km):** 240: 0.9; 185: 1.5. The separate Cu earth conductor is listed only by diameter. No R0/X0 is given.

### How Z0 depends on screen bonding and earth return

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-07] | The zero-sequence current returns through the screen, the earth and any parallel metal. A screen bonded at both ends gives a lower Z0 (parallel screen–earth return). With single-point bonding the screen carries no return current, so Z0 rises towards the earth-return value. "Dependable zero sequence values are often best obtained by measurement." | S2-12 (vendor blog, mycableengineering/industrialmonitordirect) | snippet-only |
| [SP2-08] | In US duct-bank installations the cable copper-tape shield "often serves as a primary return path for ground fault current" because the conduit is a high-impedance path to ground. | S2-15 | verified |
| [SP2-09] | Polish MV study: earth faults on screened MV cable. Most of the current returns via earth rather than the screen, because the earth return resistance is ≈ 0.05 Ω/km. | S2-13 | snippet-only (host unreachable). (Carson's earth resistance π²f·10⁻⁴ = 0.049 Ω/km at 50 Hz is consistent; this is textbook knowledge, not a fetched source.) |
| [SP2-09b] | Datasheets other than NKT with R0/X0 for 3-core 185/240/300 mm² Cu at 8.7/15 kV, and Saudi (Riyadh Cables, Elsewedy) data | — | **NOT FOUND** (Tele-fonika has an R0/X0 table, garbled snippet only) |

Engine implication: model cable Z0 = (R1 + 3·Rscreen) + jX0, with X0 ≈ 0.8–1.0 × X1, as the default "screen return" case. A "screen + earth" case lowers R0. Make this a parameter. Use the NKT table as the reference dataset (20 kV construction; insulation thickness barely changes R and X between 15 kV and 20 kV, but C rises at 15 kV; flagged).

---

## 3. Cable fault statistics, SLG share and evolution, auto-reclose on cables

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-20] | **EPRI (US utilities, UG distribution; excludes third-party damage), median failures per 100 conductor-miles per year: cable 1.3, joints 0.4, terminations 0.2.** Cable "majority in the range of 0.7 to 2". Basis: utility estimates from investor-owned, coop and public power; each utility chose its own cable/accessory split. Source: EPRI Underground Systems Reference Book 2023, ch. 12 & 17. Recomputed per 100 km (per conductor-km): 0.81 / 0.25 / 0.12. Note: per *conductor* length, so a 3-phase circuit-km counts 3 conductor-km. | S2-16 | verified |
| [SP2-21] | Swedish distribution 1995–97 (2 of 5.4 M customers): ABB plots failure rates of power cables at 0.4 / 11 / 22 kV in faults per 100 circuit-km·yr, and states "the failure rate decreases with increasing system voltage". Bar values are graphic only. "Owners of MV distribution systems often collect … data … but do not publish". | S2-03 §8.5.1.2 pp. 3–5 | verified (values unreadable) |
| [SP2-22] | Danish in-service MV XLPE: ≈ 0.1 age-dependent failures per 100 km·yr. KEMA commissioning tests: long-term ≈ 2 breakdowns per 100 km on new MV/HV circuits, peak ≈ 8. | S2-17 (INMR) | snippet-only |
| [SP2-23] | "Most faults in underground single-conductor cables involve ground." | S2-14 (SEL, Tziouvaras 2012/2013), Introduction | verified |
| [SP2-24] | Permanent MV cable failures are sometimes preceded by **self-clearing incipient faults lasting a sub-cycle to one cycle** (localized insulation breakdown, e.g. water in splices). In the systems studied in Kasztenny et al. 2008, **10–15 % of permanent cable failures were preceded by incipient faults**. Case study: two 12.5 kV UG feeders with bursts "weeks before" failure; recorded events on single phases (A or C). | S2-15 §I, Figs. 5–7 | verified |
| [SP2-25] | Ongoing earth faults on MV cables "can transform into two phase to earth faults". | S2-13b (Łowczowski et al., Energies 12(16):3190, 2019) | snippet-only |
| [SP2-26] | General statement "SLG faults in cables usually evolve into multiphase faults", and SLG vs multiphase shares specific to UG cable | — | **NOT FOUND** (still). Use [SP2-24]/[SP2-25] as qualitative support only. |
| [SP2-27] | **Auto-reclose on cables:** "all faults on underground cables are permanent faults … once the solid cable insulation is damaged, it will not restore itself. Autoreclosing for faults on cables is counterproductive; it further damages the cable causing longer and more expensive repair." Preferred practice: allow AR on overhead sections and block it on cable sections of hybrid lines. | S2-18 §2.1 (SEL, Kasztenny et al., DPSP 2018) | **verified** (upgrades round-1 PR-19 from snippet-only) |
| [SP2-28] | "Faults in underground cables tend to be permanent … many utilities worldwide do not allow auto reclosing or only apply it very restrictively on a hybrid sub-transmission system"; "no clear guidance or standard" for hybrid systems. | S2-19 (GW Electric article, 2025) | verified (consultant article) |
| [SP2-29] | A UK DNO or Saudi policy text stating "no AR on all-UG feeders" | — | **NOT FOUND** (ENWL EPD282/EPD350 and SPEN ESDD-02-011 returned 403). The WPD/NGED 11 kV OH example shows a 3-shot sequence with 5 s / 10 s / 20 s dead times, then lockout [S2-20 Table 5-1]: overhead context only, verified. |

---

## 4. Cable fault location (conceptual) [S2-21 BAUR application guide, 2015] (verified unless marked)

- [SP2-30] **Procedure, in order:** fault indication → disconnect and earth → fault analysis and insulation test → **prelocation** → route tracing → **pinpointing** → cable identification → repair → test/diagnosis → re-energize (§4). In game terms, this is the restoration time chain.
- [SP2-31] **Fault classes:** low-resistive (R < 100–200 Ω) vs high-resistive (> 100–200 Ω), intermittent/breakdown faults, interruptions, and sheath faults. Around 100–200 Ω the TDR reflection fades, so the TDR "passes by". "Most of the cable faults occur between cable core and sheath" (§4.1–4.2). Normal loop resistance ≈ 0.7 Ω/km as a rough guide.
- [SP2-32] **TDR (impulse reflection):** LV pulse (max 160 V). Reflection is positive at an open or cable end and negative at a short, with r = (Z2−Z1)/(Z2+Z1). Use for low-resistive faults, cable length, cuts and joint locations. It needs two parallel conductors (core + screen). Measure from both ends when v/2 is uncertain (§5.2). **Propagation velocity v/2: XLPE 78–87 m/µs**, PILC impregnated 75–85, PE ≈ 100, PVC 76–87, EPR 68–83 (§2 table).
- [SP2-33] **SIM/MIM (secondary/multiple impulse, i.e. arc reflection):** a surge generator HV pulse ignites the high-resistance fault. While it arcs (low resistance) the TDR pulses see a negative reflection at the arc. Covers "~80–90 % of all faults" (§5.1, §5.3).
- [SP2-34] **ICM (impulse current):** an inductive coupler records the current transient travelling between the fault arc (r = −1) and the surge generator (r = −1). Suited to long cables (§5.4). **Decay method:** DC or VLF charging until breakdown; the voltage travelling wave oscillates between the source (r = +1) and the fault (r = −1). Used when breakdown voltage > 32 kV, since surge-generator methods are limited to faults breaking down at ≤ 32 kV (§5.5).
- [SP2-35] **Bridge (Murray/Glaser, modified Wheatstone):** for low-resistive faults (high-resistive with HV source), sheath faults, and unshielded cores to soil, where reflectometry cannot work (§5.7). **Burn-down:** modifies the fault characteristic (e.g. water in joints) (§5.1).
- [SP2-36] **Pinpointing (acoustic, "thumper"):** a surge generator in repetitive mode makes the fault flash over. A ground microphone finds the maximum bang. Arrival-time difference between the electromagnetic and acoustic signals gives distance; the electromagnetic signal also confirms the cable route (§7.1). Low-resistive faults (< 2 Ω) need audio-frequency/step-voltage methods instead (§7.2).
- [SP2-37] **VLF:** withstand test 0.01–0.1 Hz, typically 1.5–3 U0 for 15–60 min, pass/fail. **Tan δ** = resistive current / capacitive current, measured at 0.1 Hz from 0.5 U0 to 2 U0. Diagnostics use the magnitude and the tip-up (difference across voltage levels). [S2-22 Wikipedia] verified. IEEE 400.2-2013 numeric criteria (Tables 4–5): **NOT FOUND** (snippets inconsistent, not used).
- Megger product pages (EZ-Thump: "pulse echo for low-voltage pre-location, arc reflection for high-voltage pre-location"; DART, impulse current, voltage decay) [S2-23]: snippet-only (403).

---

## 5. Overcurrent coordination worked examples (fully numeric)

### GT-R2-1: Glover/Sarma/Overbye 5e, Example 10.4, radial 34.5 kV with CO-8 relays [S2-01 pp. 538–541] (verified)
**Inputs:**
- Loads: bus 1 11 MVA, bus 2 4 MVA, bus 3 6 MVA, all 0.95 pf.
- Fault currents, maximum (bolted 3-ph) / minimum (L-G or L-L): bus 1 3000/2200 A; bus 2 2000/1500 A; bus 3 1000/700 A.
- Breakers B1–B3: 5 cycles = 0.083 s each. CTs: B1 400:5, B2 200:5, B3 200:5. CTI 0.3 s.

**Steps (published):**
- **Tap settings (TS):** B3 load 100.4 A → 2.51 A secondary → **TS 3 A**. B2 load 167.3 A → 4.18 A → **TS 5 A**. B1 load 351.4 A → 4.39 A → **TS 5 A**. Recomputed loads: 100.41 / 167.35 / 351.43 A ✓.
- **Fault at bus 2 (2000 A):** B3 multiple 16.7 → TDS ½ → T3 = 0.05 s (clears in 0.133 s). B2 multiple 10.0. Required T2 = 0.05 + 0.083 + 0.3 ≈ 0.43 s → **TDS2 = 2**.
- **Fault at bus 1 (3000 A):** B2 multiple 15.0 → T2 = 0.38 s. B1 multiple 7.5. Required T1 = 0.38 + 0.083 + 0.3 ≈ 0.76 s → **TDS1 = 3**.

**Result:** B1 TS 5 / TDS 3; B2 TS 5 / TDS 2; B3 TS 3 / TDS ½. Rule stated: fault/pickup at minimum fault should be > 2.

**Caution:** times are read from the Westinghouse CO-8 graph (Fig. 10.12), not a formula. Use ±10 % tolerance, or test the procedure (TS/TDS selection logic) rather than the times.

### GT-R2-2: Glover 5e, 13.8 kV fuse / recloser / relay scheme (Fig. 10.18) [S2-01 pp. 541–544] (verified)
**Inputs (Table 10.7), max load / 3-ph fault / L-G fault (A):**

| Bus | Max load | 3-ph fault | L-G fault |
|---|---|---|---|
| 1 | 60 | 1000 | 850 |
| 2 | 95 | 1500 | 1300 |
| 3 | 95 | 2000 | 1700 |
| 4 | 250 | 3000 | 2600 |
| 5 | 250 | 4000 | 4050 |

**Published choices:**
- **Fuses:** 65T at the bus 1 tap; 100T at the bus 2 and 3 taps. Type T fuses at 15 kV, ≥ 10 kA.
- **Recloser:** phase minimum trip **200–250 % of maximum load**. Ground unit at about maximum load and above the allowable unbalance → **560 A phase / 280 A ground** for 250 A load. Standard minimum trips: 50, 70, 100, 140, 200, 280, 400, 560, 800, 1120, 1600 A. Sequence: 2 fast + 2 delayed; reclose **12 s / 2 s / 5–10 s**.
- **Substation relay:** CT 300:5 (4.17 A at max load). CO-11 (EI) **tap 9 A, TDS 2**; delayed recloser trips ≥ 0.2 s before the relay. Ground relay **tap 4 A, TDS 1**.

Context: overhead feeder. For an all-cable game network, use only the relay/fuse parts.

### GT-R2-3: NPAG-derived current-grading example, 11 kV cables + 4 MVA transformer [S2-02 pp. 3–5] (verified; secondary transcription of NPAG)
**Inputs:**
- 11 kV, E = 6350 V. Source 250 MVA (Zs = 0.485 Ω); minimum 130 MVA (Zs ≈ 0.93 Ω).
- Cable C→B: 200 m, 240 mm², 0.24 Ω. Cable B→transformer: 200 m, 240 mm², printed as 0.04 Ω.
- Transformer: 4 MVA 11/3.3 kV, 7 % → 2.12 Ω (0.07·11²/4 = 2.1175 Ω ✓).

**Published outputs and recomputed checks:**

| Fault | Published | Recomputed | Note |
|---|---|---|---|
| F1 (end of cable C–B, before B) | **8800 A** | 6350/0.725 = 8,759 A ✓ | — |
| Close to C at 130 MVA | "would not surpass 6800 A" | 6350/0.931 = 6,821 A ✓ | A relay at C set to 8800 A would protect nothing at the lower fault level |
| F4 (3.3 kV side) | **≈ 2200 A** | 6350/2.885 = 2,201 A ✓ | — |
| F3 at 250 MVA | **8300 A** | 6350/0.765 = 8,301 A ✓ | — |
| F3 at 130 MVA | **5250 A** | 6350/1.21 = 5,248 A ✓ | One denominator is printed as "0.214", a typo for 0.24 |

**Relay B setting:** 1.3 × 2200 = **2860 A** (20 % relay error + 10 % impedance variation). It covers the whole cable at both source levels.

**Lesson:** current grading fails between two points on the same cable (F1 and F2 differ by ~0.1 %). It works only across a transformer, which is exactly the RMU-ring case.

### Grading margins and setting rules (NPAG via S2-02)

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-10] | Typical relay data (NPAG Table 9.2 equivalent), electromechanical / static / digital / numerical: basic timing error **7.5 / 5 / 5 / 5 %**; overshoot **0.05 / 0.03 / 0.02 / 0.02 s**; safety margin **0.1 / 0.05 / 0.03 / 0.03 s**; **typical total relay-to-relay margin 0.4 / 0.35 / 0.3 / 0.3 s**. "At one time 0.5 s was … typical … 0.4 s is fair". IEC 60255 allows 7.5 % of operating time, which can exceed a fixed margin at low fault currents. Closes round-1 open item "NPAG Table 9.2". | S2-02 | verified (secondary) |
| [SP2-11] | Calculated margin: t' = (2E_R + E_CT)·t/100 + t_CB + t_o + t_s, with "+2E for the relay nearer the fault, plus 10 % for total CT error". Example t = 0.5 s gives 0.375 s (EM relay + conventional CB) down to 0.25 s (static relay + vacuum CB). Definite-time relays: drop E_CT. | S2-02 | numbers verified; equation image garbled → formula shape **uncertain** (reconstructed from the variable list) |
| [SP2-12] | Fuse–fuse discrimination is usually achieved if the rating ratio is > 2. A relay upstream of a fuse should use an EI curve with primary setting ≈ **3 × fuse rating**. Margin ≥ **0.4 s** fixed, or a variable minimum printed "0.4 … 0.15" (read as 0.4t + 0.15 s, where t is the fuse operating time). | S2-02 | verified; variable form **uncertain** |
| [SP2-13] | Earth-fault relays: "common settings … are **30 % to 40 % of the total load current or minimum ground short circuit current**" on the protected section. | S2-02 | verified (secondary) |
| [SP2-14] | Sensitive earth fault with a core-balance CT: settings **down to 10 % of the line current rating**. Where the cable sheath is earthed, the sheath earth lead must pass back through the CBCT, or core-sheath faults are not seen. Used for high-resistivity ground "(e.g. desert)" and downed conductors. | S2-02 | verified (secondary) |
| [SP2-15] | Directional relays at the receiving end of parallel feeders: typically **50 % of normal full load, TMS 0.1**. | S2-02 | verified (secondary) |
| [SP2-16] | Blocking-based (logic-selective) overcurrent: the upstream relay trips with a short delay of **0.15–0.20 s** unless blocked by the downstream relay. | S2-03 §8.5.1.5 p. 12 | verified |
| [SP2-17] | NPAG C1 original worked example (time grading, full TMS table) | S2-04 | **NOT FOUND / not retrieved** (se.com 404; Scribd copies would not load) |

---

## 6. Earth-fault pickup practice and FPI thresholds

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-40] | EF pickup 30–40 % of load current or of minimum ground fault [SP2-13]. SEF via CBCT down to 10 % of line rating [SP2-14]. Recloser ground minimum trip ≈ maximum load, above allowable unbalance; phase 200–250 % of maximum load [GT-R2-2]. | S2-02, S2-01 | verified |
| [SP2-41] | Blog NER example: 51N pickup **10–20 % of NER let-through** (40–80 A for a 400 A NER). | S2-07 | verified as published (low authority) |
| [SP2-42] | **SEL LINAM ARU** fault indicator: trip thresholds **50 to 1,200 A**; trip response time "function of trip threshold" (no ms value); **inrush restraint 5 cycles**; current-activated timed reset **0, 2, 4, 8 or 12 h** (fiber-optic display version 0/2/4/8 h, with current-reset override). | S2-24 | verified (spec page) |
| [SP2-43] | **Ensto IPS2** (cable FPI, directional EF for impedance-earthed or isolated networks, no VT needed). OC pickup/delay combinations: 1.3×IP/IS with 0.5 s; 2.0×, 2.5× or 3.0× with 0.04 s or 0.2 s (IP/IS = CT ratio, i.e. multiples of CT primary). EF pickup **1.0 / 1.5 / 2.0 A** (instant or 0.2 s) and **10 A @ 0.2 s** primary, for a 300/1 base (0.5–5 A with 150/1). LED auto-reset after **24 h**; external LED lights only once the line is dead. | S2-25 (IPS2-ENSTO1-ENG-08-2023) | verified |
| [SP2-44] | Nortroll CableTroll: PtG 5–240 A, PtP 250/300–1000 A | round-1 SC-11 | already verified; not repeated |
| [SP2-45] | Other ranges from snippets: CableTroll 2330 350–1200 A; C&S CSFPI-C13 SC 100–1200 A, EF 10–150 A, auto-reset 1/2/4 h; DJX-FF-C 200–2000 A (default 800 A, 20 ms), EF 10–150 A; Siemens FPI sensors phase 200–800 A, ground 40–300 A; SEL-MR 100–800 A ±10 %. | S2-26 (search snippets) | snippet-only |
| [SP2-46] | A-Eberle EOR-1DS: combined SC + earth-fault indicator for compensated, isolated, low-ohmic and solid networks. Transient/qu2 directional EF; thresholds for U_NE and 3I0 "configurable"; reset by external signal, menu, timer or end of fault. No default values printed. | S2-27 | verified (no numbers) |
| [SP2-47] | Horstmann ComPass/SIGMA and Schneider Flair 23DM thresholds | — | **NOT FOUND** (manual pages bot-blocked) |

FPI model parameters supported by these sources: phase threshold 50–1200 A (typical options 400–1000 A); earth threshold ~5–240 A (sensitive directional FPIs ~1–10 A primary); operating delay 20–40 ms up to 0.2–0.5 s; inrush restraint ~5 cycles; reset by timer (2–24 h), by voltage return or manually; optional indication only after the line goes dead.

---

## 7. MV fuse selection for distribution transformers; transfer current

| ID | Claim | Source | Status |
|---|---|---|---|
| [SP2-50] | **ABB fuse selection (Table 4.2)**, transformer kVA → CEF fuse A. **10 kV:** 100→16, 125→16, 160→20, 200→20, 250→25, 315→32.5*, 400→32.5*, 500→50, 630→50, 800→63. **12 kV:** 10, 16, 20, 20, 20, 25, 32.5*, 40, 50, 50. **15 kV:** 10, 10, 16, 16, 20, 20, 25, 32.5*, 40, 40. (*"32.5" as printed, presumably 31.5.) Selection criteria: no operation at rated current, permissible overload or inrush; fast clearing of an LV-terminal fault; fuse rated voltage ≥ system U_LL. | S2-28 §4, pp. 18–19 | verified |
| [SP2-51] | **Transfer-current worked example (ABB Example 4.1):** 800 kVA transformer, CEF 12 kV **63 A**, NALF switch-disconnector **T0 = 50 ms, switch rated transfer current 1600 A**. Fuse transfer current **840 A** (≤ 1600 A ✓). Transformer SC current at uk = 4 % = **1155 A** > 840 A ✓ (the second condition). Fig. 4.20 also shows 0.87·Isc = 731 A. Recomputed: 1155 A corresponds to 10 kV (800/(√3·10)/0.04 = 1154.7 A); at 12 kV it would be 962 A, so the example's system voltage is 10 kV. | S2-28 pp. 23–24 | verified |
| [SP2-52] | **Iterative transfer-current procedure (ABB summary of IEC 62271-105 Annex B):** (1) pick a current, read the fuse min-melt time T2; (2) take 87 % of it (the two-phase case) and read time T1 on the intermediate characteristic; (3) require T2 − T1 ≤ T0; (4) iterate until it holds, which gives I_transfer. Closes round-1 open item 4 at concept level; the exact normative text (and any "0.9·T0" form) is still unread. | S2-28 p. 23; IEC ToC S2-29 | verified (vendor summary); normative text **NOT FOUND** |
| [SP2-53] | **IEC 62271-105:2012 definition 3.7.109:** transfer current = "value of the three-phase symmetrical current at which the fuses and the switch exchange breaking duties". Above it, fuses alone interrupt. Immediately below it, the first-pole-to-clear is interrupted by the fuse and the other two by the switch or fuses, depending on the fuse TCC tolerances and fuse-initiated opening time. Take-over current (min/max) for release-operated combinations is defined via the intersections of fuse and switch/relay TCCs (3.7.111–112). Annex B "(normative) Procedure for determining transfer current"; Annex A example of fuse–switch–transformer coordination. | S2-29 pp. 11–12, ToC | verified |
| [SP2-54] | **SIBA HHD selection guide** (DIN types A/B/C). The Type C table (no LV main fuse) has a **15–17.5 kV column** usable for 13.8 kV: 100 kVA→16 A; 160→20–25; 250→25–31.5; 315→25–31.5; 400→31.5–50; 500→31.5–63; 630→40–80; 800→63–100; **1000→63–100**; 1250→100; 1600→125; 2000→160. 10–12 kV column: 500→50–80, 630→63–80, 1000→100–160. | S2-30 pp. 18–20 | verified |
| [SP2-55] | Fuse arc withstand: back-up fuses may operate below their minimum breaking current, so the standard requires the manufacturer to declare that the fuse withstands internal arcing for ≥ 100 ms; the ABB test shows 200 ms. | S2-28 p. 24 | verified |
| [SP2-56] | Explicit 13.8 kV column from an IEC/RMU vendor | — | **NOT FOUND**. S&C, ERMCO and Maddox publish US 13.8 kV tables for expulsion/bayonet fuses (snippet-only); these are not IEC fuse-switch tables. |

---

## Golden-test summary (new in round 2)
1. **GT-R2-A** (NER + Dyn transformer, 11 kV): Isolid 10,497 A; Rn 15.9 Ω → 399 A. Tolerance 0.5 %. Low-authority source.
2. **GT-R2-B** (Rn for 400 A at 22 kV, generator): 31.75 Ω. Tolerance 0.1 %.
3. **GT-R2-3** (NPAG current grading at 11 kV): 8,759 / 2,201 / 8,301 / 5,248 A. Published values are rounded, so tolerance 1 %. Relay B 2860 A.
4. **GT-R2-1** (Glover CO-8 radial): settings table; times are curve-read, so ±10 %.
5. **GT-R2-2** (Glover 13.8 kV recloser/fuse): setting-rule test (560/280 A, tap 9/4).
6. **ABB transfer current** [SP2-51]: transformer SC check 1155 A > 840 A; switch check 840 ≤ 1600 A.
7. **Cable data sanity test**: R0 = R + 3·Rscreen for every NKT row; earth-fault A/km = 3ωC·U/√3.

## Remaining open items
- An authoritative (textbook, IEEE or vendor) Dyn + NER worked example: still missing. IEEE 142 / C62.92 are paywalled.
- SLG share of UG cable faults, and evidence for SLG → multiphase evolution: only qualitative [SP2-24/25].
- Utility policy text "no AR on cable feeders": UK DNO PDFs were blocked. Ask the owner about SEC practice.
- IEEE 400.2 tan δ thresholds; NPAG C1 original; Horstmann/Flair FPI defaults; Riyadh Cables / Elsewedy R0/X0.
