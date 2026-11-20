# 13: Onboarding / first-time user experience (FTUE): why new players stay or quit, and what Grid Shift should do

Researched 2026-11-20. The trigger: the owner, an electrical engineer, opened the current build, could not work out how to play, and closed it. He also finds the graphics cheap and asked for a "watch the solution" replay.

Status tags:
- **verified**: I fetched the page or PDF and read the passage myself.
- **snippet-only**: I saw it only in a search result or a search-engine summary.
- **uncertain**: sources conflict, or the attribution is weak.

Anything marked **OPINION** is my design judgement, not a finding. URLs are inline next to each claim. There is no separate bibliography file.

---

## 1. How many new players leave, and how fast

### Day-1 retention benchmarks (mobile, all genres)

| Metric | Value | Source | Status |
|---|---|---|---|
| D1, top-25% games, 2024 | 26.48%–27.69%. Bottom 25%: 10%–11.5% | GameAnalytics 2025 benchmarks, via a summary of the report: https://gamedevreports.substack.com/p/gameanalytics-mobile-gaming-benchmarks | verified (secondary summary of the report) |
| D7 median, 2024 | 3.42%–3.94%. Top 25%: 7%–8% | same | verified (secondary) |
| D28 | "75% of projects have a D28 Retention lower than 3%" | same | verified (secondary) |
| Trend | Top-25% D1 in 2023 was 28%–29%, so it fell in 2024 | same | verified (secondary) |
| Middle East region | D1 22.64%, D7 4.91%, D28 1.49%, the highest regional averages in that report | same | verified (secondary) |
| D1 median, Q1 2024 | 22.91%. D7 4.20%. D28 0.85% | https://gameanalytics.com/reports/mobile-games-benchmarks-q1-2024 | snippet-only |
| 2026 trend | D1 "continued its downward trend" | https://investgame.net/wp-content/uploads/2026/01/2026-01-27-2026-mobile-pc-benchmarks_compressed.pdf | snippet-only |

**Reading:** even good games lose about three quarters of new players by the next day. A median game loses about four in five. What happens in the first session decides most of that loss.

### Drop-off inside the tutorial and first session

| Case | Figure | Source | Status |
|---|---|---|---|
| Fractured Space (PC, free weekend) | Lost "around 66% of new players" during onboarding, against a target of at most 25%. Of those who started tutorial 1, 60% were gone by the end of tutorial 3. The biggest single-step drop was 22%, between tutorials 1 and 2. | https://gamedeveloper.com/business/fractured-space---analysing-our-free-weekend | verified |
| Call of Duty 4 (Xbox 360) | About 30% of unique players never finished the intro tutorial | https://gamedeveloper.com/design/three-million-cod-4-modern-warfare-players-aren-t-even-f-n-g-s | snippet-only |
| Unnamed game (Stack Exchange post) | 25% never finished tutorial step 1, another 25% quit before the tutorial ended, about 50% completed it | https://gamedev.stackexchange.com/questions/134658/expected-numbers-for-user-engagement (via mirror) | snippet-only, no methodology |
| Foldit, Refraction, Hello Worlds (University of Washington, 45,000+ players) | In casual online play, "the majority of players leave after a short period of time" (O'Rourke 2014 cites roughly 3 minutes of play for Refraction on BrainPOP) | https://grail.cs.washington.edu/wp-content/uploads/2015/08/orourke2014hsm.pdf | verified (the "about three minutes" figure is truncated in my extract, so treat it as approximate) |

**NOT FOUND:** an industry-wide benchmark for "% of players who quit inside the tutorial". Published numbers come from single games.

GameAnalytics' FTUE advice: "Users should do something fun as soon as they open your mobile game", and "the user should understand why your app is great within two to three minutes". It says complex games benefit from walkthroughs, and recommends funnelling every tutorial step to find where players drop. Source: https://gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games (**verified**).

---

## 2. Why players drop in the first minutes

### Attention and cognitive load: Celia Hodent, former Director of UX at Epic Games

Source: https://gamedeveloper.com/business/understanding-the-success-of-fortnite-a-ux-psychology-perspective (**verified**)

- "game developers need to mind the cognitive load they put on players at any time", especially while players are learning.
- Attention works like a spotlight: "when we are focused on a task, we fail to notice stimuli that are not related to the task." Text shown while the player is busy is missed or annoys: "At best, players are going to be annoyed by the distraction."
- "the most efficient methodology to avoid the impact of the forgetting curve is to reduce the memory load in the first place." Fortnite let players pin crafting recipes for this reason (snippet-only: https://uxdesign.cc/the-psychology-behind-the-success-of-fortnite-15ad5d4bb6a4).
- "All the stimuli in the game (aka 'signs and feedback') need to be clear, consistent, and perceived as intended."
- "Onboarding is about making sure players are going to be competent in playing the game." Mistakes are fine if the game shows what went wrong and how to improve.

### Too much at once, and text instead of doing: Portal developer commentary

Source: https://theportalwiki.com/wiki/Portal_developer_commentary (**verified**)

- "Playtesting revealed that this puzzle introduced too many new concepts at once." Two chambers were added in front of it.
- "Overwhelmed players tend not to digest new information." The puzzle was simplified.
- "Because we very deliberately introduce and train each gameplay concept", players felt sure they understood portals.
- Testers missed elements outside their view ("stubbornly refused to look up"), so the elements were moved into view.
- Game Informer, on Portal: people like hearing GLaDOS but "really, really don't want to listen to her while they're actively thinking through a puzzle". https://gameinformer.com/b/features/archive/2010/03/17/thinking-with-portals-making-a-test-chamber.aspx (snippet-only)

### "Our tutorial is awful, unusable": Zach Barth on SpaceChem

Source: https://www.gamedeveloper.com/design/spacechem-s-zach-barth-on-educational-games-tutorial-design (**verified**)

- On SpaceChem: "our tutorial is awful, unusable; the game was really, really hard; and it's really, really long." On testing: "Our whole philosophy on playtesting was nonexistent."
- His new test: "Can someone pick up our game and not read a single word of the text and play it?"
- His method: "make little experiments, setting up little environments where people go in with trial and error", and teach "not by telling them to do it, but by making the AI do it."
- "It's really important to playtest the entire time and constantly playtest."
- Opus Magnum's tutorial was still criticised by players as insufficient and missing key details such as hotkeys. https://vaporlens.app/app/558990/opus_magnum.md (snippet-only, review aggregation)

### Clarity over coolness, and animation over text: Into the Breach (Subset Games)

Source: https://gamedeveloper.com/design/-i-into-the-breach-i-dev-on-ui-design-sacrifice-cool-ideas-for-the-sake-of-clarity-every-time- (**verified**)

- Justin Ma: "As a game design principle, we would sacrifice cool ideas for the sake of clarity every time." They cut weapons whose effects testers found hard to read.
- Once testers played, "we needed to make it very clear who was doing what."
- Written weapon descriptions confused playtesters, so they built **animated tooltips** that demonstrate each effect. A tiny loop of a tile being hit and its neighbours being pushed teaches more than text.

### Wrong first impression, competing channels, grind with no purpose: Factorio's own tutorial audit

Source: Friday Facts #241, https://factorio.com/blog/post/fff-241 (**verified**)

Problems Wube found with the old tutorial:
- The first level was not visually representative of the game ("Gives the impression of being a Minecraft clone").
- The core concepts (electricity, assemblers) were absent from the first two levels.
- Constrained actions taught players to "solve the tutorial" rather than the concept.
- "Grindy" tasks had no purpose.
- Too many messages.
- **Three competing information channels** (objective window, console chat, tab bubbles) repeated each other.

Their goals for the fix:
- Teach the core concepts in level 1 with minimal complexity.
- Teach through experimentation.
- **Unify the information channels.**

Epilogue: the new player experience was later dropped because Kovarex felt it did not match his vision. FFF #342 also says it "did appeal to a wider audience", and late player feedback was "overwhelmingly positive". https://factorio.com/blog/post/fff-342 (snippet-only)

### Steep learning curve with late tutorials: Kerbal Space Program

- Reviews call KSP's learning curve "a sheer rock face" and "impenetrable… for all but the most persistent". Its tutorials "sidestep the early game". https://godisageek.com/reviews/kerbal-space-program-enhanced-edition-review/ (snippet-only)
- I found no measured quit data. KSP still sold hugely to a self-selected, persistent audience (96% positive of 85,108 Steam reviews, see `08-game-design.md` §1). **OPINION:** this survival depended on word of mouth and YouTube teaching. A free browser game with no community does not get that.

### Grid Shift mapped against these causes (OPINION, from the owner's report and the brief)

| Cause found above | Grid Shift today |
|---|---|
| Many concepts at once (Portal, Factorio) | RMU, NOP, FPI, CB, crews, switching, earthing, checklist and scoring are all live from second 0 |
| Competing info channels (Factorio) | Banner hints, 4 side tabs, a separate checklist dialog and the log |
| Reading instead of doing (Barth, Hodent) | Text hints in a banner |
| Low readability of signs (Hodent, Into the Breach) | Small boxes, thin lines, emoji icons, no animated state |
| No early success | The first success comes only after a long correct sequence |

---

## 3. Patterns that work for complex simulation games

### 3.1 Evidence: tutorials matter most for complex, unconventional games, and they must be in context

Andersen et al., "The Impact of Tutorials on Games of Varying Complexity", CHI 2012. 45,000+ players, 8 tutorial variants, 3 games. https://grail.cs.washington.edu/wp-content/uploads/2015/08/andersen2012tio.pdf (**verified**, PDF read)

**Foldit (complex, unconventional):**
- Context-sensitive tutorials vs none: **+75% levels and +29% play time**.
- Context-sensitive tutorials vs an up-front manual: **+40% levels and +16% time**.
- On-demand help improved engagement.

**Refraction and Hello Worlds (simple, genre-familiar):**
- Tutorials made no significant difference.
- On-demand help had no effect in one game and was harmful in the other.

**Restricting player freedom ("stencils", blocking every other action):** "We found no evidence to support the claim that restricting player freedom in order to focus the player's attention on a target concept improves learnability." This held in all three games.

The authors' conclusion: players of games learnable by experimentation "seem to learn more from experimentation than from reading text". Designers should weigh "the complexity and discoverability of game mechanics".

**Implication (OPINION):** Grid Shift is a Foldit-type case: unconventional, with jargon and a mechanic nobody can discover by experimenting. It needs a real tutorial, delivered in context, step by step at the moment of need. An up-front manual would not do. Spotlighting is fine, but hard-locking every other click has no evidence behind it. Prefer a soft spotlight plus a just-in-time "not yet, because…" message when the player clicks something else. Refraction used exactly such just-in-time messages ("too little power").

### 3.2 Teach by doing, one concept at a time, without words

- **Super Mario Bros. 1-1:** Miyamoto and Tezuka (Eurogamer, 2015) say 1-1 was built so players "gradually and naturally understand what they're doing", introducing jumps, enemies and power-ups without text. https://gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1 and https://hothardware.com/news/gaming-legend-shigeru-miyamoto-explains-design-philosophy-behind-super-mario-bros-world-1-1 (snippet-only)
- **Valve:** the GDC talk "The Half-Life 2 Design Process" (slides © 2007) says to simulate the player "in their living room": "Don't give them hints", "Don't answer any questions", "Use external playtesters". "Often you learn more from what playtesters don't experience." Work loop: "Create 15 minutes of gameplay in rough form, Playtest, … Repeat". "We felt done as soon as playtesting was no longer painful to watch." "Don't worry about how it looks: Art production is less risky than gameplay production." https://cdn.fastly.steamstatic.com/apps/valve/2006/GDC2006_HL2DesignProcess.pdf (**verified**, PDF text extracted)
- **Zachtronics:** demonstrate by "making the AI do it" (verified, above).

### 3.3 Progressive disclosure tied to progress: Cities: Skylines II

Source: https://colossalorder.fi/news/behind-the-scenes-6-tutorials-advisor/ (**verified**)

- Tutorials open "when the service or panel is opened". New services unlock as the city grows.
- A balloon points at the feature and "highlights it with a green outline around the icon". The outline blinks, and comes back if you close the panel before you finish.
- Locked tasks stay grey until the previous one is done (snippet-only, Xbox Wire summary).
- Tutorials "can be turned on or off at any time", and skipped ones stay in an **Advisor** archive for later.
- The rationale: the guides in Cities: Skylines 1 "were quite limited".

### 3.4 Minimal, readable, relatable: Mini Metro / Mini Motorways (Dinosaur Polo Club)

- "Minimalism is definitely one of the most important things for us". "we want all these things to be transparent to the player". "We strive to keep our games relatable". The map scale "highlights the important roads and buildings". https://gamedeveloper.com/audio/-i-mini-motorways-i-and-the-delicate-art-of-marrying-complexity-and-minimalism (**verified**)
- Peter Curry: in a game this minimal, graphic design *is* game design. https://www.giantbomb.com/dinosaur-polo-club/3010-10760/forums/interview-peter-curry-co-creator-of-mini-metro-1871069/ (snippet-only)
- Jamie Churchman's GDC 2017 talk "'Mini Metro': When Less Is More" covers its visual and UI decisions. https://www.gamedeveloper.com/design/attend-gdc-2017-and-learn-the-value-of-less-is-more-from-a-i-mini-metro-i-dev (snippet-only)

### 3.5 Value before friction: Duolingo

Duolingo lets the user finish a full lesson before asking for an account. https://goodux.appcues.com/blog/duolingo-user-onboarding (snippet-only). A claimed ~20% DAU lift is not clearly tied to this change, so treat it as unverified: https://taplytics.com/blog/duolingo-ab-test-onboarding (snippet-only).

**Implication (OPINION):** the Grid Shift menu should not stand between a new player and the first action. "Play" should drop straight into the guided first incident.

### 3.6 Forgiveness

- Hodent: mistakes are fine if the game explains them (verified, above).
- Andersen 2012 quotes James Gee: experimentation works best "in a safe environment where functionality is reduced and mistakes are not punished" (verified, in the PDF).

**OPINION:** in the tutorial, an unsafe switching action should be caught, explained in one sentence with an animation of the consequence, and undone. It should not end the run.

---

## 4. Hints and "watch the solution"

### 4.1 Nintendo Super Guide (New Super Mario Bros. Wii)

Source: https://nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-New-Super-Mario-Bros-Wii/Volume-1/5-Allowing-Novices-To-See-the-Ending-Too/5-Allowing-Novices-To-See-the-Ending-Too-210912.html (**verified**)

How it works:
- **Luigi** plays the stage as the demonstrator: "The player will be Luigi, but his jumping ability is the same as Mario's."
- The player can **take over mid-demo**: "Once it's gone past the tricky part, you can press the Pause Button and change the player back to yourself."
- It can "provisionally clear the course".
- It is offered only after repeated failure. The three-try threshold comes from the interview index and summaries: https://iwataasks.nintendo.com/interviews/wii/nsmb/0/5 (snippet-only).

Design reasoning:
- Miyamoto would not offer it up front: "I would feel intensely irritated if you were asked" right away.
- Iwata worried that it removes the fail-then-succeed satisfaction.

A later volume frames it as letting beginners discover they can enjoy the game: https://nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-New-Super-Mario-Bros-Wii/Volume-3/4-The-Peer-Evaluated-Super-Guide/4-The-Peer-Evaluated-Super-Guide-219590.html (snippet-only).

### 4.2 Evidence that hints can backfire in learning games

O'Rourke, Ballweber & Popović, "Hint Systems May Negatively Impact Performance in Educational Games", L@S 2014. 50,000 students, Refraction on BrainPOP. https://grail.cs.washington.edu/wp-content/uploads/2015/08/orourke2014hsm.pdf (**verified**, PDF read)

- **All four hint designs lowered performance** compared with no hints. The effects were small, but "hints clearly did not improve student learning as we had expected".
- **Earned hints** (awarded as you progress, spent when you choose) gave **longer persistence** than embedded hints. Players "hoarded their hints, only choosing to use them when they were really struggling."
- **Concrete hints** (which pieces to use) were used more and were more helpful (faster wins) than abstract "pointing" hints.
- The likely cause, in the authors' words: their hint content "did not adapt to the student's partial solution", so it often missed the player's actual confusion. They also note: "Asking for help has a known negative connotation in games."
- The tutoring-system literature they review: the most effective hints respond to mistakes with "a scaffolded sequence of increasingly concrete information", usually starting with a "pointing hint", then a "teaching hint", then the concrete step.

### 4.3 Worked examples: when showing the answer helps learning

- **Worked-example effect** (cognitive load theory, Sweller & Cooper 1985): novices who study worked examples outperform novices who solve problems from scratch.
- **Expertise reversal** (Kalyuga, Ayres, Chandler & Sweller 2003): as skill grows, the guidance becomes redundant and less guidance works better.
- **Faded worked examples / completion problems** bridge the two.

Sources: https://en.wikipedia.org/wiki/Worked-example_effect and https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf (snippet-only; primary papers not read).

**Implication (OPINION):** a full "watch the solution" replay is *good for learning* the first time a novice meets the procedure. It should then fade: a full demo, then the demo pauses at key steps for the player to do, then hints only. For experienced players it should stay available but never be pushed.

### 4.4 Other hint evidence and counterpoints

- **St Andrews thesis (logic puzzles):** a hint system that reasons about the current puzzle state was "as helpful as the existing system", improved the experience, felt "less like cheating", and was chosen significantly more often. https://research-portal.st-andrews.ac.uk/en/studentTheses/effective-player-guidance-in-logic-puzzles/ (snippet-only)
- **Professor Layton:** three progressively better hints per puzzle, each costing a coin. https://tvtropes.org/pmwiki/pmwiki.php/Main/HintSystem (snippet-only)
- **Escape-room heuristic:** if a puzzle needs the same hint ≥50% of the time, redesign the puzzle. https://roomescapeartist.com/2019/10/24/escape-room-hint-systems/ (snippet-only)
- **The Witness (counterpoint):** no hints or tooltips. Blow: "Treating the player like a baby all the time, I don't like that." It works through a very carefully ordered sequence of concepts. https://www.engadget.com/2012/03/14/the-witness-cares-about-you-more-than-you-know/ (snippet-only). **OPINION:** this suits a pure abstract puzzle with no jargon. Grid Shift teaches a real professional procedure with domain vocabulary, which is closer to Foldit than to The Witness.

---

## 5. Visual quality: how much it matters, and what "high quality" means for a simulation UI

| Finding | Source | Status |
|---|---|---|
| Large A/B tests on two Flash games: **music and sound had little or no effect on retention; animations made people play more**. A minor gameplay change affected play time up to 3× as much as the largest aesthetic change. | Andersen et al., "Placing a Value on Aesthetics in Online Casual Games", CHI 2011, https://grail.cs.washington.edu/projects/game-abtesting/chi2011/chi2011.pdf | verified |
| Aesthetic-usability effect: attractive interfaces are *perceived* as easier to use. Kurosu & Kashimura tested 26 ATM layouts with 252 participants, and appeal tracked perceived ease of use more than actual ease of use. "A pretty design can make users forgiving of minor usability problems, but not of large ones." | https://www.nngroup.com/articles/aesthetic-usability-effect/ | verified |
| Correlation between aesthetics and apparent usability r = 0.59. Tractinsky replicated the result in Israel (1997). | https://en.wikipedia.org/wiki/Aesthetic%E2%80%93usability_effect , https://chi1997.acm.org/proceedings/paper/nt.html | snippet-only |
| Store page: "50% of users leave the product page within 3 seconds". Screenshot redesigns raised conversion (vendor case studies). | https://yellowhead.com/?p=16301 , https://splitmetrics.com/customers/how-splitmetrics-optimize-helped-episode-boost-cr/ | snippet-only, vendor claims |
| Into the Breach: clarity beats cool, and animated tooltips beat text | (above) | verified |
| Factorio: the first level must be "visually representative" of the game | (above) | verified |
| Valve: "Don't worry about how it looks: Art production is less risky than gameplay production" | (above) | verified |

**What this means (OPINION, built on the findings above):**

1. **Perceived quality affects the first glance, and with it trust and forgiveness.** It does not rescue a confusing game: NNG says pretty design forgives minor problems, "not… large ones". The owner's two complaints are linked, but **comprehension comes first**.
2. **Where to spend art effort:**
   - The evidence favours **animation and state feedback** over audio or photoreal texture. Show current flowing along live cables, a breaker visibly tripping, de-energised sections greying out, a crew van driving to the site, an earth being applied.
   - In a simulation UI, "high quality but readable" means:
     - a coherent palette with semantic colour (energised, dead, faulted, earthed);
     - a strong size and contrast hierarchy (only the 1–3 things that matter now are prominent);
     - consistent, purpose-drawn vector icons instead of emoji (emoji render differently on every OS and look unfinished);
     - smooth transitions.
3. **"Realistic" should mean recognisable, not photographic.**
   - Use stylised but accurate drawings of the real objects: an RMU cabinet front with its switch handles, a pad-mount transformer, a cable trench, a crew van. Show them in a **site view** when the player acts on a device.
   - Keep the **network view** a clean Mini Metro-style diagram.
   - The diagram is where you think. The site view is where the realism and "wow" live. This is the same split as Into the Breach's clean board with animated tooltips.

---

## 6. Arabic / RTL player expectations

Mirroring rules, digits, fonts and terminology are already covered in `research/08-game-design.md` §5. New data from this pass:

| Finding | Source | Status |
|---|---|---|
| 41% of regional gamers play only Arabic-localised games or are more likely to play them. Over 75% in Saudi Arabia, the UAE and Qatar say portrayal of Arab culture is "very or somewhat important". Report: Niko Partners + Saudi Esports Federation, "Speaking the Language". Sample size not given. | https://www.arabnews.com/node/2567682 | verified |
| Over half of GCC gamers prefer Arabic text *and voice* localisation | https://www.pocketgamer.biz/saudi-arabia-and-uae-to-propel-gulf-region-games-spending-to-324-billion-by-2028 | snippet-only |
| A survey of Arab gamers found the majority prefer "partially localized" games (Arabic text, no Arabic dub) over fully re-voiced ones | UAEU, *Perspectives*, DOI 10.1080/0907676X.2021.1926520, https://research.uaeu.ac.ae/en/publications/current-trends-in-localizing-video-games-into-arabic-localization/ | verified (abstract) |
| A mobile-games survey (n = 382) found a strong preference for Modern Standard Arabic over dialect | https://research.uaeu.ac.ae/en/publications/arabic-mobile-game-localizations-gamer-profiles-preferences-and-i-2/ | snippet-only |
| PUBG Mobile uses MSA in GCC markets | Arab News (above) | verified |
| The Middle East had the highest regional D1 average (22.64%) in the GameAnalytics 2024 data | (§1) | verified (secondary) |

Voice preference conflicts between the Niko and UAEU sources.

**OPINION:**
- Write the tutorial in clear MSA, with the English technical term shown once next to the Arabic (for example قاطع الدائرة (CB)).
- Keep instructions short enough to work *without* voice.
- Optional voice would be a bonus, not a requirement.
- A Saudi or Gulf setting and crew names matter, per the 75% figure.
- No RTL-specific onboarding research found (**NOT FOUND**).

---

## Concrete recommendations for Grid Shift (ranked)

Every item below is **OPINION** derived from the cited findings. The evidence each one rests on is in brackets.

### 1. Replace "menu → full network" with a guided first incident that takes about 3 minutes and gives the first success within 60 seconds

[Andersen 2012: in-context tutorials matter most in complex games; GameAnalytics: value within 2–3 min; Duolingo: value before friction; Factorio: core concept in level 1]

- "Play" (one big button, no menu choices) loads straight into **Incident 0: "The lights went out."** Skip the menu on the very first launch.
- **0–10 s:** a small, *healthy* network animates power flowing from the substation to houses with lit windows. A short bang, a cable flashes red, the feeder breaker trips with an animation, and one half of the houses goes dark. A customer-minutes counter starts ticking. **Goal line, one sentence:** "Bring power back to the dark houses." (أعد الكهرباء للمنازل المظلمة)
- **10–60 s, first success:** spotlight the normally-open point. "This switch is open. Close it to feed the dark houses from the other side." The player taps it, power visibly flows around the ring, and *most* houses light up. The counter slows. Show a celebration and the score impact.
  - This is the first win. It teaches the ring/NOP idea by doing it.
  - It is *not* the full safe procedure. The faulty section stays dark, which sets up the next step.
- **60–180 s:** a crew report (one line plus an animated fault-indicator flag) shows where the fault is. The player then:
  1. sends the crew;
  2. opens the two switches either side of the faulty cable (the "isolate" step, with a short animation of each switch opening);
  3. applies the earth;
  4. watches a short repair time-lapse;
  5. removes the earth;
  6. closes the switches to restore the rest.
- **One action at a time.** Each step is one sentence with a spotlight on the target and a soft dim on everything else.
  - Do *not* hard-block other clicks. Andersen 2012 found blocking gave no benefit.
  - If the player clicks elsewhere, explain in one sentence why not yet, for example: "Don't earth a live cable: open both sides first."
- **End card:** customer-minutes lost, a 3-star rating, "You just did a real FLISR restoration." Then offer Incident 1.

### 2. Cut the first-session UI to at most 5 interactive elements and add the rest progressively

[Portal: too many concepts at once; Factorio: unify channels; Hodent: cognitive load; CS2: unlock panels as you progress]

- **Visible in Incident 0:** the network diagram, a goal line, the customer-minutes counter, the context action panel for the selected device, and a hint button.
- **Hide in Incident 0:** the Site, Crews, Evidence and Log tabs and the checklist dialog.
- **Merge the channels:**
  - One goal/instruction line replaces the banner, the log as the instruction source, and the separate dialog.
  - **Fold the safety checklist into the device's action panel:** when you open a switch, the panel shows the 2–3 checks inline as tappable steps. There is no separate modal.
- **Unlock schedule:**

| Level | Unlocks |
|---|---|
| Incident 1 | Crews panel (choosing between 2 crews and their travel times) |
| Incident 2 | Evidence panel (reading multiple FPIs or a relay record to locate the fault) |
| Incident 3 | Log, full checklist with permit steps, time pressure |

  Each unlock gets a CS2-style green blinking outline and a one-time 1-sentence explanation, archived in an "Advisor / المرشد" list.

### 3. Teach each concept by doing, at the moment it is needed, with the jargon introduced after the concept

[Barth: "not a single word of text"; Into the Breach: animated tooltips; Hodent: reduce memory load]

| Concept | Teach it by | Label after the player has done it |
|---|---|---|
| Ring with an open point | Close it and watch power flow around | "Normally Open Point (NOP)" |
| Breaker trip | Animated trip and darkened section in the intro | "Circuit Breaker (CB) / قاطع" |
| Fault passage indicator | Flag animates on the device the fault current passed; the last flag plus the first unflagged device brackets the fault | "FPI" |
| Isolation | Open both ends; the faulty section greys out | "Isolated / معزول" |
| Earthing | Animated earth clamp; only allowed on a dead, isolated section | "Earthed / مؤرض" |
| RMU | Tap a node and the site view shows the real cabinet with its 3 switch handles | "Ring Main Unit (RMU)" |

- Every term has a long-press/hover tooltip with a 2-second animated loop, not a paragraph.
- Use a glossary icon on first appearance only.

### 4. A tiered, state-aware hint system: the player pulls hints, and they escalate from pointing to the full answer

[O'Rourke 2014: generic always-on hints hurt, earned and concrete hints did better, and hints must match the player's current state; ITS literature: pointing → teaching → concrete]

- **Tier 0 (passive, automatic):** after ~20 s of no progress, the hint button gently pulses. No text pops up and the game is not interrupted.
- **Tier 1, pointing:** highlights the *area* that matters now, for example "Look at the fault indicators", with the FPIs glowing.
- **Tier 2, teaching:** explains the principle for *the current state*, for example "The fault is between the last flagged indicator and the first unflagged one."
- **Tier 3, concrete:** names the exact next action, for example "Open switch S4 at RMU-3", with an arrow and spotlight.
- **Tier 4, show me:** plays the solution replay (see 5).
- Hints are computed from the live game state: the next correct step in the solver's plan from *this* configuration, not a fixed script.
- After Incident 0, give a few **earned hint tokens** per incident (persistence effect). Each tier used adds a small, visible score penalty. Incident 0 has free, unlimited hints.
- Log which tier each player needed at each step. Any step where ≥50% of players need Tier 3 should be redesigned (escape-room heuristic).

### 5. "Watch the solution" as a Super Guide-style ghost replay, offered after struggle, with take-over

[Super Guide: offered after repeated failure, demonstrator stand-in, take over mid-demo; worked-example effect for novices with fading]

- **When it is offered:**
  - after an unsafe action has been blocked twice;
  - after ~90 s with no progress;
  - after a failed or very poor score;
  - always from the pause menu.
  - Never proactively at the start (Miyamoto's "intensely irritated").
- **What it shows:** a **ghost operator** (for example a translucent "senior engineer" cursor/avatar) performs the optimal sequence *from the player's current state*, not from the start:
  - each action is spotlighted with a one-line caption in Arabic and English;
  - power-flow and switch animations play;
  - the customer-minutes counter runs on a split timeline ("yours vs expert").
- **Controls:** pause, step forward/back, 1×/2× speed, and **"Take over from here"** at any step.
- **Fading:**
  - the first time a procedure is new, offer the full demo;
  - later incidents offer the "demo pauses at key step for you to do" mode;
  - expert levels offer only Tiers 1–3 plus a post-game "Compare with expert" replay.
- **Scoring:** completing by demo marks the incident "completed with guide" (Super Guide's provisional clear). The player can retry for stars. Do not hide the content.
- **Post-run replay for everyone:** after any incident, "Watch your run vs the expert run" side by side. This is the learning moment, and it also gives Zachtronics-style mastery motivation.

### 6. Visual overhaul: readable diagram plus realistic site views, with animation as the main investment

[CHI 2011: animation beats audio for retention; NNG: aesthetics earns forgiveness but cannot fix large problems; Into the Breach; Mini Motorways; Valve: art is lower-risk than gameplay]

- **Network view:**
  - a clean, thick-line, Mini Metro-style diagram;
  - semantic colours (energised, dead, faulted, isolated, earthed), plus a pattern or shape for colour-blind players;
  - large tap targets (≥44 px);
  - consistent custom SVG icons, **no emoji**.
- **Animation:** animated current flow (dashes moving along lines), lit and dark house clusters so customer impact is visible, smooth state transitions, a breaker-trip shake and flash.
- **Site view / close-up:** when the player acts on a device, slide in a detailed illustration of the real RMU front, switch handles, earth switch, crew van and cable trench, and animate the operation there. This is where the "high-quality, realistic" feel lives, without cluttering the decision space.
- **Order of work:** fix the onboarding and information architecture *first*, then playtest with 5 new people (including non-engineers) who get no help ("living room" rules), *then* commission the art. Valve's rule: art is lower-risk than gameplay.

### 7. Measure the first session

[GameAnalytics: funnel every step; Fractured Space: find the step with the biggest drop]

- Log anonymous step events for Incident 0: start, first action, first success, isolate, earth, restore, end card, Incident 1 start. Store them locally or use privacy-safe analytics.
- Targets (OPINION):
  - ≥90% reach the first success;
  - ≥70% finish Incident 0;
  - median time to the first success under 60 s.

### 8. Arabic-first details for the tutorial

[Niko/SEF 41%; UAEU partial-localisation and MSA preference]

- Short MSA instruction lines (≤ ~12 words), with the English abbreviation once in parentheses.
- Instructions must work without voice. Optional voice only later.
- Gulf setting, local crew names.
- Keep the schematic unmirrored and mirror only the chrome, per 08 §5.
- Test the first 3 minutes with native Arabic readers who are *not* power engineers, and separately with one engineer. The owner failing is the key data point: if an engineer could not play it, the problem is the UI and onboarding, not the domain.
