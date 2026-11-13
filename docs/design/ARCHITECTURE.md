# ARCHITECTURE

_Status: v1 draft (Phase 3). Owner: Engineering. Reviewed by: design review (see `docs/design/REVIEW-phase3.md`)._

## 1. Principles

1. **One shared engine, thin modes.** All physics, protection, time, events, crews and metrics live in `src/engine/` with no DOM dependency. Modes (`src/modes/*`) only configure scenarios, allowed actions, objectives and scoring, and choose which engine outputs the UI shows.
2. **Deterministic and seeded.** Same `(engineVersion, mode, seed, actions[])` ⇒ bit-identical state on every browser. This enables daily challenges, URL-shared scenarios, replays and verifiable share strings.
3. **Validated before used.** Each engine model has golden tests against published references (`tests/golden/`) and property tests (`tests/property/`). See FIDELITY.md for methods and tolerances.
4. **Static and free.** TypeScript + Vite build to static files; PWA for offline; GitHub Pages; no server, no accounts, no paid APIs.
5. **Honest data.** Every physical parameter in `src/data/` carries a source ID (`research/sources/*`) or an `assumption` flag; Model notes are generated from the same tables.

## 2. Tech stack (licences in `docs/LICENSES-DEPENDENCIES.md`)

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | brief default; type safety for engine |
| Build | Vite | fast, static output, simple Pages deploy |
| UI | Preact (+ @preact/signals) | ~4–5 KB, React-like, MIT; keeps JS budget small |
| Rendering | SVG for network diagrams; Canvas only for charts/waveforms if needed | 100–500 elements is SVG's comfortable range [GD-87]; DOM events + accessibility |
| Tests | Vitest (unit, golden, property via fast-check), Playwright (e2e, a11y via axe-core) | free, standard |
| Audio | Web Audio API, synthesized sounds (no asset files) | zero licence risk, tiny |
| PWA | hand-written service worker (cache-first app shell, versioned cache) | no plugin dependency; [GD-82] pattern |
| Fonts | Noto Sans Arabic / IBM Plex Sans Arabic (OFL), self-hosted subset; system UI font for Latin | OFL verified [GD-70] |

## 3. Module layout

```
src/
  engine/
    math/        complex.ts, dmath.ts (deterministic exp/log/pow), linalg.ts (complex dense LU)
    rng.ts       sfc32 + splitmix32 seeding; named sub-streams
    model/       network types: Bus, Branch(cable), Transformer, Switch(LBS|CB|FuseSwitch|Earth), Load, Source, FPI, Relay
    topology.ts  closed-switch graph → islands, energisation, radiality check, paths source→bus
    powerflow.ts current-injection fixed-point on Y-bus (LU factor per topology), ZIP loads; balanced positive sequence
    shortcircuit.ts  IEC 60909-style: sequence Y-buses (1,2,0 incl. earthing, C0), Thevenin at fault bus, 4 fault types, branch currents
    protection.ts    IDMT/DT/instantaneous elements (IEC & IEEE constants), travel integrals, fuses, self-powered relay limits
    fpi.ts           FPI pickup (phase / residual through sensor), latch, reset rules
    thermal.ts       IEC 60076-7 difference equations per transformer; cable steady rating + adiabatic check
    loads.ts         daily load shapes (Riyadh summer/winter), customer counts, cold-load pickup factor
    events.ts        priority queue (time, seq) — the only clock
    crews.ts         crew entities, travel/operate times (assumption-flagged parameters)
    reliability.ts   interruption log → CI, CML, SAIFI, SAIDI, CAIDI, MAIFI (configurable thresholds)
    sim.ts           Simulation: state + step/advanceTo + apply(action) + hash()
    scenario/        procedural generator (Riyadh-style district), fault generator, daily seed
  data/            parameter tables with source IDs (cables, transformers, curves, FPI ranges, SEC rules)
  modes/
    nightshift/    flagship: fault response on open rings
    (later) grading/, heatwave/, planning/, cases/
  ui/              Preact components: shell, diagram (SVG), panels, log, tutorial, results, model-notes, settings
  i18n/            en.json, ar.json, glossary.json, i18n.ts (dir, digits policy)
  audio/           synth.ts
  app.tsx, main.ts, sw.ts
tests/ unit/ golden/ property/ e2e/
```

## 4. Engine data flow

```
Scenario(seed) ──► Network + Load profiles + Fault schedule + Crew roster
                          │
         Action (player) ─┼─► Simulation.apply(action, t)  ──► events queue
                          │
   events.pop() ─► state change (switch op, fault start, relay trip, crew arrival, tick)
                          │
                 topology.recompute() if switching state changed
                          │
     ┌────────────────────┼──────────────────────┐
  powerflow (energised)  shortcircuit (if a fault active) thermal (on ticks)
     │                    │                      │
  voltages/loading     fault currents ──► protection timers / FPIs ──► new events (trips)
     └────────────────────┴──────────────────────┘
                          │
                   reliability log (customers on/off with timestamps)
                          │
                    Observation (what the UI may show, per mode rules)
```

- **Fault handling:** while a fault is present on an energised island, the short-circuit solution (with present topology) gives the current through every relay, fuse and FPI. Protection elements integrate `dt / t_op(I)` between events; the earliest to reach 1 schedules a trip event. After each trip, topology and fault currents are recomputed (so sequential tripping and miscoordination emerge naturally).
- **No fault:** power flow on each energised island gives voltages, currents, loading, losses.
- **Ticks:** thermal and load profile update every game minute (sub-stepped to Δt ≤ 2 min per IEC 60076-7 stability, FIDELITY §thermal).

## 5. Determinism rules (enforced by lint + tests)

- State-affecting code uses only `+ − × ÷`, `Math.sqrt`, comparisons, and `dmath.exp/log/pow` (our own implementations in exact ops). `Math.exp/log/pow/sin/cos/**/hypot` are forbidden in `src/engine/**` (ESLint `no-restricted-properties`). Reason: ECMAScript leaves those implementation-approximated [PF-27/28].
- Iteration order fixed (arrays, sorted ids; never `for…in` over objects, never Map iteration of insertion-dependent hashed keys without sorting).
- Single PRNG source with named sub-streams (`rng.stream('faults')`) so adding a new consumer doesn't shift others.
- `sim.hash()` = FNV-1a over a canonical serialisation of state (floats via their IEEE-754 bit patterns). e2e test compares Node vs Chromium hashes after a scripted run.
- Time is integer milliseconds of game time.

## 6. Modes as thin layers

```ts
interface Mode {
  id: string;
  makeScenario(seed: number, difficulty: Difficulty): ScenarioSpec;  // uses engine/scenario
  allowedActions(obs: Observation): ActionSpec[];
  objectives: Objective[];          // e.g., restore ≥ 95 % customers
  score(log: EventLog, sim: Simulation): ScoreCard;  // real metrics only
  par(seed, difficulty): ScoreCard; // computed by a solver/heuristic in the build or at load time
  tutorial?: TutorialScript;
}
```

## 7. Sharing & persistence

- **URL hash** encodes `v=<engineVersion>&m=<mode>&s=<seed>&d=<difficulty>[&a=<actions base64url>]`. Opening the URL reproduces the scenario; with `a=` it replays the run (verifiable scores, serverless).
- **Daily:** seed = FNV-1a("YYYY-MM-DD" UTC + mode id). Share string: emoji summary + score + URL with the replay, so others can verify.
- **localStorage** (wrapped in try/catch): settings, language, progress, streaks, personal bests. The game works if it is unavailable.

## 8. Performance budgets

See `docs/org/engineering.md` gate. Expected: a district of 2 grid stations, 4–6 rings, ~60 package substations ⇒ ~130 buses; dense complex LU of 130² is ~0.7 M complex flops ⇒ ≪ 5 ms.

## 9. Deployment

GitHub Actions: `ci.yml` (typecheck, lint, unit+golden+property tests, build, e2e) on push/PR; `pages.yml` (build + `actions/upload-pages-artifact` + `actions/deploy-pages`) on push to `main` [GD-80]. Vite `base` set to the repository path.
