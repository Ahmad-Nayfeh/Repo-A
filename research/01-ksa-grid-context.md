# 01: KSA / Gulf power-system context for a Riyadh-area distribution model

Research date: 2026-11-13. Source IDs `[KSA-nn]` resolve in `research/sources/01-ksa.md`.
Status tags: **verified** means I read the primary text. **snippet-only** means I saw only a search snippet. **uncertain/conflicting** means sources disagree or the attribution is unclear.

Caveat on currency: several of the richest primary documents I could read are old. The SEC Distribution Planning Standard dates from March 2004 [KSA-02] and the Grid Code from May 2007 [KSA-03]. Newer editions exist: Grid Code 2021 [KSA-29], SERA Grid Code May 2024 [KSA-30], and Distribution Code Issue 03 Rev 02 of Oct 2018 [KSA-01]. Downloads of those newer editions were blocked. Where a newer verified document repeats an old number, I say so.

---

## 1. System frequency

| Fact | Value | Source | Status |
|---|---|---|---|
| Nominal frequency | 60 Hz | Grid Code 2007 §2.4.2.1: "nominal frequency of 60 Hz and R-Y-B counter-clock-wise phase rotation" [KSA-03]; SERA PQ Rules §6.6.1 [KSA-04]; DPS §1.4.1 [KSA-02]; every SEC equipment spec read lists 60 Hz [KSA-07][KSA-10] | verified |
| Normal operating band (transmission) | 59.9–60.1 Hz | Grid Code 2007 §2.4.2.1: "maintain it within the limits of 59.9 and 60.1 Hz during normal Grid operation" [KSA-03]. Repeated in the SERA PQ Rules draft (c. 2025) §6.6.1 [KSA-04] | verified |
| Normal band, distribution not interconnected to transmission | 59.9–60.1 Hz | SERA PQ Rules §6.6.2 [KSA-04] | verified (draft) |
| DPS 2004 bands | Maximum permissible operating range 59.8–60.2 Hz; preferred 59.9–60.1 Hz | DPS §1.4.2 [KSA-02] | verified (old doc) |
| Exceptional range | 57.0 Hz to 62.5 Hz | Grid Code §2.4.2.2: "could rise to 62.5 Hz or fall to 57.0 Hz in exceptional circumstances" [KSA-03] | verified |
| Generator time-banded capability | 58.8–60.0 and 60.0–60.5 Hz continuous; 57.5–58.7 and 60.6–61.5 Hz for 30 min; 57.0–57.4 and 61.6–62.5 Hz for 30 s | Grid Code §2.4.2.2 table [KSA-03]. The same table is reused for small PV in SEC's PV connection standard, Table 1 [KSA-01] | verified |
| PV interface protection defaults | 81> 62.5 Hz at 0.1 s; 81< 57.5 Hz at 1800 s; 81<< 57 Hz at 30 s; RoCoF 2.5 Hz/s | SEC PV standard v3.2 (2020) [KSA-01] | verified |
| PV over-frequency droop | Threshold 60.2 Hz default, droop 3.83% default | [KSA-01] §6.7.1 | verified |
| First UFLS stage, Saudi side | 59.2 Hz | Paper snippet [KSA-39] | snippet-only; attribution uncertain |
| PQ measurement | Frequency evaluated per 10-s period over at least 1 week (IEC 61000-4-30) | [KSA-04] §6.6.3 | verified (draft) |

**History (was the western region on 50 Hz?)** NOT FOUND. Two targeted searches turned up no source saying that any Saudi region, Western Region included, ran at 50 Hz or went through a conversion. All sources describe Saudi Arabia as 60 Hz and its GCC neighbours as 50 Hz [KSA-19][KSA-20]. Before 2000 the grid was organised as regional SCECOs (central, eastern, western, southern), each with its own grid, and only central and eastern were interconnected (snippet-only, projectfinance.law, not fetched). Do not put a 50 Hz history claim in the game.

## 2. MV distribution and transmission voltages

**Distribution (MV)**
- Standard MV voltages are **13.8 kV and 33 kV**. Existing but non-standard voltages are **11 kV and 34.5 kV**. DPS Table 1.2 marks 11 and 34.5 kV "* Existing voltage, but non-standard voltage" [KSA-02], and the SERA PQ Rules draft lists 11 and 34.5 kV as "Non-standard Voltage levels defined in the Distribution Code" [KSA-04]. SEC's GIS switchgear spec covers "11, 13.8, 33 & 34.5 kV" [KSA-09]. The PV standard states "The MV Distribution System nominal voltages in KSA are 13.8 and 33kV" [KSA-01]. **verified**
- **69 kV** appears as a standard Distribution Code level in the SERA PQ draft (65.5–72.5 kV) [KSA-04]. DPS 2004 §2.1 says MV planning covers 33/13.8 kV plus 34.5 and 11 kV, and "(69 kV is not included)" [KSA-02]. **verified, but its role and region are unclear.**
- Service-voltage limits (DPS Table 1.2; the same values appear in the Distribution Code table quoted by [KSA-01] and [KSA-04]) are ±5%:

| Nominal | Lowest | Highest |
|---|---|---|
| 220/127 V | 209/120 V | 231/134 V |
| 380/220 V | 360/209 V | 400/231 V |
| 400/230 V | 380/218.5 V | 420/241.5 V (from the 2018 Distribution Code via [KSA-01][KSA-04]; not in DPS 2004) |
| 11 kV* | 10.45 kV | 11.55 kV |
| 13.8 kV | 13.1 kV | 14.5 kV |
| 33 kV | 31.4 kV | 34.7 kV |
| 34.5 kV* | 32.78 kV | 36.23 kV |
| 69 kV | 65.5 kV | 72.5 kV ([KSA-04] only) |

- Utilization voltage (at the furthest customer point) is −7.5% / +5%, e.g. 13.8 kV gives 12.8–14.5 kV and 380/220 V gives 352/203–400/231 V (DPS Table 1.4) [KSA-02]. **verified (2004)**
- The voltage-drop allocation in DPS Table 1.3 [KSA-02] **verified (2004)**:
  - substation regulator bandwidth 1.0%
  - MV primary feeder 1.5%
  - distribution transformer 2.5%
  - LV secondary feeder 3.5%
  - service 1.5%
  - total service drop 10%, plus customer wiring 2.5%, giving 12.5%
  - distribution transformers carry a built-in +5% boost from the ratio

**Riyadh / Central region**
- Riyadh distribution grid stations are **132/13.8 kV**. Many tender and award items name them: Expo 2030 (3 stations), King Khalid Int'l Airport, Al-Sharafiyah-2 #8407, Al Malqaa #8278 (indoor GIS), King Salman Park #8387–8390, and Bader #8131 "132/13.8kV, 3x67MVA" [KSA-31]. **snippet-only, but many independent items agree.** Bulk points in Riyadh are 380/132 kV (Al Remal) [KSA-32] **snippet-only**.

**Other regions**
- Western (Madinah/Jeddah area, SEC-WR): "380/110 kV bulk supply stations, feeding local 110/13.8 kV substations through mostly underground cable circuits" [KSA-24]. **verified**
- Eastern: East Dammam is listed as 380/115/13.8 kV [KSA-32]. **snippet-only**
- Makkah: Al Fardous 380/230/115 kV; Jeddah North Airport 380/132/13.8 kV [KSA-32]. **snippet-only**
- A clean region-by-region table of where 33 kV is used versus 13.8 kV: **NOT FOUND.** DPS 2004 says rural areas should use "the highest MV available in the area", radial and overhead [KSA-02]. One SEC spec covers 33/13.8 kV mobile substations [KSA-10], which implies some 33 kV networks feed 13.8 kV, but no source states where.

**Transmission**
- Grid Code 2007 §2.4.3 lists **110, 115, 132, 230 and 380 kV**. Each is ±5% normal, with +10% allowed for no more than 30 min [KSA-03]. **verified.** The SERA PQ draft repeats the same five levels at ±5% [KSA-04].
- The system at 110 kV and above is "effectively grounded with specified Ground Fault Factor below 1.4" (§2.4.8.1) [KSA-03]. **verified**
- Primary-protection fault clearance limits: 120 ms at 110/115 kV, 100 ms at 132/230 kV, 80 ms at 380 kV (§2.5.2.6) [KSA-03]. **verified**
- 69 kV as a *transmission* level: NOT FOUND in the Grid Code list. It appears only as a Distribution Code level [KSA-04].

## 3. LV system, voltage conversion, plugs, earthing

- LV nominal systems in KSA are **400/230 V, 380/220 V and 220/127 V** [KSA-01] **verified**. SEC's PV standard Annex C shows three LV configurations: 3-phase 4-wire 400/230 V, 3-phase 4-wire 220/127 V, and 3-phase 3-wire 220 V [KSA-01]. **verified.** SEC's 2004 unit-substation spec gives secondary voltages of **231/133 V or 400/231 V** [KSA-06], and the 2017 mobile substation spec gives LV 400/231 V [KSA-11]. **verified**
- **Conversion decision:** Council of Ministers resolution dated **20/9/1431 H (c. 30 Aug 2010)** changes residential and commercial distribution from 127/220 V to **230/400 V**, for new areas and new subscribers. **uncertain/conflicting on the resolution number:**
  - **No. 324** per the Bureau Veritas translation of the MoCI decision [KSA-17]
  - **No. 425** per the SASO campaign page [KSA-16]
- **Conversion timing:** existing areas convert over **25 years** [KSA-18] (The National; verified page, article date not shown). SASO says the 127 V phase-out follows a "10-year introductory period" [KSA-16].
- **Product rules (MoCI decision transmitted 2011/2012)** [KSA-17] **verified**:
  - stop importing 127 V-only products (effective 1/7/1433 H)
  - dual 127/220 V and 220 V products allowed for 5 years
  - after 10 years, only 230/400 V products
  - 3-phase appliances must be 230/400 V
  - 127 V spare parts allowed for 15 years
- **SEC planning:** SEC revised its distribution planning standards in 2011 for 400/230 V [KSA-33]. **snippet-only**
- **Plugs:**
  - SASO 2203/2003, "Plugs and Socket-Outlets for Household and Similar General Use – 220V", is based on **BS 1363** (13 A). This is the British 3-rectangular-pin type, called "Type G" in common usage; SASO itself does not use "Type G".
  - SASO 2204 is the 127 V standard (15 A, US-style, based on UL 498).
  - GSO adopted 2203 and 443 as GSO 1840/1841 [KSA-16]. **verified**
  - A newer SASO 2203 edition (2015) adapted to 400/230 V [snippet in search results only]. **snippet-only**
- **LV earthing system:**
  - SEC overhead practice: distribution transformers are **Dyn11** with the "secondary side ... solidly grounded and connected with MV grounding". The LV is "a 4-wire system and system neutral is multiply grounded at each pole and at consumer location" (SDCS-03 Rev.03, 2023) [KSA-05]. **verified**
  - LV neutral is "Solidly grounded" in the unit-substation and mobile-substation specs [KSA-06][KSA-11]. **verified**
  - A multiply-earthed combined neutral is functionally a TN-C(-S)/PME-type supply. That is my inference; no SEC or SASO document read uses the IEC "TN-C-S" label.
  - A vendor blog claims TN-C-S is most common in Saudi residential buildings, while another vendor page says TN-S or TT [KSA-40]. **snippet-only, low reliability.** No official SEC or SBC 401 statement was found: **NOT FOUND.**
  - SDCS-03 also gives maximum ground resistance: 5 Ω for system ground, distribution substations and surge arresters, and 20 Ω for MV/LV poles [KSA-05]. **verified**

## 4. MV distribution topology and equipment (SEC practice)

**Configuration** (DPS 2004 §2.2.3–2.2.5) [KSA-02] **verified (2004)**:
- "Single loop system shall be considered as the most-preferred SEC feeder configuration". This is two radial feeders "looped between two neighboring grid stations if possible", or else between different buses of the same grid station. The network "shall be operated radially" (open loop with a normally open point, NOP).
- Tee loop: three feeders sharing the load, which allows each feeder to carry about 1.5× its single-loop load. Option 1 (three equal feeders) is preferred; Option 2 (two full feeders plus an express backup) is "non-preferred", interim only.
- Do not connect more than three feeders in an open loop. Radial supply is for rural areas and bulk customers, who get loop supply only if they pay for it.
- **Feeder loading:** single-looped feeders at **50%**, tee-looped at **65%** of the cable normal rating.
- **Feeder length:** "feeders on MV should not exceed **7.5 Km for 13.8 kV** in length up to the normal open point."
- NOP placement factors include load balance, grid-station loading, VIP customers, voltage drop, district boundaries, accessibility and losses. A loop may have different NOPs for summer and winter peaks.
- **Contingency:** plan for first-level contingencies only, meaning one power transformer, one bus section or one feeder segment. Grid station load must not exceed firm capacity on an N-1 basis. Contingencies on distribution transformers or the LV network are not planned for. Customers above 8 MVA are supplied from a grid station if feasible. Above 1 MVA counts as a "bulk customer" supplied at MV.
- Demand factors (Table 2.1): residential 0.5; shops and offices 0.6; government, hospitals and schools 0.8; mosques and street lights 0.9; industrial 0.9; agriculture 0.9.
- Rural load estimate: 5 kVA per customer.

**Distribution substations** [KSA-02][KSA-06] **verified**:
- The package unit substation (RMU + transformer + LV board in one unit) is "the preferred type and commonly used substation in SEC". Ratings: 500 kVA (6/8 LV outlets), 1000 kVA (8/12) and 1500 kVA (8/16), all 13.8/0.23/0.4 kV.
- Underground transformer sizes are 300/500/1000/1500 kVA, with 4/8/12/16 LV feeders. Pole-mounted sizes are 50/100/200/300 kVA.
- Transformers are loaded to no more than 100% of nameplate, and reinforcement is planned at 80%.
- The 13.8 kV unit-substation spec covers 300/500/1000/1500 kVA, with secondary 231/133 or 400/231 V [KSA-06].
- Customers above 400 A 3-phase must provide a transformer room.

**RMUs**:
- 32-SDMS-04 (2008, motorized) [KSA-07] **verified**:
  - 13.8 kV service, 17.5 kV max, 60 Hz
  - ring switches 400 A, 21 kA 1 s, making 50 kA peak
  - BIL 95 kV, internal arc 20 kA 1 s
  - tee-off is a breaker
  - the protection relay must be "suitable for solidly / low resistance grounded system"
- 32-SDMS-01 Rev.03 (2022, non-extensible SF6 RMU) [KSA-08] **verified**: 400 A; internal-arc test "for 13.8 kV system for 21 kA for 1 second"; tee-off in the middle.
- In DPS 2004 the RMU is two load-break switches plus one fused switch, with an earth fault indicator [KSA-02].

**Cables** [KSA-02] **verified (2004)**:
- Rating conditions (Appendix A):
  - ground ambient **35 °C** at ≥1 m
  - soil thermal resistivity **2.0 K·m/W**
  - XLPE 90 °C continuous, 250 °C short-circuit (5 s max)
  - loss load factor 0.8 (equivalent load factor 0.88)
  - burial depth 1.0 m, 0.30 m circuit spacing
  - ratings derived from IEC 287 (1982)
- 13.8 kV direct-buried normal ratings:

| Cable | Rating |
|---|---|
| 3×300 mm² Cu | 390 A, 9 MVA |
| 3×185 mm² Cu | 290 A, 7 MVA |
| 3×120 mm² Cu | 240 A, 6 MVA |
| 3×300 mm² Al | 300 A, 7 MVA |
| 3×70 mm² Al | 140 A, 3 MVA |
| 1×630 mm² Cu | 570 A, 14 MVA |

- 13.8 kV impedances:

| Cable | Rac 20 °C (Ω/km) | X1 at 60 Hz (Ω/km) |
|---|---|---|
| 3×300 Al | 0.130 | 0.108 |
| 3×185 Cu | 0.129 | 0.116 |
| 3×300 Cu | 0.0808 | 0.108 |

- 33 kV: 3×240 Cu is 350 A, 20 MVA; 3×185 Cu is 290 A, 17 MVA.
- LV (4-core Al): 4×300 is 310 A, 204 kVA at 380 V; 4×185 is 230 A; 4×500 is 400 A. The LV network uses 300 mm² Al XLPE from the substation to distribution cabinets.

**Short-circuit design levels** (DPS 2004 Table 4.1, 1 s) [KSA-02] **verified (2004)**:
- 33 kV: 25 kA / 1560 MVA
- 13.8 kV: 20 kA / 527 MVA
- 380 V interface: 20 kA (<500 kVA), 30 kA (>500 kVA)
- 220 V interface: 21 kA (<152 kVA), 45 kA (>152 kVA)
- Equipment specs use **21 kA 1 s** at 13.8 kV [KSA-07][KSA-08] and 25 kA 2 s for mobile 33/13.8 kV substations [KSA-10].

**MV neutral earthing** **verified**:
- Every SEC document read allows **either solid or low-resistance** grounding at the HV/MV substation:
  - SDCS-03: "MV neutral of power transformers is grounded solidly or thru low resistance at HV/MV substations" [KSA-05]
  - unit substation spec: "MV neutral arrangement: Solidly grounded or low resistance" [KSA-06]
  - mobile substations: "Solidly Grounded or Resistance Grounded as specified in Data Schedule" [KSA-10][KSA-11]
  - GIS spec data schedule item "Type of Upstream Neutral Grounding (Solidly grounded, resistance grounded)" [KSA-09]
- MV overhead lines are 3-wire, with a continuous ground wire grounded at the terminal pole and every fifth pole [KSA-05].
- **NOT FOUND:** which method Riyadh grid stations actually use, and the resistor value or earth-fault current limit.

**Scale of the SEC distribution system** [KSA-13][KSA-14] **verified**:

| Item | 2023 | 2024 | Q3 2025 |
|---|---|---|---|
| Distribution network | 765,641 c·km | 805,835 c·km | 840,249 c·km |
| Distribution transformers ("distribution substations") | 645,321 | 697,068 | 708,461 |
| Distribution transformer capacity | 351,509 MVA | 378,624 MVA | — |
| Customers | 11.0 M | 11.3 M | 11.5 M |
| Distribution automation | — | 36.4% | 39.3% |

- *Derived, by me:* the 2024 average distribution transformer is 378,624 MVA / 697,068 ≈ **0.54 MVA**, and there are about **16 customers per transformer** (11.3 M / 697 k).
- SEC targets 40% distribution automation "from 2025 onward" [KSA-13].
- **NOT FOUND:** public SEC figures on typical urban feeder length or loading, beyond the DPS planning limits above.

**SDMS public titles verified in this session**:
- 32-SDMS-01 Rev.03 (non-ext. SF6 RMU 17.5 kV, 2022)
- 32-SDMS-04 (motorized non-ext. SF6 RMU 17.5 kV, 2008)
- 32-SDMS-09 Rev 0 (GIS metal-clad MV switchgear 11/13.8/33/34.5 kV, 2013)
- 56-SDMS-01 Rev.01 (13.8 kV unit substations, 2004)
- 56-SDMS-05 Rev 0 (two-trailer mobile S/S 33/13.8 kV, 2013)
- 56-SDMS-06 Rev 0 (single-trailer mobile S/S 33/13.8 kV, 2013)
- 56-SDMS-08 Rev 00 (MV/LV mobile substation, 2017)
- 31-SDMS-13 Rev 00 (ATS for LV network, 2016)
- 15-SDMS-01 (OHL porcelain insulators, 1423 H)
- SDCS-02 (UG construction, 2016)
- SDCS-02-01 Rev.01 (UG concrete foundations, 2019)
- SDCS-03 Rev.03 (OH grounding, 2023)

01-SDMS-01 "General Requirements for All Equipment/Materials" is referenced by all of them for system parameters, but I could not retrieve it (**NOT FOUND**).

## 5. Climate and environment

- **SEC standard service conditions** (PV standard Annex D, "amended to date", 2020) [KSA-01] **verified**:
  - outdoor ambient −5 °C min / **55 °C max**; hottest-month average 40 °C; yearly average 30 °C
  - indoor 25 °C (air-conditioned) / 40 °C (no AC)
  - ground ambient 40 °C
  - RH max 100%
  - exposed surfaces 75 °C from solar radiation
  - soil thermal resistivity **2.0 °C·m/W** at ≥1 m
  - soil corrosive with salt deposits; soil pH 7.0–8.5
  - ESDD **0.3–0.5 mg/cm²** (6-month build-up)
  - H₂S 0.03 ppm
  - rainfall 150 mm/yr
  - wind 150 km/h
  - solar 1000 W/m²
  - isokeraunic level 10/15/50 storm-days/yr
- **Equipment specs:**
  - outdoor/mobile equipment designed for 55 °C ambient [KSA-10][KSA-11]
  - indoor GIS design ambient 40 °C, operating −5 to 55 °C "under dusty, dry climate" [KSA-09]
  - **Conflict:** cable ground ambient is 35 °C in DPS 2004 Appendix A [KSA-02] but 40 °C in the 2020 service conditions [KSA-01]. Both use ρ = 2.0 K·m/W.
- **Riyadh climate** (Wikipedia table citing NOAA 1991–2020) [KSA-21] **verified, secondary**:
  - record high 49.8 °C (Riyadh Old; 48.8 °C at Riyadh New)
  - mean daily max Jun 42.7 / Jul 43.4 / Aug 43.6 °C
  - record low −5.4 °C
  - 99.9 mm rain/yr
  - mean RH 10% in July, 47% in January
  - dust storms can cut visibility below 10 m (e.g. 1–2 Apr 2015, schools closed and flights cancelled)
- **Coastal pollution** (Eastern Province, SEC-ERB 2002) [KSA-23] **verified**:
  - ESDD specified at 0.3 mg/cm² inland and 0.50 mg/cm² coastal
  - minimum specific creepage 40 mm/kV, with tension strings at 48–50 mm/kV
  - "flashovers have occurred inspite of regular hot line washing ... even at a specific creepage distance of 40 mm/kV"
  - wash interval 2 months on the coast to 1 year inland
  - INMR gives a preliminary ESDD of 0.55 mg/cm² coastal [KSA-34] (snippet-only)
  - Jeddah/Red Sea-specific distribution data: **NOT FOUND**
- **AC-driven load** **verified**, Eastern Province SCADA [KSA-22]:
  - residential load peaks around **3 PM**, minimum around 6 AM
  - seasonal peak May–July
  - usage rises more than 130% from February to June
  - AC is about **62%** of summer residential load and 11% in winter; the authors say SEC reported a similar percentage
- **AC-driven load, other sources** (snippet-only):
  - Central Region summer peak period 1 PM–5 PM [KSA-37]
  - AC 60–70% of residential summer energy [KSA-38]
- **SEC load factor** = 0.46 (annual, "determined by reviewing the load history of the Operating Areas"), giving a loss factor of 0.23 (DPS 2004 §loss evaluation) [KSA-02]. **verified (2004)**

## 6. Reliability, demand, interconnection, renewables

**Reliability**
- **SEC average interruption duration** (a SAIDI-type metric, min/customer) [KSA-15] **verified**:

| Year | min/customer |
|---|---|
| 2017 | 190.88 |
| 2018 | 174.47 |
| 2019 | 149.75 |
| 2020 | 111.41 |

  The report labels the metric "Customer average service interruption duration (minutes/customer)" and refers to "Dist. SAIFI, SAIDI" KPIs. It does not say whether planned outages are included.
- SAIDI 37.17 min for **9M 2026** (−16%) [KSA-27]. **snippet-only**
- SAIDI −17% and SAIFI −19% for 2024 [KSA-28]. **snippet-only**, no absolute value
- SAIFI absolute values: **NOT FOUND.** Regulatory SAIDI/SAIFI targets from ECRA/SERA: **NOT FOUND.**

**Peak demand**

| Year | Peak | Source | Status |
|---|---|---|---|
| 2023 | 70.6 GW (+8%) | [KSA-25] | snippet-only |
| 2024 | **74.8 GW** (+5.8%); consumption 324 TWh | [KSA-13] | verified |
| 2025 | 77.08 GW (+3%) | [KSA-26] | snippet-only |

- Total generation capacity connected to the grid was 93.8 GW at Q3 2025 [KSA-14]. **verified**
- The General Authority for Statistics (GASTAT) gives 2024 consumption as 340,430 GWh, against SEC's 324 TWh. This appeared in search snippets only, and the difference in scope is unexplained.

**Regulator naming**
- The Saudi Electricity Regulatory Authority (**SERA**) issues rules under Electricity Law Royal Decree M/44 (16/5/1442 H) and SERA's Charter, Council of Ministers resolution No. 263 (14/5/1442 H) [KSA-04]. **verified**
- Older documents name the "Electricity & Cogeneration Regulatory Authority" (ECRA) [KSA-03]. That ECRA was renamed SERA around 1442 H (2020–21) is my inference from these dates, not a quoted statement.
- SEC now trades as **"Saudi Energy"** [KSA-26][KSA-27]. **snippet-only**

**GCC interconnection**
- The GCCIA grid runs at **400 kV, 50 Hz** and connects to Saudi Arabia's 60 Hz grid through a back-to-back HVDC station [KSA-19]. **verified**
- About 913 km of 400 kV OHL [KSA-19]. **verified**
- Al-Fadhili HVDC is 3 × 600 MW = **1800 MW**, 222 kV DC, commissioned 2009 [KSA-20]. **verified, secondary**

**Renewables** (context only)
- SEC integrated 6.6 GW of renewables by end-2024, and 34.4 GW of renewable capacity is under connection works for 2027 [KSA-13]. **verified**
- Sudair PV is 1500 MW [KSA-35]. **snippet-only**
- NREP targets have been stated as 58.7 GW (2019), 130 GW, and "about 50% of electricity from renewables by 2030" [KSA-36]. **snippet-only, inconsistent wording**

## 7. Codes and public documents

| Document | Edition | Status |
|---|---|---|
| Saudi Arabian Grid Code, Issue 01 Rev 00 | May 2007, prepared by SEC (ECRA copyright); approved by regulator board resolution 28/16/03 dated 1428/06/01 H [KSA-04] | verified [KSA-03] |
| Saudi Arabian Grid Code | 2021 edition | snippet-only [KSA-29] |
| Saudi Arabian Grid Code (SERA) | May 2024 update | snippet-only, fetch failed [KSA-30] |
| Saudi Arabian Distribution Code | Issue 01 Rev 00, Nov 2008; Issue 03 Rev 02, Oct 2018 | citations verified in [KSA-01]; document itself not read |
| Distribution Code approval | Board resolution 29/18/04, 1429/05/02 H | verified [KSA-04] |
| SERA Power Quality Rules and Standards | Public-consultation draft, c. 2025 | verified [KSA-04] |
| SEC Distribution Planning Standard (DPS) | March 2004 (third-party copy); later revisions exist (2011 amendment, "DPS-03 Rev02" on Scribd) | 2004 verified [KSA-02]; later revisions snippet-only |
| SEC "Technical Standards for the Connection of small-scale solar PV systems…" | v3.2, Mar 2020 | verified [KSA-01] |

The Distribution Code text itself (planning clause DPC2.1 frequency and DPC2.2 voltages) was **NOT read**: only Scribd, SlideShare and studylib copies surfaced, and they did not load. One studylib snippet suggests a clause on separating the LV neutral ground from MV equipment grounds, citing 4 m, but this is unverified and conflicts with the SDCS-03 overhead "connected with MV grounding" practice. Treat it as **uncertain**.

---

## Implications for the game model (proposed parameters)

| Parameter | Proposed value | Confidence | Basis |
|---|---|---|---|
| Nominal frequency | 60 Hz | High | [KSA-03][KSA-04] |
| Normal frequency band | 59.9–60.1 Hz | High | [KSA-03][KSA-04] |
| Frequency alarm / exceptional limits | Continuous 58.8–60.5; 30 min to 57.5 / 61.5; 30 s to 57.0 / 62.5 Hz | High | [KSA-03] |
| UFLS first stage | 59.2 Hz (label as "illustrative") | Low | [KSA-39] snippet |
| Grid station (primary substation) | 132/13.8 kV, 3 × 67 MVA transformers, N-1 firm capacity of about 134 MVA | Medium (132/13.8 kV is well attested; 3 × 67 MVA comes from one snippet) | [KSA-31][KSA-02] |
| MV feeder voltage | 13.8 kV, 3-phase 3-wire | High | [KSA-01][KSA-02] |
| MV voltage limits | 13.1–14.5 kV (service); 12.8 kV minimum utilization | High | [KSA-02][KSA-04] |
| MV neutral earthing | Player-selectable "solid" or "low-resistance". Default to low-resistance only as a game choice, and say the actual Riyadh practice is not confirmed | Medium (both allowed by SEC; actual Riyadh choice unknown) | [KSA-05][KSA-06][KSA-09] |
| 3-phase fault level at 13.8 kV bus | Equipment rated 21 kA 1 s; planning cap 20 kA | High | [KSA-02][KSA-07][KSA-08] |
| Topology | Open loop: two radial feeders from two different grid stations (or two bus sections), with NOP at an RMU; tee loops of three feeders allowed | High (as SEC planning policy, 2004) | [KSA-02] |
| Feeder loading | ≤50% of cable rating (single loop), ≤65% (tee loop) | High (2004 doc) | [KSA-02] |
| Feeder length to NOP | ≤7.5 km at 13.8 kV | High (2004 doc) | [KSA-02] |
| Main MV cable | 3 × 300 mm² Al XLPE: 300 A / 7 MVA, R ≈ 0.130 Ω/km, X ≈ 0.108 Ω/km. Alternative 3 × 185 Cu: 290 A, R 0.129, X 0.116 | High (2004 doc) | [KSA-02] |
| Cable rating conditions | Ground 35–40 °C, ρ = 2.0 K·m/W, 1.0 m depth, XLPE 90 °C | High; ambient conflicting (35 vs 40 °C) | [KSA-01][KSA-02] |
| Distribution substation | Package unit substation (RMU + transformer + LV board), 13.8/0.4 kV Dyn11; sizes 300/500/1000/1500 kVA (1000 kVA typical urban). Average SEC transformer is about 0.54 MVA | High | [KSA-02][KSA-05][KSA-06][KSA-13] |
| RMU | 2 ring load-break switches (400 A) + 1 tee-off (fuse-switch or breaker), 17.5 kV, 21 kA 1 s, earth-fault indicator | High | [KSA-02][KSA-07][KSA-08] |
| Transformer loading rule | Plan reinforcement at 80%; do not exceed 100% | High (2004) | [KSA-02] |
| LV system | 400/230 V for new areas, TN-type with neutral solidly earthed at the transformer and multiply earthed (pole and consumer). Older districts are 220/127 V or 380/220 V. Plugs are BS 1363-type 13 A | High (voltages); medium (TN-C-S label) | [KSA-01][KSA-05][KSA-16][KSA-17] |
| LV voltage limits (400/230 V) | 380/218.5 – 420/241.5 V | High | [KSA-01][KSA-04] |
| Climate | Summer daytime ambient 43–46 °C typical, design 55 °C; dust storms as a random event in spring; Riyadh humidity is low (pollution flashover is a coastal mechanic, not Riyadh) | High | [KSA-01][KSA-21][KSA-23] |
| Daily load shape | Summer peak about 13:00–17:00 (residential about 15:00); AC about 60% of summer residential load; summer peak months May–Aug | Medium (Eastern Province data, plus a Central Region snippet) | [KSA-22][KSA-37] |
| Annual load factor | 0.46 | Medium (2004) | [KSA-02] |
| Reliability target for "good" | SAIDI about 100 min/yr (2020 SEC level) improving toward under 50 min | Medium | [KSA-15][KSA-27] |
| Demand factors | Residential 0.5, commercial 0.6–0.9 | High (2004) | [KSA-02] |

## Open questions / NOT FOUND

1. Any historical 50 Hz operation in the Western Region: **NOT FOUND**. Leave it out.
2. The actual MV neutral earthing in Riyadh 132/13.8 kV grid stations (solid vs resistance, NER rating, earth-fault current limit): **NOT FOUND**. Ask the owner, who is a Saudi MV switchgear engineer.
3. Current (post-2011) DPS edition values. Did the 50%/65% loading, the 7.5 km limit, or the 20 kA level change? Not verified.
4. The Distribution Code text (2018 Issue 03 Rev 02): not read directly. Its voltage table is known only via [KSA-01] and [KSA-04].
5. 01-SDMS-01 "General Requirements" (system parameters, BIL, power-frequency withstand values): **NOT FOUND**.
6. SAIFI absolute values, CAIDI, region-level (Riyadh) reliability, and regulatory targets: **NOT FOUND**.
7. Resolution number for the 2010 voltage decision: conflicting (324 per [KSA-17], 425 per [KSA-16]).
8. Where 33 kV is used vs 13.8 kV by region, and where 69 kV is in service: **NOT FOUND**.
9. The official LV earthing system designation (TN-C-S/TT) in SBC 401 or SEC connection rules: **NOT FOUND**.
10. The ECRA→SERA renaming date: inferred (~1442 H), not quoted.
11. Typical Riyadh feeder count per grid station, and real feeder lengths and loads: **NOT FOUND**.
