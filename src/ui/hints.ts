import { buildTopology } from '../engine/topology';
import type { Simulation } from '../engine/sim';
import type { Scenario, RingInfo } from '../engine/scenario/district';
import type { Switch } from '../engine/model';

/**
 * Goal line and tiered hints (research/13 §4, D-019). Everything is computed from the live game state.
 * - The goal line and tiers 1–2 use only what the player can know (evidence they collected).
 * - Tier 3 ("exact next step") may use the true fault location: it is the answer, and it costs stars.
 * Every result names a target (data-id of a map element or data-act of a button) for the spotlight.
 */
export type Phase = 'locate' | 'isolate' | 'restore' | 'safe' | 'repair' | 'normal' | 'done';

export interface Step {
  /** i18n key and params of the sentence */
  key: string;
  params: Record<string, string | number>;
  /** map elements to spotlight (data-id values, e.g. "R1-3", "sw:R1-3-L", "cable:R1-C4", "GA") */
  targets: string[];
  /** site to open in the action panel, if any */
  site?: string;
  /** button to spotlight (data-act value) */
  act?: string;
}

export interface Analysis {
  phase: Phase;
  ring: RingInfo;
  fed: 'A' | 'B' | null;
  /** cable the player's evidence points to (null while more than one cable is still possible) */
  located: string | null;
  /** cables still possible by the player's evidence */
  possible: string[];
}

export function faultRing(sc: Scenario, sim?: Simulation): RingInfo {
  void sim;
  return sc.rings.find((r) => r.cables.includes(sc.fault.cable))!;
}

export function analyze(sc: Scenario, sim: Simulation): Analysis {
  const ring = faultRing(sc, sim);
  const fed = sim.fedFrom(ring);
  const possible = ring.cables.filter((c) => sim.suspect.has(c) && !sim.provenHealthy(c) && !sim.repaired.has(c));
  const fc = sc.fault.cable;
  // a damage report names the dig site: the player knows the cable (OP-05 §11; the bot uses it the same way)
  const dmg = sim.damageCable();
  const located = possible.length === 1 ? possible[0]! : dmg && possible.includes(dmg) ? dmg : sim.damageAttended ? fc : null;
  let phase: Phase;
  const ends = sim.switchesBounding(fc);
  const isolated = ends.every((e) => !e.closed);
  if (sim.complete) phase = 'done';
  else if (sim.repaired.has(fc) || !sim.faultPresent) phase = 'normal';
  else if (sim.permits.has(fc)) phase = 'repair';
  else if (!located && !isolated) phase = 'locate';
  else if (!isolated) phase = 'isolate';
  else if (restorePending(sc, sim)) phase = 'restore';
  else if (ends.filter((e) => e.kind === 'LBS').every((e) => e.earthed) && (!sim.damageReported || sim.damageAttended)) phase = 'repair';
  else phase = 'safe';
  return { phase, ring, fed, located, possible };
}

/** Goal line: one short sentence for the current phase (player knowledge only). */
export function goalKey(a: Analysis): string { return `goal_${a.phase}`; }

const swSite = (sim: Simulation, id: string) => sim.net.switches.find((x) => x.id === id)!.site;

/** The open switch whose closing restores the most customers without paralleling or touching the fault/earths. */
export function bestRestore(sc: Scenario, sim: Simulation): { sw: Switch; customers: number } | null {
  const fc = sc.fault.cable;
  const faultEnds = new Set(sim.switchesBounding(fc).map((x) => x.id));
  const loadsOn = (net: Simulation['net']) => {
    const topo = buildTopology(net);
    let n = 0;
    for (const l of net.loads) { const node = topo.nodeOf.get(l.bus); if (node !== undefined && topo.islands[topo.islandOf.get(node)!]!.energised) n += l.customers; }
    return { n, topo };
  };
  const base = loadsOn(sim.net).n;
  let best: { sw: Switch; customers: number } | null = null;
  for (const ring of sc.rings) for (const id of ring.ringSwitches) {
    const s = sim.net.switches.find((x) => x.id === id)!;
    if (s.closed || s.earthed || sim.secured.has(s.id) || faultEnds.has(s.id)) continue;
    // never parallel two grid stations
    const t0 = buildTopology(sim.net);
    const ia = t0.islands[t0.islandOf.get(t0.nodeOf.get(s.from)!)!]!, ib = t0.islands[t0.islandOf.get(t0.nodeOf.get(s.to)!)!]!;
    if (ia !== ib && ia.energised && ib.energised) continue;
    s.closed = true;
    const after = loadsOn(sim.net);
    // would it energise the faulted cable or an earthed / permitted cable?
    const live = (bus: string) => after.topo.islands[after.topo.islandOf.get(after.topo.nodeOf.get(bus)!)!]!.energised;
    const cab = sim.net.cables.find((c) => c.id === fc)!;
    const bad = (sim.faultPresent && (live(cab.from) || live(cab.to)))
      || sim.net.switches.some((e) => e.earthed && live(e.id.endsWith('-L') ? e.from : e.to))
      || [...sim.permits].some((p) => { const c = sim.net.cables.find((x) => x.id === p)!; return live(c.from) || live(c.to); });
    s.closed = false;
    const gain = after.n - base;
    if (bad || gain <= 0) continue;
    if (!best || gain > best.customers) best = { sw: s, customers: gain };
  }
  return best;
}

const remoteOk = (sc: Scenario, sim: Simulation, swId: string) => {
  const s = sim.net.switches.find((x) => x.id === swId)!;
  const site = sc.sites.find((x) => x.id === s.site)!;
  return s.remote && site.commsOk && !sim.secured.has(swId);
};

function crewStep(sc: Scenario, sim: Simulation, site: string, then: Step): Step {
  const here = sim.crews.find((c) => c.site === site && c.busyUntil <= sim.t);
  if (here) return then;
  const coming = sim.crews.find((c) => c.travellingTo === site || (c.site === site && c.busyUntil > sim.t));
  if (coming) return { key: 'h3_wait', params: { crew: coming.id + 1, site }, targets: [site], act: 'advance' };
  const idle = sim.crews.find((c) => c.busyUntil <= sim.t && c.travellingTo === null);
  if (idle) return { key: 'h3_dispatch', params: { crew: idle.id + 1, site }, targets: [site], site, act: `dispatch:${idle.id}:${site}` };
  return { key: 'h3_waitCrew', params: {}, targets: [], act: 'advance' };
}

/** Tier 3: the exact next action. */
export function nextStep(sc: Scenario, sim: Simulation): Step | null {
  const a = analyze(sc, sim);
  const fc = sc.fault.cable;
  const ring = a.ring;
  const opStep = (swId: string, op: 'open' | 'close', key: string, extra: Record<string, string | number> = {}): Step => {
    const site = swSite(sim, swId);
    if (remoteOk(sc, sim, swId)) return { key, params: { sw: swId, site, how: 'remote', ...extra }, targets: [`sw:${swId}`], site, act: `remote:${swId}:${op}` };
    const crew = sim.crews.find((c) => c.site === site && c.busyUntil <= sim.t);
    return crewStep(sc, sim, site, { key, params: { sw: swId, site, how: 'crew', ...extra }, targets: [`sw:${swId}`], site, act: `crewOp:${crew?.id ?? 0}:${swId}:${op}` });
  };
  // a damage report outranks everything until a crew has seen the dig site: never re-energise towards it blind
  if (sim.damageReported && !sim.damageAttended && ['locate', 'isolate', 'restore'].includes(a.phase)) {
    const dc = sim.damageCable()!;
    const site = sim.switchesBounding(dc).find((e) => e.kind === 'LBS')!.site;
    const crew = sim.crews.find((c) => c.site === site && c.busyUntil <= sim.t);
    return crewStep(sc, sim, site, { key: 'h3_attend', params: { site }, targets: [site, `cable:${dc}`], site, act: `attendDamage:${crew?.id ?? 0}` });
  }
  switch (a.phase) {
    case 'done': return null;
    case 'locate': {
      // read the next unread RMU inside the still-possible interval (remote first)
      const idx = a.possible.map((c) => ring.cables.indexOf(c));
      const lo = Math.min(...idx), hi = Math.max(...idx);
      const cands = ring.rmus.filter((_, k) => k >= lo - 1 && k <= hi).filter((id) => !sim.readings.some((r) => r.site === id && r.t >= (sim.tripT ?? 0)));
      const remote = cands.find((id) => { const s = sc.sites.find((x) => x.id === id)!; return s.remote && s.commsOk; });
      if (remote) return { key: 'h3_readRemote', params: { site: remote }, targets: [remote], site: remote, act: `readRemote:${remote}` };
      if (cands.length) {
        const mid = cands[Math.floor(cands.length / 2)]!;
        const crew = sim.crews.find((c) => c.site === mid && c.busyUntil <= sim.t);
        return crewStep(sc, sim, mid, { key: 'h3_readCrew', params: { site: mid }, targets: [mid], site: mid, act: `readFpi:${crew?.id ?? 0}` });
      }
      return halveStep(sc, sim, a, lo, hi, opStep);
    }
    case 'isolate': {
      const open = sim.switchesBounding(fc).find((e) => e.closed)!;
      return opStep(open.id, 'open', 'h3_isolate', { cable: fc });
    }
    case 'restore': return restoreStep(sc, sim, opStep);
    case 'safe': {
      if (sim.damageReported && !sim.damageAttended) {
        const site = sim.switchesBounding(fc).find((e) => e.kind === 'LBS')!.site;
        const crew = sim.crews.find((c) => c.site === site && c.busyUntil <= sim.t);
        return crewStep(sc, sim, site, { key: 'h3_attend', params: { site }, targets: [site], site, act: `attendDamage:${crew?.id ?? 0}` });
      }
      for (const e of sim.switchesBounding(fc)) {
        if (e.kind !== 'LBS' || e.earthed) continue;
        const crew = sim.crews.find((c) => c.site === e.site && c.busyUntil <= sim.t);
        const id = crew?.id ?? 0;
        const step: Step = !sim.secured.has(e.id)
          ? { key: 'h3_secure', params: { sw: e.id, site: e.site }, targets: [`sw:${e.id}`], site: e.site, act: `secure:${id}:${e.id}` }
          : !sim.provedDead.has(e.id)
            ? { key: 'h3_proveDead', params: { sw: e.id, site: e.site }, targets: [`sw:${e.id}`], site: e.site, act: `proveDead:${id}:${e.id}` }
            : { key: 'h3_earth', params: { sw: e.id, site: e.site }, targets: [`sw:${e.id}`], site: e.site, act: `earth:${id}:${e.id}:on` };
        return crewStep(sc, sim, e.site, step);
      }
      return { key: 'h3_waitCrew', params: {}, targets: [], act: 'advance' };
    }
    case 'repair': {
      if (!sim.permits.has(fc)) return { key: 'h3_permit', params: { cable: fc }, targets: [`cable:${fc}`], act: `permit:${fc}:on` };
      if (sim.repairing === fc) return { key: 'h3_repairing', params: {}, targets: [`cable:${fc}`], act: 'advance' };
      return { key: 'h3_repair', params: { cable: fc }, targets: [`cable:${fc}`], act: `repair:${fc}` };
    }
    case 'normal': {
      if (sim.permits.has(fc)) return { key: 'h3_permitOff', params: { cable: fc }, targets: [`cable:${fc}`], act: `permit:${fc}:off` };
      for (const e of sim.switchesBounding(fc)) {
        if (!e.earthed && !sim.secured.has(e.id)) continue;
        const crew = sim.crews.find((c) => c.site === e.site && c.busyUntil <= sim.t);
        const id = crew?.id ?? 0;
        const step: Step = e.earthed
          ? { key: 'h3_earthOff', params: { sw: e.id, site: e.site }, targets: [`sw:${e.id}`], site: e.site, act: `earth:${id}:${e.id}:off` }
          : { key: 'h3_unsecure', params: { sw: e.id, site: e.site }, targets: [`sw:${e.id}`], site: e.site, act: `secure:${id}:${e.id}:off` };
        return crewStep(sc, sim, e.site, step);
      }
      // break-before-make: first open what is closed but normally open, then close what is open but normally closed
      for (const r of sc.rings) for (const id of r.ringSwitches) {
        const s = sim.net.switches.find((x) => x.id === id)!;
        const normal = sc.net.switches.find((x) => x.id === id)!.closed;
        if (s.closed && !normal) return opStep(id, 'open', 'h3_nopOpen');
      }
      const toClose = sc.rings.flatMap((r) => r.ringSwitches).map((id) => swOf(sim, id)).filter((x) => !x.closed && sc.net.switches.find((y) => y.id === x.id)!.closed);
      if (toClose.length) return closeAll(sc, sim, opStep, toClose);
      return { key: 'h3_waitCrew', params: {}, targets: [], act: 'advance' };
    }
  }
}

type OpStep = (swId: string, op: 'open' | 'close', key: string, extra?: Record<string, string | number>) => Step;
const swOf = (sim: Simulation, id: string) => sim.net.switches.find((x) => x.id === id)!;
const islandLive = (sim: Simulation, bus: string) => { const tp = buildTopology(sim.net); return tp.islands[tp.islandOf.get(tp.nodeOf.get(bus)!)!]!.energised; };

/** Restoration target on the faulted ring: every ring switch closed except the two that isolate the fault. */
function restoreTargets(sc: Scenario, sim: Simulation): Switch[] {
  const ring = faultRing(sc, sim);
  const ends = new Set(sim.switchesBounding(sc.fault.cable).map((e) => e.id));
  // a later trip at load-level current means the backfeed overloaded the other feeder: keep the NOP open and
  // leave the far section for after the repair (same rule as the reference strategy)
  if (noBackfeed(sim)) ends.add(ring.nop);
  return ring.ringSwitches.filter((id) => !ends.has(id)).map((id) => swOf(sim, id)).filter((x) => !x.closed && !x.earthed && !sim.secured.has(x.id));
}
export function restorePending(sc: Scenario, sim: Simulation): boolean {
  const ring = faultRing(sc, sim);
  return restoreTargets(sc, sim).length > 0 || (noBackfeed(sim) && swOf(sim, ring.nop).closed && !sim.switchesBounding(sc.fault.cable).some((e) => e.id === ring.nop));
}

/**
 * Restore the healthy sections. Order: close dead switches first (no risk, builds the path), then close the
 * switch that energises (a breaker or remote switch may trial-close through the checklist; a manual switch only
 * if every newly energised cable is proven). A manual switch that would be a trial close is handled by opening
 * the breaker that feeds its live side, closing the manual switch dead, then trial-closing the breaker (P-09).
 */
const noBackfeed = (sim: Simulation) => sim.relayRecords.slice(1).some((r) => r.iMaxA < 2 * 400);

function restoreStep(sc: Scenario, sim: Simulation, opStep: OpStep): Step {
  const ring0 = faultRing(sc, sim);
  if (noBackfeed(sim) && swOf(sim, ring0.nop).closed && !sim.switchesBounding(sc.fault.cable).some((e) => e.id === ring0.nop)) return opStep(ring0.nop, 'open', 'h3_unbackfeed');
  return closeAll(sc, sim, opStep, restoreTargets(sc, sim));
}

/** Close a set of open switches safely (dead first; trial closes only from a breaker or remote switch). */
function closeAll(sc: Scenario, sim: Simulation, opStep: OpStep, todo: Switch[]): Step {
  const dead = todo.find((x) => !islandLive(sim, x.from) && !islandLive(sim, x.to) && x.kind !== 'CB');
  if (dead) return opStep(dead.id, 'close', 'h3_deadClose');
  const ring = faultRing(sc, sim);
  for (const x of todo) {
    const remote = remoteOk(sc, sim, x.id);
    if (remote || sim.closePreview(x.id, null).unproven === 0) return opStep(x.id, 'close', 'h3_restore');
  }
  // manual switch onto an unproven section: make it dead first
  const x = todo[0]!;
  const liveBus = islandLive(sim, x.from) ? x.from : x.to;
  const tp = buildTopology(sim.net);
  const isl = tp.islandOf.get(tp.nodeOf.get(liveBus)!);
  const cb = [ring.ringSwitches[0]!, ring.ringSwitches[ring.ringSwitches.length - 1]!].map((id) => swOf(sim, id))
    .find((c) => c.closed && tp.islandOf.get(tp.nodeOf.get(c.to)!) === isl);
  if (cb) return opStep(cb.id, 'open', 'h3_makeDead', { sw: x.id });
  return opStep(x.id, 'close', 'h3_restore');
}

/**
 * Locate by sectionalising (when indicators cannot tell): split the possible interval at an RMU, energise the
 * source side by trial-closing the feeder breaker. If it holds, the fault is beyond the split; if it trips, before.
 */
function halveStep(sc: Scenario, sim: Simulation, a: Analysis, lo: number, hi: number, opStep: OpStep): Step {
  const ring = a.ring;
  const fed = a.fed ?? 'A';
  const order = fed === 'A' ? ring.ringSwitches : [...ring.ringSwitches].reverse();
  const cb = swOf(sim, order[0]!);
  const k = Math.floor((lo + hi - 1) / 2);
  const split = fed === 'A' ? `${ring.rmus[k]}-R` : `${ring.rmus[k]}-L`;
  if (swOf(sim, split).closed) return opStep(split, 'open', 'h3_split', { site: ring.rmus[k]! });
  const path = order.slice(1, order.indexOf(split)).map((id) => swOf(sim, id)).filter((x) => !x.closed);
  if (path.length) {
    if (cb.closed) return opStep(cb.id, 'open', 'h3_makeDead', { sw: path[0]!.id });
    return opStep(path[0]!.id, 'close', 'h3_deadClose');
  }
  return opStep(cb.id, 'close', 'h3_trial');
}

/** Tier 1 (where to look) and tier 2 (the principle) for the current phase. */
export function lookStep(sc: Scenario, sim: Simulation): Step {
  const a = analyze(sc, sim);
  const fc = sc.fault.cable;
  switch (a.phase) {
    case 'locate': {
      const dead = a.ring.rmus.filter((id) => !sim.isEnergised(`${id}B`));
      return { key: 'h1_locate', params: {}, targets: dead };
    }
    case 'isolate': return { key: 'h1_isolate', params: { cable: a.located ?? fc }, targets: [`cable:${a.located ?? fc}`] };
    case 'restore': {
      const cb = a.ring.ringSwitches.filter((id) => !sim.net.switches.find((x) => x.id === id)!.closed);
      return { key: 'h1_restore', params: {}, targets: cb.map((id) => `sw:${id}`) };
    }
    case 'safe': return { key: 'h1_safe', params: { cable: fc }, targets: [`cable:${fc}`, ...sim.switchesBounding(fc).map((e) => `sw:${e.id}`)] };
    case 'repair': return { key: 'h1_repair', params: { cable: fc }, targets: [`cable:${fc}`] };
    case 'normal': return { key: 'h1_normal', params: {}, targets: [`sw:${a.ring.nop}`] };
    case 'done': return { key: 'h1_done', params: {}, targets: [] };
  }
}

export const principleKey = (sc: Scenario, sim: Simulation) => `h2_${analyze(sc, sim).phase}`;

/** Turn a data-act string into an engine action (null for UI-only acts such as "demo"). */
export function actToAction(act: string): import('../engine/sim').Action | null {
  const p = act.split(':');
  switch (p[0]) {
    case 'advance': return { kind: 'advance' };
    case 'remote': return { kind: 'remote', switch: p[1]!, op: p[2] as 'open' | 'close' };
    case 'crewOp': return { kind: 'crewOp', crew: Number(p[1]), switch: p[2]!, op: p[3] as 'open' | 'close' };
    case 'dispatch': return { kind: 'dispatch', crew: Number(p[1]), site: p[2]! };
    case 'readRemote': return { kind: 'readRemote', site: p[1]! };
    case 'readFpi': return { kind: 'readFpi', crew: Number(p[1]) };
    case 'secure': return { kind: 'secure', crew: Number(p[1]), switch: p[2]!, on: p[3] !== 'off' };
    case 'proveDead': return { kind: 'proveDead', crew: Number(p[1]), switch: p[2]! };
    case 'earth': return { kind: 'earth', crew: Number(p[1]), switch: p[2]!, on: p[3] === 'on' };
    case 'attendDamage': return { kind: 'attendDamage', crew: Number(p[1]) };
    case 'permit': return { kind: 'permit', cable: p[1]!, on: p[2] === 'on' };
    case 'repair': return { kind: 'repair', cable: p[1]! };
    default: return null;
  }
}

/** Inverse of actToAction (used for data-act attributes and the tutorial gate). Justification is ignored. */
export function actOf(a: import('../engine/sim').Action): string {
  switch (a.kind) {
    case 'advance': return 'advance';
    case 'wait': return `wait:${a.minutes}`;
    case 'remote': return `remote:${a.switch}:${a.op}`;
    case 'crewOp': return `crewOp:${a.crew}:${a.switch}:${a.op}`;
    case 'dispatch': return `dispatch:${a.crew}:${a.site}`;
    case 'readRemote': return `readRemote:${a.site}`;
    case 'readFpi': return `readFpi:${a.crew}`;
    case 'secure': return `secure:${a.crew}:${a.switch}${a.on === false ? ':off' : ''}`;
    case 'proveDead': return `proveDead:${a.crew}:${a.switch}`;
    case 'earth': return `earth:${a.crew}:${a.switch}:${a.on ? 'on' : 'off'}`;
    case 'attendDamage': return `attendDamage:${a.crew}`;
    case 'permit': return `permit:${a.cable}:${a.on ? 'on' : 'off'}`;
    case 'repair': return `repair:${a.cable}`;
    case 'standClear': return `standClear:${a.crew}`;
  }
}
