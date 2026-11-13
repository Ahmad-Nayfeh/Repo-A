import { pow } from './math/dmath';
import type { CurveId } from './model';

/**
 * Overcurrent protection (FIDELITY F3).
 * Inverse-time: t = TMS · (k / (M^α − 1) + c), M = I/Is, capped at M = 20 (constant time above).
 * Constants: IEC 60255-151 SI/VI/EI/LTI and IEEE C37.112 MI/VI/EI — research/03 §1.3 [PR-01,02,05,07], verified.
 * Time-varying current: travel integral ∫ dt / t(M) reaching 1 ⇒ operate. v1 reset: instantaneous (IEC-style
 * electronic relays; IEEE disc-emulation reset TR/(M²−1) is v1.x).
 */
export interface CurveConst { k: number; c: number; alpha: number; tr: number; src: string }

export const CURVES: Record<Exclude<CurveId, 'DT'>, CurveConst> = {
  IEC_SI: { k: 0.14, c: 0, alpha: 0.02, tr: 0, src: 'PR-01,PR-02,PR-05,PR-07' },
  IEC_VI: { k: 13.5, c: 0, alpha: 1, tr: 0, src: 'PR-01,PR-02,PR-05,PR-07' },
  IEC_EI: { k: 80, c: 0, alpha: 2, tr: 0, src: 'PR-01,PR-02,PR-05,PR-07' },
  IEC_LTI: { k: 120, c: 0, alpha: 1, tr: 0, src: 'PR-01,PR-02,PR-05,PR-07' },
  IEEE_MI: { k: 0.0515, c: 0.114, alpha: 0.02, tr: 4.85, src: 'PR-01,PR-02,PR-03,PR-05' },
  IEEE_VI: { k: 19.61, c: 0.491, alpha: 2, tr: 21.6, src: 'PR-01,PR-02,PR-03,PR-05' },
  IEEE_EI: { k: 28.2, c: 0.1217, alpha: 2, tr: 29.1, src: 'PR-01,PR-02,PR-03,PR-05' },
};

export const M_CAP = 20;

/** Operating time (s) for current I (A), pickup Is (A). Infinity below pickup. DT: `tms` is the delay in s. */
export function operateTime(curve: CurveId, iA: number, pickupA: number, tms: number): number {
  if (!(iA > pickupA) || pickupA <= 0) return Infinity;
  if (curve === 'DT') return tms;
  const cc = CURVES[curve];
  const m = Math.min(iA / pickupA, M_CAP);
  return tms * (cc.k / (pow(m, cc.alpha) - 1) + cc.c);
}

export interface ElementSetting { curve: CurveId; pickupA: number; tms: number; instA?: number; instDelayS?: number }

/** Time for one element (IDMT/DT stage plus optional high-set stage), current constant. */
export function elementTime(s: ElementSetting, iA: number): number {
  const t1 = operateTime(s.curve, iA, s.pickupA, s.tms);
  const t2 = s.instA !== undefined && iA > s.instA ? (s.instDelayS ?? 0) : Infinity;
  return Math.min(t1, t2);
}

/**
 * Travel state of one relay (phase + earth elements). advance() integrates over an interval with constant
 * currents; returns the time within the interval at which it operates (or Infinity).
 */
export class RelayState {
  phaseTravel = 0;
  earthTravel = 0;
  constructor(readonly phase: ElementSetting, readonly earth: ElementSetting) {}

  /** time to operate from now if currents stay constant */
  timeToOperate(iPhaseA: number, i3i0A: number): number {
    const tp = elementTime(this.phase, iPhaseA);
    const te = elementTime(this.earth, i3i0A);
    const rp = tp === Infinity ? Infinity : (1 - this.phaseTravel) * tp;
    const re = te === Infinity ? Infinity : (1 - this.earthTravel) * te;
    return Math.min(rp, re);
  }

  advance(dt: number, iPhaseA: number, i3i0A: number): void {
    const tp = elementTime(this.phase, iPhaseA);
    const te = elementTime(this.earth, i3i0A);
    this.phaseTravel = tp === Infinity ? 0 : Math.min(1, this.phaseTravel + dt / tp);
    this.earthTravel = te === Infinity ? 0 : Math.min(1, this.earthTravel + dt / te);
  }

  reset(): void { this.phaseTravel = 0; this.earthTravel = 0; }
}
