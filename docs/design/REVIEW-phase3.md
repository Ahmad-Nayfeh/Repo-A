# REVIEW — Phase 3 design (independent, adversarial)

_Reviewer: fresh-context design reviewer (no stake in the design). Date: 2026-11-13._
_Inputs read: docs/design/GDD.md, ARCHITECTURE.md, FIDELITY.md; docs/org/*.md; research/SYNTHESIS.md; research/01, 02, 03, 07, 10 (targeted); docs/DECISIONS.md; docs/STATUS.md._
_Severity: **Critical** = blocks Phase 3 exit; **Important** = must be fixed or justified in DECISIONS before the build depends on it; **Minor** = fix when touched._

Summary: the research base is unusually strong and the design is honest about uncertainty. The four main weaknesses are: (1) v1 is scoped for a team-quarter, not one session; (2) the core loop can collapse into a procedure once FPIs are readable, and the game currently has no source of real uncertainty beyond missing FPIs; (3) a few safety and physics statements would make an MV engineer wince (remote-end "interlock", pure phase-to-phase faults on screened cable, an unconditional fault-current property, voltage-drop limit choice); (4) some gates are not measurable as written (fps in headless CI, "clear margin", agent-judged fun, determinism only on V8).

---

## A. Fun

### D3-01 — Important — Core loop collapses into a procedure when evidence is complete
- **Location:** GDD §3.4, §3.6 (Easy 60 % automated, Normal "earth-only FPIs" as the only complication).
- **Problem:** with readable three-phase FPIs the fault is bracketed at once (last lit / first unlit). The remaining actions are fixed: open two switches, reclose the source CB, close the NOP. After a dozen runs the player executes a recipe. The only real uncertainty in the design is "FPI missing, earth-only or unreadable". Half-splitting is then the textbook answer. That makes it rote too.
- **Why it matters:** the "Decisions, not trivia" pillar and the long-lived goal both fail if day 30 plays the same as day 3.
- **Fix:** add sourced or labelled **evidence sources with different cost, latency and reliability**, so choosing which evidence to buy is the decision:
  1. **Relay fault record at the source CB.** The engine already computes the fault current. Converting it to a distance band (uncertain because fault resistance and source impedance vary) is real control-room practice. Show it in Engineer view.
  2. **Damage or excavation report** (public, police or contractor call). It gives a location but adds a hard safety constraint (see D3-12).
  3. **LV customer calls.** These say which substations are off, not where the fault is.
  4. **FPI reliability.** Indicators not reset after the previous fault, flat batteries, and possible spurious flags from cold-load inrush (D3-17). All labelled [A].
  5. **SCADA comms loss** on some RTUs (a seeded "condition of the day").

  Then decide between "wait for a crew to read the FPI (slow, certain)" and "trial-close after the delay (fast, uses switchgear duty, risky)". That is the real SSEN trade-off [OP-05 §13.8, §13.20]. Make it the core.

### D3-02 — Important — "Tension" is undefined when the clock can be paused
- **Location:** GDD §3.2 ("the game waits for decisions").
- **Problem:** with pause, the game is a deterministic turn-based optimisation puzzle. That is legitimate, but the GDD sells "2 a.m. alarm" tension it does not deliver. At 1× a crew trip takes 20+ real minutes. At 60× a 4–8 h repair still takes 4–8 real minutes of watching.
- **Why it matters:** dead time kills sessions on phones. Pretending there is time pressure invites a half-real-time hybrid that satisfies nobody.
- **Fix:** commit to **"plan in pause, consequences in time"** for v1. Add **"Advance to next event"** (the event queue makes this trivial) and auto fast-forward when nothing is pending. Tension then comes from irreversibility (duty counts, trial-close outcomes) and the daily's single scored attempt. Park an optional "Live shift" (no pause, thinking costs game time) for v1.x as a separate scored ruleset.

### D3-03 — Important — Second half of the loop (isolate → earth → repair) carries no score pressure
- **Location:** GDD §1 core loop, §3.5 scoring.
- **Problem:** CML stops when the last customer is back, and for a cable-body fault between two RMUs **every** customer can be restored. So isolation, proving dead, earthing and repair are unscored chores, gated only by "don't violate". The scenario end condition is not defined.
- **Why it matters:** the safety teaching sits in the part of the game that players will rush or skip.
- **Fix:**
  - Define the end state as **"faulted section handed over Dead–Isolated–Earthed under a permit, and normal running arrangement restored after repair"**.
  - Add a secondary **"time to permit"** metric. It is real: the faulted section must be proven within 12 h [OP-06 §12.1.5].
  - Make the safety steps mechanical decisions (see D3-11), not confirmations.
  - Skip repair time with "advance to next event". Finish with a short "return to normal (move the NOP back)" step, which itself has switching choices.

### D3-04 — Important — Day 30 vs day 1: nothing persists, and the career is 4–5 districts long
- **Location:** GDD §4.
- **Problem:** after the career there is only the daily, which draws on the same small complication set. Asset-record events (fault-make counts, screen I²t, overload minutes) vanish at the end of each scenario.
- **Fix (cheap, uses existing engine outputs):**
  1. A **persistent "home district"** in free play/career. CB/LBS duty counts, damaged screens and repaired joints carry over (localStorage), so yesterday's choices constrain today.
  2. A **"condition of the day"** rotation for the daily: heatwave backfeed at 40 °C ground, a solid-earthing district, one crew, comms loss, a stale-FPI day, a damage-report day.
  3. An **"oracle regret"** stat (CML vs an oracle that knows the fault location) as the mastery measure.

### D3-05 — Important — Mobile: a 2–5 ring district SVG is not playable at 390 px
- **Location:** GDD §3.1–3.2; UX gate 1.
- **Problem:** up to 70 RMUs plus SCADA, crew and log panels on a 390×844 screen means unreadable labels and tap targets far below 44 px. The UX gate only checks "no overlap/clipping", which a zoomed-out diagram passes while being unusable.
- **Fix:**
  - On phones, use a **ring-focused view**: one ring is drawn as a straight line from grid station A to grid station B, with a ring picker.
  - Panels become a bottom sheet with tabs (Alarms / Crews / Log).
  - A **list view of switching points** doubles as the keyboard and screen-reader path.
  - Add to the UX gate: minimum tap target 44×44 CSS px (measured in e2e); every action reachable at 390 px without pinch-zoom.
  - Expert difficulty may be labelled "best on tablet/desktop".

### D3-06 — Minor — Onboarding jargon load
- **Location:** GDD §5.
- **Problem:** the training ring introduces RMU, NOP, FPI, CB, LBS, CML, earth-only, re-energisation delay and risk assessment within minutes.
- **Fix:** sequence the concept cards across the three guided faults:
  1. Fault 1 uses only "breaker / switch / customers off".
  2. Fault 2 adds FPI and NOP.
  3. Fault 3 adds delay, crews and earthing.

  Show CML as "customer-minutes" with a live counter, and keep the acronym for Engineer view.

### D3-07 — Minor — Daily integrity wording
- **Location:** GDD §4.1, ARCH §7.
- **Problem:** the daily seed is public, so free play can pre-solve the daily. A replay URL proves the actions produce the score, not that the attempt was a first try. "Verifiable" over-claims.
- **Fix:** free play refuses today's daily seed until the scored attempt is done (honour system). Say "reproducible" rather than "verifiable". Consider an AST (UTC+3) date boundary, or state that UTC is used.

---

## B. Accuracy

### D3-08 — Critical — Remote-end earthing is described as protected by "interlocks"
- **Location:** GDD §3.4 ("interlocks enforced: … cannot close a ring switch onto an earthed cable"); FIDELITY F6 validation ("cannot close onto an earthed section — interlock").
- **Problem:** RMU interlocks (IEC 62271-200 [07 §3.5]) are **local to one panel**. They stop the panel's own switch closing onto its own closed earth switch. Nothing mechanical stops the LBS at the **remote** RMU, or a SCADA command, from energising a cable earthed at the other end. That protection comes from procedure: securing isolation points (locks, caution notices, remote control disabled or set to "local"), safety documents and permits.
- **Why it matters:** the game would teach a dangerous misconception ("the interlock will save me") — the opposite of "teach only safe practice".
- **Fix:**
  - Model interlocks **per panel only**.
  - Add explicit player actions **"Secure isolation point"** (lock + caution notice; for motorised RMUs, inhibit remote control) and **"Issue permit"**. These are separate from the interlock.
  - The hard gate blocks closing any switch that bounds a section with an applied earth or an open permit. Its message names it a **safety-rule / permit block**, not an interlock.
  - Update FIDELITY F6, the Model notes and the tests.

### D3-09 — Important — Pure phase-to-phase faults on screened 3-core XLPE are physically rare; the "earth-only FPI shows nothing" mechanic needs a different trigger
- **Location:** GDD §3.4, §3.7; FIDELITY F8 FPI row; SYNTHESIS §2 rank 1.
- **Problem:**
  - With individually screened cores (typical 3×300 Al XLPE), insulation failure in a cable body or joint goes core → earthed screen first. Faults are SLG, or evolve to DLG/3-ph-to-earth. A "clean" LL fault with no earth current is essentially limited to terminations or air-insulated cable boxes.
  - The fault-type shares in research are overhead-line context and snippet-only [F-07]; SLG share on UG cable is NOT FOUND [SP2-26].
  - With NER earthing, a DLG fault still drives earth current, so earth-only FPIs **would** flag.
  - The realistic "earth-only FPI stays dark" case is a **near-symmetrical 3-phase(-to-earth) fault**, such as a digger cutting the cable, where the residual is small. Negative indication is also untrustworthy simply because the FPI type cannot see phase faults [OP-05 §11.3].
- **Why it matters:** a protection engineer will spot "frequent LL faults on screened cable" quickly. It undermines the credibility moat.
- **Fix:**
  - Fault catalogue by location: cable body and joint → SLG dominant, with seeded evolution to DLG/3ph-E; third-party damage → 3ph-E with a seeded fault resistance per phase; termination → any type. All weights [A].
  - Let the engine's residual current decide whether earth-only FPIs flag. Never script it.
  - Model notes: "cable construction assumed individually screened [A]".

### D3-10 — Important — Physics gate property "fault current ≤ bolted 3-ph max case" is false
- **Location:** docs/org/physics.md gate 2.
- **Problem:** on a solidly earthed system near the grid-station busbar, Z0 < Z1 is common. The source impedance is behind the delta and earthing reactance is small, so I_SLG > I_3ph there. FIDELITY F2 states the conditioned property correctly ("SLG ≤ 3-ph … with Z0 ≥ Z1"). The physics gate drops the condition.
- **Why it matters:** an unconditioned property will either fail on correct physics or push someone to "fix" the engine to satisfy it.
- **Fix:**
  - Replace it with: (a) every fault current ≤ the c_max bolted value **of the same fault type**; (b) monotone decrease with fault resistance; (c) I_SLG ≤ I_3ph only where Z0 ≥ Z1 at the fault point.
  - Also check the 21 kA rating against **max(I_3ph, I_SLG, I_DLG-earth)**, not I_3ph alone.
  - State the 132/13.8 kV grid-transformer vector group and earthing arrangement (YNd + earthing transformer vs Dyn/YNyn + NER) as data. It is currently missing from F8 and sets Z0 at the bus.

### D3-11 — Important — "Risk-assessment confirmation" is a click-through, and blocked = violation is ambiguous
- **Location:** GDD §3.3–3.4, §3.5; D-008.
- **Problem:**
  - Hard gates block unsafe actions, so "0 violations" is trivially achieved by spamming until accepted. Meanwhile "Any safety violation ⇒ no stars" makes it unclear whether a **blocked attempt** counts.
  - A single "I confirm" modal trains players to click through risk assessments. That is the wrong lesson.
- **Fix:**
  - Make the confirmation a **structured pre-switching checklist** the engine verifies: the player selects the justification (delay elapsed / reliable 3-ph FPI healthy / automation proved / protection grading), confirms exclusion of named crews, and sees the remaining duty count. A wrong justification is refused with the reason.
  - Log blocked attempts as **"near misses"** in the safety record, shown but not star-removing.
  - Stars are removed only by things that actually happened: energising with crews on the circuit (if a gate is ever relaxed by rule-set), exceeding duty, or energising a damage site.
  - Document this in D-008.

### D3-12 — Important — Damage reports and third-party safety are missing from the scenario model
- **Location:** GDD §3.7 (third-party damage), F6.
- **Problem:** the delays exist to protect people near a struck cable [OP-06 Table 10.1]. SSEN requires damaged network to be disconnected before the site is visited, and an injury report overrides restoration [OP-06 §12.2]. The design generates "digger" faults but no report and no constraint.
- **Fix:**
  - Scenario events "damage report at location X" (some seeded as delayed or absent) and, rarely, "person reported near the site".
  - Rule: a section with a damage report may not be re-energised until the site is attended and declared safe.
  - This is both an evidence source (D3-01) and a safety lesson.

### D3-13 — Important — LBS fault-making duty is used as a gate but has no source or parameter
- **Location:** GDD §3.4 ("fault-make duty remaining"), F6 gate (3); F8 RMU row.
- **Problem:**
  - Closing the NOP, or an RMU LBS, onto an unproven section makes fault current with a **load-break switch**. Making classes (IEC 62271-103 E1/E2/E3) limit the number of short-circuit making operations. The research does not source these counts, and FIDELITY F8 has no row for them.
  - SSEN says to reclose from the **source CB**, "a CB or switch rated for the duty" [OP-05 §13.18, 07 §2.1]. Oil-CB limits and "one more after external inspection" [OP-10 §9.9] are UK-specific.
  - Without the distinction, the game lets players test-close freely with LBSs or NOPs.
- **Fix:**
  - Add data rows for LBS making class/count and CB fault-operation count (sourced from IEC 62271-103 summaries or vendor datasheets, else [A]).
  - Distinguish **CB trial close** (preferred) from **LBS/NOP close onto an unproven section** (allowed only by rule-set, consumes scarce making duty, logged).
  - Model the SSEN "one further reclose after inspection" so duty exhaustion cannot soft-lock.

### D3-14 — Important — Backfeed overload hardly ever binds under the generator's own 50 % rule; voltage-drop limit is ambiguous
- **Location:** GDD §3.1, §3.4, §3.6 ("Hard: + backfeed overload risk"); F6 backfeed checks.
- **Problems:**
  - Each half-ring ≤ 50 % at peak means the whole ring ≤ 100 % of 300 A (≈ 7.17 MVA) after closing the NOP. So **thermal backfeed overload is impossible by construction**, except through cold-load pickup, whose magnitude is NOT FOUND [03 §149], or the 40 °C-ground variant (≈ 278 A).
  - **Transformers are unaffected by backfeed**: each serves the same customers. So "ages … transformers" in GDD §3.4 applies only via the [A] CLPU.
  - Voltage drop: F6 cites the DPS **1.5 % MV planning allocation** and the **−7.5 % utilisation limit**. Neither is the right contingency limit at 13.8 kV. Using 1.5 % flags every backfeed (whole ring ≈ 4.8 % [D]); using −7.5 % never binds. The MV service band 13.1 kV (≈ −5.1 %) [F8] is the defensible emergency check, and it binds marginally at 4.8 %.
- **Why it matters:** a "Hard" complication resting on an unsourced multiplier, or on a wrong limit, is a fake mechanic in disguise.
- **Fix:**
  - State the backfeed limits explicitly: thermal = derated steady rating (35/40 °C variants); voltage = MV service band 13.1–14.5 kV [V], with 1.5 % shown only as the planning reference.
  - Generate "Hard" networks as **"stressed beyond planning rule"**, e.g. a half-ring at 55–65 % at peak, labelled [A] ("real networks may exceed planning limits; not sourced"), plus the 40 °C-ground variant.
  - Keep CLPU, but show its [A] multiplier on the backfeed check, with the sensitivity visible ("with ×1.5 cold load: 118 %").
  - Remove "ages transformers" from Night Shift.

### D3-15 — Important — Cable "ageing" from overload is asserted without a cable thermal model
- **Location:** GDD §3.4 ("overload … ages cables"); F4 ("no cable thermal dynamics").
- **Problem:** with only a steady rating and no time constant, the engine cannot say anything about cable ageing or permissible short overloads. Cables have hours-long time constants, so a 30-minute overload above steady rating is often acceptable.
- **Fix:** score **"minutes above steady rating"** as a labelled, conservative indicator. Remove "ages cables". Add to Model notes: "cable emergency ratings and thermal time constants not modelled (NOT FOUND)".

### D3-16 — Important — Paralleling two grid stations through the ring (closing the NOP with both halves live) is not addressed
- **Location:** GDD §3.3 ("Close NOP / move NOP"); F1 ("briefly meshed islands").
- **Problem:**
  - Closing a NOP with both halves energised parallels two 132/13.8 kV grid stations through a 300 A cable. That causes circulating current set by the 132 kV angle difference, and a raised fault level [OP-08 §9.2.5].
  - Many utilities forbid or restrict it, or require permission and a phase-angle check. The design lets the solver handle "briefly meshed" without a rule.
  - "Move NOP" (return to normal after repair) is exactly when this arises.
- **Fix:**
  - Add a rule-set parameter: "make-before-break between grid stations: forbidden (default [A]) / allowed with angle check".
  - If allowed, the engine needs a 132 kV angle difference parameter [A] and shows the circulating current.
  - Default to break-before-make (a short interruption, counted by the 3-min convention) to avoid unsourced physics.

### D3-17 — Minor — Capacitive earth-fault current from feeders outside the modelled district is ignored
- **Location:** F2/F8 (NER 1000 A); ARCH district = 2 grid stations with 2–5 rings.
- **Problem:**
  - Each grid-station bus feeds more feeders than the modelled rings. At ≈ 1.6 A/km residual for 15 kV 3-core cable [E-08], 20 feeders × 15 km ≈ 0.5 kA capacitive. That is comparable to the 1000 A NER and changes the earth-fault magnitude and angle.
  - Separately, the 400 A phase FPI threshold can be exceeded by full-ring backfeed plus CLPU, giving spurious flags.
- **Fix:**
  - Add a lumped "rest of bus" C0 per grid station [A] (sized from feeder count × typical length).
  - Add FPI inrush restraint/time-delay as a parameter (vendor ranges).
  - Note both in Model notes.

### D3-18 — Minor — UK "reduce fault level before reclosing" rule silently dropped
- **Location:** F6 vs 07 §2.1 ([OP-06 §9.1]: reduce fault level before reclosing where busbar > 150 MVA at 11 kV).
- **Problem:** the 13.8 kV, 20 kA bus is ≈ 478 MVA. The design says it follows the "UK DNO example rule-set" but omits this rule.
- **Fix:** either include it as a rule-set step ("open bus section before trial close", which costs time) or list it under "rule-set simplifications" in Model notes with the reason.

### D3-19 — Minor — Parameter/traceability inconsistencies
- **Locations and problems:**
  1. F4: "switchgear rated current derated with ambient using a published vendor table [TH]", but SYNTHESIS §7 says switchgear derating above 40 °C is **NOT FOUND**. Contradiction.
  2. F4: screen 1-s rating taken from **NKT 3×240/50 Al-wire** while the network cable is SEC 3×300 Al. A borrowed construction must be labelled [A]/[D].
  3. Tolerances disagree. IEC 60076-7 Annex C: ±0.15 K (FIDELITY, physics gate) vs 0.1 K (SYNTHESIS). 33-bus: ±0.1 % (FIDELITY) vs ±0.05 kW (research G1).
  4. Feeder-relay settings (phase/earth pickup, curve, TMS at the source CB) and tee-off fuse ratings per kVA have no F8 rows. The phase pickup must sit above full-ring backfeed load or the backfeed itself trips.
  5. "~39 % distribution automation" [KSA-13] is undefined (share of feeders? of RMUs?). Mapping it to "% RMUs motorised" is [D].
  6. Fuse curves "from vendor data" are digitised graphs, so they are [D] with a stated digitising tolerance.
- **Fix:** correct each; add F8 rows for relay settings, fuse sizes and switchgear duty counts.

### D3-20 — Minor — District size and difficulty inconsistent across documents
- **Problem:**
  - GDD §3.1 says 2–5 rings; Easy says 1 ring; Expert says 4–5.
  - ARCH §8 says 4–6 rings / ~60 substations / ~130 buses.
  - The engineering gate says 300 buses.
- **Fix:** set one table (v1: Easy 1 ring, Normal 2, Hard 3; up to ~45 RMUs) and size budgets from it.

---

## C. Scope

### D3-21 — Critical — v1 is over-scoped for one working session; the polish bar will not be met
- **Location:** SYNTHESIS §8 engine v1; GDD §3–§6; ARCHITECTURE §3; ten department gates.
- **Problem:** the v1 list covers:
  - **Engine:** dmath; PRNG; complex LU; power flow (two golden suites); full sequence-network SC with C0 and four fault types; IEC + IEEE curves with resets; fuses with transfer current; self-powered relay; CT-saturation flag; FPIs; **IEC 60076-7 transformer thermal with SEC parameters and two golden annexes**; cable derating; conductor and screen I²t; switchgear derating; loads; CLPU; crews; reliability under two conventions with MAIFI/SAIFI.
  - **Game:** generator; par bot; URL replays with migration; PWA; audio; Engineer view (phasors); career; daily; free play; four difficulties; second fault; fading tutorial; results replay with explanations; generated Model notes; sourced bilingual glossary.
  - **Process:** 10 gate passes with agent reviews.

  Most of the transformer-thermal work is **not exercised by Night Shift at all** (D3-14: backfeed does not change transformer load).
- **Why it matters:** the owner's bar is "deep and polished, no placeholders". An over-scoped session ends with many half-built systems, which is the worst result.
- **Fix:** adopt the cut line in §E. Record it as a decision (D-011). Treat everything below the line as v1.x, **not as placeholders in v1**: nothing below the line appears in the UI.

### D3-22 — Important — Par/reference bot is a hidden large work item and is under-specified
- **Location:** GDD §3.5, ARCH §6, game-design gate 1.
- **Problem:**
  - "Half-splitting by customer count" leaves open whether the bot uses FPI evidence, how it routes crews, and how it handles delays, gates, backfeed limits, damage reports and second faults.
  - A bot that ignores FPIs makes ★★★ trivial. One that handles every complication is a planner as complex as the game.
  - If the bot soft-locks on a seed, the daily has no par.
- **Fix:**
  - Specify the bot as SSEN logic: positive indication from any FPI, negative only from 3-ph [OP-05 §11.3], otherwise customer-count halving, nearest-idle-crew dispatch, earliest legal trial close from the source CB, backfeed if checks pass.
  - Restrict v1 complications to what the bot handles.
  - Add an **oracle bound** (knows the fault location) for regret and for the gate.
  - If the bot fails, the daily falls back to the next seed (deterministic re-roll) and logs it.

---

## D. Feasibility

### D3-23 — Important — LU cost is miscounted; the 300-bus ≤ 5 ms budget fails with dense complex LU
- **Location:** ARCH §8 ("0.7 M complex flops ⇒ ≪ 5 ms"); engineering gate 3 ("engine step for 300-bus ≤ 5 ms").
- **Problem:**
  - Dense LU costs ≈ n³/3 complex multiply-adds. That is 0.73 M for n = 130 (≈ 6 M real flops) and **9 M for n = 300 (≈ 72 M real flops)**: tens of ms on desktop JS and hundreds of ms on 4×-throttled mobile.
  - SC needs at least two factorisations (Z1 = Z2, Z0) after every trip or switch. The par bot repeats this for hundreds of events at load.
- **Fix:**
  - Factorise **per energised island**: one grid station plus its feeders is ≈ 30–70 buses.
  - Better: use the network's near-tree structure. Ordering buses leaves-first gives zero fill-in, so a sparse/banded LU is O(n). Or use a backward/forward sweep for radial power flow (SYNTHESIS PF ranks it) and path-impedance Thevenin for SC.
  - Keep dense LU as the **test oracle**.
  - Redefine the gate as "topology change + PF + SC on the largest v1 district ≤ 5 ms median on CI Chromium (no throttle) and par computation ≤ 1.5 s on 4× throttle".

### D3-24 — Important — The determinism gate only compares V8 with V8
- **Location:** engineering gate 2; ARCH §5.
- **Problem:** Node and Chromium share V8, so the test cannot catch cross-engine differences. The stated reason for dmath is cross-engine portability (SpiderMonkey, JavaScriptCore/Safari on iOS, which is most Saudi phones' engine for PWAs).
- **Fix:** run the determinism hash in Playwright **Chromium, Firefox and WebKit**, using a scripted 3-scenario run including a fault, trips, backfeed and a thermal step. Also include a dmath accuracy test vs high-precision reference values (max ulp error stated), and lint `**`, `Math.pow`, `Math.hypot`, `Math.exp`, `Math.log`, `Math.cbrt`, `Math.sin/cos`, `toFixed` in state paths.

### D3-25 — Important — Long-lived replays break on every engine change
- **Location:** ARCH §7, D-010 ("old links show a notice").
- **Problem:** any physics fix changes hashes, so every old share/replay URL stops reproducing. That defeats "verifiable" and "long-lived".
- **Fix:** keep **immutable versioned builds** on Pages (`/v/<n>/`, static and free). A URL with `v=n` loads that build. The service-worker cache is keyed by version, and the root always serves latest. The model changelog explains the differences.

### D3-26 — Important — Hidden-state leakage through Engineer view
- **Location:** GDD §4.5 ("phasor/sequence values … fault currents"); ARCH Observation layer.
- **Problem:** branch fault currents or sequence values for all branches reveal the fault location and break the core puzzle.
- **Fix:** Engineer view shows **only measured quantities**: CB relay records (magnitudes, phases involved, residual), FPI flags actually read, SCADA analogues. After the scenario ends, the full engine solution is shown in the after-action review. This is good teaching ("what the relay saw vs what happened").

### D3-27 — Minor — Bidi and Arabic text inside SVG
- **Location:** localisation gate 3; UX.
- **Problem:** browsers handle bidi in SVG `<text>` inconsistently, which matters for mixed Arabic labels and `13.8 kV`. Arabic font subsetting must keep shaping (GSUB/GPOS).
- **Fix:**
  - Keep labels on the diagram as short Latin IDs plus icons. Put Arabic names in HTML tooltips/panels, or use `foreignObject`.
  - Subset by Unicode block with layout features kept, and test with a screenshot of joined forms.
  - Use `Intl.PluralRules('ar')` (six forms) in the i18n layer.
  - An owner review of the glossary is a language review, not data (it does not conflict with D-004a).

---

## E. Gates (measurable vs theatre) and QC vs QA

### D3-28 — Important — Several gates are not measurable as written
- **Problems and fixes:**
  - **Game-design gate 1, "beats random by a clear margin":** quantify, e.g. the median CML of the reference bot ≤ 0.5 × random's median over 500 seeds. A "random" policy will mostly be blocked by gates, so define it as "random legal action".
  - **Game-design gate 1, "no scenario is unsolvable":** quantify as "the reference bot reaches the end state in 100 % of 500 seeds per difficulty".
  - **Game-design gate 2:** par CML is trivially monotonic with network size. Use **regret** (par − oracle) / oracle, or CML per customer.
  - **New mastery-headroom metric:** the share of seeds where a stronger search bot beats par by ≥ 10 % should be between 20 % and 80 %. If it is near 0, there is no mastery; if near 100, par is weak.
  - **Game-design gate 4 / QA gate 2 (agent-judged fun):** an LLM cannot certify fun. Keep it as a review, plus an **owner playtest checklist** in NEEDS-AHMAD (asks for an opinion, not data). Add the measurable proxies above. Agents also need a test harness to "play": expose a debug `window.__sim` observation/act API in dev builds.
  - **Engineering gate 3:**
    - "60 fps / ≥ 30 fps panning" cannot be measured reliably in headless CI. Replace it with "no long task > 50 ms during a scripted pan in headed Chromium", or mark it advisory.
    - "Interactive ≤ 2.5 s": name the metric (LCP and TBT, median of 3 Lighthouse runs).
  - **Physics gate 2:** see D3-10. "Unloaded-generation" should read "no-generation".
  - **QC gate 3 (FIDELITY ↔ Model notes):** this is tautological if Model notes are generated from the same tables. Give each FIDELITY simplification an ID (e.g. `S-F4-03`) and check ID coverage both ways.
  - **Safety gate (employer data):** an ID grep cannot catch remembered values. Add an author attestation line per data table.

### D3-29 — Minor — QC and QA are distinct on paper but QC mostly re-lists other gates
- **Location:** qc.md vs physics/localisation gates.
- **Problem:** QC items 1 and 4 duplicate Physics gate 1 and Localisation gate 1. QC adds value only through **independence**.
- **Fix:** QC runs from a clean checkout by a different agent than the producer. It keeps the 20-value random trace (good: measurable, independent) and adds a random re-derivation of 3 golden expected values from the cited source. QA stays "right thing?": playtests, process audit, goal fit. This split is sound.

### D3-30 — Minor — Process cost of ten gate passes in one session
- **Problem:** ten separate review passes compete with build time.
- **Fix:** for v1, combine them into **two review agents**: (1) Physics + Safety + Research trace; (2) Game + UX + Localisation playtest in both languages and viewports. CI covers Engineering and Localisation key coverage. Record this in DECISIONS.

---

## F. Proposed v1 cut line (minimal but deep)

**ABOVE the line — v1 must ship, polished, validated:**
- **Engine:**
  - dmath (exp, log, pow via exp/log; accuracy tests) and sfc32 PRNG with named streams.
  - Topology and islands.
  - Balanced power flow per island (sweep or sparse LU); golden on 2 authored feeders (pandapower cross-check) plus 33-bus (test-time fetch, non-blocking if the network is down).
  - Sequence-network SC with all 4 fault types plus fault resistance; NER and solid earthing; cable C0; lumped "rest of bus" C0; goldens Glover 9.2–9.5 and CT158 / CT18 §4.3.
  - Source-CB protection: IEC SI/VI/EI + DT/instantaneous with travel integral (IEC reset only).
  - Tee-off fuses (one vendor table, 3 sizes).
  - FPIs (earth-only / 3-ph, latch, reset on voltage return, [A] reliability faults).
  - Conductor and screen I²t events.
  - Cable steady rating (35/40 °C).
  - CLPU [A] with sensitivity shown.
  - Crews, events and the reliability log (CI, CML; Ofgem 3-min plus IEEE 5-min shown).
- **Night Shift:**
  - Training ring (3 faded faults), daily, free play.
  - Easy / Normal / Hard.
  - Evidence sources: FPIs, relay record, damage report, comms loss.
  - Hard gates: structured checklist, secure/permit actions, per-panel interlocks, CB vs LBS making duty.
  - End state: permit + return to normal.
  - "Advance to next event".
  - SSEN reference bot, oracle bound, stars.
  - Share string and seed/replay URL with version.
  - Results timeline with "what the relay saw vs what happened".
  - Generated Model notes, glossary.
  - AR/EN with RTL chrome, Western/Eastern digits toggle.
  - Dark and light themes.
  - Keyboard play; phone ring-focused view.
- **Infrastructure:** CI (typecheck, lint, tests, 3-browser determinism, build); Pages deploy; versioned `/v/<n>/` path from day one (even if only v1 exists).

**BELOW the line — v1.x, absent from the v1 UI (not placeholders):**
- IEC 60076-7 transformer thermal and its goldens (moves to Heatwave).
- IEEE curves and IEEE reset.
- CT-saturation flag; self-powered relay minimum current; switchgear ambient derating (also NOT FOUND).
- SAIFI/SAIDI/MAIFI system contribution.
- 69-bus golden.
- Expert difficulty and second/evolving faults; career districts beyond training.
- Persistent home district.
- Engineer-view phasor diagrams (keep the numeric relay record).
- Audio (keep a single synthesized trip chime only if time remains).
- PWA offline service worker (add with the versioned cache design from D3-25).
- Make-before-break paralleling (default forbidden).
- Live-shift ruleset.

Depth is preserved: every mechanic above the line is physically computed and sourced or [A]-labelled. What is cut either does not affect Night Shift decisions (thermal, IEEE curves, derating) or is breadth rather than depth (Expert, career, audio).

---

## G. Verdict

**PASS AFTER FIXES.**

Phase 3 can exit once:
1. **D3-08** (remote-end "interlock") and **D3-21** (cut line recorded as D-011) are resolved in the design documents.
2. **D3-09, D3-10, D3-11, D3-13, D3-14, D3-23, D3-24** are reflected in GDD/FIDELITY/ARCHITECTURE/charters.
3. The remaining Important findings are fixed or justified in DECISIONS before the code that depends on them is written.

The research basis, labelling discipline and engine-first architecture are sound. Nothing here requires re-research except optional sources for LBS making classes (D3-13).

---

## H. Re-verification (2026-11-13, same reviewer; GDD v2, FIDELITY v2, ARCHITECTURE v2, docs/org, DECISIONS D-008a, D-011..D-014)

- **D3-08 (Critical): RESOLVED, with stale lines.**
  - Done: GDD §3.5 and FIDELITY F6 now say interlocks work per panel only, and add secure-isolation and permit actions with a "safety-rule / permit block".
  - Still to fix: the FIDELITY F6 validation line still reads "cannot close onto an earthed section — interlock". Reword it to "permit block".
- **D3-21 (Critical): RESOLVED (D-011).**
  - The extra cut of fuse operation and tee-off faults is **acceptable**: it is honest, since no fuse time-current curves were sourced.
  - Still to fix: FIDELITY F3 "What" still lists fuse-switch combinations, and the F8 source-CB row says "TMS by grading against fuses". With no fuse curves, the TMS must be labelled [A] (e.g. a fixed margin above transformer inrush and cold load) until curves are sourced.
- **D3-09: REFLECTED.** GDD §3.1 and §3.6: individually screened cores are labelled [A], the fault type depends on location, and FPIs follow the computed residual and are never scripted.
- **D3-10: REFLECTED.** The physics gate and FIDELITY F2 use the conditioned properties and check the rating against max(I_3ph, I_SLG, I_DLG). The grid-transformer vector group and earthing are added to F8.
- **D3-11: REFLECTED in GDD §3.5 and D-008a.**
  - Still to fix: FIDELITY F6 "Hard safety gates" item (4) still says "an explicit risk-assessment confirmation step". Replace it with "engine-verified pre-switching checklist (GDD §3.5)".
- **D3-13: REFLECTED.** CB trial close is preferred; LBS/NOP making duty is [A]; "one reclose after inspection" prevents soft-lock.
- **D3-14: REFLECTED.** Emergency check uses the 13.1–14.5 kV service band; Hard is labelled "stressed beyond planning rule" [A]; cold-load sensitivity is shown; the transformer-ageing claim is removed.
- **D3-23: REFLECTED; dense LU acceptable.** Per-island solves, measured 0.40 ms at n = 80, and the v1 island bound of about 60–80 nodes keep it within budget. The 5 ms and 1.5 s gates are retained, with a sparse ordering path recorded. The measurement was on desktop Node; the 4×-throttle par gate will catch a mobile shortfall.
- **D3-24: REFLECTED, but weak wording.** "Firefox/WebKit … where those browsers are installed" lets the check silently skip. Make installing them (`npx playwright install firefox webkit`) a required CI step, so the gate cannot pass vacuously.
- **Other Important items (D3-01..05, 12, 15, 16, 22, 25, 26, 28): REFLECTED** in GDD, ARCHITECTURE and charters, and justified in D-012..D-014.
  - New problem: game-design gate 3 measures "mastery headroom" against the **oracle**. The oracle sees the hidden fault location, so it beats par on nearly every seed, and the 20–80 % band is meaningless.
  - Fix: use a stronger search bot restricted to `observe()` data, and keep the oracle only for regret.

**Verdict: PASS.** Phase 3 may exit. Before engine code depends on them, make these four small edits:
1. FIDELITY F6 validation line: "interlock" → "permit block".
2. FIDELITY F6 gate (4): replace with the engine-verified checklist.
3. Fuse leftovers in F3/F8: drop fuse-switch combinations from F3 "What"; label the source-CB TMS [A].
4. Game-design gate 3: measure headroom with an observation-limited search bot, not the oracle.

Also make Firefox/WebKit mandatory in CI.
