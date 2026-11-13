/** Minimal immutable complex arithmetic (exact IEEE ops only). */
export interface C { re: number; im: number }

export const c = (re: number, im = 0): C => ({ re, im });
export const ZERO: C = Object.freeze({ re: 0, im: 0 });
export const ONE: C = Object.freeze({ re: 1, im: 0 });
export const add = (a: C, b: C): C => ({ re: a.re + b.re, im: a.im + b.im });
export const sub = (a: C, b: C): C => ({ re: a.re - b.re, im: a.im - b.im });
export const mul = (a: C, b: C): C => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
export const scale = (a: C, k: number): C => ({ re: a.re * k, im: a.im * k });
export const conj = (a: C): C => ({ re: a.re, im: -a.im });
export const neg = (a: C): C => ({ re: -a.re, im: -a.im });
export const abs2 = (a: C): number => a.re * a.re + a.im * a.im;
export const abs = (a: C): number => Math.sqrt(a.re * a.re + a.im * a.im);
export function div(a: C, b: C): C {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
export const inv = (a: C): C => div(ONE, a);
/** a = −1/2 + j√3/2 (120° operator), built from exact sqrt. */
export const A120: C = Object.freeze({ re: -0.5, im: Math.sqrt(3) / 2 });
export const A240: C = Object.freeze({ re: -0.5, im: -Math.sqrt(3) / 2 });
/** Angle in degrees via deterministic atan (display & tests only; not used in state). */
