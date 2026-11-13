# Engineering (Production + Performance)

**Mission:** Deterministic, well-tested, fast TypeScript that always builds and deploys from `main`.

**Responsibilities:** architecture (`docs/design/ARCHITECTURE.md`), repository layout, build (Vite), CI (GitHub Actions), PWA, determinism rules (only exact float ops in state code; seeded PRNG), performance budgets, dependency licences (`docs/LICENSES-DEPENDENCIES.md`).
**Does not:** decide physics models or game rules.

**Quality gate:**
1. CI green: `tsc --noEmit` (strict), lint, unit + golden + property tests, build.
2. Determinism test: identical seed + action list → identical state hash in Node, Chromium, Firefox and WebKit — all four **mandatory** in CI (a missing browser fails the job, never skips).
3. Performance (measured): topology change + PF + SC on the largest v1 Hard district ≤ 5 ms median (CI Chromium, no throttle); par computation ≤ 1.5 s at 4× CPU throttle; initial JS ≤ 250 KB gzip; Lighthouse LCP ≤ 2.5 s and TBT ≤ 300 ms (median of 3 runs, mobile preset) — advisory until the Lighthouse job is in CI; panning smoothness advisory (no long task > 50 ms during a scripted pan in headed Chromium).
4. Every dependency has a permissive licence recorded; 0 paid services.
