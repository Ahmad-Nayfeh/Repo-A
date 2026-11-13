# 06 — Power quality, transients, DER & frequency balancing, arc flash, LV/home side

Research notes for the game model. Every number carries a source ID from `research/sources/06-pq.md` and a status:
**verified** (I read the page/PDF), **verified (secondary)** (I read a utility/vendor/press summary, not the standard or report itself), **snippet-only** (I saw it only in a search-result snippet), **uncertain/conflicting**, **NOT FOUND**.

Ground rules applied:
- Paywalled standards (IEEE 1159, IEEE 519, IEC 61000-4-30/-4-15, EN 50160, IEC 62271-200, IEEE 1584, NFPA 70E) were **not** read in full. Where a number comes from a utility handbook or public sample that reproduces the table, it is marked "verified (secondary)" and the edition is stated.
- The safety content is about concepts only. Nothing here is a live-work procedure.
- The web-search budget ran out near the end of the session. The IEC 62271-200 IAC acceptance criteria, and a few others listed under "Open questions", could not be checked.

---

## 1. Voltage sags, swells, interruptions; supply-voltage limits; equipment tolerance; sag types

### 1.1 IEEE 1159 categories
A PacifiCorp handbook reproduces this table and says it is "derived from IEEE 1159" [PQ-01, verified (secondary)]:

| Category | Duration | Magnitude |
|---|---|---|
| Instantaneous sag | 0.5–30 cycles | 0.1–0.9 pu |
| Instantaneous swell | 0.5–30 cycles | 1.1–1.8 pu |
| Momentary interruption | 30 cycles–3 s (as printed) | <0.1 pu |
| Momentary sag | 30 cycles–3 s | 0.1–0.9 pu |
| Momentary swell | 30 cycles–3 s | 1.1–1.4 pu |
| Temporary interruption | 3 s–1 min | <0.1 pu |
| Temporary sag | 3 s–1 min | 0.1–0.9 pu |
| Temporary swell | 3 s–1 min | 1.1–1.2 pu |
| Sustained interruption | >1 min | 0.0 pu |
| Undervoltage / overvoltage | >1 min | 0.8–0.9 / 1.1–1.2 pu |
| Voltage unbalance | steady state | 0.5–7 % (typical) |
| Flicker | intermittent, <25 Hz | 0.1–20 % (typical) |

- **Uncertain/conflicting:** search snippets [PQ-02] show IEEE 1159-2009 giving a momentary interruption as **0.5 cycles–3 s**, not 30 cycles–3 s. They also show the temporary swell as 1.1–1.2 pu in 2009 against 1.1–1.4 pu in 1995. **Engine rule:** a sag is 0.1–0.9 pu for 0.5 cycle to 1 min. This core definition is consistent across [PQ-01] and [PQ-02]. Treat the sub-category boundaries as edition-dependent.
- Fault-caused sags last "from 30 milliseconds to a few seconds" until protection clears them. A breaker that cannot clear a fault locks out after "usually two or three" attempts [PQ-01, verified].
- Capacitor-bank closing produces ringing for "two cycles or less" that "may exceed +150 percent" of steady-state voltage, often with multiple zero crossings [PQ-01, verified].

### 1.2 EN 50160 (European public-supply voltage characteristics)
- 1994 first edition, from a 1997 instrument vendor sheet [PQ-03, verified (secondary)]. The 95 % non-conformity rule (Nn/N ≤ 5 %) runs over a 1-week campaign. Limits:
  - Frequency 50 Hz ±1 % (95 %), +4/−6 % (100 %)
  - Slow voltage variation Un ±10 %
  - Flicker Plt ≤ 1
  - Unbalance 2 %
  - Harmonics: individual limits, THD 8 %
  - Dips <90 % Un
  - Short interruptions <1 % Un, ≤3 min; long interruptions >3 min
- 2004 Leonardo guide, citing the 1999 edition [PQ-04, verified (secondary)]:
  - A dip falls to 90 %–1 % of Uc and lasts 10 ms–1 min.
  - 95 % of 10-min means must be within 90–110 % of Un.
  - A site can see "up to 1 000" dips per year.
- Snippets [PQ-05, snippet-only]:
  - +10 %/−15 % for all values.
  - Unbalance is the negative-sequence voltage, below 2 % of positive sequence for 95 % of 10-min periods.
  - The current edition is **EN 50160:2022 (+A1:2025)**, which I did not read.
- **Note for a Saudi setting:** EN 50160 is European. The Saudi transmission figures from the 2007 Grid Code are in §3.3 [PQ-16].

### 1.3 IEC 61000-4-30 (measurement method)
Class A basics, all [PQ-18, snippet-only]:
- 10/12-cycle (~200 ms) windows at 50/60 Hz.
- Aggregation over 150/180 cycles, 10 min and 2 h (for Plt).
- A dip starts when Urms(1/2) falls below the threshold on any channel. It ends when all channels are back above threshold plus hysteresis.
- The threshold value is "typically 90 %", but I did not verify that in the standard.
- Edition 4.0 (2025) exists.

### 1.4 Equipment tolerance curves
- **ITIC (successor to CBEMA)** [PQ-06, snippet-only]:
  - Sags to 80 % for up to 10 s and to 70 % for up to 0.5 s.
  - Swells up to 120 % for up to 0.5 s.
  - Scope is 120 V / 60 Hz IT equipment. It is explicitly "not intended to serve as a design specification".
  - I did not fetch the full piecewise curve (e.g., the 0 % / 20 ms no-interruption region).
- **SEMI F47-0200** [PQ-07, verified]. Semiconductor tools must ride through:
  - 50 % for 0.05–0.2 s
  - 70 % for 0.2–0.5 s
  - 80 % for 0.5–1.0 s
  - Recommended, not required: 0 % for 1 cycle, 80 % for 10 s, 90 % continuous.
  - The same bulletin says a typical sag lasts 3–10 cycles. It cites EPRI DPQ data of about 12 utility sags per year for a typical customer.
- **Conflicting (snippet-only):** one blog gives 50 % / 50 ms, 70 % / 200 ms and 80 % / 500 ms. That contradicts [PQ-07] and is rejected.

### 1.5 Sag propagation through transformers (Bollen A–G)
Source: Bollen, IEEE Trans. PWRD 2003 [PQ-08, verified]. The paper defines seven dip types, using Table I of the paper as the definition:
- **Type A:** balanced, from three-phase (and three-phase-to-ground) faults.
- **Type B:** single-phase-to-ground fault seen at the same voltage level. It contains zero sequence.
- **Type C:** single-phase-to-ground fault seen after one Dy transformer, *or* a phase-to-phase fault.
- **Type D:** single-phase-to-ground fault after two Dy transformers, *or* a phase-to-phase fault after one Dy transformer.
- **Types E/F/G:** two-phase-to-ground faults at the location and after one or two transformers. Table I is an image I could not read, so the mapping of E/F/G is **snippet-only** [PQ-09]: Dy swaps C↔D and F↔G, and zero sequence (B, E) is lost through the transformer.

Other points from [PQ-08, verified]:
- Voltage recovers at fault-current zero. The fault-current angle is 45–60° in distribution and 75–85° in transmission.
- Two-phase-to-ground and three-phase faults recover in 2–3 steps.
- In high-impedance-grounded systems, an SLG fault "does not cause any significant dip".

**Engine takeaway:** an SLG fault on the 33/13.8 kV side shows up at LV loads after a Dyn transformer as a dip on two phase voltages, not one, with no zero sequence. This is cheap to compute with symmetrical components and is a real "expert" detail.

---

## 2. Harmonics

### 2.1 IEEE 519 limits at the PCC
PacifiCorp 2024 handbook [PQ-10, verified (secondary)] and the IEEE 519-2022 Table 1 reproduction [PQ-11, verified (secondary)]. The numbers are identical:

| Bus voltage at PCC | Individual harmonic | THD |
|---|---|---|
| V ≤ 1.0 kV | 5.0 % | **8.0 %** |
| 1 kV < V ≤ 69 kV | 3.0 % | **5.0 %** |
| 69 kV < V ≤ 161 kV | 1.5 % | 2.5 % |
| > 161 kV | 1.0 % | 1.5 % (HVDC footnote: up to 2.0 %) |

- The brief's "8 % for ≤1 kV, 5 % for 1–69 kV" is **correct for THD** (verified (secondary)).
- Current (TDD) limits for V ≤ 69 kV [PQ-10, verified (secondary)]:
  - Isc/IL <20: TDD 5 %
  - 20–50: 8 %
  - 50–100: 12 %
  - 100–1000: 15 %
  - >1000: 20 %
  - Even harmonics are limited to 50 % of these. A DC offset is not allowed.
- Limits apply at the PCC, and TDD excludes interharmonics [PQ-11].
- **Saudi transmission default** [PQ-16, verified, 2007 edition]: voltage THD 1.5 %, individual harmonic 1 % (cl. 2.4.4.2). Current harmonics follow IEEE 519-1992 unless the Connection Agreement says otherwise (2.4.4.3).

### 2.2 Sources [PQ-10, verified (secondary)]
Typical current distortion (Table 7):

| Load | Typical current distortion |
|---|---|
| Single-phase switch-mode supply | 80 %, high 3rd |
| 6-pulse converter, capacitive smoothing, no series reactor | 80 % |
| Same, with >3 % series inductance or DC drive | 40 % |
| 6-pulse with large smoothing inductor | 28 % |
| 12-pulse | 15 % |

- Characteristic harmonics are h = kq ± 1, so a 6-pulse converter produces the 5th, 7th, 11th, 13th and so on.
- LED drivers, EV chargers and PV inverters: no fetched source gives their typical distortion. **NOT FOUND.** Treat them as "switch-mode / active front end" and do not invent numbers. PacifiCorp requires inverter-based resources to meet the lowest IEEE 519 row (TRD, §8.1) [PQ-10].

### 2.3 Effects
- **Triplen harmonics add in the neutral.** "It is possible for the neutral current to be much larger than the phase current in office buildings", even with balanced loads [PQ-01, verified].
- **Transformer heating:** harmonic current heats more per ampere. If current THD exceeds 5 % at rated current, evaluate per IEEE C57.110 [PQ-10, verified].
- **K-factor** [PQ-13, snippet-only]:
  - K = Σ(Ih²·h²) / Σ(Ih²).
  - K-1 means a linear load.
  - Common ratings are 4, 9, 13, 20, 30, 40 and 50.
  - C57.110 Annex B compares the UL K-factor with the "harmonic loss factor". I did not read UL 1561.
- **Parallel resonance with PF capacitors** [PQ-12, verified]:
  - Resonant order hr comes from MVAsc and the capacitor's Mvar. The formula is an image in the article, but the variables are defined in its text.
  - Worked example: 500 MVA with 10 Mvar resonates at the 7th. That matches hr ≈ √(MVAsc/Mvar) = √50 ≈ 7.07, so the form in the brief is consistent.
  - A snippet [search, not fetched] gives the transformer form: 1500 kVA at 5 % ≈ 30 MVAsc, plus 250 kvar, gives about the 11th.
  - Mitigation: detuned filters put the parallel resonance below any expected harmonic. The specific "4.7th" detuning was **NOT FOUND** in a fetched source.
  - PacifiCorp also warns that PF capacitors "can resonate with" drives and cause high voltage at light load [PQ-01, verified].

### 2.4 Mitigation [PQ-10, verified (secondary)]
- Fix the problem at the source: low-distortion drives, 12/18-pulse, built-in filtering.
- Use external filtering or active conditioning for existing loads.
- Put the offending load on a dedicated circuit (copiers, welders, MRI) [PQ-01].
- Use a neutral third-harmonic blocking filter where neutral current is high [PQ-01].

---

## 3. Flicker, unbalance, over/undervoltage with PV

### 3.1 Flicker
- **Pst** is measured over 10 min. **Plt** is the cubic mean of 12 Pst values over 2 h [PQ-14, verified (tertiary); PQ-04].
- The formula Plt = ∛(Σ Pst³ / 12) is the standard form, but I only saw it described as a "cubic mean". **Verified (tertiary)** for the description; the exact formula was not read in IEC 61000-4-15.
- The flickermeter models a 230 V/60 W or 120 V/60 W incandescent lamp [PQ-14].
- Pst = 1 is the "threshold of irritability", the level at which half of test subjects noticed flicker [PQ-15, verified (secondary)].
- Limits:
  - IEC 61000-3-3 equipment limits: Pst 1.0, Plt 0.65 [PQ-14].
  - EN 50160 supply: Plt ≤ 1 for 95 % of a week [PQ-03/05].
  - **Saudi Grid Code** transmission connection points: **Pst 0.8, Plt 0.6** (95th percentile, one week) (cl. 2.4.6.2). Repetitive voltage steps ≤1 %, other excursions up to 3 % (2.4.6.1) [PQ-16, verified].
- The maximum-sensitivity frequency (~8.8 Hz) is **NOT FOUND** in a fetched source.

### 3.2 Voltage unbalance
- **Definitions** [PQ-17, snippet-only]:
  - NEMA: maximum deviation from the average line voltage, divided by the average.
  - IEC ("true"): V2/V1, negative to positive sequence.
  - Below 5 %, the two differ by at most 0.8 % (one paper).
  - NEMA MG1 advises against running motors above 5 % unbalance.
- **Limits:**
  - EN 50160: 2 % for 95 % of 10-min values [PQ-03 verified (secondary); PQ-05 snippet].
  - Saudi Grid Code: a user must not cause more than 1 % phase-to-phase unbalance at the connection point (2.4.5) [PQ-16, verified].
- Motor heating per % unbalance: one snippet gives "2.3 % → +30 °C". The source is unconfirmed, so it is **uncertain**. Do not use it.

### 3.3 Voltage limits and PV-driven over/undervoltage
- **Saudi transmission** (110–380 kV) [PQ-16, verified, 2007]: ±5 % normal, +10 % for ≤30 min.
- **PV voltage rise and reverse power flow** [PQ-42, snippet-only]:
  - PV injection usually raises voltage, but in some cases it can lower it even at unity PF.
  - Reverse power flow breaks one-way protection and regulation assumptions.
  - Hosting capacity has "no simple rule of thumb". It depends on feeder and location.
  - The old "15 % rule" screen is called too restrictive.
  - Advanced inverters did not raise hosting capacity when PV was clustered far from the substation (NREL).
  - Hosting-capacity analysis is often a snapshot at minimum load and maximum PV.
- A real event links this to collapse: rooftop PV tripping on overvoltage contributed to the Iberian 2025 cascade [PQ-32, snippet-only] (see §7.5).

---

## 4. Ferroresonance in distribution

Primary source: Dugan (Electrotek), IEEE T&D Committee panel paper [PQ-19, verified]. Corroborating snippets: [PQ-20].

**Classic configuration.** A cable-fed transformer with an ungrounded primary (delta or floating wye) is lightly loaded or unloaded, and one or two phases are open. The cause can be:
- a blown fuse
- single-pole cutout switching
- an open-conductor fault upstream

The cable capacitance then appears in series with the transformer's nonlinear magnetizing reactance [PQ-19, PQ-20].

**Risk factors** [PQ-19, verified unless noted]:
- Higher distribution voltage. Problems appeared when utilities moved from 15 kV to 34.5 kV underground designs. Nearly all US utilities adopted grounded wye-wye at 25/35 kV.
- Low-loss (modern) transformers.
- Light load. "Normally, ferroresonance is no longer a problem once the system is loaded."
- Delta primaries with two cutouts open need more load to damp than the one-open case.
- Longer cable, and a switching point farther from the transformer [PQ-20, snippet-only].

**Symptoms seen in the cases** [PQ-19, verified]:
- Loud, irregular "growling" from a padmount.
- Charred or bubbled tank paint from flux heating.
- Erratic voltages that tripped most of a mall's 3-phase load. This made things worse because less load was left to damp the oscillation. It lasted at least 30 minutes.
- Failed LV MOV surge suppressors and blown-off surge protectors.
- UPS units cycling.
- A large arc on the last cutout that a hot stick could not extinguish, on a system crews "believed to be unloaded".
- The transformers themselves were often undamaged; load-side equipment failed.

**Mitigations** [PQ-19, verified]:
- Use three-phase switchgear instead of single-phase fuses (often uneconomic).
- Operate all three cutouts as simultaneously as possible.
- Keep the transformer loaded while switching.
- Eliminate fuses and rely on the feeder breaker.
- Prevent inadvertent fuse operation.
- Snippet-only [PQ-20]: energize the far end of the cable first; place fuses near the transformer.

**DG link** [PQ-19, verified]: when a riser-pole fuse opens on a DG-site transformer, the generator breaker opens too. The transformer is left with no load to damp ferroresonance. Dugan advises against line fuses in series with DG.

---

## 5. Lightning/switching surges, insulation levels, vacuum switching

### 5.1 Rated insulation levels (IEC 62271-1)
Source: IS/IEC 62271-1:**2007** Table 1a (Series I, 50 Hz practice) [PQ-21, verified]. Current edition is 2017+AMD1:2021 [PQ-22, snippet]; the values below are from 2007.

| Ur (kV rms) | Ud 1-min PF withstand, common (kV rms) | Up lightning impulse, common (kV peak) |
|---|---|---|
| 3.6 | 10 | 20 / 40 |
| 7.2 | 20 | 40 / 60 |
| **12** | **28** | **60 / 75** |
| 17.5 | 38 | 75 / **95** |
| **24** | **50** | **95 / 125** |
| **36** | **70** | **145 / 170** |
| 52 | 95 | 250 |

- Values across the isolating distance are higher. For example, 12 kV is 32 kV / 85 kV; 24 kV is 60 kV / 145 kV.
- **Correction to the brief:** "95 kV / 125 kV for 12–24 kV class" is not quite right. 95 kV is the higher BIL for **17.5 kV**, and the lower option for 24 kV. 125 kV is the higher BIL for **24 kV**. A 12 kV switchgear has 60 or 75 kV BIL.
- Series II (North America), Table 1b [PQ-21, verified]: 15 kV → 36 kV / 95 kV; 15.5 kV → 50 / 110; 27 kV → 60 / 125.
- IEC 60071-1:2019 Table 2 holds the range-I standard insulation levels [PQ-22, TOC verified; table values not read].
- No altitude correction up to 1000 m [PQ-22, snippet-only]. *Engine note:* this matters little for Saudi plains, but would matter for Abha-type altitudes. That is a gameplay idea, not a verified claim.

### 5.2 Surge arresters and transients
- PacifiCorp: lightning is a high-energy, very short transient, and surge arresters are the standard defence [PQ-01, verified; the text is truncated after this].
- Arrester (MOV) V-I and protective-level numbers: **NOT FOUND** in a fetched source. Do not invent them.
- Oscillatory transient classes per the IEEE 1159-derived table [PQ-01, verified (secondary)]: low frequency <5 kHz, 0.3–5 ms, 0–4 pu (typical of capacitor energizing); medium 5–500 kHz; high 0.5–5 MHz.

### 5.3 Vacuum breaker switching phenomena
All [PQ-23, snippet-only]:
- **Current chopping:** a VCB interrupts small inductive current (magnetizing current) before natural zero. One paper gives typical values of 2–6 A, another 3–5 A for CuCr contacts, and one failure case shows 9 A.
- The trapped magnetic energy rings with the load-side capacitance and produces an overvoltage, roughly E = ½LI² → ½CV². That energy-balance form is a textbook relation I did not verify from a fetched source.
- **Multiple reignitions / virtual current chopping** can occur.
- **Mitigation:** an arrester limits peak voltage but not du/dt. An RC snubber limits du/dt, and the combination is recommended. A switching-transient study is suggested for short cable runs between a VCB and a dry-type transformer; one rule of thumb cites less than 200 ft.

---

## 6. Arc flash (concept and safety message only)

### 6.1 IEEE 1584-2018 method overview
Source: Mohla & Lee IEEE presentation [PQ-24, verified (secondary); the presenters disclaim official interpretation].
- **Scope:** three-phase AC, 208 V to 15 kV. It excludes single-phase AC, DC and PPE selection.
- **Basis:** more than 1800 tests, against about 300 for the 2002 edition.
- **Electrode configurations:**
  - **VCB:** vertical conductors in a box, open-ended in air.
  - **VCBB:** vertical conductors in a box, terminating in an insulating barrier.
  - **HCB:** horizontal conductors in a box.
  - **VOA, HOA:** open-air versions of vertical and horizontal.
  - Horizontal electrodes in a box direct plasma at the worker, which is why HCB/VCBB were added.
- **Model range:**

| Voc | Bolted fault current | Gap | Working distance | Duration |
|---|---|---|---|---|
| 208–600 V | 0.5–106 kA | 6.35–76.2 mm | ≥ 12 in | no limit |
| 600 V–15 kV | 0.2–65 kA | 19.05–254 mm | ≥ 12 in | no limit |

  Enclosure height 14–49 in, with an enclosure-size correction factor for box configurations. 50 or 60 Hz.
- **Inputs needed:** single-line diagram and operating modes; bolted short-circuit current; clearing time (arc duration); enclosure size; working distance; electrode configuration. There is a "maximum 2-second" rule rationale in clause 6.9.1.
- **Process:** estimate the arcing current, which is less than the bolted current. Use it to find the protective-device operating time. Then compute incident energy (cal/cm²) and the arc-flash boundary.
- **Key physics point:** "Energy flux is assumed to be constant as a function of time", so **incident energy scales linearly with arc duration**. Halving the clearing time roughly halves the incident energy. This is the main educational lever (verified (secondary): the quote is from the slide; the linear scaling is my direct reading of it).
- **Reduced arcing current can raise energy.** The 480 V VCBB example in Annex D deals with the "effect of reduced arc current". Lower arcing current can push a time-overcurrent device onto a slower part of its curve. The example's title is verified; its numbers were not read.
- **Low-voltage note:** "Sustainable arcs are possible but less likely in three-phase systems operating at 240 V nominal or less with an available short-circuit current less than 2000 A."
- **2002 vs 2018:** the 2002 grounding factor K2 was dropped. Tests showed neutral current only in the first few cycles.

### 6.2 NFPA 70E thresholds
- **Arc-flash boundary:** the distance at which incident energy equals **1.2 cal/cm²** (≈5.0 J/cm²), the onset of a second-degree burn on bare skin [PQ-26, snippet-only; NFPA text not read].
- **PPE categories 1–4** require minimum arc ratings of **4, 8, 25 and 40 cal/cm²** [PQ-25, snippet-only].
  - Categories replaced the older HRC system in the 2015 edition, and "Category 0" was removed.
  - Table numbering differs by edition: 130.7(C)(15)(c) and (A)(b) both appear.
  - One blog says the category method applies only to systems ≤600 V. That is **uncertain**, and the claim is not confirmed.

### 6.3 Switchgear internal arc classification (IEC 62271-200)
- **Accessibility types** [PQ-27, verified (secondary)]:
  - A = authorized personnel only.
  - B = general public.
  - C = out of reach, above a public area.
- **Classified sides:** F (front), L (lateral), R (rear). Type C has no classified sides.
- **Designation:** for example "IAC AFL 20 kA, 0,5 s" = type A, front and lateral sides, tested at 20 kA for 0.5 s. "IAC AFLR 31.5 kA 1 s" appears in snippets [PQ-28].
- Clause references from the Ed. 3.0 TOC are snippet-only [PQ-28]: rating 5.103; tests 6.106 and 7.105; Annex A.
- **The five acceptance criteria are NOT verified.** I know them only from memory: doors stay closed, no fragmentation, no holes in classified sides, indicators do not ignite, earthing stays effective. Because of the no-invention rule, **do not put them in the game** until they are sourced.

### 6.4 Safety message for the game (concept)
- Incident energy depends on available fault current, arcing current, **clearing time**, working distance and geometry. Of these, clearing time and distance are what engineering can control.
- Arc-resistant (IAC) switchgear protects people **only on the classified sides, with doors closed**, at the rated current and duration [PQ-27]. An open door means no IAC credit. That is a direct reading of "classified sides"; the explicit doors-closed condition is unverified.
- Out of scope: live-work procedures, approach distances and PPE donning. The game should say "de-energize; arc-flash studies are for qualified engineers."

---

## 7. Frequency balancing and system operation

### 7.1 Swing equation and inertia
- **Swing equation:** (2H/ωs)·d²δ/dt² = Pm − Pe. H is the stored kinetic energy at synchronous speed (MJ) divided by the rating (MVA), in seconds [PQ-35, verified (tertiary)].
- **NREL guide** [PQ-34, verified]:
  - H is how long a unit could deliver rated power from its rotating energy alone.
  - Typical plants are **2–7 s**. Hydro is lowest and gas highest per unit capacity (Eto et al. 2018).
  - The Western Interconnection system-wide H is about **3.9 s**.
- **NREL worked example** [PQ-34, verified]:
  - 30 × 1000 MW units at H = 4 s; one unit is lost.
  - About 0.26 Hz/s RoCoF and about 59.7 Hz after 1 s.
  - About 2 s to reach 59.5 Hz (the assumed UFLS level). Load damping adds about 0.4 s.
  - Doubling grid size doubles inertia and the available time.
- **Derived (my arithmetic, labelled):** initial RoCoF = ΔP·f0 / (2·H·S_online). For the NREL case: 1000 × 60 / (2 × 4 × 29 000) = 0.259 Hz/s, which matches NREL's 0.26. **Use this in the engine.**
- **Low inertia from inverter-based resources (IBR):** IBRs reduce inertia, but fast frequency response from power electronics can also reduce how much inertia is needed [PQ-34, verified].

### 7.2 Reserves
- **EU SOGL** [PQ-36, snippet-only]: FCR (primary) is fully deployed within 30 s for a deviation of 200 mHz or more, with 50 % by 15 s, and must last at least 30 min. aFRR (secondary, automatic) and mFRR (tertiary, manual) take over. mFRR frees aFRR from running for many consecutive 15-min periods.
- The continental Europe 3000 MW reference incident is **not verified**.
- **GB SQSS** [PQ-29, verified]:
  - Normal infeed loss: deviation ≤ 0.5 Hz.
  - Infrequent infeed loss: not outside 49.5–50.5 Hz for more than 60 s.
  - The normal infeed loss covered is typically about 1000 MW (the report prints "c. 1,000W", a typo). The infrequent maximum is 1260 MW (Sizewell), and the infrequent-infeed upper limit is 1800 MW.
- **Saudi** [PQ-16, verified, 2007]: a reserve/alert framework of Amber/Blue/Red alerts (4.7.4). Reserve percentages were not extracted.

### 7.3 Under-frequency load shedding (UFLS/LFDD)
- **GB** [PQ-29, verified]:
  - LFDD is required to start below **48.8 Hz**, in staged "blocks" of 5 %, 7.5 % and 10 % of demand.
  - The glossary says "5 % stages of total demand (up to 40 % available)".
  - It is set by DNOs under Grid Code OC6.6.
- **Saudi/GCC:**
  - The Saudi Grid Code requires each distribution entity to provide automatic low-frequency disconnection in "discrete MW blocks". Relay settings sit in the Connection Agreement or relevant standards, and up to 100 % of a user's load may be shed (2.5.6.2–2.5.6.3) [PQ-16, verified].
  - **Stage frequencies are NOT FOUND publicly** in the 2007 code. The July 2022 update was seen only as a Scribd listing.
  - A GCC CIGRE snippet suggests shedding is unnecessary above 59 Hz. That is **snippet-only and uncertain**.
  - **Do not invent Saudi UFLS stages.** Make them a configurable placeholder and ask the owner (§Open questions).
- **Saudi frequency envelope** [PQ-16, verified]:
  - Normal 59.9–60.1 Hz.
  - Exceptional 57.0–62.5 Hz.
  - Generators: continuous 58.8–60.5 Hz; 30 min at 57.5–58.7 / 60.6–61.5 Hz; 30 s at 57.0–57.4 / 61.6–62.5 Hz.

### 7.4 GB 9 August 2019 (official ESO report) [PQ-29, verified]
| Time | Event | Cumulative loss |
|---|---|---|
| 16:52:33.490 | Lightning → single (blue) phase-to-earth fault on Eaton Socon–Wymondley circuit (≈21 kA + 7 kA infeed, ~50 % voltage depression on blue phase); cleared in **70/74 ms**; DAR re-energised it at 16:52:53. ~150 MW embedded generation trips on **vector shift** | 150 MW |
| 16:52:33.5 | Hornsea offshore wind (799 MW) drops to 62 MW → **737 MW** lost | — |
| 16:52:34 | Little Barford steam turbine trips **244 MW** | **1,131 MW** |
| 16:52:34 | ~**350 MW** embedded gen trips on **RoCoF** (>0.125 Hz/s) | **1,481 MW** |
| 16:52:58 | Frequency arrested at **49.1 Hz** (response incl. 472 MW battery) | — |
| 16:53:18 | Recovered to 49.2 Hz | — |
| 16:53:31 | Little Barford GT1A trips **210 MW** | **1,691 MW** |
| 16:53:49.398 | Frequency crosses **48.8 Hz** → LFDD sheds **931 MW (3.2 %)** | — |
| 16:53:58 | GT1B trips 187 MW (absorbed) | **1,878 MW** |
| 16:57:15 | 50 Hz restored (>1000 MW response + 1240 MW control-room actions) | — |

- Secured largest loss was 1000 MW. About **1.1 million** customers were off for 15–45 min, and all were restored by 17:37.
- About **60 trains** shut down when frequency dropped below 49 Hz, half needing a technician.
- Ipswich hospital lost power through its own protection. Newcastle airport was shed by LFDD.
- About 200 MW (modelled) of embedded generation and demand protection operated at 49 Hz, which was "not expected".
- DNOs reported 462 MW total embedded-generation loss.
- E3C [PQ-30, snippet-only]: about 600 MW embedded generation also disconnected at LFDD, so the net demand reduction was 350 MW.
- **Lessons for the game:** loss-of-mains settings (RoCoF/vector shift) on small DER turned a "secured" event into an unsecured one; LFDD worked. This is a perfect scenario template.

### 7.5 Iberian blackout 28 April 2025
Source: [PQ-31, verified (secondary), POWER summary of the ENTSO-E Expert Panel final report]; [PQ-32, snippet-only]. **I did not read the primary ENTSO-E report.**
- Final report: 472 pages, 49 experts, published March 2026 [PQ-32].
- Spain was exporting about 5 GW beforehand.
- Oscillations: 0.63 Hz forced oscillation at 12:03–12:08 and 0.2 Hz inter-area oscillation at 12:19–12:22.
- 12:32:57: a Granada 400/220 kV transformer trips (355 MW).
- 12:33:16: Badajoz area loses 727 MW of PV and solar-thermal.
- 12:33:17–18: a further 928 MW is lost. In total, more than 2.5 GW was lost in about 78 s.
- AC links to France trip on out-of-step at 12:33:21. The HVDC link is lost at 12:33:24.
- The Spanish 400 kV grid was allowed up to 435 kV transiently, against 380–420 kV elsewhere.
- Some synchronous units met their reactive-power reference less than 75 % of the time.
- **Conclusion:** "no single point of failure"; voltage control was central; an "overvoltage-induced cascading collapse"; LFDD and defence plans operated but could not stop the cascade; adding rotating mass alone would not have prevented loss of synchronism.
- [PQ-32, snippet-only]: shunt reactors were available but not activated; some generator overvoltage relay settings did not meet RfG/SO GL; rooftop PV tripped on overvoltage.
- **Game value:** it shows that an overvoltage cascade can be as deadly as an underfrequency one. It counters the "inertia is everything" simplification.

### 7.6 South Australia 28 September 2016
Source: [PQ-33, verified (secondary), news summary of AEMO's integrated final report, March 2017; the AEMO PDF exceeded the fetch size].
- Tornado-damaged transmission lines caused **6 voltage dips in about 2 min** from about 16:16.
- **9 wind farms** reduced output. Protection settings allowed only a preset number of ride-throughs in a time window.
- **456 MW** sustained reduction in under 7 s.
- About **700 ms** later the Heywood interconnector flow triggered a special protection scheme, which tripped it.
- The state went black at 16:18. About 850,000 customers were affected [search snippet].
- RoCoF and UFLS details: **NOT FOUND** in the fetched summary.

---

## 8. DER integration

### 8.1 IEEE 1547-2018 and anti-islanding
Source: NRECA guide [PQ-37, verified (secondary)].
- **Unintentional islanding:** the DER must detect and cease to energize within **2 s**, or before the utility's first reclose if that is sooner. The detection method is not specified.
- "Cease to energize" does not require an air gap.
- **IEC 62116:** islanding detection time 2 s [PQ-38, snippet-only].
- **Abnormal-performance categories:** I = minimum bulk-system needs; II = aligned with NERC PRC-024; III = low-inertia / high-penetration grids.
- **New default voltage trips** (from 1547-2018 Tables 11–13 via NRECA):

| Category | OV2 | OV1 | UV1 | UV2 |
|---|---|---|---|---|
| I | 1.20 pu / 0.16 s | 1.10 / 2.0 s | 0.70 / 2.0 s | 0.45 / 0.16 s |
| II | 1.20 / 0.16 s | 1.10 / 2.0 s | 0.70 / 10 s | 0.45 / 0.16 s |
| III | 1.20 / 0.16 s | 1.10 / 13 s | 0.88 / 21 s | 0.50 / 2.0 s |

- **Frequency (60 Hz base):** OF2 61.8 Hz / 0.16 s; UF2 57 Hz / 0.16 s; OF1 61 Hz and UF1 59 Hz with long times (180 s in the "closest-to-2003" table, 300 s in the defaults table).
- Mandatory ROCOF and voltage phase-angle-jump ride-through, and mandatory frequency droop.
- **Contrast with 2003:** 2003 allowed (and in practice used) fast trips such as 0.16 s at 59.3 Hz. Mass DER tripping is exactly the GB 2019 failure mode [PQ-29].

### 8.2 Backfeed hazard to crews (concept)
- **OSHA:** a line not de-energized and grounded per 1910.269(m)/(n) must be treated as energized. All sources, including backfeed, must be identified, opened, rendered inoperable and tagged [PQ-39, snippet-only].
- **Real case:** a lineman was electrocuted when a homeowner's portable generator backfed the line he was splicing (Pike Electric, OSHRC ALJ Docket 06-0166, 2007) [PQ-40, snippet-only].
- **Ferroresonance and DG link** [PQ-19, verified]: see §4.
- **Game message:** anti-islanding is a backup, not a safety barrier. Crews ground and test.

### 8.3 EV charging
- **AFDC Level 2:** 2.9–19.2 kW [PQ-41, snippet-only]. A typical home L2 is about 7.2 kW at 30 A (secondary snippet).
- **DC fast charging:** 50–350 kW are common market ratings, not an AFDC class. Up to about 500 kW is attributed to AFDC via secondary sites [PQ-41, snippet-only]. These are US figures; the Saudi 230/400 V context differs.
- **Feeder/transformer impact numbers** (e.g., coincidence factors): **NOT FOUND.**
- **Broken PEN at EV chargers:** see §9.3.

### 8.4 Batteries, peak shaving, demand response
- The GB 2019 response included **472 MW of battery storage** [PQ-29, verified]. This is a concrete fast-reserve example.
- Peak-shaving and demand-response specifics: **NOT FOUND** in fetched sources this session.

---

## 9. LV / home side

### 9.1 Earthing systems (IEC 60364)
All [PQ-48, snippet-only]:
- **First letter = source:** T = directly earthed; I = isolated or high-impedance.
- **Second letter = installation:** T = own earth electrode; N = exposed parts tied to the source's earthed point.
- **For TN:** S = separate N and PE; C = combined PEN; TN-C-S = PEN in the supply and separate in the installation (UK "PME").
- One source says TN-C is not permitted in consumer installations.
- IT systems continue after a first fault, with insulation monitoring.

### 9.2 RCDs and MCBs
- **RCD trip times** [PQ-43, verified, IEC 61008-1 AMD1:2002 Table 1]:

| RCD type | IΔn | 2IΔn | 5IΔn (or 0.25 A for IΔn ≤30 mA) |
|---|---|---|---|
| General type, max break time | 0.3 s | 0.15 s | 0.04 s |
| Type S (time-delayed, In ≥25 A, IΔn >30 mA), max break time | 0.5 s | 0.2 s | 0.15 s |
| Type S, min non-actuating time | 0.13 s | 0.06 s | 0.05 s (0.04 s at 5–500 A) |

  Later editions (3.x, 4.0:2024) were not checked.
- **30 mA rationale** [PQ-45, verified (tertiary)]: protection against ventricular fibrillation (IEC 60479-1 current-time zones). Wikipedia says above about 20 mA at 60 Hz through the body can be dangerous.
- **RCD types** (IEC 60755) [PQ-45]:
  - AC: sinusoidal residual current only.
  - A: adds pulsating DC.
  - F: adds composite currents.
  - B: adds smooth DC and AC up to 1 kHz.
  - DC can saturate AC/A detectors, which is why F/B exist. This is relevant to EV chargers, PV inverters and VFDs, but the EV link is my inference, not a quote.
- **MCB magnetic trip, IEC 60898-1** [PQ-44, verified (tertiary); Eaton snippet corroborates]:
  - **B 3–5 × In**, **C 5–10 × In**, **D 10–20 × In**. Example: a B10 trips instantaneously at 30–50 A.
  - The lower bound must not trip in under 0.1 s; the upper bound must trip in under 0.1 s (Eaton snippet).
  - Also K 8–15 × In and Z 2–3 × In.

### 9.3 Loss of PEN / neutral
Source: IET Wiring Matters 2021 [PQ-46, verified].
- **TN-C-S, broken supply PEN:** diverted neutral current flows through the MET, bonding, pipes and earth, so every earthed metal part rises in voltage. The rise is "up to 230 V" to earth, which is a shock risk, especially outdoors and barefoot. Hot pipework is a fire risk.
- **Broken neutral on a 3-phase section:** "up to 400 V could exist within the single-phase installation". The neutral point floats, so lightly loaded phases see overvoltage and appliances get damaged.
- A touch voltage of 70 V or more could go undetected by a standard voltage indicator.
- **Mitigations:**
  - Add an earth electrode of low enough resistance. Example: 7 kW of load needs 2.1 Ω to keep below 50 V.
  - Use TT with RCDs.
  - In the UK, report it to 105.
- **EV specifics** [PQ-47, snippet-only]:
  - BS 7671 Section 722 requires open-PEN protection for EV charge points on PME (722.411.4.1).
  - The UK sees about 400 broken-PEN incidents a year, about 10 % with shocks (HSE via trade press).
  - The 70 V touch-voltage figure appears in a Section 722 context.

### 9.4 Nuisance tripping and overloaded circuits
- **Nuisance tripping causes** [PQ-45, verified (tertiary)]:
  - Deteriorated insulation on water-heater and cooker elements is the usual cause for whole-house RCDs.
  - Cumulative leakage from many appliances.
  - Long or poorly insulated circuits.
  - Damp conditions.
  - Low-sensitivity devices.
- **Customer-side causes of disturbances** [PQ-01, verified]:
  - Loose connections, including aluminium cold-flow.
  - Code violations (multiple N-E bonds give stray current).
  - Motor starts (2 s–1 min).
  - VFD ramp settings.
  - Welders.
  - PF capacitor switching.
- Overload thermal-trip curves (e.g., 1.13/1.45 × In conventional currents): **NOT FOUND.** Not fetched this session.

---

## Which of these make good gameplay (my opinion, labelled as such)

1. **"Clearing time is the dial" arc-flash scene.** This is the strongest one. The player picks a protection setting or adds a maintenance-mode / arc-flash relay. A cal/cm² meter scales linearly with arc duration [PQ-24]. Colour bands at 1.2 / 4 / 8 / 25 / 40 cal/cm² [PQ-25, PQ-26]. It teaches the real lever without teaching live work.
2. **Ferroresonance "ghost transformer".** A puzzle. A new UD loop is energized from riser cutouts. The player hears growling and sees erratic voltage, and LV surge protectors pop [PQ-19]. The right answer: gang-operate, load it, or use three-phase switching. It is memorable, real, and rarely taught.
3. **GB 9-Aug-2019 replay** [PQ-29]. A frequency trace with RoCoF relays on small DER. The player can see how a 1000 MW "secured" loss became 1,878 MW. Toggle "1547-2018-style ride-through" and replay. Excellent for showing inertia and loss-of-mains interaction.
4. **Iberia 2025 overvoltage cascade** [PQ-31]. A contrast mission. Frequency is fine and voltage kills the system. The player must activate shunt reactors and manage reactive power.
5. **Sag-type detective.** An SLG fault upstream of a Dyn transformer. The player sees which LV phases dip and must work out the fault type and location [PQ-08]. Combine with SEMI F47 / ITIC ride-through to decide which factory lines drop [PQ-06, PQ-07].
6. **Capacitor-bank resonance trap.** Adding PF capacitors near VFDs amplifies the 5th/7th harmonic [PQ-10, PQ-12]. The player sizes a detuned filter.
7. **Broken-PEN house call.** Lights get bright in one house and dim next door, appliances fail, and the EV charger has a touch-voltage hazard [PQ-46]. Teaches TN-C-S vs TT and why EV chargers need open-PEN detection.
8. **VCB + dry-type transformer switching** [PQ-23]. A failure mystery solved with an RC snubber. Good for an MV switchgear engineer audience.
9. Lower value: flicker (visual and fun, but numerically dull); K-factor (spreadsheet-y).

## Implications for the engine

- **Event classifier:** use magnitude in pu and duration in cycles to label sag/swell/interruption [PQ-01]. Make category boundaries data-driven, with the edition as a parameter, because the 1995 and 2009 editions differ [PQ-02].
- **Three-phase phasor model with symmetrical components** is needed to:
  - propagate dips through Dyn/YNyn transformers (types A–G) [PQ-08];
  - compute unbalance as V2/V1 [PQ-17];
  - compute neutral current from triplens [PQ-01].
- **Harmonic module** (frequency domain, per order h):
  - Source spectra by load type, using typical THD from PacifiCorp Table 7 [PQ-10].
  - Network impedance Z(h) with a capacitor bank gives the parallel resonance peak hr ≈ √(Ssc/Qc) [PQ-12].
  - Compliance check against IEEE 519 tables [PQ-10/11], or against the Saudi transmission defaults [PQ-16].
- **Frequency model:** a single-bus aggregated swing equation, df/dt = ΔP·f0/(2·H·S) (validated against the NREL example [PQ-34]), plus:
  - load damping;
  - governor/FCR ramp to full in 30 s (EU) [PQ-36];
  - DER loss-of-mains trips (RoCoF 0.125 Hz/s, vector shift) [PQ-29];
  - IEEE 1547 category-based trip/ride-through tables [PQ-37];
  - a staged UFLS table. GB: 48.8 Hz start, 5 % blocks [PQ-29]. Saudi: **placeholder until the owner supplies values** [PQ-16].
- **Insulation coordination check:** compare the transient peak (switching, lightning, ferroresonance) with the equipment BIL from IEC 62271-1 Table 1a/1b [PQ-21]. Use Ur → (Ud, Up options) as a data table.
- **Arc-flash calculator:** do **not** implement the IEEE 1584-2018 regression equations unless the owner supplies the standard. They are not in any fetched source. Use a teaching proxy, E ∝ t_clear, scaled from one owner-supplied reference point, and **label it as a proxy** in the UI.
- **LV protection:**
  - MCB instantaneous bands B/C/D [PQ-44].
  - RCD timing table [PQ-43].
  - A loss-of-PEN model as a floating neutral node with unbalanced single-phase loads. The voltage shift falls out of the circuit solution, and the 230 V / 400 V bounds come from [PQ-46].
- **Every displayed number** should carry its source ID (tooltip), to meet the owner's no-invention rule.

## Open questions

1. **Saudi UFLS stage settings** (Hz and % per block) and the current Saudi Grid Code revision (2022+). Not public in the 2007 code [PQ-16]. Can the owner provide SEC/NGSA settings or the Distribution Code values?
2. **IEC 62271-200 IAC acceptance criteria** (Annex A.6) are unverified. Can the owner confirm from a copy, or from a type-test report of the MRMU/RMU products he works with?
3. **Rated insulation levels** in the current IEC 62271-1:2017+A1:2021. Are they unchanged from the 2007 Table 1a [PQ-21]? Which BIL option (e.g., 24 kV/125 kV vs 95 kV) does SEC specify for 13.8 kV and 33 kV gear? This needs the owner or SEC spec (e.g., 32-SDMS series).
4. **IEEE 1584-2018 equations and coefficients**, for a faithful arc-flash calculator. They are paywalled. Is a proxy acceptable?
5. **NFPA 70E current edition** (2024) table numbers and the 1.2 cal/cm² wording. Read only in snippets.
6. **EN 50160:2022 and IEC 61000-4-30 Ed. 4 (2025):** confirm the dip threshold (90 %) and whether limits changed. Snippets only.
7. **ITIC full curve** points (e.g., the 0 % / 20 ms region, the 140 %/200 % swell segments). The itic.org URL tried returned 404.
8. **Bollen Table I** for E/F/G mapping. Seen as an image only, with snippets for the swaps [PQ-09].
9. **Arrester data:** MOV protective levels, energy classes, and the IEC 60099-4 classification were NOT FOUND this session.
10. **Typical harmonic spectra** for LED drivers, EV chargers and PV inverters, and EV feeder coincidence factors. NOT FOUND.
11. **Primary ENTSO-E Iberian final report** and **AEMO SA integrated report:** only secondary summaries were read. Before publishing any in-game timeline, fetch the primary PDFs. AEMO's exceeded the fetch size limit; it may need a manual download.
12. **Conflicts to resolve:** the IEEE 1159 momentary interruption start (0.5 cycle vs 30 cycles) [PQ-01 vs PQ-02]; the NREL fetch path (www.nrel.gov is not reachable from this sandbox, but the OSTI copy was used) — not a conflict, just a note.
