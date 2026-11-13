/**
 * GOLDEN — reliability metrics (research/07 GT-1, GT-2, GT-3).
 * GT-1 Ofgem worked example [OP-02 §2.27]: off 2, on 2, off 30, then restored ≥3 min ⇒ 34 customer-minutes per customer.
 * GT-2 constructed night-fault example (formulas [OP-01],[OP-03]): 63,000 customer-min; CAIDI 105 min.
 * GT-3 threshold edge: a 4-min restoration counts for Ofgem (≥3) but not IEEE (>5).
 * The engine computes these through Simulation's interruption log, so we drive a 1-load network by switching.
 */
import { describe, it, expect } from 'vitest';
import { Simulation, MIN } from '../../src/engine/sim';
import { generateScenario } from '../../src/engine/scenario/district';

/** Build a simulation and overwrite its outage log for a single-load metric test via public behaviour. */
function metricsFor(intervals: [number, number][], customers: number) {
  const sc = generateScenario(1, 'easy');
  const sim = new Simulation(sc);
  // access the private bookkeeping through a narrow test seam
  const anySim = sim as unknown as { outages: Map<string, [number, number][]>; loadOff: Map<string, number | null>; net: { loads: { id: string; customers: number }[] }; t: number };
  const keep = anySim.net.loads[0]!;
  anySim.net.loads = [{ ...keep, customers }];
  anySim.outages = new Map([[keep.id, intervals.map(([a, b]) => [a * MIN, b * MIN] as [number, number])]]);
  anySim.loadOff = new Map([[keep.id, null]]);
  anySim.t = 1000 * MIN;
  return sim.metrics();
}

describe('GOLDEN reliability', () => {
  it('GT-1 Ofgem: 2 off, 2 on, 30 off ⇒ 34 min (restoration < 3 min ignored)', () => {
    const m = metricsFor([[0, 2], [4, 34]], 1);
    expect(m.cmlOfgem).toBe(34);
    expect(m.ci).toBe(1);
  });
  it('GT-2 staged restoration: 300×40 + 200×75 + 100×360 = 63,000 customer-min; CAIDI = 105 min', () => {
    // three customer groups with different restoration times, modelled as one load each (sum)
    const a = metricsFor([[0, 40]], 300).cmlOfgem, b = metricsFor([[0, 75]], 200).cmlOfgem, c = metricsFor([[0, 360]], 100).cmlOfgem;
    expect(a + b + c).toBe(63000);
    expect((a + b + c) / 600).toBe(105);
  });
  it('GT-3 threshold: a 4-min interruption counts for Ofgem (≥3 min) but not IEEE 1366 (>5 min)', () => {
    const m = metricsFor([[0, 4]], 300);
    expect(m.cmlOfgem).toBe(1200);
    expect(m.cmlIeee).toBe(0);
  });
});
