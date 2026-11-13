# REVIEW — Phase 1 research synthesis (independent, adversarial)

_Reviewer: independent subagent, 2026-11-13. Scope: `research/SYNTHESIS.md` (draft v2) against topic notes 01–11, `SOURCES.md`, `sources/*.md`, `docs/DECISIONS.md` (D-004..D-006). No repo files other than this one were edited._

Severity scale: **Critical** = breaks an owner rule or would put a wrong/forbidden value into the model; **Important** = materially wrong, misleading or missing for model fidelity, safety framing or feasibility; **Minor** = wording, labelling or housekeeping.

---

## A. Summary of checks performed

### A.1 Number tracing (SYNTHESIS → topic note), 33 values

| # | Value in SYNTHESIS | Note | Result |
|---|---|---|---|
| 1 | 59.9–60.1 Hz normal band | 01 §1, 09 §1.1 | OK |
| 2 | 50 % single loop / 65 % tee loop | 01 §4 | OK |
| 3 | ≤ 7.5 km to NOP at 13.8 kV | 01 §4 | OK, but DPS says "as indication" (R1-21) |
| 4 | 500/1000/1500 kVA package units | 01 §4 | OK |
| 5 | 13.8/0.4 kV **Dyn11** for package units | 01 §3/§4 | Partly: Dyn11 comes from SDCS-03 (overhead grounding), not the unit-substation spec (R1-22) |
| 6 | RMU 17.5 kV, 21 kA 1 s, 2 LBS + tee-off, EFI | 01 §4 | OK |
| 7 | 3×300 Al: 300 A | 01 §4 | OK (35 °C, 2.0 K·m/W basis) |
| 8 | R 0.130 Ω/km | 01 §4 | **Mislabelled** (R1-04) |
| 9 | X 0.108 Ω/km @ 60 Hz | 01 §4 | OK |
| 10 | Design ambient 55 °C; Riyadh July mean max 43.4 °C | 01 §5 | OK (43.4 is Wikipedia/NOAA, secondary; labelled [V]) |
| 11 | Grid Code 2021: unbalance 1 %, Pst 0.8 / Plt 0.6, 120/100/80 ms | 09 §1.1 | OK, but transmission-only scope dropped (R1-09) |
| 12 | RoCoF 1 Hz/s and 2.5 Hz/s | 09 §1.1 | OK |
| 13 | THD 4.0 % (odd 3.0, even 1.75) at 13.8 kV | 09 §2 | OK |
| 14 | SAIDI 112.6/78.6/68.5; SAIFI 2.61/1.71/1.47; targets 61 / 0.70 | 09 §4 | OK |
| 15 | 57-SDMS-01, 2017, 10 s | 09 §3 | OK; "supports the low-resistance default" overstated (R1-08) |
| 16 | 11.3 M customers, ~697 k transformers | 01 §4 | OK |
| 17 | 190.9 → 111.4 min (2017 → 2020) | 01 §6 | OK; conflicts silently with 112.6 for 2020 (R1-25) |
| 18 | 202.677 kW, 0.91309 pu @ bus 18 "[V, PF-C1]" | 04 §2.1 | **Status overstated** (R1-05) |
| 19 | c = 1.10 / 1.00 (MV) | 02 N-03 | OK |
| 20 | IEC SI 10.03 s @ 2×, 2.97 s @ 10× [D] | 03 §1.4 | OK |
| 21 | Annex C 0.1 K, 6.15 days; Annex E 114.2 °C | 05 §2 | OK (reproduction is [D]; inputs [V]) |
| 22 | k_Cu 143, k_Al 94 | 05 §3.4, 11 §6 | OK numerically; validation pointer is alfanar (R1-01) |
| 23 | Ofgem 34-min example | 07 GT-1 | OK |
| 24 | NREL 0.26 Hz/s | 06 §7.1 | OK |
| 25 | 513 buses ≈ 0.04 ms [D] | 04 §6.1 | OK |
| 26 | UFLS 59.2 Hz, "0.2 Hz steps of 5–10 %" | 09 §5 | Source says "no more than 200 mHz between stages" (Minor, R1-26) |
| 27 | EPRI 1.3 / 0.4 / 0.2 per 100 conductor-mi·yr | 10 SP2-20, 11 AS2-06 | OK |
| 28 | NER example 15.9 Ω → 399 A | 10 GT-R2-A | OK (low authority, stated) |
| 29 | Post Glover ≈ 2.46 A/km at 13.8 kV | 10 SP2-02 | OK (unit conversion [D], labelled V) |
| 30 | CNAIM RMU 55 y, transformer 60 y | 11 AS2-09 | OK, but these are GB 6.6/11 kV assets (R1-24) |
| 31 | SCC derating 35 °C → 0.95, 40 °C → 0.90 | 11 §6 | OK |
| 32 | F-gas ≤24 kV from 1 Jan 2026 | 11 §8 | OK (verified-secondary) |
| 33 | In-game support d ≈ .34 [S]; KSGAAL > 1,500 terms; ~20 titles surveyed | 08 | OK |

No invented source, number or clause was found. All 33 values exist in the notes. The problems are mislabelled status, dropped scope qualifiers, and one stale pointer to employer data.

### A.2 Web spot-check of load-bearing "verified" sources (10 checked)

| Source / claim | Reviewer result |
|---|---|
| SEC DPS 2004: 50 % / 65 % loading, ≤ 7.5 km, cable basis 35 °C / 2.0 K·m/W / 1.0 m, Table 1.9 impedances | **Confirmed** by downloading the same PDF (mm4design host) and extracting text. **Discrepancy:** Table 1.9 gives 3×300 Al **RDC 20 °C = 0.1000** and "RAC 20 °C" = 0.1300 Ω/km. That second column is AC resistance at operating temperature (R1-04). Also: §2.2.3 calls 7.5 km an "indication", and Table 1.3 allocates **1.5 %** voltage drop to the primary feeder (R1-12). |
| Grid Code Issue 3 (Dec 2021): 59.9–60.1 Hz, 57–62.5 Hz, THD 1.5 % (transmission connection point), Pst 0.8 "at any Connection Point in the Transmission", RoCoF 1 Hz/s / 2.5 Hz/s (2.5.5.4) | **Confirmed** (SEC PDF downloaded, text extracted). |
| IEC 60255 curve constants (0.14/0.02, 13.5/1, 80/2, LTI 120/1) | **Confirmed in secondary sources only** (ABB and Schneider manuals; the Schneider ADVC table gives 10.03 s at 2× for SI). IEC 60255-151 Table A.1 itself was not accessible, which matches the note's status. |
| Baran & Wu 33-bus: 202.67 kW / 0.9131 pu @ bus 18 | **Confirmed only as literature folklore** (STET 2026 gives 202.68 kW; other papers 202.67). The original 1989 paper was not found. The [V] label in SYNTHESIS is not justified (R1-05). |
| IEC 60076-7 distribution ONAN parameters (y 1.6, k11 1, k21 1, k22 2, τo 180, τw 4) | **Could not confirm** on the open web (previews only; one blog gives x 0.8 / y 1.6 / H 1.1 for distribution units under IEC 354). The note's reading via IS 2026-7 is plausible but rests on one OCR'd scan. 2018 values unknown (R1-11). |
| SSEN re-energisation delays (5 min 22:00–06:00, 20 min 06:00–22:00, also first re-energisation when sectioning UG) | **Confirmed**: PR-NET-OSM-014 Rev 1.00 Table 10.1 (as cited), and the same values in **PR-NET-OSM-020 Rev 1.01 (July 2023) Table 7.1**, which SYNTHESIS does not cite. OSM-020 adds a mandatory Control Engineer risk assessment (§8) and an evidence-based Appendix A. The 150 MVA / 100 MVA fault-level rule, halving by customer numbers and the 12-hour last-section rule are confirmed in OSM-014. |
| Ofgem 3-minute rule and 34-min example | **Confirmed**: RIIO-ED2 Annex F v1.1 (Feb 2025) §2.27 verbatim. |
| NETA Table 100.18 bands (1–3 / 4–15 / >15 °C; 1–10 / 11–20 / 21–40 / >40 °C) | **Confirmed** in the Fluke application note PDF (credited "ANSI/MTS-07"). The current MTS-2023 edition was not checked. |
| Riyadh July mean max 43.4 °C, record 49.8 °C | **Confirmed** (Wikipedia, NOAA 1991–2020, Riyadh Old). Riyadh New gives 43.9 °C. |
| "IEEE 1584-2018 equations are not publicly available" | **Contradicted in part**: an MIT-licensed open-source implementation (Rust crate `arcflash`) and IEEE's own calculator exist. The coefficient tables are copyrighted, but "not public" is not accurate (R1-27). |

Reviewer's own downloads (scratch only, not committed): DPS 2004 PDF, Grid Code Issue 3 PDF, SSEN OSM-014 and OSM-020, Fluke NETA note, Ofgem RIIO-ED2 Annex F.

---

## B. Findings

### R1-01 — Critical — Employer data still wired into the validation plan
- **Location:** SYNTHESIS §3 table, row "Cable thermal", column Validation: "Catalogue short-circuit values [V]; derating tables (non-employer source needed, D-004)". Also `05-thermal-assets.md` lines ~290, 389, 396, and the "Golden tests to add" line 430 ("Cable k-factor: Cu 240 mm² 1 s → 34.3 kA; Al 240 mm² 1 s → 22.7 kA [TH-10]"). Also `SOURCES.md` line ~317: "k=143 and k=94 were derived and cross-checked against TH-10".
- **Problem:** The only "catalogue short-circuit values" in the notes that are set up as a golden test are the alfanar catalogue values [TH-10]. The D-004 banner in 05 covers §3 but not §6, §7 or the golden-test summary, which still list TH-10 values unflagged. The SYNTHESIS row also says a non-employer derating source is still "needed", although round 2 supplied one (SCC, AS2-13). A developer following SYNTHESIS → 05 would put alfanar numbers into test fixtures.
- **Evidence:** 05 lines 290, 389, 396, 430; SYNTHESIS line 62; D-004.
- **Fix:**
  - Change the SYNTHESIS row to "SCC catalogue p. 82 (I = 0.143·S kA Cu, 0.0937·S kA Al, 1 s) [V, AS2-13]; NKT AXAL-TT PRO table Ik 1 s 22.7 kA for 3×240 Al [V, SP2]; derating per SCC [V, AS2-13]".
  - Mark 05 §6, §7 and golden-test line 430 "[EXCLUDED per D-004]" (or delete them).
  - Change the k-value cross-check in SOURCES.md to cite SCC/NKT and IEC 60949 constants [TH-11].

### R1-02 — Important — Open questions solicit employer material from the owner
- **Location:** 06 Open question 2 ("…from a type-test report of the MRMU/RMU products he works with"); 03 Open question 4 ("owner's supplier data would be best"); 06 §Implications (arc-flash proxy "scaled from one owner-supplied reference point"); 01/02/07 "Ask Ahmad / the owner" for SEC NER value, FPI settings and crew data.
- **Problem:** The owner is a switchgear engineer at alfanar. Type-test reports, supplier TCCs and internal SEC settings he knows through work are employer or confidential customer data. Asking for them invites exactly what D-004 forbids, and may also expose confidential SEC data.
- **Fix:**
  - Reword these items to "public source needed; owner may point to a **public** document only".
  - Add to D-004: "No values from the owner's work knowledge, type tests, tenders or customer (SEC) internal documents."
  - Use a public anchor for the arc-flash proxy (e.g., the IEEE 1584 presentation example) or none.

### R1-03 — Important — A CML-scored fault game rewards unsafe re-energisation unless safety is scored
- **Location:** SYNTHESIS §2 rank 1 ("score on customer-minutes lost"), §8 "Night Shift".
- **Problem:** If the score is only CML/SAIDI, the best strategy is to re-energise as early and as often as possible. That teaches the opposite of the SSEN guidance [OP-05 §9.2], where safety takes priority over "any perceived pressure to restore supplies". SSEN OSM-020 (2023) also requires a Control Engineer risk assessment before every manual reclose onto a possible fault. SYNTHESIS lists the delays as a constraint to "respect", but not as a scoring or failure rule.
- **Fix:**
  - Make the re-energisation guards hard gates or heavy penalties: delay, staff exclusion, duty count, fault-level reduction, and a risk-assessment step.
  - Add a separate safety/asset-damage score that cannot be traded for CML.
  - Show re-closing onto a fault as a visible consequence: third-party danger and switchgear duty used up.
  - Cite OSM-020 Table 7.1 and §8 alongside OSM-014.

### R1-04 — Important — Cable resistance is AC at operating temperature, not 20 °C
- **Location:** SYNTHESIS §1 ("R 0.130 Ω/km"); 01 §4 table header "Rac 20 °C"; D-006.
- **Problem:** DPS 2004 Table 1.9 gives two columns: RDC 20 °C = 0.1000 Ω/km and "RAC 20 °C" = 0.1300 Ω/km for 3×300 Al (likewise 3×185 Cu: 0.0991 / 0.129; 3×300 Cu: 0.0601 / 0.0808). The 0.130 value equals typical AC resistance at 90 °C (compare Reka 240 Al: 0.125 DC 20 °C, 0.161 AC 90 °C). The DPS column label looks like a typo. The note copied the 0.130 column and dropped the 0.100 DC column.
- **Why it matters:** IEC 60909 maximum short-circuit uses R at 20 °C [N-12], while losses and voltage drop use R at operating temperature. Using 0.130 for maximum fault level understates the peak and DC components (κ) and fault current slightly. A switchgear engineer would notice.
- **Fix:**
  - Record both columns (RDC20 0.100 and RAC 0.130) with the note "RAC column is at operating temperature (inferred; DPS label reads 20 °C)".
  - Use RDC20 (AC-corrected) for maximum short-circuit and RAC(90 °C) for losses and minimum fault.
  - Label the inference [D].

### R1-05 — Important — Baran & Wu golden value labelled [V] but it is computed and folklore
- **Location:** SYNTHESIS §3 row "Steady-state power flow": "202.677 kW, Vmin 0.91309 pu @ bus 18 (three solvers agree) [V, PF-C1]".
- **Problem:**
  - PF-C1 is the team's own computation ([D]).
  - The literature values 202.67/202.68 kW are snippet-only [PF-13/15].
  - The original paper was not read.
  - Zimmerman [PF-10] states the paper's printed solution does not match its data.
  - The reviewer could find the numbers only in secondary papers.
- **Fix:** Label it "[D] (our 3 solvers on MATPOWER case33bw data) + [S] literature 202.67–202.68 kW". Say explicitly that the golden value belongs to the corrected MATPOWER data variant.

### R1-06 — Important — D-005 "re-type from the paper" contradicts the golden value it is meant to reproduce
- **Location:** DECISIONS D-005 (c); SYNTHESIS §3 "Data licensing".
- **Problem:**
  - D-005 says the 33-bus input will be "re-typed from the published paper". The paper was never read [PF-07], and per [PF-10] its data/solution are inconsistent with the corrected MATPOWER file.
  - The 202.677 kW / 0.91309 pu result comes from MATPOWER's corrected data, which is not BSD [PF-09].
  - Re-typing the paper risks a different variant (compare the 0.8820 pu variant [PF-14]), and the golden test would then fail or be "tuned".
  - pandapower's bundled `case33bw` inherits the same licence uncertainty [04 §Licensing], yet SYNTHESIS presents pandapower cross-checks as clean.
- **Fix:**
  - Decide explicitly: (a) fetch MATPOWER data at dev time and never commit it (04 option a), or (b) obtain the paper, re-type it, and recompute the expected result from that variant.
  - Prefer original engine-authored feeders (04 G7) as the primary committed golden tests.
  - Update D-005 and SYNTHESIS.

### R1-07 — Important — Cable screen earth-fault withstand is missing, and it is the main physical argument about MV earthing
- **Location:** SYNTHESIS §1 (earthing), §3 (Cable thermal), §7 (earthing uncertainty).
- **Problem:**
  - Solidly earthed 13.8 kV gives SLG currents of kA up to near the 20–21 kA design level [E-04, KSA-02].
  - The return flows largely in the cable screen [SP2-06/08].
  - Screen 1-s ratings are far lower than conductor ratings: NKT 3×240/50 has conductor 22.7 kA but **screen 7.0 kA** [SP2 table].
  - The adiabatic check in SYNTHESIS covers conductors only.
  - Without a screen check, the "solid vs NER" choice has no physical consequence in the game, yet screen burn-out is a standard real consideration.
- **Fix:**
  - Add a screen I²t check (IEC 60949, 80 °C initial temperature per the notes) to Engine v1, with screen data from non-employer datasheets (NKT/Reka).
  - Make the earthing parameter visibly drive screen damage, FPI behaviour and touch-voltage risk.

### R1-08 — Important — "Low-resistance earthed default is supported by evidence" is overstated
- **Location:** SYNTHESIS §1 bullet on 57-SDMS-01 ("supports the low-resistance-earthed default"); §7; D-006.
- **Problem:**
  - The evidence is two-sided. 57-SDMS-01 shows that SEC buys NGRs [K2-11]. But the 56-SDMS-05 data-schedule example is filled "Grounding: **Solidly**" for 13.8 kV [K2-06]. SDCS-03 and the RMU relay spec allow both [KSA-05/07].
  - The grounding-transformer spec 52-TMSS-01 (snippet) suggests some delta-fed 13.8 kV buses, which says nothing about the current limit.
  - Choosing LRG as the default is a game assumption, not a finding.
- **Fix:**
  - Label the default **[A]**.
  - State the counter-evidence (the "Solidly" filled example).
  - Run every earth-fault mechanic under both settings until a public SEC source settles it.

### R1-09 — Important — Grid Code PQ limits are listed without their transmission scope; distribution limits differ
- **Location:** SYNTHESIS §1: "Grid Code Issue 3 … unbalance 1 %, flicker Pst 0.8/Plt 0.6 …".
- **Problem:**
  - Grid Code cl. 2.4.6.2 applies "at any Connection Point in the Transmission" (reviewer confirmed in the PDF).
  - For MV, the SERA PQ draft gives **Pst 0.9 / Plt 0.7** and unbalance 1 % MV / 2 % LV [09 §2]. DPS 2004 gives NPS ≤ 2 %.
  - SYNTHESIS fixed this for THD but not for flicker and unbalance. A PQ case file at 13.8 kV would use the wrong limit.
- **Fix:** Add "(transmission connection points only)" and list the MV/LV values from 09 §2 with their draft status.

### R1-10 — Important — Transformer thermal defaults ignore Saudi high-ambient design
- **Location:** SYNTHESIS §2 rank 3 and §3 "Transformer thermal"; 05 GT-4 (θh ≈ 135 °C, V ≈ 76 at 50 °C ambient in a kiosk).
- **Problem:**
  - The model defaults (IEC 60076-7 Table E.1: Δθor 55 K, Δθhr 23 K) assume the IEC normal design ambient (40 °C max / 30 °C month / 20 °C year) [05 §1.4].
  - Equipment for 55 °C ambient [KSA-01/10/11] is normally designed with reduced temperature rises. IEC 60076-2 has a table of temperature-rise corrections for special service conditions (reviewer saw it in the ToC; values not read).
  - No SEC distribution-transformer specification was consulted.
  - Running IEC-normal-ambient parameters in Riyadh summer predicts extreme ageing on every full-load afternoon. That is the result most likely to make a Saudi engineer wince, and it would become the core message of the "Heatwave" mode.
  - The golden tests (Annex C is an ONAF power transformer; Annex E is OF) do not validate distribution ONAN in hot ambient.
- **Fix:**
  - Research the SEC distribution-transformer spec (temperature-rise limits, design ambient, paper type) and IEC 60076-2 Table 2.
  - Until then, label hot-ambient ageing as [A] and use rises reduced by (ambient − 40 K) as a labelled assumption.
  - Say in SYNTHESIS that the "Yes (transformer)" fidelity claim is for the IEC method, not for Saudi units.

### R1-11 — Important — IEC 60076-7 edition: model built on superseded 2005 text
- **Location:** SYNTHESIS §1 L5 and §3 cite "IEC 60076-7" without an edition.
- **Problem:** 05 read only Ed. 1 (2005, via IS 2026-7). Ed. 2 (2018) rewrote the thermal models, revised limits and added moisture/oxygen ageing [TH-01]. The distribution short-time emergency limits may differ (Alliander 115/160 °C conflict [TH-06]). The reviewer could not confirm the distribution ONAN parameters on the open web.
- **Fix:** Write "IEC 60076-7:2005 (superseded by 2018; 2018 values not read)" everywhere, show it in Model notes, and add an open item.

### R1-12 — Important — Planning rules omit the DPS voltage-drop allocation, which can bind before the 7.5 km rule
- **Location:** SYNTHESIS §1 and §2 rank 4 ("50 % loading, 7.5 km, N-1").
- **Problem:**
  - DPS Table 1.3 allocates only **1.5 %** to the MV primary feeder (more allowed with regulation) [KSA-02].
  - DPS Table 2.2 gives K = 11,282 for 3×300 Al at pf 0.85 (%VD = kVA·km/K; reviewer read it in the PDF).
  - Derived by the reviewer (labelled [D]): a feeder at 50 % (≈3.6 MVA) uniformly distributed over 7.5 km gives ≈ 1.2 %. In the N-1 backfeed case (≈7.2 MVA over up to 15 km) it gives ≈ 4.8 %.
  - So voltage drop under contingency is a real constraint for the Planning and Fault-response modes, and SYNTHESIS does not mention it.
  - The 7.5 km is also only "an indication" in DPS §2.2.3.
- **Fix:**
  - Add the voltage-drop allocation and the utilization limit (−7.5 %) as planning constraints.
  - Check backfeed voltage in mode 1.
  - Word 7.5 km as "indicative".

### R1-13 — Important — Cold-load pickup and summer-night AC load are missing from the flagship restoration mode
- **Location:** SYNTHESIS §2 rank 1, §8 "Night Shift".
- **Problem:**
  - Backfeed via the NOP requires a capacity check [OP-05 §13.10].
  - After an outage in Riyadh, the AC-dominated load (≈60 % of summer residential load [KSA-22]) returns with cold-load pickup, and the night load stays high in summer.
  - 03 notes CLPU and A/C-motor stall/sympathetic tripping but found no numeric multiplier (NOT FOUND).
  - SYNTHESIS neither lists this as a mechanic nor as an uncertainty. The "Night Shift" framing may wrongly suggest a light-load case.
- **Fix:**
  - Add CLPU as an [A]-labelled parameter with a research item.
  - Add the summer-night load shape as a research item: 01 has only Eastern Province data and a peak-hour snippet.

### R1-14 — Important — "Par frontier computed offline" is unscoped for daily procedurally generated puzzles
- **Location:** SYNTHESIS §5 bullet 2; §8.
- **Problem:**
  - A daily seed derived from the date means the puzzle set is unbounded, so par must be shipped for a pre-generated calendar or computed in the browser.
  - An optimal multi-objective restoration solver (switching sequences × timing × CML × duty) is combinatorial. Its feasibility and runtime are unstudied, and the 0.04 ms BFS benchmark says nothing about it.
  - If par comes from a heuristic, it must be labelled as such.
- **Fix:**
  - Add a feasibility item: pre-generate N days of seeds with offline par, versioned with the engine.
  - Or ship a bounded in-browser search with a stated heuristic.

### R1-15 — Important — No engine/content versioning plan for a long-lived seeded game
- **Location:** SYNTHESIS §3 Determinism, §5.
- **Problem:**
  - Seeds and share strings are only reproducible for a fixed engine and parameter table. Any physics fix, standard-edition update (IEC 60076-7:2018, SERA 2024 Grid Code, NETA 2023) or data correction changes old seeds' outcomes and par values.
  - Over the years this game is meant to run, that breaks shared links, streaks and saved games.
- **Fix:**
  - Put an engine/data version in every seed and share string, and keep old rule-sets replayable or mark them as superseded.
  - Add save migration.
  - Keep a model changelog tied to source IDs.

### R1-16 — Important — The safety-authoring mode can read as a procedure
- **Location:** SYNTHESIS §2 rank 7 ("write a correct isolation & earthing sequence"); 07 §3.
- **Problem:**
  - Scoring a player's switching programme as "correct" implies the game knows a correct real-world procedure.
  - The material is UK DNO practice (SSEN, DSR lineage) and the EN 50110 five rules (snippet-only [OP-13]); SEC's rules are not public [07 OQ3].
  - The SYNTHESIS line "must show only safe practice" does not cover this framing risk.
- **Fix:**
  - Frame it as "logic of a generic safe sequence (UK DNO model)" with a fixed disclaimer: not SEC rules, not authorisation, not a substitute for training.
  - Never score free-text steps as "safe to use".
  - Keep it embedded in mode 1 (as SYNTHESIS already suggests), with the safety review gate in docs/org/safety.md applied.

### R1-17 — Important — UK night/day re-energisation delays are transferred to Riyadh without examining their rationale
- **Location:** SYNTHESIS §7 "UK practice (SSEN) used for operational procedure"; mode 1.
- **Problem:** The 5-min (22:00–06:00) and 20-min (06:00–22:00) delays rest on the third-party exposure pattern in Britain (OSM-020 Appendix A is "evidence-based"). In Riyadh, much excavation and construction work runs at night to avoid heat, so the rationale may not transfer. A Saudi engineer would question a shorter delay at night.
- **Fix:**
  - Present the delays as "UK DNO example rule-set".
  - Make the time windows a rule-set parameter.
  - Add an explicit uncertainty row.
  - Do not present the night rule as Saudi practice.

### R1-18 — Minor — Inter-note contradiction on the SEC loading rule and automation share (07 vs 01/09)
- **Location:** 07 §5 says the N-1/50 % rule is "NF as a published rule … no loading clauses were seen" and the 40.8 % automation figure is from "a market-research snippet". 01 §4 verified the DPS 50 %/65 % rule and SEC's 36.4 % (2024) / 39.3 % (Q3 2025) automation. 09 has 40.8 % (FY2025) as snippet.
- **Fix:** Annotate 07 §5 and §OQ4 as superseded by 01/09. SYNTHESIS already uses the correct values.

### R1-19 — Minor — Cable rating basis: 300 A is at 35 °C; the 2020 SEC service conditions say 40 °C
- **Location:** SYNTHESIS §1 (300 A); §1 design-ambient bullet.
- **Problem:** The ambient conflict is in 01 but not in SYNTHESIS.
  - Reviewer's [D] cross-check: SCC 3×300 Al 384 A (30 °C, 1.2 K·m/W, 0.8 m) × 0.95 × 0.82 × 0.98 ≈ **293 A**. This agrees well with the DPS 300 A at 35 °C / 2.0 / 1.0 m and is a useful consistency test.
  - At 40 °C ground the same factors give ≈ **278 A**.
- **Fix:**
  - State the basis (35 °C, 2.0 K·m/W, 1.0 m) next to 300 A.
  - Add the 40 °C variant as a scenario.
  - Record the SCC↔DPS consistency check as a [D] golden sanity test.

### R1-20 — Minor — "No existing game does it" overstates the evidence
- **Location:** SYNTHESIS §2 rank 1 ("no existing game does it [GD gaps]"); §4.
- **Problem:** 08 searched about 20 titles and found none, which is absence of evidence. Commercial operator-training / dispatcher-training simulators (e.g., SOS/WSC [GD-27], snippet-only) do cover restoration, and 08 notes a 1991 distribution-restoration training package (snippet).
- **Fix:** Write "no free/consumer game found in a ~20-title survey; professional training simulators exist (paid)".

### R1-21 — Minor — The 7.5 km rule is indicative, not a hard limit
- **Location:** SYNTHESIS §1 and rank 4.
- **Evidence:** DPS §2.2.3: "As indication to the planning engineers, feeders on MV should not exceed 7.5 Km…" (reviewer read it).
- **Fix:** Say "indicative ≤ 7.5 km".

### R1-22 — Minor — Dyn11 for package substations traced to an overhead grounding standard
- **Location:** SYNTHESIS §1 package-unit bullet [V, KSA-02/06/07/08].
- **Problem:** Dyn11 is verified in SDCS-03 (overhead network grounding) [KSA-05], which is not in the cited list. The unit-substation spec gives 13.8/0.231/0.4 kV and a solidly earthed LV neutral, but no vector group is quoted in 01.
- **Fix:** Cite KSA-05 for Dyn11 and mark the transfer to package units as [D].

### R1-23 — Minor — Determinism: non-integer powers are needed in core models
- **Location:** SYNTHESIS §3 Determinism.
- **Problem:** IEC SI uses M^0.02, IEC 60076-7 uses ^0.8 / ^1.6 and 2^((θ−98)/6), and the swing/thermal exponentials use exp. All need deterministic exp/log, not just "e.g.". Custom implementations need their own accuracy tests against reference values. `Intl` number formatting is display-only and must not feed state.
- **Fix:** List which models need exp/log/pow and add accuracy tests (e.g., max ULP error vs a reference) to Engine v1.

### R1-24 — Minor — CNAIM expected lives are GB 6.6/11 kV values
- **Location:** SYNTHESIS §7 round-2 list ("RMU 55 y, transformer 60 y").
- **Fix:** Add "(GB DNO assets; not Saudi; hot-climate duty/location factors unknown)", so Heatwave and asset modes do not imply Saudi lives.

### R1-25 — Minor — Two 2020 SAIDI values quoted without reconciling them
- **Location:** SYNTHESIS §1: 112.6 min (FY24 deck) and 111.4 min (ESG report) for 2020.
- **Fix:** Note that the difference is small and source-dependent, and use one series per chart.

### R1-26 — Minor — UFLS step wording
- **Location:** SYNTHESIS §7: "0.2 Hz steps of 5–10 % load".
- **Evidence:** K2-16: "No more than 200 mHz between two UFLS stages"; 5–10 % per step; total 40–45 %; 2012 trade article.
- **Fix:** Write "≤ 0.2 Hz between stages, 5–10 % each, 40–45 % total (GCCIA harmonisation principle, 2012, secondary)".

### R1-27 — Minor — IEEE 1584 "equations not publicly available"
- **Location:** SYNTHESIS §2 rank 8, §3 arc-flash row.
- **Problem:** Third-party implementations (an MIT-licensed `arcflash` Rust crate) and IEEE's calculator exist. The accurate statement is "standard not read; coefficients are IEEE copyright; third-party implementations unverified".
- **Fix:** Reword. The proxy decision can stay. Also forbid mapping proxy values to NFPA 70E PPE categories (06 gameplay idea 1 suggests 1.2/4/8/25/40 cal/cm² colour bands), because that reads as PPE-selection guidance.

### R1-28 — Minor — Status labels on secondary sources
- **Location:** SYNTHESIS §1 (Riyadh climate [V], Wikipedia); §3 IEC 60255 constants (vendor reproductions); NETA (Fluke reproduction); F-gas (national authorities).
- **Fix:** Add a "[V-sec]" (verified-secondary) label, as 11 already does, so readers can tell a standard read from a vendor reproduction.

### R1-29 — Minor — The newest Saudi Grid Code was not read
- **Location:** SYNTHESIS §1 "Grid Code Issue 3 (Dec 2021)".
- **Fix:** Note that the SERA May 2024 edition exists and was not read [K2-03], so the 2021 values may be superseded.

### R1-30 — Minor — Ferroresonance case uses a US overhead cutout context
- **Location:** SYNTHESIS §2 rank 5; 06 §4 and gameplay idea 2 (riser cutouts, hot stick).
- **Problem:** SEC UG networks use RMU fuse-switch combinations whose strikers open all three poles [PR-09]. That removes the classic single-phasing cause on tee-offs. A Riyadh-RMU ferroresonance case would need another mechanism (e.g., an overhead rural 13.8/33 kV spur with cutouts).
- **Fix:** Set the case on an overhead/rural spur or label it a non-Saudi case file.

### R1-31 — Minor — Earth-fault-indicator-only RMUs and the negative-indication rule
- **Location:** SYNTHESIS §2 rank 1.
- **Evidence:** DPS 2004 says RMUs "are equipped with earth fault indicator" (reviewer read it). SSEN allows negative indication only from three-phase FPIs [OP-05 §11.3].
- **Problem:** If SEC units have earth-only indicators, phase-to-phase cable faults give no indication anywhere. This is a strong and realistic mechanic.
- **Fix:** Make FPI type (earth-only vs 3-phase) a per-RMU parameter, defaulting to earth-only per DPS 2004 [V], with the edition caveat.

---

## C. Things checked and found sound
- No fabricated citation was found. Every [V] item traced to a fetched-document claim in a note. The labelling problems are about [D]/[S] items shown as [V] (R1-05, R1-08, R1-28).
- The harmonic-limit correction (4.0 % THD at 13.8 kV; 1.5 % is transmission only) is right and confirmed in the Grid Code text.
- The handling of test-closing in 07 (controller decision, delays, exclusion, duty, fault level) is safe and matches SSEN text the reviewer read. The problem is only how mode 1 scoring could undercut it (R1-03).
- Font licences, ECMAScript exactness of + − × ÷ and sqrt, and the IEC/IEEE curve constants are consistent with the sources.

## D. Verdict

**PASS AFTER FIXES.**

Required before Phase 1 exit:
- R1-01 and R1-02 (employer-data hygiene).
- R1-03 (safety scoring).
- R1-04, R1-05 and R1-06 (value and label correctness, licensing plan).
- R1-07, R1-08, R1-09 and R1-10 (earthing, PQ scope, hot-ambient transformer model).

The remaining Important items (R1-11 to R1-17) can be tracked as Phase 2 design inputs. The Minor items are housekeeping.

---

## E. Re-verification (2026-11-13, after lead fixes; scope R1-01..R1-10 only)

Read: SYNTHESIS v3 (incl. §9), 05-thermal-assets.md, sources/05-th.md, SOURCES.md, 12-sec-distribution-transformer-spec.md, DECISIONS (D-004a, D-005 revised, D-008..D-010), banners in 01/02/03/06/07. Spot-checked SEC 51-SDMS-04 Rev.02 PDF (downloaded, pdftotext).

- **R1-01 — resolved.** The SYNTHESIS cable row now cites SCC p. 82 and NKT. 05 lines 233, 290, 298, 389, 396 and 430 are marked EXCLUDED. TH-10 is flagged in sources/05-th.md and SOURCES.md, and the k cross-check is re-pointed to IEC 60949, SCC and NKT.
- **R1-02 — resolved, with residual cleanup recommended (Minor).**
  - D-004a covers work knowledge, type tests, supplier TCCs, tenders and SEC-internal documents, and the D-004 banner is on 01/02/03/06/07.
  - The original sentences still read literally as requests: 03 OQ4 "owner's supplier data", 06 OQ2 "type-test report of the MRMU/RMU products", 06 l.540 "owner-supplied reference point", 06 l.538/549 UFLS from the owner.
  - The banner overrides them, but they should be struck through so nobody acts on them.
- **R1-03 — resolved.** Hard gates plus a separate non-tradeable safety/asset record (SYNTHESIS rank 1, D-008), including a risk-assessment step.
- **R1-04 — resolved.** Both columns are recorded (RDC20 0.100 and "RAC" 0.130); 0.100 is used for max fault and 0.130 for losses/min fault, and the interpretation is labelled [D].
- **R1-05 — resolved.** The 33-bus value is relabelled [D] + [S], with the paper inconsistency stated.
- **R1-06 — resolved.** Revised D-005: authored feeders are the primary tests, MATPOWER is fetched at test time, the paper is not re-typed, and the pandapower data caveat is stated. The old D-005 (c) text still stands in the file but is marked superseded by the revision.
- **R1-07 — resolved.** Screen I²t check (NKT 7.0 kA vs 22.7 kA) added to the §3 table and Engine v1.
- **R1-08 — resolved.** The low-resistance default is labelled [A], the "Solidly" counter-evidence is shown, and both settings are tested.
- **R1-09 — resolved.** Transmission scope (cl. 2.4.6.2) is stated, and MV/LV flicker and unbalance values are listed.
- **R1-10 — resolved.** SEC 51-SDMS-04 Rev.02 parameters are adopted (D-009).
  - Spot-check confirmed in the PDF: §5.2.1(c) "Design Temperature of 35°C (based on yearly average temperature)", (e) hot-spot 98 °C; §5.2.7 Dyn11; §5.2.8 impedance 4 % / 5 % / 6 %; §5.2.9 rises 45 K top-oil / 50 K winding; Table 4 133 % for 240 / 155 min with hot-spot ≤ 140 °C; 55 °C ambient clause.
  - Note: the spec words (d) as "Temperature-Rise Limits Above 50°C and 45°C Ambient", which is garbled. So the Δθhr = 18 K derivation (98 − 35 − 45) depends on how the rises are referenced. It is correctly labelled [D] and should stay a stated assumption.

**Re-verification verdict: PASS** (all required findings R1-01..R1-10 resolved; one Minor residual cleanup under R1-02).
