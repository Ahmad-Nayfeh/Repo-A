import { describe, it, expect } from 'vitest';
import { ComplexLU } from '../../src/engine/math/linalg';
import { Rng, fnv1a32 } from '../../src/engine/rng';

describe('ComplexLU', () => {
  it('solves a random complex system to 1e-12', () => {
    const rng = new Rng(42);
    const n = 30;
    const re = new Float64Array(n * n), im = new Float64Array(n * n);
    for (let i = 0; i < n * n; i++) { re[i] = rng.range(-1, 1); im[i] = rng.range(-1, 1); }
    for (let i = 0; i < n; i++) re[i * n + i] = re[i * n + i]! + 5; // diagonally dominant-ish
    const xr = new Float64Array(n), xi = new Float64Array(n);
    for (let i = 0; i < n; i++) { xr[i] = rng.range(-2, 2); xi[i] = rng.range(-2, 2); }
    const br = new Float64Array(n), bi = new Float64Array(n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      br[i] = br[i]! + re[i * n + j]! * xr[j]! - im[i * n + j]! * xi[j]!;
      bi[i] = bi[i]! + re[i * n + j]! * xi[j]! + im[i * n + j]! * xr[j]!;
    }
    const lu = new ComplexLU(n, re, im);
    const sol = lu.solve(br, bi);
    for (let i = 0; i < n; i++) {
      expect(Math.abs(sol.re[i]! - xr[i]!)).toBeLessThan(1e-12);
      expect(Math.abs(sol.im[i]! - xi[i]!)).toBeLessThan(1e-12);
    }
  });
  it('flags a singular matrix', () => {
    const lu = new ComplexLU(2, Float64Array.from([1, 2, 2, 4]), new Float64Array(4));
    expect(lu.singular).toBe(true);
  });
});

describe('Rng', () => {
  it('is reproducible and stream-separated', () => {
    const a = new Rng(123), b = new Rng(123);
    for (let i = 0; i < 100; i++) expect(a.nextU32()).toBe(b.nextU32());
    expect(Rng.stream(1, 'faults').nextU32()).not.toBe(Rng.stream(1, 'loads').nextU32());
  });
  it('known-answer: first outputs for seed 1 are fixed (guards against accidental algorithm change)', () => {
    const r = new Rng(1);
    const out = [r.nextU32(), r.nextU32(), r.nextU32()];
    expect(out).toMatchSnapshot();
  });
  it('uniformity sanity', () => {
    const r = new Rng(7); let s = 0; const N = 100000;
    for (let i = 0; i < N; i++) s += r.next();
    expect(Math.abs(s / N - 0.5)).toBeLessThan(0.005);
    expect(fnv1a32('2026-11-13')).toBe(fnv1a32('2026-11-13'));
  });
});
