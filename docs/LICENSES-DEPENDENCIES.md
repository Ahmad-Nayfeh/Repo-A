# Dependency licences

Generated from `node_modules/*/package.json` on 2026-11-13. All permissive / free; no paid services, no accounts.
Shipped in the game bundle: **runtime** rows only (MIT, OFL-1.1). Dev tools are not shipped.

| Package | Version | Licence | Use |
|---|---|---|---|
| @fontsource/noto-sans-arabic | 5.3.0 | OFL-1.1 | runtime |
| @preact/signals | 2.11.4 | MIT | runtime |
| preact | 10.29.8 | MIT | runtime |
| @axe-core/playwright | 4.14.0 | MPL-2.0 | dev |
| @playwright/test | 1.63.0 | Apache-2.0 | dev |
| @preact/preset-vite | 2.10.6 | MIT | dev |
| @types/node | 22.20.5 | MIT | dev |
| eslint | 9.39.5 | MIT | dev |
| typescript | 5.9.3 | Apache-2.0 | dev |
| typescript-eslint | 8.72.2 | MIT | dev |
| vite | 6.4.6 | MIT | dev |
| vitest | 3.2.7 | MIT | dev |

Notes:
- `@axe-core/playwright` (MPL-2.0) is used only in tests; it is not distributed with the game.
- Test-time reference data: MATPOWER `case33bw.m` is fetched during tests and never committed (its case files are not covered by MATPOWER's BSD licence) — D-005.
- Sounds are synthesized with the Web Audio API (no audio assets). Icons are Unicode glyphs.
- Game code: MIT (see `LICENSE`).
