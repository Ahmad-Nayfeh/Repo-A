import type { RingInfo } from './scenario/district';

/**
 * FPI evidence logic for an open ring fed from one end (P-03: all indicators between the source and the fault
 * activate; OP-05 §11.3: positive indication from any FPI type, negative indication only from three-phase FPIs).
 * Cable indices: ring.cables[i]; RMU k sits between cable k (its L panel) and cable k+1 (its R panel).
 * Returns the fault interval [lo, hi] of cable indices consistent with the readings (lo > hi ⇒ contradiction).
 */
export interface Reading { fpi: string; site: string; phase: boolean; earth: boolean; type: string; t: number }

export function narrowInterval(ring: RingInfo, fedFrom: 'A' | 'B', lo0: number, hi0: number, readings: readonly Reading[]): [number, number] {
  let lo = lo0, hi = hi0;
  // latest reading per FPI
  const latest = new Map<string, Reading>();
  for (const r of readings) if (ring.rmus.includes(r.site)) { const p = latest.get(r.fpi); if (!p || r.t >= p.t) latest.set(r.fpi, r); }
  for (const r of latest.values()) {
    const k = ring.rmus.indexOf(r.site);
    const lit = r.phase || r.earth;
    const reliableNegative = !lit && r.type === 'three-phase';
    if (fedFrom === 'A') {
      if (lit) lo = Math.max(lo, k + 1);          // fault current passed RMU k toward B
      else if (reliableNegative) hi = Math.min(hi, k);
    } else {
      if (lit) hi = Math.min(hi, k);              // fault current passed RMU k toward A
      else if (reliableNegative) lo = Math.max(lo, k + 1);
    }
  }
  return [lo, hi];
}
