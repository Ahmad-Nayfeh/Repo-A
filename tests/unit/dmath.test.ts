import { describe, it, expect } from 'vitest';
import { exp, log, pow, exp2, pow2i } from '../../src/engine/math/dmath';

// Reference: host Math.* (V8 — itself accurate to ~1 ulp). Our functions must agree to a few ulp.
const rel = (a: number, b: number) => (b === 0 ? Math.abs(a) : Math.abs(a - b) / Math.abs(b));

describe('dmath', () => {
  it('pow2i is exact', () => {
    expect(pow2i(0)).toBe(1);
    expect(pow2i(10)).toBe(1024);
    expect(pow2i(-1)).toBe(0.5);
    expect(pow2i(-1074)).toBe(5e-324);
    expect(pow2i(1023)).toBe(8.98846567431158e307);
  });
  it('exp matches Math.exp within 4e-16 relative on [-700, 700]', () => {
    let worst = 0;
    for (let i = 0; i <= 20000; i++) {
      const x = -700 + (1400 * i) / 20000;
      worst = Math.max(worst, rel(exp(x), Math.exp(x)));
    }
    for (let i = 0; i <= 20000; i++) {
      const x = -5 + (10 * i) / 20000;
      worst = Math.max(worst, rel(exp(x), Math.exp(x)));
    }
    expect(worst).toBeLessThan(4e-16);
    expect(exp(0)).toBe(1);
    expect(rel(exp(1), Math.E)).toBeLessThan(2.3e-16); // within 1 ulp
  });
  it('log matches Math.log within 4e-16 relative (or 1e-300 absolute near 1)', () => {
    let worst = 0;
    const xs: number[] = [];
    for (let i = 1; i <= 20000; i++) xs.push(i / 1000, 1 + i * 1e-6, 1e-300 * i, 1e300 / i);
    for (const x of xs) {
      const ref = Math.log(x);
      const err = Math.abs(ref) < 1e-3 ? Math.abs(log(x) - ref) / 1e-3 : rel(log(x), ref);
      worst = Math.max(worst, err);
    }
    expect(worst).toBeLessThan(4e-16);
    expect(log(1)).toBe(0);
  });
  it('pow handles curve exponents used by IEC 60255 and IEC 60076-7', () => {
    for (const a of [0.02, 0.8, 1.6, 1, 2]) {
      for (let m = 1.05; m < 40; m *= 1.07) {
        expect(rel(pow(m, a), Math.pow(m, a))).toBeLessThan(1e-15);
      }
    }
    expect(pow(3, 2)).toBe(9);
    expect(pow(2, -3)).toBe(0.125);
    expect(rel(exp2((110 - 98) / 6), 4)).toBeLessThan(1e-15); // IEC 60076-7 V(110 °C) = 4
  });
});
