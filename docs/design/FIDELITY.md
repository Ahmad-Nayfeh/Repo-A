# FIDELITY CONTRACT

_Status: v1 (Phase 3). Owner: Physics & Domain Accuracy. Every row is mirrored in the in-game "Model notes" page._
_Labels: **[V]** verified source, **[S]** snippet/secondary, **[D]** derived by us, **[A]** game assumption (no public source; shown as such in-game)._

For each phenomenon: **what** is modelled · **method** · **simplified (and why)** · **validation & tolerance**.

---

## F1. Network & power flow (steady state)

- **What:** bus voltages (magnitude/angle), branch currents, loading % of rating, losses, energised/de-energised state of every customer group.
- **Method:** balanced positive-sequence; current-injection fixed-point on the bus admittance matrix (Y-bus, complex dense LU factorised once per topology), ZIP loads (default constant-power for steady state, constant-impedance during cold-start transients is not modelled). Source = grid-station 13.8 kV busbar as a slack with voltage set-point (default 1.0 pu). Works for radial and (briefly) meshed islands.
- **Simplified:** no phase unbalance (SEC MV backbone is three-phase three-wire feeding balanced transformer loads [KSA-05]; single-phase effects only matter at LV [PF §5]); no OLTC dynamics in v1 (fixed source voltage per scenario); no line charging in power flow (13.8 kV cables of a few km: charging current ≈ 2.5 A/km [SP2] ≪ load current — kept in zero-sequence for earth faults, see F2).
- **Validation:** Baran & Wu 33-bus (D-005): losses 202.68 kW ±0.1 %, Vmin 0.91309 pu ±1e-4 at bus 18 [PF-C1/13]; 69-bus losses 224.99 kW ±0.2 % [PF-15]; property tests (power balance 1e-6 pu; same seed → identical hash).

## F2. Short circuit

- **What:** for 3-ph, LL, SLG, DLG faults with fault resistance at any bus or cable midpoint: fault current, sequence & phase currents in every branch, phase voltages, residual current 3I0 seen by each CT/FPI.
- **Method:** IEC 60909-0 equivalent voltage source at the fault location, c = 1.10 (max) / 1.00 (min) at MV [N-03]; network feeder impedance from S''kQ and R/X; sequence networks with Z2 = Z1; transformer Dyn11: zero-sequence open on delta side, Z0 = ZT + 3Zn on star side [Z-01..05]; earthing as network parameter (solid, resistance Rn, isolated); cable zero-sequence impedance and shunt capacitance C0 per km (screen-return model R0 ≈ R + 3·R_screen [SP2]); peak current ip = κ·√2·I''k with κ = 1.02 + 0.98·e^(−3R/X) [N-08] (computed with deterministic exp).
- **Simplified:** far-from-generator faults (I''k = Ib = Ik) [N-09]; load currents neglected during fault (standard IEC 60909 assumption); KT transformer correction applied in max case only (uncertainty noted [02 open q.2]); no motor contribution; no DC-offset time evolution (ip only); no arc dynamics; Petersen-coil earthing not offered in v1 (not SEC practice per allowed methods [KSA-05/06]).
- **Validation:** Glover/Sarma/Overbye Ex. 9.2–9.5 (all four fault types, ±0.5 %); Schneider CT158 §2.4 (6,415 A, ±1 %), §3.5 (±0.5 % with c = 1.1); CT18 §4.1 (±1 %), §4.3 NER + capacitance (≈32+j3 A, ±1 %); round-2 NER example 11 kV 15.9 Ω → 399 A (±0.5 %, low-authority source); properties: SLG ≤ 3-ph on solidly-earthed with Z0 ≥ Z1, current monotone in fault resistance.

## F3. Protection & detection

- **What:** phase and earth overcurrent relays (IDMT, definite time, instantaneous) at grid-station feeder breakers and RMU tee-off breakers; fuse-switch combinations for transformer tee-offs; FPIs on RMU ring cables; auto-reclose disabled on cable feeders.
- **Method:** `t = TMS·(k/(M^α − 1) + c)` with IEC 60255-151 constants SI 0.14/0.02, VI 13.5/1, EI 80/2, LTI 120/1 and IEEE C37.112 MI/VI/EI (A, B, p) [PR]; travel integral ∫dt/t(M) for changing current, IEEE reset TR/(M²−1), IEC instant/DT reset; cap at 20× pickup; breaker opening time added (default 60 ms [A]); fuses as tabulated min-melt/total-clear curves from public vendor data (ABB/SIBA) [SP2], with transfer-current logic (striker opens LBS below transfer current) [SP2]; FPI pickup on phase and residual current *through the sensor* including capacitive contribution of downstream cable on external earth faults [P-03/04], latch until reset (timer / voltage return / manual).
- **Simplified:** CT saturation as a flag (delayed operation when I > ALF·In) rather than waveform simulation; no relay pickup/time tolerance in v1 (ideal relay); no 2nd-harmonic inrush restraint modelled — cold-load/inrush only as a scripted pickup-current multiplier [A]; self-powered relay minimum operating current as a parameter [A].
- **Validation:** curve points (IEC SI at 2× = 10.03 s, 10× = 2.97 s; all curves at M = 2,5,10,20 from verified constants, ±0.1 %); ABB grading examples (150 ms DT, 360 ms IDMT margins) [PR]; NPAG-derived 11 kV grading (fault currents 8,759 / 2,201 / 8,301 / 5,248 A, ±1 %) [SP2]; property: operate time non-increasing with current, no trip below pickup.

## F4. Thermal & ageing

- **What:** distribution transformer top-oil and hot-spot temperatures, ageing rate and loss of life; cable loading vs derated ampacity; cable and switchgear short-time (I²t) withstand.
- **Method:** IEC 60076-7 difference equations (C.6–C.11 in 2005 edition, via IS 2026-7) with ONAN distribution parameters x 0.8, y 1.6, R 5, Δθor 55 K, Δθhr 23 K, τo 180 min, τw 4 min, k11 1, k21 1, k22 2 [TH-02]; kiosk ambient correction per Table 6 [TH-02]; ageing V = 2^((θh−98)/6) (Kraft) or the TUP formula [TH-02]; Δt ≤ 2 min sub-stepping. Cable steady ampacity = base × ground-temperature × soil-resistivity × depth × grouping factors from the Saudi Cable Company catalogue [AS2] (base ratings from SEC DPS where available [KSA-02]); adiabatic check I²t ≤ k²S², k_Cu 143, k_Al 94 [TH]; switchgear rated current derated with ambient using a published vendor table [TH] and short-time rating 21 kA 1 s [KSA-07].
- **Simplified:** no cable thermal dynamics (steady rating only — time constants NOT FOUND); no soil dry-out; transformer parameters generic ONAN, not SEC type-test data; solar gain on kiosks not modelled beyond Table 6 correction.
- **Validation:** IEC 60076-7 Annex C 41-step example (±0.15 K, loss of life 6.15 days ±1 %); Annex E (θh 114.2 °C ±0.2 K); steady state at K = 1, θa = 20 °C ⇒ θh = 98 °C, V = 1 (exact); ageing table points (V(110) = 4.0).

## F5. Loads

- **What:** customers and demand per package substation; daily load shape (Riyadh summer/winter); demand factors.
- **Method:** customers per substation from SEC average (~16 customers per distribution transformer nationally [D, KSA-13]) scaled by size; demand factors (residential 0.5, commercial 0.6…) [KSA-02]; summer peak mid-afternoon with AC share ~60 % [KSA-22/37, medium confidence]; annual load factor 0.46 [KSA-02].
- **Simplified:** hourly shape is a smooth parametric curve fitted to the described peak timing, labelled [A] where it goes beyond sources; cold-load pickup after long outages as a decaying multiplier [A] (magnitude not sourced).
- **Validation:** sanity properties (peak hour in 13:00–17:00 summer; daily load factor in plausible band); no published Riyadh 15-min profile found.

## F6. Operations, crews & safety rules

- **What:** remote (SCADA) vs manual switching, crew dispatch & travel, re-energisation delays, staff exclusion, switchgear fault-make duty, earthing of isolated sections, switching log.
- **Method:** event-driven; remote-controlled switches operate in < 1 min [OP-04]; manual operations need a crew on site. Fault-switching rules follow documented UK DNO practice (SSEN): halve by customer count, reclose from original source, backfeed via NOP after capacity check, re-energisation delay 5 min at night / 20 min by day unless FPI/automation evidence [OP-05/06]; auto-reclose disabled on cable feeders [OP-05, SP2].
- **Simplified / assumptions [A]:** crew travel time = route distance / speed (night 40 km/h, day 25 km/h) + dispatch 10 min; manual RMU operation 5 min on site; repair of a cable fault 4–8 h (seeded). **No public Riyadh data was found for any of these** [OP §4]; all shown as assumptions and adjustable.
- **Validation:** rule tests (cannot re-energise before delay without evidence; cannot close onto an earthed section — interlock; cannot operate the faulted section's switches while staff not excluded…).

## F7. Reliability metrics & scoring

- **What:** customer interruptions (CI), customer minutes lost (CML), SAIFI, SAIDI, CAIDI, MAIFI for the scenario and as a contribution to a notional system.
- **Method:** event log of every customer group on/off with timestamps; Ofgem convention (≥ 3 min sustained; restorations < 3 min ignored) and IEEE 1366 convention (> 5 min sustained) selectable; default display uses both [OP-01/02/03].
- **Validation:** Ofgem worked example (2 off, 2 on, 30 off ⇒ 34 min) exact; constructed night-fault example (63,000 customer-min, CAIDI 105 min) exact; DOE FLISR percentage arithmetic exact.

## F8. Saudi network parameters (data, not a model)

| Parameter | Value | Label |
|---|---|---|
| Frequency | 60 Hz; normal 59.9–60.1 Hz | [V] KSA-03/04, K2 |
| MV | 13.8 kV, 3-wire; service band 13.1–14.5 kV | [V] KSA-02/04 |
| Ring | open loop between two grid stations, NOP at an RMU; ≤ 50 % loading; ≤ 7.5 km to NOP | [V] DPS 2004 |
| Grid station | 132/13.8 kV, 3 × 67 MVA | [S] (132/13.8 well attested; 67 MVA snippet) |
| 13.8 kV fault level | equipment 21 kA 1 s; planning cap 20 kA | [V] |
| Cable | 3×300 Al XLPE 300 A; R 0.130, X 0.108 Ω/km (60 Hz) | [V] DPS 2004 |
| Substation | package unit 500/1000/1500 kVA, 13.8/0.4 kV Dyn11, Z per IEC 60076-5 minimum (4 %/5 %/6 %) | [V] KSA-06, PF-36 |
| RMU | 2 × 400 A LBS + 1 tee-off (fuse-switch or CB), EFI, 21 kA 1 s | [V] |
| MV earthing | low-resistance (default, NER limiting earth fault to 1000 A) or solid | earthing types [V]; **1000 A is [A]** (SEC NER value not public; within the 100–2000 A range for resistance earthing [E-03]) |
| FPI thresholds | phase 400 A, earth 60 A defaults within vendor ranges | [V vendor ranges, P-05]; chosen values [A] |
| Ambient | summer air 43 °C mean daily max (July), extreme 50 °C; design 55 °C | [V] |
| Harmonics (for later PQ mode) | 13.8 kV THD 4.0 % | [V] K2 |

## F9. Not modelled in v1 (stated in Model notes)

Three-phase unbalance and LV networks; electromagnetic transients (lightning, switching surges, ferroresonance, current chopping); arcing-fault physics; IEEE 1584 arc-flash energy (equations not public — only a labelled proxy may appear as explanation); protection relay tolerances; CT waveform saturation; OLTC/voltage regulation dynamics; generator dynamics (frequency mode later uses a single-bus swing equation); real geographic Riyadh data.
