# 08 — Game design research: existing grid games, replayability, learning science, explorables, Arabic/RTL, static web tech

Researched 2026-11-13. Bibliography: `research/sources/08-gd.md` (IDs `[GD-xx]`).
Status tags on each claim: **verified** (page fetched and read), **snippet-only** (search snippet or summary only), **uncertain** (sources conflict or the page did not show it).
Anything marked **OPINION** is my design judgement, not a finding.

---

## 1. Existing electricity / grid games and tools

| Title | What it is | Fidelity | Praise / criticism (cited) | Gap for a distribution-network game |
|---|---|---|---|---|
| **NESO "Balancing the Grid"** [GD-01][GD-02] | Browser game (Unity). You work a control-room shift and keep frequency steady through demand peaks, renewable swings and outages. | Transmission/system balancing, abstracted. | Official page: "not currently optimised for mobile phones" (**verified**). Has a leaderboard and asks players to share scores on X (**snippet-only**). No player reviews found. | No network topology, no faults, no protection, no feeders or switching. Desktop only. |
| **Statnett "BALANCE"** [GD-03][GD-04] | Free mobile puzzle game (2015, built with Hyper Games). You build lines, towers and substations from plants to cities and avoid blackouts and accidents. | "based on a power simulator and Ohm's law" (**verified**, RGI). | ">3 million downloads worldwide" (**verified**, RGI). No independent reviews found. | Transmission-level puzzle. No protection coordination, no fault location, no Arabic. |
| **STABILITY: Grid Survival** [GD-05] | Web game from the Univ. of Washington. You match generation to load and keep frequency inside limits. Inertia drops at L2, storage arrives at L5, generation limits at L10, a tunable PID controller at L15. | Single-bus frequency dynamics. Explicit about inertia and power vs energy. | No reviews found. | One bus only, no network. Shows that a free static web grid game can teach real dynamics (**OPINION**). |
| **Power Network Tycoon** (Steam) [GD-06] | HV network builder with storms, heatwaves and a level editor. Full release 30 Sep 2026. | The developer, a power engineer, claims physics-based calculations including ground potential rise and EMF. This is the developer's claim and is unvalidated. | 32 reviews, 93% positive (**verified**, snapshot). PCGamesN: "Cities Skylines 2 meets Factorio". | Paid, English-centric, HV-focused. Restoration and protection settings are not described. |
| **Power to the People** (Steam) [GD-08–10] | City-growth grid management with weather and random events. Has a leaderboard. | Abstract. | Destructoid 7/10: "I don't see any lasting appeal". It calls instant rebuilds unrealistic and says random events make leaderboards feel unfair (**verified**). Chalgyr 8/10: "doesn't offer much in replayability", and waiting is tedious (**verified**). Steam "Very Positive (436)" (**snippet-only**). | **Replayability is the main criticism.** Random events undermine fair comparison. |
| **Green With Energy** [GD-07] | Grid-design puzzle with renewables, batteries and transformers, plus leaderboards. | Abstract. | "Mixed", 61% of 26 reviews (**uncertain**: the fetched URL and the app ID did not match). | Small, abstract. |
| **Electrician Simulator** [GD-11] | First-person house wiring job simulator. | Low electrical fidelity. | Players rate realism "2/10" and say wiring is oversimplified and the terminology is EU-centric. Metacritic 60 (**snippet-only**). | Shows that "simulator" branding without electrical correctness draws criticism from technical players. |
| **Factorio power** [GD-12] | Pole-connected networks. On a shortage every machine slows in proportion, and on a surplus generators throttle. Draws solar first, then steam, then accumulators. | Pure energy accounting. No voltage, no faults. | (**snippet-only**) | Good example of readable feedback (machines visibly slow). No electrical engineering content. |
| **Zachtronics: Opus Magnum / SHENZHEN I/O** [GD-13][GD-14][GD-30] | Open-ended engineering puzzles. Histograms on several metrics, GIF export, Workshop puzzle editor. SHENZHEN ships a 30+ page datasheet manual. | Internally consistent invented rules. | 97% of 3,722 and 95% of 2,261 English reviews positive (**verified**). | Model for **mastery** play: many valid solutions, scored on several axes. |
| **Kerbal Space Program** [GD-15] | Rocket sandbox with "realistic aerodynamic and orbital physics". | High. | 96% of 85,108 positive (**verified**). | Evidence that players accept high physics fidelity when failure is fun and legible (**OPINION**). |
| **Turing Complete** [GD-16] | NAND gate up to a full CPU. | Exact digital logic. | Praised for its progression. Criticised for UI, unclear instructions and a steep curve (**snippet-only**). | Shows a "from first principles" career path works for technical audiences. |
| **Nodebuster** [GD-17] | Short incremental game. | n/a | Overwhelmingly Positive, about 4 h to 100% (**snippet-only**). | Short, polished, cheap. Not a model for a game people play for years. |
| **Mini Metro** [GD-18] | Minimalist transit planning that started at Ludum Dare. | Abstract. | Robert Curry: minimalism "made the game hard to make" (**snippet-only**). | Visual language model for one-line diagrams (**OPINION**). |
| **Power Grid** board game [GD-19] | Auction, network building and a supply/demand fuel market (2004). | Economic abstraction. | BGG about 7.8, Hall of Fame 2025 (**snippet-only**). | Planning and economics only. |
| **PowerWorld** [GD-20] | Professional transmission simulator. | Engineering-grade. | Free evaluation capped at 13 buses. The student version (40 buses) comes with a textbook. Commercial from $11,000 (**snippet-only**). | Not a game, Windows-only, licensed. |
| **GridLAB-D / Arras Energy** [GD-21] | Open-source distribution simulator from PNNL/DOE. | Engineering-grade. | (**snippet-only**) | Not a game. Possible reference for validating models. |
| **PhET Circuit Construction Kit** [GD-22][GD-44][GD-45] | Free HTML5 circuit sim. | DC/AC circuit level. | Peer-reviewed learning gains (see §3). | Circuits only, not networks or utility operation. |
| **Wirespan** (Show HN, 2026) [GD-23] | Daily 9×9 grid routing puzzle (Steiner-tree-like) in 18 languages, with high-contrast and reduced-motion modes. | Graph routing only. | HN commenters asked for "a leaderboard for the daily puzzle" and a tip jar (**verified**). | Confirms appetite for a daily grid puzzle. No electrical engineering content. |
| **BambooGrid** (Show HN) [GD-24] | Open-source web power-flow editor (pandapower). | Engineering. | Users found visual power flow helpful. Newcomers stumbled on the slack bus and on connecting elements (**verified**). | A tool, not a game. Onboarding pain is a warning. |
| **Griddle** (UC Berkeley CITRIS) [GD-25] | Grid design/operation game with a high-school curriculum. | "same… simulation algorithms as popular industry and research tools", but emphasises accessibility over accuracy (**verified**). | No evaluation on the page. Availability unclear. | Unclear whether it is still available. |
| **PowerSurge** (2015) [GD-26] | Serious game on transmission. | ? | (**snippet-only**) | Transmission only. |
| **SOS/WSC operator trainer** [GD-27] | Commercial web operator-training simulator covering restoration. | Professional. | (**snippet-only**) | Paid, for professionals. |
| itch.io HTML5 grid games [GD-28] | Power The Grid, GridSim, Idle Power Grid. | Low. | (**snippet-only**) | None found that models protection or restoration. |

**NOT FOUND** in this pass:
- Any game, free or paid, built around **distribution fault location, isolation and service restoration (FLISR), protection coordination (relay/recloser/fuse curves), or power quality**.
- Any electricity game in **Arabic**.
- Dedicated Steam or Reddit review threads for the NESO game.
- A 1991 IEE paper on a microcomputer distribution-restoration training package appeared in a search summary only, and its venue is unconfirmed (**snippet-only**).

### Gaps no existing game fills
1. **Distribution-level realism.** Nothing found models radial feeders, normally-open ties, sectionalising, fault indicators, reclosers, fuse–recloser coordination, cold-load pickup or voltage drop along feeders as gameplay. Every game found is transmission balancing (NESO, STABILITY, Statnett), city-builder abstraction (Power to the People, Green With Energy), or house wiring (Electrician Simulator).
2. **Protection and power quality** as puzzles (TCC curves, harmonics, flicker, voltage sag) — none found.
3. **Bilingual Arabic/English** technical game — none found.
4. **Replayability.** The closest commercial titles are criticised for lacking it [GD-09][GD-10].
5. **Free, static, no-account, mobile-capable.** NESO says it is not optimised for phones [GD-01]. The stronger titles are paid Steam games.
6. **Credibility with engineers.** Electrician Simulator shows that wrong physics or terminology gets called out [GD-11]. Power Network Tycoon claims engineering calculations but publishes no validation [GD-06].

---

## 2. Replayability and retention

- **Daily seeded challenge.** Spelunky's Daily gives every player the same procedurally generated level with one attempt per day [GD-36] (**snippet-only**). Mike Rose argues that the one-attempt stakes make players more deliberate, and that the shared level turns a single-player game into a community event [GD-35] (**verified**). A known weakness is that players can watch someone else's run first [GD-36] (**snippet-only**). Slay the Spire's Daily Climb combines one seed with three random modifiers [GD-37] (**snippet-only**).
- **Wordle effect.** Wardle wanted "three minutes of your time a day". The emoji grid was a player's idea that he built in, deliberately without a link [GD-33] (**verified**). Secondary sources credit the spoiler-free share grid with growth from about 12k to about 300k daily players between Dec 2021 and 1 Jan 2022 [GD-34] (**snippet-only**).
- **Serverless daily puzzles work.** The puzzle is a pure function of the UTC date, and streaks live in localStorage. Known limits: the client can edit its own score, there is no cross-device sync, and there are no aggregates without a backend [GD-38] (**verified**).
- **Histograms vs leaderboards.** Barth replaced leaderboards with histograms because "Getting your name at the top of the leaderboards is a fantastic incentive for cheating". Histograms let players "impersonally see how your solution stacks up". Three competing metrics stop single-metric tunnel vision [GD-30] (**verified**). Histograms need aggregated data, so a server or a platform such as Steam.
- **Serverless alternatives to histograms (with evidence):**
  - *Community-run Pareto boards.* The Opus Magnum community runs a records board outside the game: a reddit/Discord bot, solution files plus GIFs anyone can inspect, a Pareto frontier over many metrics, and no names attached, which made it "a quest" rather than a competition [GD-32] (**verified**).
  - *Shareable result strings* (Wordle) [GD-33].
  - *Shared content via URL/gist.* PuzzleScript loads user games from GitHub gists by ID in the URL. Unauthenticated loads can hit GitHub API rate limits [GD-39] (**snippet-only**).
- **Sandbox, editor and UGC.** Opus Magnum ships a Workshop puzzle editor and features the best community puzzles in-game [GD-13]. Power Network Tycoon ships a level editor [GD-06]. Kerbal has Sandbox and Career modes [GD-15]. Nicky Case ends most explorables with a sandbox [GD-50] (all **verified**).
- **Random events and fairness.** Destructoid says random events make Power to the People's leaderboards feel unfair [GD-09] (**verified**). Seeded randomness that is identical for all players avoids this.
- **Open-ended puzzles.** Barth calls them "unquestionably the biggest thing we did right" [GD-30] (**verified**).

---

## 3. Serious-game and engineering-education research

| Finding | Source | Status |
|---|---|---|
| Serious games beat conventional instruction for learning (d = 0.29, 77 studies, N = 5,547) and retention (d = 0.36), but were **not** more motivating. Gains are larger when the game is **supplemented with other instruction**, uses **multiple sessions**, and is played **in groups**. Narrative was not significant. | Wouters et al. 2013 [GD-40] | bibliographic data verified; numbers **snippet-only** |
| Instructional support inside games improves learning (d = .34, k = 107). The effect is largest for **skills** (d = .62) and for support that helps learners **select relevant information** (d = .46). | Wouters & van Oostendorp 2013 [GD-41] | **snippet-only** |
| Games vs non-game conditions: about 0.33 (k = 57). **Augmented** game designs vs standard versions: about 0.34 (k = 20). Visual realism was among the moderators, and a summary reports that simpler visuals were as or more effective. | Clark, Tanner-Smith, Killingsworth 2016 [GD-42] | scope **verified** (SRI page); numbers **snippet-only** |
| Simulation games vs comparison groups: self-efficacy +20%, declarative knowledge +11%, procedural knowledge +14%, retention +9% (65 studies). | Sitzmann 2011 [GD-43] | **snippet-only** |
| PhET design features: familiar elements; showing the invisible; multiple representations; direct manipulation; measuring instruments; interview-tested animations; and "distortion and simplification of reality to enhance educational effectiveness". A 2-hour CCK exercise beat a real-equipment lab on final-exam questions about current and voltage. Starting Radio Waves on a simple panel led students to later prefer the complex view, while starting on the complex view overwhelmed them. With real equipment, students fixate on irrelevant details such as wire insulation colour. | Wieman, Adams, Perkins 2008 (*Science*) [GD-44] | **verified** (PDF text) |
| CCK substitution: simulation students later built real circuits faster. PhET itself says results depend on context. | Finkelstein et al. 2005 [GD-45] | **snippet-only** |
| Minimal guidance fails novices. Worked examples reduce working-memory load, and the effect reverses as expertise grows (expertise reversal). | Kirschner, Sweller, Clark 2006 [GD-46] | **snippet-only** |
| Reduce cognitive load: segmenting, pretraining on component names and behaviour, signalling, spatial contiguity, avoiding redundancy. | Mayer & Moreno 2003 [GD-47] | **snippet-only** |
| The fidelity–learning relationship is non-linear. Optimal fidelity depends on learner stage, and novices do better with lower fidelity. | Alessi 1988 [GD-48] | **snippet-only** |
| 36 learning principles drawn from good games (e.g., Active Critical Learning, Semiotic, Identity, Insider). A reviewer calls them "observations and opinions" rather than empirical findings. | Gee 2003 [GD-49] | **snippet-only** |
| Power-system education games: Griddle (no evaluation on the project page), PowerSurge (transmission). No peer-reviewed study of a **distribution restoration game** was found. | [GD-25][GD-26] | NOT FOUND (for distribution restoration) |

Caution: none of the meta-analyses are specific to power engineering. Their effects are moderate (d ≈ 0.3) and depend on context.

---

## 4. Why explorable web projects succeed

- **Nicky Case's recipe** [GD-50] (**verified**):
  - Start with a question the reader cares about.
  - Start concrete: drag shapes, play a round.
  - Climb the ladder of abstraction using BUT/THEREFORE links.
  - "smart the people up", don't dumb ideas down.
  - End with an open question and a sandbox, which "allows the student to go beyond the teacher".
- **Bret Victor** [GD-52][GD-53] (**verified**). Reactive documents let readers change assumptions and see the consequences. "The author must guide the reader". Models should expose their assumptions. Insight comes from moving between concrete cases and abstract summaries, with direct control of time and parameters.
- **Amit Patel / Red Blob Games** [GD-54] (**verified**).
  - Guide readers rather than "throw them into an open ended simulation".
  - Learner-controlled animation beats system-controlled animation.
  - Only 10–15% of NYT readers interact with interactive graphics.
  - Readers "form hypotheses about my implemented system but not about the topic". This risk is directly relevant to an engineering game.
- **Reach of explorables.** The hex-grid guide is the author's most popular page (**snippet-only**) [GD-55]. The Evolution of Trust has fan translations including Arabic and Persian (**snippet-only**) [GD-56]. **NOT FOUND:** HN point counts or a discussion of why Bartosz Ciechanowski's articles succeed. Searches returned only general praise (Tildes).
- **Critique** (**snippet-only**, via [GD-54] and a search summary): explorables "don't scale" and mostly benefit people who already understand the concept.

---

## 5. Arabic / RTL localisation

**Mirroring rules (verified unless noted)**

- **Mirror:** page layout, navigation, back/next, progress bars and sliders (reverse the numeral sequence too), and illustrated timelines [GD-60][GD-61].
- **Do not mirror** [GD-60][GD-61]:
  - Digits inside a number.
  - Media playback controls.
  - Clocks.
  - "Charts and graphs" (Material v1).
  - Photos, logos and universal marks.
  - Real-world objects.
  - Controls that point at a physical direction or a place on screen.
- **Guidance conflicts on time:**
  - Newer Material guidance reportedly mirrors elements "depicting the passage of time" (**uncertain**, page is JS-rendered) [GD-62].
  - Adobe Spectrum keeps clock icons unmirrored (**snippet-only**) [GD-63].
  - In practice, Arabic news charts mirror categorical charts more often. Time axes are inconsistent: CNN Arabic mirrors its time x-axis, and the paper says "we lack a similar standard for visualization design" [GD-64] (**verified**).
- **Single-line diagrams, phasor diagrams and TCC curves:** no specific guidance found. Apple's rule against flipping real-world objects and controls that refer to physical direction [GD-60], and Material v1's "charts and graphs" rule [GD-61], both point toward **not mirroring** them. **OPINION:** keep schematics, phasors (counter-clockwise rotation is a physical convention), TCC log-log plots and waveform time axes LTR and unmirrored. Mirror only the UI chrome around them, and test with native readers.

**HTML mechanics** [GD-65][GD-66]
- Put `dir="rtl"` on `<html>`, and do not set base direction in CSS.
- Use `dir="auto"` or `<bdi>` for user or runtime text.
- Use logical (start/end) CSS properties.

**Numerals**
- ICU/CLDR default for `ar-SA` is Eastern Arabic digits: Node ICU 78.3 formats `Intl.NumberFormat('ar-SA')` as "١٬٢٣٤٫٥" [GD-67][GD-68] (**verified**).
- A CLDR-users post says Arabic government and news sites the poster visited "all use Latin digits" [GD-67] (**verified** as that person's observation).
- New Saudi road signs use Western digits only [GD-69] (**snippet-only**).
- Apple: Western/Eastern usage "varies among countries and regions" [GD-60].
- No Saudi regulation covering technical documents was found (**NOT FOUND**).
- Implementation implication: force `-u-nu-latn` explicitly rather than relying on the locale default.

**Fonts** [GD-70] (**verified** from the raw licence files)
- Cairo, Tajawal, IBM Plex Sans Arabic, Noto Sans Arabic, Noto Kufi Arabic and Almarai are all SIL OFL 1.1.
- IBM Plex reserves the font name "Plex", so a modified version cannot keep that name.
- Apple suggests setting Arabic about 2 pt larger next to uppercase Latin [GD-60].

**Terminology**
- KSGAAL + Ministry of Energy *Energy Terminology Dictionary*: more than 1,500 Arabic–English terms in 8 fields, including electricity, renewables and units [GD-71] (**verified**). Whether access is free, and whether SEC was a collaborator, is not confirmed on the page.
- SEC's Arabic Saudi Arabian Grid Code has a glossary [GD-72] (**snippet-only**).
- Electropedia (IEC 60050): the homepage snippet lists Arabic among its languages, but coverage reportedly varies by subject area. A direct fetch returned 403 (**uncertain**) [GD-73].

---

## 6. Free tech for a static browser game

- **GitHub Pages via Actions** [GD-80] (**verified**):
  - Uses `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4` and `actions/deploy-pages@v4`.
  - The deploy job needs `pages: write` and `id-token: write`, and runs in the `github-pages` environment.
- **GitHub Pages limits** [GD-81] (**verified**): site ≤1 GB, soft 100 GB/month bandwidth, not for commercial SaaS.
- **PWA offline** [GD-82] (**verified**): precache the app shell in `install`, serve cache-first in `fetch`, version the cache name, and delete old caches in `activate`.
- **Audio** [GD-83] (**verified**): create or resume the `AudioContext` inside a user gesture. Synthesise sounds with `OscillatorNode` and provide labelled mute/volume controls.
  - Asset sources: Kenney packs are CC0 (Interface Sounds: 100 files) [GD-84] (**verified**). Freesound mixes CC0, CC BY and CC BY-NC, so filter for CC0 [GD-85] (**verified**).
  - Generators: jsfxr is Unlicense and jfxr is BSD, with generated sounds unrestricted [GD-86] (**snippet-only**).
- **Rendering 100–500 elements** [GD-87] (**snippet-only**):
  - Sources put SVG comfortably within hundreds to low thousands of elements. Horak et al. measured losses above about 400 nodes (≈8,000 graphical elements).
  - Canvas or WebGL is for many thousands of elements or heavy per-frame animation.
  - SVG keeps DOM events, accessibility and crisp text.
- **Accessibility** [GD-88][GD-89]:
  - Game Accessibility Guidelines (Basic/Vision): no essential information through colour alone. Back colour up with shape, symbol or text, offer presets plus a custom palette, and avoid whole-screen filters (**verified**).
  - Okabe–Ito 8-colour palette (**snippet-only**).

---

## Design implications (OPINION — labelled, not findings)

1. **Niche:** a free, bilingual, mobile-capable **distribution** game built on FLISR, protection coordination and power quality. Nothing found occupies it.
2. **Replayability stack (all static-hostable):**
   - (a) Daily seeded feeder-fault puzzle. The seed comes from the UTC date and all players get identical randomness, avoiding the fairness criticism in [GD-09].
   - (b) A Wordle-style spoiler-free share string, e.g. `⚡ Feeder #312 · restored 94% in 4 ops · ⭐⭐⭐`.
   - (c) Several metrics per puzzle (customer-minutes lost, switching operations, equipment stress, cost), shown as a **Pareto "par" frontier computed offline by the developers' own solver** and shipped with the puzzle, instead of a server histogram.
   - (d) Level editor with levels encoded in the URL hash, which needs no server, so sharing works on any platform.
   - (e) A career mode that climbs from circuits to feeders to protection to planning.
3. **Fidelity ladder** (Alessi, PhET, Kirschner):
   - Start abstract, with a simplified start-up panel and pretraining on component names.
   - Unlock engineering detail (impedances, TCCs, per-unit values) as the player advances.
   - Keep an "engineer view" that exposes the model's assumptions, following Victor [GD-52].
   - Validate the calculations against an open reference (e.g. pandapower/GridLAB-D) and publish the test cases. Credibility is the moat [GD-06][GD-11].
4. **Explanation after failure:**
   - Every failure should replay with an annotated "what happened". Guidance and support are where the meta-analytic gains are [GD-41][GD-46].
   - Avoid text walls ("We used too much text" [GD-30]). Teach through concrete manipulation first [GD-50].
5. **RTL:**
   - Mirror the app chrome. Keep single-line diagrams, phasors, waveforms and TCC plots LTR.
   - Default to Western digits with `nu-latn`, with an optional toggle.
   - Use Noto Sans Arabic, IBM Plex Sans Arabic or Cairo under OFL.
   - Build a glossary that cites KSGAAL, the SEC grid code and IEC terms.
6. **Render** networks in SVG, which is fine for 100–500 elements. Use a canvas layer only for animated waveforms or particle effects. Use colour plus shape plus line-dash for energised, de-energised and faulted states.
7. **Sessions:** the meta-analyses favour multiple sessions and supplementary instruction [GD-40]. A daily 3–5 minute puzzle plus optional deep levels matches this.

## Open questions

1. Is Electropedia's Arabic coverage good enough for distribution and protection vocabulary (IEV parts 448, 601–617)? This needs a manual check from a non-blocked network.
2. Is the KSGAAL energy dictionary freely downloadable, and under what licence can terms be reused?
3. Do Saudi utility engineers expect Western or Eastern digits in SCADA and technical UIs? This needs user testing; no regulation was found.
4. Should time axes be mirrored in Arabic mode? There is no standard [GD-64]. A quick A/B with Arabic-speaking engineers is needed.
5. Is Griddle still available, and was it ever formally evaluated? The 2015 PowerSurge evaluation results were not read.
6. Full texts of Wouters 2013 and Clark 2016 were not read. The effect sizes above come from abstracts and snippets.
7. How to stop daily-score cheating without a server? Possibly by sharing a replayable move list that anyone can verify locally. This is untested.
8. Do NESO and Statnett publish player numbers or learning evaluations? None were found.
