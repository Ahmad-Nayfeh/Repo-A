# Release 1 playtest review: Game Design, UX, Localisation, QA

Reviewer: independent playtester. I did not build this game.
Build: `npx vite build` of the working tree at the start of the session (HEAD 77311c1), served with `vite preview` on port 4174. Other files changed on disk while the review was running, so re-check each finding against the current tree.
Tools: Playwright Chromium, deviceScaleFactor 1. I played through the UI by clicking or tapping. I used `__gs` only to inspect state, to run the reference bot for comparison, and to set up keyboard-test states.
Screenshots: `/tmp/claude-0/-home-user-Repo-A/d5e0b1ac-4d15-59ea-a8a8-20422fdfb285/scratchpad/playtest/` (shortened to `PT/` below).

## Sessions played

1. **Training 1 (EN, 1440×900), as a newcomer.** I completed the whole loop using only the UI and the hints: SCADA FPI reads, isolate R1-C6, re-close R1-CBB, backfeed through the NOP, dispatch 2 crews, lock & tag, earth, permit, repair, remove permit, earths and locks, then break-before-make back to normal. Result: 3★, 1,006 CML against a reference of 2,012.
2. **Training 1 (AR, 390×844 touch).** I played through to crews on site and triggered the checklist. I also checked the home page, the ladder, the panels, the toasts and the log.
3. **Hard free play, seeds 4242, 777 and 31337, as an MV protection engineer.** I played 4242 by hand: I trial-closed onto a 3-phase fault and sectionalised at R1-3-R. I also ran the reference bot on Hard seeds 1–25 to check whether the game is a fixed recipe and how realistic it is.
4. **Results, share text, replay links** (training EN, normal seed 777 AR); Model notes, glossary and about pages (EN/AR, 1440 and 390); keyboard-only play.

## Findings

### Critical

**G-01: Replay links do not reproduce the game.**
- Steps: finish any game, for example training 1. Open the URL in the share box in a new tab.
- Result: training 1 scored 1,006 CML (3★) in play and 2,376 CML (2★) on replay. Normal seed 777 scored 18,828 in play and 62,374 on replay.
- Cause: the `GameSession` constructor calls `apply({kind:'advance'})`, which pushes that advance into `actions`. A replay then runs the constructor's advance plus the recorded one, so the whole sequence is shifted by one event. Each later replay adds another leading advance.
- Screenshots: `PT/17-t1-results.png`, `PT/18-replay-en.png`, `PT/60-ar-results-phone.png`, `PT/61-ar-replay-phone.png`.
- Fix: do not record the bootstrap advance (apply it to `sim` directly), or skip `actions[0]` when replaying. Add an e2e test: finish a game, open `replayUrl()`, assert identical metrics.

**G-02: Keyboard-only play is impossible on desktop.**
- Problem 1: the SVG network elements set `tabIndex={0}`, which Preact writes as the attribute `tabIndex`. SVG needs lowercase `tabindex`, so no RMU, cable or grid station is focusable (`g.tabIndex === -1`). The Tab cycle on the game page is: menu, wait, advance, ring buttons, Engineer view, Switching points, tabs, then body.
- Problem 2: the "Switching points" fallback list has RMUs and cables but no grid-station feeder breakers. Re-closing the tripped breaker is needed in every game, so a keyboard user cannot finish a shift.
- Screenshots: `PT/40-kbd-focus-rmu.png`, `PT/42-kbd-switchlist.png`.
- Fix: write `tabindex="0"` on the SVG elements. Add GA/GB breakers to the switch list, or make the ladder available on desktop as a list view.

### Important

**G-03: After closing onto a fault, the screen shows success until time advances.**
- Steps: Hard seed 4242. Wait 20 minutes, then close R1-CBA remote and confirm the checklist.
- Result: the HUD shows "Customers off 0" and the breaker shows ■ closed with no chime. The protection trip is only processed on the next Wait or Advance (log: closed 15:21, tripped 15:21, shown later).
- Screenshot: `PT/34-hard-closed-onto-fault-before-advance.png`.
- Fix: after any switching action, advance the sim past pending sub-second protection events, for example to `t + 1 s`, before returning to the UI.

**G-04: The "crew inside substation" block names the wrong crew.**
- Example: the toast says "Crew 1 is inside substation R1-6", while the log and the checklist both say Crew 2.
- Cause: `msg()` passes the raw 0-based `reasonData.crew`. `LogPanel` adds 1.
- Screenshots: `PT/27-ar-checklist.png`, `PT/28-ar-after-confirm.png`.
- Fix: map `crew → crew+1` in `msg()`. This is a safety message, so the crew number must be correct.

**G-05: The checklist "Confirm and close" button is enabled when items show ❌.**
- Confirming then produces a blocked action, which counts as a near miss in the shift report.
- The modal also has these problems:
  - Focus does not move into the dialog.
  - Esc does not close it.
  - There is no focus trap: Tab reaches the background "Open · remote" buttons, which still work.
  - It always sends `justification:'delay'`.
- Screenshots: `PT/33-hard-checklist.png`, `PT/43-kbd-modal.png`.
- Fix:
  - Disable Confirm while any gate fails, and say why.
  - Do not count near misses that come from a disabled UI path.
  - Focus the first button on open; close on Esc; set `inert` on the background.

**G-06: Training 1 hints are wrong or missing at several points.**
- (a) `tr1_4` says "the checklist appears", but it never does in this scenario: the sections are proven by FPIs.
- (b) After the repair, `tr1_5` still says "Send a crew to each end…". Nothing explains how to restore the normal arrangement: remove the permit, then the earths, then the locks, then switch break-before-make, opening the NOP first. A newcomer is left at a dead end.
- (c) The hint logic goes backwards. Opening the NOP shows `tr1_4` again ("re-close the tripped breaker"). Re-closing R1-6-L after the repair shows `tr1_3` ("the faulted cable lies between…").
- (d) `tr1_1`/`tr1_2` never say "click an RMU on the map". The Site tab only says "Select a substation".
- Screenshots: `PT/08-t1-restored.png`, `PT/13-t1-repaired.png`, `PT/15-t1-after.png`.
- Fix: make the hint state machine follow `faultPresent`, permit, earths and normal-state, and add steps tr1_6 and tr1_7 for restoration.

**G-07: "Advance to next event" with nothing pending jumps 2 hours.**
- One click at 02:09 with 274 customers off added 32,880 CML (`PT/` session t6). There is no confirmation and no undo.
- Fix: when no event is queued, cap the jump (for example 15 minutes), or confirm "Nothing scheduled — skip 2 h while N customers are off?".

**G-08: The cable panel offers "Start repair" again after the repair is complete.**
- It also shows "Permit to work issued" with no "Repaired" state.
- Screenshot: `PT/13-t1-repaired.png`.
- Fix: track `repaired` and show "Repaired — cancel permit, remove earths, restore".

**G-09: The map does not show FPIs that were read and not flagged.**
- Only ⚡ (flagged) is drawn. Read-and-clear RMUs look the same as unread ones, which is the key information for locating the fault.
- Screenshot: `PT/04-t1-after-reads.png`.
- Fix: add a distinct "read, clear" badge (for example ○ or ✓) with the read time.

**G-10: Phone layout problems (390×844).**
- The sticky HUD is about 180 px tall. Selecting an RMU scrolls the panel under it, which hides the RMU title, supply status and tabs (`PT/22-ar-site-panel.png`, `PT/25-ar-site-crew.png`).
- The hint is not sticky, so hint changes are missed.
- Switching RMUs means scrolling about 1,100 px up and down.
- Fix: add `scroll-margin-top` equal to the HUD height, compact the HUD to one row, and use a bottom-sheet panel or a sticky hint chip.

**G-11: Physics realism, 3-phase faults with zero residual current.**
- About half of Hard faults are 3PH with 3I₀ = 0 (Hard seeds 1–25: 14 of 25).
- The cable is 3×300 Al XLPE with individually screened cores. A core-to-core breakdown in that construction has to pass through the earthed screens, so pure balanced 3-phase faults with no residual current are rare even for excavator damage.
- The effect is that earth-only FPIs are made blind by design. An engineer would wince at this.
- Fix: weight faults roughly SLG ≫ DLG > 3PH (with earth involvement), and make most third-party faults SLG or DLG with screen current. Keep blind earth-only FPIs as an occasional twist.

**G-12: Backfeed overload has no consequence.**
- Phase pickup is 400 A and the 40 °C rating is 278 A. Anything between 278 and 400 A runs indefinitely.
- The reference bot runs 246–247 minutes above rating on seeds 10 and 13, and still sets the par score.
- The star rule ignores minutes above rating, and there is no cable thermal model, so "backfeed overload trips" almost never happen.
- Fix: include overload minutes in the star or safety gate, or add a simple thermal (time-constant) trip or derate warning. Also show the projected backfeed current before closing the NOP (the engineer view shows ring-end amps only).

**G-13: Stale FPI flags cannot be distinguished or reset.**
- On Hard, latched flags from a previous event (`since:-1`) show as "FLAGGED (15:00)". The time shown is the read time, not the flag time, and some sit on the healthy, energised half.
- Real SCADA FPIs report a flag timestamp and can be reset remotely.
- Fix: show the flag time, or "flagged before the trip", and add a remote reset action.

**G-14: Isolation and permit steps are simplified past what the glossary teaches.**
- (a) The permit is issued and repair starts at 02:30, while crews are still applying earths until 02:35. The log shows "Crew 1 finished earth 02:35" after "Permit applied 02:30".
- (b) The game has no "prove dead" step and no cable identification or spiking before cutting, yet the glossary teaches "Isolate, secure, prove dead, earth".
- (c) There is no test (pressure or VLF) before re-energising the repaired cable.
- (d) The crew that closes a switch onto an unproven cable may stay inside the RMU.
- Fix: gate the permit on the crews finishing their earthing tasks, and add a short "prove dead" crew task. Mention the missing steps in Model notes, or add them.

**G-15: Arabic and number formatting inconsistencies.**
- Western digits are the default, but many strings hard-code Arabic-Indic digits in the strings themselves: subtitle "١٣٫٨", "انتظر ٥ دقائق", "التدريب ٢", "١٢٥٪", checklist rule "٢٢:٠٠", "(أكثر من ٥ دقائق)". The game clock shows 02:30 next to ٢٢:٠٠ in the same modal (`PT/27-ar-checklist.png`, `PT/21b-ar-t1-start-full.png`).
- Fix: keep digits out of the dictionary and pass them through `fmt()` and `clock()`.

**G-16: English left over in Arabic UI, and broken share text in Arabic.**
- The results row shows "67 min". The share text says "7 ops".
- On the About page, the "Research synthesis / Sources / Validation results / Decision log" links and the "Engine version … Fonts …" line are English.
- The Arabic share text is in a `dir=ltr` `<pre>`, which scrambles the order: "…(الاستراتيجية المرجعية 7 · (18,828 ops" (`PT/60-ar-results-phone-top.png`). That text is what gets pasted into WhatsApp.
- Fix: localise these strings, render the share text `dir=auto`/rtl, put the URL on its own line, and isolate numbers and IDs with U+2068/U+2069.

### Minor

**G-17: Arabic wording and terminology.** These read unnaturally to a Saudi engineer:
- "مُؤشِّر / غير مُؤشِّر" for flagged and not flagged. It is ambiguous because the same word is the noun "indicator". Suggest «أشار» / «لم يُشِر» or «ظهر العلم / لا علم».
- "اقفل" should be «أقفِل».
- "الفرقة {n}: ابتعد" has a gender mismatch. Suggest «أبعِد الفرقة {n} عن المحطة».
- "{n} جزء/أجزاء" should use proper plurals.
- "@" inside Arabic text should be «في».
- "كان العطل طور واحد إلى الأرض" should be «كان العطل عطلَ طورٍ واحد مع الأرض».
- "مرحّل زمن عكسي محدد أدنى" should be «مرحّل زيادة تيار بزمن عكسي (IDMT)».
- "في المستودع" for the depot: «في المقر/مركز الطوارئ» is more usual.

The core terms are good: قاطع المغذّي، تصريح عمل، التأريض، نقطة الفتح الطبيعية، التغذية العكسية، سكادا. A Saudi engineer would also recognise "RMU" as is.

**G-18: Bidi.** "مفتاح الحلقة باتجاه A R1-5-L" runs the side letter into the ID ("A R1-5-L"). Wrap IDs in `<bdi>` and add a separator (`PT/25-ar-site-crew.png`). The ladder and SVG are correctly not mirrored, and the relay record "فصل R1-CBB عند 02:00" renders correctly.

**G-19: Tap targets below 44 px.**
- Training 1/2/3 buttons: 35×44.
- Sound checkbox: 13 px, with no text label (only 🔔, sitting below the checkbox).
- Ring picker buttons: 36 px. Footer links: 34 px. Ladder cable rows: 40 px. Menu ☰: 38 px.
- Home training buttons have no description of each level.
- Screenshot: `PT/20-ar-home.png`.

**G-20: Desktop map labels collide on Hard (3 rings).**
- The "R1-1" and "R1-10" labels are crossed by cable lines.
- The breaker legend under A ("□ R1 / R2 / R3") is overdrawn by the R3 cable.
- Breaker IDs (R1-CBB) are not shown on the map, although the relay record uses them.
- Screenshot: `PT/30-hard-start-4242.png`.

**G-21: Duplicate breaker label.** The panel shows "Feeder breaker R1-CBB R1-CBB" (`PT/06-t1-gsB.png`).

**G-22: Smaller issues.**
- Locked switches still offer "Close · remote" or "Close · Crew n" buttons that always get blocked.
- The customer-minutes counter stays at 0 for the first 3 minutes and then jumps. Add a note that this is the Ofgem ≥ 3-minute rule.
- The log says "Permit applied on R1-C6"; it should say "issued".
- "What actually happened" always appends the earth-only-FPI sentence, even in training with 3-phase FPIs.
- The share URL is about 1.9 kB for a short game and will be much longer on Hard. Consider a compact action encoding.

**G-23: Model notes on a phone.** The parameter table is clipped at 390 px. Only the name and value columns are visible; label and source are cut off. Values show raw JSON (`{"kA":21,"s":1}`) and identifiers without units, also on the Arabic page (`PT/50-notes-ar-390-crop.png`).

## Engineer's view (Hard)

**Good:**
- Relay records are believable:
  - SLG earth element at about 620–800 A under a 1000 A NER.
  - 3PH faults at 4.6–14.4 kA.
  - Trip times match IEC SI at TMS 0.1.
- The break-before-make block, the remote-end permit block, fault-make duty counts, the 20-minute daytime and 5-minute night delays, and inferring stale FPIs from a 3I₀ = 0 record are all good teaching points.

**Wince points:**
- G-11: 3PH faults with zero residual in screened cable.
- G-12: unlimited overload below 400 A.
- G-13: stale FPI flags with no timestamp or reset.
- G-14: permit issued before earthing finishes, and no prove-dead step.
- Hard always starts at 15:00 in summer.

**Fun and decisions:** Hard has real choices:
- where to split the ring;
- whether to trial-close (each try costs 20 minutes plus duty) or send crews;
- which crew goes where;
- when to backfeed against the cable rating.

The reference bot's sequences vary from seed to seed, so it is not one recipe. Easy and Training with 3-phase FPIs and full SCADA are a fixed recipe, which is fine for training. Because the par strategy is weak on easy seeds (a hint-following newcomer scored half its CML), 3★ feels unearned.

## Verdict

**Fail** for release in the current state, because of G-01 (the advertised replay and share feature gives wrong results) and G-02 (no keyboard completion). It becomes **pass-after-fixes** once G-01 to G-10 are fixed. G-11 to G-16 should be fixed before the game is presented to Saudi engineers as "realistic". The core loop is sound and enjoyable, and the safety gating teaches the right habits.

## Re-verification

Build: HEAD 8532c59, including 9636dfd "Release review 2 (playtest) fixes". Rebuilt and re-played through the UI at 1440 EN and 390 AR (touch). New screenshots: `PT/v-*.png`.

**G-01 to G-10:**
- **G-01: resolved.** Training 1 played through the UI, and normal seed 777 in AR, each give identical metrics when the replay URL is opened.
- **G-02: resolved.** RMUs, cables and grid stations A and B are now in the Tab order. I selected GS B and closed R1-CBB using only the keyboard.
- **G-03: resolved.** Hard 4242 shows "365 off" and the re-trip in the log immediately after the close.
- **G-04: resolved in code.** `msg()` now adds 1 to the crew number. The toast is now hard to trigger, because the checklist disables Confirm and local crew closes onto unproven sections are blocked.
- **G-05: resolved.**
  - Confirm is disabled while any item shows ❌, with an explanation.
  - Focus moves to Cancel and stays inside the dialog.
  - Esc closes it.
  - Minor leftover: requesting a permit before the earths finish still counts as a near miss (training run showed 4).
- **G-06: mostly resolved.**
  - The stage hints now cover permit, repair and return-to-normal, and they no longer go backwards.
  - Two leftovers: `tr1_4` still says "(the checklist appears)", which does not happen in training 1; and no hint says "click an RMU".
- **G-07: resolved.** An Advance with nothing pending now moves 30 minutes.
- **G-08: resolved.** The cable panel shows "✅ Repaired and tested" and no "Start repair" button.
- **G-09: resolved.** The map and panel show ○ for "read, not flagged", with the read time and the flag time.
- **G-10: resolved.** The header is no longer sticky on phones, and the RMU title and tabs are visible after a tap (`PT/v-22-ar-site-panel.png`).

**Spot checks in Arabic at 390 px:**
- **G-14: resolved.** The sequence is lock, then "test for absence of voltage", then earth when the crew finishes. A permit is refused until the earths are on.
- **G-15: resolved.** Template digits now follow the Western-digit setting ("13.8", "انتظر 5 دقائق", "125٪").
- **G-16: resolved in results and share.**
  - Results now say "73 دقيقة" and "7 عمليات تحويل". The share text is multi-line and uses `dir=auto`.
  - Leftover: the About page links and the engine version line are still English.
- **G-17: partly resolved.**
  - Fixed: أقفِل and مُفعَّل.
  - Unchanged: "الفرقة 1: ابتعد عن المحطة" (wrong gender) and "كان العطل طور واحد إلى الأرض".
- **G-18: resolved.** IDs are wrapped in `<bdi>` with a "·" separator.
- **G-19: mostly resolved.** Targets are 44 px. The checkboxes themselves are still 13–22 px but sit inside labels, and ☰ is 38 px wide.

**New regression (Important): the log shows raw values in both languages.**
- What the log shows:
  - "Lock/tag true at R1-5-R", "Earth true".
  - "R1-3-R open" and "R1-CBB close" instead of opened/closed.
  - In Arabic, "القفل/البطاقة true", "R1-CBB close".
  - The task name appears raw: "أنهت الفرقة 1 proveDead".
- Cause: `LogPanel.fmtData` in `src/ui/Game.tsx` has a new `if (k === 'on' && 'cable' in d)` without a leading `else`. The rest of the `else` chain then overwrites the `op` and `on` values with the raw ones.
- Fix: change it to `else if`, and add a translation for the `proveDead` task.
- Screenshot: `PT/v-26-ar-log.png`.

**Verdict: pass-after-fixes.** G-01 to G-10 are resolved; G-06 has minor leftovers. Fix the log-formatter regression, then release.
