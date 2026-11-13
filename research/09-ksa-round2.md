# 09: KSA round 2 (closing gaps from 01-ksa and 06-pq)

Research date: 2026-11-13. Source IDs `[K2-nn]` resolve in `research/sources/09-k2.md`.
Status tags: **verified** = primary text read; **snippet-only** = search snippet/summary only; **uncertain** = conflicting or attribution unclear; **NOT FOUND** = searched, nothing usable.
Items already verified in round 1 (01-ksa, 06-pq) are not repeated except where a newer edition changes or confirms them.

---

## 1. Saudi Arabian Grid Code, 2021 edition

**What was obtained.** The ESMAP RISE copy (titled in search results "The Saudi Arabian Grid Code Updated Version: September 2021") could not be downloaded (403 / Cloudflare at both `rise.esmap.org/data/...` and `/sites/default/...`) [K2-02, snippet-only]. Instead I read SEC/National Grid SA's own **"The Saudi Arabian Grid Code, Issue: 3, December 2021"** (222 pages, PDF created 21 Dec 2021) [K2-01, verified]. The two are probably the same text at different publication stages, but that is **uncertain**; values below are from Issue 3 (Dec 2021).

The SERA May 2024 Grid Code [K2-03] still failed to fetch (503) — **not read**.

### 1.1 Values in Issue 3 (Dec 2021) and comparison with Issue 1 Rev 0 (May 2007)

| Item | 2021 Issue 3 (clause, page) | 2007 value (round 1 [KSA-03]/[PQ-16]) | Change |
|---|---|---|---|
| Scope of §2.4 limits | "TSP shall strive to maintain the Transmission System performance..." pending "Minimum National Power Quality Standards ... (currently under development)" (2.4.1.1, p.33) | same | none |
| Nominal / normal frequency | 60 Hz, R-Y-B counter-clockwise; 59.9–60.1 Hz normal (2.4.2.1, p.33) | same | none |
| Exceptional frequency | 57.0–62.5 Hz; generator bands continuous 58.8–60.5, 30 min 57.5–58.7 / 60.6–61.5, 30 s 57.0–57.4 / 61.6–62.5 Hz (2.4.2.2, p.33–34) | same | none |
| Transmission voltages | 110, 115, 132, 230, 380 kV: normal ±5 %; "30-Minute Range" **±10 %** (2.4.3, p.34) | column "30-Minute Over-Voltage", **+10 %** | **Changed:** column heading and sign now ±10 % (i.e., the 30-min range now also covers −10 %) |
| Harmonics, voltage | User Plant "connected to the Transmission System" shall not impose voltage harmonics above the Connection Agreement limit "or when no such limits are specified there, a Total Harmonic Distortion of 1.5% with no individual Harmonic greater than 1%" (2.4.4.2, p.35) | same wording (2007 p.19) | none |
| Harmonics, current | IEEE 519-1992 unless Connection Agreement says otherwise (2.4.4.3, p.35) | same | none (still cites 1992 edition) |
| Unbalance | User shall not cause phase-to-phase unbalance to exceed 1 % at the Connection Point (2.4.5, p.35) | same | none |
| Voltage fluctuation | ≤1 % for repetitive step changes; up to 3 % for other excursions (2.4.6.1, p.35) | same | none |
| Flicker | Pst 0.8, Plt 0.6, 95th percentile over one week, "at any Connection Point in the Transmission" (2.4.6.2, p.35) | same | none |
| Grounding | ≥110 kV effectively grounded, GFF < 1.4 (2.4.8.1, p.35); exceptions via Connection Agreement (2.4.8.2, p.36) | same | none |
| Fault clearance (primary protection, inception to arc extinction) | 110/115 kV 120 ms; 132/230 kV 100 ms; 380 kV 80 ms; probability of exceedance <1 % (2.5.2.6, p.37) | same | none |
| Breaker-fail | trip adjacent breakers within 300 ms; protection reliability ≥99 % (2.5.2.8, p.37); dependability index >99 % (2.5.2.5) | — (not recorded in round 1) | new to our notes |
| RoCoF withstand | Synchronous units 1 Hz/s; Power Park Modules 2.5 Hz/s; measured over sliding 500 ms (2.5.5.4, p.41) | absent in 2007 text | **New** — added by amendment 14A056 (approved 3 Dec 2014) per the revision chronology (p.217–218) |
| Synthetic inertia | PPM > 25 MW shall be capable of synthetic inertia (2.5.5.5, p.41) | absent | **New** |
| Governor | droop adjustable 2–8 %, normal 5 %; total deadband ≤0.05 Hz; island operation 57.5–60.2 Hz (2.5.5.13, p.42) | droop/deadband present in 2007 (line "Droop and Deadband requirement") — detail not compared | — |
| Renewable LFSM | over-frequency response 60.2–62.5 Hz, droop 2–8 % (normal 4 %) (2.5.5.14); under-frequency response 57–59.8 Hz, droop 2–8 % (normal 4 %) (2.5.5.15) (p.42) | absent | **New** |
| FRT upper envelope | ≤120 % for not more than 1 s, then 30-min range (2.5.5.20–21, p.45) | absent | **New** |
| Distribution Entities: UFLS | Each Distribution Entity arranges automatic low-frequency demand disconnection; Connection Agreement splits demand into "discrete MW blocks with associated Under Frequency Relay settings" (2.5.6.2, p.48); relays at the Connection Point; "one hundred (100)% of the User load may be shed" if TSP requires (2.5.6.3) | same structure (2007 2.5.6.2–3) | none; **stage settings still not in the Code** |
| Distribution Entities: PF | >1.0 MVA contracted load: 0.85 lagging; **0.90 after 5 years and 0.95 after 10 years from 21-10-1433 H** (≈ 8 Sep 2012), reactive tariff per WERA Board Resolution 2/27/23 (2.5.6.4, p.48) | 2007: PF ≥0.85 lag only | **Changed:** stepped PF requirement (0.90 from ≈2017, 0.95 from ≈2022 — date conversion is mine) |
| Reactive compensation | Distribution Entities to compensate at LV close to load (2.5.6.5, p.48) | — | noted |
| Transformer neutral | HV windings ≥110 kV, if star, must have star point brought out for grounding (2.5.6.1, p.47–48) | same | none |
| Contingency plans | TSP plans include UFLS and under-voltage load shedding (4.7.3.9, p.113) | — | no settings given |

Distribution-level content (13.8 kV / 33 kV): the Grid Code text contains **no** 13.8 kV or 33 kV numbers (grep of full text). Distribution limits live in the Distribution Code and SERA PQ Rules (§2 below).

## 2. Harmonic limits at 13.8 kV — resolved

**Round-1 "THD 1.5 %" applies only to the Transmission System (110–380 kV)**, and it is an *emission* limit on what a User's plant may impose at a transmission Connection Point, used only when the Connection Agreement is silent (Grid Code 2007 cl. 2.4.4.2, p.19 [KSA-03]; unchanged in Dec 2021 cl. 2.4.4.2, p.35 [K2-01]). **Do not use 1.5 % for 13.8 kV.** **verified**

**13.8 kV values:**

| Level | THD | Individual | Source | Status |
|---|---|---|---|---|
| 127–380 V | 5.0 % | odd 4.0 % (N<14), 1.5 % (N>14); even 2.0 % | SEC DPS March 2004 §1.5 Table 1.1, p.15 [K2-04] | verified (2004, third-party host) |
| **13.8 kV** | **4.0 %** | **odd 3.0 %, even 1.75 %** | same | verified (2004) |
| 33 kV | 3.0 % | odd 2.0 %, even 1.0 % | same | verified (2004) |
| 380, 230, 132, 115, 110 kV | 1.5 % | 1.0 % | SERA PQ Rules draft Annex 1 Table 5, p.30 [K2-05] | verified (draft) |
| 33–69 kV | 3.0 % | see Tables 7/8 | same | verified (draft) |
| **11 & 13.8 kV** | **4.0 %** | Table 7 (>1 kV ≤35 kV): h5 6.3, h7 4.4, h11 2.7, h13 2.3, h17 1.7, h19 1.5, h23 1.2, h25 1.1, >25: 32.3/n − 0.2; triplen h3 4, h9 1.2, h15 0.3, h21 0.2, >21 0.2; even h2 1.5, h4 0.8, h6 0.6, h8 0.5, h10 0.5, h12 0.4, h14 0.4, h16 0.3, >16: 2.5/n + 0.2 | same, Table 7, p.31 | verified (draft) |
| 230–400 V and 127–220 V | 5.0 % | Table 6 (LV ≤1 kV): h5 7.4, h7 5.5, h11 3.5, h13 3, h17 2.3, h19 2, h23 1.7, h25 1.5, >25: 38.5/n − 0.27; h3 5, h9 1.5, h15 0.4, h21 0.3, >21 0.2; h2 1.5, h4 0.9, h6 0.7, h8 0.6, h10 0.5, >12 0.4 | same, Tables 5–6, p.30–31 | verified (draft) |
| >35 kV ≤69 kV | 3.0 % | Table 8: h5 4.1, h7 2.9, h11 1.9, h13 1.6 ... >25: 20.4/n | same, p.31 | verified (draft) |

- The SERA draft says these tables are "as defined in SAGC and SADC" (cl. 6.7.2), i.e., the 4.0 % at 13.8 kV is the Distribution Code value. THD to the 50th order (6.7.1); measured per IEC 61000-4-7, 10-min values over ≥1 week (6.7.3). **verified (draft)**
- The individual-harmonic values in SERA Tables 6–8 are numerically the IEC 61000-2-2 compatibility levels (LV) and IEC TR 61000-3-6 planning-level style tables (my observation, not stated by SERA).
- **The "DPS amended 2014" snippet** (13.8 kV THD 4.0 %, odd 3.0 %, even 1.75 %; 400/230 V 5.0 %) matches the 2004 DPS Table 1.1 exactly, so the 2014 amendment apparently kept the table and only relabelled LV. The "33 kV 2.0 %" in the snippet is the 2004 **odd-individual** limit at 33 kV, not THD (THD is 3.0 %). The 2014 copy itself was **not** obtained (snippet-only). Conflict resolved as a misread, with medium confidence.

**Other distribution PQ limits (SERA PQ draft [K2-05], new vs round 1):**
- Unbalance: distribution ≤1 % at MV connection point (per SADC), ≤2 % at LV (per IEC 61000-2-2) (cl. 6.8.2). **verified (draft)**. Older DPS 2004 §1.6: NPS ≤2 % of PPS at MV and above (p.15–16) [K2-04]. Conflict: 1 % (SERA/SADC MV) vs 2 % (DPS 2004) — treat 1 % as the current rule.
- Flicker: LV Pst <1, Plt <0.8 (IEC 61000-2-2); **MV Pst <0.9, Plt <0.7** (IEC 61000-3-7) (cl. 6.9.4). **verified (draft)**
- Rapid voltage change: MV 3–5 % (IEC TR 61000-3-7), LV 3.3–6 % (IEC 61000-3-3), depending on repetition rate (cl. 6.10.3). **verified (draft)**
- Dip definition: <90 %, 0.5 cycle to 1 min; ½-cycle RMS; measured over ≥1 year (cl. 6.11). **verified (draft)**
- DPS 2004 §1.8.1: non-repetitive dips (motor starting etc.) ≤7 % and not more than 3 times per day (p.16) [K2-04]. **verified (2004)**

## 3. MV neutral earthing (SEC 13.8 kV) and grid-station transformers

(Round 1 already verified: SEC docs allow "solid or low resistance"; Riyadh actual practice NOT FOUND.)

New this round:
- **Mobile 33/13.8 kV, 20 MVA substations** (56-SDMS-05 Rev 0, 29-01-2013, p.16–17; 56-SDMS-06 Rev 0) [K2-06]:
  - "Vector Group DYn1 or YNyn0 as specified in technical data schedule"; minimum impedance 8 % at 20 MVA; BIL LV 13.8 kV 95 or 110 kV; LV neutral BIL 95 or 110 kV.
  - Data schedule example entry for "System earthing: L.V. (13.8kV)" reads "Solidly or Resistance" with a filled value "Grounding: Solidly".
  - CT schedule includes "800/1A, CLASS: 5P10 — 13.8KV NEUTRAL CT FOR STANDBY E/F + NEUTRAL CURRENT ALARM" and "1200/1A CLASS X ... REF PROTECTION (64N)".
  - **verified** (these are distribution mobile units, not 132/13.8 kV grid-station transformers).
- **132/13.8 kV grid transformers, 67 MVA:** one Scribd document ("67 MVA Multi-Winding Transformer Specs") is described in search results as a four-winding 132-110/33/13.8 kV unit, vector "YN0 yn0 yn0 d1", 13-step off-circuit tap changer, 29.5 % impedance at 132/13.8 kV, designed to National Grid SA spec 53-TMSS-01 [K2-07]. **snippet-only** (Scribd page did not load). The YNyn0 + delta tertiary pattern is consistent with a star-star grid transformer whose 13.8 kV neutral is available for solid or resistance earthing, but that is inference.
- SEC transmission spec numbers seen in an index (pdfcoffee "SEC Standards", not loaded): 53-TMSS-01 power transformers (~2–100 MVA), 53-TMSS-02 (>100 MVA), **52-TMSS-01 grounding transformers 13.8/33/34.5 kV**, **52-TMSS-02 air-core neutral grounding reactors 11–132 kV** [K2-08]. **snippet-only.** The existence of an SEC grounding-transformer spec at 13.8 kV implies some 13.8 kV buses are fed from delta windings and earthed through a zig-zag/earthing transformer.
- 53-SDMS-01 (SEC distribution power transformer spec, studylib copy, HTTP 429) reportedly lists YNyn0 as standard for 33/13.8 and 34.5/13.8 kV substations [K2-09]. **snippet-only.**
- **SEC 57-SDMS-01 Rev. 00 (April 2017), "Specifications for Neutral Grounding Resistor 11 kV through 34.5 kV for Primary Distribution Substations"** [K2-11] **verified**:
  - Scope: indoor/outdoor NGRs "intended to be used in the Distribution Network of Distribution Sector" of SEC (§1.0).
  - "The resistor shall be rated for 10 seconds unless otherwise specified in the data schedule" (§4.3.4a); dielectric and temperature-rise per IEEE 32 Tables 5 and 6 (data schedule §6.0, item 4.2).
  - Data schedule item 4.2 "System Voltage Rating 15 kV / 34.5 kV"; **"Resistance at 20 °C (Ohms)", "Initial Fault Current (A)", "Fault Current Duration (s)" are left blank** — set per enquiry/project. Enclosure earthing sized "for substation fault current level of 40 kA and below" (§4.3.3e).
  - So: SEC *does* buy NGRs for 13.8 kV primary substations (a standard spec exists), confirming resistance earthing is a real, not hypothetical, option. **The standard ohmic value / earth-fault current limit is NOT in the public spec.**
- **NER ohmic value / earth-fault current limit for SEC 13.8 kV: NOT FOUND** in any primary source. Generic (non-SEC) guidance: 13.8 kV LRG at 400 A ≈ 20 Ω (vendor blog, not used).

## 4. SEC reliability (SAIDI/SAIFI) and customers by region

| Year | SAIDI (min/customer) | SAIFI (interruptions/customer) | Source | Status |
|---|---|---|---|---|
| 2017 | 190.88 | — | SEC 2020 ESG Report p.53 ("customer average service interruption duration") [KSA-15] | verified (round 1) |
| 2018 | 174.47 | — | same | verified (round 1) |
| 2019 | 149.75 | — | same | verified (round 1) |
| 2020 | 111.41 (ESG) / **112.6** (FY24 deck) | **2.61** | SEC FY2024 Results Presentation, 6 Mar 2025, slide 11 "SAIDI & SAIFI" chart [K2-12] | verified (chart labels; values read from extracted chart text, column order 2020/2023/2024 as labelled) |
| 2023 | **78.6** | **1.71** | [K2-12] slide 11 | verified (chart) |
| 2024 | **68.5** (−13 % YoY) | **1.47** (−14 % YoY) | [K2-12] slide 11 | verified (chart) |
| 2024 | "17% Improvement in SAIDI", "19% Improvement in SAIFI" | | SEC Annual Report 2024 (Business Review highlights) [K2-13] | verified — **conflicts** with −13 %/−14 % in [K2-12]; the annual report also says "Improved SAIDI-D and SAIFI-D", so the 17/19 % may be distribution-only indices while the deck's are system-wide. Unresolved. |
| 2025 target | 61 min | 0.70 | [K2-12] slide (ESG strategy: "61 SAIDI min/customer by 2025", "Achieve 0.70 SAIFI by 2025"); repeated in AR 2024 [K2-13] | verified |
| 2025 actual | −7 % | −15 % | Saudi Energy FY2025 results press coverage (TradeArabia, Mar 2026) [K2-14] | snippet-only, no absolute value |
| 9M 2026 | 37.17 min | — | round 1 [KSA-27] | snippet-only |

- Ambition: AR 2024 says SEC targets "third place in the System Average Interruption Duration Index (SAIDI) and seventh place in the ... (SAIFI) among G20 nations" by 2030 [K2-13]. **verified**
- Whether planned outages / major event days are excluded: **NOT FOUND**. ECRA/SERA regulatory SAIDI/SAIFI booklets with per-region values: **NOT FOUND** this round.
- Implied CAIDI (my arithmetic): 2024 68.5 / 1.47 ≈ **47 min**; 2023 78.6/1.71 ≈ 46 min; 2020 112.6/2.61 ≈ 43 min.

**Customers by region, end-2024** (SEC Annual Report 2024, "Where We Operate" map, p.10 of PDF) [K2-13]:

| Region (cities listed in AR) | Customers served | Electricity sold (GWh) |
|---|---|---|
| Central (Riyadh City and suburbs, Al-Qassim, Al-Kharj, ...) | 3,642,276 | 104,486 |
| Western (Makkah, Jeddah, Madinah, ...) | 3,847,000 | 96,864 |
| Eastern (Dammam, Al-Ahsa, Northern Borders, Al-Jawf, ...) | 2,045,882 | 88,024 |
| Southern (Aseer, Jizan, Najran, Al-Bahah) | 1,779,988 | 34,246 |
| Total | 11,315,146 (AR headline "11.32M") | 323,620 |

- Status: numbers **verified**; the **region-to-number mapping is uncertain**: the values sit in map callouts and I assigned them by callout position (left = Western, right = Eastern, lower-left = Southern, lower-right = Central) and cross-checked against the AR's regional sales revenue table (2024, SAR thousand: Central 22,747,940; Western 20,332,832; Eastern 16,467,082; Southern 7,125,506 — Central highest, Southern lowest, consistent). The totals match 11.32 M customers and ≈324 TWh sales.
- A Riyadh-city-only customer count: **NOT FOUND**.

## 5. Saudi UFLS stages

- Grid Code Dec 2021 (and Feb 2022 update) still delegates UFLS blocks and relay settings to Connection Agreements (2.5.6.2–2.5.6.3) and lists UFLS/UVLS among TSP contingency plans (4.7.3.9) [K2-01][K2-15]. **No stage frequencies in the Code. verified.**
- **59.2 Hz first stage — attribution now resolved:** T&D World, "Super Grid Increases System Stability", Ahmed Ali Ebrahim (GCCIA), 1 May 2012: "The first UFLS threshold of the 60-Hz side (Saudi Arabia) is set to 59.2 Hz", vs 49.3 Hz on the 50 Hz side; harmonised GCC rules "No more than 200 mHz between two UFLS stages", "minimum of 5% of total load each 200-mHz steps and a maximum of 10%", "global load shedding amount between 40% and 45% for each country", extra stages below 48.3 Hz per country [K2-16]. **verified (secondary, trade magazine, 2012 — may be outdated).** Round-1 [KSA-39] attribution to the Cardiff paper is superseded.
- **Conflicting value:** Alqahtani, Shaher, Garada, Cipcigan, *Electronics* 2023, 12, 1470 (Cardiff ORCA 157906) reportedly says relays "begin to operate at 59.6 Hz under-frequency load shedding (UFLS)" citing the Grid Code [K2-17]. **snippet-only** (403 on ORCA and MDPI). The Grid Code text read (2007, 2021, 2022) contains no 59.6 Hz UFLS setting, so this looks like the paper's own assumption. **uncertain.**
- Full Saudi stage table (Hz, % per block, time delays): **NOT FOUND.** Game: keep a configurable placeholder, e.g., first stage 59.2 Hz and ≤200 mHz steps of 5–10 % load to a total 40–45 % (GCCIA harmonisation principle), labelled "illustrative".

## 6. LV earthing type

- **SBC 401 (Saudi Electrical Code)** — a 141-page bilingual copy (PDF mod. date Sept 2018, hosted on rashud.com) defines TN, TN-S ("separate protective conductor and neutral throughout"), TN-C-S ("combines neutral and protective functions in a single conductor in part of the system"), TN-C, TT and PEN; it is IEC 60364-based and treats TN and TT as both permissible (definitions §, Arabic text) [K2-18]. **verified (definitions only; host is third-party; edition uncertain).**
- PCIC Middle East 2022 paper SA22_68 (C. A. Gupta, SABIC) on SBC 401: disconnection times per SBC 401 Art. 41 aligned with IEC 60364-4-41 (0.4 s final circuits ≤32 A in TN; RCDs preferred for TT); its worked cases are TN-S and TT industrial installations [K2-19]. **verified** — but it says nothing about what SEC supplies.
- SEC EVCS connection standard (2023 copy) and SEC PV connection standard v3.2: no earthing-system (TN/TT) designation found by text search [K2-20][KSA-01]. **verified absence.**
- **Official statement that SEC supplies TN-C-S (PME-like) vs TT: NOT FOUND.** Round-1 inference stands: SEC distribution practice (Dyn11, LV neutral solidly earthed, multiply earthed at poles and consumer [KSA-05]) behaves as TN-C(-S); consumer installations designed to SBC 401 commonly use TN-S/TN-C-S downstream (vendor blogs, low reliability). Use "TN-C-S (inferred)" in the game, flagged.

---

## 7. Additional notes

- **Grid Code editions seen this round:** Issue 1 Rev 0 May 2007 [K2-10]; "2nd Electronic Update as of October 2016" (se.com.sa, not read); ESMAP "Updated Version September 2021" [K2-02] (not read); Issue 3 Dec 2021 [K2-01] (read); **February 2022 update, 238 pp.** [K2-15] (read: §2.4.3 table "Normal Range ±5 %, 30-Minute Range ±10 %"; §2.4.4.2 THD 1.5 %/1 % identical; UFLS clause identical); SERA May 2024 [K2-03] (not read). The harmonic, flicker, unbalance and fault-clearing numbers were unchanged across 2007 → Feb 2022.
- No alfanar documents were used.

## Implications for the game model (updates to 01-ksa table)

| Parameter | Proposed value | Confidence | Basis |
|---|---|---|---|
| Voltage THD limit at 13.8 kV bus | **4.0 %** (individual odd 3.0 %, even 1.75 % per DPS; or per-order IEC-style Table 7 per SERA draft) | High | [K2-04][K2-05] |
| Voltage THD at 400/230 V | 5.0 % | High | [K2-04][K2-05] |
| Voltage THD at 132 kV (grid infeed) | 1.5 %, individual 1 % (emission default) | High | [K2-01] |
| MV unbalance | 1 % at MV connection point (SERA/SADC); LV 2 % | Medium (draft) | [K2-05] |
| MV flicker | Pst 0.9 / Plt 0.7; LV 1.0 / 0.8 | Medium (draft) | [K2-05] |
| Transmission 30-min voltage range | ±10 % (was +10 % in 2007) | High | [K2-01][K2-15] |
| Customer PF (>1 MVA) | 0.95 lagging now (stepped from 0.85 → 0.90 → 0.95) | High | [K2-01] |
| 132/13.8 kV transformer | 67 MVA, YNyn0 (+ delta tertiary), Z ≈ 29.5 % on rating — use as illustrative | Low (snippet) | [K2-07] |
| 13.8 kV neutral earthing | Solid or NER (SEC has a 10-s-rated NER spec for primary S/S); NER current: owner input | Medium | [K2-06][K2-11] |
| SAIDI / SAIFI "SEC 2024 benchmark" | 68.5 min / 1.47 int.; CAIDI ≈ 47 min; target 61 min / 0.70 | High (chart values) | [K2-12] |
| Region scale | Central ≈ 3.64 M customers, 104.5 TWh (2024) | Medium (mapping inferred) | [K2-13] |
| UFLS | First stage 59.2 Hz, ≤0.2 Hz steps, 5–10 % each, total 40–45 % — illustrative | Low–medium | [K2-16] |

## Open questions / NOT FOUND (round 2)

1. SERA Grid Code May 2024 text — fetch failed (connection reset/503).
2. ESMAP "Sept 2021" copy — 403; assumed equivalent to Issue 3 Dec 2021 (uncertain).
3. SEC 13.8 kV NER ohms / earth-fault current limit; actual Riyadh grid-station practice — NOT FOUND (57-SDMS-01 leaves it blank). Ask the owner.
4. 53-TMSS-01 and 52-TMSS-01 text; confirm 67 MVA / YNyn0d / 29.5 % — snippet-only.
5. Saudi UFLS stage table — NOT FOUND; 59.6 Hz (paper) vs 59.2 Hz (GCCIA article) unresolved.
6. SAIDI 17 %/19 % (AR, "SAIDI-D/SAIFI-D") vs 13 %/14 % (results deck) — definitions differ? Unresolved. Planned-outage inclusion unknown. Region-level SAIDI NOT FOUND.
7. Official SEC/SBC statement of the public LV supply earthing type (TN-C-S vs TT) — NOT FOUND.
8. DPS 2014 amendment (Scribd 701390368 "DPS-Ammendment") not loaded; values assumed equal to DPS 2004 Table 1.1 based on the snippet match.
