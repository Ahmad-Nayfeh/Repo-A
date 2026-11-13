# SYNTHESIS — what research says, and what it means for the game

_Status: v3 — rounds 1 + 2 + independent review (research/REVIEW-phase1.md, 31 findings) resolved; see §9 for the resolution table._
_Every claim cites topic-note IDs; the notes cite the primary sources. ID prefixes: K2- (09), SP2- (10), AS2- (11), KSA- (01), SC-/N-/F-/Z-/E-/P-/C-/A- (02), PR- (03), PF- (04), TH- (05), PQ- (06), OP- (07), GD- (08)._
_Label convention: **[V]** verified by reading the primary source, **[V-sec]** verified in a faithful secondary reproduction (vendor manual, reprint, national copy), **[S]** snippet / secondary only, **[D]** derived by us (arithmetic or inference), **[A]** game assumption (no source; shown as such in-game)._

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
- **Open single loop between two grid stations is SEC's preferred feeder configuration**, operated radially with a normally open point; feeders loaded to **50 %** (single loop) / **65 %** (tee loop); **indicatively ≤ 7.5 km** to the open point at 13.8 kV ("as indication to the planning engineers") [V, KSA-02, DPS 2004 §2.2.3]. DPS also allocates only **1.5 % voltage drop to the MV primary feeder** (Table 1.3), %VD = kVA·km/K with K = 11,282 for 3×300 Al at pf 0.85 (Table 2.2) [V per reviewer, R1-12]; our estimate: a backfed whole ring (≈ 7.2 MVA over ≤ 15 km, uniformly distributed) ≈ 4.8 % [D] — so voltage drop binds under contingency.
- Package unit substations (RMU + transformer + LV board) 500/1000/1500 kVA, 13.8/0.4 kV; transformers **Dyn11, impedance 4/5/6 % (≤300 / 500 / >500 kVA)**, ONAN, **temperature rises 45 K top-oil / 50 K winding, hot-spot 98 °C at rating (35 °C design temperature), designed for 55 °C ambient** [V, T12-01 SEC 51-SDMS-04 Rev.02, 2019]; RMU = 2 ring load-break switches + 1 tee-off (fuse-switch or breaker), with earth-fault indicator; 17.5 kV, 21 kA 1 s [V, KSA-02/06/07/08].
- Main cable 3×300 mm² Al XLPE: **300 A at 35 °C ground, 2.0 K·m/W, 1.0 m** [V, KSA-02]; DPS Table 1.9 gives **R_DC,20 °C = 0.100 Ω/km** and a column labelled "R_AC 20 °C" = 0.130 Ω/km that matches AC resistance at operating temperature (label inferred to be a typo) [V table; D interpretation, R1-04]; X = 0.108 Ω/km at 60 Hz. Engine uses 0.100 (AC-corrected) for maximum fault level and 0.130 for losses/voltage drop/minimum fault. Cross-check [D]: Saudi Cable Co. 3×300 Al 384 A × 0.95 × 0.82 × 0.98 ≈ 293 A vs DPS 300 A; at 40 °C ground ≈ 278 A (SEC 2020 service conditions say 40 °C — conflict with DPS 35 °C, kept as scenario variant) [AS2, R1-19].
- MV neutral **solidly or low-resistance earthed**: SEC specs allow both [V, KSA-05/06/09]; SEC buys NERs (57-SDMS-01) [V, K2-11] **but** a filled 13.8 kV data-schedule example reads "Solidly" [V, K2-06]. Which one Riyadh uses is **not found**. The game's low-resistance default is an **assumption [A]**, and every earth-fault mechanic is tested under both settings.
- Design ambient 55 °C outdoors [V, KSA-01; T12-01]; Riyadh July mean daily max 43.4 °C [V-sec, NOAA via Wikipedia, KSA-21].
- Grid Code Issue 3 (Dec 2021, SEC's own PDF; a SERA May 2024 edition exists and was **not read** [K2-03]): frequency bands, fault clearing 120/100/80 ms, and — **at transmission connection points only** (cl. 2.4.6.2) — unbalance 1 %, flicker Pst 0.8/Plt 0.6, unchanged from 2007. MV/LV limits differ: SERA PQ draft gives MV flicker Pst 0.9/Plt 0.7, unbalance 1 % MV / 2 % LV; DPS 2004 NPS ≤ 2 % [V draft, 09 §2]; new RoCoF withstand (1 Hz/s synchronous, 2.5 Hz/s inverter plants) [V, K2].
- **Harmonic limit at 13.8 kV: voltage THD 4.0 % (odd 3.0 %, even 1.75 %)** (DPS 2004 Table 1.1 and SERA PQ draft Annex 1); the Grid Code's "THD 1.5 %" is the default for plant on the ≥110 kV transmission system only [V, K2].
- SEC SAIDI 112.6 (another SEC report: 111.4) / 78.6 / 68.5 min and SAIFI 2.61 / 1.71 / 1.47 for 2020 / 2023 / 2024; 2025 targets 61 min / 0.70 [V/S mixed, K2 — improvement percentages conflict between SEC documents].
- SEC has an NER specification for 11–34.5 kV primary substations (57-SDMS-01, 2017, 10 s rating), resistor value left to project data [V, K2] — shows NERs are used somewhere; does not establish Riyadh practice (see earthing bullet).
- Scale: 11.3 M customers, ~697 k distribution transformers (2024) [V, KSA-13]; SEC average interruption duration 190.9 → 111.4 min/customer (2017 → 2020) [V, KSA-15].

## 2. Which parts make good gameplay

Ranked by (a) decision richness, (b) feedback clarity, (c) fidelity we can actually validate, (d) teaching value, (e) replayability. Opinions are labelled as ours.

| Rank | Candidate core loop | Why it works (evidence) | Validated fidelity available? |
|---|---|---|---|
| 1 | **Fault response on an open-ring network** (seed idea): read FPIs, sectionalise by halving, backfeed via NOP (capacity, voltage drop, cold-load pickup), re-energisation guards as **hard gates**, switchgear duty; score on customer-minutes lost **plus a separate, non-tradeable safety/asset record** (R1-03) | Real documented procedure with real trade-offs: customer-count halving, delays, duty counts, three-phase vs earth-only FPI trust [V, OP-05/06]; SEC RMUs "equipped with earth fault indicator" (DPS 2004) ⇒ phase-to-phase faults may show **no** indication — a real mechanic (R1-31); scoring by CML/SAIDI is real regulation [V, OP-01/02/03]; no free/consumer game found in a ~20-title survey (paid professional training simulators exist) [GD gaps, R1-20] | Yes: power flow (33-bus golden), SC (5 golden cases), FPI logic (vendor-verified), reliability arithmetic (Ofgem worked example) |
| 2 | **Protection coordination puzzle**: set pickups/TMS/curves so the nearest device trips first with margin, without tripping on inrush/cold load | Exact curve equations [V, PR]; CTI practice [V]; ABB published grading examples as golden tests [V]; open-ended with several valid answers (Zachtronics evidence for open puzzles [V, GD-30]) | Yes (curves exact; ABB examples) |
| 3 | **Heatwave operations / thermal**: Riyadh summer afternoon, AC-driven peak, transformer hot-spot and ageing, load transfer between rings | IEC 60076-7:**2005** difference equations reproduced against Annex C (0.1 K) [V, TH]; SEC transformers are rated with reduced rises (45/50 K, hot-spot 98 °C at 35 °C) for 55 °C ambient [V, T12] — the model must use these, not IEC normal-ambient defaults (R1-10) | Method yes; Saudi parameters [V] from SEC spec + [D] gradient; cables partial |
| 4 | **Planning / expansion**: new district load → choose routes, cable sizes, substation sizes, ring structure, within SEC rules (50 % loading, indicative 7.5 km, 1.5 % MV voltage-drop allocation, N-1) | SEC DPS rules give real constraints [V]; SEC transformer loss capitalisation T = P + 11000·C + 4000·W (SAR) [V, T12-02] | Yes for steady state; equipment prices [A] |
| 5 | **Power-quality detective** cases: sag-type detective, capacitor resonance, ferroresonance, broken PEN | Strong, real, rarely taught phenomena [V/S, PQ]; best as authored cases on the shared engine. Ferroresonance must be set on an overhead/rural spur with single-pole cutouts or labelled non-Saudi: SEC RMU fuse-switches open all three poles via strikers, removing the classic cause (R1-30) | Partial (sag propagation & resonance formula yes; ferroresonance only qualitatively — scripted, labelled) |
| 6 | **System frequency event** (GB 9 Aug 2019 replay; inertia/UFLS) | Official report numbers [V, PQ-29]; swing equation validated against NREL example [V] | Yes, single-bus aggregate; Saudi UFLS stages not public [NOT FOUND] |
| 7 | **Safety logic** (embedded, not a standalone mode): the game enforces a generic safe sequence (isolate, secure, prove dead, earth) via interlocks and gates | Five safety rules (EN 50110-1, wording snippet-only), permits, interlocks, phasing [V/S, OP]; UK DNO model, **not SEC rules** (not public). Fixed disclaimer: not SEC rules, not authorisation, not a substitute for training. Free-text switching steps are never scored as "safe to use" (R1-16) | Logic rules only — embedded in mode 1 |
| 8 | **Arc-flash "clearing time is the dial"** | Incident energy ∝ arcing time is the key teaching point [S/V, PQ-24]. IEEE 1584-2018: standard not read; coefficients are IEEE copyright; third-party implementations exist but are unverified (R1-27) → only a labelled relative proxy; **never mapped to NFPA 70E PPE categories** (would read as PPE-selection guidance) | Proxy only — explanatory screen, not scored |
| 9 | Maintenance / asset management (thermography, DGA, health index) | Round 2 verified NETA ΔT bands, Duval zones, CNAIM health-index method, NFPA 70B intervals, EPRI failure medians | Medium: thresholds & HI method sourced; ageing curves (Weibull) still assumed |

**Our recommendation (opinion):** modes 1–4 form the core; 5–6 are authored "case files" on the same engine; 7 and 8 are embedded teaching moments; 9 waits for data.

## 3. What fidelity is achievable in a browser, and how to validate it

| Phenomenon | Achievable method | Validation (golden test) | Source |
|---|---|---|---|
| Steady-state power flow | Balanced positive-sequence solver on radial (and briefly meshed) islands; per-phase data model ready for later 3-phase | 33-bus (MATPOWER `case33bw` variant, fetched at test time, not committed): 202.677 kW, Vmin 0.91309 pu @ bus 18 — **[D]** our three solvers agree + **[S]** literature 202.67–202.68 kW; the original 1989 paper was not read and its printed solution is known to be inconsistent with its data [PF-10] (R1-05). Primary committed golden tests: our own authored feeders cross-checked offline with pandapower | 04 |
| Short circuit | IEC 60909-style equivalent voltage source, sequence networks, c = 1.10/1.00 (MV), κ formula; earthing method as network parameter with cable C0 | Glover Ex. 9.2–9.5 (all 4 fault types); Schneider CT158 §2.4, §3.5; CT18 §4.1, §4.3 (NER + capacitance) [V, 02] | 02 |
| Protection timing | Generic IDMT element `t = TMS·(k/(M^α−1)+c)` with IEC & IEEE constants; travel-integral for varying current; DT stages; fuses as tabulated curves | Curve-point checks (IEC SI 10.03 s at 2×, 2.97 s at 10×) [D from V constants]; ABB grading examples [V] | 03 |
| FPIs | Threshold on phase and residual current through the sensor, including downstream cable capacitive current on external earth faults; reset rules | Vendor logic [V vendor, SC-11]; behavioural tests | 02 §4 |
| Transformer thermal & ageing | IEC 60076-7:**2005** (superseded by 2018; 2018 values not read, R1-11) difference equations; **SEC parameters**: Δθor 45 K, hot-spot 98 °C at 35 °C ⇒ gradient 18 K [D], R from SEC max losses (6.2–8.2) [V, T12]; kiosk correction; ageing V | Annex C (0.1 K, 6.15 days) and Annex E (114.2 °C) validate the *method* [V, TH-02]; SEC emergency-loading table (133 %/150 % from 75 % preload, θh ≤ 140 °C for ≥ 240/155 and 98/65 min) checks the *Saudi parameters* [V, T12-d] | 05, 12 |
| Cable thermal | Steady ampacity × derating factors; adiabatic I²t = k²S² for conductors (k_Cu 143, k_Al 94, IEC 60949 constants [TH-11]) **and for metallic screens** (IEC 60949, 80 °C initial) — NKT 3×240/50: conductor 22.7 kA 1 s vs **screen 7.0 kA 1 s** [V, SP2]; this is the main physical consequence of solid vs resistance earthing (R1-07) | Saudi Cable Co. catalogue p. 82 (I = 0.143·S kA Cu, 0.0937·S kA Al, 1 s) and derating factors [V, AS2-13]; NKT table [V, SP2]; DPS↔SCC 300 A vs 293 A consistency [D] | 05, 10, 11 |
| Reliability metrics | Event log → CI, CML (3 min, Ofgem) and SAIFI/SAIDI/CAIDI/MAIFI (5 min, IEEE) with configurable threshold | Ofgem 34-min sequence example [V, OP-02]; DOE FLISR arithmetic [V, OP-04] | 07 |
| Frequency | Single-bus swing equation + governor ramp + DER RoCoF trips + UFLS table | NREL worked example (0.26 Hz/s) [V, PQ-34]; GB 2019 timeline [V, PQ-29] | 06 |
| Harmonic resonance | Per-order impedance with capacitor; hr ≈ √(Ssc/Qc) | Formula check [S/V, PQ-12] | 06 |
| Arc flash | **Not** IEEE 1584 (standard not read; coefficients copyright) → relative proxy E ∝ t, labelled, no PPE mapping | none (explanatory only) | 06 |
| Ferroresonance | Not simulated (needs EMT). Scripted case with honest label | n/a | 06 |

**Determinism (shareable seeds):** ECMAScript specifies `+ − × ÷` and `Math.sqrt` exactly (IEEE-754 binary64, round-to-nearest-even); `Math.exp/sin/pow/**` are implementation-approximated [V, PF-27/28]. Models that need non-integer powers or exponentials: IEC SI/VI/EI curves (M^0.02, M^2), IEC 60076-7 (K^0.8·…, ^1.6, 2^((θ−98)/6), exp in exponential form), κ = 1.02 + 0.98·e^(−3R/X), swing/thermal decays. All use our own `dmath.exp/log/pow` built from exact ops, with accuracy tests (max error vs reference values) (R1-23). `Intl` formatting is display-only. Seeded PRNG: sfc32 seeded via SplitMix32 [V, PF].

**Performance:** BFS on 513 buses ≈ 0.04 ms in Node [D, own benchmark]. Physics will not be the browser bottleneck; rendering and UX will.

**Data licensing:** IEEE test-feeder files and MATPOWER case files are **not** openly licensed [V, PF-01/09]; pandapower's bundled `case33bw` inherits that uncertainty. Decision D-005 (revised after R1-06): committed golden tests use (1) textbook/vendor worked examples (published numbers with citations), (2) our own authored feeders cross-checked offline with pandapower's *code* (BSD-3) on *our* data, and (3) the 33-bus case only via a test-time fetch of the MATPOWER file (never committed).

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
- Several scored metrics and a "par" instead of server histograms (Zachtronics rationale on leaderboards and cheating) [V, GD-30]. Because daily seeds are unbounded, par is computed **in the browser** by a stated reference heuristic (SSEN customer-count halving strategy), labelled "reference strategy", not "optimal" (R1-14).
- **Versioning (R1-15):** every seed, share string and replay URL carries the engine + data version; a model changelog ties each change to source IDs; old links open with a notice if the version differs; saves are migrated.
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
| Riyadh MV neutral earthing (solid vs NER, current limit) | Scenario parameter; default low-resistance earthed **[A]** with a stated assumed NER current; counter-evidence ("Solidly" data schedule) shown in Model notes; both settings tested |
| SEC FPI thresholds / types | Use vendor-range values [V vendor]; labelled |
| Crew travel/operate times at night in Riyadh | **[A]** labelled game parameters (no public data found [OP §4]) |
| Re-energisation delays (UK 5 min night / 20 min day) | Presented as "UK DNO example rule-set" [OP-06]; time windows are a rule-set parameter; not presented as Saudi practice — in Riyadh much excavation happens at night, so the UK rationale may not transfer (R1-17) |
| Cold-load pickup after outages (AC-dominated summer load) | **[A]** decaying multiplier parameter; magnitude NOT FOUND; summer-night load shape only partly sourced (R1-13) |
| Transformer edition | IEC 60076-7:2005 used; 2018 edition not read; stated in Model notes (R1-11) |
| Asset lives (CNAIM RMU 55 y, transformer 60 y) | GB 6.6/11 kV DNO values, not Saudi; hot-climate factors unknown; labelled (R1-24) |
| SEC reliability definitions (3 vs 5 min threshold) | Show both IEEE and Ofgem conventions; configurable |
| SEC UFLS stages | First stage 59.2 Hz; ≤ 0.2 Hz between stages, 5–10 % each, 40–45 % total (GCCIA harmonisation principle, 2012 trade article, secondary) [K2-16]; full table NOT FOUND → labelled illustrative (R1-26) |
| IEEE 1584 arc-flash equations | Proxy only, labelled |
| Fault rates per km, fault-type shares | EPRI medians per 100 conductor-mi·yr: cable 1.3, joints 0.4, terminations 0.2 [V, SP2/AS2]; fault-type shares still snippet-only → scenario weights labelled as assumptions |
| Most SEC documents are 2004–2008 editions | Model notes state the edition year of each rule |
| UK practice (SSEN) used for operational procedure | Model notes say: procedure is documented UK DNO practice; SEC equivalents not public |
| Harmonic limit at 13.8 kV | **Resolved in round 2:** THD 4.0 % at 13.8 kV; 1.5 % is transmission-only [K2] |

**Round 2 results (now folded in):**
- SC/protection [SP2]: NER+Dyn SLG example (low authority, recomputed: 11 kV, 15.9 Ω → 399 A); NKT cable R0/X0 table (fits R0 = R + 3·R_screen, screen-return case); Post Glover charging current ≈2.46 A/km at 13.8 kV; SEL "all faults on underground cables are permanent" (auto-reclose counterproductive) [V]; BAUR fault-location guide [V]; Glover Ex. 10.4 and 13.8 kV recloser/fuse scheme, NPAG-derived 11 kV grading example (via course notes) [V]; FPI thresholds (SEL, Ensto) [V]; ABB/SIBA kVA→fuse tables and ABB transfer-current example [V].
- Assets [AS2]: NETA thermography ΔT bands (MTS-2007, via Fluke) [V]; Duval triangle 1 zone boundaries (Duval 2002) [V]; EPRI failure medians [V]; Ofgem CNAIM v2.1 health-index method and expected lives (RMU 55 y, transformer 60 y) [V]; NFPA 70B-2023 intervals [V]; Saudi Cable Company derating factors (ground 35 °C → 0.95, 40 °C → 0.90; soil to 2.5 K·m/W) [V]; EU F-gas 2024/573 Art. 13 SF6 dates (≤24 kV from 2026) [V via national authorities].
- Still NOT FOUND: authoritative textbook Dyn+NER worked example; IEEE C57.104/IEC 60599 gas tables; Weibull parameters; cable thermal time constants; switchgear derating above 40 °C from ABB/Siemens/SEC; Riyadh NER value; SEC FPI settings; crew times.

## 8. Scope recommendation (input to Phase 2/3)

1. **Engine v1:** network model, balanced power flow (incl. backfeed voltage-drop check), sequence-network short circuit with earthing & C0, conductor **and screen** I²t checks, IDMT/DT/fuse protection with travel integral, FPIs (earth-only or 3-phase per RMU), transformer thermal (IEC 60076-7:2005 method, SEC parameters), reliability event log, deterministic math & PRNG, procedural network generator, versioned seeds. Each with golden tests.
2. **Mode 1 (flagship, fully polished):** "Night Shift" — fault response on procedurally generated Riyadh-style open rings, daily seed, share string, bilingual.
3. **Next modes on the same engine:** Protection coordination ("Grading"), Heatwave (thermal operations), Planning (expansion). Then case files (PQ, frequency).
4. **Not in v1:** 3-phase unbalanced solver, EMT phenomena, IEEE 1584 calculator, accounts/servers.


## 9. Resolution of the independent review (research/REVIEW-phase1.md)

All 31 findings were evaluated; none was rejected. Summary:

| Finding | Resolution |
|---|---|
| R1-01 (Critical) alfanar values in validation plan | Cable row now cites Saudi Cable Co. + NKT; 05 §3/§6/§7/golden line marked EXCLUDED; SOURCES k-value cross-check re-pointed to SCC/NKT/IEC 60949 |
| R1-02 open questions solicit employer/customer-internal data | D-004 extended: nothing from the owner's work knowledge, type tests, tenders or customer-internal documents; "ask the owner" items reworded to "public source needed" (banner added to notes) |
| R1-03 CML rewards unsafe re-energisation | Guards are hard gates; separate non-tradeable safety & asset record; risk-assessment step before any re-energisation onto a possibly faulted section (GDD §3.4–3.5) |
| R1-04 cable R | Both columns recorded; 0.100 for max fault, 0.130 for losses/min fault |
| R1-05/06 33-bus label & licensing | Relabelled [D]+[S]; D-005 revised (test-time fetch; authored feeders as primary) |
| R1-07 screen withstand | Screen I²t added to engine v1 and FIDELITY |
| R1-08 earthing default | Labelled [A] with counter-evidence; both settings tested |
| R1-09 PQ scope | Transmission scope stated; MV/LV values listed |
| R1-10/11 transformer | Lead research 12 found SEC 51-SDMS-04 parameters; edition stated |
| R1-12 voltage drop | Added to SEC facts, mode 1 backfeed check, planning constraints |
| R1-13 cold-load pickup | [A] parameter + research item |
| R1-14 par | In-browser reference heuristic, labelled |
| R1-15 versioning | Version in seeds/URLs, changelog, migration |
| R1-16 safety framing | Embedded only, disclaimer, no scoring of free-text steps |
| R1-17 UK delays | UK example rule-set, parameterised, uncertainty row |
| R1-18..R1-31 (minor) | Applied: 07 annotated as superseded by 01/09 on loading & automation; 40 °C cable variant; "no free/consumer game found"; 7.5 km indicative; Dyn11 now from SEC transformer spec [T12-g]; dmath list; CNAIM GB caveat; two SAIDI values noted; UFLS wording; IEEE 1584 wording + no PPE mapping; [V-sec] label introduced; Grid Code 2024 not read; ferroresonance context; earth-only FPI mechanic |
