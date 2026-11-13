import type { Network, Bus, Switch, Fpi, Relay, Load, Cable, Transformer } from '../model';
import { Rng } from '../rng';
import { CABLE_3x300AL, TRAFOS, SOURCE, SUBSTATION_LOAD, PROTECTION, FPI, OPERATIONS, FAULT_WEIGHTS, SYSTEM } from '../../data/params';
import type { FaultType } from '../shortcircuit';

/**
 * Procedural Riyadh-style district (GDD §3.1): open rings between grid station A and grid station B,
 * SEC planning template [KSA-02]. Each RMU: busbar + left ring LBS + right ring LBS + tee-off fuse-switch
 * to a package transformer (Dyn11) and its LV load. One normally-open point (NOP) per ring.
 */
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultySpec {
  rings: number; rmusPerRing: [number, number]; automated: number; crews: number;
  fpiType: 'three-phase' | 'earth-only' | 'mixed'; loading: [number, number]; stressed: boolean;
  staleFpiProb: number; damageReports: boolean; commsLossProb: number; summer: boolean; hour: number | 'random';
}

export const DIFFICULTY: Record<Difficulty, DifficultySpec> = {
  easy: { rings: 1, rmusPerRing: [6, 8], automated: 0.6, crews: 3, fpiType: 'three-phase', loading: [0.35, 0.5], stressed: false, staleFpiProb: 0, damageReports: false, commsLossProb: 0, summer: false, hour: 2 },
  normal: { rings: 2, rmusPerRing: [8, 10], automated: 0.4, crews: 2, fpiType: 'mixed', loading: [0.4, 0.5], stressed: false, staleFpiProb: 0, damageReports: true, commsLossProb: 0, summer: true, hour: 'random' },
  hard: { rings: 3, rmusPerRing: [10, 12], automated: 0.25, crews: 2, fpiType: 'earth-only', loading: [0.55, 0.65], stressed: true, staleFpiProb: 0.15, damageReports: true, commsLossProb: 0.2, summer: true, hour: 15 },
};

export interface FaultSpec {
  cable: string;            // cable segment id
  frac: number;             // position along the cable
  type: FaultType;
  rfOhm: number;            // fault resistance
  cause: 'cable' | 'joint' | 'termination' | 'third-party';
  damageReportAtMin: number | null; // minutes after fault when a damage report arrives (third-party only)
}

export interface RingInfo {
  id: string;
  rmus: string[];           // RMU site ids in order from A to B
  cables: string[];         // cable ids in order from A to B (length rmus+1)
  ringSwitches: string[];   // switch ids in order A→B: CB_A, [L1,R1], [L2,R2], …, CB_B
  nop: string;              // switch id normally open
}

export interface Site { id: string; kind: 'gs' | 'rmu'; ring?: string; x: number; y: number; label: string; remote: boolean; commsOk: boolean; kva?: number; customers?: number }

export interface Scenario {
  seed: number; difficulty: Difficulty; spec: DifficultySpec;
  net: Network; rings: RingInfo[]; sites: Site[];
  startHour: number; summer: boolean; groundTempC: 35 | 40;
  fault: FaultSpec; crewCount: number; crewBase: { x: number; y: number };
  staleFpis: string[];      // FPI ids that will not reset (show old flags)
}

export function generateScenario(seed: number, difficulty: Difficulty, overrides: Partial<DifficultySpec> = {}): Scenario {
  const spec: DifficultySpec = { ...DIFFICULTY[difficulty], ...overrides };
  const rng = Rng.stream(seed, 'district');
  const net: Network = { buses: [], sources: [], cableTypes: [CABLE_3x300AL], cables: [], switches: [], transformerTypes: TRAFOS, transformers: [], loads: [], fpis: [], relays: [], fMainsHz: SYSTEM.fHz.value };
  const kv = SYSTEM.mvKV.value;
  const sites: Site[] = [];
  const rings: RingInfo[] = [];
  const W = 100; // layout units (UI only)
  const nerOhm = (kv * 1000) / Math.sqrt(3) / SOURCE.nerCurrentA.value;
  for (const [gs, x] of [['GA', 0], ['GB', W]] as const) {
    net.buses.push({ id: gs, kind: 'source', vnKV: kv, x, y: 0, label: gs });
    net.sources.push({ id: `S-${gs}`, bus: gs, vSetPu: SOURCE.vSetPu.value, skMVA: SOURCE.skMVA.value, rx: SOURCE.rx.value, earthing: { kind: 'resistance', rOhm: nerOhm }, z0OverZ1: SOURCE.z0OverZ1.value, restC0nF: SOURCE.restC0nF.value });
    sites.push({ id: gs, kind: 'gs', x, y: 0, label: gs === 'GA' ? 'A' : 'B', remote: true, commsOk: true });
  }
  const groundTempC: 35 | 40 = spec.stressed ? 40 : 35;
  const sw = (s: Omit<Switch, 'faultMakeLeft' | 'earthed'> & { faultMakeLeft?: number }): Switch => {
    const full: Switch = { faultMakeLeft: s.kind === 'CB' ? OPERATIONS.cbFaultOps.value : OPERATIONS.lbsFaultMakes.value, earthed: false, ...s };
    net.switches.push(full);
    return full;
  };
  const kvaChoices = [500, 1000, 1500];
  for (let r = 0; r < spec.rings; r++) {
    const rid = `R${r + 1}`;
    const n = rng.int(spec.rmusPerRing[0], spec.rmusPerRing[1]);
    const yOff = (r - (spec.rings - 1) / 2) * 34 + (spec.rings === 1 ? 0 : 0);
    const ring: RingInfo = { id: rid, rmus: [], cables: [], ringSwitches: [], nop: '' };
    // cable lengths: n+1 segments, each half ≤ 7.5 km (indicative DPS rule)
    const segs: number[] = [];
    for (let i = 0; i <= n; i++) segs.push(0.35 + rng.next() * 0.75);
    const total = segs.reduce((a, b) => a + b, 0);
    const maxTotal = 2 * SYSTEM.ringMaxKm.value * 0.9;
    if (total > maxTotal) for (let i = 0; i < segs.length; i++) segs[i] = segs[i]! * (maxTotal / total);
    // feeder nodes at both grid stations
    const fa = `${rid}-FA`, fb = `${rid}-FB`;
    net.buses.push({ id: fa, kind: 'node', vnKV: kv, x: 0, y: 0 }, { id: fb, kind: 'node', vnKV: kv, x: W, y: 0 });
    const cbA = sw({ id: `${rid}-CBA`, from: 'GA', to: fa, kind: 'CB', closed: true, remote: true, site: 'GA' });
    ring.ringSwitches.push(cbA.id);
    let prevNode = fa;
    let cumKm = 0;
    for (let i = 0; i < n; i++) {
      const site = `${rid}-${i + 1}`;
      const t = (i + 1) / (n + 1);
      const sx = t * W;
      const sy = yOff + Math.sqrt(t * (1 - t)) * (r % 2 === 0 ? -1 : 1) * 30 * (spec.rings === 1 ? 1 : 0.55);
      const L = `${site}L`, B = `${site}B`, Rn = `${site}R`, T = `${site}T`, LV = `${site}LV`;
      for (const id of [L, B, Rn, T]) net.buses.push({ id, kind: 'rmu', vnKV: kv, x: sx, y: sy });
      net.buses.push({ id: LV, kind: 'lv', vnKV: 0.4, x: sx, y: sy });
      const cid = `${rid}-C${i + 1}`;
      cumKm += segs[i]!;
      net.cables.push({ id: cid, from: prevNode, to: L, type: CABLE_3x300AL.id, lengthKm: segs[i]! });
      ring.cables.push(cid);
      const remote = rng.next() < spec.automated;
      const swL = sw({ id: `${site}-L`, from: L, to: B, kind: 'LBS', closed: true, remote, site });
      const swR = sw({ id: `${site}-R`, from: B, to: Rn, kind: 'LBS', closed: true, remote, site });
      sw({ id: `${site}-T`, from: B, to: T, kind: 'FUSE_SWITCH', closed: true, remote: false, site });
      ring.ringSwitches.push(swL.id, swR.id);
      const kva = rng.pick(kvaChoices);
      net.transformers.push({ id: `${site}-TX`, hv: T, lv: LV, type: `T${kva}`, vector: 'Dyn11' } satisfies Transformer);
      const customers = Math.round(kva * SUBSTATION_LOAD.customersPerKVA.value * (0.8 + 0.4 * rng.next()));
      const [lo, hi] = SUBSTATION_LOAD.peakLoadingOfRating.value;
      const sPeak = (kva / 1000) * (lo + (hi - lo) * rng.next());
      const pf = SUBSTATION_LOAD.powerFactor.value;
      net.loads.push({ id: `${site}-LD`, bus: LV, customers, pPeakMW: sPeak * pf, qPeakMvar: sPeak * Math.sqrt(1 - pf * pf), cls: 'mixed' } satisfies Load);
      const fpiType = spec.fpiType === 'mixed' ? (rng.next() < 0.5 ? 'three-phase' : 'earth-only') : spec.fpiType;
      for (const [side, cab] of [['L', cid], ['R', `${rid}-C${i + 2}`]] as const) {
        net.fpis.push({ id: `${site}-F${side}`, cable: cab, atBus: side === 'L' ? L : Rn, type: fpiType, phasePickupA: FPI.phasePickupA.value, earthPickupA: FPI.earthPickupA.value, remote, site } satisfies Fpi);
      }
      sites.push({ id: site, kind: 'rmu', ring: rid, x: sx, y: sy, label: `${rid}-${i + 1}`, remote, commsOk: true, kva, customers });
      ring.rmus.push(site);
      prevNode = Rn;
    }
    const lastCid = `${rid}-C${n + 1}`;
    net.cables.push({ id: lastCid, from: prevNode, to: fb, type: CABLE_3x300AL.id, lengthKm: segs[n]! } satisfies Cable);
    ring.cables.push(lastCid);
    const cbB = sw({ id: `${rid}-CBB`, from: 'GB', to: fb, kind: 'CB', closed: true, remote: true, site: 'GB' });
    ring.ringSwitches.push(cbB.id);
    void cumKm;
    // NOP: split customers roughly in half (load balance is a DPS NOP placement factor [KSA-02])
    const loads = ring.rmus.map((s) => net.loads.find((l) => l.id === `${s}-LD`)!.pPeakMW);
    const tot = loads.reduce((a, b) => a + b, 0);
    let acc = 0, k = 0;
    while (k < loads.length - 1 && acc + loads[k]! < tot / 2) { acc += loads[k]!; k++; }
    const nopSite = ring.rmus[k]!;
    const nopSide = rng.next() < 0.5 ? 'L' : 'R';
    const nopSw = net.switches.find((s) => s.id === `${nopSite}-${nopSide}`)!;
    nopSw.closed = false;
    ring.nop = nopSw.id;
    for (const cbid of [cbA.id, cbB.id]) {
      net.relays.push({
        id: `RL-${cbid}`, switch: cbid,
        phase: { curve: PROTECTION.phaseCurve.value, pickupA: PROTECTION.phasePickupA.value, tms: PROTECTION.phaseTms.value },
        earth: { curve: PROTECTION.earthCurve.value, pickupA: PROTECTION.earthPickupA.value, tms: PROTECTION.earthTms.value },
        breakerOpenS: PROTECTION.breakerOpenS.value,
      } satisfies Relay);
    }
    rings.push(ring);
  }
  // scale loads so the design-peak current of each half-ring meets the difficulty's loading target
  for (const ring of rings) {
    const target = spec.loading[0] + (spec.loading[1] - spec.loading[0]) * rng.next();
    const nopIdx = ring.ringSwitches.indexOf(ring.nop);
    const halves = [ring.rmus.filter((_, i) => 1 + 2 * i < nopIdx), ring.rmus.filter((_, i) => 1 + 2 * i + 1 > nopIdx)];
    for (const half of halves) {
      const ls = half.map((s) => net.loads.find((l) => l.id === `${s}-LD`)!);
      const sMVA = ls.reduce((a, l) => a + Math.sqrt(l.pPeakMW * l.pPeakMW + l.qPeakMvar * l.qPeakMvar), 0);
      const amps = (sMVA * 1e6) / (Math.sqrt(3) * kv * 1e3);
      const rating = groundTempC === 40 ? CABLE_3x300AL.ampacity40C : CABLE_3x300AL.ampacityA;
      const f = (target * rating) / Math.max(amps, 1e-9);
      for (const l of ls) { l.pPeakMW *= f; l.qPeakMvar *= f; }
    }
  }
  // comms loss and stale FPIs (Hard)
  for (const s of sites) if (s.kind === 'rmu' && s.remote && rng.next() < spec.commsLossProb) s.commsOk = false;
  const staleFpis = net.fpis.filter(() => rng.next() < spec.staleFpiProb).map((f) => f.id);

  const fault = generateFault(Rng.stream(seed, 'fault'), net, rings, spec);
  const startHour = spec.hour === 'random' ? Rng.stream(seed, 'time').int(0, 23) : spec.hour;
  return {
    seed, difficulty, spec, net, rings, sites, startHour, summer: spec.summer, groundTempC,
    fault, crewCount: spec.crews, crewBase: { x: W / 2, y: 60 }, staleFpis,
  };
}

function generateFault(rng: Rng, net: Network, rings: RingInfo[], spec: DifficultySpec): FaultSpec {
  const ring = rng.pick(rings);
  const cabs = ring.cables.map((id) => net.cables.find((c) => c.id === id)!);
  // never on the feeder cable right at a grid station in v1 (keeps the first section restorable from the other side)
  const cand = cabs.slice(1, cabs.length - 1);
  const w = FAULT_WEIGHTS.component.value;
  const cause = rng.next() < FAULT_WEIGHTS.thirdPartyShare.value ? 'third-party' : rng.weighted(['cable', 'joint', 'termination'] as const, [w.cable, w.joint, w.termination]);
  const cab = rng.weighted(cand, cand.map((c) => c.lengthKm));
  let frac = rng.range(0.1, 0.9);
  if (cause === 'termination') frac = rng.next() < 0.5 ? 0.02 : 0.98;
  // fault-type mix — no public source for UG cable shares (SP2-26 NOT FOUND) ⇒ [A], FAULT_WEIGHTS.typeMix
  const mix = FAULT_WEIGHTS.typeMix.value;
  const types = ['SLG', 'DLG', 'LL', '3PH'] as const;
  const wm = mix[cause === 'third-party' ? 'thirdParty' : cause === 'termination' ? 'termination' : 'insulation'];
  const type: FaultType = rng.weighted(types, types.map((t) => wm[t]));
  const rf = cause === 'third-party' ? rng.range(0, 0.5) : rng.range(0, 3); // [A]
  const damageReportAtMin = cause === 'third-party' && spec.damageReports && rng.next() < FAULT_WEIGHTS.damageReportProb.value ? rng.int(8, 45) : null;
  return { cable: cab.id, frac, type, rfOhm: rf, cause, damageReportAtMin };
}

export type { Bus };
