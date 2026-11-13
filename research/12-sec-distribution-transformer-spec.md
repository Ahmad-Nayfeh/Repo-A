# 12 — SEC distribution transformer specifications (lead research, after Phase 1 review R1-10/R1-22)

_Fetched by the lead from se.com.sa (public PDFs), text extracted with pdftotext, 2026-11-13. All items **verified** (read in the primary document)._

## Sources
- [T12-01] SEC 51-SDMS-04 Rev.02, "Specification for distribution transformers with aluminum windings rated 11 kV up to 36 kV including dual primary with dual secondary", issue 16/7/2019, 29 pp. https://www.se.com.sa/-/media/4B142820A248473F8E6491FE07AFC24F.ashx
- [T12-02] SEC 51-SDMS-02, "Specifications for distribution transformers up to 36 kV 400/230 volts", 25-09-2010. https://www.se.com.sa/-/media/9C3D34FDCAED45C08A9F2A1D393EF251.ashx
- [T12-03] SEC 51-SDMS-01 Rev.02, "Specifications for distribution transformers up to 36 kV", 6-04-2004. https://www.se.com.sa/-/media/4B06F151AA5647AF88B86B240C34F405.ashx
- [T12-04] SEC 52-SDMS-01 Rev.0, "Specification for enclosed dry-type distribution transformers", 27-12-2022 (indoor ambient 50 °C stated). https://www.se.com.sa/-/media/178A2F7F3F3D4F188435356EF947AB24.ashx
- [T12-05] SEC 53-SDMS-01, "Specifications for power transformers for primary distribution system", 26-02-2013 (design ambient left to data schedule). https://www.se.com.sa/-/media/09A8A5CFC52C4E768B09AECF28D6BFCD.ashx

## Findings

| ID | Item | Value | Source |
|---|---|---|---|
| T12-a | Standard ratings | pole 100/200/300 kVA; pad-mounted 300/500/1000/1500 kVA | T12-01 Table 2 |
| T12-b | Rating assumptions | constant flux; continuous steady load; **design temperature 35 °C (yearly average)**; average winding rise 50 K, top-oil rise 45 K; **max hot-spot 98 °C** | T12-01 §5.2.1 (2004 and 2010 editions say design temperature 30 °C [T12-02 §4.2, T12-03 §4.2]) |
| T12-c | Max losses (W): 300 kVA 520/3200; 500 kVA 750/4700; 1000 kVA 1100/9000; 1500 kVA 1700/14000 (no-load/load, referred to 400 V) | ⇒ loss ratio R = Pk/P0 ≈ 6.2 (300), 6.3 (500), 8.2 (1000), 8.2 (1500) [D] | T12-01 Table 3 |
| T12-d | **Emergency loading**: after thermal equilibrium at 75 % load, sustain 133 % for ≥ 240 min (30 °C ambient) / ≥ 155 min (40 °C), and 150 % for ≥ 98 / 65 min, without hot-spot exceeding 140 °C; supplier demonstrates by test and calculation | T12-01 §5.2.3 Table 4; same table in T12-03 §4.4 |
| T12-e | Cooling ONAN; Class 1 uninhibited mineral oil (IEC 60296); esters allowed | T12-01 §5.2.4–5.2.5 |
| T12-f | Off-load tap changer, 5 positions (+5, +2.5, 0, −2.5, −5 % — first three read) | T12-01 §5.2.6 |
| T12-g | **Vector group Dyn11** | T12-01 §5.2.7 |
| T12-h | **Impedance voltage 4 % (≤ 300 kVA), 5 % (500 kVA), 6 % (> 500 kVA)** | T12-01 §5.2.8 |
| T12-i | Temperature-rise limits at rated power: top-oil 45 K, winding 50 K, hot-spot 98 °C; average temperature due to short circuit 200 °C | T12-01 §5.2.9 Table 6 |
| T12-j | Short-circuit withstand 2 s: 25× (≤ 300 kVA), 20× (500 kVA), 17× (1000/1500 kVA) full-load current | T12-01 §5.2.11 Table 7 |
| T12-k | Guarantee: "designed to operate normally at an ambient temperature of 55 °C in Saudi Arabia environmental conditions" | T12-01 §9 |
| T12-l | **Loss capitalisation**: T = P + 11000·C + 4000·W (SAR; C = no-load kW, W = load-loss kW at rated load) | T12-02 §4.3.1 (2010) |

## Derived for the engine [D]
- Hot-spot-to-top-oil gradient at rated load: 98 − 35 − 45 = **18 K** (if rises are referred to the 35 °C design temperature) — consistent with the IEC Δθhr = 23 K of the normal-ambient ONAN default being reduced. Label [D].
- Use Δθor = 45 K, Δθhr = 18 K, R from T12-c by size, design ambient 35 °C (yearly average), keep IEC 60076-7:2005 exponents/time constants (x 0.8, y 1.6, τo 180, τw 4, k11 1, k21 1, k22 2) [TH-02] — combination labelled [D]/[A].
- **Golden sanity test** (T12-d): starting at equilibrium at 75 % load, θa = 30 °C, a step to 133 % must keep θh ≤ 140 °C for ≥ 240 min; at 40 °C for ≥ 155 min; 150 %: ≥ 98 / 65 min. The spec is a *minimum* requirement, so the test checks that our default transformer **meets** the spec (θh(t) ≤ 140 °C at those durations), and records the margin. It is not a two-sided reference.
- Customer-facing implication: SEC units are rated with lower rises than IEC normal (45/50 K vs 60/65 K) precisely because of the hot climate; ageing at Riyadh summer ambient must use these, not IEC Table E.1 defaults.
