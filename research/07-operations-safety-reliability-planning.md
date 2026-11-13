# 07: Distribution operations, switching & safety, reliability, restoration, planning

The full bibliography is in `research/sources/07-op.md` (IDs `[OP-xx]`).

Status tags on claims:
- **V** = verified: the text was read.
- **S** = snippet-only.
- **U** = uncertain or conflicting.
- **NF** = not found.

Safety scope: everything here is conceptual and describes safe practice: dead working, remote operation, approved procedures. Nothing here is a method for live work.

---

## 1. Reliability indices

### 1.1 IEEE 1366 indices (US)

| Index | Definition (as found) | Status / source |
|---|---|---|
| SAIDI | total duration of sustained customer interruptions ÷ number of customers served | V [OP-01] slide 3 |
| SAIFI | number (frequency) of sustained customer interruptions ÷ number of customers served | V [OP-01] slide 3 |
| CAIDI | SAIDI ÷ SAIFI, which equals the average restoration time per interrupted customer | V [OP-01] slide 3; also [OP-40] |
| MAIFI | frequency of momentary customer interruptions (< 5 min each) ÷ customers served | V [OP-01] slide 3 |
| ASAI | customer-hours of service available ÷ customer-hours demanded | V but low-quality source [OP-40]; **U** |
| CEMIₙ | customers with more than *n* sustained interruptions ÷ total customers served | S (search snippets only); **U**, needs the standard |
| Momentary vs sustained | momentary is < 5 min; sustained is ≥ 5 min | V for "< 5 min" momentary [OP-01]; the DOE FLISR report says sustained is "five minutes or longer" in one place and ">5 minutes" in another [OP-04]. **U** whether exactly 5.0 min counts as sustained. Check against the IEEE 1366-2022 text. |

**Major Event Days (2.5β method)** [OP-01] slide 5, V:
- T_MED = exp(α + 2.5β). Here α is the mean and β the standard deviation of ln(daily SAIDI).
- On the dataset period: snippet sources say five years of daily SAIDI, with zero-SAIDI days excluded. This is **S**. A Kentucky PSC filing also says "five prior years" (**S**).
- In a normal distribution, 2.5β covers 99.379 % one-sided, which is about 2.3 MEDs per year.
- History: the method was introduced in the 2003 edition, and the 2012 edition left the MED definition unchanged (V).
- The 2022 edition exists [OP-20] (S). I did not obtain its changes (NF).

**US reference values (EIA 2015, IEEE 1366 basis)** [OP-01] slide 4, V:

| Utility type | SAIDI with / without major events (min) | SAIFI with / without |
|---|---|---|
| Investor-owned | 237 / 136 | 1.4 / 1.2 |
| Cooperative | 302 / 159 | 2.8 / 2.1 |
| Municipal | 115 / 50 | 0.9 / 0.7 |

### 1.2 UK Ofgem: CI and CML (Interruptions Incentive Scheme)

- **CI** = (Σ customers interrupted over all incidents × 100) ÷ total customers. The unit is customers interrupted per 100 customers per year. It counts only interruptions of **3 minutes or longer** and excludes re-interruptions within the same incident. V [OP-03] §2.3.
- **CML** = Σ customer minutes lost **over all restoration stages** of all incidents ÷ total customers. The unit is minutes per customer per year, again for interruptions of 3 minutes or longer. V [OP-03] §2.3.
- **SI (short interruption)** = customers interrupted by short interruptions (restored in < 3 min) × 100 ÷ total customers. V [OP-03].
- **RI** = customers re-interrupted × 100 ÷ total customers. V [OP-03].
- The current RIIO-ED2 RIGs keep the same measures (CIs, CMLs, SIs, RIs, ONIs) and the 3-minute incident threshold. V [OP-02] §2.1 and §2.7. Data are gathered via NaFIRS, which is administered by ENA (§2.2).
- Interruption-sequence rules, V [OP-02]:
  - §2.26: if a loss under 3 min comes first, it is reported as an SI. Once an interruption of 3 min or more is under way, later sub-3-minute losses in the same incident are not recorded.
  - §2.27 / §2.33: restorations lasting less than 3 min are ignored, and the minutes are counted as if no restoration happened.
  - §2.28: a multi-phase customer counts as interrupted if any phase is lost or has the wrong vector relationship.
  - §2.30: a multi-shot reclose sequence that succeeds in under 3 min counts as one SI.
- Other jurisdictions:
  - Australia (AEMC/AER) moved its momentary threshold from < 1 min to < 3 min. S [OP-21].
  - EU thresholds: NF (not researched in depth).

### 1.3 Ofgem CML vs IEEE SAIDI

Both are customer-minutes ÷ customers. The difference is the threshold:
- Ofgem counts interruptions of 3 min or more.
- IEEE counts interruptions of 5 min or more.

A restoration completed in 3–5 minutes is therefore a CML event under Ofgem but a momentary event (MAIFI, not SAIDI) under IEEE. This is a useful game mechanic: the scoring regime changes what "fast" means. The 3-to-5 minute window is derived from [OP-01] and [OP-03].

---

## 2. Fault location, isolation, service restoration (FLISR) on open-ring MV networks

### 2.1 Manual sectionalising: documented practice from a UK DNO (SSEN operational safety manual), all V

- **Purpose.** The procedure exists "to ensure a safe, effective and customer focussed response … thereby limiting risk to all persons involved and minimising customer minutes lost" [OP-05] §1.2. It also says that safety always takes priority over "any perceived pressure to restore supplies" (§9.2).
- **Auto-reclose.** Faults on underground cable are "almost certainly permanent". All-cable HV circuits "should have auto-reclosing facilities disabled or inhibited on the source circuit breaker" [OP-05] §12.1–12.2. This is consistent with GE: reclosing onto a faulty cable is likely to make the damage worse [OP-31] (S).
- **FPIs.** FPIs can "significantly reduce the time taken to isolate the faulted zone" [OP-05] §11.1.
  - Any FPI type may be used for *positive* indication.
  - Only three-phase FPIs, or CB-based relays that register both earth and phase fault current, should be used for *negative* indication. Treat FPIs that have not flagged with caution (§11.3).
  - FPI readings are reported to the Control Engineer, who chooses the sequence (§11.4).
- **Fault Action Plan and halving.** With no damage report and no automation, the controller follows a circuit-specific Fault Action Plan held in the OMS or network control system. The plan identifies "the first Switching point that halves the circuit by customer numbers" [OP-06] §12.1.2.
  - If the fault turns out to be towards the source, the controller next restores the healthy part "from an alternative source". In an open ring this means closing the normally open point (NOP), which "should restore half the customers in the shortest possible time" (§12.1.3).
  - The controller then subdivides again until the faulty section is found (§12.1.4).
  - [OP-05] §13.17–13.19 says the same: split at the mid-point by customer numbers, then at quarter points. Reclose from the same source as the original trip (§13.18).
- **Re-energising delays (the "test-close" question).** These come from [OP-06] Table 10.1, whose note says they also apply to the first re-energisation when fault-sectioning underground circuits. The aim is to protect third parties who may have struck the cable.
  - 6.6–33 kV with customers affected: after **5 min** between 22:00 and 06:00, after **20 min** between 06:00 and 22:00.
  - [OP-05] §13.8 lists exceptions that allow earlier re-energisation:
    - positive site indication that the damage is outside the section;
    - reliable FPI showing the section is healthy;
    - 20 min elapsed since the trip with no danger reports;
    - an automated reclose within 3 min;
    - protection grading showing the damage is outside the section;
    - automation has already proven the faulty section.
  - [OP-05] §13.9: at night, sectionalising and reclosing may be attempted after 5 min if no danger report has come in.
- **Exclusion of people.** Before any re-energisation, the Control Engineer must ensure all field staff on that circuit, other than the operator, are positively excluded from all its substations [OP-05] §13.15. At grid and primary substations the operator should preferably be outside the switchroom, or at least 15 m away (§13.16).
  - Field staff do not enter substations to assess plant without instruction (§13.13).
  - An injury report takes priority over restoration [OP-06] §12.2.2.
  - Damaged network is disconnected first, and other supplies restored, before the damage site is visited (§12.2.1).
- **Switchgear duty.** The controller tracks how many fault operations each switch and circuit breaker has done.
  - Oil CBs have limited fault-switching capability before post-fault maintenance [OP-05] §13.20.
  - It may be necessary to energise the last suspect sections one at a time if the CB's remaining capacity allows only one more fault clearance [OP-06] §12.1.8.
  - If the permitted count has been reached, one further reclose is allowed after an external inspection [OP-10] §9.9.
  - Before reclosing at 11 kV, fault level is reduced where the busbar fault level exceeds 150 MVA (100 MVA at 6.6 kV) [OP-06] §9.1.
  - Temporary protection settings may be applied during fault switching and must then be reset [OP-05] §13.11.
- **Last section.** For an all-underground 11 kV or 6.6 kV circuit where all but the last section has been restored, that section's condition is proven by re-energisation or by an overvoltage ("pressure") test "as soon as practicable and certainly within 12 hours of the initial trip" [OP-06] §12.1.5.
  - The faulted section is then isolated and earthed, the fault is pinpointed with test equipment, and the cable is excavated and proved dead before repair [OP-05] §14.
- **Automation logic** [OP-06] §13.4–13.5:
  - *Positive* mid-point FPI: remotely open the mid-point switch, then reclose the source CB immediately.
  - *Negative* mid-point FPI (3-phase FPI only): open the mid-point switch, check that the alternative supply can carry the load, then close the NOP.
- **Backfeed capacity.** Before restoring from a backfeed, consider circuit capacities, and prove the fault first wherever possible [OP-05] §13.10.

**Assessment.** Test-closing to locate a fault is a documented, controlled practice in at least one UK DNO. It is done by the Control Engineer, preferably remotely, after time delays, with staff excluded, with fault-level and duty-count checks, and always from a CB or switch rated for the duty. The risks are explicitly named in [OP-05] §8:
- third parties near an exposed faulted cable;
- making fault current beyond the switchgear's capability;
- more damage at the fault.

Practices at other utilities: NF. The game should present test-closing only as a controller decision with these guards, and never as a field "try it and see".

### 2.2 Timing and automation benefits

- **DOE SGIG, 266 FLISR operations (Apr 2013 – Mar 2014)** [OP-04] V:
  - About 270,000 fewer customers interrupted and about 38 million fewer customer-minutes.
  - CI reduced by up to 45 % and CMI by up to 51 % per event.
  - Automated FLISR actions "typically take less than one minute", while manually validated actions "can take five minutes or more".

  | Switching type | CMI without → with FLISR | CI without → with FLISR |
  |---|---|---|
  | Operator-initiated | 15,037,440 → 7,926,425 (−47 %) | 230,388 → 148,917 (−35 %) |
  | Fully automated | 20,735,169 → 9,767,110 (−53 %) | 231,799 → 104,781 (−55 %) |

  CI falls more under full automation because restorations under 5 min become momentary.
- **EPB Chattanooga** [OP-01] V:
  - 1,200 automated switches and sensors on 171 circuits; $5.6 M invested.
  - SAIDI 112 → 61.8 min/yr (−45 %); SAIFI 1.42 → 0.69 (−51 %) between 2010 and 2015.
  - Estimated benefit $26.8 M (avoided outage costs).
- **Operating hierarchy for switching (SSEN)** [OP-07] §10.2.5, [OP-08] §9.2.2:
  1. remote telecontrol;
  2. a remote panel in a separate room;
  3. a panel in the same room;
  4. an approved lanyard or umbilical device;
  5. at the apparatus.
- **Manual crew travel and RMU operation times: NF.** No published per-step timings were found (travel at night in a city, time to operate an RMU manually). Restoration time depends on manpower, the number of pending outages, location, and weather. Research papers model crew travel time but give no usable numbers. S [OP-33]. Any numbers the game uses for crew travel must be labelled as **game assumptions** or obtained from the owner or SEC data.
- **Regulatory restoration benchmarks (UK):**
  - Customers must be restored within 12 h in normal weather, or a guaranteed-standard payment is due. S [OP-30].
  - EREC P2: an HV feeder is generally Class B (1–12 MW group demand), with a "within 3 hours" restoration requirement. Since 1 Jul 2023 there is a relaxed option for feeders of 1 km or less that caps added time off supply at 10 min per customer per year. V [OP-19].

---

## 3. Switching programmes and safety rules

### 3.1 Structure of a switching schedule (UK DNO example; V [OP-07], [OP-08])

- **Definition.** A switching schedule is a "Program of steps in an Approved format" carried out by an Authorised or Senior Authorised Person or the Control Engineer (§4.3).
  - It is prepared, reviewed, approved and issued through the Network Management System where practicable (§11.1.2).
  - It is not required for immediate fault response or dangerous situations. Those use a preamble with the Control Engineer and a Switching Log Book (§9.4–9.5, §9.9).
- **Each instruction records** (§10.1.1):
  1. schedule number;
  2. sequential item number;
  3. location (and voltage);
  4. apparatus identification;
  5. intended operation;
  6. Authorised Person;
  7. Control Engineer;
  8. time issued;
  9. date.
- **Order of operations.**
  - All isolation is confirmed before earths are applied, and earths are confirmed before any safety document is issued. On restoration the order reverses: cancel the document, remove earths, remove isolation, then make live (§10.1.3–10.1.5).
  - Separate operations are itemised separately; for example, "Open & apply isolation" and "Earth" are two items (§10.1.7).
  - The recipient reads the instruction back in full (§10.1.9).
  - Steps are carried out "in strict sequence" unless the controller authorises a change [OP-08] §9.1.3.
- **On site.**
  - Checks: Right Location – Right Switch – Right Operation; clear egress; PPE; equipment in the expected state; no distress; correct oil or gas levels; no unusual smells or noises; whether the operation can be done dead [OP-08] §10.1.2.
  - STOP and CHECK [OP-07] §10.2.9.
  - Record the time and verify the result after each operation (§10.2.10).
  - Remove only one lock at a time (§10.2.11).
  - If the gear shows distress, it is operated dead only, "irrespective of any network or customer considerations" [OP-08] §10.1.3.
  - Where reasonably practicable, manual switching is done with the apparatus dead (§9.2.1).
- **Interlocks** "Shall not be overridden" under normal conditions. Overrides follow a separate approved procedure [OP-08] §10.2.
- **Reporting.** Each operation is reported back and the confirmation time recorded [OP-07] §10.3. Trips and relay flags are reported before any reset (§10.2.12–13). Emergency switching is logged and reported as soon as practicable (§10.4).

### 3.2 Safety documents (UK model distribution safety rules lineage)

V [OP-09]; the UK DSR lineage itself is S [OP-41].

- **Permit-to-Work.**
  - The HV plant must be made **Dead, Isolated, Earthed, Screened, Identified and Released** for work. SSEN calls this DIESIR [OP-09] §11.1.1.
  - It is issued by a Senior Authorised Person. The recipient reads it back and may object before receiving it, including checking the isolation and earth points (§11.1.4).
  - On clearance the recipient declares that the party has been withdrawn, tools removed, additional earths removed (or their locations recorded), and whether the plant is safe to re-energise (§11.1.8).
- **Sanction-for-Test.** The plant must be Dead, Isolated and Earthed first. The recipient takes total responsibility for safety on the isolated apparatus, including energising it from a test source [OP-09] §12.1–12.4.
- **Limitation-of-Access.** Used for work where the area must be Screened and Identified but no Permit is involved [OP-09] §13.
- **No changes after issue.** If anything must change, the document is cancelled and reissued (§9.1.8).

### 3.3 The "five safety rules" (EN 50110-1)

Status: S [OP-13]. I could not fetch the DEHN page. The wording below is consistent across the DEHN, SEW-Eurodrive and DGUV snippets.

1. Disconnect completely.
2. Secure against re-connection.
3. Verify absence of operating voltage.
4. Carry out earthing and short-circuiting. Earth first, then short-circuit.
5. Provide protection against adjacent live parts (cover or barrier).

The current edition is EN 50110-1:2023 (S). The exact wording in the standard was not checked (NF).

### 3.4 US (OSHA 1910.269)

- Under OSHA, generation work falls under 1910.269(d) and T&D lines and equipment under 1910.269(m). The correct term is "deenergizing lines and equipment for employee protection"; "LOTO" is field slang. S [OP-12].
- Sequence for a system-operator clearance, V [OP-11] (eTool guidance, not the CFR text):
  1. Request.
  2. Identify all sources, including backfeed, and write a switching order.
  3. Open the sources, render them inoperable, and tag them.
  4. Lock devices accessible to the public.
  5. Disable and tag reclosers and sectionalisers; set remote-controlled devices to local and tag them.
  6. Notify the employee in charge.
  7. Field test that the equipment is deenergized.
  8. Apply protective grounds under 1910.269(n).

  Release reverses this: grounds are removed before the clearance is released.
- Grounding: connect the ground end first and remove in reverse order (IEEE 1048). S [OP-12].

### 3.5 RMU interlocks (IEC 62271-200)

S [OP-15], a secondary summary; the standard's clause text was NF.
- Mandatory interlocks include: no closing a switch or breaker onto a closed earthing switch, and no opening a cable compartment unless the relevant earthing switch is closed.
- Access to a compartment requires the switch open and the earthing switch closed.
- Vendor example: the ABB UniSwitch cable door opens only with the switch-disconnector in the earthed position [OP-42] (S).
- Loss of Service Continuity categories: LSC1, LSC2, LSC2A, LSC2B (S).

### 3.6 Voltage indication and proving dead

- **IEC 62271-213:2021 (VDIS)** cancels and replaces **IEC 61243-5:1997** and **IEC 62271-206:2011**. S [OP-14].
- SSEN does **not** approve VPIS for proving dead. Its note cites BS EN 62271-206: "absence of an indication might not be solely due to the absence of voltage, e.g., failure of a lamp". V [OP-08] §10.5.6.
- VDS to BS EN 61243-5 may be used, after a function check (§10.5.7).
- Voltage testers are proved working before and after use, with a proving unit or known source. Internal self-test does not substitute (§10.5.3–10.5.4).
- On an RMU, the work point is proved dead "by closing all available switches to the Earth position" (§10.5.9).
- In practice VPIS lamps are still used for operational indication, but the game must not treat a dark VPIS lamp as proof that a conductor is dead.

### 3.7 Phasing before closing a ring

V [OP-08] §13.1.4–13.1.5:
- Isolation is maintained on any apparatus where HV phasing has not been checked.
- After phasing is confirmed, the switch or CB is closed "to electrically prove the System", with a delay before any re-opening so protection can operate.

Two related points from other sources:
- An Ofgem multi-phase rule counts wrong vector relationship as an interruption [OP-02] §2.28.
- When paralleling, account for the temporarily raised fault level [OP-08] §9.2.5.

---

## 4. Crew logistics realism

- **Crew count at night: NF.**
- **Response and travel times: NF.** No published city data were found.
- Factors that affect restoration time (manpower, pending outages, location, cause, weather) and the phased crew dispatch (patrol, then tree crew, then repair crew): S [OP-33].
- Field staff should be dispatched based on what the automation did first [OP-06] §12.1.1 (V). Where automation exists, reconfiguration should be done remotely before staff arrive [OP-05] §13.2 (V).
- Third-party damage is attended "as soon as possible", and a damaged cable that has not tripped is treated as a very dangerous situation [OP-05] §17 (V).
- **Recommendation:** get crew numbers, shift patterns and Riyadh travel times from the owner or SEC as **labelled game parameters**.

---

## 5. Planning and economics

- **N-1 for open rings / ~50 % loading: NF as a published rule.** It follows from simple arithmetic: if either feeder must carry the whole ring after the NOP closes, each half should normally run at or below about 50 % of the ring's emergency rating. Treat this as **derived, not cited**. The SEC Distribution Planning Standard (March 2004) exists, but no loading clauses were seen (S [OP-38]). Get the actual SEC/DPS value from the owner.
- **UK security standard.** EREC P2 is the UK reference for restoration times by demand class [OP-19] (V; details in §2.2).
- **Voltage limits.**
  - UK ESQCR 2002 reg. 27: LV is 230 V +10 %/−6 %; HV below 132 kV is ±6 %. S [OP-25].
  - SEC DPS requires that service voltage standards are met at both high and low load and that MV is 33 / 13.8 kV, but the percentages were not seen. S [OP-38]. Saudi ± values: NF.
- **Load terms.** ADMD per household = group maximum demand ÷ number of households, measured on groups of about 60 or more (S [OP-32]). Diversity factor = Σ individual maximum demands ÷ group maximum demand (S). Coincidence factor (1/diversity) and load factor (average ÷ peak): standard textbook definitions, but no authoritative source was fetched (NF/U). **Saudi ADMD values: NF.**
- **Losses.**
  - World Bank T&D losses for Saudi Arabia: 6.78 % of output (2014), an old mirror value. S [OP-29].
  - I²R losses and transformer no-load (P0) vs load (Pk) losses: conceptual only, no figure cited.
- **Total owning cost.** TOC = purchase price + A·P0 + B·Pk. A and B are the present value of 1 W of no-load and load loss over the evaluation life, set by each utility. S [OP-23]. Example values: none adopted.
- **Value of lost load.**
  - GB (London Economics 2013): £16,940/MWh average for domestic + SME. RIIO-ED1 used £16,000/MWh. S [OP-24].
  - US ICE per-event costs (residential, night/evening): about $2.4 for a momentary interruption up to $11.9 for 8 h. Medium/large C&I: about $9,276 up to $89,145 per event. V [OP-01] slide 16. The table's dollar year was not visible in the extract (U).
  - Saudi VoLL: NF.

---

## 6. Commissioning tests (conceptual)

- **IEC 60502-2 after installation** (6–30 kV extruded cables), clause 20. V [OP-17], [OP-18]; with corroboration from [OP-16].
  - 2014 Ed. 3.0 added the 0.1 Hz option.
  - §20.3.1 AC options:
    - U (phase-to-phase), 15 min, at 20–300 Hz;
    - U0 for 24 h;
    - **3U0 at 0.1 Hz (VLF) for 15 min**.
  - §20.3.2: DC 4U0 for 15 min, intended only for new cables. Westnetz banned DC for polymer cables from 1997 because of space charge [OP-16].
  - National practice differs: DIN VDE 0276-620 recommends 3U0 / 60 min, and Westnetz uses 30 min [OP-16].
  - A 5-min phase-to-phase variant appeared only in a forum post. U; not used.
- **Insulation resistance.** IR is not part of routine MV cable standards. If measured, Prysmian expects more than 10,000 MΩ·km at 20 °C [OP-17] (V).
- **Outer-sheath test.** Westnetz uses 5 kV for 5–10 min [OP-16] (V).
- **Other switchgear tests: NF.** No sources fetched for CT ratio and polarity, secondary injection, contact (micro-ohm) resistance, SF6 checks, or functional and interlock tests. Keep these as conceptual checklist items. Do not put numbers on them until sourced.
- **Energising after a fault.** SSEN's proof options for a repaired or suspect last section are re-energisation or a "pressure" test [OP-06] §12.1.5 (V).

---

## 7. SCADA / RTU / DMS

- **RMU RTUs.** RTUs in secondary substations or RMUs collect switch positions, FPI and measurements, and send them to SCADA/DMS over IEC 60870-5-104, DNP3, IEC 61850 (and 101, Modbus). IEC 62351 is used to secure 104. S, vendor claims [OP-28].
- **SEC.** SEC's RMU specification for its Distribution Automation System requires the RMU to be "remotely controllable using integrated communication devices such as a RTU and a Modem". S, unofficial copy [OP-26].
- **ADMS FLISR modes.** FLISR runs either fully automated or operator-validated, from distributed or central (DMS) control, and integrates with SCADA/OMS/DMS. Vendor templates typically need customisation. V [OP-04].
- **VVO.** Not researched (NF).
- **What operators see.** Examples documented in the SSEN procedures [OP-07], [OP-05], [OP-06] (V):
  - CB trip alarms and relay flags, reported with times;
  - FPI states reported to the controller;
  - fault-level and remaining-CB-capacity considerations;
  - Network Management System logging of controller-only operations.

---

## 8. Incidents and case studies

- **EPB Chattanooga automation:** see §2.2 (V [OP-01]).
- **DOE SGIG FLISR fleet results:** see §2.2 (V [OP-04]).
- **IPART NSW safety alert (2019):** a switch was energised onto a faulted cable while upstream auto-reclose was still active. Lesson: disable auto-reclose for switching, and audit compliance. S [OP-22].
- **Boston Edison:** a cable failure triggered cascading failures, and the investigation recommended a restoration plan. S [OP-34].
- **SEC:** 2024 results claim SAIDI improved 17 % and SAIFI 19 % (S [OP-27]); no absolute values were found (NF). There is an automation platform with control centres including Makkah (V, vendor [OP-36]). A first smart, eco-friendly RMU was announced with AlFanar in July 2024 (V headline [OP-37]).
- **First-hand crew or operator accounts: NF.**

---

## Golden test candidates

### GT-1: Ofgem interruption-sequence rule (published worked example)

From [OP-02] §2.27 (V):
- Sequence: interrupted 2 min, restored 2 min, interrupted 30 min, then restored for 3 min or more.
- **Expected duration: 34 minutes**, because restorations shorter than 3 min are ignored.

Engine test: `duration([off 2, on 2, off 30, on ≥3]) == 34`.

### GT-2: Night fault on an open ring, staged restoration

All inputs are **constructed for testing** and not sourced. The formulas are verified [OP-01], [OP-03].

Inputs:
- System customers N_T = 10,000.
- A cable fault trips the feeder and interrupts 600 customers at 02:00.
- Stage 1: at t = 40 min, the mid-point split is made and the source CB reclosed. 300 customers restored.
- Stage 2: at t = 75 min, the NOP is closed. 200 customers restored by backfeed.
- Stage 3: the last 100 customers, on the faulted section's RMU, are restored after repair at t = 360 min.

| Quantity | Calculation | Expected |
|---|---|---|
| Customer-minutes | 300·40 + 200·75 + 100·360 | **63,000** |
| SAIDI contribution (IEEE) / CML (Ofgem) | 63,000 / 10,000 | **6.3 min** |
| SAIFI contribution | 600 / 10,000 | **0.06** |
| Ofgem CI | 600 × 100 / 10,000 | **6.0 per 100 customers** |
| CAIDI | 6.3 / 0.06 (= 63,000 / 600) | **105 min** |

### GT-3: Threshold edge case

Constructed scenario: automation restores 300 customers at **t = 4 min**.
- IEEE 1366: 4 min is under 5 min, so this is **momentary**. It counts in MAIFI and **not** in SAIFI or SAIDI.
- Ofgem: 4 min is 3 min or more, so it **counts** in CI and CML: 1,200 customer-minutes.

This tests that the engine applies a configurable threshold. Basis: [OP-01] and [OP-03]; the "exactly 5.0 min" boundary is **U**.

### GT-4: MED threshold

Constructed: α = −2.0 and β = 1.0 (ln of daily SAIDI in minutes). T_MED = exp(−2.0 + 2.5 × 1.0) = exp(0.5) ≈ **1.6487 min**. Any day with daily SAIDI above this is a Major Event Day. The formula is V [OP-01].

### GT-5: FLISR table arithmetic

Using DOE published values [OP-04] Table 6 (V):
- 1 − 7,926,425 / 15,037,440 = **47.3 %**.
- 1 − 9,767,110 / 20,735,169 = **52.9 %**.

The engine's percentage-reduction display can be checked against these.

---

## Implications for the game

1. **Scoring.** Compute CML and CI (Ofgem style, 3 min threshold) **and** SAIDI, SAIFI, CAIDI and MAIFI (IEEE, 5 min threshold) from the same event log. The threshold should be a configurable rule-set, since Saudi/SEC rules were not found.
   - Restoration stages matter: CML is summed per stage.
   - Restorations under 3 minutes are not counted as restorations (Ofgem rule).
2. **Correct restoration loop** (SSEN-documented):
   1. Read FPIs. Only three-phase FPIs count for *negative* indication.
   2. Split at the mid-point by **customer count**.
   3. Reclose from the original source.
   4. If the fault is on the source side, close the NOP to backfeed, after a capacity check.
   5. Halve again until the faulty section is found.
   6. Isolate and earth the faulted section, then locate and repair the fault.
3. **Safety gates the game must enforce, which also make good failure modes to teach:**
   - Auto-reclose disabled on all-cable feeders.
   - Re-energisation delay rules (5 min night / 20 min day, unless FPI or automation evidence allows earlier).
   - Staff excluded from substations before re-energising.
   - Switchgear fault-operation counts and fault-make ratings tracked.
   - Distressed gear operated only dead.
   - Interlocks never bypassed.
   - VPIS is not proof of dead.
   - Phasing checked before closing a ring.
   - Switching steps confirmed one at a time with read-back.
   - An injury or damage report overrides restoration.
4. **Remote vs manual.** Model remote telecontrol as preferred and fast (automated FLISR under 1 min; operator-validated 5 min or more, per [OP-04]). Model manual RMU operation as requiring crew travel. Crew times are **unsourced game parameters** and must be shown as such.
5. **Never model:** live working, interlock defeat, or proving dead by VPIS. Only test-close as a controller decision with the guards listed in §2.1.
6. **Planning mode:**
   - The ring-loading rule (each half carries the whole ring after a contingency) is derived and should be shown as an explanation.
   - Voltage limits, TOC A/B factors and VoLL need Saudi values from the owner. Until then, use UK/GB references clearly labelled.
7. **Commissioning mode:** the VLF 3U0, 0.1 Hz, 15 min test from IEC 60502-2 is solid. Other switchgear tests are checklist concepts only.

---

## Open questions (for the owner / further research)

1. IEEE 1366-2022: has any definition changed? Is exactly 5.0 min momentary or sustained? Exact CEMIₙ / ASAI wording. (Needs the standard.)
2. **SEC / Saudi:**
   - the reliability index definitions and thresholds SEC reports under (ECRA/SERA rules);
   - absolute SAIDI and SAIFI for the Riyadh region;
   - Distribution Code voltage tolerances;
   - DPS feeder loading and N-1 rules for 13.8 kV open rings;
   - ADMD per villa or apartment;
   - TOC A/B factors used in SEC transformer tenders;
   - Saudi VoLL.
3. SEC switching and safety rules: the equivalents of PTW, SFT and LOA; who may authorise a re-energisation to locate a fault; SEC's re-energising delay rules.
4. Crew realism: night crew count, typical Riyadh travel time to an RMU, time to operate a manual vs motorised RMU on site, and the share of RMUs with an RTU (the 40.8 % automation figure came only from a market-research snippet; **U**).
5. EN 50110-1:2023 exact wording of the five rules; IEC 62271-200 interlock clause numbers; IEC 62271-213 VDIS vs legacy VPIS terminology.
6. Commissioning: SEC acceptance values for contact resistance, SF6 checks, CT tests and secondary injection.
7. VVO and other ADMS functions; operator alarm lists from an actual DMS.
