# 02 — Fault physics, short-circuit calculation, earthing, fault location (MV distribution)

Research notes for the game engine. Source list: `research/sources/02-sc.md` (IDs `[SC-xx]`).
Status tags on each claim: **verified** (I read it in the source), **snippet-only** (search snippet only), **uncertain** (sources conflict / edition unclear), **NOT FOUND**.
All arithmetic marked "recomputed" was re-done by me in Python from the published inputs (not a new source).

Limitations of this pass: IEC 60909-0 and IEC TR 60909-4 themselves were not read (paywalled; VDE preview returned 503). The web-search budget ran out before topics 6 (fault-location methods) and 7 (evolving faults) were fully covered. Those gaps are marked below.

---

## 1. IEC 60909-0 method (summary from public secondary sources)

| ID | Item | Content | Source | Status |
|---|---|---|---|---|
| [N-01] | Equivalent voltage source | A single source `c·Un/√3` is placed at the fault location. All other sources are shorted, and loads, line capacitances and non-rotating shunts are neglected. | SC-05 eq.6 and §IV-A; SC-01 §3.3 step 1 | verified |
| [N-02] | Purpose of c | Covers voltage variation in space and time, transformer tap changes and the subtransient behaviour of machines. | SC-01 §3.3 | verified |
| [N-03] | **c table, IEC 60909-0:2016** | LV (100 V–1 kV), tolerance +6%: cmax 1.05, cmin 0.95. LV, tolerance +10%: cmax 1.10, cmin 0.95 per SC-05 and SC-07, but **0.90** per SC-08. MV (>1 kV–35 kV) and HV (>35 kV): cmax **1.10**, cmin **1.00**. | SC-05 Table I; SC-07; SC-08 | verified for MV/HV; **uncertain/conflicting** for LV-10% cmin (0.95 vs 0.90) |
| [N-04] | c table, OLD edition (as printed in CT158, 2000) | LV 230/400 V: 1 / 0.95. Other LV: 1.05 / 1. HV 1–230 kV: 1.1 / 1. This is the pre-2001 table. **Do not use it for the engine.** | SC-01 Fig.25 p.23 | verified (but superseded) |
| [N-05] | Network feeder | `ZQ = c·UnQ² / S''kQ = c·UnQ / (√3·I''kQ)`. Feeders are given S''kQ,max/min and R/X max/min. | SC-05 eq.1 | verified |
| [N-06] | Transformer correction KT | `KT = 0.95 · cmax / (1 + 0.6·xT)`. xT is the relative reactance of the transformer and cmax is the value for the LV side. It applies to network transformers. SC-05 says it is also applied to the equivalent 2-winding parts of 3-winding transformers. SC-05 eq.4 writes `zk = (uk/100)·KT`. Recomputed values with cmax 1.1: xT 0.04 → 1.0205, xT 0.06 → 1.0087, xT 0.10 → 0.9858. | SC-05 eq.4–5 | verified (formula) |
| [N-07] | KT max only | Phrased as "applied for maximum SC, not minimum" (SC-22 blog). Not confirmed in a primary text. | SC-22 | snippet-only |
| [N-08] | Peak current | `ip = κ·√2·I''k` with `κ ≈ 1.02 + 0.98·e^(−3R/X)`. CT158 says this holds "for all types of faults" in non-meshed systems. For meshed systems, SC-07 uses Method C: R/X = (Rc/Xc)·(fc/f) with fc = 20 Hz for f = 50 Hz (24 Hz for 60 Hz). Methods A and B are named but not described. | SC-01 §3.4 p.25; SC-07 | verified |
| [N-09] | Breaking current | Far from generator: I''k = Ib = Ik. Near generator: `Ib = µ·I''k`, with µ = 0.84 + 0.26·e^(−0.26·I''kG/IrG) at tmin 0.02 s; 0.71 + 0.51·e^(−0.30·…) at 0.05 s; 0.62 + 0.72·e^(−0.32·…) at 0.10 s; 0.56 + 0.94·e^(−0.38·…) at ≥0.25 s. Asynchronous motors also use q = 1.03 + 0.12·ln m (0.02 s) … 0.26 + 0.10·ln m (≥0.25 s). | SC-01 §3.3–3.4, Fig.27; SC-07 | verified (SC-07 gives the formulas; SC-01 gives the graph) |
| [N-10] | Steady-state Ik | Near generators: Ikmax = λmax·Ir and Ikmin = λmin·Ir (graphs Fig.28/29). | SC-01 §3.4 | verified |
| [N-11] | Thermal equivalent Ith (m, n factors) | — | — | **NOT FOUND** (no public formula text retrieved) |
| [N-12] | Max conditions | Use cmax. Use only conservative approximations. Include motors. Line R at 20 °C. | SC-01 p.24; SC-07 | verified |
| [N-13] | Min conditions | Use cmin. Use the network configuration and minimum source contribution that give the lowest current. Neglect motors. Correct line R to the end-of-fault temperature: `RL = [1 + 0.004/°C·(θe − 20 °C)]·RL20`, where 0.004 holds for Cu, Al and Al-alloy. SC-05 prints "0.04 K⁻¹", which is a typo. SC-05 case study used θe = 200 °C for overhead lines and 90 °C for cables. SC-07: S''kQ,min should be at least 10% below max. | SC-01 p.24; SC-05 §V-B; SC-07 | verified |
| [N-14] | Scope | CT158 (2000) says the method applies below 230 kV. SC-07 says Vision does not enforce the 230 kV limit. | SC-01 §3.3; SC-07 | verified |
| [N-15] | Simplified "impedance method" | CT158 §2 uses Isc = U/(√3·Zsc) with c = 1, Xup ≈ 0.98·Zup and Rup ≈ 0.2·Xup at 20 kV ("Rup/Zup ≈ 0.1 at 150 kV"). It is a different method from IEC 60909 (no c, no KT). | SC-01 p.12–20 | verified |

## 2. Symmetrical components and fault types

Notation: E = phase-to-neutral prefault source (`c·Un/√3` in IEC 60909). Z1, Z2, Z0 are the Thevenin sequence impedances at the fault point. ZF is the fault impedance.

| ID | Fault | Formula (magnitude of the faulted-phase current) | Source | Status |
|---|---|---|---|---|
| [F-01] | 3-phase | `I = E / (Z1 + ZF)`. IEC form: `c·Un/(√3·Z1)` | SC-04 §9.1; SC-01 Fig.26 | verified |
| [F-02] | SLG (phase a) | `I0 = I1 = I2 = E/(Z0+Z1+Z2+3ZF)`, `Ia = 3·I0`. IEC form: `√3·c·Un/|Z1+Z2+Z0|` | SC-04 eq.9.2.7–9.2.8; SC-01 Fig.26; SC-02 §3.2 | verified |
| [F-03] | LL (b–c) | `I1 = −I2 = E/(Z1+Z2+ZF)`, I0 = 0, `Ib = −j√3·I1`, so magnitude `√3·E/|Z1+Z2+ZF|`. IEC form: `c·Un/|Z1+Z2|` | SC-04 eq.9.3.10–11; SC-01 Fig.26 | verified |
| [F-04] | DLG (b–c–g) | `I1 = E/(Z1 + Z2‖(Z0+3ZF))`, `I2 = −I1·(Z0+3ZF)/(Z0+3ZF+Z2)`, `I0 = −I1·Z2/(Z0+3ZF+Z2)`. Earth current `In = 3·I0`. IEC (ZF = 0) phase current: `√3·c·Un·|Z0 − a·Z2| / |Z1Z2+Z2Z0+Z0Z1|` (CT18 form). CT158 Fig.26 gives `c·Un·√3·Z(2)/(Z1Z2+Z2Z0+Z1Z0)` for the earth current. | SC-04 eq.9.4.12–14; SC-02 §4.1; SC-01 Fig.26 | verified |
| [F-05] | Far-from-generator simplification | Z2 = Z1, so: LL = c·Un/(2Z1); SLG = √3·c·Un/(2Z1+Z0); DLG earth current = √3·c·Un/(Z1+2Z0) | SC-01 Fig.26 | verified |
| [F-06] | Order of frequency | "single line-to-ground, line-to-line, double line-to-ground, and balanced three-phase", from most to least frequent | SC-04 p.471 | verified (order only, no %) |
| [F-07] | Percent shares | SLG ~65–80%, DLG ~10–20%, 3-ph ~2–5%. Overhead or transmission context. Sources disagree. | SC-17 | snippet-only, **uncertain** |
| [F-08] | Earth-fault factor | The ratio of the highest healthy-phase rms voltage during the fault to the normal phase voltage is 1–1.8 (k1, k2). High X0/X1 corresponds to isolated or compensated networks. | SC-02 §3.2 p.12 | verified |
| [F-09] | Open phase | CT18 §3.6 "network with one open phase". Worked application: an open phase gives a negative-sequence current ≈ 0.87·Iload for phase current (I2 = I3 = U/(2·Zload)), with Id = Ii = 0.5·Iload for passive loads. | SC-02 §4.4 p.25 | verified |
| [F-10] | Sequence operator | `a = e^(j2π/3) = −1/2 + j√3/2`. `Ia = I0+I1+I2`, `Ib = I0+a²I1+aI2`, `Ic = I0+aI1+a²I2` | SC-01 §3.2; SC-04 | verified |

### Zero-sequence paths

| ID | Element | Z0 (seen from the given side) | Source | Status |
|---|---|---|---|---|
| [Z-01] | Transformer Dyn or YNyn (from the secondary) | Z0 ≈ X(1) | SC-01 Fig.24 | verified |
| [Z-02] | Transformer Yyn or Zyn (from the secondary) | ∞ with free flux; 10–15·X(1) with forced flux | SC-01 Fig.24 | verified |
| [Z-03] | Transformer, primary D or Y with secondary zn | 0.1–0.2·X(1) | SC-01 Fig.24 | verified |
| [Z-04] | Transformer with no earthed neutral | ∞. The delta winding blocks zero sequence: the zero-sequence network is open looking into the delta side. | SC-01 Fig.24; SC-04 Ex 9.1; SC-01 §3.5 | verified |
| [Z-05] | Neutral impedance Zn | Appears as **3·Zn** in the zero-sequence network | SC-04 Ex 9.1 (3Xn); SC-02 §4.3 (3Rn) | verified |
| [Z-06] | Line (rule of thumb) | Z0 ≈ 3·Z(1). Worked examples use X0 = 3 × 0.35 Ω/km at 30 kV (SC-01) and 3 × 0.40 Ω/km at 60 kV (SC-02) for overhead lines. | SC-01 Fig.24 and §3.5; SC-02 §4.2 | verified (rule of thumb) |
| [Z-07] | Synchronous machine | Z0 ≈ 0.5·Z(1); asynchronous Z0 ≈ 0 (as tabulated) | SC-01 Fig.24 | verified |
| [Z-08] | **MV cable Z0 (sheath/screen return, bonding)** | No public numeric method or data retrieved. The TR 60909-4 test network in SC-06 shows overhead-line R0/R1 ≈ 1.8–4.3 and X0/X1 ≈ 2.8–4.8, plus one 10 kV cable L6 with Z0 = Z1 as entered. | SC-06 | **NOT FOUND** for cables (open question) |
| [Z-09] | Dyn11 phase shift | Phase shift does not change the fault-side currents. It does change the contributions seen on the other side for unsymmetrical faults (GSO Ex. 9.6). No Dyn11-specific (+30°/−30°) convention text was extracted. | SC-04 §9.1 p.474, Ex 9.6 | verified (general); Dyn11 convention **NOT FOUND** |

## 3. MV neutral earthing systems

| ID | Method | Earth-fault current | Other effects | Source | Status |
|---|---|---|---|---|---|
| [E-01] | Isolated | Set by stray capacitance: **2 to 200 A** | Low damage. "Possible overvoltages". Earth-fault protection is "Difficult". After a clear fault the healthy phases rise to phase-to-phase voltage. Can run with a sustained earth fault, but a second fault on another phase becomes a short circuit. | SC-03 Fig.1 p.4; §4.1 p.12–13 | verified |
| [E-02] | Tuned / Petersen coil (resonant, compensated) | "Almost zero, dep. on tuning and quality factor (< 40 A)" (Fig.1). The text says "a few amps (typically 2 to 20 A)". Resonance condition LCω² = 1, with C the sum of the phase-earth capacitances of the 3 phases. | Many faults self-extinguish ("typically all air gap flashovers"). Insulation faults inside cables do not benefit. Can run with a sustained fault (limited by coil thermal rating). Locating faults is hard. Needs directional residual or residual-power protection. In 2001, directional field fault detectors were "too expensive and do not therefore exist". CT203 calls the method "unworthy of consideration for networks with a high proportion of underground cables" but says newer sensors may change this. | SC-03 Fig.1, §4.1 p.13–14 | verified |
| [E-03] | Impedant (generally resistive) | **100 to 2000 A approx.** | Easy detection with residual overcurrent and time-graded discrimination (definite time / IDMT). Very high-impedance faults defeat residual protection. Thermal limit on the impedance. | SC-03 Fig.1, §4.1 p.14 | verified |
| [E-04] | Directly (solidly) earthed | **2 to 25 kA**, varies with location | High damage, significant voltage disturbance. Same protection serves phase and earth faults. Favours IDMT and short clearing times. | SC-03 Fig.1, §4.1 p.15 | verified |
| [E-05] | Reactance (non-tuned) | "With public distribution, no networks are earthed by a single non-tuned inductance." An impedance may include an inductive part to partly compensate capacitive current. | SC-03 §4.1 p.14 | verified |
| [E-06] | Countries (3-wire networks) | Direct: GB, Spain. R//L low impedance: France, Germany, Spain. Petersen: Germany, Hungary, Poland. Isolated: Spain, Sweden, Norway, Italy, China. 4-wire networks (North-American style) use multi-earthed directly-earthed neutral. | SC-03 §2.1 p.8 | verified (2001 snapshot) |
| [E-07] | Saudi Arabia / SEC practice | — | — | **NOT FOUND** (ask Ahmad) |
| [E-08] | Capacitive charging current, rule of thumb | 15 kV three-core cable: zero-sequence capacitance ~200 nF/km, giving 3·C0·ω·E ≈ 1.63 A/km ("almost 2 A per km"). 15 kV overhead line: ~5 nF/km, about 0.04 A/km. Recomputed: 1.632 A/km. Each healthy feeder contributes 3·C0i·ω·E. The residual relay setting on each feeder must exceed this. | SC-02 §4.3 p.24 | verified |
| [E-09] | Non-effective grounding | Coefficient of grounding > 80% (per IEEE C62.92.4 / IEC 60044-8, as cited) | SC-16 | verified (as cited, primary not read) |

**Typical arrangement for networks with RMUs:** CT203 describes open-loop (open-ring) MV underground networks with centrally protected feeders, fault detectors and remote-controlled switches [E-10, verified, SC-03 §4.2]. No source retrieved says which earthing method is "typical with RMUs". It depends on country (see E-06). Status: **NOT FOUND** as a general claim.

## 4. Fault passage indicators (FPI) / earth fault indicators

| ID | Claim | Source | Status |
|---|---|---|---|
| [P-01] | IEC 62689-1:2016 (EN 62689-1:2016 / DIN EN 62689-1:2017-11, VDE 0414-689-1) "Current and voltage sensors or detectors, to be used for fault passage indication purposes – Part 1: General principles and requirements". Product-family standard for FPIs detecting short circuits and earth faults in 1 kV–52 kV networks, from simple local devices to IEC 60870-5 / IEC 61850 devices. Also covers fault direction. | SC-09 | verified |
| [P-02] | IEC 62689-2 = "System aspects" (helps users choose FPIs). Part 1 also covers DSUs (distribution substation units). | SC-10 | snippet-only |
| [P-03] | **Locating logic:** "All indicators between the feeding transformer and the fault location activate." The faulted section lies between the last lit indicator and the first unlit one. This assumes radial or open-ring operation fed from one side. | SC-11 p.2 (vendor) | verified (vendor) |
| [P-04] | Threshold principle. The capacitive discharge current from the part of the network *behind* the sensor (as seen from the feeder) must not exceed the earth-fault trip setting. Otherwise a healthy-section indicator can trip on an earth fault elsewhere. | SC-11 p.2 (vendor) | verified (vendor) |
| [P-05] | Example device ranges (Nortroll CableTroll, model-dependent): PtG trip 5–240 A (some 6–340 A, 10–160 A, 20–160 A, fixed 50 A). PtP trip 250–1000 A or 300–1000 A (one model 200–1000 A). Reset: manual, timer, automatic, remote. Features include "Inrush blocking and Voltage Reset" via capacitive test point. Separate PtP/PtG LEDs and relay outputs. 6–36 kV. | SC-11 (vendor) | verified (vendor) |
| [P-06] | In non-solidly-earthed networks, earth-fault current depends on the size of the galvanically connected network, voltage, cable type and neutral equipment. A dual (cross-country) earth fault gives about short-circuit-level current. | SC-11 p.2 (vendor) | verified (vendor) |
| [P-07] | Impedant-earthed networks: simple, low-cost detectors react to earth-fault current. Their limited sensitivity misses some impedant faults. Lower thresholds cause only "unnecessary signaling", which has no serious consequence. | SC-03 §4.1 p.14 | verified |
| [P-08] | Compensated networks need directional detection (transient-based in newer FPIs). Groupe Cahors offers "directional or amperometric" versions "depending on the grounding of the neutral". | SC-03 p.14; SC-20; SC-19 | verified (SC-03); snippet-only (SC-19/20) |
| [P-09] | Sensors: split / open-ended cores around single-core cables, or core-balance CTs on the termination. Cable screen-earth return must be routed correctly through the sensor. Not verified in a retrieved text. | SC-19 snippet; SC-23 snippet | snippet-only |
| [P-10] | Remote-controlled switches plus fault detectors let operators re-supply "usually over 60%" of affected customers. Restoration runs in 3 stages: (1) remote reconfiguration, (2) manual field switching, (3) repair. | SC-03 §4.2 p.15 | verified |
| [P-11] | Siemens SICAM FPI: cable short-circuit and earth-fault FPI, 10–36 kV, LED indication. | SC-18 | snippet-only |

## 5. Cable fault statistics and fault types

| ID | Claim | Source | Status |
|---|---|---|---|
| [C-01] | MV cable failure causes (aggregated US/DK/UK/CN field data): ~50% third-party damage (e.g. excavation). Of the remaining 50%: 10–20% ageing, 10% installation, 7–15% manufacturing quality, 10% other. | SC-12 §3.1 | verified |
| [C-02] | 70–80% of failures related to quality and operation occur at accessories (joints, terminations, elbows, splices); 20–30% in the cable body. Counting third-party damage, the cable body accounts for 60–70% of all failures. | SC-12 §3.3, §4.2 | verified |
| [C-03] | Danish MV XLPE installed before the 1980s shows up to 20× the failure rate of later cable (steam-cured vs dry-cured XLPE). | SC-12 §3.2 | verified |
| [C-04] | Danish MV XLPE: 0.4–0.6 faults per 100 km·yr (oil-paper ~3). US 20-utility survey (2006–07): 7.5 per 100 km·yr (all MV cable systems). Split 41% cable / 38% joints / 21% terminations. | SC-13 | snippet-only |
| [C-05] | "Acceptable" UG XLPE distribution cable: < 1 fault per 100 km·yr | SC-14 | snippet-only |
| [C-06] | Water trees form with moisture ingress, often near joints. Jacket damage from external forces leads to long-term water-tree failure. | SC-12 §4.2 | verified |
| [C-07] | HIF definition: conductor contact with a resistive surface (road, sidewalk, sod, tree limb) that limits current below what conventional overcurrent devices reliably detect. Typical example: a downed overhead conductor. | SC-15; SC-16 | verified |
| [C-08] | "A fault impedance of 1,000 ohms or more can be assumed as a HIF." Also, an HIF is one that fundamental-frequency relays (distance, differential, overcurrent) cannot detect. | SC-16 §definitions | verified |
| [C-09] | Some HIFs are intermittent: the current appears, self-extinguishes and re-strikes at irregular intervals. They are hard to detect even with low settings. | SC-16 §5.1 | verified |
| [C-10] | HIFs in **underground cable** networks: no source retrieved. Retrieved HIF material is about overhead lines. | — | **NOT FOUND** |
| [C-11] | Open-conductor detection: loss-of-voltage at a lateral end (Kearny OCD) and similar devices described for overhead lines. The 1996 report excludes breaks with no ground contact. | SC-15 | verified (overhead context) |
| [C-12] | TDR principle: a pulse reflects from impedance discontinuities, and distance = v·t/2. Reflection coefficient is +1 for an open and −1 for a short, so polarity distinguishes open from short. | SC-24 | verified |
| [C-13] | VLF testing: 0.01–0.1 Hz withstand/diagnostic testing for MV extruded cables. Levels per IEEE 400.2/400.3 (installation ~1.9·U0, acceptance ~2·U0, maintenance ~75% of acceptance). Minimum 60 min at 0.1 Hz for new cable, 30 min for aged cable. | SC-12 §VLF | verified (as summarised by SC-12; IEEE 400.x not read) |
| [C-14] | Arc reflection (ARM), surge/"thumper" pinpointing, bridge methods | — | **NOT FOUND** (search budget exhausted) |

## 6. Arcing, evolving and intermittent faults

| ID | Claim | Source | Status |
|---|---|---|---|
| [A-01] | In tuned (Petersen) networks many faults self-extinguish ("typically all air gap flashovers"). Insulation faults inside cables do not. | SC-03 p.14 | verified |
| [A-02] | In isolated networks running with a sustained earth fault, a second earth fault on another phase creates a short circuit (cross-country fault). | SC-03 p.13; SC-11 | verified |
| [A-03] | Intermittent, self-extinguishing, re-striking HIFs | SC-16 §5.1 | verified |
| [A-04] | "SLG faults in cables often evolve into multi-phase faults": no retrieved source states this. | — | **NOT FOUND** (do not use without a source) |
| [A-05] | Fault impedance ZF for an arcing fault "is the arc impedance". For tower flashover it includes the tower and footing. | SC-04 §9.2 | verified |

---

## Golden test candidates

Every value below is the published value. "Recomputed" is my own check, used to set tolerances. Keep test tolerance ≥ the gap between published and recomputed values, because publications round intermediate results.

### GT-1 — CT158 §2.4, Fault A on a 20 kV busbar (impedance method, c = 1, no KT)  [SC-01 p.18–20]
Inputs:

| Element | Data | Derived (published) |
|---|---|---|
| Upstream network | U = 20 kV, Psc = 500 MVA. Zup = U²/Psc. Xup = 0.98·Zup. Rup = 0.2·Zup ≈ 0.2·Xup | Xup = 0.78 Ω, Rup = 0.15 Ω |
| Overhead line | 3 × 50 mm² Cu, 2 km. X = 0.4 Ω/km. R = ρ·L/S with ρ = 0.018 Ω·mm²/m | X = 0.8 Ω, R = 0.72 Ω |
| Generator (neglected for fault A, "much greater") | 1 MVA, X''= 15%, RG = 0.1·XG | XG = 60 Ω, RG = 6 Ω |

Expected: XA ≈ 1.58 Ω, RA ≈ 0.87 Ω, ZA ≈ 1.80 Ω, **IA ≈ 6,415 A** (=20 kV/(√3·1.80)). R/X = 0.55, κ read from the curve = 1.2, **ip = 10,887 A** (published; its own arithmetic gives 1.2·√2·6415 = 10,886 A).
Recomputed without rounding: ZA = 1.8105 Ω, IA = 6,378 A, κ (formula) = 1.206, ip = 10,880 A. → Tolerance about 1%.
Extension (same source, LV side, 2 × 1000 kVA, 410 V, usc 5%): Fault B: XB = 6.51 mΩ, RB = 1.2 mΩ, ZB = 6.62 mΩ, IB ≈ 35,758 A. Fault C: ZC ≈ 19 mΩ, IC ≈ 12,459 A, ip ≈ 27,310 A. Fault D: ZD ≈ 31.42 mΩ, ID ≈ 7,534 A, ip ≈ 11,187 A.

### GT-2 — CT158 §3.5, 30 kV network, 3-ph and SLG with symmetrical components  [SC-01 p.26–29]
Inputs: 60 kV network 290 MVA. Substation E has 2 × 10 MVA transformers, 60/30 kV, usc 6%; only their secondaries are earthed. 30 kV lines X1 = X2 = 0.35 Ω/km and X0 = 3 × 0.35 Ω/km, lengths 40, 30, 20 and 15 km. Other transformers: 8%, delta windings on the 30 kV side, so Z0 = ∞. Passive loads: X = 0.6·U²/S. All R neglected. Element reactances (published, referred to 30 kV): a = j3.1, b = j5.4 (each), c1..c4 = j14 / j10.5 / j7 / j5.25, d = j9, e = j90, f = j18, g = j270; zero-sequence b' = j5.4, c'i = 3·ci, d' = f' = ∞.

| Case | Z1 = Z2 (Ω) | Z0 (Ω) | c | I''k3 (published) | I''k1 (published) | Recomputed |
|---|---|---|---|---|---|---|
| Line GH open | j17.25 | j39.45 | 1.1 | **1.104 kA** | **0.773 kA** | 1.1045 / 0.7729 kA |
| Line GH closed | j13.05 | j27.2 | 1.1 | **1.460 kA** | **1.072 kA** | 1.4600 / 1.0724 kA |

Note: the problem statement says "the factor c for U is set to 1", but the results were computed with c = 1.1 ("Note the network is HV, hence coefficient c = 1.1"). The published currents match c = 1.1. The reduction to j17.253 Ω was recomputed (Z' = j5.381, as published). The breaker is sized at 76 MVA.

### GT-3 — Glover/Sarma/Overbye 5e, Examples 9.1–9.5: bus-2 faults, all four fault types  [SC-04 pp. 475–489]
Inputs (published Thevenin equivalents at bus 2, 100 MVA and 13.8 kV base, VF = 1.05∠0° pu, D–Y phase shift neglected): **Z1 = j0.13893, Z2 = j0.14562, Z0 = j0.25 pu**. Base current 4.1837 kA.
Element data stated in the text: motor X'' = 0.20, X2 = 0.21, X0 + 3Xn = 0.10 + 0.15 (Xn = 0.05 on the motor base). Left of bus 2: positive sequence j0.455 = j(0.15+0.10+0.105+0.10), negative sequence j0.475 = j(0.17+0.10+0.105+0.10). Zero sequence is open to the left because of the transformer T2 Δ.

| Fault (bolted) | Published result | Recomputed |
|---|---|---|
| 3-ph (Ex 9.2) | I1 = −j7.558 pu (kA not stated in Ch.9; "same as Ex 7.4(c)") | 7.5578 pu → 31.62 kA (derived) |
| SLG a-g (Ex 9.3) | I0 = I1 = I2 = −j1.96427. **Ia = −j5.8928 pu = 24.65 kA**. V0 = −0.49107, V1 = 0.77710, V2 = −0.28604 pu. **Vbg = 1.179∠−128.7°, Vcg = 1.179∠128.7° pu** (angles as printed: ∠231.3° / ∠128.7°) | 5.8928 pu, 24.654 kA, 1.1791∠±128.66° |
| LL b-c (Ex 9.4) | I1 = 3.690∠−90°. **Ib = 6.391 pu = 26.74 kA**, Ic = −Ib | 6.3913 pu, 26.739 kA |
| DLG b-c-g (Ex 9.5) | I1 = −j4.5464, I2 = +j2.8730, I0 = +j1.6734. **Ib = 6.8983∠158.66°, Ic = 6.8983∠21.34° pu = 28.86 kA**. **In = 3I0 = j5.0202 pu = 21.00 kA**. Branch split: line I1 = −j1.3882, motor I1 = −j3.1582, line I2 = j0.8808, motor I2 = j1.9922. Motor phase b = 20.91 kA, line phase b = 0.8289 kA (line base 0.41837 kA). | 6.8983 pu ∠158.66°, 28.860 kA, In 21.004 kA |

### GT-4 — CT18 §4.3: SLG in a resistance-earthed MV network including cable capacitance  [SC-02 p.24–25]
Inputs: 5,500 V, 50 Hz, Rn = 100 Ω, C0 = 1 µF (per-phase capacitance to earth of the whole network), ω = 314. Bolted fault, with Z1 = Z2 = Z0T = Z0L = 0. Model: Z0 = 3Rn ‖ 1/(jωC0), I = 3E/(Z1+Z2+Z0+3ZF).
Expected: E = 3175 V. **If ≈ (32 + j3) A**: resistive part E/Rn = 31.75 A, capacitive part 3·C0·ω·E = 2.99 A. Healthy phases: V2 = −3175·(1.5 + j√3/2) V and V3 = −3175·(−1.5 + j√3/2) V, i.e. magnitude 5,500 V (phase-to-phase). Recomputed: 31.754 + j2.991 A.
This is the only published case found with a neutral earthing resistor and a numeric result. It neglects the transformer and line impedances, so it does **not** cover "SLG through a Dyn11 transformer with NER" (see Open questions).

### GT-5 — CT18 §4.1: all fault types from given sequence impedances at 36 kV  [SC-02 p.19]
Inputs: U = 36 kV (c = 1). Zd = j1.22, Zi = j1.17, Zo = j1.04 Ω. These come from a generator (Xd'' 35%, X2 25%, 2,500 MVA base as printed) plus a transformer 8%, 100 MVA, all referred to 36 kV.
Expected (published): 3-ph **17 kA**, SLG **18 kA**, LL **15 kA**, DLG **17.6 kA** (|Zo − a·Zi| = 1.915, denominator 3.91). Breaking capacity 18·36·√3 = 1122 MVA.
Recomputed: 17.04 / 18.18 / 15.06 / 17.62 kA. The SLG line prints "1.22 + 1.17 + 1.0", a typo for 1.04.

### GT-6 (secondary, large) — IEC TR 60909-4 test network as encoded in pandapower  [SC-06]
380/110/30/10 kV network with 2 network feeders (I''kQ 38 kA @ 380 kV and 16 kA @ 110 kV, R/X 0.1), 2 power-station units, 3-winding transformers, lines L1–L6 (R, X, R0, X0 per km given in code), a 10 kV cable and motors. The full parameter set is in the test file. Asserted 3-ph max I''k (kA) at buses 1–10: 40.6447, 31.7831, 19.6730, 16.2277, 33.1894, 37.5629, 25.5895, 13.5778, 52.4438, 80.5720. Asserted 2-ph: 35.1994, 27.5249, … (see file).
Status: **secondary**. These values were not verified against the TR. Use only as a later regression check (needs generators, PSU correction KS, 3-winding transformers, all beyond MV-game scope).

## Implications for the engine

1. **Method:** implement IEC 60909-0 style *equivalent voltage source at the fault* with sequence networks (Z1, Z2 = Z1, Z0) and complex impedances.
   - Faults far from generators: I''k = Ib = Ik. This is valid for a distribution game fed from a grid infeed (N-09).
   - Fault types: 3-ph, LL, SLG and DLG with fault impedance ZF, using the formulas F-01…F-04. Return sequence and phase currents and phase voltages, so FPIs and relays can read residual current 3I0 and residual voltage.
2. **Parameters:** cmax = 1.10 and cmin = 1.00 for MV (N-03). Network feeder from S''kQ and R/X (N-05). KT for distribution transformers on the max case only, pending confirmation (N-06/N-07). Line and cable R at 20 °C for max; temperature-corrected for min (N-13). κ from 1.02 + 0.98·e^(−3R/X) for ip (N-08). Use method C only if meshed (rings closed).
3. **Earthing modes as a network parameter:** solid, resistance (Rn → 3Rn in Z0), reactance, Petersen (L tuned to 3·C0) and isolated. Include each feeder's **shunt zero-sequence capacitance** (C0 per km): without it, isolated and compensated earth-fault currents and FPI false trips (P-04) cannot be modelled. GT-4 validates this.
4. **Transformer Dyn11:** zero-sequence open on the Δ side. On the yn side, Z0 = ZT + 3Zn to earth (Z-01, Z-04, Z-05). Phase-shift handling only matters for currents seen upstream (Z-09). It can be postponed if the game shows only MV-side quantities.
5. **Simplifications acceptable for the game:** neglect load current and shunt elements except C0 (assumptions in SC-04 §9.1). No near-generator decay (µ, λ). No motors initially. Ith deferred (formula NOT FOUND).
6. **Golden tests to implement first:** GT-3 (pure sequence algebra, all four fault types, tight tolerance 1e-3 pu), GT-2 (network reduction with c = 1.1, tolerance 0.5%), GT-1 (R+X impedance method, tolerance 1%), GT-4 (NER + capacitance, tolerance 1%), GT-5 (tolerance 1%; published values rounded to 2–3 significant figures).
7. **FPI model:** threshold on phase current (PtP) and on residual current (PtG), with an optional directional flag, a time-based reset and a voltage-return reset. The trip condition must use the current *through the sensor*, including capacitive current from downstream cable on an external earth fault (P-04). Fault location gameplay: lit FPIs from the source up to the fault (P-03).
8. **Do not hard-code** fault-type percentages or cable fault rates as "facts" until a stronger source is retrieved (F-07, C-04 are snippet-only). Accessory share (C-02) and cause split (C-01) are verified from SC-12.

## Open questions

1. LV cmin for +10% tolerance: 0.95 (SC-05, SC-07) or 0.90 (SC-08)? Which IEC 60909-0 edition (2016 or a 2026 revision?) applies? Low impact for an MV game.
2. Is KT applied only for maximum short-circuit currents? Need a primary text.
3. Published worked example of **SLG on the MV side of a Dyn11 transformer with NER**, with transformer and cable impedances: not found. Candidates: NPAG ch. A3 (access denied), Kersting, Grainger & Stevenson. Ahmad may have a utility or SEC study.
4. MV cable zero-sequence impedance (screen return, bonding, earth return) and typical C0 per km for Saudi 13.8 kV / 33 kV XLPE cables: need cable datasheets.
5. SEC distribution neutral earthing practice (13.8 kV / 33 kV; solid vs resistance; NER rating/current): ask Ahmad.
6. FPI settings used with SEC RMUs (PtG/PtP thresholds, reset timers, directional or not, sensor type): ask Ahmad, or get a vendor manual.
7. Source for "SLG cable faults evolve to multi-phase", and fault-type shares specifically for underground cable networks: NOT FOUND.
8. Cable fault location methods beyond TDR (arc reflection, surge/thumper, bridge): not retrieved. Search budget exhausted; follow-up needed.
9. IEC TR 60909-4 published results: confirm the values encoded in pandapower (GT-6) against the TR, if a copy is available.
