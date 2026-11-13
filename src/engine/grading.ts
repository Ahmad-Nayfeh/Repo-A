import type { Network, CurveId } from './model';
import { shortCircuit, type FaultType } from './shortcircuit';
import { elementTime, type ElementSetting } from './protection';
import { Rng } from './rng';
import { CABLE_3x300AL, TRAFOS } from '../data/params';

/**
 * Grading mode (GDD §3b): incomer (I) → feeder (F) → RMU tee-off breaker (T) → package transformer.
 * Fault currents from the validated short-circuit engine; relay times from the validated IEC curves.
 * Rules: pickup above load [PR-07, PR-23]; T must not trip on 12×In inrush for 100 ms [PR-08]; upstream margin
 * ≥ CTI 0.3 s (verified range 0.25–0.4 s [PR-22]) checked at the maximum through-fault current [PR-23];
 * primary relay clears minimum faults within 2 s [A].
 */
export const CTI_S = 0.3;
export const MAX_CLEAR_S = 2;
export const INRUSH_MULT = 12;
export const INRUSH_S = 0.1;
export const T_OVERLOAD = 1.5;
/** Minimum relay operating time and TMS range — typical numerical-relay values, assumptions [A] (S-F3-07). */
export const MIN_OP_S = 0.04;
export const TMS_MIN = 0.05;

export type RelayKey = 'T' | 'F' | 'I';
export interface RelaySetting { curve: Exclude<CurveId, 'DT' | 'IEEE_MI' | 'IEEE_VI' | 'IEEE_EI' | 'IEC_LTI'>; pickupA: number; tms: number; hsA?: number; hsDelayS?: number }
export type Settings = Record<RelayKey, RelaySetting>;

export interface GradingCase { id: string; where: 'lv' | 'cable' | 'bus'; level: 'max' | 'min'; type: FaultType; iA: number; sees: RelayKey[] }

export interface GradingScenario {
  seed: number;
  skMVA: number; cableKm: number; trafoKVA: number;
  inT: number;          // transformer rated current at 13.8 kV (A)
  feederLoadA: number;  // maximum feeder load incl. full-ring backfeed (A)
  incomerLoadA: number; // incomer maximum load (A) [A]
  cases: GradingCase[];
}

const KV = 13.8;

export function generateGrading(seed: number): GradingScenario {
  const rng = Rng.stream(seed, 'grading');
  const skMVA = Math.round(rng.range(250, 500));            // around the derived 450 MVA [D/A]
  const cableKm = Math.round(rng.range(0.8, 7) * 10) / 10;   // ≤ 7.5 km rule [KSA-02]
  const trafoKVA = rng.pick([500, 1000, 1500]);
  const inT = (trafoKVA * 1000) / (Math.sqrt(3) * KV * 1000);
  const feederLoadA = CABLE_3x300AL.ampacityA;               // full-ring backfeed at rating
  const incomerLoadA = Math.round(rng.range(1800, 2600));    // [A] 67 MVA unit ≈ 2,803 A rated
  const tt = TRAFOS.find((t) => t.id === `T${trafoKVA}`)!;
  const zT = (tt.zPct / 100) * (KV * KV) / (trafoKVA / 1000);
  const xT = zT / Math.sqrt(1 + 1 / (tt.xr * tt.xr)), rT = xT / tt.xr;
  const net: Network = {
    buses: [{ id: 'BUS', kind: 'source', vnKV: KV }, { id: 'RMU', kind: 'rmu', vnKV: KV }, { id: 'LVT', kind: 'node', vnKV: KV }],
    sources: [{ id: 'S', bus: 'BUS', vSetPu: 1, skMVA, rx: 0.07, earthing: { kind: 'resistance', rOhm: (KV * 1000) / Math.sqrt(3) / 1000 }, z0OverZ1: 1 }],
    cableTypes: [CABLE_3x300AL, { ...CABLE_3x300AL, id: 'TX', r20: rT, rOp: rT, x: xT, r0: 1e6, x0: 1e6, c0nF: 0 }],
    cables: [{ id: 'C', from: 'BUS', to: 'RMU', type: CABLE_3x300AL.id, lengthKm: cableKm }, { id: 'T', from: 'RMU', to: 'LVT', type: 'TX', lengthKm: 1 }],
    switches: [], transformerTypes: [], transformers: [], loads: [], fpis: [], relays: [], fMainsHz: 60,
  };
  const sc = (bus: string, type: FaultType, max: boolean) => shortCircuit(net, { bus }, type, { maxCase: max, cFactor: max ? 1.1 : 1.0 }).ikA;
  const cases: GradingCase[] = [];
  for (const level of ['max', 'min'] as const) {
    const type: FaultType = level === 'max' ? '3PH' : 'LL'; // minimum = line-to-line at c_min (common practice) [A]
    cases.push({ id: `lv-${level}`, where: 'lv', level, type, iA: sc('LVT', type, level === 'max'), sees: ['T', 'F', 'I'] });
    cases.push({ id: `cable-${level}`, where: 'cable', level, type, iA: sc('RMU', type, level === 'max'), sees: ['F', 'I'] });
    cases.push({ id: `bus-${level}`, where: 'bus', level, type, iA: sc('BUS', type, level === 'max'), sees: ['I'] });
  }
  return { seed, skMVA, cableKm, trafoKVA, inT, feederLoadA, incomerLoadA, cases };
}

const el = (s: RelaySetting): ElementSetting => ({ curve: s.curve, pickupA: s.pickupA, tms: s.tms, instA: s.hsA, instDelayS: s.hsDelayS });
export const relayTime = (s: RelaySetting, iA: number) => { const t = elementTime(el(s), iA); return Number.isFinite(t) ? Math.max(t, MIN_OP_S) : t; };

export type CheckId = 'load' | 'inrush' | 'primary' | 'cti' | 'noTrip';
export interface CheckResult { id: CheckId; relay: RelayKey; caseId?: string; ok: boolean; value?: number; limit?: number }
export interface Evaluation { checks: CheckResult[]; ok: boolean; scoreS: number; times: Record<string, Partial<Record<RelayKey, number>>> }

export function evaluate(g: GradingScenario, st: Settings): Evaluation {
  const checks: CheckResult[] = [];
  const loads: Record<RelayKey, number> = { T: T_OVERLOAD * g.inT, F: g.feederLoadA, I: g.incomerLoadA };
  for (const k of ['T', 'F', 'I'] as RelayKey[]) checks.push({ id: 'load', relay: k, ok: st[k].pickupA > loads[k], value: st[k].pickupA, limit: loads[k] });
  const tIn = relayTime(st.T, INRUSH_MULT * g.inT);
  checks.push({ id: 'inrush', relay: 'T', ok: tIn > INRUSH_S, value: tIn, limit: INRUSH_S });
  const tInF = relayTime(st.F, INRUSH_MULT * g.inT + g.feederLoadA);
  checks.push({ id: 'inrush', relay: 'F', ok: tInF > INRUSH_S, value: tInF, limit: INRUSH_S });
  const times: Evaluation['times'] = {};
  let score = 0;
  for (const c of g.cases) {
    const tt: Partial<Record<RelayKey, number>> = {};
    for (const k of c.sees) tt[k] = relayTime(st[k], c.iA);
    times[c.id] = tt;
    const primary = c.sees[0]!;
    const tp = tt[primary]!;
    checks.push({ id: 'primary', relay: primary, caseId: c.id, ok: tp <= MAX_CLEAR_S, value: tp, limit: MAX_CLEAR_S });
    score += Number.isFinite(tp) ? tp : 10;
    for (let i = 1; i < c.sees.length; i++) {
      const down = c.sees[i - 1]!, up = c.sees[i]!;
      const margin = tt[up]! - tt[down]!;
      checks.push({ id: 'cti', relay: up, caseId: c.id, ok: margin >= CTI_S - 1e-9 || !Number.isFinite(tt[down]!) && !Number.isFinite(tt[up]!), value: margin, limit: CTI_S });
    }
  }
  return { checks, ok: checks.every((c) => c.ok), scoreS: Math.round(score * 1000) / 1000, times };
}

const CURVES: RelaySetting['curve'][] = ['IEC_SI', 'IEC_VI', 'IEC_EI'];
const TMS_GRID = Array.from({ length: 39 }, (_, i) => Math.round((TMS_MIN + 0.025 * i) * 1000) / 1000); // 0.05 … 1.0

/** Reference grading ("par"): bottom-up grid search — standard practice grades from the most downstream relay. */
export function referenceGrading(g: GradingScenario): { settings: Settings; evaluation: Evaluation } | null {
  const pick = (k: RelayKey, base: number): number[] => [1.1, 1.25, 1.5, 2].map((m) => Math.ceil(base * m));
  const loads: Record<RelayKey, number> = { T: T_OVERLOAD * g.inT, F: g.feederLoadA, I: g.incomerLoadA };
  const chosen: Partial<Settings> = {};
  for (const k of ['T', 'F', 'I'] as RelayKey[]) {
    let best: { s: RelaySetting; score: number } | null = null;
    const hsOptions: (number | undefined)[] = k === 'T' ? [undefined, ...[1.3, 2].map((m) => Math.ceil(m * g.cases.find((c) => c.id === 'lv-max')!.iA))] : [undefined];
    for (const curve of CURVES) for (const pickupA of pick(k, loads[k])) for (const hsA of hsOptions) for (const tms of TMS_GRID) {
      const s: RelaySetting = { curve, pickupA, tms, ...(hsA ? { hsA, hsDelayS: 0.05 } : {}) };
      const trial = { T: chosen.T ?? s, F: chosen.F ?? s, I: chosen.I ?? s, [k]: s } as Settings;
      const ev = evaluate(g, trial);
      const relevant = ev.checks.filter((c) => c.relay === k || (c.id === 'cti' && c.relay === k));
      if (!relevant.every((c) => c.ok)) continue; // try the next (larger) TMS
      const sc = g.cases.filter((c) => c.sees[0] === k).reduce((a, c) => a + (ev.times[c.id]![k] ?? 10), 0);
      if (!best || sc < best.score - 1e-12) best = { s, score: sc };
      break; // smallest passing TMS for this curve/pickup is best
    }
    if (!best) return null;
    chosen[k] = best.s;
  }
  const settings = chosen as Settings;
  return { settings, evaluation: evaluate(g, settings) };
}

/** A starting point for the player: plausible but ungraded settings. */
export function defaultSettings(g: GradingScenario): Settings {
  return {
    T: { curve: 'IEC_SI', pickupA: Math.ceil(2 * g.inT), tms: 0.1 },
    F: { curve: 'IEC_SI', pickupA: Math.ceil(1.25 * g.feederLoadA), tms: 0.1 },
    I: { curve: 'IEC_SI', pickupA: Math.ceil(1.1 * g.incomerLoadA), tms: 0.1 },
  };
}
