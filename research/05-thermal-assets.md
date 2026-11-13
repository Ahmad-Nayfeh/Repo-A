# 05 Thermal limits, asset ageing, condition monitoring and maintenance

Research notes for the engine's thermal and ageing models. Source IDs `[TH-xx]` resolve in `sources/05-th.md`.

Status labels used inline: **verified** (read in a fetched document), **snippet-only** (seen only in a search summary), **derived** (computed here from verified inputs; this is a calculation, not a published value), **uncertain/conflicting**, **NOT FOUND**.

> **Coverage warning.** The shared web-search budget ran out partway through, before sections 4 to 7 could be searched properly. The transformer thermal model (section 1) is in very good shape: the full IEC 60076-7:2005 text was read, and three published worked examples were reproduced numerically. Cable and switchgear coverage is partial. NETA thermography, Weibull parameters, Gulf-climate papers, health index and RCM are mostly **NOT FOUND** and are listed under open questions.

---

## 1. Oil-immersed transformer loading (IEC 60076-7)

### 1.1 Editions
- **IEC 60076-7:2005 (Ed. 1)**, "Loading guide for oil-immersed power transformers". The full text was read through the identical Indian adoption IS 2026 (Part 7):2009 [TH-02], plus the IEC sample [TH-03]. **verified**
- **IEC 60076-7:2018 (Ed. 2.0 2018-01, dated "2017" inside)**, "…mineral-oil-immersed…". This edition replaces Ed. 1. Its changes, verified from the publisher preview foreword [TH-01]:
  - insulation life updated, including the effects of oxygen and moisture (Annex A)
  - temperature limits reviewed, and a maximum core temperature added
  - Q, S and H factors added
  - thermal models "revised and rewritten in generally applicable mathematical form"
  - GIC added

  The table numbering changed (2018 Table 2 holds temperature limits, Table 3 current limits, Table 4 thermal characteristics) and the examples moved to Annexes H, I and K. **The 2018 numeric values were NOT read.** Every number below is from the **2005** text unless marked otherwise.
- Size classes (2005, cl. 3.1–3.3) [TH-03, TH-02], **verified**:
  - distribution transformer: at most 2 500 kVA three-phase (833 kVA single-phase)
  - medium power: at most 100 MVA three-phase
  - large: above that

  Saudi 13.8 kV/LV kiosk transformers (for example 300 to 1500 kVA) are all **distribution transformers** under IEC.

### 1.2 Ageing [TH-02 §6], verified
- Non-thermally-upgraded (Kraft) paper, eq. (2): **V = 2^((θh − 98)/6)**
- Thermally upgraded paper, eq. (3): **V = exp(15000/(110+273) − 15000/(θh+273))**
- Reference: V = 1.0 at 98 °C for non-upgraded paper and at 110 °C for upgraded paper (§5 text).
- Loss of life, eq. (4): L = ∫V dt ≈ Σ Vn·tn. Difference form (Annex C, eq. C.13): DL(n) = V(n)·Dt.
- Table 2, relative ageing rate V:

| θh (°C) | 80 | 86 | 92 | 98 | 104 | 110 | 116 | 122 | 128 | 134 | 140 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Non-upgraded | 0.125 | 0.25 | 0.5 | 1.0 | 2.0 | 4.0 | 8.0 | 16.0 | 32.0 | 64.0 | 128.0 |
| Upgraded | 0.036 | 0.073 | 0.145 | 0.282 | 0.536 | 1.0 | 1.83 | 3.29 | 5.8 | 10.1 | 17.2 |

- Table 3, normal insulation life of a well-dried, oxygen-free **thermally upgraded** system at 110 °C:

| End-of-life criterion | Hours | Years |
|---|---|---|
| 50 % retained tensile strength | 65 000 | 7.42 |
| 25 % retained tensile strength | 135 000 | 15.41 |
| 200 retained degree of polymerisation (DP) | 150 000 | 17.12 |
| Interpretation of distribution transformer functional life test data | 180 000 | 20.55 |

  The text adds: "A hot-spot temperature of as little as 6 °C below rated values results in half the rated loss of life". Table 1 (paper life at 80/90/98 °C, dry versus with air and 2 % moisture) is explicitly "not intended to be used as such for ageing calculations".
- The 2018 edition adds oxygen and moisture dependent ageing (Annex A, Tables A.1–A.4) [TH-01, TOC only]. **Values NOT read.**
- Mechanisms: pyrolysis (heat), hydrolysis (water, "enemy number one" of solid insulation) and oxidation [TH-07]. **verified**

### 1.3 Limits for loading beyond nameplate. IEC 60076-7:2005 Table 4 [TH-02], verified

| Loading type | Quantity | Distribution | Medium | Large |
|---|---|---|---|---|
| Normal cyclic | Current (p.u.) | 1.5 | 1.5 | 1.3 |
| | Winding hot-spot (°C) | 120 | 120 | 120 |
| | Other metallic hot-spot (°C) | 140 | 140 | 140 |
| | Top-oil (°C) | 105 | 105 | 105 |
| Long-time emergency | Current (p.u.) | 1.8 | 1.5 | 1.3 |
| | Winding hot-spot (°C) | 140 | 140 | 140 |
| | Other metallic (°C) | 160 | 160 | 160 |
| | Top-oil (°C) | 115 | 115 | 115 |
| Short-time emergency (<30 min) | Current (p.u.) | 2.0 | 1.8 | 1.5 |
| | Winding hot-spot (°C) | *see 7.2.1* | 160 | 160 |
| | Other metallic (°C) | *see 7.2.1* | 180 | 180 |
| | Top-oil (°C) | *see 7.2.1* | 115 | 115 |

- Cl. 7.2.1 (distribution): "No limit is set for the top-oil and hot-spot temperature under short-time emergency loading for distribution transformers because it is usually impracticable to control the duration". Above **140 °C hot-spot, gas bubbles may develop**, which jeopardises dielectric strength. **verified**
- Note to the table: the current and temperature limits "are not intended to be valid simultaneously".
- Cl. 7.2.2: bushings, cable-end connections, tap-changers and leads may restrict operation above 1.5× rated current. Cl. 7.2.4: wind, sunshine and rain affect distribution transformer capacity but are "impracticable to take into account". **verified**
- **CONFLICT [TH-06]:** Alliander's summary gives short-term emergency limits of 115 °C top-oil and 160 °C hot-spot with no size exception, and does not cite an edition. This disagrees with 2005 Table 4 for distribution transformers. It may reflect the 2018 edition, which was not read. **uncertain/conflicting**

### 1.4 Equations and parameter tables

**Steady state (from Annex B/E usage; eq. 5/6 at t→∞)**, verified [TH-02]:

θh = θa + Δθor·[(1 + R·K²)/(1 + R)]^x + H·gr·K^y

Here K is the load factor, R the ratio of load loss to no-load loss at rated current, Δθor the rated top-oil rise, and H·gr (= Δθhr) the rated hot-spot-to-top-oil gradient.

**Exponential (step-load) method, eqs. (5)–(9)** [TH-02], verified.

Increasing step:

θh(t) = θa + Δθoi + {Δθor·[(1+RK²)/(1+R)]^x − Δθoi}·f1(t) + Δθhi + {H·gr·K^y − Δθhi}·f2(t)

- f1(t) = 1 − exp(−t/(k11·τo))
- f2(t) = k21·(1 − exp(−t/(k22·τw))) − (k21 − 1)·(1 − exp(−t/(τo/k22)))

Decreasing step:

θh(t) = θa + Δθor·[…]^x + {Δθoi − Δθor·[…]^x}·f3(t) + H·gr·K^y, with f3(t) = exp(−t/(k11·τo)).

The 2005 text restricts this method to alternating up and down steps. Successive increases need each step long enough for Δθh to reach steady state (cl. 8.2.1).

**Difference-equation method (arbitrary K(t), θa(t)), Annex C eqs. C.6–C.11** [TH-02], verified:

- Dθo = (Dt/(k11·τo))·( [(1+K²R)/(1+R)]^x·Δθor − (θo − θa) ); then θo(n) = θo(n−1) + Dθo(n)
- DΔθh1 = (Dt/(k22·τw))·( k21·Δθhr·K^y − Δθh1(n−1) )
- DΔθh2 = (Dt/(τo/k22))·( (k21 − 1)·Δθhr·K^y − Δθh2(n−1) )
- Δθh = Δθh1 − Δθh2; θh = θo + Δθh
- Time step: **Dt ≤ ½ of the smallest time constant** (for example ≤2 min when τw = 4 min). τw and τo must not be zero.
- Initial conditions: set the derivatives to zero (steady state at K(0), θa(0)).
- Measured top-oil can replace the calculated θo (cl. C.6).

An independent open-source implementation [TH-04/TH-05] uses the exact exponential update per step, X(n) = X∞ + (X(n−1) − X∞)·exp(−Dt/τ), with the same structure. That form is unconditionally stable, which is useful at game tick rates. **verified (code)**

**IEC 60076-7:2005 Table 5: recommended thermal characteristics** [TH-02], verified:

| | Distribution ONAN | ONAN restricted | ONAN | ONAF restricted | ONAF | OF restricted | OF | OD |
|---|---|---|---|---|---|---|---|---|
| x | 0.8 | 0.8 | 0.8 | 0.8 | 0.8 | 1.0 | 1.0 | 1.0 |
| y | **1.6** | 1.3 | 1.3 | 1.3 | 1.3 | 1.3 | 1.3 | 2.0 |
| k11 | **1.0** | 0.5 | 0.5 | 0.5 | 0.5 | 1.0 | 1.0 | 1.0 |
| k21 | **1.0** | 3.0 | 2.0 | 3.0 | 2.0 | 1.45 | 1.3 | 1.0 |
| k22 | **2.0** | 2.0 | 2.0 | 2.0 | 2.0 | 1.0 | 1.0 | 1.0 |
| τo (min) | **180** | 210 | 210 | 150 | 150 | 90 | 90 | 90 |
| τw (min) | **4** | 10 | 10 | 7 | 7 | 7 | 7 | 7 |

("Restricted" means zig-zag cooled windings with radial spacers under 3 mm.) With k21 = 1 for distribution transformers there is **no hot-spot overshoot** (Note 2 to Fig. 9).

The column mapping was read from an OCR'd scan. The OF column was confirmed by exactly reproducing the Annex E example (§2, GT-3).

Cross-checks:
- The SP Energy Networks note (ONAN >1 MVA: 0.8/1.3/0.5/2/2/210/10) matches [TH-08, snippet-only].
- Alliander defaults match the distribution and ONAN columns for x, y, k and τ [TH-04].

**IEC 60076-7:2005 Table E.1: example characteristics** (gives R, H and the gradients missing from Table 5) [TH-02], verified:

| | Distribution ONAN | Power ONAN | ONAF | OF | OD |
|---|---|---|---|---|---|
| x / y | 0.8 / 1.6 | 0.8 / 1.3 | 0.8 / 1.3 | 1.0 / 1.3 | 1.0 / 2.0 |
| R (load/no-load loss) | **5** | 6 | 6 | 6 | 6 |
| H (hot-spot factor) | **1.1** | 1.3 | 1.3 | 1.3 | 1.3 |
| τo / τw (min) | 180 / 4 | 210 / 10 | 150 / 7 | 90 / 7 | 90 / 7 |
| θa (°C) | 20 | 20 | 20 | 20 | 20 |
| θh rated (°C) | 98 | 98 | 98 | 98 | 98 |
| Δθhr hot-spot to top-oil at rated current (K) | **23** | 26 | 26 | 22 | 29 |
| Δθomr average oil rise (K, info) | 44 | 43 | 43 | 46 | 46 |
| Δθor top-oil rise (K) | **55** | 52 | 52 | 56 | 49 |
| Δθbr bottom oil rise (K, info) | 33 | 34 | 34 | 36 | 43 |
| k11 / k21 / k22 | 1.0 / 1.0 / 2.0 | 0.5 / 2.0 / 2.0 | 0.5 / 2.0 / 2.0 | 1.0 / 1.3 / 1.0 | 1.0 / 1.0 / 1.0 |

Consistency check (derived): 20 + 55 + 23 = 98 °C, so the "23" row is the full gradient Δθhr = H·gr, not gr alone.

**CONFLICT [TH-04]:** Alliander's `DistributionTransformer` defaults are Δθor = 60 K, gradient = 23 with H = 1.2 (so H·gr = 27.6 K), plus a +10 K ambient surcharge. Their rated hot-spot at θa = 20 °C is therefore about 20 + 10 + 60 + 27.6 = 117.6 °C (derived), against IEC Table E.1's 98 °C. These are Alliander's own conservative choices for indoor Dutch substations, not IEC values. **Use IEC Table E.1 for the engine and expose overrides.**

**Weighted ambient and enclosures** [TH-02 §8.3], verified:
- For ageing, use the yearly weighted ambient, eq. (10): θE = θya + 0.01·[2(θma-max − θya)]^1.85. Here θma-max is the monthly average of the hottest month and θya the yearly average. The IEC worked example (30/20/10/0 °C months) gives θya = 15.0 and θE = 20.4 °C.
- For the maximum hot-spot, use the hottest-month average. For dynamic or monitoring work, use the actual temperature profile.
- **Enclosure (eq. 11):** replace Δθor by Δθ'or = Δθor + Δ(Δθor), where Δ(Δθor) is the extra top-oil rise. If not tested, use Table 6 values **divided by two** to approximate it.
- **Table 6** (correction to add to weighted ambient, K; columns are 250 / 500 / 750 / 1000 kVA):

| Enclosure | Transformers installed | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| Underground vaults, natural ventilation | 1 | 11 | 12 | 13 | 14 |
| | 2 | 12 | 13 | 14 | 16 |
| | 3 | 14 | 17 | 19 | 22 |
| Basements or buildings, poor natural ventilation | 1 | 7* | 8 | 9 | 10 |
| | 2 | 8 | 9 | 10 | 12 |
| | 3 | 10 | 13 | 15 | 17 |
| Good natural ventilation, or forced-ventilated vaults and basements | 1 | 3 | 4 | 5 | 6 |
| | 2 | 4 | 5 | 6 | 7 |
| | 3 | 6 | 9 | 10 | 13 |
| **Kiosks** | 1 | **10** | **15** | **20** | – |

  \*The OCR shows "'t"; 7 is inferred from the monotonic pattern, so treat it as **uncertain**. Note 2: the kiosk correction is not needed if the temperature-rise test was done in the enclosure.
- Ambient basis: the transformer is designed for ambient up to 40 °C, a hottest-month average up to 30 °C and a yearly average up to 20 °C. This is per Alliander's citation of IEC 60076-1/-2 [TH-06], so the normal IEC design basis is **far below Riyadh summer conditions**. Treat this as **verified (secondary)**.

### 1.5 IEEE C57.91 (US equivalent)
**NOT FOUND (not fetched).** The aging-acceleration form exp(15000/383 − 15000/(θh+273)) is identical to IEC eq. (3) [TH-02]. The 180 000 h figure appears in IEC Table 3 as "distribution transformer functional life test data" [TH-02]. Attributing either to IEEE C57.91 remains **unverified**.

---

## 2. Golden test candidates

All three examples were **reproduced numerically in this session** from the verified IEC inputs (scripts kept in the session scratchpad, not committed). Use them as engine regression tests.

### GT-1: IEC 60076-7:2005 Annex C, difference equations (best test: exact reproduction)
- Parameters: Δθor = 45 K, Δθhr = 35 K, τo = 150 min, τw = 7 min, R = 8, x = 0.8, y = 1.3, k11 = 0.5, k21 = 2.0, k22 = 2.0, Dt = 3 min. Ageing uses the **thermally upgraded** formula, eq. (3). The rated hot-spot is 110 °C at 30 °C ambient.
- Initial (steady state at K = 0.81, θa = 30.3): θo = 63.9 °C, Δθh1 = 53.2, Δθh2 = 26.6, θh = 90.5 °C, L = 0.
- Input (Table C.1), steps 0 to 40 at 3-min spacing:
  - θa = [30.3, 29.9, 29.8, 29.5, 29.6, 29.5†, 29.5, 28.9, 29.0, 28.6, 28.0, 28.7, 27.8, 28.1, 27.9, 27.1, 26.9, 26.7, 27.2, 26.7, 26.9, 26.5, 26.2, 26.3, 25.4, 25.6, 25.3, 24.8, 24.5, 24.3, 24.1, 24.3, 24.1, 23.4, 23.6, 23.8, 23.1, 23.3, 23.1, 22.3, 22.2]
  - K = [0.81, 0.87, 0.88, 0.86, 0.90, 0.92, 0.95, 0.96, 0.97, 1.00, 1.70, 1.70, 1.73, 1.72, 1.69, 1.68, 1.71, 1.69, 1.67, 1.68, 1.63, 1.59, 1.53, 1.49, 1.41, 1.38, 1.32, 1.28, 1.21, 1.19, 0.87, 0.88, 0.87, 0.86, 0.85, 0.87, 0.83, 0.86, 0.85, 0.82, 0.86]

  († the OCR reads "29,S"; 29.5 is assumed.)
- Published output (Table C.2), θh in °C by step:

  90.5, 91.6, 92.7, 93.2, 94.3, 95.6, 97.2, 98.6, 100.0, 101.6, 118.6, 132.1, 143.5, 152.4, 158.8, 163.6, 168.2, 171.5, 173.6, 175.7, **176.1** (peak, step 20), 175.6, 173.8, 171.5, 167.8, 164.3, 160.1, 156.0, 151.1, 146.8, 136.9, 129.1, 122.8, 117.5, 113.1, 110.0, 106.6, 104.5, 102.6, 100.4, 99.3.
- Cumulative loss of life (min): step 10 = 14, step 15 = 875, step 20 = 4754, step 30 = 8800, **step 40 = 8851 min = 6.15 days**. Over 2 h this is about 74× normal.
- Worked first step (published): Dθo(1) = 0.121, so θo(1) = 64.0; Δθh1(1) = 54.3; Δθh2(1) = 26.7; θh(1) = 91.6; DL(1) = 0.42 min.
- **Reproduction:** every θh matches to 0.1 K. Step 1 computes as 91.7 against the published 91.6 because IEC rounds intermediates. Loss-of-life values match exactly. Suggested tolerance: ±0.15 K, ±1 min.

### GT-2: IEC 60076-7:2005 Annex B, exponential method, 250 MVA ONAF (measured and calculated)
- Parameters: θa = 25.6 °C, Δθor = 38.3 K, R = 1000 (short-circuit-method test), H = 1.4, gr = 14.5 K, x = 0.8, y = 1.3, τo = 150, τw = 7, k11 = 0.5, k21 = 2.0, k22 = 2.0. Initial Δθoi = 12.7 K, Δθhi = 0.
- Load steps (Table B.1): 0–190 min K = 1.0; 190–365 K = 0.6; 365–500 K = 1.5; 500–710 K = 0.3; 710–735 K = 2.1; 735–750 K = 0.0.
- Published values (Table B.2):

| End time / K | Top-oil calc | Top-oil meas | Hot-spot calc | Hot-spot meas |
|---|---|---|---|---|
| 190 / 1.0 | 61.8 | 58.8 | 83.8 | 82.2 |
| 365 / 0.6 | 44.4 | 47.8 | 54.9 | 58.6 |
| 500 / 1.5 | 89.7 | 80.8 | 127.5 | 119.2 |
| 710 / 0.3 | 35.3 | 46.8 | 39.5 | 49.8 |
| 735 / 2.1 | 67.0 | 65.8 | 138.2 | 140.7 |
| 750 / 0.0 | 59.5 | 68.2 | 59.5 | 82.4 |

- **Reproduction (derived)** with eqs. (5)–(9): 61.9 / 83.8, 44.4 / 54.9, 89.8 / 128.2, 34.8 / 39.0, 67.7 / 139.7, 60.1 / 60.1.
- Deviations reach about 1.5 K. The intermediate values IEC prints (for example Δθhi = 37.82 at 500 min, where we get 38.34) are not fully self-consistent. The 2005 text also has internal time inconsistencies: Table B.1 and §B.6 say 500–710, while Figure 8 marks 735 min. The 2018 Annex H periods are 0–190–365–500–705–730–745 [TH-01]. **Use this as a qualitative test with ±2 K tolerance only.** The gap between measured and calculated values (up to 9 K on top-oil) shows the realistic accuracy of the model.

### GT-3: IEC 60076-7:2005 Annex E, OF transformer 30-min overload (exact reproduction)
- Table E.1 OF parameters: x = 1.0, y = 1.3, R = 6, Δθor = 56, Δθhr = 22, τo = 90, τw = 7, k11 = 1.0, k21 = 1.3, k22 = 1.0, θa = 20 °C. Ageing uses eq. (2) (non-upgraded paper), integrated minute by minute over 1440 min.
- Pre-load K1 = 0.8, steady state: Δθoi = 38.7 K, Δθhi = 16.5 K. Overload K2 = 1.4 for 30 min gives f1 = 0.28, f2 = 1.20, θo = 76.7 °C, **θh = 114.2 °C**. At t = 31 min (back to 0.8): θo = 76.5, θh = 92.9. At 1440 min: θo = 58.7, θh = 75.2. **Daily loss of life 0.14 days; maximum hot-spot rise 94 K.**
- Reproduction (derived): 76.7 / 114.2 / 0.14 d / 94 K, an exact match.
- Table E.2 gives a grid of K1 (0.25–1.5) × K2 (0.7–2.0) results for loss of life in days and maximum hot-spot rise, for a 30-min overload on an OF unit at θa = 20 °C. Examples: (K1 = 1.0, K2 = 1.0) gives 1.00 day and 78 K; (0.8, 1.4) gives 0.14 day and 94 K; (1.0, 1.5) gives 1.71 days and 113 K. These are suitable for a table-driven test.

### GT-4 (derived sanity check, not published): distribution ONAN, IEC Table E.1
- Steady state at K = 1, θa = 20 °C gives θh = 20 + 55 + 23 = 98 °C and V = 1.0.
- At θa = 50 °C in a 500 kVA single-transformer kiosk, Δ(Δθor) ≈ 15/2 = 7.5 K. At K = 1, θh ≈ 50 + 62.5 + 23 = 135.5 °C, so V ≈ 2^(37.5/6) ≈ 76.
- This is **derived**. It illustrates why Riyadh peak-season loading is the governing case; it is not a validated value.

---

## 3. Cables

> **D-004 notice (lead, after round 2):** every item below citing [TH-10] comes from an alfanar catalogue (the owner's employer). Per D-004 these values are **EXCLUDED from the game model** and kept only as historical research trail. Replacements: Saudi Cable Company catalogue and other non-employer sources in `11-assets-round2.md`. The "130 °C emergency / 1500 h" rule has no non-employer source; the model uses the AEIC/ICEA 105 °C emergency limit instead (see 11).


### 3.1 Temperatures (XLPE), verified [TH-10]
- Continuous conductor temperature **90 °C**. Short circuit **250 °C**.
- Emergency **130 °C**, "should not exceed 1500 hours during the lifetime" and allows "20 % higher current" (manufacturer claim).
- XLPE thermal resistivity 3.5 K·m/W.
- Maximum short-circuit temperatures by component (Table F.1): conductor 250, XLPE 250, PVC sheath 200, LDPE 150, HDPE 180, lead 170, lead alloy 210 °C.
- The UK utility design basis (soil 0.9 K·m/W, ground 10 °C, XLPE 90 °C) is **snippet-only** [TH-16]. It is shown only to contrast with desert conditions.

### 3.2 IEC 60287 concept
- Steady-state ampacity comes from a thermal ladder. The allowed rise Δθ = θmax − θambient-ground is divided by the losses (conductor I²R plus sheath and armour losses via λ1 and λ2, plus dielectric loss Wd) flowing through T1 (conductor to sheath), T2 (sheath to armour), T3 (outer serving) and T4 (surrounding soil).
- The symbol definitions are **verified** [TH-12]. The full IEC 60287-1-1 equation text was **NOT read** (it is an image on the page). The usual form is I = [(Δθ − Wd(0.5·T1 + n(T2+T3+T4))) / (R·T1 + nR(1+λ1)·T2 + nR(1+λ1+λ2)(T3+T4))]^0.5, but it is **uncertain** because it was not verified against the standard.
- T4 is roughly proportional to soil thermal resistivity × ln(2L/De), the textbook buried-cylinder form. That is also **not verified** here. The engine should use the manufacturer correction factors below instead of solving IEC 60287.

### 3.3 [EXCLUDED per D-004] Derating factors. alfanar MV catalogue, Annex E [TH-10], verified (headers read from page images)
Basis: air 40 °C, **ground 30 °C**, **soil 1.5 K·m/W**, **depth 0.8 m**, screens bonded both ends.

- **Table E.1, ground temperature** (90 °C conductor):

| Ground °C | 20 | 25 | 30 | 35 | 40 | 45 | 50 |
|---|---|---|---|---|---|---|---|
| Factor | 1.09 | 1.04 | 1.00 | 0.95 | 0.90 | 0.85 | 0.80 |

- **Table E.2, air temperature:**

| Air °C | 25 | 30 | 35 | 40 | 45 | 50 | 55 |
|---|---|---|---|---|---|---|---|
| Factor | 1.14 | 1.10 | 1.05 | 1.00 | 0.95 | 0.89 | 0.84 |

- **Table E.3, depth, direct buried** (single-core ≤185 mm² / single-core >185 mm² / three-core):

| Depth (m) | 0.5 | 0.6 | 0.8 | 1.0 | 1.25 | 1.5 | 2.0 | 3.0 |
|---|---|---|---|---|---|---|---|---|
| ≤185 mm² | 1.04 | 1.02 | 1.00 | 0.98 | 0.96 | 0.95 | 0.93 | 0.90 |
| >185 mm² | 1.06 | 1.04 | 1.00 | 0.97 | 0.95 | 0.93 | 0.90 | 0.86 |
| Three-core | 1.04 | 1.03 | 1.00 | 0.98 | 0.96 | 0.95 | 0.93 | 0.90 |

  Table E.4 gives the same for ducts.
- **Table E.5, soil resistivity, direct-buried single-core** (headers in K·m/W):

| Conductor | 0.7 | 0.8 | 0.9 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0 |
|---|---|---|---|---|---|---|---|---|
| 240 mm² | 1.36 | 1.29 | 1.23 | 1.18 | 1.00 | 0.88 | 0.80 | 0.73 |

  Table E.7 (three-core direct, 240 mm²) reads 1.28, 1.23, 1.19, 1.15, 1.00, 0.90, 0.83, 0.77. Tables E.6 and E.8 cover ducts.
  - **Derived:** moving from moist soil at 1.0 K·m/W to dry desert soil at 2.5 K·m/W costs 0.80/1.18 ≈ 0.68× (single-core 240 mm²). This answers the "1.0 vs 2.5" question in the brief.
- **Table E.9, groups of three-core cables, horizontal, direct in ground** (columns are spacings; the header labels were not captured, so **uncertain**: likely touching, 0.2, 0.4, 0.6, 0.8 m). For 2 / 3 / 4 / 6 cables the first column reads 0.80 / 0.69 / 0.62 / 0.54. Table E.10 covers single-core circuits (first column 0.73 / 0.60 / 0.54 / 0.46).
- Other basis conditions, for comparison:
  - Saudi Cable HV: 30 °C, 1.2 K·m/W, 1.5 m; 35 °C ground factor about 0.96 [TH-14, snippet-only]
  - EUPEN: 20 °C, 0.8 m, 1.5 K·m/W [TH-15, snippet-only]
  - **Correction factors are only valid relative to their own catalogue's basis.**

### 3.4 Adiabatic short-circuit withstand
- Formula: I²·t = k²·S², so S = I√t / k [TH-11], with k = K·√(ln((θf + β)/(θi + β))).
  - Cu: K = 226, β = 234.5
  - Al: K = 148, β = 228

  The constants are **verified** [TH-11]; the source cites IEC 60364-5-54 and IEC 60949.
- XLPE 90 → 250 °C (derived): **k_Cu = 143.1** and **k_Al = 94.5**. TH-11 states k = 143 for Cu thermosetting 90 °C.
- Cross-check against alfanar Annex F (IEC 60949, adiabatic, 90 → 250 °C) [TH-10], **verified**: Cu 240 mm², 1 s → 34.3 kA (k = 142.9); Al 240 mm², 1 s → 22.7 kA (k = 94.6). The scaling rule is I_t = I_1s/√t.
- Example rows (kA, 1 s / 3 s):
  - Cu 95 mm²: 13.6 / 7.8
  - Cu 240 mm²: 34.3 / 19.8
  - Cu 300 mm²: 42.9 / 24.8
  - Al 240 mm²: 22.7 / 13.1
  - Al 300 mm²: 28.3 / 16.4
- **Conflict:** one search snippet gave 92 for Al. The verified catalogue gives 94.6, so 94 is used. The IEC 60364-4-43 table itself was **NOT read**.
- The screen short-circuit rating is calculated from 80 °C initial temperature (IEC 60949) [TH-10].

### 3.5 Dynamic rating and time constants
- IEC 60853-1 covers cyclic rating for cables up to and including 18/30(36) kV. Part 2 covers higher voltages and emergency ratings. Part 3 covers partial soil drying [TH-13]. **verified**
- "The soil has a thermal time constant of weeks" [TH-13]. **verified**
- **The cable's own thermal time constant in minutes or hours was NOT FOUND.** A search snippet mentioned IEC 60853-1 neglecting cable thermal capacitance for ≤30 kV, an emergency factor cap of 2.5, and a cyclic example (11 kV 300 mm²: 534 A → 636 A at load factor 0.68). None of these could be attributed to a fetched page, so they are **not usable**.

---

## 4. Switchgear thermal

### 4.1 IEC 62271-1 temperature-rise limits (ambient ≤40 °C)
Secondary reproduction [TH-17], verified from the paper. Values are maximum temperature / temperature rise in °C/K:

| Part | Medium | 2017 | 2011 |
|---|---|---|---|
| Contacts, bare Cu or Cu alloy | OG (air) | 75 / 35 | 75 / 35 |
| | NOG (e.g. SF6) | 115 / 75 | 105 / 65 |
| | oil | 80 / 40 | 80 / 40 |
| Contacts, Ag- or Ni-coated | OG | 115 / 75 | 105 / 65 |
| | NOG | 115 / 75 | 105 / 65 |
| | oil | 90 / 50 | 90 / 50 |
| Contacts, Sn-coated | OG / NOG / oil | 90 / 50 | 90 / 50 |
| Bolted connections, bare Cu / Cu alloy / Al alloy | OG | 100 / 60 | 90 / 50 |
| | NOG | 115 / 75 | 115 / 75 |
| | oil | 100 / 60 | 100 / 60 |
| Bolted connections, Ag/Ni | OG | 115 / 75 | 115 / 75 |
| | NOG | 115 / 75 | 115 / 75 |
| | oil | 100 / 60 | 100 / 60 |
| Bolted connections, Sn | OG / NOG | 105 / 65 | 105 / 65 |
| | oil | 100 / 60 | 100 / 60 |
| Terminals for external conductors | bare | 100 / 60 | 90 / 50 |
| | Ag/Ni | 115 / 75 | 105 / 65 |
| | Sn | 105 / 65 | 105 / 65 |

- **Caveats:** this is not read from IEC itself; the IEC sample [TH-20] confirms only that the clause and table exist. In 2017, "OG/NOG" replaced "air/SF6". The paper's prose says tin connections are "105 °C" and tin contacts "90 °C", consistent with the table. The prose also says the bare-Cu contact limit is "35 °C above ambient", which is consistent. Mark the whole table as **verified-secondary** and confirm against IEC 62271-1:2017 Table 14 before treating it as authoritative.

### 4.2 Ambient class and high-ambient derating
- Standard service conditions (as stated by Schneider for IEC 62271-1) [TH-18], verified: ≤40 °C without derating; ≤35 °C 24-h average; ≥−25 °C (indoor class −25); altitude ≤1000 m.
- **Schneider RM6 "Climatic conditions" derating** [TH-18], verified:

| Ambient °C | 40 | 45 | 50 | 55 | 60 |
|---|---|---|---|---|---|
| Busbars 630 A (A) | 630 | 575 | 515 | 460 | 425 |
| Busbars 400 A (A) | 400 | 400 | 400 | 355 | – |
| Functions I, O, B (bushing C) (A) | 630 | 575 | 515 | 460 | 425 |
| Function D (A) | 200 | 200 | 200 | 200 | 200 |
| Function Q (fuse) | fuse-dependent | consult | consult | consult | consult |

- Schneider FAQ for an RM6 in an IP55 GRP enclosure: the ambient around the RMU must not exceed 60 °C. Circuit-breaker functions are qualified to 60 °C; the fuse-switch (Q) function is not proposed at 60 °C [TH-19]. **verified**
- A generic physics-based derating formula was **NOT FOUND** in a fetched source.
- **Derived observation:** the simple form Ir·√((θmax − θa)/(θmax − 40)) does **not** fit the RM6 table. With θmax = 105 °C it gives 605 / 580 / 553 / 524 A at 45 / 50 / 55 / 60 °C, against the published 575 / 515 / 460 / 425 A.
- The published curve is steeper: roughly −55 to −60 A per 5 K up to 55 °C. Use the manufacturer table (interpolated) rather than a formula.

### 4.3 Short-time withstand (RMU)
- RM6 options [TH-18], verified:
  - 25 kA 1 s (62.5 kA peak)
  - 21 kA 1 s or 3 s (52.5 kA peak)
  - 20 kA 1 s or 3 s (50 kA peak)
  - 16 kA 1 s (40 kA peak)
  - 12.5 kA 1 s (31.25 kA peak)
- Bushings: type A 200 A, 12.5 kA 1 s; type B 400 A, 16 kA 1 s; type C 630 A, 25 kA 1 s or 21 kA 3 s.
- Internal arc: tank 20 kA 1 s; IAC A-FL up to 20 kA 1 s (IEC 62271-200), or 16 kA 1 s depending on gas exhaust.
- The brief's "20 kA/3 s or 25 kA/1 s typical" is confirmed as options in this one manufacturer's range. It is not a universal rule.

---

## 5. Insulation ageing and failure mechanisms
- **Water treeing (XLPE/PE):** diffuse, partially conductive plume-like structures that start at defects and grow under water plus electric field. They are "not generally a reliability concern unless they are able to initiate an electrical tree" [TH-23]. **verified**
- **Electrical treeing:** grows through repeated partial discharges and is accelerated by switching transients. It raises stress on the remaining insulation and leads to breakdown. Known since 1969. Detectable by PD measurement [TH-23]. **verified**
- Mitigation (TR-XLPE, water barriers): **NOT FOUND**.
- **PD measurement:** IEC 60270:2000 governs PD measurement, with apparent charge in pC [TH-22]. **verified**
- TEV (transient earth voltage; EA Technology, 1974) is read in mV or dBmV on switchgear metalwork with no panel removal. It is likely too insensitive for solid-dielectric cable systems [TH-22]. **verified**
- Ultrasonic sensing uses 40 kHz airborne or 20–300 kHz contact sensors. Online monitoring uses HFCT and UHF sensors and SCADA alarms [TH-22]. **verified**
- **Transformer DGA:** H2 indicates PD; C2H2 arcing; C2H4 high-temperature thermal faults; CH4 and C2H6 oil overheating; CO and CO2 cellulose [TH-21]. **verified**
- The Duval triangle plots %CH4, %C2H4 and %C2H2 into fault zones, and the Duval pentagon extends this to five gases [TH-21]. Guides: IEC 60599 and IEEE C57.104 (2019 edition cited) [TH-21].
  - **Zone boundaries, gas-level limits and IEC 60599 edition: NOT FOUND.**
- **SF6 switchgear:** RM6 is a sealed-for-life pressure system, 0.2 bar gauge, factory-checked tightness, "expected lifetime of 30 years", no maintenance of live parts. Pressure detection by manometer or pressure switch [TH-18]. **verified**
  - Low-pressure lockout thresholds and generic density-monitor behaviour: **NOT FOUND**.
- **F-gas regulation (EU 2024/573) SF6 phase-out dates:** the EUR-Lex fetch failed. **NOT VERIFIED; do not use dates.**
- SF6-free alternatives: **NOT FOUND** (not searched; budget).
- Tracking in humid or dusty conditions, oil tests (BDV, moisture, acidity): **NOT FOUND**.
- Transformer paper ageing chemistry: see 1.2 [TH-07, TH-02]. Bubbles above 140 °C hot-spot [TH-02 §7.2.1].

## 6. Maintenance strategies, health index, thermography, failure rates
- Corrective, time-based, condition-based, RCM and risk-based taxonomy; health-index methods; inspection intervals: **NOT FOUND** (search budget exhausted).
- **NETA MTS/ATS infrared ΔT severity table: NOT FOUND.** The engine must not use the commonly quoted "1–3 / 4–15 / >15 °C" style thresholds until a NETA edition is read.
- Weibull or bathtub parameters for distribution transformers, cables, RMUs: **NOT FOUND**.
- Indirect, verified hints usable by the design:
  - IEC distribution transformer functional life is 180 000 h (20.55 y) at 110 °C for upgraded paper [TH-02 Table 3]
  - RM6 expected SF6 tightness lifetime is 30 years [TH-18]
  - XLPE emergency operation at 130 °C is allowed for ≤1500 h per lifetime [TH-10]

## 7. Hot climate (Gulf / Riyadh)
- Peer-reviewed Saudi or Gulf field studies: **NOT FOUND**.
- What the verified standards and catalogues already imply:
  - IEC 60076-7 design ambients are 20 °C (yearly weighted) and 30 °C (hottest month) [TH-02 §8.3, TH-06]. Wind and sunshine are acknowledged but "impracticable to take into account" [TH-02 §7.2.4].
  - Kiosks add 10 to 20 K to ambient for one 250 to 750 kVA unit [TH-02 Table 6].
  - Cable ratings degrade 5 % per 5 K of ground temperature above 30 °C, and to 0.80 at 2.5 K·m/W soil [TH-10].
  - RMU current falls to 515 A at 50 °C and 425 A at 60 °C for a 630 A unit [TH-18]. Enclosures must keep the RMU ambient ≤60 °C [TH-19].
- Solar-radiation heating of kiosks, dust on insulation, cooling issues: **NOT FOUND** in fetched sources.

---

## Implications for the engine
1. **Transformer thermal model**
   - Implement the IEC difference equations (C.6–C.11), or the exact exponential per-step update [TH-04], with state (θo, Δθh1, Δθh2, L) per transformer.
   - Use Dt ≤ τw/2: ≤2 min for distribution units with τw = 4. If the game tick is coarser, sub-step, or use the exact exponential update, which is stable at any Dt but loses accuracy if load changes within a tick.
   - Default distribution ONAN parameters (IEC 2005 Table 5 + Table E.1): x 0.8, y 1.6, R 5, Δθor 55 K, Δθhr 23 K, τo 180 min, τw 4 min, k11 1, k21 1, k22 2.
   - Note the Alliander conflict (Δθor 60, H·gr 27.6, +10 K indoor). Expose all values per asset.
2. **Ambient**
   - θa_eff = θair + enclosure correction. For kiosks use Table 6, halved for the top-oil effect, on Δθor (eq. 11).
   - Riyadh air temperature drives this directly. Keep ageing on the hot-spot profile, not on averaged ambient.
3. **Ageing and alarms**
   - Integrate V per tick: eq. (2) for Kraft paper, eq. (3) for TUP. Remaining life = budget − ΣV·dt. A budget of 180 000 h for TUP is a reasonable placeholder [TH-02 Table 3], but it should come from DECISIONS.
   - Alarm and trip bands from Table 4: 105 °C top-oil and 120 °C hot-spot (normal cyclic); 115 °C top-oil and 140 °C hot-spot (long-time emergency); current 1.5 and 1.8 p.u.; >140 °C hot-spot means bubble risk (event).
4. **Cables**
   - Ampacity = catalogue base × f_ground × f_soil × f_depth × f_group (base and factors from non-employer catalogue — see 11-assets-round2; alfanar values EXCLUDED per D-004).
   - Soil dry-out could be modelled as soil resistivity rising toward 2.5 under sustained load. That is a design hypothesis, not sourced; IEC 60853-3 exists for it [TH-13].
   - Short-circuit check: I²t ≤ k²S² with k_Cu = 143 and k_Al = 94 (90 → 250 °C).
5. **Switchgear**
   - Rated current derated by ambient, using the RM6-style table. Short-time withstand check (Ik, tk) against fault level × clearing time; scale with I²t = constant.
   - The internal-arc rating is a separate safety attribute.
6. **Condition monitoring and maintenance**
   - Only qualitative mechanisms are verified (PD, TEV, ultrasonic, DGA key gases, water and electrical trees). Any numeric thresholds, failure rates or Weibull parameters remain **placeholders requiring sources**.

## Golden tests to add (summary)
- **GT-1** IEC Annex C difference equations: 41 steps, ±0.15 K, loss of life 6.15 days.
- **GT-2** IEC Annex B exponential method: ±2 K, qualitative.
- **GT-3** IEC Annex E OF overload: θh(30 min) = 114.2 °C, loss of life 0.14 day, maximum rise 94 K.
- **GT-4** Derived distribution steady state: 98 °C at K = 1, θa = 20 °C, so V = 1.
- **Ageing table:** IEC Table 2 values (V(110) = 4.0 for Kraft; V(98) = 0.282 for TUP).
- **Cable k-factor:** Cu 240 mm² 1 s → 34.3 kA; Al 240 mm² 1 s → 22.7 kA [TH-10].

## Open questions
1. IEC 60076-7:2018 numeric tables (2018 Table 2 limits, Table 3 current limits, Table 4 thermal characteristics, Annex H and I examples). Did the distribution-transformer short-time emergency limits change, as Alliander's 115/160 °C suggests? This needs a purchased or library copy.
2. Which IEC 60076-7 edition do SEC specifications reference, and do they specify thermally upgraded paper for distribution transformers?
3. Actual Saudi kiosk transformer data: Δθor and Δθhr from type tests, and whether the temperature-rise test was done inside the kiosk (which removes the Table 6 correction).
4. IEC 62271-1:2017 Table 14 should be read directly to confirm the CPRI reproduction [TH-17].
5. Generic switchgear high-ambient derating rule, and whether SEC specifies 50 °C or 55 °C design ambient for RMUs.
6. NETA MTS thermography ΔT table (edition and values): **NOT FOUND**.
7. IEC 60599 / IEEE C57.104 gas limits and Duval zone coordinates: **NOT FOUND**.
8. Weibull or bathtub parameters and failure rates for MV cables, joints, RMUs and distribution transformers: **NOT FOUND**.
9. Gulf-climate field studies (solar gain on kiosks, dust, soil resistivity in Riyadh): **NOT FOUND**.
10. MV XLPE cable thermal time constants for dynamic rating: **NOT FOUND**.
11. EU F-gas Regulation 2024/573 SF6 dates: the fetch failed, so they must be verified before use.
12. The IEC 60287-1-1 equation text and IEC 60364-4-43 k table should be read directly.
13. Table 6 cell for "poor ventilation, 1 unit, 250 kVA" (OCR-garbled; 7 inferred).
