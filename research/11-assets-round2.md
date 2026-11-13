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

**[AS2-08] Saudi data.** Shwehdi, Bakhashwain, Farag & Assiri, "Distribution transformers reliability; industrial plant in Saudi Arabia", IEEE PES 2000 (Winter Meeting), pp. 2769–2774, doi:10.1109/PESW.2000.847321 [S-13]. Six Eastern Province plant locations, 1995–98 records. The abstract reports that weather and geographic location influence interruptions, and that records were incomplete. **verified (abstract only); no rates read.**

**Weibull parameters: NOT FOUND (read).** A candidate is Future Internet 15(2):45 (2023), a Sri Lanka distribution-transformer Weibull study with six years of data [S-14]. The fetch returned 403.

