# FIDELITY CONTRACT

_Status: v3 (after release review `docs/qc/REVIEW-release1-physics-safety.md`). Owner: Physics & Domain Accuracy._
_Every simplification has an ID `S-Fx-nn`; the in-game Model notes (`src/ui/notes.ts`) carry the same IDs, and `scripts/check_sources.mjs` checks coverage both ways in CI._
_Labels: **[V]** verified primary · **[Vsec]** faithful secondary · **[D]** derived by us · **[A]** assumption (shown in-game)._
_Validation lines say **implemented** (test file named) or **planned**._

## F1. Power flow
- **Method:** balanced positive-sequence current-injection fixed point on the bus admittance matrix per energised island (dense complex LU, `src/engine/powerflow.ts`). Constant-power loads.
- **Simplifications:** S-F1-01 balanced (no phase unbalance); S-F1-02 fixed source voltage, no OLTC, cable charging neglected in power flow; S-F1-03 loads constant-power in steady state (no ZIP mix in v1).
- **Validation (implemented):** 33-bus MATPOWER variant, losses 202.677 kW ±0.1 %, Vmin 0.91309 pu @ bus 18 ±1e-4 (`tests/golden/powerflow-33bus.test.ts`); power-balance and voltage-monotonicity properties on 210 generated networks (`tests/property/physics.test.ts`). **Planned:** 69-bus case.

## F2. Short circuit
- **Method:** IEC 60909 equivalent voltage source c·Un/√3 (c = 1.10 max, 1.00 otherwise), sequence networks with Z2 = Z1; Dyn11 distribution transformers omitted for MV faults (zero sequence blocked, no source behind); earthing solid / resistance (3Rn in Z0) / isolated; cable C0 (π, zero sequence); lumped rest-of-busbar C0; κ = 1.02 + 0.98·e^(−3R/X) for ip (`src/engine/shortcircuit.ts`).
- **Simplifications:** S-F2-01 loads and motors neglected, far from generators, no DC-offset evolution, no Petersen-coil earthing; S-F2-02 screen-return Z0 with screen resistance borrowed from a comparable cable [A]; S-F2-03 fault resistance seeded 0–3 Ω (insulation) / 0–0.5 Ω (excavation) [A]; S-F2-04 fault-type mix (SLG/DLG/LL/3PH by cause) is an assumption — UG-cable shares not found [A]; S-F2-05 rest-of-busbar capacitance = 10 feeders × 6 km × 273 nF/km [A]; S-F2-06 grid-station source S″k 450 MVA [D], R/X 0.07 [A], Z0/Z1 = 1 [A].
- **Validation (implemented, `tests/golden/shortcircuit.test.ts`):** Glover 9.2–9.5 ±0.05 %; CT18 §4.1 ±1.5 % (rounded source); CT158 §2.4 ±1 %; CT18 §4.3 NER + C0 ±1 %; NER example R2-A ±0.5 %. Properties (`tests/property/physics.test.ts`): non-increasing with fault resistance; ≤ c_max bolted value of the same type; I_SLG ≤ I_3PH where |Z0| ≥ |Z1|; generated networks below the 21 kA rating. **Planned:** CT158 §3.5 network case.

## F3. Protection and detection
- **Method:** feeder-breaker phase and earth IDMT/DT elements, `t = TMS·(k/(M^α − 1) + c)`, IEC 60255-151 and IEEE C37.112 constants, cap at 20×, travel integral across reschedules, instantaneous reset; breaker opening 60 ms [A] (`src/engine/protection.ts`, `sim.ts`). FPIs flag when the current through the sensor (phase for three-phase types, residual 3I₀ for all) exceeds pickup; latch; reset on voltage return.
- **Simplifications:** S-F3-01 ideal relays (no tolerance), instantaneous reset, 60 ms breaker [A]; S-F3-02 tee-off fuses are not simulated (no sourced time–current curves) and transformer faults are excluded; S-F3-03 FPI thresholds phase 400 A / earth 60 A [A within vendor ranges], reset on voltage return only (no timer, no minimum-duration logic), stale FPIs possible on Hard [A]; S-F3-04 feeder relay settings (IEC SI, phase 400 A TMS 0.1, earth 150 A TMS 0.1) are assumptions chosen above full-ring backfeed current; S-F3-05 earth-only FPIs cannot see faults without residual current and are never trusted for negative indication [OP-05 §11.3]; S-F3-07 Grading mode: 40 ms minimum relay operating time and TMS 0.05–1.0 [A], minimum fault = LL at c = 1.0, LV faults 3PH through the transformer, phase elements only; S-F3-06 FPI sensing current omits the half-shunt of its own cable end (small at < 3 A/km) [D].
- **Validation (implemented):** 35 curve points, ABB grading (1.00 s at 4×, TMS 0.201), Chakrabarti ±6 % (`tests/golden/protection.test.ts`); operate time non-increasing with current (property); FPI indication pattern on 30 generated faults (`tests/property/physics.test.ts`). **Planned:** NPAG-derived 11 kV grading example; IEEE reset model.

## F4. Thermal
- **v1:** cable steady rating 300 A (35 °C ground) / 278 A (40 °C) [V/D]; conductor adiabatic check I²t ≤ (k·S)², k = 94 for Al XLPE [D from IEC 60949 constants]; screen 1-s rating 7.0 kA [A borrowed]; switchgear 21 kA 1 s rating check (`sim.ts`).
- **Simplifications:** S-F4-01 steady rating only, no thermal time constants (not found), overload reported as minutes above rating; S-F4-02 borrowed screen rating; S-F4-03 switchgear ambient derating not modelled (no generic source above 40 °C).
- **Planned (Heatwave mode):** IEC 60076-7:2005 transformer model with SEC 51-SDMS-04 parameters; IEC 60076-7:2018 not read (S-F9-01).

## F5. Loads
- **Method:** per-substation peak load scaled to the difficulty's half-ring loading target; summer daily shape with the sourced peak window; winter factor; cold-load pickup multiplier on loads restored after ≥ 20 min.
- **Simplifications:** S-F5-01 customers per substation, transformer loading, daily shape between sourced peak hours, winter factor and cold-load pickup ×1.5 decaying over 30 min are assumptions.
- **Validation (implemented):** generated networks inside the 13.1–14.5 kV band and within loading targets (`tests/property/nightshift.test.ts`).

## F6. Operations and safety
- **Rules:** SSEN practice [OP-05/06]: halve by customers, reclose from the source, backfeed via the NOP, re-energisation delays (5 min 22:00–06:00, 20 min otherwise) as a parameterised UK example rule-set; auto-reclose off on cable feeders; crews must be clear of the circuit's substations; damage reports block re-energising the section until the site is attended; interlocks per panel only; secure (lock & tag) → **test for absence of voltage** → earth → permit → repair; no paralleling of grid stations.
- **Trial closes** onto sections not proven healthy are allowed only from the source breaker or a remote-controlled switch, through the checklist. Proof of health comes from FPI evidence (positive from any FPI, negative only from three-phase FPIs), from successful energisation, from trial-close trips that confine the fault, or from an attended damage site.
- **Simplifications:** S-F6-01 operating rules are UK DNO practice, not SEC (not public); S-F6-02 interlocks per panel, remote end protected by procedure (permit block); S-F6-03 crew dispatch 10 min, 40/25 km/h night/day × 1.4 road factor, manual operation 5 min, voltage test 3 min, repair 4–8 h [A]; S-F6-04 no paralleling (break-before-make) [A], duty counts CB 10 trips / LBS 2 fault makes [A]; S-F6-05 not modelled: fault-level reduction before reclosing, multiple permits per section, any live work; S-F6-06 the checklist is a single confirmation, with every condition verified by the engine; S-F6-07 trial-close trips confine the fault under a single-fault assumption, and an attended damage site is taken as the fault location; S-F6-08 backfeed is checked against cable rating and the 13.1–14.5 kV service band (DPS 1.5 % MV allocation shown as a planning reference only).
- **Validation (implemented):** reference bot completes 120/120 generated shifts with no star-removing event; replay determinism (`tests/property/nightshift.test.ts`); e2e checklist flow (`tests/e2e/app.spec.ts`).

## F7. Reliability metrics
- **Method:** interruption log per customer group; Ofgem (≥ 3 min; restorations < 3 min ignored) and IEEE 1366 (> 5 min) conventions.
- **Simplifications:** S-F7-01 both conventions computed from the same log; scenario-level CML only (no system SAIDI display in v1).
- **Validation (implemented):** Ofgem 34-min example; 63,000 customer-min staged example; 3/5-min threshold edge (`tests/golden/reliability.test.ts`).

## F8. Saudi network parameters
See `src/data/params.ts` (each value with label and source IDs, shown in the in-game Model notes table). Key items: 60 Hz [V]; 13.8 kV, 13.1–14.5 kV band [V]; open loop between grid stations, ≤ 50 % loading, indicative ≤ 7.5 km [V]; 3×300 Al XLPE (R_DC20 0.100, R 0.130, X 0.108 Ω/km) [V table, D interpretation]; package substations 500/1000/1500 kVA Dyn11, Z 5/6 %, SEC max losses [V T12-01].
- **Simplifications:** S-F8-01 MV earthing default low-resistance 1000 A [A] (SEC allows solid or resistance; Riyadh practice not public).

## F9. Not in v1
S-F9-01: transformer thermal ageing (Heatwave mode; IEC 60076-7:2018 not read), IEEE reset, CT saturation, transients and ferroresonance, arc-flash energy, arcing-fault physics, generator dynamics, three-phase unbalance and LV networks, real Riyadh geography (layout is schematic).
