# 11 — Assets round 2: thermography, DGA, failure rates, health index, cable ratings, hot climate, SF6

Round 2 closes gaps from `05-thermal-assets.md` (open questions 5–11). Items verified in round 1 are not repeated. Sources are in `sources/11-as2.md`; IDs are [AS2-xx]. Research date: 2026-11-13.

Status labels: **verified** (read in a fetched document), **verified-secondary** (read in a fetched document that reproduces a standard, not the standard itself), **snippet-only** (search summary only), **derived** (computed here), **uncertain**, **NOT FOUND**.

No alfanar documents were used.

---

## 1. Infrared thermography severity (NETA)

**[AS2-01] NETA Table 100.18, "Thermographic Survey Suggested Actions Based on Temperature Rise".** Source: ANSI/NETA MTS-2007, reproduced with NETA's permission in a Fluke application note, p. 3 [S-01]. **verified-secondary**

| ΔT between similar components under similar loading | ΔT between component and ambient air | Recommended action |
|---|---|---|
| 1 °C to 3 °C | 1 °C to 10 °C | Possible deficiency; warrants investigation |
| 4 °C to 15 °C | 11 °C to 20 °C | Indicates probable deficiency; repair as time permits |
| ------ | 21 °C to 40 °C | Monitor until corrective measures can be accomplished |
| >15 °C | >40 °C | Major discrepancy; repair immediately |

- The note says the same table applies to newly installed equipment under ATS-07, and that "in the absence of consensus standards for ΔT, the values in this table will provide reasonable guidelines" [S-01 p. 3].
- It names an alternative: a standards-based temperature rating method (Paul Gill, *Electrical Power Equipment Maintenance and Testing*, 1998, §8.9.2) [S-01 p. 3].
- irinfo.org (Infraspection Institute) also quotes ">15 °C … Major discrepancy; repair immediately" for NETA MTS. It adds that "some other guides" use ΔT ≥ 70 °C for immediate concern, without naming them [S-02]. **verified**
- **Edition caveat.** The values were read for MTS-2007/ATS-07 only. The current edition is ANSI/NETA MTS-2023 [S-03, snippet-only]. Search summaries say the same table number and bands still appear in later editions, but the 2023 text was **not read**, so its values are **uncertain**. Vendor paraphrases that add timelines such as "30–90 days" are **not** NETA text.
- Note: the round-1 warning in `05` §6 can be lifted for the MTS-2007 values.

**Engine use:** treat ΔT as load-dependent, since heating scales with I² (stated in [S-01]). Normalise the measured ΔT to rated load before comparing it with the bands, or apply the bands only above a minimum load (for example 40 %, a design choice that is **not** sourced).

## 2. Transformer DGA

**[AS2-02] Duval Triangle 1 zone coordinates.** Source: M. Duval, "A Review of Faults Detectable by Gas-in-Oil Analysis in Transformers", *IEEE Electrical Insulation Magazine* 18(3), May/June 2002, p. 8, Fig. 1 "Coordinates and fault zones of the Triangle" [S-04]. **verified** (read from the rendered figure)

- Coordinates: %C2H2 = 100x/(x+y+z), %C2H4 = 100y/(x+y+z), %CH4 = 100z/(x+y+z), with x, y, z = C2H2, C2H4, CH4 in ppm [S-04 p. 8].
- Fault codes [S-04 p. 8]:
  - PD: partial discharges
  - D1: low-energy discharges
  - D2: high-energy discharges
  - T1: thermal fault below 300 °C
  - T2: thermal fault 300–700 °C
  - T3: thermal fault above 700 °C
  - DT: mixture of thermal and electrical faults
- Boundary labels printed on Fig. 1: CH4 98; C2H4 20, 23, 40, 50; C2H2 4, 13, 15, 29.
- **Zone inequalities (derived** from where each label sits in Fig. 1; this matches the commonly published form, but no text table was fetched):

| Zone | Condition (percent of CH4+C2H4+C2H2) |
|---|---|
| PD | CH4 ≥ 98 |
| D1 | C2H4 < 23 and C2H2 > 13 |
| D2 | C2H4 ≥ 23 and C2H2 > 13, but only where C2H4 < 40 or C2H2 > 29 (else DT) |
| T1 | CH4 < 98, C2H4 < 20, C2H2 < 4 |
| T2 | 20 ≤ C2H4 < 50, C2H2 < 4 |
| T3 | C2H4 ≥ 50, C2H2 < 15 |
| DT | everything else (between the D and T zones) |

- Interpretation from the same paper [S-04]:
  - T3 cases in service tend to be hot spots in oil, while T1/T2 cases tend to be hot spots in paper.
  - Carbonised paper tends to appear in or near T2.
  - Normal OLTC operation plots in D1/D2, so the main-tank triangle must exclude communicating OLTC gases.
- Fault-type definitions and the T1/T2/T3 temperature bands are confirmed by Dukarm, Draper & Piotrowski, "Diagnostic Simplexes for Dissolved-Gas Analysis", *Energies* (published 7 Dec 2020), Table 1 [S-05]. **verified**
- The Duval triangle is for fault *classification*, not fault detection [S-06 snippet]. Use gas levels and rates to decide whether a fault exists, then use the triangle to classify it.

**[AS2-03] IEEE C57.104-2019 gas limit tables.** **NOT FOUND (numbers).** What was verified [S-07]:
- Limits are 90th and 95th percentiles of a large fleet database. Table 1 holds 90th-percentile concentrations.
- Delta and rate-of-change tables (Tables 3 and 4) use 95th percentiles.
- Tables split by O2/N2 ratio (≤0.2 or >0.2) and by transformer age (1–10, 10–30, >30 years). Age groups were merged where their values differed by less than 35 %.
- Status labels Status 1/2/3 ("probably normal", "possibly abnormal", "probably abnormal") are snippet-only [S-08].
- Article pages show the tables only as images. A blog's "H2 < 500, C2H2 < 50" numbers are not the 2019 tables and are **rejected**.

**[AS2-04] IEC 60599.** The editions are 2015 (Ed. 3.0) and 2022 (Ed. 4.0); typical concentration values are in Annex A.2.4 (2022) [S-09]. **verified (structure only)**. The numbers are **NOT FOUND**. A search snippet attributed 1999 Annex A.1 90 % typical ranges (H2 60–150, CH4 40–110, C2H2 3–50, C2H4 60–280, C2H6 50–90, CO 540–900, CO2 5100–13000 ppm, for power transformers without a communicating OLTC); this is **snippet-only and not usable**.

## 3. Failure rates

**[AS2-05] CIGRE service failure rates**, summarised in Electra 323 (Aug 2022), "Reliability of key T&D equipment" [S-10]. **verified-secondary**

| Item | Rate | Scope | Brochure |
|---|---|---|---|
| XLPE AC land cable, internal causes | 0.069 per 100 km·yr | 60–500 kV | TB 815 (WG B1.57, 2020) |
| Joints | 0.002 per 100 units·yr | 60–500 kV | TB 815 |
| Terminations | 0.051 per 100 units·yr | 60–500 kV | TB 815 |
| Power transformers, major failures | 0.53 %/yr | ≥69 kV | TB 642 (WG A2.37, 2015) |
| HV SF6 circuit breakers, major failures | 0.30 %/yr (2004–07), down from 0.67 % (1988–91) | HV | TB 510 (WG A3.06, 2012) |

- Compared with TB 379 (2009): cable +30 %, joints −40 %, terminations +300 %.
- Type tests: about 25 % of 251 distribution transformers (315–2000 kVA) failed short-circuit tests (Smeets & Bruil, CIGRE A2-304, 2016).
- These are **HV**, not MV. MV cable systems fail far more often (see AS2-06). Do not use the HV values for 13.8 kV feeders.

**[AS2-06] EPRI distribution underground failure rates (US utilities)** [S-11]. **verified**
- Medians, in failures per 100 conductor-miles per year: cable 1.3, joints 0.4, terminations 0.2.
- Most cable rates fall between 0.7 and 2.
- Third-party damage is excluded. Each utility decided whether a failure was a cable or an accessory failure.
- **Derived (unit conversion only):** per 100 conductor-km per year, cable ≈ 0.81, joints ≈ 0.25, terminations ≈ 0.12 (÷1.609). "Conductor-miles" for 3-core cable may equal circuit length; the page does not define it.
- Snippet-only, from an EPRI 2025 slide set [S-12]: jacketed direct-buried XLPE ≈ 0.7 versus unjacketed ≈ 4 per 100 miles per year, and in duct ≈ 0.08. **Not read.**

**[AS2-07] IEEE 493 (Gold Book).** The edition is 2007, now inactive-reserved (snippet). The original tables were **NOT read** (paywalled). Secondary snippet values are not adopted:
- liquid transformer 0.0041–0.0062 failures/unit-yr
- metal-clad breaker 0.0036

**[AS2-08] Saudi data.** Shwehdi, Bakhashwain, Farag & Assiri, "Distribution transformers reliability; industrial plant in Saudi Arabia", 2000 IEEE PES Conference Proceedings, pp. 2769–2774, doi:10.1109/PESW.2000.847321 [S-13]. Six Eastern Province plant locations, 1995–98 records. The abstract reports that weather and geographic location influence interruptions, and that records were incomplete. **verified (abstract only); no rates read.**

**Weibull parameters: NOT FOUND (read).** A candidate is Future Internet 15(2):45 (2023), a Sri Lanka distribution-transformer Weibull study with six years of data [S-14]. The fetch returned 403.

**Saudi cable outage causes (snippet-only).** Shwehdi (2009), a study of 34.5 kV outages over more than 10 000 km of underground cable [S-15]:
- In Medina, joint problems were the most frequent cause of failure.
- In the southern region, "burnt cable" was the main cause of 13.8 kV failures.

The abstract page returned 503, so this is **not verified**.

---

## 4. Health index, CBM/RCM, inspection intervals

**[AS2-09] CNAIM v2.1 (Ofgem, 1 April 2021)** [S-16]. **verified** (full PDF read)

- **Health Score** runs on a continuous scale from 0.5 to 10, extended to 15 for forecasting (§4.3.2, p. 29):
  - 0.5 = as new
  - 5.5 = "the point … beyond which significant deterioration may begin", where PoF is about 2× new
  - 10 = extremely poor, PoF 10× new
- **Health Index bands**, Table 5 (p. 29):

| Band | HI1 | HI2 | HI3 | HI4 | HI5 |
|---|---|---|---|---|---|
| Health Score | 0.5 to <3 | 3 to <5.5 | 5.5 to <6.5 | 6.5 to <8 | 8 to ≤15 |
| Typical HS used for PoF (Table 7, p. 30) | 1.23 | 4.25 | 6.00 | 7.25 | 9.00 |

- **Criticality bands** (Table 6, p. 30) are set by Overall CoF as a percentage of the Reference Cost of Failure:
  - C1: <75 %
  - C2: 75–125 %
  - C3: 125–200 %
  - C4: ≥200 %
- **Ageing** (§6.1.3–6.1.6, pp. 35–36):
  - Expected Life = Normal Expected Life / (Duty Factor × Location Factor) (EQ. 4)
  - β1 = ln(5.5/0.5) / Expected Life (EQ. 5)
  - Initial Health Score = 0.5·e^(β1·age), capped at 5.5 (EQ. 6). The age-only score therefore never exceeds 5.5; measured or observed condition modifiers push it higher.
- **PoF per year** (EQ. 3, p. 34): PoF = K·[1 + C·H + (C·H)²/2! + (C·H)³/3!], with H = max(Health Score, 4). From Table 21 (Appendix B), C = 1.087 for all categories:

| Category | K-value |
|---|---|
| HV Switchgear (GM), Distribution | 0.0067 % |
| HV Switchgear (GM), Primary | 0.0052 % |
| HV Transformer (GM) | 0.0078 % |
| EHV Switchgear 33/22 kV | 0.0223 % |
| EHV/132 kV Transformer | 0.0454 % |
| LV UGB | 0.0077 % |

  For linear assets (cables), K is per km per year (§6.1.2).
- **Derived PoF (computed here from EQ. 3 and Table 21):**

| Health Score | ≤4 | 5.5 | 6.5 | 8 | 10 |
|---|---|---|---|---|---|
| HV transformer, %/yr | 0.22 | 0.47 | 0.72 | 1.23 | 2.22 |
| HV distribution switchgear, %/yr | 0.19 | 0.41 | 0.62 | 1.05 | 1.91 |

  The 10× ratio between H = 10 and new matches the stated design intent.
- **Normal Expected Life** (Table 20, p. 107):
  - 6.6/11 kV RMU: 55 years
  - 6.6/11 kV Switch (GM): 55 years
  - 6.6/11 kV CB (GM): 55 years
  - 6.6/11 kV Transformer (GM): 60 years
  - 20 kV equivalents: the same
  - HV Sub Cable: 60 years
  - 33 kV non-pressurised UG cable: 100 years

  **Derived:** for a 60-year life, β1 = 0.0400/yr, giving Initial Health Scores of 0.75 / 1.66 / 3.02 / 5.5 at 10 / 30 / 45 / 60 years.
- **Condition modifiers** usable directly in a game (Appendix B):
  - **Table 151**, HV distribution switchgear temperature readings (thermography): at or below ambient ×0.9; above ambient ×1.0; above the manufacturer's maximum ×1.1.
  - **Table 152**, trip test: fail ×1.4.
  - **Table 172**, HV transformer temperature: Normal 1.0; Moderately High 1.2; Very High 1.4, with the **collar raised to 5.5**.
  - **DGA** (Tables 208–212, EQ. 23–24, p. 70). Gas condition states:

    | Gas | 0 | 2 | 4 | 10 | 16 |
    |---|---|---|---|---|---|
    | H2 (ppm) | ≤20 | 20–40 | 40–100 | 100–200 | >200 |
    | CH4, C2H4, C2H6 (each, ppm) | ≤10 | 10–20 | 20–50 | 50–150 | >150 |

    C2H2 uses its own states: ≤1 → 0, 1–5 → 2, 5–20 → 4, 20–100 → 8, >100 → 10.
    DGA Score = 50·H2 + 30·CH4 + 30·C2H4 + 30·C2H6 + 120·C2H2. The weight digits come from garbled PDF glyphs, read as 50/30/30/30/120; treat them as **verified-with-caveat**. DGA Test Collar = DGA Score / 220, "chosen to give a Health Score of 7 at the point where DGA levels are indicative of severe degradation".
  - **Oil tests, HV/EHV transformer** (Tables 203, 205):
    - Moisture (ppm): ≤15 → 0; 15–30 → 2; 30–40 → 4; 40–50 → 8; >50 → 10
    - Breakdown strength (kV): ≤30 → 10; 30–40 → 4; 40–50 → 2; >50 → 0
    - Acidity is not used for HV (Table 204 shows "-").
- CNAIM v3.0 exists: ENA's "CNAIM v3.0 methodology changes explained" is dated 2026 [S-17, snippet-only]. Its values were **not read**, so v2.1 is the verified baseline.

**[AS2-10] NFPA 70B-2023, Table 9.2.2 maintenance intervals**, reproduced by Electrical Reliability Services (Vertiv), file dated 2023-05 [S-18]. **verified-secondary**

- §9.2.2 applies "where the manufacturer's recommendations are not provided or available".
- Condition definitions (§9.3.1.1–9.3.1.3):
  - **C1:** like new, clean, tight, no monitoring alerts, no active predictive recommendations, maintained per the EMP.
  - **C2:** C1 criteria plus any of: results deviating from the past, the last cycle found major repairs, monitoring notifications, active predictive recommendations.
  - **C3:** any of: two missed cycles, two cycles with major repairs, an unaddressed monitoring alarm, urgent predictive actions.

| Equipment / scope | Cond. 1 | Cond. 2 | Cond. 3 |
|---|---|---|---|
| All equipment: infrared thermography | 12 mo | 12 mo | 6 mo |
| Switchgear: visual inspection | 12 mo | 12 mo | 6 mo |
| Switchgear: cleaning, lubrication, mechanical, electrical testing | 60 mo | 36 mo | 12 mo |
| Switches: all scopes | 60 mo | 36 mo | 12 mo |
| MV power circuit breakers: all scopes | 60 mo | 36 mo | 12 mo |
| Power and distribution transformers: visual | 12 mo | 12 mo | 6 mo |
| Power and distribution transformers: cleaning, mechanical, electrical | 60 mo | 36 mo | 12 mo |
| Power cables: visual, cleaning, electrical testing | 60 mo | 36 mo | 12 mo |
| Substations: visual | 12 mo | 12 mo | 6 mo |
| Grounding and bonding: electrical testing | 60 mo | 36 mo | 36 mo |

- Scope: NFPA 70B is a US facility (premises) standard, not a utility one. Use it as a generic interval ladder only. No SEC- or utility-specific RMU or package-substation interval was found (**NOT FOUND**).
- RCM / CBM taxonomy (corrective, time-based, condition-based, RCM, risk-based): no fetched primary source (**NOT FOUND**). CNAIM itself is the verified risk-based example (PoF × CoF via HI/criticality matrices).

---

## 5. Cable short-term and emergency ratings

**[AS2-11]** IEC 60853-2:1989 is titled "Cyclic rating of cables greater than 18/30 (36) kV and emergency ratings for cables of all voltages". Its contents include an Annex F of examples and clause 8.1 on emergency ratings for thermally isolated circuits [S-19]. **snippet-only** (preview 403). Part 1 covers cyclic rating up to 18/30 (36) kV (`05` [TH-13]).

**[AS2-12] Emergency temperature limits** [S-20]. **verified-secondary**
- US practice (AEIC CS9, ICEA S-108-720, for HV): 105 °C emergency, "not more than 72 hours on average per year" and not more than 216 h in any 12 months.
- IEC 60840 and IEC 62067 (>30 kV): 90 °C for both continuous and short-term operation.
- "Many countries" allow 100–105 °C for short durations on buried cables only. Cables in air must not exceed the normal temperature.
- Emergency durations of 10 min to 15 days are cited from CIGRE TB 640.
- A Southampton CIGRE paper (snippet-only, 403) adds that NF C 33-253 allows +10 °C above 90 °C [S-21].

**Replacement status of round-1 "130 °C for ≤1500 h per lifetime" ([TH-10], alfanar):** no non-alfanar source verified it. A search pointed to a catalogue hosted at aeconline.ae, but its PDF metadata shows it is an **alfanar** catalogue, so it was **excluded**. EPRI report 1001859 reports no mechanical deterioration of the cable itself at emergency temperatures up to 130 °C, but notes that splices need further work [snippet-only, S-22]. **Recommendation: drop the 130 °C/1500 h rule, or label it "manufacturer claim, unverified".** Use 105 °C as the conservative emergency limit for the engine.

**Cable thermal time constants: NOT FOUND.** No public value in minutes or hours for a buried MV XLPE cable was fetched. National Grid (UK) 11 kV rating standard SD8B/3 is snippet-only: winter soil 0.9 and summer 1.2 K·m/W; the document returned 404 [S-23]. A game abstraction (first-order conductor τ plus a much slower soil τ of "weeks", per `05` [TH-13]) remains a design assumption.

---

## 6. MV XLPE 3-core cable ampacity and derating (replaces alfanar data)

**[AS2-13] Saudi Cable Company (SCC), "Medium Voltage Cables Catalogue"** (saudicable.com, PDF uploaded 2026-06, 177 pp.) [S-24]. **verified** (PDF read; it was checked to contain no alfanar content).

- Basis (printed pp. 73–74): IEC 60287, 90 °C conductor, **ground 30 °C**, depth 0.8 m, **soil 1.2 K·m/W**, air 40 °C. One table covers 3.6/6 kV to 18/30 kV, so it applies to 8.7/15 kV (13.8 kV).
- **3-core XLPE, copper, unarmoured, direct in ground** (printed p. 74), in A:

| mm² | 35 | 50 | 70 | 95 | 120 | 150 | 185 | 240 | 300 | 400 | 500 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 153 | 181 | 221 | 262 | 298 | 334 | 377 | 434 | 489 | 553 | 617 |

  Armoured values are within ±2 % (for example 240: 431, 300: 482).
- **3-core XLPE, aluminium, unarmoured, in ground** (aluminium section, printed p. 155), in A:

| mm² | 35 | 50 | 70 | 95 | 120 | 150 | 185 | 240 | 300 | 400 | 500 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 119 | 140 | 171 | 203 | 232 | 260 | 294 | 340 | 384 | 438 | 502 |

- **Ground temperature factor** (printed p. 79):

| °C | 20 | 25 | 30 | 35 | 40 | 45 | 50 |
|---|---|---|---|---|---|---|---|
| Factor | 1.09 | 1.04 | 1.00 | **0.95** | **0.90** | 0.85 | 0.80 |

- **Air temperature factor**:

| °C | 25 | 30 | 35 | 40 | 45 | 50 | 55 |
|---|---|---|---|---|---|---|---|
| Factor | 1.14 | 1.10 | 1.05 | 1.00 | 0.95 | 0.89 | 0.84 |

- **Depth, direct buried, ≤300 mm²** (printed p. 79):

| m | 0.8 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0 | 2.5 | ≥3.0 |
|---|---|---|---|---|---|---|---|---|
| Factor | 1 | 0.98 | 0.96 | 0.95 | 0.94 | 0.92 | 0.91 | 0.90 |

  Multicore cables in duct: 1 / 0.99 / 0.97 / 0.96 / 0.95 / 0.95 / 0.94 / 0.93.
- **Soil resistivity, direct buried, multicore** (printed p. 80; base 1.2):

| K·m/W | 0.8 | 0.9 | 1.0 | 1.2 | 1.5 | 2.0 | 2.5 |
|---|---|---|---|---|---|---|---|
| Up to 25–150 mm² | 1.14 | 1.10 | **1.07** | 1.00 | 0.93 | **0.84** | **0.76** |
| 185–400 mm² | 1.16 | 1.11 | **1.07** | 1.00 | 0.92 | **0.82** | **0.74** |

  The duct-bank table is also given, with milder factors (for example multicore 185–400 at 2.5: 0.82). **3.0 K·m/W is not tabulated (NOT FOUND in a non-alfanar source).** Extrapolating linearly from 2.0 to 2.5 would give about 0.66–0.68 for 185–400 mm²; that is **derived and uncertain**.
- **Grouping, multicore cables in flat formation, direct buried** (printed p. 81):

| Cables | Touching | 0.15 m | 0.30 m | 0.45 m | 0.60 m |
|---|---|---|---|---|---|
| 2 | 0.80 | 0.84 | 0.88 | 0.90 | 0.92 |
| 3 | 0.70 | 0.74 | 0.79 | 0.83 | 0.86 |
| 4 | 0.64 | 0.69 | 0.75 | 0.79 | 0.83 |
| 5 | 0.58 | 0.65 | 0.72 | 0.77 | 0.80 |
| 6 | 0.56 | 0.62 | 0.70 | 0.75 | 0.79 |

  Multicore cables in single-way ducts, touching: 0.88 / 0.79 / 0.74 / 0.70 / 0.68 for 2–6 ducts.
- Short circuit (printed p. 82, IEC 60949, 90 → 250 °C): I = 0.143·S kA for Cu and 0.0937·S kA for Al, for 1 s. This is consistent with round-1 k = 143 / 94.5.
- **Worked example (derived):** Cu 3C 240 mm² at 434 A. At 40 °C ground: 390 A. Adding 2.0 K·m/W: 320 A. Adding a second cable touching: 256 A, which is **59 %** of the catalogue figure. At 2.5 K·m/W alone with 40 °C: 289 A.
- **Basis caveat:** catalogue bases differ. SCC uses 30 °C / 1.2 K·m/W; Top Cable uses 20 °C / 1.5 K·m/W per IEC 60502-2 (verified [S-25] for single-core). Always pair a base table with the factors from the same document.

---

## 7. Hot climate (Saudi / Gulf)

- **[AS2-14]** Dafalla, "Improvement of Thermal Resistivity of Desert Sand for Use in High Voltage Cable Beddings and Foundation in Arid Zones", 6th ICCHGE, Arlington VA, Aug 2008, art. 28 [S-26]. **verified (abstract)**
  - "Major cable failures took place during summer times in Riyadh city and surroundings", and failures increased in the years before 2002.
  - Dry-season moisture loss pushes soil resistivity beyond design ranges.
  - SEC commissioned the work and adopted 5 % cement-stabilised sand bedding into its cable specifications.
  - No resistivity numbers appear in the abstract.
- **[AS2-15]** Shwehdi, Al-Ismail & Al-Nuaim, "Investigating and studying the thermal effect of the underground cables", IEEE ISEI 2010, doi:10.1109/ELINSL.2010.5549813 [S-27]. **verified (abstract)**. Two LV cables were field-tested in July–August 2008, the hottest season, with current stepped from 100 to 300 A in 30-min steps. Factors studied: soil resistivity, insulation, manufacturing defects.
- **[AS2-08]** (above): Eastern Province industrial distribution transformers, 1995–98. Weather and location influence interruptions.
- Snippet-only: a KFUPM thesis by Al-Asiri found most natural Saudi soils have high thermal resistivity when dry, and sand–clay backfills performed best [S-28]. A 2004 numerical study modelled a power transformer in Riyadh climate (KFUPM record seen in search results; not fetched).
- **Switchgear above 40 °C:**
  - ABB SafeRing/SafePlus 12–24 kV is rated −25 to +40 °C, with "contact ABB" for other ranges [S-29, snippet-only].
  - No ABB or Siemens derating table was found. Schneider RM6 (`05` [TH-18]) remains the only verified high-ambient derating table.
  - **NOT FOUND:** a generic IEC derating rule and SEC's design ambient.
- **NOT FOUND:** solar gain on kiosks, dust or humidity tracking studies, and Gulf-specific transformer failure rates.

---

## 8. SF6 in MV switchgear

**[AS2-16] Regulation (EU) 2024/573, Article 13(9)–(18)**, as summarised by two national competent authorities: Finland's Syke (2 Jan 2025) [S-30] and the Netherlands' IPLO [S-31]. **verified-secondary** (EUR-Lex itself was unreachable).

Bans on **putting into service**:

| From | Equipment | Restriction |
|---|---|---|
| **1 Jan 2026** | MV switchgear for primary/secondary distribution **≤24 kV** | No F-gases |
| **1 Jan 2028** | HV ≥52 kV to ≤145 kV, ≤50 kA | No F-gases with GWP ≥1 |
| **1 Jan 2030** | MV switchgear **>24 kV to ≤52 kV** | No F-gases |
| **1 Jan 2032** | HV >145 kV or >50 kA | No F-gases with GWP ≥1 |
| **1 Jan 2035** | Servicing | No **virgin** SF6; only recycled or reclaimed (art. 13(7)) |

- Switchgear ordered before 11 March 2024 is exempt (art. 13(14)).
- Tender derogation (art. 13(11)–(12)): if a tender attracts no bid, or only one manufacturer's F-gas-free bid, equipment with a gas of **GWP < 1000** may be commissioned. This applies under a two-year transition, after which availability must be reassessed. Operators must notify the competent authority and keep tender records for 5 years (art. 13(16)–(17)). The ecodesign lifecycle derogation (art. 13(13)) is not yet usable.
- Relocation within the EU is not covered (art. 13(10)). Repair with parts is allowed without increasing the gas quantity or GWP (art. 13(18)).
- SF6 GWP is 24 300 (Annex I, per Syke). Equipment holding ≥500 t CO2e (for example 48.6 kg SF6) needs leak detection, checked at least every 6 years [S-30].
- The phrase "F-gases" covers SF6 replacements as well, so fluorinated alternatives such as g3 face the same ≤24 kV ban. **Saudi Arabia is not bound by this regulation**; for the game it is a supply-chain and vendor-portfolio driver only.

**[AS2-17] SF6-free alternatives** (snippet-only from vendor pages; fetches returned 503) [S-32]:
- ABB SafeRing Air and SafePlus Air: dry air insulation, vacuum interruption, GWP 0, 24 kV / 630 A / 20 kA. The GSec Air switch-disconnector uses dry air with a vacuum interrupter.
- Siemens 8DJH 24 "Clean Air" with a vacuum interrupter.
- Schneider "AirSeT" family (GM AirSeT): pure air and vacuum.
- Eaton Xiria: non-pressurised air, 24 kV / 630 A / 21 kA.
- GE Vernova g3 was **not found**.

**[AS2-18] Low-pressure behaviour:**
- Schneider FAQ FA86237: "If the needle is in the low red zone on the switchgear SF6 gas gauge – do not operate the unit"; isolate it, make it safe, and call Schneider [S-33]. **verified**
- ABB SafeRing/SafePlus manual (NOPOWSR 5976 GB, p. 13): SF6 at 1.4 bar absolute at 20 °C, "sealed for life", with a temperature-compensated pressure indicator. A green zone means correct pressure and a red zone means "pressure is too low". An electrical low-pressure signal contact is available on request. Refilling stops at 0.4 bar gauge (1.4 bar absolute) [S-34]. **verified**
- Snippet-only [S-35]:
  - SafeRing red zone = "switching cannot be done under live conditions"
  - ABB SafeLink filled at 1.2 bar absolute, minimum operating pressure 1.1 bar absolute
  - Trafag density monitor lowest switch-point 120 kPa absolute
- **Game rule (design, sourced intent):** a low gas reading blocks live switching of that RMU. The player must isolate the RMU from upstream before working on it.

---

## Summary of what changed versus round 1
- NETA ΔT bands: **now verified** for MTS-2007 (AS2-01).
- Duval Triangle 1 coordinates: **verified from the 2002 figure** (AS2-02).
- IEEE C57.104 and IEC 60599 gas tables: **still NOT FOUND**. CNAIM's DGA condition-state tables (AS2-09) are a verified, usable substitute.
- Failure rates: EPRI MV medians and CIGRE HV rates verified (AS2-05, AS2-06). Weibull parameters and IEEE 493 tables **NOT FOUND**.
- CNAIM health-score, PoF and expected-life model fully verified (AS2-09). NFPA 70B-2023 intervals verified-secondary (AS2-10).
- Cable ampacity and derating: replaced by **Saudi Cable Company** data (AS2-13). The **alfanar-derived 130 °C/1500 h emergency rule and alfanar ratings should be removed** from `05` §3.
- F-gas dates verified via two EU national authorities (AS2-16).

## Open questions (round 3)
1. IEEE C57.104-2019 Tables 1–4 and IEC 60599:2022 Annex A values. These need the standards.
2. NETA MTS-2023 Table 100.18: confirm it is unchanged.
3. A non-alfanar factor for 3.0 K·m/W (for example IEC 60502-2 Annex B tables).
4. MV cable thermal time constant and IEC 60853-2 emergency method numbers.
5. ABB, Siemens and SEC high-ambient switchgear derating, and SEC's RMU design ambient.
6. Weibull parameters (Future Internet 15(2):45 returned 403).
7. Saudi cable and transformer failure statistics (Shwehdi 2009 full text).
8. EUR-Lex primary text of 2024/573 Article 13.
