import { Simulation, MIN, type Action } from './sim';
import type { Scenario, RingInfo } from './scenario/district';
import { narrowInterval } from './evidence';

/**
 * Reference strategy ("par", GDD §3.7, D3-22) and oracle (lower bound). The reference bot uses only what a
 * player can observe: relay records, FPI readings (remote free; local via crews), trial-close outcomes.
 * SSEN logic [OP-05/06]: positive indication from any FPI, negative only from three-phase FPIs; otherwise halve
 * by customer count; nearest idle crew; earliest legal CB trial close; backfeed via the NOP.
 * The oracle knows the faulted cable and goes straight to isolation.
 */
export interface BotResult { sim: Simulation; actions: Action[]; finished: boolean; steps: number }

export function runBot(scenario: Scenario, opts: { oracle?: boolean; maxSteps?: number } = {}): BotResult {
  const sim = new Simulation(scenario);
  const actions: Action[] = [];
  let steps = 0;
  const maxSteps = opts.maxSteps ?? 4000;
  const act = (a: Action) => { steps++; actions.push(a); return sim.apply(a); };
  const advance = () => act({ kind: 'advance' });
  const waitUntil = (cond: () => boolean) => { while (!cond() && steps < maxSteps) advance(); };

  advance(); // fault → trip
  const rec = sim.relayRecords[0];
  if (!rec) return { sim, actions, finished: false, steps };
  const ring = scenario.rings.find((r) => r.ringSwitches[0] === rec.cb || r.ringSwitches[r.ringSwitches.length - 1] === rec.cb)!;
  const fed = sim.fedFrom(ring)!;
  const sourceCb = fed === 'A' ? ring.ringSwitches[0]! : ring.ringSwitches[ring.ringSwitches.length - 1]!;
  const site = (id: string) => scenario.sites.find((s) => s.id === id)!;
  const sw = (id: string) => sim.net.switches.find((s) => s.id === id)!;

  // ---- helpers ----
  const nearestIdleCrew = (target: string): number => {
    const t = site(target);
    let best = -1, bd = Infinity;
    for (const c of sim.crews) {
      if (c.travellingTo !== null || (c.busyUntil > sim.t)) continue;
      const dx = c.x - t.x, dy = c.y - t.y; const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = c.id; }
    }
    return best;
  };
  const crewTo = (target: string): number => {
    const already = sim.crews.find((c) => c.site === target && c.busyUntil <= sim.t);
    if (already) return already.id;
    let id = nearestIdleCrew(target);
    while (id < 0 && steps < maxSteps) { advance(); id = nearestIdleCrew(target); }
    if (id < 0) return 0;
    act({ kind: 'dispatch', crew: id, site: target });
    waitUntil(() => sim.crews[id]!.site === target);
    return id;
  };
  const crewIdle = (id: number) => waitUntil(() => sim.crews[id]!.busyUntil <= sim.t);
  const clearRing = (except: number | null) => {
    for (const c of sim.crews) {
      if (c.id === except || c.site === null) continue;
      const s = site(c.site);
      if (s.ring === ring.id) { crewIdle(c.id); act({ kind: 'standClear', crew: c.id }); }
    }
  };
  const operate = (id: string, op: 'open' | 'close', needChecklist: boolean): boolean => {
    const s = sw(id);
    if (s.closed === (op === 'close')) return true;
    if (needChecklist && op === 'close') {
      if (sim.tripT !== null) {
        const until = sim.tripT + sim.reenergiseDelayMs();
        if (sim.t < until) act({ kind: 'wait', minutes: Math.ceil((until - sim.t) / MIN) });
      }
    }
    const st = site(s.site);
    const just = op === 'close' ? ('delay' as const) : undefined;
    if (s.remote && st.commsOk && !sim.secured.has(id)) {
      if (op === 'close') clearRing(null);
      const r = act({ kind: 'remote', switch: id, op, justification: just });
      return r.ok;
    }
    const crew = crewTo(s.site);
    if (op === 'close') clearRing(crew);
    const r = act({ kind: 'crewOp', crew, switch: id, op, justification: just });
    if (!r.ok) return false;
    crewIdle(crew);
    return true;
  };
  const customersOf = (k: number) => site(ring.rmus[k]!).customers ?? 0;

  // ---- locate & isolate, verified by a source-side trial close ----
  const suspectIdx = ring.cables.map((c, i) => (sim.suspect.has(c) ? i : -1)).filter((i) => i >= 0);
  let lo = Math.min(...suspectIdx), hi = Math.max(...suspectIdx);
  const faultIdx = ring.cables.indexOf(scenario.fault.cable);
  // relay record: negligible residual ⇒ earth-only FPIs could not have operated, so any lit one is stale
  const noResidual = rec.i3i0A < 0.05 * rec.iMaxA;
  const usable = () => sim.readings.filter((r) => !(noResidual && r.type === 'earth-only'));
  const damageIdx = (): number | null => {
    const d = sim.log.find((l) => l.kind === 'damageReport');
    return d ? ring.cables.indexOf(String(d.data.cable)) : null;
  };
  if (opts.oracle) { lo = hi = faultIdx; }
  else {
    for (let k = 0; k < ring.rmus.length; k++) {
      const s = site(ring.rmus[k]!);
      if (s.remote && s.commsOk && k >= lo - 1 && k <= hi) act({ kind: 'readRemote', site: s.id });
    }
  }
  const readSites = new Set<string>();
  let ignoreFpi = false;
  let f = lo, nearSw = '', farSw = '';
  const ringOrder = fed === 'A' ? ring.ringSwitches : [...ring.ringSwitches].reverse(); // from the source CB outward
  /**
   * Energise the ring from the source CB up to (not including) `stop`: close the path dead, then trial-close the
   * CB through the checklist ("reclose from the same source", OP-05 §13.18). Returns true if it held.
   */
  const energizeTo = (stop: string): boolean => {
    const idx = ringOrder.indexOf(stop);
    const path = ringOrder.slice(1, idx);
    const pathOpen = path.filter((id) => !sw(id).closed);
    if (sw(sourceCb).closed && pathOpen.length === 0) return true;
    if (sw(sourceCb).closed) operate(sourceCb, 'open', false);
    for (const id of path) if (!sw(id).closed) operate(id, 'close', false); // dead switching
    if (!operate(sourceCb, 'close', true)) return false;
    act({ kind: 'wait', minutes: 1 });
    return sw(sourceCb).closed;
  };
  for (let attempt = 0; attempt < 8 && steps < maxSteps; attempt++) {
    let guard = 0;
    while (lo < hi && guard++ < 40 && steps < maxSteps) {
      const di = damageIdx();
      if (di !== null && di >= lo && di <= hi) { lo = hi = di; break; }
      if (!ignoreFpi) {
        const [nl, nh] = narrowInterval(ring, fed, lo, hi, usable());
        if (nl > nh) { ignoreFpi = true; } else { lo = nl; hi = nh; }
        if (lo >= hi) break;
      }
      let total = 0; for (let k = lo; k < hi; k++) total += customersOf(k);
      let best = lo, bestDiff = Infinity, acc = 0;
      const ks = fed === 'A' ? [...Array(hi - lo).keys()].map((i) => lo + i) : [...Array(hi - lo).keys()].map((i) => hi - 1 - i);
      for (const k of ks) { acc += customersOf(k); const d = Math.abs(total / 2 - acc); if (d < bestDiff) { bestDiff = d; best = k; } }
      const mid = ring.rmus[best]!;
      if (!ignoreFpi && !readSites.has(mid) && !(site(mid).remote && site(mid).commsOk)) {
        const crew = crewTo(mid);
        act({ kind: 'readFpi', crew });
        crewIdle(crew);
        readSites.add(mid);
        continue;
      }
      readSites.add(mid);
      const farMid = fed === 'A' ? `${mid}-R` : `${mid}-L`;
      operate(farMid, 'open', false);
      const held = energizeTo(farMid);
      if (!held && sw(sourceCb).closed === false && sim.log.at(-1)?.kind === 'blocked') {
        const d2 = damageIdx();
        if (d2 !== null) { lo = hi = d2; break; }
      }
      if (!held) { if (fed === 'A') hi = best; else lo = best + 1; }
      else { if (fed === 'A') lo = best + 1; else hi = best; }
    }
    f = lo;
    nearSw = fed === 'A' ? (f === 0 ? sourceCb : `${ring.rmus[f - 1]}-R`) : (f === ring.cables.length - 1 ? sourceCb : `${ring.rmus[f]}-L`);
    farSw = fed === 'A' ? (f === ring.cables.length - 1 ? ring.ringSwitches[ring.ringSwitches.length - 1]! : `${ring.rmus[f]}-L`) : (f === 0 ? ring.ringSwitches[0]! : `${ring.rmus[f - 1]}-R`);
    operate(nearSw, 'open', false);
    operate(farSw, 'open', false);
    if (nearSw === sourceCb || energizeTo(nearSw)) break;
    // tripped: the fault is on the source side of the chosen section ⇒ the evidence was misleading
    ignoreFpi = true;
    if (fed === 'A') { hi = f - 1; lo = Math.min(...suspectIdx); } else { lo = f + 1; hi = Math.max(...suspectIdx); }
    if (lo > hi) break;
  }
  // ---- restore the rest by backfeed via the NOP ----
  for (const id of ring.ringSwitches) {
    const s = sw(id);
    if (s.closed || id === nearSw || id === farSw) continue;
    const nTrips = sim.relayRecords.length;
    operate(id, 'close', true);
    act({ kind: 'wait', minutes: 1 });
    const newTrip = sim.relayRecords.slice(nTrips).find((r) => r.iMaxA < 2 * 400);
    if (newTrip) {
      // overload trip of the healthy feeder (relay record shows load-level current): undo the backfeed,
      // then re-energise the tripped feeder after the delay; the far section waits for the repair
      operate(id, 'open', false);
      operate(newTrip.cb, 'close', true);
      break;
    }
  }
  // ---- earth, permit, repair ----
  const cable = ring.cables[f]!;
  for (const id of [nearSw, farSw]) {
    const s = sw(id);
    if (s.kind !== 'LBS') continue;
    const crew = crewTo(s.site);
    act({ kind: 'secure', crew, switch: id });
    act({ kind: 'proveDead', crew, switch: id });
    crewIdle(crew);
    act({ kind: 'earth', crew, switch: id, on: true });
    crewIdle(crew);
  }
  if (sim.damageReported && !sim.damageAttended) {
    const crew = crewTo(sw(nearSw).kind === 'LBS' ? sw(nearSw).site : sw(farSw).site);
    act({ kind: 'attendDamage', crew }); crewIdle(crew);
  }
  act({ kind: 'permit', cable, on: true });
  act({ kind: 'repair', cable });
  waitUntil(() => sim.repairing === null);
  act({ kind: 'permit', cable, on: false });
  for (const id of [nearSw, farSw]) {
    const s = sw(id);
    if (s.kind !== 'LBS' || !s.earthed) continue;
    const crew = crewTo(s.site);
    act({ kind: 'earth', crew, switch: id, on: false });
    act({ kind: 'secure', crew, switch: id, on: false });
    crewIdle(crew);
  }
  // ---- return to normal: break-before-make ----
  operate(ring.nop, 'open', false);
  const order = fed === 'A' ? ring.ringSwitches : [...ring.ringSwitches].reverse();
  for (const id of order) if (id !== ring.nop && !sw(id).closed) operate(id, 'close', false);
  if (!sim.complete) advance();
  return { sim, actions, finished: sim.complete, steps };
}

export type { RingInfo };
export const _MIN = MIN;
