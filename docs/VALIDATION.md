# VALIDATION — engine results vs published references

_Generated from test output on 2026-11-13 (engine version 1). Re-run with `npx vitest run` (61 tests) and `npx playwright test` (5 e2e). Every row is a passing automated test unless marked otherwise._

Label key: **published** = value printed in the source; **our-3-solver** = agreement of three independent solvers (ours, numpy, pandapower) on the same data (research/04 PF-C1).

## 1. Power flow (`tests/golden/powerflow-33bus.test.ts`)

| Case | Source | Reference | Engine | Tolerance | Result |
|---|---|---|---|---|---|
| Baran & Wu 33-bus, total losses | MATPOWER `case33bw` data (fetched at test time, D-005); literature 202.67–202.68 kW [S]; our-3-solver 202.677 kW [D] | 202.677 kW | 202.6771 kW | ±0.1 % | pass |
| same, minimum voltage | as above | 0.913090 pu @ bus 18 | 0.913090 pu @ B18 | ±1e-4 pu, same bus | pass |
| same, power balance | property | P_source = ΣP_load + losses | |error| < 1e-9 MW | 1e-9 | pass |

Note: the 1989 paper itself was not read; its printed solution is reported to be inconsistent with its data [PF-10]. The golden value belongs to the MATPOWER data variant.

## 2. Short circuit (`tests/golden/shortcircuit.test.ts`)

| Case | Source | Published | Engine | Tolerance | Result |
|---|---|---|---|---|---|
| GT-3 3-phase, Glover/Sarma/Overbye 5e Ex 9.2 | [SC-04] | 7.558 pu | 7.5578 pu | ±0.05 % | pass |
| GT-3 SLG Ex 9.3, Ia | [SC-04] | 5.8928 pu (24.65 kA) | 5.8928 pu | ±0.05 % | pass |
| GT-3 SLG healthy-phase voltages | [SC-04] | 1.179 pu | 1.179 pu | ±0.1 % | pass |
| GT-3 LL Ex 9.4, Ib | [SC-04] | 6.391 pu (26.74 kA) | 6.3913 pu | ±0.05 % | pass |
| GT-3 DLG Ex 9.5, Ib / In | [SC-04] | 6.8983 / 5.0202 pu | 6.8983 / 5.0204 pu | ±0.05 % | pass |
| GT-5 Schneider CT18 §4.1 (36 kV): 3PH / SLG / LL / DLG | [SC-02] | 17 / 18 / 15 / 17.6 kA (rounded) | 17.04 / 18.18 / 15.06 / 17.62 kA | ±1.5 % | pass |
| GT-1 Schneider CT158 §2.4 (20 kV, 500 MVA + 2 km line), I''k | [SC-01] | 6,415 A (published; 6,378 A recomputed without rounding) | 6,373 A | ±1 % of published | pass (0.65 %) |
| GT-1 peak current ip | [SC-01] | 10,887 A | 10,861 A | ±1 % | pass |
| GT-4 Schneider CT18 §4.3: SLG with 100 Ω NER + 1 µF network capacitance (5.5 kV) | [SC-02] | 31.75 + j2.99 A (|I| 31.89 A) | 31.895 A | ±1 % | pass |
| GT-4 healthy phases rise to line voltage | [SC-02] | 5,500 V | 5,500 V | ±1 % | pass |
| GT-R2-A Dyn 33/11 kV, 10 %, solid SLG | blog example [S2-07] (low authority, recomputed) | 10,497 A | 10,497.3 A | ±0.5 % | pass |
| GT-R2-A same with 15.9 Ω NER | [S2-07] | 399.1 A | 399.1 A | ±0.5 % | pass |

Not yet a golden test: CT158 §3.5 (30 kV network with transformer zero-sequence topology), IEC TR 60909-4 network (needs generators and 3-winding transformers — out of v1 scope).

## 3. Protection (`tests/golden/protection.test.ts`)

| Case | Source | Reference | Engine | Tolerance | Result |
|---|---|---|---|---|---|
| IEC SI/VI/EI/LTI and IEEE MI/VI/EI at M = 1.5, 2, 5, 10, 20 (35 points) | constants verified in 4 docs [PR-01,02,05,07]; table values derived [D] | e.g. SI 10.029 s @ 2×, 2.971 s @ 10× | 10.029 s, 2.971 s | max(0.1 %, ±0.0005 s table rounding) | pass |
| ABB DA Handbook IDMT grading: NI relay at 4.0×, TMS 0.201 | [PR-07] | 1.00 s | 1.0009 s | ±0.5 % | pass |
| ABB: relay-2 TMS 0.172 at 2.4× gives ≥ 1.36 s (1.0 s + 0.36 s margin) | [PR-07] | ≥ 1.355 s | pass | — | pass |
| Chakrabarti Ex 3.7.1 / 3.7.2 / 3.7.4 (graph-read) | [PR-24] | 1.575 / 0.945 / 0.56 s | 1.648 / 0.989 / 0.594 s | ±6 % (book reads a printed curve) | pass |
| Travel integral: constant current operates at t(M); half-travel leaves t/2 | property | — | exact to 1e-12 | — | pass |

## 3b. Transformer thermal (`tests/golden/thermal.test.ts`) — engine ready for the Heatwave mode

| Case | Source | Published | Engine | Tolerance | Result |
|---|---|---|---|---|---|
| IEC 60076-7:2005 Annex C, 41-step difference equations, hot-spot every step | [TH-02] | 90.5 … 176.1 (peak) … 99.3 °C | worst error 0.050 K | ±0.15 K | pass |
| Annex C cumulative loss of life (thermally upgraded paper) | [TH-02] | 8,851 min (6.15 days) | 8,851 min | ±1 % | pass |
| Annex E OF unit, 30-min overload 0.8 → 1.4 (exponential method) | [TH-02] | θo 76.7 °C, θh 114.2 °C | 76.68 / 114.22 °C | ±0.1 K | pass |
| Annex E after the overload and daily loss of life | [TH-02] | θh 92.9 °C one minute later; 0.14 day | not reproduced by design: 0.150 day | — | **documented difference**: the 2005 decreasing-step formula (eq. 8) applies the new gradient instantly; our model keeps Annex C winding dynamics |
| Ageing points: V(110 °C, Kraft) = 4, V(98 °C) = 1, TUP V(110 °C) = 1 | [TH-02] | 4 / 1 / 1 | exact | 1e-10 | pass |
| SEC 51-SDMS-04 emergency table (one-sided): from 75 % load, 133 % for 240/155 min and 150 % for 98/65 min at 30/40 °C keep θh ≤ 140 °C | [T12-d] | requirement | θh 116.4–120.8 °C for 500/1000/1500 kVA with SEC parameters (Δθor 45 K, Δθhr 18 K [D]) | ≤ 140 °C | pass |

## 4. Reliability metrics (`tests/golden/reliability.test.ts`)

| Case | Source | Reference | Engine | Result |
|---|---|---|---|---|
| Ofgem interruption sequence: 2 off, 2 on, 30 off ⇒ 34 min | [OP-02 §2.27] | 34 | 34 | pass |
| Staged night restoration 300×40 + 200×75 + 100×360 | constructed; formulas [OP-01,03] | 63,000 customer-min, CAIDI 105 | 63,000, 105 | pass |
| Threshold edge: 4-min interruption | [OP-01] vs [OP-03] | Ofgem 1,200; IEEE 0 | 1,200; 0 | pass |

## 5. Deterministic math and RNG (`tests/unit`)

| Check | Result |
|---|---|
| dmath.exp vs Math.exp on [−700, 700] (40,002 points) | max relative error < 4e-16 |
| dmath.log on 80,000 points incl. subnormal-range and near 1 | max error < 4e-16 |
| dmath.pow at relay/thermal exponents (0.02, 0.8, 1.6, 1, 2) | < 1e-15 relative |
| Complex LU on a random 30×30 system | solution error < 1e-12 |
| sfc32 RNG | reproducible; known-answer snapshot; uniformity |

## 6. Gates on generated scenarios (`tests/property/nightshift.test.ts`)

| Gate | Result |
|---|---|
| Reference bot finishes 40/40 seeds per difficulty (easy, normal, hard) with no star-removing event | pass (120/120) |
| Replay determinism: same seed + recorded actions ⇒ identical state hash | pass |
| Pre-fault networks (60 seeds): power flow converges; every MV bus within the 13.1–14.5 kV service band [KSA-02/04]; cable loading within difficulty target (+5 % generator tolerance) | pass |

## 6b. Physics properties (`tests/property/physics.test.ts`, added after release review P-03)

| Property | Cases | Result |
|---|---|---|
| Power balance: P_source = ΣP_load + losses (1e-5 MW) | 210 generated networks, random load levels | pass |
| Voltage non-increasing from each grid station to the NOP | 210 networks | pass |
| Fault current non-increasing with fault resistance (SLG, 3PH) | 210 random cable positions × 5 Rf | pass |
| Every fault current ≤ c_max bolted value of the same type; I_SLG ≤ I_3PH where |Z0| ≥ |Z1|; below 21 kA rating | 210 × 4 fault types | pass |
| Relay operate time non-increasing with current, all 7 curves | sweep 1.01×–40× | pass |
| **FPI indication logic**: only indicators on the source→fault path flag; none flag off-path (incl. cable charging); earth-only types dark on symmetrical faults | 30 generated faults | pass |

## 7. Browser (`tests/e2e/app.spec.ts`, Playwright)

| Check | Local (Chromium) | CI (Chromium, Firefox, WebKit) — all 15 passed in run 43453723047 |
|---|---|---|
| Home EN/AR renders, correct `dir`, no console errors, axe: 0 serious/critical | pass | runs on every push |
| Game screen: relay record visible, axe 0 critical, checklist dialog on re-close of the tripped breaker | pass | " |
| **Cross-engine determinism**: bot-run state hash in the browser equals Node's (easy/normal/hard) | pass (V8) | **pass on Chromium 153, Firefox 155 (SpiderMonkey), WebKit 26.6 (JavaScriptCore)** — CI run 43453723047: "15 passed" (5 tests × 3 engines) |
| Full shift to the shift report with stars and share text | pass | " |

## 8. Not validated (stated openly)

- Saudi-specific numbers that are assumptions (crew times, customers per substation, cold-load pickup, NER current, FPI thresholds, switchgear duty counts) — no public data; labelled `assumption` in the in-game Model notes.
- Phase-unbalanced behaviour, transients, transformer thermal ageing — not modelled in v1 (FIDELITY F9).
- The reference bot ("par") is a documented heuristic, not an optimum; the "informed reference" is not a strict lower bound (it shares the backfeed heuristic).
