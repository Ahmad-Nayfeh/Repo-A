# Independent review: Grading mode (v1.1)

Reviewer role: protection engineer and UX/Arabic playtester. I did not build this mode.
Date: 2026-11-13. Build: `b35a1f7` (vite build, preview on :4175, Playwright Chromium).

Scope: `src/engine/grading.ts`, `src/engine/protection.ts`, `src/ui/Grading.tsx`, `tests/unit/grading.test.ts`, GDD §3b, research/03 and research/10, the `gr*` keys in `src/i18n/en.ts` and `ar.ts`.

Play sessions:
- Seeds 1, 7 and 42 by hand: desktop 1440×900 in EN, phone 390×844 in AR.
- Engine probes over seeds 1–60, run on the engine bundled with esbuild.

Screenshots are in `/tmp/claude-0/-home-user-Repo-A/d5e0b1ac-4d15-59ea-a8a8-20422fdfb285/scratchpad/grading-review/`:
- `en-desktop-s7-initial.png`
- `en-desktop-s7-exploit-par.png`
- `en-desktop-s1-fail.png`
- `ar-phone-s42-*.png`
- `crop-par.png`
- `crop-chart.png`

## Verdict: **fail** in its current form; pass-after-fixes once GR-01 to GR-05 are fixed

What is right:
- The short-circuit and curve maths.
- Fault levels through the transformer.
- The load and inrush rules.
- The basic "nearest relay first" loop.

What is wrong is the choice of fault cases. They leave out the maximum through-fault point of each relay pair. With that gap, the score rewards settings that a protection engineer would reject. The reference grading ("par") has zero margin between relays on all 60 seeds tested. Two input bugs also make the settings very hard to type by hand.

## Findings

### GR-01: Critical. The margin is never checked at the maximum through-fault current of each relay pair, and par is non-selective there

**Evidence.**
- What the code says:
  - The code comment, GDD §3b and PR-23 (research/03 §2.3: "check CTI at the maximum through-fault current") all ask for the margin to be checked at the maximum through-fault current.
  - For the feeder/incomer pair, that current is a close-in feeder fault just outside the grid-station breaker. Its current equals the busbar fault current.
  - For the tee-off/feeder pair, that current is a fault on the tee-off side of the RMU (the T-off cable or the transformer HV terminals). Its current is about the cable-at-RMU current.
- What the code does:
  - `generateGrading` has no case at either point.
  - F/I is checked only at the far-end "cable at RMU" fault, and T/F only at the LV terminals.
- Results over seeds 1–60:
  - Smallest F/I margin of the par settings at a close-in feeder fault (bus-max current): **0.002 s**.
  - Smallest T/F margin at a T-off HV fault (cable-max current): **0.000 s**. Both relays sit on the 40 ms floor.
  - Example, seed 1 par: I clears the busbar fault in 0.072 s, while F at 20.4 kA takes 0.040 s. A cable fault just outside the station would trip the incomer and black out the whole 13.8 kV bus.
- The phone screenshot with par shown (`ar-phone-s42-par-full.png`) shows the same thing: all reference curves flatten onto the same 0.04 s line.

**Fix.**
- Add two cases:
  - `feeder-close`: current = bus-max; seen by F, then I.
  - `teeoff`: a fault on the RMU tee-off side, current = cable-max; seen by T, then F, then I.
- Check the margin at every case (as the code already does).
- Real gradings will then need the T high-set (GR-03) and slower F/I curves. That is the lesson this mode should teach.

### GR-02: Critical. The score rewards making T as fast as possible for LV faults, which removes discrimination with LV protection

**Evidence.**
- The score adds up primary clearing times, and T is "primary" for the LV-terminal faults.
- On every one of 60 seeds, the par sets T to EI with TMS 0.05 and clears the LV-max fault in under 100 ms (for 500 kVA, 40 ms).
- An LV-feeder fault just outside the substation has almost the same current. A T relay set like this trips the whole package substation before any LV fuse (gG 400–1000 A) or the LV ACB can clear it.
- The research files list LV fuse/ACB discrimination as "not researched" (research/03 §3, item 8). The UI note does not mention it either.

**Fix.**
- Option A: add a rule that T must grade above a representative LV device. For example, a labelled [A] point: largest LV outgoing fuse, or LV ACB short-time delay of about 0.3–0.4 s at the LV-max current, plus the CTI.
- Option B (minimum): drop the LV-terminal times from the score and only require T to clear them within the transformer withstand time (GR-06).
- Either way, say it in `grNote`.

### GR-03: Important. The high-set stage does nothing, and its only effective use is bad practice

**Evidence.**
- The UI default and the par options set hsA = 1.3× or 2× LV-max. No fault case in the game is above LV-max on T's side, so the stage never operates. Par never uses it (0/60 seeds).
- The only setting that changes the score is an overreaching high-set: below the LV fault current and just above inrush.
  - Seed 7 example: hsA = 12.05·In, delay 0, with the par F/I settings. All rules pass and the score is 0.530 s, against a par of 0.543 s, so it earns 3 stars.
  - It gives similar gains on seeds 1–5 and 42 (engine probe).
- Practice is the opposite. The high-set is set at 1.3× the LV through-fault current so it does **not** reach through the transformer (PR-07 Eq. 8.2.4: km ≈ 1.2–1.3 × the maximum fault at the next relay).

**Fix.**
- Add a rule that hsA ≥ 1.3 × LV-max (or flag it as "reaches through the transformer").
- With GR-01's tee-off case in place, a correct high-set then gains real value.

### GR-04: Important. The LV minimum fault is modelled without the Dyn11 vector group; the true minimum is the LV earth fault

**Evidence.**
- `lv-min` is a line-to-line fault computed at a 13.8 kV node behind the transformer impedance, so two HV phases carry 0.866·I3ph.
- Through a Dyn11 transformer the HV phase currents are different:
  - For an LV phase-to-phase fault, one HV phase carries 1.0·I3ph (referred).
  - For an LV phase-to-earth fault (solidly earthed star), the HV currents are only about 0.577·I_SLG.
- research/03 §4 already cites this ("Δ-Y … 0.866 … CTI checked on 3-phase faults may be non-conservative", PR-23 slide 70).
- The real sensitivity case for T is therefore the LV earth fault, which is about 0.58·I3ph and below the case the game checks.
- Documentation mismatches:
  - GDD §3b says "LV faults are three-phase, seen through Dyn11". The code uses LL for the minimum and has no vector-group model.
  - GDD says the minimum case includes fault resistance. The code passes no `zfOhm`.

**Fix.**
- Use an LV single-line-to-earth fault reflected through Dyn11 (factor 1/√3 in two HV phases) as the minimum case.
- Keep 3PH as the maximum.
- Correct GDD §3b.

### GR-05: Important. Typing in the numeric fields is broken by clamping on every keystroke

**Evidence** (Playwright, typing in real time):
- TMS: select all, then type `0.1`. The field ends up as **0.051**: the first keystroke `0` is clamped to 0.05, and the next characters are appended to it.
- Pickup: select all, then Backspace. The field becomes `1`. Typing `400` then gives **1400**.
- High-set amperes: clearing the field sets hsA = 0. The relay then trips instantly at any current and fails the inrush check with no clue why. The delay field accepts negative values.
- This is the main way to play, and on a phone the stepper arrows are not available.

**Fix.**
- Keep a draft string state per input.
- Commit and clamp on blur, Enter or `change`, not on `input`.
- Ignore empty or NaN values.
- Add +/- step buttons (TMS ±0.025, pickup ±5 %) for touch use.

### GR-06: Important. Backup clearing times are unchecked against transformer and cable thermal withstand

**Evidence.**
- Only primary times are bounded (2 s). Backup times are shown in the table but not checked.
- Par backup F times for the LV-min fault:
  - Seed 7: 10.6 s.
  - Seed 11: 14.7 s.
- That is about 17 × In for over 10 s if T fails. IEC 60076-5 requires transformers to withstand their rated short-circuit current for **2 s**.
- The 2 s primary limit happens to match IEC 60076-5. Labelling it as [A] undersells it, since it is sourceable.
- There is no transformer damage curve and no cable I²t check (3×300 Al, k = 94, gives about 4.3 s at 13.6 kA). The incomer backup at cable-min reaches about 1.8 s, which is close to that limit.

**Fix.**
- Add a "backup clears within the transformer withstand time (2 s, IEC 60076-5)" rule for LV faults, or plot the transformer through-fault withstand point on the TCC.
- At least list it as a known simplification in `grNote`.

### GR-07: Important. On a phone the chart, the settings and the results are far apart

**Evidence.**
- Phone page height is 3,168 px at 390 px width:
  - Chart: about 280–700 px.
  - Relay cards: about 800–1,800 px.
  - Table and failure list: about 1,775–2,700 px.
- Every edit therefore needs a long scroll to see its effect. The score in the HUD is the only feedback in view, and it shows "—" until every rule passes.
- The SVG axis text is 11 px inside a 560-unit viewBox, which renders at about **6–7 px** on a phone (`crop-chart.png`). The "10" and "0.01" labels overlap at the origin.

**Fix.**
- Make the HUD or the relay card sticky, with a short per-relay status line (✓/✗ plus its worst margin).
- Scale the axis font with `vector-effect` or a larger font size when width < 500.
- Consider tabs: Chart / Settings / Results.

### GR-08: Important. The Arabic reference-grading line is garbled by bidi, and "incomer" is mistranslated

**Evidence.**
- In `crop-par.png`, the par summary renders as "A, TMS 0.05 118" and "A, TMS 0.125 2036".
- The cause: the string concatenates Latin `A`, `TMS` and `,` without `<bdi>`, and uses `A` instead of `أ`.
- `gr_I` is translated as "المغذّي الرئيسي (محول المحطة)", which means "main feeder (station transformer)". Next to `gr_F` "قاطع المغذّي", a player reads "feeder" and "main feeder", which is misleading.

**Fix.**
- Render each relay summary as its own `<bdi dir="ltr">…</bdi>`, with Arabic separators and units.
- Rename the incomer to "قاطع الدخل (محول المحطة)" or "القاطع الوارد".

### GR-09: Minor. The UI says "clearing time" but the value is relay operating time

`grScore` and `grAllOk` say "Total clearing time" and "every fault cleared within 2 s". The engine sums relay operating times. Breaker opening time (about 50–80 ms) is not added, while the 0.3 s CTI includes it per PR-22. **Fix:** say "relay operating time", or add a labelled breaker time of 0.06 s [A].

### GR-10: Minor. Pickup margins are thin

**Evidence.**
- `pickup > load` passes 301 A for a 300 A load.
- Practice adds a margin (PR-23: 107 % in the worked example) and allows for relay drop-off (about 0.95) and pickup accuracy. research/03 notes the 1.1–1.3× guaranteed-operate band.
- There is no check that the minimum fault is at least 1.5–2 × pickup (GT-R2-1 rule: "fault/pickup at minimum > 2"). It is only enforced indirectly through the 2 s limit.

**Fix:** require pickup ≥ 1.05–1.1 × load, and Imin/Is ≥ 1.5 for the primary relay, both labelled [A]. Or explain why they are omitted.

### GR-11: Minor. Duplicate and nonsensical failure messages

**Evidence.**
- Max and min cases produce identical text, for example "does not clear the Transformer LV terminals fault within 2 s (∞ s)" twice, because the level is not passed into the message.
- When the downstream relay does not trip, the margin reads "grading margin -∞ s below 0.3 s", which is a misleading second error.
- `noTrip` is declared and translated but never emitted.

**Fix:**
- Include `{level}` in the message.
- Suppress the margin check when the downstream relay does not operate (the primary check already reports it), or emit `noTrip`.

### GR-12: Minor. The minimum case uses the same source fault level

`bus-min` is the same Sk at c = 1.0, so it is always 0.787 × bus-max. Real minimum-plant source impedance and fault resistance are not modelled, although the GDD claims the latter. **Fix:** draw a minimum Sk, for example 60–80 % of maximum [A], or align the GDD text with the code.

### GR-13: Minor. The CT, relay and curve simplifications are not stated in the UI

Unstated items:
- No CT ratios or pickup steps (primary amperes are continuous).
- No CT saturation.
- Single feeder: the incomer does not grade with the other feeders or with the largest outgoing feeder setting.
- No grading margin variation by relay technology.

These are acceptable as labelled simplifications. `grNote` lists only "phase elements only". **Fix:** add a one-line "not modelled" list to `grNote` and the GDD.

### GR-14: Minor. Code hygiene

**Evidence.**
- The best-score `store.set` runs inside render, and the stored best is never shown to the player.
- `.tcc .fault-label` is defined twice in `styles.css` (lines 180–181).
- Score and check updates are not announced: there is no `aria-live` on the HUD or the failure list.
- The checks rely partly on colour, but ✗/✅ glyphs are present, so this is acceptable.

**Fix:**
- Move the write to `useEffect` and show "best".
- Add `aria-live="polite"` to the checks list.
- Remove the duplicate CSS rule.

### GR-15: Minor. The par is greedy bottom-up and not optimal; the "par" claim should be soft

Bottom-up per-relay minimisation does not minimise the total; a player can beat par legitimately. The UI's "(bottom-up search)" label is honest; keep the star rule "≤ par = 3★". Once GR-01 and GR-02 add rules, recheck that `referenceGrading` still finds a solution on every seed: TMS grid up to 1.0, pickup grid ×1.1–2, plus a high-set grid for T.

## What is good

- Fault levels are plausible:
  - 500 kVA / 5 %: LV-max about 440 A at 13.8 kV.
  - 1,000 kVA / 6 %: about 720 A.
  - 1,500 kVA / 6 %: 990–1,044 A.
  - The busbar 3PH value matches Sk/(√3·Un) exactly.
- The incomer correctly does not pick up LV faults (pickup about 2 kA, above an LV fault of about 1 kA).
- Margins are checked at both max and min cases. That is stricter than the GDD says, and it is good.
- The inrush rule (12 × In for 100 ms, from PR-08) and the IEC curves with a 20× cap are correct and sourced.
- The table gives a usable text alternative to the chart.
- The AR layout is RTL with no horizontal scroll at 390 px. Touch targets are at least 44 px.
- The fault-current numbers are bidi-isolated in the legend and table.
- The loop is engaging on desktop: the TCC plot and the per-relay load hints make the trade-off visible, and the starting settings fail on the incomer margin, which gives a clear first goal.

## Re-verification

Checked against commit `fafa8f7` (D-018). Method:
- Engine probe over seeds 1–60.
- Unit tests: 3/3 pass.
- Playwright, desktop EN (seed 7) and phone AR (seed 42).
- Screenshots: `rv-*.png` in the same scratchpad folder.

- **GR-01: resolved.**
  - New `tee-max` case (feeder vs tee-off) and `near-max` case (incomer vs feeder at busbar current).
  - The reference grading's smallest margins over 60 seeds are now 0.3001 s and 0.3007 s (they were 0.000 s and 0.002 s).
  - All 60 reference gradings pass, and none is missing.
- **GR-02: resolved.**
  - LV-terminal faults are no longer scored.
  - The tee-off must take between 0.4 s and 2 s at LV-max. The reference gives 0.40–0.46 s.
  - The 0.4 s value is labelled [A].
- **GR-03: resolved.**
  - New `hsReach` rule: the high-set must be at least 1.3 × LV-max.
  - The overreaching high-set from the original review now fails on 60/60 seeds.
  - The reference now uses a high-set on 26/60 seeds.
- **GR-04: resolved.**
  - The LV minimum is now an LV earth fault, taken as 1/√3 of the three-phase value through Dyn11, at half the source fault level.
  - This is an approximation that treats the LV earth fault as about equal to the three-phase fault. It is labelled [D]; acceptable.
- **GR-05: resolved.**
  - Typing "0.1" into TMS now gives 0.1.
  - Clearing pickup and typing 400 now gives 400.
  - An empty high-set field reverts instead of becoming 0 A.
  - A delay of −1 is clamped to 0.05.
- **GR-06: partial rejection accepted.**
  - Backup within 2 s is now enforced for MV faults.
  - For LV faults the physical reason holds. On 500 kVA, LV-max is 427–445 A against a feeder pickup of at least 300 A. The LV-min earth fault (about 220 A) is below the feeder pickup, so the feeder relay cannot see it.
  - Feeder backup at LV-max is feasible on some 1000/1500 kVA seeds (0.9–1.7 s) but not on all of them (up to 6.3 s, or no trip).
  - The limitation is stated honestly in `grNote` in both languages.
  - Optional: show the feeder backup time at LV-max as information only.
- **GR-07: not resolved (Important, carried over).**
  - The phone page is 3,644 px tall, with no sticky status and no `aria-live`.
  - TCC axis labels are still about 6–7 px.
  - New minor issue: the busbar legend row has no ④ marker on the chart.
- **GR-08: resolved.**
  - The Arabic incomer is now قاطع الوارد.
  - The reference grading is a bidi-correct list ("189 A · TMS 0.15").
  - Minor leftovers: Latin "A" instead of أ, and a doubled "· ·" in the feeder line.

**Verdict: pass-after-fixes.** The engineering items GR-01 to GR-06 are closed. Before release, fix GR-07: give the phone a sticky per-relay status line and a readable chart font.
