/**
 * GOLDEN — transformer thermal model (research/05 GT-1, GT-3; research/12 SEC emergency table).
 */
import { describe, it, expect } from 'vitest';
import { steadyState, step, stepExact, hotSpot, ageingRate, IEC_DISTRIBUTION_ONAN, type ThermalParams } from '../../src/engine/thermal';

describe('GOLDEN thermal — IEC 60076-7:2005 Annex C (difference equations, 41 steps)', () => {
  const p: ThermalParams = { dThetaOr: 45, dThetaHr: 35, R: 8, x: 0.8, y: 1.3, k11: 0.5, k21: 2, k22: 2, tauO: 150, tauW: 7, paper: 'upgraded' };
  const thA = [30.3, 29.9, 29.8, 29.5, 29.6, 29.5, 29.5, 28.9, 29.0, 28.6, 28.0, 28.7, 27.8, 28.1, 27.9, 27.1, 26.9, 26.7, 27.2, 26.7, 26.9, 26.5, 26.2, 26.3, 25.4, 25.6, 25.3, 24.8, 24.5, 24.3, 24.1, 24.3, 24.1, 23.4, 23.6, 23.8, 23.1, 23.3, 23.1, 22.3, 22.2];
  const K = [0.81, 0.87, 0.88, 0.86, 0.90, 0.92, 0.95, 0.96, 0.97, 1.00, 1.70, 1.70, 1.73, 1.72, 1.69, 1.68, 1.71, 1.69, 1.67, 1.68, 1.63, 1.59, 1.53, 1.49, 1.41, 1.38, 1.32, 1.28, 1.21, 1.19, 0.87, 0.88, 0.87, 0.86, 0.85, 0.87, 0.83, 0.86, 0.85, 0.82, 0.86];
  const pub = [90.5, 91.6, 92.7, 93.2, 94.3, 95.6, 97.2, 98.6, 100.0, 101.6, 118.6, 132.1, 143.5, 152.4, 158.8, 163.6, 168.2, 171.5, 173.6, 175.7, 176.1, 175.6, 173.8, 171.5, 167.8, 164.3, 160.1, 156.0, 151.1, 146.8, 136.9, 129.1, 122.8, 117.5, 113.1, 110.0, 106.6, 104.5, 102.6, 100.4, 99.3];
  it('hot-spot matches Table C.2 at every step (±0.15 K); loss of life 8851 min = 6.15 days (±1 %)', () => {
    let s = steadyState(p, K[0]!, thA[0]!);
    expect(Math.abs(hotSpot(s) - pub[0]!)).toBeLessThan(0.15);
    let worst = 0;
    for (let n = 1; n <= 40; n++) {
      s = step(p, s, K[n]!, thA[n]!, 3);
      worst = Math.max(worst, Math.abs(hotSpot(s) - pub[n]!));
    }
    console.log(`[golden Annex C] worst |Δθh| = ${worst.toFixed(3)} K, loss of life = ${s.lossOfLifeMin.toFixed(0)} min`);
    expect(worst).toBeLessThan(0.15);
    expect(Math.abs(s.lossOfLifeMin - 8851) / 8851).toBeLessThan(0.01);
  });
});

describe('GOLDEN thermal — IEC 60076-7:2005 Annex E (OF, 30-min overload)', () => {
  // Annex E uses the exponential method (eqs. 5–9) ⇒ validated with stepExact. (The forward-difference method
  // gives 114.7 °C at 0.5-min steps — the known discretisation difference between the two IEC methods.)
  const p: ThermalParams = { dThetaOr: 56, dThetaHr: 22, R: 6, x: 1, y: 1.3, k11: 1, k21: 1.3, k22: 1, tauO: 90, tauW: 7, paper: 'kraft' };
  it('K 0.8 → 1.4 for 30 min at 20 °C (increasing step): θo = 76.7 °C, θh = 114.2 °C (±0.1 K)', () => {
    const s = stepExact(p, steadyState(p, 0.8, 20), 1.4, 20, 30);
    console.log(`[golden Annex E] θo = ${s.thetaO.toFixed(2)} θh(30 min) = ${hotSpot(s).toFixed(2)} °C`);
    expect(Math.abs(s.thetaO - 76.7)).toBeLessThan(0.1);
    expect(Math.abs(hotSpot(s) - 114.2)).toBeLessThan(0.1);
  });
  // NOT reproduced by design: after the overload, the 2005 exponential decreasing-step formula (eq. 8) sets the
  // hot-spot gradient to its new value instantly (θh 92.9 °C one minute later; daily loss of life 0.14 day).
  // Our model keeps the Annex C winding dynamics (gradient decays with k22·τw), giving 0.150 day. See VALIDATION.md.
  it('exact update and forward-difference equations converge to the same solution at fine steps (Annex C parameters)', () => {
    const q: ThermalParams = { dThetaOr: 45, dThetaHr: 35, R: 8, x: 0.8, y: 1.3, k11: 0.5, k21: 2, k22: 2, tauO: 150, tauW: 7, paper: 'upgraded' };
    let a = steadyState(q, 0.8, 30);
    for (let i = 0; i < 300; i++) a = step(q, a, 1.7, 30, 0.1);
    const b = stepExact(q, steadyState(q, 0.8, 30), 1.7, 30, 30);
    expect(Math.abs(hotSpot(a) - hotSpot(b))).toBeLessThan(0.1);
  });
  it('ageing table points: V(110 °C, Kraft) = 4.0; V(98 °C) = 1; TUP V(110 °C) = 1', () => {
    expect(ageingRate(110, 'kraft')).toBeCloseTo(4, 10);
    expect(ageingRate(98, 'kraft')).toBeCloseTo(1, 12);
    expect(ageingRate(110, 'upgraded')).toBeCloseTo(1, 12);
  });
});

describe('SEC 51-SDMS-04 Rev.02 parameters (one-sided check, research/12 T12-d)', () => {
  // SEC rating basis: Δθor 45 K, hot-spot 98 °C at 35 °C design temperature ⇒ Δθhr 18 K [D]; R from max losses
  const sec = (R: number): ThermalParams => ({ ...IEC_DISTRIBUTION_ONAN, dThetaOr: 45, dThetaHr: 18, R });
  it('steady state at rated load and 35 °C gives the 98 °C hot-spot by construction', () => {
    expect(hotSpot(steadyState(sec(8.2), 1, 35))).toBeCloseTo(98, 10);
  });
  for (const [kva, R] of [[500, 6.3], [1000, 8.2], [1500, 8.2]] as const) {
    for (const [amb, k133, k150] of [[30, 240, 98], [40, 155, 65]] as const) {
      it(`${kva} kVA at ${amb} °C from 75 % preload: hot-spot ≤ 140 °C after ${k133} min at 133 % and ${k150} min at 150 %`, () => {
        const p = sec(R);
        const a = stepExact(p, steadyState(p, 0.75, amb), 1.33, amb, k133);
        const b = stepExact(p, steadyState(p, 0.75, amb), 1.5, amb, k150);
        console.log(`[SEC emergency] ${kva} kVA ${amb} °C: θh(133 %, ${k133} min) = ${hotSpot(a).toFixed(1)} °C, θh(150 %, ${k150} min) = ${hotSpot(b).toFixed(1)} °C`);
        expect(hotSpot(a)).toBeLessThanOrEqual(140);
        expect(hotSpot(b)).toBeLessThanOrEqual(140);
      });
    }
  }
});
