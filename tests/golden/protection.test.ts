/**
 * GOLDEN — protection curves and grading (research/03 §1.4, §3).
 * GT-3: formula points from verified constants (self-consistency, ±0.1 %).
 * GT-2: ABB DA Handbook IDMT example — NI relay at 4.0× setting with t1 = 1.0 s ⇒ implied TMS 0.201.
 * GT-4: Chakrabarti textbook (graph-read) — ±6 % only.
 */
import { describe, it, expect } from 'vitest';
import { operateTime, elementTime, RelayState } from '../../src/engine/protection';

const rel = (a: number, b: number) => Math.abs(a - b) / b;

describe('GOLDEN protection — curve points (TMS = 1)', () => {
  const table: [Parameters<typeof operateTime>[0], number[]][] = [
    ['IEC_SI', [17.194, 10.029, 4.280, 2.971, 2.267]],
    ['IEC_VI', [27.0, 13.5, 3.375, 1.5, 0.711]],
    ['IEC_EI', [64.0, 26.667, 3.333, 0.808, 0.201]],
    ['IEC_LTI', [240.0, 120.0, 30.0, 13.333, 6.316]],
    ['IEEE_MI', [6.439, 3.803, 1.688, 1.207, 0.948]],
    ['IEEE_VI', [16.179, 7.028, 1.308, 0.689, 0.540]],
    ['IEEE_EI', [22.682, 9.522, 1.297, 0.407, 0.192]],
  ];
  const ms = [1.5, 2, 5, 10, 20];
  for (const [curve, ts] of table) {
    // table values are rounded to 3 decimals ⇒ tolerance = max(0.1 %, half a unit of the last printed digit)
    it(curve, () => ms.forEach((m, i) => expect(Math.abs(operateTime(curve, m * 100, 100, 1) - ts[i]!)).toBeLessThanOrEqual(Math.max(0.001 * ts[i]!, 0.0005 + 1e-12))));
  }
  it('no operation at or below pickup; capped above 20×', () => {
    expect(operateTime('IEC_SI', 100, 100, 1)).toBe(Infinity);
    expect(operateTime('IEC_SI', 5000, 100, 1)).toBe(operateTime('IEC_SI', 2000, 100, 1));
  });
});

describe('GOLDEN protection — ABB DA Handbook IDMT grading (GT-2)', () => {
  it('NI relay, 4.0× setting, TMS 0.201 ⇒ t ≈ 1.00 s', () => {
    expect(rel(operateTime('IEC_SI', 4.0, 1, 0.201), 1.0)).toBeLessThan(0.005);
  });
  it('relay-2 minimum TMS 0.172 at 2.4× gives t2 ≥ 1.36 s (1.0 s + 0.36 s margin)', () => {
    expect(operateTime('IEC_SI', 2.4, 1, 0.172)).toBeGreaterThanOrEqual(1.355);
  });
});

describe('GOLDEN protection — Chakrabarti (graph-read, ±6 %)', () => {
  it('Ex 3.7.1: PSM 8, TMS 0.5 ⇒ 1.575 s', () => expect(rel(operateTime('IEC_SI', 6000, 750, 0.5), 1.575)).toBeLessThan(0.06));
  it('Ex 3.7.2: PSM 8, TMS 0.3 ⇒ 0.945 s', () => expect(rel(operateTime('IEC_SI', 5250, 656.25, 0.3), 0.945)).toBeLessThan(0.06));
  it('Ex 3.7.4: R1 PSM 10, TMS 0.2 ⇒ 0.56 s', () => expect(rel(operateTime('IEC_SI', 2000, 200, 0.2), 0.56)).toBeLessThan(0.065));
});

describe('protection — travel integral', () => {
  it('constant current: operates exactly at t(M)', () => {
    const r = new RelayState({ curve: 'IEC_SI', pickupA: 100, tms: 0.1 }, { curve: 'DT', pickupA: 1e9, tms: 1 });
    const t = r.timeToOperate(1000, 0);
    r.advance(t / 2, 1000, 0);
    expect(rel(r.timeToOperate(1000, 0), t / 2)).toBeLessThan(1e-12);
  });
  it('high-set stage', () => {
    expect(elementTime({ curve: 'IEC_SI', pickupA: 100, tms: 0.1, instA: 2000, instDelayS: 0.05 }, 3000)).toBe(0.05);
  });
});
