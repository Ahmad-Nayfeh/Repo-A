import type { Network, Switch } from './model';
import { indexById } from './model';
import { buildTopology, type Topology } from './topology';
import { solvePowerFlow, type PowerFlowResult } from './powerflow';
import { shortCircuit, type ShortCircuitResult } from './shortcircuit';
import { RelayState, elementTime } from './protection';
import { Rng, Hasher } from './rng';
import type { Scenario, RingInfo } from './scenario/district';
import { narrowInterval } from './evidence';
import { LOAD_SHAPE_SUMMER, WINTER_FACTOR, COLD_LOAD, OPERATIONS, CABLE_3x300AL, SYSTEM } from '../data/params';

/**
 * Event-driven simulation shared by all modes (ARCHITECTURE §4). Time is integer milliseconds of game time.
 * Physics: power flow on energised islands; short circuit while a fault is energised; relays integrate
 * travel; FPIs latch on current through the sensor. Rules: GDD §3.5 safety model (permit blocks, checklist,
 * damage reports, duty, no paralleling between grid stations).
 */

export const MIN = 60_000;

export type Justification = 'delay' | 'evidence';
export type Action =
  | { kind: 'remote'; switch: string; op: 'open' | 'close'; justification?: Justification }
  | { kind: 'dispatch'; crew: number; site: string }
  | { kind: 'crewOp'; crew: number; switch: string; op: 'open' | 'close'; justification?: Justification }
  | { kind: 'readFpi'; crew: number }
  | { kind: 'secure'; crew: number; switch: string; on?: boolean }
  | { kind: 'earth'; crew: number; switch: string; on: boolean }
  | { kind: 'attendDamage'; crew: number }
  | { kind: 'permit'; cable: string; on: boolean }
  | { kind: 'repair'; cable: string }
  | { kind: 'readRemote'; site: string }
  | { kind: 'standClear'; crew: number }
  | { kind: 'advance' }
  | { kind: 'wait'; minutes: number };

export type LogKind =
  | 'fault' | 'trip' | 'switch' | 'blocked' | 'crewArrive' | 'crewDone' | 'fpiRead' | 'damageReport'
  | 'damageAttended' | 'earth' | 'secure' | 'permit' | 'repairStart' | 'repairDone' | 'delayElapsed'
  | 'overload' | 'undervoltage' | 'calls' | 'complete' | 'screenDamage' | 'dutyUsed';

export interface LogEntry { t: number; kind: LogKind; data: Record<string, string | number | boolean> }

export interface ActionResult { ok: boolean; reason?: string; reasonData?: Record<string, string | number> }

interface Ev { t: number; seq: number; kind: string; data: Record<string, string | number> }

export interface Crew { id: number; x: number; y: number; site: string | null; busyUntil: number; task: string | null; travellingTo: string | null }

export interface FpiState { phase: boolean; earth: boolean; since: number }
export interface FpiReading { site: string; fpi: string; phase: boolean; earth: boolean; type: string; t: number }
export interface RelayRecord { cb: string; t: number; iMaxA: number; i3i0A: number; phases: string; element: 'phase' | 'earth' }

export interface Metrics {
  cmlOfgem: number; cmlIeee: number; ci: number; switchingOps: number; dutyUsed: number;
  overloadMin: number; undervoltageMin: number; nearMisses: number; starEvents: number; timeToPermitMin: number | null;
  customersTotal: number;
}

export class Simulation {
  readonly scenario: Scenario;
  readonly net: Network;
  t = 0;
  private seq = 0;
  private queue: Ev[] = [];
  topo!: Topology;
  pf: PowerFlowResult | null = null;
  sc: ShortCircuitResult | null = null;
  readonly log: LogEntry[] = [];
  readonly crews: Crew[] = [];
  fpi = new Map<string, FpiState>();
  readings: FpiReading[] = [];
  relayRecords: RelayRecord[] = [];
  private relays = new Map<string, RelayState>();
  faultPresent = true;
  faultStartT = 0;
  tripT: number | null = null;
  suspect = new Set<string>();   // cables dead since the fault trip and not proven healthy
  permits = new Set<string>();
  secured = new Set<string>();
  damageReported = false;
  damageAttended = false;
  repairing: string | null = null;
  complete = false;
  private loadOff = new Map<string, number | null>();      // load id → time it went off (null if on)
  private outages = new Map<string, [number, number][]>(); // load id → [off, on] intervals
  private restoredAt = new Map<string, number>();          // for cold-load pickup
  nearMisses = 0;
  starEvents: string[] = [];
  switchingOps = 0;
  dutyUsed = 0;
  overloadMs = 0;
  undervoltageMs = 0;
  firstPermitT: number | null = null;
  private normalState = new Map<string, boolean>();
  private swById: Map<string, Switch>;
  private rng: Rng;
  private lastAccT = 0;

  constructor(scenario: Scenario) {
    this.scenario = scenario;
    this.net = structuredClone(scenario.net);
    this.swById = indexById(this.net.switches);
    this.rng = Rng.stream(scenario.seed, 'sim');
    for (const s of this.net.switches) this.normalState.set(s.id, s.closed);
    for (const r of this.net.relays) this.relays.set(r.switch, new RelayState(r.phase, r.earth));
    for (const f of this.net.fpis) this.fpi.set(f.id, { phase: false, earth: scenario.staleFpis.includes(f.id), since: -1 });
    for (let i = 0; i < scenario.crewCount; i++) this.crews.push({ id: i, x: scenario.crewBase.x, y: scenario.crewBase.y, site: null, busyUntil: 0, task: null, travellingTo: null });
    for (const l of this.net.loads) { this.loadOff.set(l.id, null); this.outages.set(l.id, []); }
    this.recompute();
    // fault inception at t = 0 (scenario starts when the fault happens)
    this.log.push({ t: 0, kind: 'fault', data: {} });
    this.onTopologyOrFaultChange();
    if (scenario.fault.damageReportAtMin !== null) this.push(scenario.fault.damageReportAtMin * MIN, 'damageReport', {});
    this.push(10 * MIN, 'calls', {});
    for (let h = 15; h <= 48 * 60; h += 15) this.push(h * MIN, 'tick', {});
  }

  // ---------- time & events ----------
  hourOfDay(t = this.t): number { return (this.scenario.startHour + t / (60 * MIN)) % 24; }
  private push(t: number, kind: string, data: Record<string, string | number>) {
    this.queue.push({ t, seq: this.seq++, kind, data });
    this.queue.sort((a, b) => a.t - b.t || a.seq - b.seq);
  }
  private nextEvent(): Ev | undefined { return this.queue[0]; }

  /** Advance until the next player-relevant event (or `untilT`). */
  advance(untilT?: number): void {
    const quiet = new Set(['tick']);
    // "advance to next event" never skips more than 2 h of quiet time (ticks only)
    if (untilT === undefined) {
      const next = this.queue.find((e) => !quiet.has(e.kind));
      if (!next || next.t > this.t + 120 * MIN) { this.advance(this.t + 120 * MIN); return; }
    }
    for (let guard = 0; guard < 10000; guard++) {
      const ev = this.nextEvent();
      if (!ev) break;
      if (untilT !== undefined && ev.t > untilT) break;
      this.queue.shift();
      this.accumulate(ev.t);
      this.t = ev.t;
      this.handle(ev);
      if (untilT === undefined && !quiet.has(ev.kind)) break;
    }
    if (untilT !== undefined) { this.accumulate(untilT); this.t = Math.max(this.t, untilT); }
  }

  private accumulate(toT: number) {
    if (toT <= this.lastAccT || !this.pf) { this.lastAccT = Math.max(this.lastAccT, toT); return; }
    const dt = toT - this.lastAccT;
    const rating = this.scenario.groundTempC === 40 ? CABLE_3x300AL.ampacity40C : CABLE_3x300AL.ampacityA;
    let over = false;
    for (const a of this.pf.cableA.values()) if (a > rating) over = true;
    if (over) this.overloadMs += dt;
    let under = false;
    const vmin = SYSTEM.serviceBandKV.value[0] / SYSTEM.mvKV.value;
    for (const b of this.net.buses) if (b.kind !== 'lv' && b.kind !== 'source') { const v = this.pf.vPu.get(b.id)!; if (v > 0.05 && v < vmin) under = true; }
    if (under) this.undervoltageMs += dt;
    this.lastAccT = toT;
  }

  private handle(ev: Ev) {
    switch (ev.kind) {
      case 'trip': this.doTrip(String(ev.data.cb), ev.data.element as 'phase' | 'earth'); break;
      case 'crewArrive': {
        const c = this.crews[Number(ev.data.crew)]!;
        c.site = String(ev.data.site); c.travellingTo = null; c.task = null;
        const s = this.scenario.sites.find((x) => x.id === c.site)!;
        c.x = s.x; c.y = s.y;
        this.log.push({ t: this.t, kind: 'crewArrive', data: { crew: c.id, site: c.site } });
        break;
      }
      case 'crewDone': this.finishCrewTask(ev); break;
      case 'damageReport': this.damageReported = true; this.log.push({ t: this.t, kind: 'damageReport', data: { cable: this.scenario.fault.cable } }); break;
      case 'calls': this.log.push({ t: this.t, kind: 'calls', data: {} }); break;
      case 'delayElapsed': this.log.push({ t: this.t, kind: 'delayElapsed', data: {} }); break;
      case 'repairDone': {
        this.repairing = null;
        if (String(ev.data.cable) === this.scenario.fault.cable) this.faultPresent = false;
        this.suspect.delete(String(ev.data.cable)); // repaired and tested before return to service
        this.log.push({ t: this.t, kind: 'repairDone', data: { cable: String(ev.data.cable) } });
        break;
      }
      case 'tick': this.recompute(); this.scheduleProtection(); this.checkComplete(); break;
    }
  }

  // ---------- physics ----------
  private loadMultiplier(loadId: string): number {
    const h = this.hourOfDay();
    const shape = LOAD_SHAPE_SUMMER.value;
    const i0 = Math.floor(h) % 24, i1 = (i0 + 1) % 24, f = h - Math.floor(h);
    let m = shape[i0]! * (1 - f) + shape[i1]! * f;
    if (!this.scenario.summer) m *= WINTER_FACTOR.value;
    const r = this.restoredAt.get(loadId);
    if (r !== undefined) {
      const since = (this.t - r) / MIN;
      if (since < COLD_LOAD.decayMin.value) m *= 1 + (COLD_LOAD.multiplier.value - 1) * (1 - since / COLD_LOAD.decayMin.value);
    }
    return m;
  }

  /** Recompute topology, energisation, power flow (fault-free islands) and outage bookkeeping. */
  private recompute() {
    this.topo = buildTopology(this.net);
    const loads = new Map<string, { p: number; q: number }>();
    for (const l of this.net.loads) { const m = this.loadMultiplier(l.id); loads.set(l.id, { p: l.pPeakMW * m, q: l.qPeakMvar * m }); }
    this.pf = solvePowerFlow(this.net, this.topo, loads);
    for (const l of this.net.loads) {
      const on = this.isEnergised(l.bus);
      const off = this.loadOff.get(l.id)!;
      if (on && off !== null) {
        this.outages.get(l.id)!.push([off, this.t]);
        this.loadOff.set(l.id, null);
        if (this.t - off >= COLD_LOAD.afterOutageMin.value * MIN) this.restoredAt.set(l.id, this.t);
      } else if (!on && off === null) this.loadOff.set(l.id, this.t);
    }
    // FPIs reset on voltage return (vendor "voltage reset" feature [P-05]); stale ones do not
    for (const f of this.net.fpis) {
      const st = this.fpi.get(f.id)!;
      if ((st.phase || st.earth) && st.since >= 0 && this.isEnergised(f.atBus) && !this.faultEnergised() && !this.scenario.staleFpis.includes(f.id)) {
        if (this.t - st.since > 1000) { st.phase = false; st.earth = false; st.since = -1; }
      }
    }
  }

  isEnergised(busId: string): boolean {
    const n = this.topo.nodeOf.get(busId);
    if (n === undefined) return false;
    return this.topo.islands[this.topo.islandOf.get(n)!]!.energised;
  }

  cableEnergised(cableId: string): boolean {
    const c = this.net.cables.find((x) => x.id === cableId)!;
    return this.isEnergised(c.from) || this.isEnergised(c.to);
  }

  faultEnergised(): boolean { return this.faultPresent && this.cableEnergised(this.scenario.fault.cable); }

  /** After switching or fault change: short circuit, FPIs, relay scheduling. */
  private onTopologyOrFaultChange() {
    this.recompute();
    this.sc = null;
    if (this.faultEnergised()) {
      const f = this.scenario.fault;
      this.sc = shortCircuit(this.net, { cable: f.cable, frac: f.frac }, f.type, { cFactor: 1.0, maxCase: false, zfOhm: f.rfOhm });
      // FPIs latch on current through the sensor (fault lasts ≥ breaker time > minimum duration)
      for (const fp of this.net.fpis) {
        let seg = fp.cable;
        if (fp.cable === f.cable) {
          const cab = this.net.cables.find((c) => c.id === fp.cable)!;
          seg = fp.atBus === cab.from ? fp.cable : `${fp.cable}#2`;
        }
        const bf = this.sc.cables.get(seg);
        if (!bf) continue;
        const st = this.fpi.get(fp.id)!;
        const ph = fp.type === 'three-phase' && bf.iMax > fp.phasePickupA;
        const ea = bf.i3i0 > fp.earthPickupA;
        if (ph || ea) { st.phase = st.phase || ph; st.earth = st.earth || ea; st.since = this.t; }
      }
      // conductor/screen thermal check for the clearing time is evaluated at trip
    }
    this.scheduleProtection();
  }

  /** Schedule the earliest relay trip for the current conditions (fault or overload). */
  private protT = 0;
  private protI = new Map<string, [number, number]>();

  private scheduleProtection() {
    this.queue = this.queue.filter((e) => e.kind !== 'trip');
    // carry relay travel across reschedules using the currents that applied since the last schedule
    const dtS = (this.t - this.protT) / 1000;
    for (const [cbId, [ip, i0]] of this.protI) {
      const cbSw = this.swById.get(cbId)!;
      const st = this.relays.get(cbId)!;
      if (cbSw.closed && dtS > 0) st.advance(dtS, ip, i0); else if (!cbSw.closed) st.reset();
    }
    this.protT = this.t;
    this.protI.clear();
    let best: { t: number; cb: string; element: 'phase' | 'earth' } | null = null;
    for (const r of this.net.relays) {
      const cb = this.swById.get(r.switch)!;
      if (!cb.closed) continue;
      let iPh = 0, i0 = 0;
      const cableId = this.scenario.rings.find((rg) => rg.ringSwitches[0] === cb.id || rg.ringSwitches[rg.ringSwitches.length - 1] === cb.id)!;
      const firstCable = cableId.ringSwitches[0] === cb.id ? cableId.cables[0]! : cableId.cables[cableId.cables.length - 1]!;
      if (this.sc) {
        const seg = this.sc.cables.get(firstCable) ?? this.sc.cables.get(`${firstCable}#2`);
        if (seg) { iPh = seg.iMax; i0 = seg.i3i0; }
      } else if (this.pf) {
        iPh = this.pf.cableA.get(firstCable) ?? 0;
      }
      const st = this.relays.get(cb.id)!;
      this.protI.set(cb.id, [iPh, i0]);
      const tt = st.timeToOperate(iPh, i0);
      if (tt === Infinity) continue;
      const tp0 = elementTime(r.phase, iPh);
      const tp = tp0 === Infinity ? Infinity : (1 - st.phaseTravel) * tp0;
      const element: 'phase' | 'earth' = tp <= tt + 1e-12 ? 'phase' : 'earth';
      const t = this.t + Math.max(1, Math.round((tt + r.breakerOpenS) * 1000));
      if (!best || t < best.t) best = { t, cb: cb.id, element };
    }
    if (best) this.push(best.t, 'trip', { cb: best.cb, element: best.element });
  }

  private doTrip(cbId: string, element: 'phase' | 'earth') {
    const cb = this.swById.get(cbId)!;
    if (!cb.closed) return;
    const seg = this.sc ? (this.sc.cables.get(this.firstCableOf(cbId)) ?? null) : null;
    const iMax = seg ? seg.iMax : (this.pf?.cableA.get(this.firstCableOf(cbId)) ?? 0);
    const i3i0 = seg ? seg.i3i0 : 0;
    const phases = seg ? (['a', 'b', 'c'] as const).filter((p) => (p === 'a' ? seg.ia : p === 'b' ? seg.ib : seg.ic) > 0.25 * seg.iMax).join('') : 'abc';
    this.relayRecords.push({ cb: cbId, t: this.t, iMaxA: iMax, i3i0A: i3i0, phases, element });
    // screen I²t check on the faulted cable for SLG/DLG (earth current flows in the screens) [D3 / R1-07]
    if (this.sc && i3i0 > 0) {
      const tClear = (this.t - this.lastEnergiseT) / 1000;
      const ik = this.sc.earthCurrentA / 1000;
      const allowed = CABLE_3x300AL.screenIk1s_kA / Math.sqrt(Math.max(tClear, 1e-3));
      if (ik > allowed) { this.log.push({ t: this.t, kind: 'screenDamage', data: { cable: this.scenario.fault.cable, kA: Math.round(ik * 10) / 10 } }); }
    }
    cb.closed = false;
    cb.faultMakeLeft = Math.max(0, cb.faultMakeLeft - 1);
    this.relays.get(cbId)!.reset();
    this.log.push({ t: this.t, kind: 'trip', data: { cb: cbId, element, iA: Math.round(iMax), i0A: Math.round(i3i0) } });
    this.tripT = this.t;
    // cables that lose supply because of the trip become suspect
    const before = new Set(this.net.cables.filter((c) => this.cableEnergised(c.id)).map((c) => c.id));
    this.onTopologyOrFaultChange();
    for (const c of before) if (!this.cableEnergised(c)) this.suspect.add(c);
    this.queue = this.queue.filter((e) => e.kind !== 'delayElapsed');
    this.push(this.t + this.reenergiseDelayMs(), 'delayElapsed', {});
  }

  private lastEnergiseT = 0;

  private firstCableOf(cbId: string): string {
    const rg = this.scenario.rings.find((r) => r.ringSwitches[0] === cbId || r.ringSwitches[r.ringSwitches.length - 1] === cbId)!;
    return rg.ringSwitches[0] === cbId ? rg.cables[0]! : rg.cables[rg.cables.length - 1]!;
  }

  reenergiseDelayMs(atT = this.tripT ?? this.t): number {
    const h = this.hourOfDay(atT);
    const [ns, ne] = OPERATIONS.nightWindow.value;
    const night = h >= ns || h < ne;
    return (night ? OPERATIONS.reenergiseDelayNightMin.value : OPERATIONS.reenergiseDelayDayMin.value) * MIN;
  }

  // ---------- evidence ----------
  /** Cables proven healthy by player-known evidence (FPI readings) relative to the fault-time feed path. */
  provenHealthy(cableId: string): boolean {
    if (!this.suspect.has(cableId)) return true;
    const ring = this.scenario.rings.find((r) => r.cables.includes(cableId));
    if (!ring) return false;
    const fed = this.fedFrom(ring);
    if (!fed) return false;
    const idxs = ring.cables.map((c, i) => (this.suspect.has(c) ? i : -1)).filter((i) => i >= 0);
    const [lo, hi] = narrowInterval(ring, fed, Math.min(...idxs), Math.max(...idxs), this.readings);
    if (lo > hi) return false; // contradictory evidence proves nothing
    const idx = ring.cables.indexOf(cableId);
    return idx < lo || idx > hi;
  }

  /** Side from which the ring was feeding the fault (first trip on that ring). */
  fedFrom(ring: RingInfo): 'A' | 'B' | null {
    const r = this.relayRecords.find((x) => x.cb === ring.ringSwitches[0] || x.cb === ring.ringSwitches[ring.ringSwitches.length - 1]);
    if (!r) return null;
    return r.cb === ring.ringSwitches[0] ? 'A' : 'B';
  }

  // ---------- actions ----------
  apply(a: Action): ActionResult {
    if (this.complete && a.kind !== 'advance') return { ok: false, reason: 'complete' };
    switch (a.kind) {
      case 'advance': this.advance(); return { ok: true };
      case 'readRemote': return this.readRemoteFpis(a.site);
      case 'standClear': {
        // crew leaves the substation but stays nearby (positively excluded, OP-05 §13.15); re-entry is quick
        const c = this.crewAt(a.crew); if (!c) return { ok: false, reason: 'crewNotOnSite' };
        c.site = null; c.task = 'clear';
        return { ok: true };
      }
      case 'wait': this.advance(this.t + a.minutes * MIN); return { ok: true };
      case 'remote': {
        const s = this.swById.get(a.switch);
        if (!s) return { ok: false, reason: 'unknown' };
        const site = this.scenario.sites.find((x) => x.id === s.site)!;
        if (!s.remote) return { ok: false, reason: 'notRemote' };
        if (!site.commsOk) return { ok: false, reason: 'commsLost' };
        if (this.secured.has(s.id)) return this.block('secured', { switch: s.id });
        return this.operate(s, a.op, a.justification, null, OPERATIONS.remoteOpMin.value * MIN);
      }
      case 'dispatch': {
        const c = this.crews[a.crew];
        if (!c) return { ok: false, reason: 'unknown' };
        if (c.busyUntil > this.t) return { ok: false, reason: 'crewBusy' };
        const s = this.scenario.sites.find((x) => x.id === a.site)!;
        const dx = s.x - c.x, dy = s.y - c.y;
        const km = Math.sqrt(dx * dx + dy * dy) * 0.1 * OPERATIONS.roadFactor.value;
        const h = this.hourOfDay();
        const night = h >= 22 || h < 6;
        const speed = night ? OPERATIONS.crewSpeedNightKmh.value : OPERATIONS.crewSpeedDayKmh.value;
        const dispatch = c.site === null && c.task === null && this.log.every((l) => !(l.kind === 'crewArrive' && l.data.crew === c.id)) ? OPERATIONS.crewDispatchMin.value : 0;
        const dt = Math.round((dispatch + (km / speed) * 60) * MIN);
        c.site = null; c.travellingTo = s.id; c.busyUntil = this.t + dt; c.task = 'travel';
        this.push(this.t + dt, 'crewArrive', { crew: c.id, site: s.id });
        return { ok: true };
      }
      case 'crewOp': {
        const c = this.crewAt(a.crew); if (!c) return { ok: false, reason: 'crewNotOnSite' };
        const s = this.swById.get(a.switch);
        if (!s || s.site !== c.site) return { ok: false, reason: 'wrongSite' };
        return this.operate(s, a.op, a.justification, c.id, OPERATIONS.manualOpMin.value * MIN);
      }
      case 'readFpi': {
        const c = this.crewAt(a.crew); if (!c) return { ok: false, reason: 'crewNotOnSite' };
        this.busy(c, OPERATIONS.fpiReadMin.value * MIN, 'readFpi', { site: c.site! });
        return { ok: true };
      }
      case 'secure': {
        const c = this.crewAt(a.crew); if (!c) return { ok: false, reason: 'crewNotOnSite' };
        const s = this.swById.get(a.switch);
        if (!s || s.site !== c.site) return { ok: false, reason: 'wrongSite' };
        if (a.on === false) {
          if (s.earthed) return this.block('earthStillOn', { switch: s.id });
          this.secured.delete(s.id);
          this.log.push({ t: this.t, kind: 'secure', data: { switch: s.id, on: false } });
          return { ok: true };
        }
        if (s.closed) return this.block('secureClosed', { switch: s.id });
        this.secured.add(s.id);
        this.log.push({ t: this.t, kind: 'secure', data: { switch: s.id, on: true } });
        return { ok: true };
      }
      case 'earth': {
        const c = this.crewAt(a.crew); if (!c) return { ok: false, reason: 'crewNotOnSite' };
        const s = this.swById.get(a.switch);
        if (!s || s.site !== c.site || s.kind !== 'LBS') return { ok: false, reason: 'wrongSite' };
        if (a.on) {
          if (s.closed) return this.block('interlock', { switch: s.id }); // per-panel interlock (IEC 62271-200)
          if (!this.secured.has(s.id)) return this.block('notSecured', { switch: s.id });
          const cableBus = this.cableSideBus(s);
          if (this.isEnergised(cableBus)) return this.block('liveCable', { switch: s.id });
          s.earthed = true;
          this.busy(c, 5 * MIN, 'earth', { switch: s.id });
        } else {
          if (this.permitsOnCable(this.cableOfSwitch(s))) return this.block('permitOpen', { switch: s.id });
          s.earthed = false;
        }
        this.log.push({ t: this.t, kind: 'earth', data: { switch: s.id, on: a.on } });
        return { ok: true };
      }
      case 'attendDamage': {
        const c = this.crewAt(a.crew); if (!c) return { ok: false, reason: 'crewNotOnSite' };
        const cab = this.scenario.fault.cable;
        if (!this.siteTouchesCable(c.site!, cab)) return { ok: false, reason: 'wrongSite' };
        this.busy(c, OPERATIONS.attendDamageMin.value * MIN, 'attendDamage', {});
        return { ok: true };
      }
      case 'permit': {
        if (a.on) {
          const ends = this.switchesBounding(a.cable);
          if (!ends.every((s) => !s.closed && s.earthed && this.secured.has(s.id))) return this.block('permitNotReady', { cable: a.cable });
          this.permits.add(a.cable);
          if (this.firstPermitT === null) this.firstPermitT = this.t;
        } else {
          if (this.repairing === a.cable) return this.block('repairOngoing', { cable: a.cable });
          this.permits.delete(a.cable);
        }
        this.log.push({ t: this.t, kind: 'permit', data: { cable: a.cable, on: a.on } });
        return { ok: true };
      }
      case 'repair': {
        if (!this.permits.has(a.cable)) return this.block('noPermit', { cable: a.cable });
        if (this.repairing) return { ok: false, reason: 'repairOngoing' };
        const [lo, hi] = OPERATIONS.repairHours.value;
        const hrs = lo + (hi - lo) * Rng.stream(this.scenario.seed, 'repair').next();
        this.repairing = a.cable;
        this.log.push({ t: this.t, kind: 'repairStart', data: { cable: a.cable } });
        if (a.cable === this.scenario.fault.cable) this.push(this.t + Math.round(hrs * 60) * MIN, 'repairDone', { cable: a.cable });
        else this.push(this.t + 30 * MIN, 'repairDone', { cable: a.cable }); // nothing found
        return { ok: true };
      }
    }
  }

  private crewAt(id: number): Crew | null {
    const c = this.crews[id];
    if (!c || c.site === null || c.busyUntil > this.t) return null;
    return c;
  }

  private busy(c: Crew, dt: number, task: string, data: Record<string, string>) {
    c.busyUntil = this.t + dt; c.task = task;
    this.push(this.t + dt, 'crewDone', { crew: c.id, task, ...data });
  }

  private finishCrewTask(ev: Ev) {
    const c = this.crews[Number(ev.data.crew)]!;
    const task = String(ev.data.task);
    c.task = null;
    if (task === 'readFpi') {
      for (const f of this.net.fpis.filter((x) => x.site === c.site)) {
        const st = this.fpi.get(f.id)!;
        this.readings.push({ site: c.site!, fpi: f.id, phase: st.phase, earth: st.earth, type: f.type, t: this.t });
      }
      this.log.push({ t: this.t, kind: 'fpiRead', data: { crew: c.id, site: c.site! } });
    } else if (task === 'attendDamage') {
      this.damageAttended = true;
      this.log.push({ t: this.t, kind: 'damageAttended', data: { crew: c.id } });
    } else if (task === 'operate') {
      this.finishOperate(String(ev.data.switch), String(ev.data.op) as 'open' | 'close', Number(ev.data.opCrew));
    } else {
      this.log.push({ t: this.t, kind: 'crewDone', data: { crew: c.id, task } });
    }
  }

  /** Remote FPI read (instant) for automated sites with comms. */
  readRemoteFpis(site: string): ActionResult {
    const s = this.scenario.sites.find((x) => x.id === site)!;
    if (!s.remote) return { ok: false, reason: 'notRemote' };
    if (!s.commsOk) return { ok: false, reason: 'commsLost' };
    for (const f of this.net.fpis.filter((x) => x.site === site)) {
      const st = this.fpi.get(f.id)!;
      this.readings.push({ site, fpi: f.id, phase: st.phase, earth: st.earth, type: f.type, t: this.t });
    }
    this.log.push({ t: this.t, kind: 'fpiRead', data: { site, remote: true } });
    return { ok: true };
  }

  private block(reason: string, data: Record<string, string | number>): ActionResult {
    this.nearMisses++;
    this.log.push({ t: this.t, kind: 'blocked', data: { reason, ...data } });
    return { ok: false, reason, reasonData: data };
  }

  // switching
  private operate(s: Switch, op: 'open' | 'close', just: Justification | undefined, crew: number | null, durMs: number): ActionResult {
    if (op === 'open') {
      if (!s.closed) return { ok: false, reason: 'already' };
    } else {
      if (s.closed) return { ok: false, reason: 'already' };
      const chk = this.checkClose(s, just, crew);
      if (!chk.ok) return chk;
    }
    if (crew !== null) {
      this.busy(this.crews[crew]!, durMs, 'operate', { switch: s.id, op, opCrew: String(crew) });
    } else {
      // remote command executes after the remote operating time
      this.advance(this.t + durMs);
      this.finishOperate(s.id, op, null);
    }
    return { ok: true };
  }

  private finishOperate(swId: string, op: 'open' | 'close', crew: number | null) {
    const s = this.swById.get(swId)!;
    if (op === 'close') {
      // re-check at execution time
      if (s.closed) return;
      const chk = this.checkClose(s, 'delay', crew, true);
      if (!chk.ok) { this.log.push({ t: this.t, kind: 'blocked', data: { reason: chk.reason ?? 'blocked', switch: swId } }); return; }
    }
    const beforeE = new Set(this.net.cables.filter((c) => this.cableEnergised(c.id)).map((c) => c.id));
    const faultWasEnergised = this.faultEnergised();
    s.closed = op === 'close';
    this.switchingOps++;
    this.log.push({ t: this.t, kind: 'switch', data: { switch: swId, op } });
    if (op === 'close') {
      this.recompute();
      if (!faultWasEnergised && this.faultEnergised()) {
        // closed onto the fault: device duty used
        s.faultMakeLeft = Math.max(0, s.faultMakeLeft - 1);
        this.dutyUsed++;
        this.log.push({ t: this.t, kind: 'dutyUsed', data: { switch: swId, left: s.faultMakeLeft } });
        if (this.damageReported && !this.damageAttended) this.starEvents.push('energisedDamage');
        if (s.faultMakeLeft < 0) this.starEvents.push('dutyExceeded');
      }
      this.lastEnergiseT = this.t;
      // cables energised successfully stop being suspect once the fault is not on them (checked after protection runs)
    }
    this.onTopologyOrFaultChange();
    if (op === 'close') {
      for (const c of this.net.cables) if (this.cableEnergised(c.id) && !beforeE.has(c.id) && !(this.faultPresent && c.id === this.scenario.fault.cable)) this.suspect.delete(c.id);
    }
    this.checkComplete();
  }

  /** Gates for closing a switch (GDD §3.5). */
  checkClose(s: Switch, just: Justification | undefined, crew: number | null, silent = false): ActionResult {
    const fail = (reason: string, data: Record<string, string | number> = {}): ActionResult => (silent ? { ok: false, reason } : this.block(reason, { switch: s.id, ...data }));
    if (s.earthed) return fail('interlock');
    if (this.secured.has(s.id)) return fail('secured');
    if (s.fuseBlown) return fail('fuseBlown');
    // simulate the close
    s.closed = true;
    const topo = buildTopology(this.net);
    s.closed = false;
    const energisedAfter = (bus: string) => { const n = topo.nodeOf.get(bus)!; return topo.islands[topo.islandOf.get(n)!]!; };
    // paralleling two grid stations (break-before-make default [A], D3-16)
    {
      const a = this.topo.islands[this.topo.islandOf.get(this.topo.nodeOf.get(s.from)!)!]!;
      const b = this.topo.islands[this.topo.islandOf.get(this.topo.nodeOf.get(s.to)!)!]!;
      if (a !== b && a.energised && b.energised) return fail('parallel');
    }
    // permit / earth block: any earthed panel's cable or permitted cable becoming energised
    for (const e of this.net.switches.filter((x) => x.earthed)) {
      if (energisedAfter(this.cableSideBus(e)).energised) return fail('permitBlock', { earthAt: e.id });
    }
    for (const pc of this.permits) {
      const cab = this.net.cables.find((c) => c.id === pc)!;
      if (energisedAfter(cab.from).energised || energisedAfter(cab.to).energised) return fail('permitBlock', { cable: pc });
    }
    // newly energised suspect cables ⇒ checklist
    const newly = this.net.cables.filter((c) => !this.cableEnergised(c.id) && (energisedAfter(c.from).energised || energisedAfter(c.to).energised)).map((c) => c.id);
    const unproven = newly.filter((c) => !this.provenHealthy(c));
    if (unproven.length > 0) {
      if (this.damageReported && !this.damageAttended && unproven.includes(this.scenario.fault.cable)) return fail('damageBlock');
      if (just === undefined) return fail('needChecklist', { cables: unproven.length });
      if (just === 'delay' && this.tripT !== null && this.t < this.tripT + this.reenergiseDelayMs()) return fail('delayNotElapsed', { leftMin: Math.ceil((this.tripT + this.reenergiseDelayMs() - this.t) / MIN) });
      if (just === 'evidence') return fail('evidenceInsufficient');
      // crews must be clear of substations on this circuit, except the operating crew [OP-05 §13.15]
      const ringIds = new Set(unproven.map((c) => this.scenario.rings.find((r) => r.cables.includes(c))!.id));
      for (const c of this.crews) {
        if (c.id === crew) continue;
        const site = c.site ? this.scenario.sites.find((x) => x.id === c.site) : undefined;
        if (site && site.ring && ringIds.has(site.ring)) return fail('crewsNotClear', { crew: c.id, site: site.id });
      }
      if (s.faultMakeLeft <= 0) return fail('dutyExhausted');
    }
    return { ok: true };
  }

  private cableSideBus(s: Switch): string {
    // ring LBS: L connects cable-side bus `…L` to busbar `…B`; R connects busbar to cable-side `…R`
    return s.id.endsWith('-L') ? s.from : s.to;
  }
  private cableOfSwitch(s: Switch): string {
    const bus = this.cableSideBus(s);
    return this.net.cables.find((c) => c.from === bus || c.to === bus)!.id;
  }
  private permitsOnCable(cab: string): boolean { return this.permits.has(cab); }
  switchesBounding(cableId: string): Switch[] {
    const cab = this.net.cables.find((c) => c.id === cableId)!;
    const ends = [cab.from, cab.to];
    return this.net.switches.filter((s) => s.kind !== 'FUSE_SWITCH' && ends.some((b) => s.from === b || s.to === b));
  }
  private siteTouchesCable(site: string, cableId: string): boolean {
    return this.switchesBounding(cableId).some((s) => s.site === site);
  }

  // ---------- completion & metrics ----------
  private checkComplete() {
    if (this.complete || this.faultPresent || this.repairing) return;
    const normal = this.net.switches.every((s) => s.closed === this.normalState.get(s.id));
    const noEarth = this.net.switches.every((s) => !s.earthed) && this.permits.size === 0;
    const allOn = this.net.loads.every((l) => this.isEnergised(l.bus));
    if (normal && noEarth && allOn) {
      this.complete = true;
      this.log.push({ t: this.t, kind: 'complete', data: {} });
    }
  }

  /** Customer-minutes with a sustained-interruption threshold; Ofgem merges restorations shorter than the threshold. */
  private cml(thresholdMin: number, mergeShortRestorations: boolean): { cml: number; ci: number } {
    let cml = 0, ci = 0;
    const thr = thresholdMin * MIN;
    for (const l of this.net.loads) {
      const iv = [...this.outages.get(l.id)!];
      const off = this.loadOff.get(l.id);
      if (off !== null && off !== undefined) iv.push([off, this.t]);
      const merged: [number, number][] = [];
      for (const [a, b] of iv) {
        const last = merged[merged.length - 1];
        if (mergeShortRestorations && last && a - last[1] < thr) last[1] = b; // short restoration ignored [OP-02 §2.27]
        else merged.push([a, b]);
      }
      let interrupted = false;
      for (const [a, b] of merged) {
        const d = b - a;
        if (d >= thr) { cml += (l.customers * d) / MIN; interrupted = true; }
      }
      if (interrupted) ci += l.customers;
    }
    return { cml, ci };
  }

  metrics(): Metrics {
    const of = this.cml(OPERATIONS.ofgemThresholdMin.value, true);
    const ie = this.cml(OPERATIONS.ieeeThresholdMin.value + 1e-9, false);
    return {
      cmlOfgem: Math.round(of.cml), cmlIeee: Math.round(ie.cml), ci: of.ci, switchingOps: this.switchingOps,
      dutyUsed: this.dutyUsed, overloadMin: Math.round(this.overloadMs / MIN), undervoltageMin: Math.round(this.undervoltageMs / MIN),
      nearMisses: this.nearMisses, starEvents: this.starEvents.length,
      timeToPermitMin: this.firstPermitT === null ? null : Math.round(this.firstPermitT / MIN),
      customersTotal: this.net.loads.reduce((a, l) => a + l.customers, 0),
    };
  }

  /** Customers currently off supply. */
  customersOff(): number {
    return this.net.loads.filter((l) => !this.isEnergised(l.bus)).reduce((a, l) => a + l.customers, 0);
  }

  hash(): string {
    const h = new Hasher();
    h.num(this.t);
    for (const s of this.net.switches) h.str(s.id).num(s.closed ? 1 : 0).num(s.earthed ? 1 : 0).num(s.faultMakeLeft);
    for (const c of this.crews) h.num(c.x).num(c.y).num(c.busyUntil).str(c.site ?? '-');
    for (const l of this.log) h.num(l.t).str(l.kind);
    if (this.pf) for (const [k, v] of this.pf.vPu) h.str(k).num(v);
    const m = this.metrics();
    h.num(m.cmlOfgem).num(m.cmlIeee);
    return h.digest();
  }
}

