# Engineering (Production + Performance)

**Mission:** Deterministic, well-tested, fast TypeScript that always builds and deploys from `main`.

**Responsibilities:** architecture (`docs/design/ARCHITECTURE.md`), repository layout, build (Vite), CI (GitHub Actions), PWA, determinism rules (only exact float ops in state code; seeded PRNG), performance budgets, dependency licences (`docs/LICENSES-DEPENDENCIES.md`).
**Does not:** decide physics models or game rules.

**Quality gate:**
1. CI green: `tsc --noEmit` (strict), lint, unit + golden + property tests, build.
2. Determinism test: identical seed + action list → identical state hash in Node and in Chromium (Playwright).
3. Performance budgets (measured in CI with Playwright on Chromium): initial JS ≤ 250 KB gzip; first load to interactive ≤ 2.5 s on simulated mid-range mobile (Lighthouse-style CPU 4× throttling); engine step for 300-bus network ≤ 5 ms; 60 fps target / ≥ 30 fps floor when panning the diagram.
4. Every dependency has a permissive licence recorded; 0 paid services.
