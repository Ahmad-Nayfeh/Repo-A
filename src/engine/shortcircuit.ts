import { ComplexLU } from './math/linalg';
import { exp } from './math/dmath';
import type { C } from './math/complex';
import { add, sub, mul, div, scale, c as cx, abs, A120, A240 } from './math/complex';
import type { Network } from './model';
import { indexById } from './model';
import { buildTopology } from './topology';

/**
 * Short-circuit calculation (FIDELITY F2).
 * IEC 60909-0 style equivalent voltage source c·Un/√3 at the fault location; loads, line charging in
 * the positive/negative sequence, and motors neglected; far-from-generator (I''k = Ib = Ik).
 * Sequence networks: Z2 = Z1; zero sequence includes source earthing (3·Zn), cable Z0 and cable
 * phase-to-earth capacitance C0 (π-model, half at each end). Dyn11 distribution transformers block
 * zero sequence from the MV side and carry no source, so they are omitted for MV faults.
 * Formulas: research/02 F-01..F-04 (symmetrical components; Glover/Sarma/Overbye ch. 9; Schneider CT18).
 */

export type FaultType = '3PH' | 'SLG' | 'LL' | 'DLG';
export type FaultLocation = { bus: string } | { cable: string; frac: number };

export interface SeqCurrents { i0: C; i1: C; i2: C }

/** Fault sequence currents at the fault point from Thevenin sequence impedances (phase a reference; LL/DLG on b–c). */
export function faultSequenceCurrents(type: FaultType, e: C, z1: C, z2: C, z0: C, zf: C): SeqCurrents {
  const zero = cx(0);
  switch (type) {
    case '3PH': {
      const i1 = div(e, add(z1, zf));
      return { i0: zero, i1, i2: zero };
    }
    case 'SLG': {
      const i = div(e, add(add(add(z1, z2), z0), scale(zf, 3)));
      return { i0: i, i1: i, i2: i };
    }
    case 'LL': {
      const i1 = div(e, add(add(z1, z2), zf));
      return { i0: zero, i1, i2: scale(i1, -1) };
    }
    case 'DLG': {
      const z0f = add(z0, scale(zf, 3));
      const par = div(mul(z2, z0f), add(z2, z0f));
      const i1 = div(e, add(z1, par));
      const i2 = scale(div(mul(i1, z0f), add(z2, z0f)), -1);
      const i0 = scale(div(mul(i1, z2), add(z2, z0f)), -1);
      return { i0, i1, i2 };
    }
  }
}

/** Phase quantities from sequence quantities (a-phase reference). */
export function seqToPhase(s: SeqCurrents): { a: C; b: C; c: C } {
  return {
    a: add(add(s.i0, s.i1), s.i2),
    b: add(add(s.i0, mul(A240, s.i1)), mul(A120, s.i2)),
    c: add(add(s.i0, mul(A120, s.i1)), mul(A240, s.i2)),
  };
}

export interface BranchFault {
  /** sequence currents flowing from → to (A) */
  seq: SeqCurrents;
  ia: number; ib: number; ic: number;
  /** residual current magnitude |3I0| (A) */
  i3i0: number;
  /** max phase current magnitude (A) */
  iMax: number;
}

export interface ShortCircuitResult {
  type: FaultType;
  ikA: number;                 // fault current magnitude at the fault: max phase current (3PH/LL/DLG) or |Ia| (SLG)
  earthCurrentA: number;       // |3I0| at the fault
  ipA: number;                 // peak short-circuit current κ·√2·I''k (3PH basis)
  kappa: number;
  z1: C; z2: C; z0: C;         // Thevenin impedances at the fault (Ω)
  cables: Map<string, BranchFault>;
  /** per source: phase-current max and 3I0 (A) */
  sources: Map<string, { iMax: number; i3i0: number }>;
  /** healthy-phase voltages at the fault (V, phase-to-earth) for SLG insight */
  vPhase: { a: number; b: number; c: number };
  /** the bus id used for the fault point (a synthetic id when on a cable) */
  faultBus: string;
  /** whether the fault point is energised at all */
  energised: boolean;
}

export interface ScOptions { cFactor?: number; maxCase?: boolean; zfOhm?: number }

const FAULT_NODE = '__FAULT__';

/** Insert a fault node on a cable at fraction `frac` from its `from` end (returns a modified copy). */
export function withFaultNode(net: Network, loc: FaultLocation): { net: Network; bus: string } {
  if ('bus' in loc) return { net, bus: loc.bus };
  const cab = net.cables.find((x) => x.id === loc.cable);
  if (!cab) throw new Error(`no cable ${loc.cable}`);
  const f = Math.min(Math.max(loc.frac, 0.001), 0.999);
  const kv = net.buses.find((b) => b.id === cab.from)!.vnKV;
  return {
    bus: FAULT_NODE,
    net: {
      ...net,
      buses: [...net.buses, { id: FAULT_NODE, kind: 'node', vnKV: kv }],
      cables: [
        ...net.cables.filter((x) => x.id !== cab.id),
        { ...cab, id: `${cab.id}`, to: FAULT_NODE, lengthKm: cab.lengthKm * f },
        { ...cab, id: `${cab.id}#2`, from: FAULT_NODE, lengthKm: cab.lengthKm * (1 - f) },
      ],
    },
  };
}

export function shortCircuit(netIn: Network, loc: FaultLocation, type: FaultType, opts: ScOptions = {}): ShortCircuitResult {
  const maxCase = opts.maxCase ?? true;
  const cF = opts.cFactor ?? (maxCase ? 1.1 : 1.0);
  const zf = cx(opts.zfOhm ?? 0);
  const { net, bus: fbus } = withFaultNode(netIn, loc);
  const topo = buildTopology(net);
  const busById = indexById(net.buses);
  const types = indexById(net.cableTypes);
  const omega = 2 * Math.PI * net.fMainsHz;

  const fnode = topo.nodeOf.get(fbus)!;
  const island = topo.islands[topo.islandOf.get(fnode)!]!;
  const empty: ShortCircuitResult = {
    type, ikA: 0, earthCurrentA: 0, ipA: 0, kappa: 0, z1: cx(0), z2: cx(0), z0: cx(0),
    cables: new Map(), sources: new Map(), vPhase: { a: 0, b: 0, c: 0 }, faultBus: fbus, energised: false,
  };
  if (!island.energised) return empty;

  const nodes = island.nodes.filter((n) => busById.get(n)!.kind !== 'lv');
  const idx = new Map<string, number>();
  nodes.forEach((n, i) => idx.set(n, i));
  const n = nodes.length;
  const unKV = busById.get(fbus)!.vnKV;
  const eV = (cF * unKV * 1000) / Math.sqrt(3);

  // Build Y1 (=Y2) and Y0 (siemens)
  const y1r = new Float64Array(n * n), y1i = new Float64Array(n * n);
  const y0r = new Float64Array(n * n), y0i = new Float64Array(n * n);
  const addBranch = (yr: Float64Array, yi: Float64Array, a: number, b: number, g: number, bsus: number) => {
    yr[a * n + a] = yr[a * n + a]! + g; yi[a * n + a] = yi[a * n + a]! + bsus;
    yr[b * n + b] = yr[b * n + b]! + g; yi[b * n + b] = yi[b * n + b]! + bsus;
    yr[a * n + b] = yr[a * n + b]! - g; yi[a * n + b] = yi[a * n + b]! - bsus;
    yr[b * n + a] = yr[b * n + a]! - g; yi[b * n + a] = yi[b * n + a]! - bsus;
  };
  const addShunt = (yr: Float64Array, yi: Float64Array, a: number, g: number, bsus: number) => {
    yr[a * n + a] = yr[a * n + a]! + g; yi[a * n + a] = yi[a * n + a]! + bsus;
  };
  interface CabInfo { id: string; a: number; b: number; y1: C; y0: C; kV: number }
  const cabInfos: CabInfo[] = [];
  for (const cab of net.cables) {
    const na = topo.nodeOf.get(cab.from)!, nb = topo.nodeOf.get(cab.to)!;
    const ia = idx.get(na), ib = idx.get(nb);
    if (ia === undefined || ib === undefined || ia === ib) continue;
    const t = types.get(cab.type)!;
    const r1 = (maxCase ? t.r20 : t.rOp) * cab.lengthKm, x1 = t.x * cab.lengthKm;
    const r0 = t.r0 * cab.lengthKm, x0 = t.x0 * cab.lengthKm;
    const y1 = div(cx(1), cx(r1, x1));
    addBranch(y1r, y1i, ia, ib, y1.re, y1.im);
    let y0 = cx(0);
    if (r0 > 0 || x0 > 0) { y0 = div(cx(1), cx(r0, x0)); addBranch(y0r, y0i, ia, ib, y0.re, y0.im); }
    const bc = omega * t.c0nF * 1e-9 * cab.lengthKm; // total phase-earth susceptance
    if (bc > 0) { addShunt(y0r, y0i, ia, 0, bc / 2); addShunt(y0r, y0i, ib, 0, bc / 2); }
    cabInfos.push({ id: cab.id, a: ia, b: ib, y1, y0, kV: busById.get(cab.from)!.vnKV });
  }
  interface SrcInfo { id: string; k: number; y1: C; y0: C }
  const srcInfos: SrcInfo[] = [];
  for (const s of net.sources) {
    const k = idx.get(topo.nodeOf.get(s.bus)!);
    if (k === undefined) continue;
    const kv = busById.get(s.bus)!.vnKV;
    // IEC 60909: Z_Q = c·U_nQ² / S''_kQ ; X = Z/√(1+(R/X)²), R = (R/X)·X
    const zq = (cF * kv * kv) / s.skMVA;
    const xq = zq / Math.sqrt(1 + s.rx * s.rx);
    const zq1 = cx(s.rx * xq, xq);
    const y1 = div(cx(1), zq1);
    addShunt(y1r, y1i, k, y1.re, y1.im);
    let y0 = cx(0);
    if (s.earthing.kind !== 'isolated') {
      let z0 = scale(zq1, s.z0OverZ1);
      if (s.earthing.kind === 'resistance') z0 = add(z0, cx(3 * s.earthing.rOhm));
      y0 = div(cx(1), z0);
      addShunt(y0r, y0i, k, y0.re, y0.im);
    }
    if (s.restC0nF) addShunt(y0r, y0i, k, 0, omega * s.restC0nF * 1e-9); // rest-of-busbar feeders (D3-17)
    srcInfos.push({ id: s.id, k, y1, y0 });
  }

  const lu1 = new ComplexLU(n, y1r, y1i);
  const lu0 = new ComplexLU(n, y0r, y0i);
  const kf = idx.get(fnode)!;
  const unit = (k: number) => { const r = new Float64Array(n), i = new Float64Array(n); r[k] = 1; return { r, i }; };
  const u = unit(kf);
  const col1 = lu1.solve(u.r, u.i);
  const col0 = lu0.singular ? null : lu0.solve(u.r, u.i);
  const z1 = cx(col1.re[kf]!, col1.im[kf]!);
  const z2 = z1;
  const z0 = col0 ? cx(col0.re[kf]!, col0.im[kf]!) : cx(1e12, 0); // isolated & no capacitance: open
  const e = cx(eV);
  const seq = faultSequenceCurrents(type, e, z1, z2, z0, zf);
  const ph = seqToPhase(seq);

  // node sequence voltages: V1 = E − Z1_jk·I1 ; V2 = −Z2_jk·I2 ; V0 = −Z0_jk·I0
  const v1 = (j: number) => sub(e, mul(cx(col1.re[j]!, col1.im[j]!), seq.i1));
  const v2 = (j: number) => scale(mul(cx(col1.re[j]!, col1.im[j]!), seq.i2), -1);
  const v0 = (j: number) => (col0 ? scale(mul(cx(col0.re[j]!, col0.im[j]!), seq.i0), -1) : cx(0));

  const mk = (s: SeqCurrents): BranchFault => {
    const p = seqToPhase(s);
    const ia = abs(p.a), ib = abs(p.b), ic = abs(p.c);
    return { seq: s, ia, ib, ic, i3i0: 3 * abs(s.i0), iMax: Math.max(ia, ib, ic) };
  };
  const cables = new Map<string, BranchFault>();
  for (const ci of cabInfos) {
    const s: SeqCurrents = {
      i1: mul(ci.y1, sub(v1(ci.a), v1(ci.b))),
      i2: mul(ci.y1, sub(v2(ci.a), v2(ci.b))),
      i0: mul(ci.y0, sub(v0(ci.a), v0(ci.b))),
    };
    const id = ci.id.endsWith('#2') ? ci.id : ci.id;
    cables.set(id, mk(s));
  }
  const sources = new Map<string, { iMax: number; i3i0: number }>();
  for (const si of srcInfos) {
    // current injected by source into node k: y_src·(E_src − V) with E_src = E (equivalent source) for seq 1
    const s: SeqCurrents = {
      i1: mul(si.y1, sub(e, v1(si.k))),
      i2: scale(mul(si.y1, v2(si.k)), -1),
      i0: scale(mul(si.y0, v0(si.k)), -1),
    };
    const bf = mk(s);
    sources.set(si.id, { iMax: bf.iMax, i3i0: bf.i3i0 });
  }

  const ikA = type === 'SLG' ? abs(ph.a) : Math.max(abs(ph.a), abs(ph.b), abs(ph.c));
  // κ from R/X of the positive-sequence Thevenin impedance (IEC 60909 method for radial networks)
  const rx = z1.im !== 0 ? z1.re / z1.im : 0;
  const kappa = 1.02 + 0.98 * exp(-3 * rx);
  const ik3 = abs(div(e, z1));
  // phase-to-earth voltages at the fault point
  const vs = { i0: v0(kf), i1: v1(kf), i2: v2(kf) };
  const vp = seqToPhase(vs);
  return {
    type, ikA, earthCurrentA: 3 * abs(seq.i0), ipA: kappa * Math.SQRT2 * ik3, kappa, z1, z2, z0,
    cables, sources, vPhase: { a: abs(vp.a), b: abs(vp.b), c: abs(vp.c) }, faultBus: fbus, energised: true,
  };
}
