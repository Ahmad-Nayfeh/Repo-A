# 04 — Distribution power flow: methods, test feeders, validation data, browser feasibility

Research notes for the engine's power-flow solver. Source IDs `[PF-xx]` are listed in `research/sources/04-pf.md`.
Status tags: **verified** / **snippet-only** / **uncertain/conflicting** / **computed** (computed means this agent ran code on fetched data; the number is not a published value).
Accessed 2026-11-13. The web-search budget ran out near the end of the session, so a few items are marked as not checked further.

---

## 0. TL;DR for the engine team

1. **Start with a balanced single-phase-equivalent backward/forward sweep (BFS) on radial topology.** Validate it against the Baran & Wu 33-bus and 69-bus systems. Our independent runs reproduce the widely quoted base-case numbers to four or more significant figures: 33-bus losses 202.68 kW, Vmin 0.91309 pu at bus 18; 69-bus losses 224.99 kW, Vmin 0.90919 pu at bus 65 ([PF-C1]). Most papers quote 202.67 kW and 0.9131 pu, and 224.95 kW and 0.9092 pu ([PF-13], [PF-15]).
2. **The IEEE 13-node feeder is the right golden test for a later 3-phase unbalanced solver.** Its published results are in `feeder13.zip` ([PF-02]). OpenDSS reproduces them to within about 0.0012 pu once the regulator taps are fixed at the published values ([PF-C2]).
3. **Licensing: do not commit raw IEEE or MATPOWER data files without permission.** The IEEE site says "All rights reserved" with no open licence on the data ([PF-01]). MATPOWER explicitly excludes its case files from its BSD licence ([PF-09]). No data was saved to `research/data/` for this reason (§6).
4. **Determinism:** `+ − × ÷` and `Math.sqrt` are exactly specified IEEE-754 binary64 operations in ECMAScript. `Math.exp/sin/cos/pow/hypot/log/atan2` and `**` are "implementation-approximated" ([PF-27], [PF-28]). The solver can stay inside the deterministic subset: complex arithmetic plus `sqrt` is enough for a PQ/Z/I BFS.
5. **Performance is a non-issue at this scale.** A plain JS BFS solves 33 buses in about 0.02 ms and a 513-bus radial in about 0.04 ms on Node 22/V8 ([PF-C1], own benchmark; not a published figure).

---

## 1. IEEE PES distribution test feeders

### 1.1 Where the data lives and its format
- The Test Feeder Working Group resources page [PF-01] (**verified**) links ZIP archives under `https://cmte.ieee.org/pes-testfeeders/wp-content/uploads/sites/167/2017/08/`:
  - 1991 originals: `testfeeders.pdf` (paper), `common.zip` (line/cable data), `feeder4.zip`, `feeder44wire.zip`, `YYD_4node_testfeeder.zip`.
  - "1992" cases: `feeder13.zip`, `feeder34.zip`, `feeder37.zip`, `feeder123.zip`, plus `RDAP_INPUT_FILES.zip` and `IEEE_distributionTestFeedersPSCAD.zip`.
  - Later: `8500node.zip`, `nev_test_feeder.zip`, `Short-Circuit-Test-Case.zip`, `LVNTS.zip`, `European_LV_Test_Feeder_v2.zip`.
  - The page notes: "The zipped data files require Microsoft Word and Microsoft Excel to read them."
- `feeder13.zip` contents (**verified**, downloaded): `IEEE 13 Node Test Feeder.doc`, `Line Data.xls`, `config.xls`, `UG config.xls`, `Spot Load Data.xls`, `Distributed Load Data.xls`, `Cap Data.xls`, `Regulator Data.xls`, `Transformer data.xls`, `ie13.TCW` (TurboCAD drawing). The .doc holds the phase impedance matrices (Ω/mile) for configurations 601–607 and the published RDAP power-flow printout dated 6-24-2004 [PF-02].
- Purpose of each feeder, per Schneider et al. 2018 [PF-05] (**verified**):
  - 4-node: "tests the capability to represent all common three-phase transformer connections".
  - 13-node: "a good test of the convergence of a program for a very unbalanced system".
  - 34-node: "a very long feeder requiring the application of voltage regulators".
  - 37-node: "a three wire delta ungrounded underground system".
  - 123-node: "a medium size system with multiple voltage regulators and shunt capacitors".
- How the published solutions were checked [PF-05] (**verified**): "the solutions have been verified by at least two TFWG members, each using a separate simulation package, achieving voltage solution values within 0.01%". The packages named include OpenDSS, GridLAB-D, WindMil, CYME, RDAP and Synergi.
- **Not read:** the 34, 37 and 123-node archives. They are the same format and in the same location, but their results were not extracted in this pass.

### 1.2 IEEE 13-node: published results (golden-test candidates) [PF-02] — verified
Source: the "VOLTAGE PROFILE" table in `IEEE 13 Node Test Feeder.doc`, from RDAP, dated 6-24-2004. Values are pu magnitude and angle in degrees, line-to-neutral.

| Node | A-N | B-N | C-N |
|---|---|---|---|
| 650 | 1.0000 ∠0.00 | 1.0000 ∠-120.00 | 1.0000 ∠120.00 |
| RG60 | 1.0625 ∠0.00 | 1.0500 ∠-120.00 | 1.0687 ∠120.00 |
| 632 | 1.0210 ∠-2.49 | 1.0420 ∠-121.72 | 1.0174 ∠117.83 |
| 633 | 1.0180 ∠-2.56 | 1.0401 ∠-121.77 | 1.0148 ∠117.82 |
| 634 | 0.9940 ∠-3.23 | 1.0218 ∠-122.22 | 0.9960 ∠117.34 |
| 645 | — | 1.0329 ∠-121.90 | 1.0155 ∠117.86 |
| 646 | — | 1.0311 ∠-121.98 | 1.0134 ∠117.90 |
| **671** | **0.9900 ∠-5.30** | **1.0529 ∠-122.34** | **0.9778 ∠116.02** |
| 680 | 0.9900 ∠-5.30 | 1.0529 ∠-122.34 | 0.9778 ∠116.02 |
| 684 | 0.9881 ∠-5.32 | — | 0.9758 ∠115.92 |
| 611 | — | — | 0.9738 ∠115.78 |
| 652 | 0.9825 ∠-5.25 | — | — |
| 692 | 0.9900 ∠-5.31 | 1.0529 ∠-122.34 | 0.9777 ∠116.02 |
| 675 | 0.9835 ∠-5.56 | 1.0553 ∠-122.52 | 0.9758 ∠116.03 |

Other published quantities from the same printout:
- Regulator taps (phases 1/2/3): 10 / 8 / 11, with 122 V setpoint, 2.0 V bandwidth, R=3, X=9 volts, PT ratio 20, CT 700 A. 0.00625 pu per step is our inference, consistent with 1.0625 / 1.0500 / 1.06875.
- System input: 3577.191 kW, 1724.772 kvar.
- Total losses: 111.063 kW and 324.653 kvar. Per phase: A 39.107 kW, **B −4.697 kW**, C 76.653 kW. The negative phase-B loss comes from mutual coupling in unbalanced lines and is not an error.
- Capacitors: rated 700 kvar, actual 701.466 kvar at operating voltage.
- Load models in the data (Spot Load Data): Y-PQ, D-Z, Y-Z, D-PQ, D-I, Y-I, plus a distributed load on 632–671. The printout shows the voltage-dependent result, e.g. node 652 Y-Z rated 128 kW is drawn as 123.56 kW.

**OpenDSS cross-check [PF-C2] (computed).** We ran `IEEE13Nodeckt.dss` [PF-06] through opendssdirect.py with the taps fixed at the published values (Reg1 1.0625, Reg2 1.0500, Reg3 1.06875, ControlMode=OFF):
- Node 671: 0.9894∠-5.30 / 1.0533∠-122.37 / 0.9790∠116.07.
- Node 675: 0.9829 / 1.0556 / 0.9771.
- Node 611: 0.9750 (published 0.9738).
- Total losses: 110.498 kW and 322.159 kvar (published 111.063 kW). Input: 3577.97 kW.
- The largest difference was about 0.0013 pu at phase C (611/675). That is above the TFWG "0.01%" claim. Reason: the OpenDSS script deliberately modifies the model (sub-transformer impedance divided by 1000, source angle +30°, recomputed config 606 cable).
- With regulator control **on**, OpenDSS settles on different taps (1.05625 / 1.0375 / 1.05625), and node 671 becomes 0.9828 / 1.0403 / 0.9649. **Golden tests must fix the regulator taps.** Otherwise control-loop details dominate the comparison.

**Suggested tolerance for a 3-phase golden test:** |ΔV| ≤ 0.002 pu and |Δθ| ≤ 0.1°. This is our proposal, based on the OpenDSS-vs-RDAP spread above.

### 1.3 IEEE 4-node transformer test [PF-03] — verified, with typos
- Data: 12.47 kV source line → 6000 kVA transformer (step-down to 4.16 kV or step-up to 24.9 kV; R=1%, X=6%) → load line.
- Closed-connection loads: balanced 1800 kVA per phase at 0.9 pf lag. Unbalanced: 1275 kVA @0.85, 1800 @0.9, 2375 @0.95.
- Solution tables (Node-2/3/4 voltages in volts∠deg, line currents) cover six connections × {step-down, step-up} × {balanced, unbalanced}.
- Example, step-down balanced, Gr.Y–Gr.Y: Node-4 V1 1918∠-9.1, V2 2061∠-128.3, V3 1981∠110.9 V. Current 3-4 Ia is 1042.8∠-34.9 A.
- **Known typos in the published tables:**
  - "10083.8/-71.0" (step-down unbalanced, GrY-D, Ia 3-4); the adjacent Y-D column gives 1083.8.
  - "146.7/0-.7" and "24060\-93.6" (step-up tables).
  - "7112/-.03" vs "-0.3" (step-down balanced Y-D).
  - Golden tests need these cleaned up by hand.
- This test is only useful once the engine models 3-phase transformer connections. For a balanced positive-sequence engine, only the GrY-GrY balanced case maps directly.

---

## 2. Balanced radial test systems (single-phase equivalent)

### 2.1 Baran & Wu 33-bus ("case33bw")
- Origin: Baran & Wu, IEEE TPWRD 4(2):1401–1407, 1989 [PF-07] (**snippet-only**; we did not read the paper).
- Machine-readable data: MATPOWER `case33bw.m` [PF-08] (**verified**).
  - Base 12.66 kV, 10 MVA.
  - 32 in-service branches with R and X in Ω.
  - 5 tie branches (21–8, 9–15, 12–22 at 2+j2 Ω; 18–33, 25–29 at 0.5+j0.5 Ω) with status 0.
  - Total load 3715 kW / 2300 kvar.
  - Bus 30 carries 200 kW / 600 kvar.
- **Known discrepancy** [PF-10] (**verified**): R. Zimmerman (MATPOWER) wrote that the paper's base-case solution "do[es] not match" its data. The paper claims a total substation load of 5085.26 kW and losses of about 8%, against a total load of 3715 kW. The pre-2016 MATPOWER file had the ties closed and 5 impedances mismatched, and was corrected after that thread.
- **Commonly quoted base case:** losses 202.67 kW (some papers 202.68 kW), Vmin 0.9131 pu at bus 18. Sources [PF-15] and [PF-13] are **snippet-only**.
- **Conflict:** arXiv:2406.15937 [PF-14] gives a base-case Vmin of 0.8820 pu at bus 18. That is a different data variant: do not use it.
- **Our runs [PF-C1] (computed, three independent implementations agree):**

| Quantity | numpy BFS | pandapower NR | pandapower bfsw | JS BFS (Node 22) |
|---|---|---|---|---|
| P loss (kW) | 202.6771 | 202.6771 | 202.6771 | 202.6771 |
| Q loss (kvar) | 135.1410 | 135.1410 | — | — |
| Vmin (pu) @bus | 0.913090 @18 | 0.913090 @18 | 0.913090 | 0.913090 @18 |
| Source P/Q | — | 3917.677 kW / 2435.141 kvar | — | — |
| Iterations (tol 1e-12 / 1e-10) | 11 | — | — | 10 |

  - Other voltages from pandapower NR, flat 1.0∠0 slack: bus 2 0.99703, bus 6 0.94966, bus 22 0.99158, bus 25 0.96936, bus 33 0.91659 pu.
  - **Load-model sensitivity** (pandapower, computed): all loads constant-Z gives 156.87 kW and Vmin 0.92447. All constant-I gives 176.63 kW and Vmin 0.91939. These are useful to unit-test a ZIP implementation, but only as cross-solver checks, not as published values.
  - **Weakly meshed variant** (all 5 ties closed, computed with pandapower NR): 123.29 kW, Vmin 0.95328. This is a cross-validation target for a meshed solver; the value is not published.

### 2.2 69-bus ("case69")
- MATPOWER `case69.m` v2 [PF-11] (**verified**) credits Baran & Wu, "Optimal capacitor placement on radial distribution systems", IEEE TPWRD 4(1):725–734, 1989. The data is also in Das 2008. The 69-bus system is often called "Das 69-bus", but MATPOWER attributes the origin to Baran & Wu (Jan 1989).
- Data: base 12.66 kV (v2 changed it from 12.7 kV), 10 MVA, total load 3802.1 kW / 2694.7 kvar.
- Commonly quoted base case: 224.95 kW, 102.14 kvar, Vmin 0.9092 at bus 65 (STET 2026 table [PF-13], **snippet-only**). "≈225 kW" is quoted elsewhere (snippet).
- Our run [PF-C1] (computed, numpy BFS): **224.9917 kW, 102.1580 kvar, Vmin 0.909188 pu at bus 65**, 12 iterations.
- The 0.04 kW gap to the folklore 224.95 kW is probably the 12.66 vs 12.7 kV base change or rounded data. This is **uncertain**. Use a tolerance of 0.1 kW or rerun with baseKV 12.7 to confirm.
- pandapower has no built-in 69-bus case [PF-12].

### 2.3 Others
- Not investigated in depth because the search budget was exhausted: 85-bus (Das), 118-bus, 136-bus. **NOT FOUND / not checked.**

---

## 3. Methods

| Method | Key reference | Notes relevant to the engine |
|---|---|---|
| Ladder / backward–forward sweep (BFS) | Kersting, *Distribution System Modeling and Analysis*, 4th ed., CRC 2017, Ch. 10 "Ladder Iterative Technique" [PF-16] (snippet-only); lecture notes after Kersting [PF-17] (verified) | Backward sweep sums load currents toward the source. Forward sweep applies KVL from the specified source voltage. Repeat until the voltage change is below a tolerance (example 0.0001 pu in [PF-17]). No matrices. Radial only. Iteration count grows with nonlinear loads [PF-05]. |
| Compensation-based BFS for weakly meshed networks | Shirmohammadi et al. 1988 [PF-18]; 3-phase in Cheng & Shirmohammadi 1995 [PF-19] (snippet-only) | Break loops at breakpoints and inject compensating currents found from a small loop-impedance matrix. This is the standard way to keep a BFS when a few ties are closed. |
| Direct BIBC/BCBV ("Z-bus-like") | Teng 2003 [PF-20] (snippet-only); slides [PF-17] (verified) | Topology matrices are built once, so there is no LU or Jacobian. Loop extension exists. [PF-05]: impedance methods "become more computationally burdensome when constant power, constant current, or time-varying load models are used". |
| Newton–Raphson (power injection, polar) | Schneider et al. [PF-05] eq. (4) (verified) | Quadratic convergence. "effective for highly meshed systems". Needs a sparse Jacobian. Fast-decoupled "is not possible because of high R/X ratios" [PF-05]. |
| Current-injection NR (TCIM) | Garcia et al. 2000 [PF-21] (snippet-only); [PF-05] eq. (5) | Rectangular form, 6n order for 3-phase, Jacobian with the same sparsity as Ybus, and several Jacobian blocks constant between iterations. |

**Conflicting framing.** The ISU slides [PF-17] say GS and NR "have lost popularity due to their poor convergence in distribution system studies" (high R/X, radial structure; citing Cheng & Shirmohammadi 1995). Schneider et al. [PF-05] say NR "require[s] far fewer" iterations and that a sweep "will be as accurate as a Newton method, … but may take longer to converge". In practice, pandapower NR converged on case33bw without trouble [PF-C1]. Treat the "NR fails on distribution" claim as dated or ill-posed.

**Engine-relevant modelling items** (from [PF-05] and [PF-02], verified unless noted):
- **Switches:** in the 13-node data, switch 671–692 is a closed zero-impedance branch. OpenDSS models it as a 1e-4 Ω line [PF-06].
  - For BFS: merge closed switches into one node (a union-find over the topology) and drop open switches from the tree.
  - Closing a tie makes a loop and needs compensation or NR.
  - The MATPOWER 33-bus ties are branches with status 0 [PF-08].
- **Voltage regulators / OLTC:** typically ±16 taps (32 steps) [PF-05]. Controlled by local voltage, with line-drop compensation (R, X settings) [PF-05], [PF-02].
  - Model as an ideal ratio per phase applied in the forward sweep, with the tap updated in an outer loop (deadband = bandwidth).
  - Golden-test with fixed taps first (§1.2).
- **Capacitor banks:** constant-impedance shunts. Their kvar scales with V² (13-node: 700 kvar rated, 701.466 actual) [PF-02].
- **Load models:** constant PQ, constant Z, constant I and their ZIP combinations [PF-05]; the 13-node uses Y/D × PQ/Z/I [PF-02]. In a BFS:
  - Constant PQ: I = conj(S/V).
  - Constant Z: I = V/Z, with Z = |V_rated|²/S*.
  - Constant I: |I| is fixed and its angle follows V.
  - ZIP: a weighted sum of these.
  - Kersting Ch. 9 covers this [PF-16] (snippet-only; book not read, so exact formulas are not cited here).

---

## 4. Open-source tools for offline cross-validation (development only)

- **pandapower**: BSD-3-Clause [PF-22] (verified). Includes `pandapower.networks.case33bw()` (data from MATPOWER) [PF-12]. Supports NR, `bfsw` (BFS), `iwamoto_nr` and others.
  - Three-phase `runpp_3ph` works in the sequence frame. It is shown only for earthed transformer groups, and voltage-dependent loads are "Not tested" there [PF-24].
  - The validation claim against PowerFactory/Sincal is snippet-only [PF-23].
  - Used here: pandapower 3.5.6 in a scratch venv.
- **OpenDSS**: EPRI BSD-style licence [PF-25] (verified). Ships IEEE 13/34/37/123 models in `Distrib/IEEETestCases` [PF-06].
  - The `opendssdirect.py` / DSS C-API port is BSD-3 [PF-26]. It installs from PyPI and ran the 13-node case here.
  - The licence of the IEEE-derived `.dss` model files themselves is **uncertain**: no separate licence was seen for that folder.
- **MATPOWER**: BSD-3 code. Its case files are **not** BSD [PF-09].
- **Recommended workflow:** keep a dev-only `tools/validate/` script (Python, not shipped) that rebuilds each golden case in pandapower or OpenDSS and writes the expected numbers to JSON. Commit only the derived expected numbers plus a citation, not the source data. The legal status of even that is an open question (§7).

---

## 5. Balanced single-phase-equivalent vs three-phase unbalanced

- **What a positive-sequence model loses:**
  - Phase unbalance: on the 13-node feeder, phase voltages at 671 range from 0.9778 to 1.0529 pu [PF-02]. A balanced model cannot show this.
  - Single- and two-phase laterals (13-node 611, 652, 645/646, 684).
  - Mutual coupling between phases (the negative phase-B loss).
  - Neutral current and neutral-earth voltage (the NEV feeder exists for this [PF-05]).
  - Per-phase regulator taps (13-node: 10/8/11).
  - Delta vs wye load connections.
  - Transformer vector-group phase shifts (the 4-node feeder [PF-03]).
- **When it matters:** North-American-style feeders with single-phase laterals and unbalanced loading, which is the purpose of the 13-node feeder [PF-05]; LV networks; neutral and earth issues. A balanced model is usually acceptable for a European-style three-phase MV backbone feeding balanced transformer loads (our inference). Baran & Wu 33/69 are balanced test cases by construction.
- **Cost in the browser (our estimate, not from a source):**
  - Each branch becomes a 3×3 complex matrix-vector product, about 9× the work of the scalar case.
  - Node voltages become 3-vectors.
  - Transformer connections need per-connection matrices (Kersting's a/b/c/d/A/B generalized matrices, eq. (1)–(2) in [PF-05]).
  - At 500 buses that is still well under 1 ms per solve, given the 0.04 ms scalar benchmark. The real cost is modelling and data complexity, not CPU.
- **Recommendation:** design the data model with per-phase arrays (phases present: a mask) from day one. Ship a balanced solver first, golden-tested on 33/69-bus. Add 3-phase later, golden-tested on 4-node and 13-node.

---

## 6. Browser performance, numerics, determinism

### 6.1 Speed
- Own benchmark [PF-C1] (computed; Node v22.23.4, V8, Intel Xeon 2.1 GHz, Float64Array, plain loops):
  - case33bw solves in **0.0225 ms** mean per solve (10 iterations).
  - A synthetic 513-bus radial (16 copies of the 33-bus laterals) solves in **0.044 ms**.
  - Not from a publication. It needs repeating in browsers, but it shows that 100–500-bus radial sweeps fit comfortably in a 16 ms frame many times over.
- NR at 500 buses would need a sparse LU each iteration. Still expected to be milliseconds in JS (not measured).
- No published JS/WebAssembly distribution power-flow benchmark was found. **NOT FOUND** (search budget exhausted).

### 6.2 Libraries (licences verified from npm metadata [PF-31])
- **mathjs 15.2.0, Apache-2.0.** Has complex numbers and `math.slu`, a sparse LU "with full pivoting", with `order` and `threshold` parameters [PF-32]. Complex-entry support in `slu` is not stated (**uncertain**). Workaround: solve the 2n×2n real system.
- **ml-matrix 6.15.1, MIT.** Dense real matrices.
- **complex.js 2.4.3, MIT.** A complex-number type. It allocates objects per operation, so prefer hand-inlined re/im on Float64Array in hot loops.
- **ndarray 1.1.1, MIT.**
- **numeric 1.2.6:** no licence field in npm metadata. Avoid.
- **Recommendation:** for BFS, no library is needed. For NR on weakly meshed networks, either a small hand-written sparse LU (the network is tiny) or mathjs `slu` on the real-expanded system.

### 6.3 Floating-point determinism (ECMAScript spec, verified)
- Number::add / ::multiply / ::divide (§6.1.6.1.7 / .4 / .5) perform the operation "according to the rules of IEEE 754-2019 binary double-precision arithmetic". The conversion to Number "corresponds exactly to the behaviour of the IEEE 754-2019 roundTiesToEven mode" [PF-27]. Each operation is therefore correctly rounded and identical across conforming engines.
- Both specs note "Finite-precision addition is commutative, but not always associative" [PF-27]. **Fix the summation order**: iterate branches in a deterministic topological order and never use `Object.keys` order on numeric-like keys or `Set` iteration from unordered sources.
- `Math.sqrt` (§21.3.2.33) returns 𝔽(√n), which is exact and deterministic [PF-28].
- §21.3.2: acos, acosh, asin, asinh, atan, atanh, atan2, cbrt, cos, cosh, exp, expm1, **hypot**, log, log1p, log2, log10, **pow**, random, sin, sinh, tan, tanh are "not precisely specified" (implementation-approximated). fdlibm is only "recommended (but not specified)" [PF-28]. `**` / Number::exponentiate is also "implementation-approximated" [PF-27].
- **Engine rules that follow:**
  - Compute |V| as `Math.sqrt(re*re+im*im)`, not `Math.hypot`.
  - Avoid `atan2`, `sin` and `cos` in the solver core; convert angles only for display.
  - Avoid `**` and `Math.pow` (use `x*x`).
  - If trig is needed in simulation state (e.g., initial phase angles of ±120°), use exact constants: cos120° = −0.5, sin120° = √3/2 via `Math.sqrt(3)/2`.
  - Never use `Math.random`; its algorithm is "implementation-defined" [PF-28].

### 6.4 Seeded PRNGs
- **sfc32**: 128-bit state; "passes PractRand, as well as Crush/BigCrush" [PF-29]. This is our recommended default.
- **mulberry32**: 32-bit state, about 2^32 period, "passes gjrand", may skip about 1/3 of 32-bit outputs. The bryc page itself recommends SplitMix32 for serious use [PF-29].
- **xoshiro128\*\***: "poor randomness in the lower bits" per bryc [PF-29]. Vigna presents it as the 32-bit all-purpose generator and recommends seeding via SplitMix [PF-30].
- All of these use only `Math.imul`, `>>>`, `^` and `|0` integer operations, which are exactly specified. bryc's code is "Public domain" [PF-29]. The licence of Vigna's reference C code was not stated on the page fetched.

---

## 7. Cable and transformer parameters

### 7.1 MV XLPE cables (manufacturer datasheets; all verified by PDF text extraction)
A 13.8 kV system would normally use the 8.7/15 kV cable class. That is our inference (U = 15 kV ≥ 13.8 kV) and needs confirming with IEC 60502-2 / ICEA. The datasheets below give X at **50 Hz**; at 60 Hz, X scales by 1.2 (derived).

| Cable | Source | R (Ω/km) | X1 (Ω/km, 50 Hz) | C (µF/km) | Ampacity (A) | Zero-seq |
|---|---|---|---|---|---|---|
| 1×240 Al, 8.7/15 kV (×3 trefoil) | Top Cable X-VOLT RHZ1 [PF-33] | 0.125 (20 °C max) | 0.099 | 0.385 | 502 air / 367 buried¹ | not given |
| 1×185 Al, 8.7/15 kV | [PF-33] | 0.164 | 0.107 | 0.323 | 424 / 317¹ | not given |
| 1×240/50 Al, 8.7/15 kV | Eland XHAKXS [PF-34] | 0.125 DC 20 °C; 0.161 AC 90 °C | 0.105 trefoil; 0.186 flat in ground | 0.32 | trefoil: 530 (SPB/CB) / 522 (both-ends) in earth; 526/518 in air² | not given |
| 1×185/50 Al, 8.7/15 kV | [PF-34] | 0.164; 0.211 AC | 0.109 trefoil | 0.29 | trefoil earth 455/450; air 445/440² | not given |
| 1×70/25 Al, 8.7/15 kV | [PF-34] | 0.443; 0.568 AC | 0.128 trefoil | 0.20 | trefoil earth 259/258; air 242/242² | not given |
| **3×240/50 Al three-core, 12/20 kV** | NKT AXAL-TT PRO 3.0 [PF-35] | 0.125 | 0.30 mH/km → 0.094 (derived) | 0.27 | 340 soil / 330 air (65 °C); 400/400 (90 °C) | **R0 1.93, X0 0.08 Ω/km** |
| 3×150/35 Al, 12/20 kV | [PF-35] | 0.206 | 0.33 mH/km → 0.104 (derived) | 0.23 | 260/250 (65 °C); 310/305 (90 °C) | R0 2.61, X0 0.09 |
| 3×95/35 Al, 12/20 kV | [PF-35] | 0.320 | 0.35 mH/km → 0.110 (derived) | 0.19 | 205/190; 240/230 | R0 2.72, X0 0.09 |

¹ Top Cable conditions: three single-core cables in open air at 30 °C, or direct-buried at 0.8 m, 1.5 K·m/W, 20 °C ground, per IEC 60502-2.
² Eland conditions: depth 0.7 m, ground 20 °C, ambient 30 °C. The soil resistivity is printed as "1/2.5 k m/W", which is **ambiguous**.

- **Conflict:** buried ampacity for 240 mm² Al ranges from 367 A (Top Cable, 1.5 K·m/W, 0.8 m) to 530 A (Eland). The installation conditions differ, so the game should derate per installation. **uncertain/conflicting.**
- **Copper (3×240 Cu, 3×185 Cu) and 3×70 three-core: NOT FOUND** in this pass.
- **13.8 kV-specific (ICEA/US 15 kV, 60 Hz) datasheets: NOT FOUND.**
- Zero-sequence data was found only for the NKT three-core cable. It depends heavily on the screen and earthing arrangement.

### 7.2 Distribution transformer impedance — IEC 60076-5 Table 1 (verified, [PF-36], [PF-37])
"Recognized minimum values of short-circuit impedance for transformers with two separate windings" (at rated current, principal tapping; §3.2.2.3):

| Rated power (kVA) | Min. short-circuit impedance (%) |
|---|---|
| 25 to 630 (2000 ed.: "Up to 630") | 4.0 |
| 631 to 1 250 | 5.0 |
| 1 251 to 2 500 | 6.0 |
| 2 501 to 6 300 | 7.0 |
| 6 301 to 25 000 | 8.0 |
| 25 001 to 40 000 | 10.0 |
| 40 001 to 63 000 | 11.0 |
| 63 001 to 100 000 | 12.5 |
| above 100 000 | >12.5 |

- So a 500 kVA unit has at least 4%, and 800–1250 kVA units at least 5%. Note 2: for single-phase units forming a three-phase bank, the rating applies to the bank.
- These are **minimums**. Typical catalogue values (e.g., 4% vs 6% options) and X/R ratios were **NOT FOUND** in this pass.
- For comparison: the IEEE 4-node feeder uses 6000 kVA at R=1%, X=6% [PF-03]. The IEEE 13-node XFM-1 is 500 kVA at R=1.1%, X=2% [PF-02].

---

## Golden test candidates

| ID | Case | Data location (do not vendor without permission) | Expected results | Tolerance proposal | Status |
|---|---|---|---|---|---|
| G1 | 33-bus Baran & Wu, radial (ties open), constant PQ, V_slack=1.0∠0 | MATPOWER `data/case33bw.m` [PF-08]; `pandapower.networks.case33bw()` | P_loss 202.68 kW (folklore 202.67), Q_loss 135.14 kvar, Vmin 0.91309 @ bus 18, V33 0.91659 | ±0.05 kW, ±1e-4 pu | Folklore values snippet-only [PF-13], [PF-15]; reproduced by 3 implementations [PF-C1] |
| G2 | 69-bus, radial, constant PQ, 12.66 kV | MATPOWER `data/case69.m` [PF-11] | P_loss ≈224.99 kW (folklore 224.95), Q_loss ≈102.16 (folklore 102.14), Vmin 0.9092 @ bus 65 | ±0.1 kW, ±2e-4 pu | Folklore snippet-only [PF-13]; computed [PF-C1]; the 0.04 kW gap is uncertain |
| G3 | 33-bus with all 5 ties closed (weakly meshed) | as G1 | 123.29 kW, Vmin 0.95328 | ±0.05 kW | Cross-solver only (pandapower NR) [PF-C1]; not published |
| G4 | 33-bus ZIP variants (100% Z; 100% I) | as G1 | Z: 156.87 kW, Vmin 0.92447. I: 176.63 kW, Vmin 0.91939 | ±0.05 kW | Cross-solver only [PF-C1] |
| G5 | IEEE 13-node, taps fixed at 10/8/11 | IEEE `feeder13.zip` [PF-02]; OpenDSS `IEEE13Nodeckt.dss` [PF-06] | Node voltages in table §1.2. Bus 671: 0.9900∠-5.30, 1.0529∠-122.34, 0.9778∠116.02. Losses 111.063 kW | ±0.002 pu, ±0.1° (OpenDSS vs RDAP differ by up to 0.0013 pu) | Published, verified |
| G6 | IEEE 4-node, 12 connection/loading variants | IEEE `feeder4.zip` [PF-03] | Tables in §1.3 (V in volts) | ±0.5% (the tables are rounded to 4 sig. figs) | Published, verified, contains typos |
| G7 | Trivial analytic 2-bus case (engine-authored) | none needed | Closed-form: V2 from the quadratic of the 2-bus PQ problem | 1e-12 | Our recommendation: tests the BFS kernel without licensing issues |

---

## Licensing of test data

- **IEEE PES test feeders** [PF-01]: the site carries "© Copyright 2026 IEEE – All rights reserved" and points to the IEEE Terms and Conditions. The IEEE terms page could not be retrieved (empty response), so its clauses are **unverified**.
  - The feeder files carry no open licence.
  - The Schneider et al. manuscript footer reads "Personal use is permitted, but republication/redistribution requires IEEE permission" [PF-05]. That footer applies to the paper, not the data.
  - **Conclusion:** redistributing the raw ZIPs or `.doc`/`.xls` in an open-source repo is **not clearly permitted**. Treat it as not allowed without IEEE permission.
- **MATPOWER case files** [PF-09]: explicitly "not covered by the BSD license". Do not vendor `case33bw.m` / `case69.m` as-is.
- **pandapower** (BSD-3) bundles `case33bw.json` derived from MATPOWER [PF-12]. The bundled data inherits the uncertainty: the BSD licence covers pandapower's code, and the pandapower docs state no licence for the cases.
- **OpenDSS IEEE models** [PF-06]: the OpenDSS code is BSD-style [PF-25], but the IEEE-derived model files' status is **uncertain**.
- **Practical options:**
  - (a) Golden tests store only short expected-result numbers with citations. Input data is fetched at dev time from the canonical URL by a script and never committed.
  - (b) Ask IEEE PES TFWG and MATPOWER for permission.
  - (c) Author original test networks (e.g., G7 and engine-specific feeders) and cross-validate them with pandapower or OpenDSS at dev time. Those are fully ours to license.
  - Whether published numeric tables (facts) are copyrightable is a legal question we cannot settle here.
- **No dataset was saved to `research/data/`**, because no candidate had a licence that clearly permits redistribution.

---

## Implications for the engine

1. **Solver v1:** balanced, positive-sequence, radial BFS on Float64Array, with a deterministic topological order built once per topology change. Convergence: max |ΔV| < 1e-10 pu with an iteration cap of about 50, and divergence reported to the game as "voltage collapse / unsolvable".
2. **Topology:** switches collapse to node merges when closed and are removed when open. If a closed tie creates a loop: either refuse it (radial-only gameplay rule) or add Shirmohammadi compensation [PF-18] or a small NR. G3 is the test.
3. **Devices:**
   - Capacitors as constant-Z shunts.
   - Regulators/OLTC as per-phase ideal ratios with an outer discrete-tap loop: bandwidth deadband, 32 steps of 0.625% (inferred from 13-node data), optional LDC. Add hysteresis or step limits to avoid hunting, and keep it deterministic.
   - Loads as ZIP.
4. **Numerics:** only `+ − × ÷` and `Math.sqrt` in the core. No `hypot`, `pow`, `**`, `exp` or trig in state-affecting code. Fixed summation order. PRNG: sfc32 seeded via SplitMix32.
5. **Validation pipeline:** a dev-only Python harness (pandapower/OpenDSS, BSD) generates expected JSON. CI runs the JS solver against the stored expectations. Raw third-party data is not committed.
6. **3-phase later:** the data model carries per-phase arrays and phase masks now, so the 13-node (G5) and 4-node (G6) cases can be added without a rewrite.
7. **Units:** the datasheets in §7 are 50 Hz (European). If the game uses 13.8 kV at 60 Hz, scale X by 60/50 and take the cable class from 8.7/15 kV catalogues, or find ICEA 15 kV data (open question).

---

## Open questions

1. Can we redistribute the IEEE 13/34/37/123-node data, or only results? We need the IEEE Terms text (fetch failed) or written permission from the TFWG.
2. Is the 69-bus loss gap (224.99 computed vs 224.95 folklore) due to the 12.66 vs 12.7 kV base? Rerun with baseKV 12.7 to check.
3. What exactly did Baran & Wu 1989 print as the 33-bus base case? The paper was not read. Per [PF-10], its printed solution is internally inconsistent.
4. Extract the 34, 37 and 123-node published results (same ZIP format) for a fuller 3-phase suite.
5. We still need copper cable data (3×240, 3×185 Cu), three-core 3×70, and 60 Hz / ICEA 15 kV cable data with zero-sequence impedance.
6. Typical (not minimum) %Z and X/R for 500–1500 kVA 11–33 kV distribution transformers: catalogue values are needed.
7. Does mathjs `slu` accept complex sparse matrices? Test this before relying on it.
8. Browser benchmark: repeat the Node microbenchmark in Chrome, Firefox and Safari, and in WASM if NR is needed.
9. Search budget ran out before checking: the Das 85-bus system, published JS/WASM power-flow benchmarks, and IEEE site terms.
