# GAME DESIGN DOCUMENT — working title **"Grid Shift / مناوبة الشبكة"**

_Status: v1 (Phase 3). Owner: Game Design. Evidence base: `research/SYNTHESIS.md` (§2 gameplay ranking, §5 retention, §6 RTL)._

## 1. Pitch

You are the duty distribution engineer for a Riyadh-style 13.8 kV network. Feeders are open rings of package substations between two grid stations — exactly the SEC planning template [KSA-02]. Things go wrong: a digger hits a cable at 2 a.m., a joint fails at 3 p.m. in July, a fuse blows on a transformer tee-off. You read the evidence (breaker trips, fault passage indicators, crew reports), decide what to switch and in what order, keep people safe, and get customers back. Every number on screen comes from a validated engine and a cited source.

**Pillars**
1. **Real** — validated physics and documented practice; assumptions are labelled, never hidden.
2. **Decisions, not trivia** — every scenario has trade-offs (speed vs safety vs equipment duty vs overload).
3. **A new problem every day** — procedural, seeded, shareable, replayable.
4. **Two depths** — playable by a curious non-engineer; respected by a protection engineer ("Engineer view").
5. **Arabic and English as equals.**

## 2. Mode catalogue (derived from SYNTHESIS §2)

| # | Mode | Core loop | Replayability | Scoring (real metrics) | Release |
|---|---|---|---|---|---|
| 1 | **Night Shift** (fault response) | Alarm → gather evidence (SCADA, FPIs, crews) → sectionalise & restore → isolate & earth → repair | Procedural districts, fault types & places, time of day/season, crew count, automation level; daily seed; URL share | CML (primary), CI, safety violations (must be 0 for a pass), switching operations, fault-make operations on switchgear | **v1 flagship** |
| 2 | **Grading** (protection coordination) | Set relay curve/pickup/TMS and fuse sizes on a feeder → engine throws faults everywhere + inrush/cold-load → see who trips | Generated feeders; several valid answers; Pareto on speed vs selectivity margin | Selectivity (wrong trips = fail), worst clearing time, min CTI margin, nuisance trips | v1.x (next) |
| 3 | **Heatwave** (thermal operations) | July afternoon, load climbs → move normally-open points, transfer load, defer → keep transformer hot-spots and cable loading in limits | Seeded weather & demand; daily | Transformer loss of life (h), overload minutes, CML of any shedding | later |
| 4 | **Planning** (expansion) | New district demand → choose cable routes, sizes, substation sizes, NOP positions under SEC rules (50 % loading, ≤ 7.5 km, N-1) | Generated districts and growth | Capital cost [A-labelled prices], losses (kW), N-1 compliance, voltage limits | later |
| 5 | **Case files** (authored on the engine) | Investigate one phenomenon: sag detective, capacitor resonance, broken PEN, GB 9-Aug-2019 frequency replay | Authored + variants | Correct diagnosis + engineering fix | later |

Teaching moments embedded across modes (not standalone): five safety rules, permits, interlocks, phasing, "clearing time is the dial" (arc-flash proxy, labelled).

## 3. Mode 1 — Night Shift (flagship, full detail)

### 3.1 World
- District = 2 grid stations (132/13.8 kV) with 13.8 kV feeder breakers; 2–5 open rings; 6–14 package substations per ring (RMU: 2 ring LBS + tee-off fuse-switch or CB, transformer 500/1000/1500 kVA, customers).
- Cables 3×300 Al XLPE; each half-ring ≤ 7.5 km to NOP; normal loading ≤ 50 % at the scenario's peak (generator enforces DPS rules).
- Some RMUs are motorised with RTU (remote switching + remote FPI reading); the share is a difficulty setting (SEC reports ~39 % distribution automation in 2025 [KSA-13]).
- Neutral earthing: low-resistance (default) or solid (scenario flag) — changes earth-fault currents and FPI behaviour.

### 3.2 What the player sees
- **Network view** (SVG, schematic on a stylised street grid): grid stations, rings, RMUs, switch states, energised/dead/earthed/faulted colouring **plus** pattern and icon (never colour alone).
- **SCADA panel:** feeder breaker states, alarms with timestamps, remote FPI flags, loading %.
- **Crew panel:** crews, location, task, ETA.
- **Log:** every event and action, timestamped (it becomes the after-action replay).
- **Clock** with speed control (pause, 1×, 10×, 60×) — the game waits for decisions; time only matters for scoring and delays.

### 3.3 Player actions
- Remote open/close (automated RMUs, feeder CBs).
- Dispatch crew to an RMU; on arrival: read local FPIs, operate switches, apply earth on an isolated section, report.
- Reclose a feeder breaker (subject to re-energisation rules).
- Request repair crew on a proven-faulted, isolated and earthed section.
- Close NOP / move NOP (backfeed).

### 3.4 Rules that make decisions interesting (all sourced or labelled)
- Feeder breaker trips on the fault (protection from engine F3). Auto-reclose is disabled on cable feeders [OP-05, SP2].
- FPIs between the source and the fault light up; earth-only FPIs can't be trusted for **negative** indication [OP-05 §11.3]. Some FPIs may be unreadable remotely (non-automated RMUs).
- **Re-energising onto a suspect section** is allowed only as a control-room decision: after the delay (night 5 min, day 20 min) unless FPI/automation evidence says the section is healthy [OP-06 Table 10.1, OP-05 §13.8]; crews must be clear of the circuit's substations [OP-05 §13.15]. Re-energising onto the fault trips the breaker again, adds fault-make duty to the switchgear, and costs time.
- **Backfeed capacity:** closing the NOP at summer peak may overload the healthy half-ring (power-flow check); overload causes the protection to trip it or ages cables/transformers.
- **Isolation & earthing before repair:** open both ends, prove dead, earth (interlocks enforced: earth switch only on a dead, isolated section; cannot close a ring switch onto an earthed cable).
- **Safety violations** (attempting an unsafe action is blocked and logged; some are scored as violations): attempting to earth a live section, re-energising before delay without evidence, energising while crews are inside the circuit. Any scored violation ⇒ run can't earn stars.

### 3.5 Scoring
- **Primary:** customer minutes lost (CML) — Ofgem 3-min convention by default, IEEE 5-min shown alongside [OP-01/02].
- **Secondary:** customers interrupted (CI), number of switching operations, fault-make operations, overload minutes.
- **Stars vs par:** par = CML achieved by the built-in reference strategy (half-splitting by customer count, as documented by SSEN [OP-06 §12.1.2]) computed by running the engine. ★ = all customers restored except the faulted section, 0 violations; ★★ = CML ≤ 1.25 × par; ★★★ = CML ≤ par.
- **Share string:** `⚡ مناوبة/Grid Shift · Daily 2026-11-13 · ★★★ · CML 41,200 (par 45,800) · 6 ops` + replay URL.

### 3.6 Difficulty
| Lever | Easy | Normal | Hard | Expert |
|---|---|---|---|---|
| Rings / substations | 1 / 6–8 | 2 / 8–10 | 3 / 10–12 | 4–5 / 12–14 |
| Automated RMUs | 60 % | 40 % | 25 % | 10 % |
| Crews | 3 | 2 | 2 | 1 |
| Time of day/season | night, winter | random | summer afternoon | summer peak |
| Complications | none | earth-only FPIs | + backfeed overload risk | + second fault, unreadable FPI |

### 3.7 Fault catalogue (scenario generator)
Cable body (third-party damage), joint, termination; SLG / LL / 3-ph per seeded weights [A — shares not reliably sourced]; transformer tee-off fault (fuse operates, ring stays up); evolving second fault on hard levels. Weights by component use EPRI medians (cable 1.3, joints 0.4, terminations 0.2 per 100 conductor-mi·yr) [AS2/SP2].

## 4. Long-term retention
1. **Daily challenge** per mode (UTC-date seed; same for everyone; one scored attempt, unlimited practice after).
2. **Career**: districts unlock in sequence (training ring → suburban → dense centre → summer peak); each district introduces one concept (FPIs, backfeed capacity, earthing, automation, second faults).
3. **Free play / sandbox**: any seed, any difficulty, toggles; scenario URL sharing.
4. **Personal bests & streaks** (localStorage), **verifiable replays** via URL (serverless trust).
5. **Engineer view**: phasor/sequence values, relay curves, fault currents, loading tables — depth for engineers, optional for others.
6. **New modes on the same engine** (Grading next) keep the game growing.

## 5. Onboarding (non-engineers) and depth (engineers)
- **Training ring** (guided): 1 ring, 6 substations, night, all automated. Concept cards introduce one idea at a time (pretraining on names: grid station, feeder, RMU, NOP, FPI) [GD-47 principle].
- **Worked example first, then fading** [GD-46]: the first fault is solved with prompts; the second with hints on request; the third alone.
- **Explain after failure**: results screen replays the timeline with "what happened and why" (e.g., "Breaker tripped again: you re-energised the section containing the fault. FPI at RMU-7 had flagged.").
- **Glossary** (AR/EN) with sources, reachable from every term.
- **Model notes** page lists every simplification and assumption (from FIDELITY).

## 6. Feel
- Calm control-room aesthetic, dark theme default (night shift), light theme available.
- Synthesized sounds: alarm chime on trip, relay click, crew radio blip, restore chord; mute toggle; no audio before first gesture.
- Motion: energisation "flow" animation along cables (reduced-motion: static).

## 7. Out of scope for v1
Accounts, servers, global leaderboards, multiplayer, 3-phase/LV detail, EMT phenomena, real Riyadh geography.
