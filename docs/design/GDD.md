# GAME DESIGN DOCUMENT — **Grid Shift / مناوبة الشبكة**

_Status: v2 (after independent design review `docs/design/REVIEW-phase3.md`, 30 findings; v1 scope per D-011). Owner: Game Design._
_Evidence base: `research/SYNTHESIS.md` (§2 gameplay ranking, §5 retention, §6 RTL)._

## 1. Pitch

You are the duty distribution control engineer for a Riyadh-style 13.8 kV network: open rings of package substations between two grid stations, the SEC planning template [KSA-02]. A cable fails at 2 a.m., or a digger strikes one at 3 p.m. in July. You buy evidence (relay records, fault passage indicators, crew reports, damage reports), choose what to switch and in what order, keep people safe, hand the faulted section over **dead, isolated and earthed under a permit**, and get every customer back. Every number on screen comes from a validated engine and a cited source; every assumption is labelled.

**Pillars**
1. **Real**: validated physics and documented practice; assumptions labelled.
2. **Decisions under uncertainty**: evidence has cost, delay and reliability. Wait for certainty, or act now and spend switchgear duty?
3. **A new problem every day**: procedural, seeded, reproducible, shareable.
4. **Two depths**: plain language for newcomers; an Engineer view with the measured quantities a protection engineer expects.
5. **Arabic and English as equals.**

## 2. Mode catalogue (from SYNTHESIS §2)

| # | Mode | Core loop | Scoring (real metrics) | Release |
|---|---|---|---|---|
| 1 | **Night Shift** (fault response) | Alarm → buy evidence → sectionalise and restore → isolate, earth, permit → repair → return to normal | Customer-minutes lost (CML), customers interrupted; separate safety and asset record | **v1** |
| 2 | **Grading** (protection coordination) | Set relays and fuses on a feeder; the engine applies faults, inrush and cold load | Selectivity (any wrong trip fails), worst clearing time, minimum grading margin | v1.x (next) |
| 3 | **Heatwave** (thermal operations) | July afternoon: transfer load between rings, keep transformer hot-spots in limits (IEC 60076-7:2005 + SEC 51-SDMS-04 parameters) | Transformer loss of life (h), overload minutes, CML | later |
| 4 | **Planning** (expansion) | New district: routes, cable and substation sizes, NOP positions under SEC DPS rules | Cost incl. SEC loss capitalisation T = P + 11000·C + 4000·W, losses, voltage-band and N-1 compliance | later |
| 5 | **Case files** | One phenomenon per case: sag detective, capacitor resonance, broken PEN, GB 9 Aug 2019 replay | Correct diagnosis and fix | later |

## 3. Mode 1 — Night Shift (v1)

### 3.1 World
- District sizes for v1 (D3-20): **Easy 1 ring, Normal 2 rings, Hard 3 rings**, 6–12 package substations per ring (≤ 36 RMUs). Each ring is an open loop between grid station A and grid station B, with the NOP at an RMU [KSA-02].
- Cable 3×300 Al XLPE (individually screened cores **[A]**); each half-ring indicatively ≤ 7.5 km to the NOP.
- Loading: Easy and Normal networks follow the DPS planning rule (≤ 50 % at the design peak). Hard networks are **"stressed beyond the planning rule"** (half-rings at 55–65 %) **[A]** ("real networks may exceed planning limits; not sourced"), and there is a 40 °C-ground summer variant (D3-14).
- RMU: 2 ring LBS + tee-off fuse-switch, FPI earth-only (default) or three-phase. Some RMUs are motorised with an RTU: remote switching plus remote FPI reading.
- Earthing: low-resistance (default **[A]**) or solid, as a scenario condition. The engine computes the consequences: earth-fault level, screen I²t, FPI behaviour.

### 3.2 Time model: plan in pause, consequences in time (D3-02)
The game is turn-based in effect. The clock runs only when the player advances: **"Advance to next event"** (crew arrival, delay elapsed, repair done) or a time step. Tension comes from irreversibility (switchgear duty, trial-close outcomes, damage-site risk) and from the daily's single scored attempt. A "Live shift" ruleset is parked for v1.x.

### 3.3 Evidence sources (D3-01). The core decision is which evidence to buy.
| Evidence | Cost and latency | Reliability | Basis |
|---|---|---|---|
| **Source CB relay record** (phases involved, magnitudes, residual) | free, instant | exact measurement; distance is ambiguous because fault resistance is unknown | engine SC result at the CB [V method] |
| **Remote FPI** (automated RMU) | free, instant if comms up | earth-only types miss low-residual faults; stale flags possible **[A]** | [P-03/04], [OP-05 §11.3] |
| **Local FPI read** by a crew | crew travel and time | as above | same |
| **Customer calls** | arrive over minutes | show which substations are off, not where the fault is | **[A]** timing |
| **Damage report** (third-party strike) | seeded; may be late or absent | gives the location; **forbids re-energising that section until the site is attended and made safe** (D3-12) | [OP-06 §12.2] |
| **Trial close** of the source CB onto an unproven section | uses CB fault-operation duty; trips again if the fault is there | certain result | [OP-05 §13.8, §13.18–13.20] |

Daily **condition of the day** rotation (D3-04): solid-earthing district, heat (40 °C ground), one crew, SCADA comms loss, stale FPIs, damage-report day.

### 3.4 Actions
- Remote open or close (motorised RMU, source CB). Comms loss disables this for affected RTUs.
- Dispatch a crew to an RMU. On site: read FPIs, operate switches, **secure an isolation point** (lock + caution notice; inhibit remote control on motorised RMUs), apply the earth switch, **issue a permit** for the faulted section, report.
- Trial-close the source CB, or close an LBS/NOP onto an unproven section, only through the **pre-switching checklist** (§3.5).
- Request repair (needs a permit). Repair duration is seeded (4–8 h **[A]**); "advance" skips it.
- Return to normal: restore the normal running arrangement and NOP after repair, **break-before-make** between grid stations (paralleling two grid stations is forbidden by default **[A]**, D3-16).

### 3.5 Safety model (D3-08, D3-11, D3-13)
- **Interlocks are per panel only**: a panel's earth switch cannot close while its own switch is closed, and vice versa (IEC 62271-200 [07 §3.5]). **Nothing mechanical protects the remote end of a cable.** That protection is procedural: secured isolation points, earths and permits. The game blocks closing any switch that bounds a section with an applied earth or an open permit, and labels the block a **safety-rule / permit block**, not an interlock.
- **Pre-switching checklist** before energising a possibly-faulted section. The engine verifies it:
  1. justification, chosen by the player: delay elapsed ("UK DNO example rule-set": 5 min 22:00–06:00, 20 min otherwise [OP-06 Table 10.1], parameterised), or a reliable **three-phase** FPI shows healthy, or a remote sectionalising result proves it;
  2. no crew at any substation on that circuit [OP-05 §13.15];
  3. no unattended damage report on the section;
  4. switching device and its remaining duty: **CB trial close is preferred**; closing an LBS/NOP onto an unproven section is allowed by the ruleset but uses scarce making duty (making-class counts **[A]** until sourced).

  A wrong justification is refused with the reason.
- **Near misses**: blocked attempts are logged and shown, but cost no stars.
- **Stars are removed only by what actually happened**: energising a section with an unattended damage report, or exceeding switchgear duty. Gates make energising with crews on the circuit impossible.
- Notice shown in the tutorial and Model notes: *"The game's switching logic follows a generic safe sequence (UK DNO model). It is not SEC's operating rules, not an authorisation, and not a substitute for training."*

### 3.6 Physics that drives the decisions
- Protection: source-CB phase and earth IDMT/DT (IEC curves); trips emerge from engine fault currents. Tee-off fuses are rated parts only in v1 (no sourced fuse curves ⇒ transformer tee-off faults are not in the v1 catalogue). Auto-reclose is disabled on cable feeders [OP-05 §12.1, SP2].
- FPIs flag when the current **through the sensor** (phase, or residual 3I0 including capacitive contributions) exceeds pickup. **Never scripted** (D3-09). A digger strike modelled as a near-symmetrical 3-phase-to-earth fault gives small residual current, so earth-only FPIs may stay dark.
- Fault catalogue (weights **[A]**): cable body and joint → SLG (evolution to DLG/3ph-E is v1.x); third-party damage → 3ph-E with seeded per-phase fault resistance; termination → any type (cable-side terminations only in v1). Component weights follow EPRI medians (cable 1.3, joints 0.4, terminations 0.2 per 100 conductor-mi·yr) [AS2/SP2].
- Backfeed check (D3-14): cable current vs derated steady rating (35/40 °C ground), and voltage against the **MV service band 13.1–14.5 kV** [V]. The DPS 1.5 % is shown only as the planning reference. Cold-load pickup is an **[A]** multiplier with the sensitivity shown ("with ×1.5 cold load: 118 %"). Overload is scored as **minutes above steady rating** (a conservative indicator; cable emergency ratings are not modelled).
- Earth faults: conductor and screen I²t checked (screen data borrowed from a comparable construction **[A]**); a solid-earthing district can burn a screen, which is recorded as an asset event.
- A lumped "rest of busbar" C0 per grid station **[A]** (D3-17).

### 3.7 Scoring and stars
- **Primary:** CML, Ofgem 3-min convention by default; the IEEE 5-min figure is shown alongside [OP-01/02].
- **Secondary:** customers interrupted, time to permit, switching operations, duty used, minutes above rating, near misses.
- **Par:** the **reference bot** (D3-22) uses SSEN logic: positive indication from any FPI; negative indication only from three-phase FPIs [OP-05 §11.3]; otherwise customer-count halving; nearest idle crew; earliest legal CB trial close; backfeed if checks pass. It is computed in the browser on the same seed and labelled "reference strategy". An **oracle** that knows the fault location gives the lower bound and the **regret** measure. If the bot cannot finish a daily seed, the daily re-rolls deterministically to the next seed and logs it.
- ★ end state reached (permit issued, all restorable customers back, normal arrangement restored), no star-removing events. ★★ CML ≤ 1.25 × par. ★★★ CML ≤ par.
- **Share string:** `⚡ Grid Shift · Daily 2026-11-13 · ★★★ · 41,200 customer-min (par 45,800) · 6 ops` + a reproducible replay URL carrying the version (D-010). "Reproducible", not "verifiable" (D3-07). Free play refuses today's daily seed until the scored attempt is done. The day boundary is UTC, stated in the UI.

### 3.8 Difficulty (v1)
| Lever | Easy | Normal | Hard |
|---|---|---|---|
| Rings / substations | 1 / 6–8 | 2 / 8–10 | 3 / 10–12 |
| Automated RMUs | 60 % | 40 % | 25 % |
| Crews | 3 | 2 | 2 |
| FPIs | three-phase | earth-only mix | earth-only, stale flags |
| Loading | ≤ 50 % | ≤ 50 %, summer | stressed 55–65 % **[A]**, 40 °C ground |
| Other | — | damage reports | comms loss |

## 4. Retention (v1)
1. **Daily** per mode (UTC-date seed; one scored attempt), with a condition-of-the-day rotation.
2. **Training ring**: three faded faults (§5).
3. **Free play**: any seed and difficulty; scenario URL sharing.
4. **Personal bests, streaks, regret history** (localStorage, optional).
5. v1.x: persistent "home district" (duty counts and damage carry over), career districts, Grading mode.

## 5. Onboarding (D3-06)
- **Fault 1:** concepts limited to "breaker, switch, customers off". Guided steps.
- **Fault 2:** adds FPI and NOP (backfeed). Hints on request.
- **Fault 3:** adds the delay, crews, isolation, earthing and permit. Played alone.
- CML is shown as "customer-minutes" with a live counter. Acronyms appear in Engineer view and the glossary.
- **Results timeline**: what the relay and FPIs *measured* vs what actually happened (full engine solution revealed only after the run, D3-26).

## 6. Presentation
- Desktop: district schematic (SVG) on a stylised street grid, plus panels.
- **Phone (390 px): ring-focused view** (D3-05). The selected ring is drawn as a straight line from grid station A to B, with a ring picker. Panels sit in a bottom sheet with tabs (Alarms / Crews / Log). A **list of switching points** doubles as the keyboard and screen-reader path. Tap targets ≥ 44×44 px.
- States are shown by colour plus pattern plus icon. Dark (night shift) and light themes.
- Diagram labels are short Latin IDs plus icons; Arabic names go in HTML panels and tooltips (D3-27).
- Audio: at most one synthesized trip chime with mute (only if time allows; otherwise none, not a placeholder).

## 7. Not in v1 (absent from the UI, not placeholders; see D-011)
Transformer thermal (moves to Heatwave); IEEE curves; CT saturation; self-powered relay limits; switchgear ambient derating; SAIFI/SAIDI system contribution display beyond the IEEE 5-min CML figure; Expert difficulty and second or evolving faults; career beyond training; persistent home district; phasor diagrams; PWA offline; make-before-break paralleling; Live shift.
