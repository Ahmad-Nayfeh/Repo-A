# ROADMAP (priority order)

Each item must pass the same gates as v1 (golden tests, safety review, AR/EN, phone + desktop). Items come from D-011 (cut line), the research synthesis and the review reports.

## Now (blocking the public link)
0. **Enable GitHub Pages** — owner click, see `docs/NEEDS-AHMAD.md` §1.

## v1.x — deepen Night Shift
1. **Persistent "home district"**: switchgear duty, damaged screens and repaired joints carry over between shifts (localStorage) — day 30 differs from day 1 (D3-04).
2. **Condition-of-the-day rotation** for the daily: solid-earthing district, 40 °C ground, one crew, comms loss, stale FPIs, damage-report day (D3-04).
3. **Evolving faults** (SLG → DLG/3ph-E in cable joints) and **second faults** on Expert (needs a source for evolution rates; until then labelled [A]).
4. **Observation-limited search bot** to measure mastery headroom (game-design gate 3) and to make par stronger.
5. **Versioned builds** at `/v/<n>/` so old replay links keep reproducing (D-013) — implement when engine v2 changes physics.
6. **PWA offline** (service worker keyed by build version).
7. **Fuse operation & transformer tee-off faults** — needs public fuse time–current data (ABB/SIBA digitised with stated tolerance) and IEC 62271-105 transfer-current logic.

## Next modes (same engine)
8. **Grading** (protection coordination puzzle): set IDMT/DT relays and fuses on a feeder; engine applies faults everywhere plus inrush and cold-load; score selectivity, worst clearing time, minimum margin. Engine parts exist (curves validated); needs fuse curves (item 7) and the IEEE reset model.
9. **Heatwave** (thermal operations): IEC 60076-7:2005 difference equations with SEC 51-SDMS-04 parameters (45/50 K rises, hot-spot 98 °C at 35 °C); golden tests Annex C (±0.15 K, 6.15 days) and Annex E (114.2 °C), plus the SEC emergency-loading table as a one-sided check. Research done (`research/05`, `research/12`).
10. **Planning** (expansion): SEC DPS rules (50 % loading, indicative 7.5 km, 1.5 % MV voltage-drop allocation, N-1) and SEC loss capitalisation T = P + 11000·C + 4000·W (SAR) [T12-02]; equipment prices labelled [A].
11. **Case files**: sag-type detective (Bollen types through Dyn11), capacitor-bank resonance (hr ≈ √(Ssc/Qc)), broken PEN at LV, GB 9 Aug 2019 frequency replay (official ESO report numbers). Ferroresonance only on an overhead/rural spur with single-pole cutouts or labelled non-Saudi (R1-30).

## Research backlog (public sources only, D-004a)
- Riyadh/SEC MV neutral earthing practice and NER rating; SEC FPI types and settings; SEC operating/safety rules (public versions).
- Crew response times; cold-load pickup magnitude for AC-dominated load.
- IEC 60076-7:2018 changes; IEEE 1366-2022 changes.
- Arabic terminology check against the KSGAAL / Ministry of Energy dictionary.
