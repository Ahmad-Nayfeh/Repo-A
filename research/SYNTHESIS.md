# SYNTHESIS — what research says, and what it means for the game

_Status: draft v1 (after research round 1; round 2 gap-filling in progress — see §7)._
_Every claim cites topic-note IDs; the notes cite the primary sources. ID prefixes: KSA- (01), SC-/N-/F-/Z-/E-/P-/C-/A- (02), PR- (03), PF- (04), TH- (05), PQ- (06), OP- (07), GD- (08)._
_Label convention: **[V]** verified by reading the source, **[S]** snippet / secondary only, **[D]** derived by us (arithmetic or inference), **[A]** game assumption (no source; shown as such in-game)._

---

## 1. What the real world of electricity contains (the map)

The research supports a map with five layers. Each later layer depends on the earlier ones, which is also the order in which an engine must be built.

| Layer | Contents (examples) | Key references |
|---|---|---|
| **L1 Network & steady state** | Topology (radial / open ring / tee loop), cables, transformers, switches, loads; power flow, voltage drop, losses, loading | 01 §4, 04 |
| **L2 Faults & abnormal states** | Short circuits (3ph, LL, SLG, DLG) with fault impedance; earthing methods change everything about earth faults; high-impedance faults; open conductors; overload; ferroresonance; surges; sags/swells; harmonics; frequency deviation; loss of PEN at LV | 02, 06 |
| **L3 Protection & detection** | IDMT/DT relays (IEC 60255-151, IEEE C37.112), fuses, fuse-switch combinations, reclosers, FPIs (IEC 62689), CT behaviour, RCDs/MCBs at LV; coordination (CTI), maloperation causes | 03, 02 §4, 06 §9 |
| **L4 Operation & safety** | Control-room fault response, FPI-guided sectionalising, backfeed from the normally open point, switching schedules, safety documents and the five safety rules, interlocks, re-energisation delays, crews, SCADA/FLISR | 07 |
| **L5 Planning, assets & economics** | Load growth, ring loading rules, cable/transformer sizing, thermal ageing (IEC 60076-7), condition monitoring (PD, DGA, thermography), maintenance strategy, losses and owning cost, reliability indices (SAIDI/SAIFI/CML), DER/EV/storage integration, system frequency balancing | 01, 05, 06 §7–8, 07 §5 |

**The Saudi distribution reality is unusually well documented** in public SEC documents (mostly 2004–2008 editions, so dated):
- 60 Hz, normal band 59.9–60.1 Hz [V, KSA-03/04].
- MV standard 13.8 kV and 33 kV; Riyadh grid stations 132/13.8 kV [V for voltages; S for Riyadh station detail].
- **Open single loop between two grid stations is SEC's preferred feeder configuration**, operated radially with a normally open point; feeders loaded to **50 %** (single loop) / **65 %** (tee loop); **≤ 7.5 km** to the open point at 13.8 kV [V, KSA-02, DPS 2004].
- Package unit substations (RMU + transformer + LV board) 500/1000/1500 kVA, 13.8/0.4 kV Dyn11; RMU = 2 ring load-break switches + 1 tee-off (fuse-switch or breaker), with earth-fault indicator; 17.5 kV, 21 kA 1 s [V, KSA-02/06/07/08].
- Main cable 3×300 mm² Al XLPE (300 A, R 0.130 Ω/km, X 0.108 Ω/km at 60 Hz) [V, KSA-02].
- MV neutral **solidly or low-resistance earthed** (SEC specs allow both; which one Riyadh uses is **not found**) [V/NOT FOUND, KSA-05/06/09].
- Design ambient 55 °C outdoors; Riyadh July mean max 43.4 °C [V, KSA-01/21].
- Scale: 11.3 M customers, ~697 k distribution transformers (2024) [V, KSA-13]; SEC average interruption duration 190.9 → 111.4 min/customer (2017 → 2020) [V, KSA-15].

## 2. Which parts make good gameplay

Ranked by (a) decision richness, (b) feedback clarity, (c) fidelity we can actually validate, (d) teaching value, (e) replayability. Opinions are labelled as ours.

| Rank | Candidate core loop | Why it works (evidence) | Validated fidelity available? |
|---|---|---|---|
| 1 | **Fault response on an open-ring network** (seed idea): read FPIs, sectionalise by halving, backfeed via NOP, respect re-energisation delays and switchgear duty, score on customer-minutes lost | Real documented procedure with real trade-offs: customer-count halving, delays, duty counts, three-phase vs earth-only FPI trust [V, OP-05/06]; scoring by CML/SAIDI is real regulation [V, OP-01/02/03]; no existing game does it [GD gaps] | Yes: power flow (33-bus golden), SC (5 golden cases), FPI logic (vendor-verified), reliability arithmetic (Ofgem worked example) |
| 2 | **Protection coordination puzzle**: set pickups/TMS/curves so the nearest device trips first with margin, without tripping on inrush/cold load | Exact curve equations [V, PR]; CTI practice [V]; ABB published grading examples as golden tests [V]; open-ended with several valid answers (Zachtronics evidence for open puzzles [V, GD-30]) | Yes (curves exact; ABB examples) |
| 3 | **Heatwave operations / thermal**: Riyadh summer afternoon, AC-driven peak, transformer hot-spot and ageing, load transfer between rings | IEC 60076-7 difference equations reproduced exactly against Annex C (0.1 K) [V, TH]; Saudi load shape and ambient [V/S, KSA] | Yes (transformer); cables partial |
| 4 | **Planning / expansion**: new district load → choose routes, cable sizes, substation sizes, ring structure, within SEC rules (50 % loading, 7.5 km, N-1) | SEC DPS rules give real constraints [V]; scoring by cost + losses + reliability | Yes for steady state; costs need labelled assumptions [A] |
| 5 | **Power-quality detective** cases: sag-type detective, capacitor resonance, ferroresonance, broken PEN | Strong, real, rarely taught phenomena [V/S, PQ]; best as authored cases on the shared engine | Partial (sag propagation & resonance formula yes; ferroresonance only qualitatively — must be scripted, labelled) |
| 6 | **System frequency event** (GB 9 Aug 2019 replay; inertia/UFLS) | Official report numbers [V, PQ-29]; swing equation validated against NREL example [V] | Yes, single-bus aggregate; Saudi UFLS stages not public [NOT FOUND] |
| 7 | **Safety / switching programme authoring**: write a correct isolation & earthing sequence | Five safety rules, permits, interlocks, phasing [V/S, OP]; must show only safe practice | Logic rules only (no physics needed) — good *inside* mode 1 rather than standalone |
| 8 | **Arc-flash "clearing time is the dial"** | Incident energy ∝ arcing time is the key teaching point [S/V, PQ-24]; IEEE 1584-2018 equations are **not** publicly available → only a labelled proxy | Proxy only — use as an explanatory screen, not a scored mode |
| 9 | Maintenance / asset management (thermography, DGA, health index) | Mechanisms verified; numeric thresholds mostly NOT FOUND in round 1 (round 2 pending) | Weak until round 2 closes gaps |

**Our recommendation (opinion):** modes 1–4 form the core; 5–6 are authored "case files" on the same engine; 7 and 8 are embedded teaching moments; 9 waits for data.

## 3. What fidelity is achievable in a browser, and how to validate it

| Phenomenon | Achievable method | Validation (golden test) | Source |
|---|---|---|---|
| Steady-state power flow | Balanced positive-sequence backward/forward sweep on radial topology (open-ring is radial in operation); per-phase data model ready for later 3-phase | Baran & Wu 33-bus: 202.677 kW, Vmin 0.91309 pu @ bus 18 (three solvers agree) [V, PF-C1]; 69-bus secondary | 04 |
| Short circuit | IEC 60909-style equivalent voltage source, sequence networks, c = 1.10/1.00 (MV), κ formula; earthing method as network parameter with cable C0 | Glover Ex. 9.2–9.5 (all 4 fault types); Schneider CT158 §2.4, §3.5; CT18 §4.1, §4.3 (NER + capacitance) [V, 02] | 02 |
| Protection timing | Generic IDMT element `t = TMS·(k/(M^α−1)+c)` with IEC & IEEE constants; travel-integral for varying current; DT stages; fuses as tabulated curves | Curve-point checks (IEC SI 10.03 s at 2×, 2.97 s at 10×) [D from V constants]; ABB grading examples [V] | 03 |
| FPIs | Threshold on phase and residual current through the sensor, including downstream cable capacitive current on external earth faults; reset rules | Vendor logic [V vendor, SC-11]; behavioural tests | 02 §4 |
| Transformer thermal & ageing | IEC 60076-7 difference equations, ONAN distribution parameters, kiosk correction, ageing V | Annex C (0.1 K, 6.15 days loss of life), Annex E (114.2 °C) [V, TH-02] | 05 |
| Cable thermal | Steady ampacity × derating factors; adiabatic I²t = k²S² check (k_Cu 143, k_Al 94) | Catalogue short-circuit values [V]; derating tables (non-employer source needed, D-004) | 05 |
| Reliability metrics | Event log → CI, CML (3 min, Ofgem) and SAIFI/SAIDI/CAIDI/MAIFI (5 min, IEEE) with configurable threshold | Ofgem 34-min sequence example [V, OP-02]; DOE FLISR arithmetic [V, OP-04] | 07 |
| Frequency | Single-bus swing equation + governor ramp + DER RoCoF trips + UFLS table | NREL worked example (0.26 Hz/s) [V, PQ-34]; GB 2019 timeline [V, PQ-29] | 06 |
| Harmonic resonance | Per-order impedance with capacitor; hr ≈ √(Ssc/Qc) | Formula check [S/V, PQ-12] | 06 |
| Arc flash | **Not** IEEE 1584 (equations not public) → proxy E ∝ t, labelled | none (explanatory only) | 06 |
| Ferroresonance | Not simulated (needs EMT). Scripted case with honest label | n/a | 06 |

**Determinism (shareable seeds):** ECMAScript specifies `+ − × ÷` and `Math.sqrt` exactly (IEEE-754 binary64, round-to-nearest-even); `Math.exp/sin/pow/**` are implementation-approximated [V, PF-27/28]. Therefore the state-affecting core must use only exact operations, or our own deterministic implementations of `exp`/`log` (e.g., fixed polynomial/series in exact ops). Seeded PRNG: sfc32 seeded via SplitMix32 [V, PF].

**Performance:** BFS on 513 buses ≈ 0.04 ms in Node [D, own benchmark]. Physics will not be the browser bottleneck; rendering and UX will.

**Data licensing:** IEEE test-feeder files and MATPOWER case files are **not** openly licensed [V, PF-01/09]. Golden tests will store only published *results* with citations, and our own original networks will be cross-checked offline against pandapower (BSD-3). This is decision D-005 (to be logged).

## 4. Gaps no existing game fills

From the survey of ~20 titles [GD §1]:
1. **Distribution-level realism**: no game found models radial feeders, normally-open points, sectionalising, FPIs, fuse/relay coordination, cold-load pickup or voltage drop as gameplay. Existing titles are transmission balancing (NESO, Statnett BALANCE, STABILITY), city-builder abstraction (Power to the People), or house wiring (Electrician Simulator).
2. **Protection and power quality as puzzles**: none found.
3. **Arabic / bilingual technical game**: none found.
4. **Replayability**: the closest commercial titles are criticised for weak replay value [V, GD-09/10].
5. **Free, static, no account, mobile-capable**: NESO's game is not optimised for phones [V, GD-01]; strong titles are paid.
6. **Credibility with engineers**: technical players punish wrong physics/terminology [S, GD-11]; no competitor publishes validation. **Published validation is the moat.**

## 5. Retention design that research supports (and that works without a server)

- Daily seeded puzzle from the UTC date + spoiler-free share string (Spelunky daily, Wordle) [V/S, GD-33/35/38].
- Several scored metrics and a developer-computed "par" frontier shipped with each puzzle instead of server histograms (Zachtronics rationale on leaderboards and cheating) [V, GD-30].
- Scenario/level sharing encoded in the URL (PuzzleScript precedent) [S, GD-39]; sandbox/editor (Opus Magnum, Nicky Case) [V].
- Procedural generation of networks and faults from seeds, all players getting identical randomness (fixes the fairness complaint about random events) [V, GD-09].
- Learning science: support inside the game (d≈.34, larger for skills) and multiple short sessions [S, GD-40/41]; start simple, unlock complexity (PhET evidence) [V, GD-44]; worked examples for novices, fading with expertise [S, GD-46]; explain after failure.

## 6. Arabic / RTL

- Mirror UI chrome; do **not** mirror single-line diagrams, phasors, TCC log-log plots or waveforms (Apple & Material v1 rules on real-world objects and charts) [V, GD-60/61]; time axes have no Arabic standard [V, GD-64] → keep diagrams LTR (opinion, revisit).
- Digits: `ar-SA` defaults to Eastern Arabic digits in ICU, but government/technical sites commonly use Western digits [V/S]; force `nu-latn` by default with a toggle (decision to log).
- Fonts with OFL licences verified: Noto Sans Arabic, IBM Plex Sans Arabic, Cairo, Tajawal [V, GD-70].
- Terminology: KSGAAL/Ministry of Energy dictionary exists (>1,500 terms) [V, GD-71]; build an in-game bilingual glossary with sources.

## 7. Uncertainties and how the game will handle them

| Unknown | Handling |
|---|---|
| Riyadh MV neutral earthing (solid vs NER, current limit) | Scenario parameter; default low-resistance earthed with a stated assumed NER current; Model notes say actual SEC practice not confirmed |
| SEC FPI thresholds / types | Use vendor-range values [V vendor]; labelled |
| Crew travel/operate times at night in Riyadh | **[A]** labelled game parameters (no public data found [OP §4]) |
| SEC reliability definitions (3 vs 5 min threshold) | Show both IEEE and Ofgem conventions; configurable |
| SEC UFLS stages | Use GB stages as reference, labelled; Saudi values NOT FOUND (round 2 pending) |
| IEEE 1584 arc-flash equations | Proxy only, labelled |
| Fault rates per km, fault-type shares | Snippet-only → used as labelled scenario-generation weights, not displayed as facts |
| Most SEC documents are 2004–2008 editions | Model notes state the edition year of each rule |
| UK practice (SSEN) used for operational procedure | Model notes say: procedure is documented UK DNO practice; SEC equivalents not public |
| Harmonic limit at 13.8 kV (2007 Grid Code 1.5 % vs DPS ~4 %) | Round 2 checking; not used until resolved |

**Round 2 (in progress):** KSA grid code 2021 + harmonic limits + earthing + reliability; SC/protection gaps (Dyn11+NER example, cable zero-sequence, coordination example, FPI thresholds, fuse tables); assets (thermography, DGA, failure rates, non-employer cable derating, SF6).

## 8. Scope recommendation (input to Phase 2/3)

1. **Engine v1:** network model, balanced BFS power flow, sequence-network short circuit with earthing & C0, IDMT/DT/fuse protection with travel integral, FPIs, transformer thermal (IEC 60076-7), reliability event log, deterministic PRNG & procedural network generator. Each with golden tests.
2. **Mode 1 (flagship, fully polished):** "Night Shift" — fault response on procedurally generated Riyadh-style open rings, daily seed, share string, bilingual.
3. **Next modes on the same engine:** Protection coordination ("Grading"), Heatwave (thermal operations), Planning (expansion). Then case files (PQ, frequency).
4. **Not in v1:** 3-phase unbalanced solver, EMT phenomena, IEEE 1584 calculator, accounts/servers.
