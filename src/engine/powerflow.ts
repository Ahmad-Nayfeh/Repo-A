import { ComplexLU } from './math/linalg';
import type { Network } from './model';
import { indexById } from './model';
import type { Topology } from './topology';

/**
 * Balanced positive-sequence power flow (FIDELITY F1).
 * Method: current-injection fixed point on the bus admittance matrix of each energised island,
 *   Y_NN · V_N = I_load(V_N) − Y_NS · V_S,  I_load = −conj(S_load / V)
 * with source (slack) nodes held at their set-point. Per-unit on S_BASE and each bus's nominal kV.
 * Works for radial and meshed islands; LU factorised once per island per call.
 */
export const S_BASE_MVA = 10;

export interface LoadInjection { /** MW, Mvar at this instant, keyed by load id */ p: number; q: number }

export interface PowerFlowResult {
  converged: boolean;
  iterations: number;
  /** per bus: voltage magnitude (pu) and angle (rad, ×1 — computed with exact ops as atan-free components) */
  vRe: Map<string, number>;
  vIm: Map<string, number>;
  vPu: Map<string, number>;
  /** per cable: current magnitude (A) and loading (fraction of ampacity) */
  cableA: Map<string, number>;
  cableLoading: Map<string, number>;
  /** per cable: complex current from→to in pu */
  cableIRe: Map<string, number>;
  cableIIm: Map<string, number>;
  /** per transformer: loading (fraction of rated MVA, by current) */
  trafoLoading: Map<string, number>;
  lossesKW: number;
  /** total source active power (MW) */
  sourceMW: number;
  /** loads energised */
  loadOn: Map<string, boolean>;
}

const zBase = (kV: number) => (kV * kV) / S_BASE_MVA; // Ω
const iBaseA = (kV: number) => (S_BASE_MVA * 1e6) / (Math.sqrt(3) * kV * 1e3);

export function solvePowerFlow(
  net: Network,
  topo: Topology,
  loads: Map<string, LoadInjection>,
  opts: { maxIter?: number; tol?: number } = {},
): PowerFlowResult {
  const maxIter = opts.maxIter ?? 60;
  const tol = opts.tol ?? 1e-10;
  const busById = indexById(net.buses);
  const cableTypes = indexById(net.cableTypes);
  const tTypes = indexById(net.transformerTypes);

  const res: PowerFlowResult = {
    converged: true, iterations: 0,
    vRe: new Map(), vIm: new Map(), vPu: new Map(),
    cableA: new Map(), cableLoading: new Map(), cableIRe: new Map(), cableIIm: new Map(),
    trafoLoading: new Map(), lossesKW: 0, sourceMW: 0, loadOn: new Map(),
  };

  // Node-level voltages (pu), default 0 for dead islands.
  const nodeVRe = new Map<string, number>();
  const nodeVIm = new Map<string, number>();
  for (const n of topo.nodes) { nodeVRe.set(n, 0); nodeVIm.set(n, 0); }

  // Branch list in pu (series admittance), shared by all islands.
  interface Br { id: string; kind: 'cable' | 'trafo'; a: string; b: string; yRe: number; yIm: number; rPu: number; xPu: number }
  const branches: Br[] = [];
  for (const c of net.cables) {
    const t = cableTypes.get(c.type)!;
    const kV = busById.get(c.from)!.vnKV;
    const zb = zBase(kV);
    const r = (t.rOp * c.lengthKm) / zb, x = (t.x * c.lengthKm) / zb;
    const d = r * r + x * x;
    branches.push({ id: c.id, kind: 'cable', a: topo.nodeOf.get(c.from)!, b: topo.nodeOf.get(c.to)!, yRe: r / d, yIm: -x / d, rPu: r, xPu: x });
  }
  for (const tr of net.transformers) {
    const t = tTypes.get(tr.type)!;
    const z = (t.zPct / 100) * (S_BASE_MVA / t.sMVA);
    const x = z / Math.sqrt(1 + 1 / (t.xr * t.xr));
    const r = x / t.xr;
    const d = r * r + x * x;
    branches.push({ id: tr.id, kind: 'trafo', a: topo.nodeOf.get(tr.hv)!, b: topo.nodeOf.get(tr.lv)!, yRe: r / d, yIm: -x / d, rPu: r, xPu: x });
  }

  // Loads per node (pu)
  const nodeP = new Map<string, number>(), nodeQ = new Map<string, number>();
  for (const l of net.loads) {
    const inj = loads.get(l.id) ?? { p: 0, q: 0 };
    const n = topo.nodeOf.get(l.bus)!;
    nodeP.set(n, (nodeP.get(n) ?? 0) + inj.p / S_BASE_MVA);
    nodeQ.set(n, (nodeQ.get(n) ?? 0) + inj.q / S_BASE_MVA);
  }

  const sourceAtNode = new Map<string, number>();
  for (const s of net.sources) sourceAtNode.set(topo.nodeOf.get(s.bus)!, s.vSetPu);

  for (const isl of topo.islands) {
    if (!isl.energised) continue;
    const slack = isl.nodes.filter((n) => sourceAtNode.has(n));
    const pq = isl.nodes.filter((n) => !sourceAtNode.has(n));
    const idx = new Map<string, number>();
    pq.forEach((n, i) => idx.set(n, i));
    for (const s of slack) { nodeVRe.set(s, sourceAtNode.get(s)!); nodeVIm.set(s, 0); }
    const n = pq.length;
    if (n === 0) continue;
    const yr = new Float64Array(n * n), yi = new Float64Array(n * n);
    // constant RHS term: −Y_NS · V_S
    const cr = new Float64Array(n), ci = new Float64Array(n);
    for (const br of branches) {
      if (topo.islandOf.get(br.a) !== topo.islandOf.get(br.b)) continue;
      if (!isl.nodes.includes(br.a)) continue;
      if (br.a === br.b) continue;
      const ia = idx.get(br.a), ib = idx.get(br.b);
      if (ia !== undefined) { yr[ia * n + ia] = yr[ia * n + ia]! + br.yRe; yi[ia * n + ia] = yi[ia * n + ia]! + br.yIm; }
      if (ib !== undefined) { yr[ib * n + ib] = yr[ib * n + ib]! + br.yRe; yi[ib * n + ib] = yi[ib * n + ib]! + br.yIm; }
      if (ia !== undefined && ib !== undefined) {
        yr[ia * n + ib] = yr[ia * n + ib]! - br.yRe; yi[ia * n + ib] = yi[ia * n + ib]! - br.yIm;
        yr[ib * n + ia] = yr[ib * n + ia]! - br.yRe; yi[ib * n + ia] = yi[ib * n + ia]! - br.yIm;
      } else if (ia !== undefined) {
        const vr = nodeVRe.get(br.b)!, vi = nodeVIm.get(br.b)!;
        cr[ia] = cr[ia]! + (br.yRe * vr - br.yIm * vi); ci[ia] = ci[ia]! + (br.yRe * vi + br.yIm * vr);
      } else if (ib !== undefined) {
        const vr = nodeVRe.get(br.a)!, vi = nodeVIm.get(br.a)!;
        cr[ib] = cr[ib]! + (br.yRe * vr - br.yIm * vi); ci[ib] = ci[ib]! + (br.yRe * vi + br.yIm * vr);
      }
    }
    const lu = new ComplexLU(n, yr, yi);
    if (lu.singular) { res.converged = false; continue; }
    const vr = new Float64Array(n).fill(slack.length ? sourceAtNode.get(slack[0]!)! : 1);
    const vi = new Float64Array(n);
    const P = pq.map((nd) => nodeP.get(nd) ?? 0), Q = pq.map((nd) => nodeQ.get(nd) ?? 0);
    let it = 0, ok = false;
    for (; it < maxIter; it++) {
      const br = new Float64Array(n), bi = new Float64Array(n);
      for (let k = 0; k < n; k++) {
        // I_load = conj(S / V) drawn ⇒ injection −conj(S/V) = −(P − jQ)/conj(V)
        const d = vr[k]! * vr[k]! + vi[k]! * vi[k]!;
        const ir = (P[k]! * vr[k]! + Q[k]! * vi[k]!) / d;
        const ii = (P[k]! * vi[k]! - Q[k]! * vr[k]!) / d;
        br[k] = cr[k]! - ir; bi[k] = ci[k]! - ii;
      }
      const sol = lu.solve(br, bi);
      let dmax = 0;
      for (let k = 0; k < n; k++) {
        const dr = sol.re[k]! - vr[k]!, di = sol.im[k]! - vi[k]!;
        const dd = dr * dr + di * di;
        if (dd > dmax) dmax = dd;
        vr[k] = sol.re[k]!; vi[k] = sol.im[k]!;
      }
      if (dmax < tol * tol) { ok = true; it++; break; }
      const vmin2 = Math.min(...Array.from(vr, (x, k) => x * x + vi[k]! * vi[k]!));
      if (!(vmin2 > 0.01)) break; // collapse (< 0.1 pu) → not converged
    }
    res.iterations = Math.max(res.iterations, it);
    if (!ok) res.converged = false;
    pq.forEach((nd, k) => { nodeVRe.set(nd, vr[k]!); nodeVIm.set(nd, vi[k]!); });
  }

  // Bus outputs
  for (const b of net.buses) {
    const nd = topo.nodeOf.get(b.id)!;
    const r = nodeVRe.get(nd)!, i = nodeVIm.get(nd)!;
    res.vRe.set(b.id, r); res.vIm.set(b.id, i); res.vPu.set(b.id, Math.sqrt(r * r + i * i));
  }
  // Branch flows and losses
  let losses = 0;
  for (const br of branches) {
    const dr = nodeVRe.get(br.a)! - nodeVRe.get(br.b)!, di = nodeVIm.get(br.a)! - nodeVIm.get(br.b)!;
    const ir = br.yRe * dr - br.yIm * di, ii = br.yRe * di + br.yIm * dr;
    const i2 = ir * ir + ii * ii;
    losses += i2 * br.rPu;
    if (br.kind === 'cable') {
      const c = net.cables.find((x) => x.id === br.id)!;
      const kV = busById.get(c.from)!.vnKV;
      const amps = Math.sqrt(i2) * iBaseA(kV);
      res.cableA.set(br.id, amps);
      res.cableIRe.set(br.id, ir); res.cableIIm.set(br.id, ii);
      res.cableLoading.set(br.id, amps / cableTypes.get(c.type)!.ampacityA);
    } else {
      const tr = net.transformers.find((x) => x.id === br.id)!;
      const t = tTypes.get(tr.type)!;
      res.trafoLoading.set(br.id, (Math.sqrt(i2) * S_BASE_MVA) / t.sMVA);
    }
  }
  res.lossesKW = losses * S_BASE_MVA * 1000;
  // Source power = Σ loads + losses (computed directly from slack injections)
  let srcP = 0;
  for (const br of branches) {
    const aSrc = sourceAtNode.has(br.a), bSrc = sourceAtNode.has(br.b);
    if (aSrc === bSrc) continue;
    const s = aSrc ? br.a : br.b, o = aSrc ? br.b : br.a;
    const dr = nodeVRe.get(s)! - nodeVRe.get(o)!, di = nodeVIm.get(s)! - nodeVIm.get(o)!;
    const ir = br.yRe * dr - br.yIm * di, ii = br.yRe * di + br.yIm * dr;
    srcP += nodeVRe.get(s)! * ir + nodeVIm.get(s)! * ii;
  }
  res.sourceMW = srcP * S_BASE_MVA;
  for (const l of net.loads) {
    const nd = topo.nodeOf.get(l.bus)!;
    res.loadOn.set(l.id, topo.islands[topo.islandOf.get(nd)!]!.energised);
  }
  return res;
}
