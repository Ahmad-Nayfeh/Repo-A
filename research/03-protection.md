# 03 — Protection relays, time-current characteristics, coordination, protection problems

Research notes for the engine's protection model. Source IDs [PR-xx] → `research/sources/03-pr.md`.
Status tags per claim: **verified** (read in fetched doc), **snippet-only**, **uncertain/conflicting**, **derived** (computed by us from verified formulae — not a published number), **NOT FOUND**.

> Research limits: the session's web-search budget ran out before NPAG (GE/Alstom/Schneider "Network Protection & Automation Guide") chapter 9 could be read (the se.com PDF returned 404; Scribd/pdfcoffee/academia blocked). Glover/Overbye, Gers & Holmes and Paithankar were not accessed. Their examples are therefore **NOT FOUND** here, not "absent from the books".

---

## 1. Inverse-time (IDMT) equations

### 1.1 IEC 60255-151 (replaced IEC 60255-3)
- IEC 60255-151 Ed. 1.0 (2009-08) "cancels and replaces IEC 60255-3, published in 1989"; constants are in normative Annex A, Table A.1 "Constants for dependent time operating and reset characteristics" (values not in the free preview). **verified (ToC only)** [PR-06]
- General form implemented by vendors "harmonized with IEC 60255-151":
  `t(G) = TMS · [ k / ((G/GS)^α − 1) + c ]` for G > GS. For IEC curves c = 0. **verified** [PR-05 §1.1.2, Table 1-1]
  ABB writes the same as `t = k·β / ((I/I>)^α − 1)` with k = time multiplier [PR-07 Eq. 8.2.1, Table 8.2.1]; REL650 writes `t = k·A/(I^P − 1)` [PR-01 Eq. 1251]. **verified**
- Vendor (Protecta) limits: inverse range capped at GD = 20·GS (time is constant above); operation guaranteed above GT = 1.1·GS; optional minimum time. **verified, vendor-specific** [PR-05]
- Pickup threshold conflict: ABB DA handbook says (per "the standards", IEC 60255-151/BS 142) the relay "should start once the energizing current exceeds 1.3 times the set start current" for NI/VI/EI, and 1.1× for LTI [PR-07 p.4]; Protecta says the characteristic is valid and guaranteed above 1.1·GS [PR-05]. **conflicting** — the 1.3× figure looks like the older BS 142 / IEC 60255-3 guarantee. Engine: pickup = GS with an accuracy band; do not hard-code 1.3.

### 1.2 IEEE C37.112 (ANSI) operate and reset
- Operate: `t(M) = TD · ( A/(M^N − 1) + B )` for M > 1; Reset (electromechanical-disk emulation): `t(M) = TD · TR/(M² − 1)` for 0 < M < 1 (negative number = disk travelling back; magnitude is reset time); TR = reset time from full travel to zero at M = 0. **verified** [PR-03 Eqs. 2–3, Table I]; same forms in [PR-01] (`tr·k/(1−I²)`) and [PR-05] (`TMS·kr/(1−(G/GS)^α)`, α = 2 for reset).
- Dynamic (time-varying current) model: travel integral `∫ 1/t(M) dt = 1` → trip when travel reaches 1, reset when it returns to 0; switch between operate and reset equations at M = 1. **verified** [PR-03 Eq. 1, Fig. 3]; derivation from induction-disc torque balance in [PR-04 App. I]. → This is the recommended engine model (handles varying fault current, reclosing, and partial disk travel).
- IEC curves: Protecta implements IEC reset as a definite "Reset delay", not an equation. **verified, vendor-specific** [PR-05 Table 1-2]. Whether IEC 60255-151 Table A.1 gives tr for IEC A/B/C curves: **NOT FOUND** (preview has no values).
- Version: C37.112-1996 superseded by C37.112-2018. **snippet-only** [PR-30]. Constants below are the 1996 values as reproduced by vendors.

### 1.3 Curve constants table

| Curve | Standard / label | k or A | c or B | α or N/p | tr (reset) | Sources & status |
|---|---|---|---|---|---|---|
| Standard (Normal) Inverse | IEC A | 0.14 | 0 | 0.02 | (definite reset delay in [PR-05]) | [PR-01][PR-02][PR-05][PR-07] **verified** (4 independent docs agree) |
| Very Inverse | IEC B | 13.5 | 0 | 1.0 | — | same, **verified** |
| Extremely Inverse | IEC C | 80 | 0 | 2.0 | — | same, **verified** |
| Long-Time Inverse | IEC (no letter) | 120 | 0 | 1.0 | — | same, **verified** |
| Short-Time Inverse | IEC (vendor) | 0.05 | 0 | 0.04 | — | [PR-01] only, **uncertain** (single fragmented source) |
| Moderately Inverse | IEEE C37.112 (IEC ref D) | 0.0515 | 0.1140 | 0.02 | 4.85 | [PR-01][PR-02][PR-03][PR-05] **verified** |
| Very Inverse | IEEE C37.112 (E) | 19.61 | 0.491 | 2.0 | 21.6 | same, **verified** |
| Extremely Inverse | IEEE C37.112 (F) | 28.2 | 0.1217 | 2.0 | 29.1 | same, **verified** |
| ANSI Normal Inverse | vendor ANSI set | 0.0086 | 0.0185 | 0.02 | 0.46 | [PR-01][PR-05] **verified** (not in C37.112 3-curve table) |
| ANSI Long-Time Inverse | vendor | 0.086 | 0.185 | 0.02 | 4.6 | [PR-01][PR-05] **verified** |
| ANSI Long-Time Very Inverse | vendor | 28.55 | 0.712 | 2.0 | 13.46 | [PR-01][PR-05] **verified** |
| ANSI Long-Time Extremely Inverse | vendor | 64.07 | 0.250 | 2.0 | 30 | [PR-01][PR-05] **verified** |
| SEL "U1" (US moderately inverse) | SEL-specific | 0.0104 | 0.0226 | 0.02 | 1.08 | [PR-03 Appendix] **uncertain**: the SEL paper's code comment labels it "very inverse" and sets B = 0.00226 while the text says B = 0.0226. These are SEL's own US-curve constants for its TD scale, NOT the C37.112 table — do not mix. |

Other notes:
- Accuracy class per vendor: ±5 % or ±40 ms [PR-01]; REJ603 class E(5) or ±35 ms [PR-13]. **verified**
- "TDM = TD/7" relation between C37.112 TD and an old dial: [PR-02] **uncertain** (single secondary source, unexplained).
- Search snippet [blog] giving other IEC exponents (VI c = 0.01 etc.) — rejected as erroneous.

### 1.4 Reference values (derived from the verified constants; TMS/TD = 1)

| M = I/Is | 1.5 | 2 | 5 | 10 | 20 |
|---|---|---|---|---|---|
| IEC SI | 17.194 | 10.029 | 4.280 | 2.971 | 2.267 |
| IEC VI | 27.000 | 13.500 | 3.375 | 1.500 | 0.711 |
| IEC EI | 64.000 | 26.667 | 3.333 | 0.808 | 0.201 |
| IEC LTI | 240.0 | 120.0 | 30.0 | 13.333 | 6.316 |
| IEEE MI | 6.439 | 3.803 | 1.688 | 1.207 | 0.948 |
| IEEE VI | 16.179 | 7.028 | 1.308 | 0.689 | 0.540 |
| IEEE EI | 22.682 | 9.522 | 1.297 | 0.407 | 0.192 |

IEEE reset at M = 0 equals TR (MI 4.85 s, VI 21.6 s, EI 29.1 s); at M = 0.5: 6.47 / 28.8 / 38.8 s. **derived**

---

## 2. Definite-time / instantaneous elements, settings practice, CTI

### 2.1 Elements
- Multi-stage practice: low-set 3I> (IDMT or DT), high-set 3I>> and instantaneous 3I>>> (DT) "to accelerate the operation of the protection under heavy fault current conditions". **verified** [PR-07 p.4–5]
- Example of an RMU self-powered relay's ranges: I> 0.9–2.5×Is, t> 0.05–3.0 s; I>> 1–20×Is, t>> 0.04–3.0 s; Io> 0.1–1.0×Is (or ×In with CBCT); TMS k 0.05–3.0; curves NI/VI/EI/LTI per IEC 60255-3 plus RI, HR-fuse, FR-fuse. **verified** [PR-13 Tables 16–19]
- 67/67N directional: used for ring/meshed networks; interlocking in rings needs directional or distance relays. **verified** [PR-07 §8.2.4, §8.2.6]

### 2.2 Pickup setting practice
- Phase pickup must exceed max load: ABB's selectivity diagram includes "highest load current", line ratings, thermal withstand and inrush peak [PR-07 Fig. 8.2.1]; worked motor feeder example: pickup 640 A = 107 % of 598.9 A FLC ("480 A too low") [PR-23 slide 24]. **verified**
- During a fault the upstream relay also sees healthy-feeder load ΣI_L — account for it at low fault levels. **verified** [PR-07 p.6]
- High-set stage vs CT: set high-set below ~0.7·Ikmin/I1n (0.7 covers relay inaccuracy and CT errors); CT Fa recommended ≥ 20 (×setting). **verified, formulas partly garbled** [PR-12 pp.60–61]
- Current grading (instantaneous) setting: `Ics ≥ km·(1 + kDC/100)·IK`, km ≈ 1.2, IK = max fault at next relay location, kDC = transient overreach % (Eq. 8.2.4). Requires low SIR = ZS/ZL. **verified** [PR-07 Eqs. 8.2.4–8.2.6]
- Earth-fault pickup "as % of CT rating" typical value: **NOT FOUND** (only REJ603 range 0.1–1.0×Is [PR-13]).

### 2.3 Coordination time interval (CTI / grading margin)
- IEEE 242-1986 via GE: 0.3–0.4 s = 0.08 s breaker (5 cy) + 0.10 s disk overtravel + 0.22 s safety (CT saturation, setting errors); between digital relays 0.25 s. **verified** [PR-22]
- IEEE seminar: tested EM relays 0.08 + 0.10 + 0.12 = 0.30 s; hand-set 0.40 s; Buff Book 242-2001 Tables 15-1/15-2 give 0.35 s / 0.30 s (field-tested); if upstream relay is static, 0.2 s (no overtravel). **verified** [PR-23 slides 40–43]
- ABB numerical relays: `Δt_DT = 2·tE + tR + tCB + tM` → 2×25 + 30 + 50 + 20 = **150 ms**; `Δt_IDMT = t1·[(1+E1/100)/(1−E2/100) − 1] + tR + tCB + tM` → **360 ms** example. tM (safety margin) ≈ one cycle covers CT-saturation delay when successive CTs are similar. **verified** [PR-07 Eqs. 8.2.2–8.2.3, p.9–10]
- BS 142 time-error multipliers of class index E (Table 8.2.2): NI 2.22E@2×, 1.13E@5×, 1.01E@10×, 1.00E@20×; VI 2.34/1.26/1.01/1.00; EI 2.44/1.48/1.02/1.00; LTI 2.34E@2×, 1.26E@5×, 1.00E@7×. **verified** [PR-07 p.8]
- Inverse curves: CTI shrinks as current rises (0.2 s @10 kA → 0.06 s @20 kA in the example) → check CTI at the maximum through-fault current. **verified** [PR-23 slide 50]
- NPAG Table 9.2 recommended margins (often quoted 0.4/0.35/0.3/0.25 s by technology): **snippet-only/uncertain** — garbled in snippets; not read.

---

## 3. Golden test candidates (full numbers)

**GT-1 — ABB DA Handbook definite-time grading (verified [PR-07] p.9)**
Inputs: relay time tolerance tE = 25 ms (×2), breaker tCB = 50 ms, retardation tR = 30 ms, safety tM = 20 ms. Output: Δt_DT = 150 ms.

**GT-2 — ABB DA Handbook IDMT grading (verified [PR-07] p.9–10)**
Inputs: NI curve, accuracy class E = 5 %; relay 1: I1 = 1200 A ≈ 4.0× setting, t1 = 1000 ms; relay 2: I2 = 1700 A ≈ 2.4× setting; current-measurement error ±3 % → time error ±2 % (relay 1) and ±3 % (relay 2) [Tables 8.2.3/8.2.4]; BS 142 tolerance 1.13E ≈ 6 % (relay 1), 2.22E ≈ 11 % (relay 2); E1 = 8 %, E2 = 14 %; tCB = 50 ms, tR = 30 ms, tM = 20 ms.
Outputs: t1·[(1.08/0.86) − 1] = 256 ms (book rounds to 260 ms); total Δt_IDMT = 360 ms (exact 355.8 ms).
Engine self-checks (**derived**): ±3 % current at 4× gives −2.12 %/+2.28 % time (book: ∓2 %); at 2.4× gives −3.29 %/+3.64 % (book: ∓3 %). Implied TMS of relay 1 = 1.0/(0.14/(4^0.02−1)) = 0.201; minimum relay-2 TMS for t2 ≥ 1.36 s at 2.4× = 0.172.

**GT-3 — Pure-formula curve points (derived from verified constants)** — table §1.4. E.g., IEC SI TMS 1 at 2× = 10.03 s; at 10× = 2.97 s; IEC VI at 10× = 1.50 s; IEC EI at 10× = 0.808 s; IEEE MI TD 1 at 10× = 1.207 s.

**GT-4 — Chakrabarti et al. textbook (verified FOSSEE transcription [PR-24]) — graph-based, use as tolerance tests only**
| Ex. | Inputs | Book result | Our IEC-SI formula result (**derived**) |
|---|---|---|---|
| 3.7.1 | CT 500/5, PS 150 %, TMS 0.5, If 6000 A → PSM 8; curve 3.15 s | 1.575 s | 3.297 s ×0.5 = 1.648 s (+4.7 %) |
| 3.7.2 | CT 525/1, PS 125 %, TMS 0.3, If 5250 A → PSM 8 | 0.945 s | 0.989 s |
| 3.7.4 | CT 200/1, If 2000 A, R1 PS 100 % TMS 0.2; R2 PS 125 %; margin 0.5 s | R1 0.56 s; R2 1.06 s; R2 TMS 0.3365 | R1 0.594 s (PSM 10) |
| 3.7.3 | 20 MVA 11 kV xfmr, 30 % overload, xfmr CT 1000/5, feeder CT 400/5, feeder PS 125 % TSM 0.3, If 5000 A, margin 0.5 s | feeder 0.84 s; xfmr PS > 1.36; xfmr TSM 0.191 | (not recomputed) |
Conflict: book times are read from a printed BS 142-type curve (3.15 s @ PSM 8, 2.8 s @ PSM 10) whereas the IEC formula gives 3.30 s and 2.97 s. **Don't use them as exact golden values.** Use a ±6 % tolerance or test against the formula.

**GT-5 — CTI arithmetic (verified)**: 0.08 + 0.10 + 0.22 = 0.40 s [PR-22]; 0.08 + 0.10 + 0.12 = 0.30 s [PR-23].

**GT-6 — IEEE seminar EM relay read-off (verified [PR-23] slide 25)**: 800/5 CT, 4 A tap → 640 A pickup; faults 15 kA / 10 kA → 23.4× / 15.6×; GE IFC53 VI curve: TD ½ 0.07/0.08 s, TD 3 0.30/0.34 s, TD 10 1.05/1.21 s. Curve-read for a specific EM relay — only for "IFC53 emulation" tests.

NPAG ch. 9 worked example, Glover/Overbye and Gers & Holmes examples: **NOT FOUND** (not accessed).

---

## 4. Fuses
- Current-limiting MV fuse families: back-up (highest minimum breaking current I3), general purpose, full range (I3 ≈ minimum melting). Back-up fuses cannot clear between min melting and I3. ABB CEF I3 ≈ 3×In. **verified** [PR-08 p.3, p.8]
- Example CEF data (12 kV, 292 mm): 25 A → I3 77 A; 40 A → 105 A; 63 A → 190 A; 100 A → 275 A (87 mm) / 375 A (65 mm); I1 = 63 kA. **verified** [PR-08 p.10]
- Transformer fuse selection table (IEC 60787 & IEC 62271-105 basis), assumptions: max long-lasting overload 150 %, **magnetizing inrush 12×In for 100 ms**, transformer uk per IEC 60076-5. E.g., 12 kV: 500 kVA → 40 A, 1000 kVA → 80 A; 15 kV: 1000 kVA → 63 A. No 13.8 kV row (Saudi 13.8 kV: must interpolate or use manufacturer list — **NOT FOUND**). **verified** [PR-08 p.9]
- Replace all three links if one operates (IEC 60282-1) unless it can be verified the others saw no overcurrent. **verified** [PR-08 p.5]
- Switch-fuse combination (IEC 62271-105): three-pole switch + three striker fuses; any striker opens all three poles; strikers ensure correct operation for currents between minimum melting and minimum breaking current; may add over-current release or shunt release ("release-operated combination"). Fuses per IEC 60282-1. **verified** [PR-09 Intro, 3.4.101, 3.4.106]
- Transfer current: above it, fuses alone clear (switch too slow); below it, fuse striker trips the LBS which interrupts the remaining current. Depends on the fuse min-melting TCC and the switch (fuse-initiated) opening time. **verified** [PR-08 p.3][PR-10]. Standard: rated transfer current I_rtransfer clause 5.103, take-over current I_to 5.104, Annex B determination procedure **verified (ToC only)** [PR-09]. Fuse-initiated switch opening time "mostly 30–100 ms" **snippet-only** [PR-11]. The exact IEC rule (e.g., "pre-arcing time = 0.9·T0") **NOT FOUND / uncertain** — do not encode until the standard is read.
- Relay-fuse coordination: inverse curves make grading with fuses easier [PR-07 p.4]; relay EI/"HR-fuse"/"FR-fuse" curves exist to match fuses [PR-13]; digital TOC coordinating with a downstream fuse: use true-RMS input [PR-22]. **verified**
- Fuse melting characteristic modelling from public data: **NOT FOUND** as an equation. ABB gives TCCs as graphs only [PR-08]. Proposal (engine hypothesis, unverified): digitise min-melt and total-clear curves from a public catalogue as log-log tables.
- LV fuses (IEC 60269 gG/gM etc.): **NOT FOUND** (not researched — budget).

## 5. Reclosers and auto-reclose
- 80–90 % of faults on overhead distribution are momentary; reclose after 1–5 s, sometimes up to 3 times. **verified** [PR-18]
- Fuse-saving: fast curve trips first, recloses; then slow curve lets the lateral fuse clear a permanent fault. Fuse-blowing: upstream device coordinated so fuse clears every downstream fault. Trade-off: fuse-saving improves SAIFI/SAIDI but raises MAIFIe; at high currents fuse and breaker may both operate. Surveys: 1996 40 % saving / 27 % blowing / 33 % mixed; fuse-saving usage 91 % (1988) → 66 % (2000). **verified** [PR-17][PR-18]
- Fast curves can misoperate on magnetizing inrush and cold-load (re-energization) inrush. **verified** [PR-18]
- Underground cable feeders: AR not used because cable faults are treated as permanent and reclosing "further damages the cable"; on hybrid lines block AR for faults on cable sections. **snippet-only** [PR-19][PR-20]

## 6. Current transformers for protection
- Class xPy: x = max composite error % at the accuracy-limit primary current; ALF = accuracy-limit current / rated current; "5P10 = class 5P, ALF 10". 5P: ±1 % ratio error and ±60 min at In, 5 % composite at ALF·In; 10P: ±3 %, 10 % composite. Both suitable for non-directional O/C; 5P better. (Table quoted from IEC 60044-1, predecessor of IEC 61869-2.) **verified** [PR-12 p.59]
- Actual ALF scales with burden: Fa ≈ Fn·(Sin + Sn)/(Sin + Sa) — **uncertain** (formula garbled in [PR-12]; this is our reconstruction).
- Saturation: may delay relay operation; for DT stages up to the DC time constant; for IDMT stages assume delay as long as the DC time constant; for IDMT without high-set the AC component should not saturate the CT below 20× pickup. **verified** [PR-12 p.61]. ABB adds tM safety margin ≈ 1 cycle for this when successive CTs saturate similarly [PR-07 p.6].
- Class PX / X: specified by knee-point e.m.f. Ek. **snippet-only** [PR-29]. Knee-point definition "10 % more voltage → 50 % more exciting current": attributed to IEC by one secondary source and to IEEE C57.13 by another — **conflicting, not verified**.
- Core-balance CT (CBCT) for sensitive earth fault: REJ603 can measure Io internally (residual) or from an external CBCT (1 A input). **verified** [PR-13]. CBCT sensitivity numbers: **NOT FOUND**.
- Self-powered relays (RMU VCB panels): REJ603 takes operating power from the main (special ring-type) CTs, no auxiliary supply; "ready" LED only once minimum CT current present; trips a sensitive coil by capacitor discharge 24 V, 100 mJ, 50 ms; switch-on-to-fault minimum trip time 80 ms (power-up included); hand-reset flag works with no current. Minimum energizing current value: **NOT FOUND** in product guide. **verified** [PR-13]. Engine implication: a self-powered relay is blind/slow below its energizing threshold and has a power-up delay on SOTF.

## 7. Maloperation and miscoordination
- Inrush: fuse selection assumes 12×In for 100 ms [PR-08]; 8–12×FLC @ 0.1 s is an empirical point from a 1944 AIEE paper; actual peak can be higher and inrush lasts beyond 0.1 s [PR-23 slide 72]. **verified**
- 2nd-harmonic restraint: REJ603 setting 5–50 % (steps 5 %) [PR-13 Table 20] **verified**; typical/default 15–20 % (GE default 20 %, range 1–40 %), ultrasaturation can drop 2nd harmonic below that **snippet-only** [PR-27][PR-28].
- Cold-load pickup: fast curves trip on load inrush after an outage [PR-18]; SEL uses adaptive pickup / CLPU logic [PR-03][PR-14]. **verified (qualitative)**; no numeric CLPU multiplier found — **NOT FOUND**.
- Sympathetic tripping: (a) delayed voltage recovery — stalled low-inertia A/C compressor motors draw high current after an adjacent/upstream fault (motors stall for faults >5 cycles at <60 % V); (b) load unbalance during out-of-section ground faults → 3I0 exceeds ground pickup on healthy feeders. Recorded cases: SCE 10 incidents 1990–92 (one 1000 sq-mile area), SMUD Aug 1990 twelve 12.47 kV breakers, CP&L 89 events 1990–93. Mitigations: temporarily raise pickups, faster clearing, steeper TOC curves, balance feeders, logic. **verified** [PR-14]. Zero-sequence via star-star transformers [PR-16], Egyptian field data [PR-15] **snippet-only**. Saudi relevance: high A/C load → engine should model this.
- Blinding by DG: DG infeed reduces current seen by the feeder relay → delayed/failed trip (underreach); DG infeed can also cause sympathetic trips of a healthy feeder's non-directional relay. **snippet-only** [PR-25][PR-26].
- Δ-Y transformer: secondary phase-phase fault appears as 0.866 (and one primary phase at full value) → CTI checked on 3-phase faults may be non-conservative. **verified** [PR-23 slide 70]
- Case study, protection worsening an outage: GB 9 Aug 2019 — lightning on a transmission circuit tripped ~150 MW embedded generation on vector-shift loss-of-mains protection; frequency fall then tripped ~350 MW more on RoCoF LoM (cumulative 1,481 MW with the large units); LFDD at 48.8 Hz disconnected 931 MW, ~1.1 million customers lost supply 15–45 min. LoM settings sensitive to 0.125 Hz/s or 6°. **verified** [PR-21]; E3C quotes ~550 MW embedded gen lost **snippet-only** [PR-31] (conflict in totals — different accounting).
- Distribution-level real miscoordination incident report with full details: **NOT FOUND**.

## 8. Directional, distance, differential, Buchholz (brief)
- Directional O/C for ring/meshed networks and parallel feeders. **verified** [PR-07 §8.2.4]
- Under-impedance (distance-type) relays: reach independent of source impedance; used where fault current is low or near generators. **verified** [PR-07 p.10]
- Differential (87): compares in/out currents; absolutely selective, typically < 1 cycle; transformer 87T sees no-load current, tap position and inrush as false differential; through-fault CT saturation → biased (restrained) low-impedance or high-impedance schemes. **verified** [PR-07 §8.2.7]
- Buchholz relay: **NOT FOUND** (no source fetched).

## 9. Selectivity techniques
- ABB list: time-graded, time+current-graded, time+direction-graded, current/impedance-graded, interlocking (logic/blocking), differential. **verified** [PR-07 §8.2.1]
- Logic/blocking selectivity: downstream relay that starts sends a block to the upstream (e.g., incomer 3I>>>) stage; busbar fault → no block → incomer trips fast. Minimum blocked-stage delay = start time + output delay (< 40 ms) + blocked relay retardation incl. binary input (< 30 ms) + CT-saturation margin (1–2 cycles) ≈ 100 ms typical (no auxiliary relays). Backfeed: blocking stage must be set above backfeed or be directional. Always keep a parallel time-graded backup. **verified** [PR-07 §8.2.6]

---

## Implications for the engine
1. Implement one generic dependent-time element: `t = TMS·(k/(M^α − 1) + c)` with a constants table (§1.3). IEC curves c = 0. Keep IEEE TD semantics separate from IEC TMS; never mix SEL "U" constants with C37.112 constants.
2. Use the travel-integral model (∫dt/t(M) → 1) with the IEEE reset `TR/(M²−1)` for ANSI curves, and a definite-time reset (or instant reset) for IEC curves. This handles reclosing and fluctuating currents.
3. Configurable vendor details: cap at 20×Is (constant time above), minimum time, pickup accuracy (e.g., ±5 %), time accuracy (class E5 / ±35–40 ms).
4. DT/instantaneous stages as separate elements with own pickup and delay; logic-blocking input on any stage.
5. CTI checker: compute margin at the maximum through-fault current; flag < 0.2–0.4 s per relay technology; optionally ABB Eq. 8.2.3 with error terms.
6. CT model: ALF/saturation → added delay ≤ DC time constant when I > ALF·In (or simple "saturation flag" causing delayed/failed IDMT). Self-powered relay: no operation below energizing current; SOTF delay ≥ 80 ms.
7. Fuse: tabulated min-melt/total-clear curves; back-up fuse can't clear below I3 → striker trips LBS (transfer-current logic); replace three links after operation.
8. Inrush: 12×In for 0.1 s point (fuse selection) + 2nd-harmonic block threshold parameter (default 15–20 %, flagged snippet-only).
9. Events for scenarios: sympathetic trip (A/C motor stall after a fault), cold-load pickup on re-energization, DG blinding, LoM nuisance trips (9 Aug 2019 pattern), AR disabled on cable feeders, fuse-saving vs fuse-blowing modes.

## Open questions
1. IEC 60255-151 Table A.1 exact values, including any IEC reset tr constants and the normative GT/GD definitions (need standard text).
2. IEEE C37.112-2018 changes vs 1996 constants.
3. NPAG ch. 9 recommended grading margins and its worked example; Gers & Holmes / Glover examples — need access (library/PDF supplied by owner).
4. IEC 62271-105 transfer-current determination rule (Annex B) and typical RMU T0 values; fuse TCC data for 13.8 kV RMU fuses (owner's supplier data would be best).
5. Earth-fault pickup practice (% of CT primary) and CBCT sensitivity in SEC (Saudi Electricity Co.) practice — owner input.
6. Minimum energizing current of self-powered relays (REJ603 / others) — manual pages not read.
7. Knee-point definition (IEC 61869-2 vs IEEE C57.13) — read the standards.
8. Buchholz, LV fuse (IEC 60269) characteristics — not researched.
9. Real distribution-level miscoordination incident with full relay settings — none found.
