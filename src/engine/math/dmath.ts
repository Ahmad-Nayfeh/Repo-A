/**
 * Deterministic elementary functions built only from IEEE-754 operations that ECMAScript
 * specifies exactly (+, −, ×, ÷, Math.sqrt, Math.round/floor, comparisons) plus exact
 * bit manipulation through DataView. ECMAScript leaves Math.exp/log/pow "implementation-
 * approximated" (ECMA-262 §21.3.2), so results could differ between browsers and break
 * seeded replays. See docs/design/ARCHITECTURE.md §5 and research/04-power-flow.md §6.3.
 *
 * Accuracy target: relative error ≤ 4e-16 (a few ulp) over the ranges used by the engine.
 * Verified in tests/unit/dmath.test.ts against Math.* reference values.
 */

const buf = new DataView(new ArrayBuffer(8));

// Cody–Waite split of ln 2 (fdlibm constants): hi has trailing zero bits so k*LN2_HI is exact.
const LN2_HI = 6.93147180369123816490e-1;
const LN2_LO = 1.90821492927058770002e-10;
const INV_LN2 = 1.44269504088896338700e0;
export const LN2 = 0.6931471805599453;
const SQRT1_2 = 0.7071067811865476;

/** 2^k for integer k in [-1074, 1023], exact. */
export function pow2i(k: number): number {
  if (k > 1023) return Infinity;
  if (k >= -1022) {
    buf.setUint32(0, ((k + 1023) << 20) >>> 0);
    buf.setUint32(4, 0);
    return buf.getFloat64(0);
  }
  if (k < -1074) return 0;
  // subnormal: build 2^(k+60) then divide by 2^60 (both exact)
  return pow2i(k + 60) / 1152921504606846976;
}

/** e^x */
export function exp(x: number): number {
  if (x !== x) return NaN;
  if (x > 709.782712893384) return Infinity;
  if (x < -745.1332191019411) return 0;
  if (x === 0) return 1;
  const k = Math.round(x * INV_LN2);
  // r = x − k·ln2 computed in two parts for accuracy
  const hi = x - k * LN2_HI;
  const lo = k * LN2_LO;
  const r = hi - lo; // |r| ≤ ~0.3466
  // Taylor series of e^r, Horner form, degree 18 (truncation < 1e-21 relative).
  let p = 1 / 6402373705728000; // 1/18!
  p = p * r + 1 / 355687428096000;
  p = p * r + 1 / 20922789888000;
  p = p * r + 1 / 1307674368000;
  p = p * r + 1 / 87178291200;
  p = p * r + 1 / 6227020800;
  p = p * r + 1 / 479001600;
  p = p * r + 1 / 39916800;
  p = p * r + 1 / 3628800;
  p = p * r + 1 / 362880;
  p = p * r + 1 / 40320;
  p = p * r + 1 / 5040;
  p = p * r + 1 / 720;
  p = p * r + 1 / 120;
  p = p * r + 1 / 24;
  p = p * r + 1 / 6;
  p = p * r + 0.5;
  p = p * r + 1;
  p = p * r + 1;
  // scale by 2^k, split to avoid intermediate overflow/underflow
  if (k > 1000) return p * pow2i(k - 1000) * pow2i(1000);
  if (k < -1000) return p * pow2i(k + 1000) * pow2i(-1000);
  return p * pow2i(k);
}

/** natural logarithm */
export function log(x: number): number {
  if (x !== x || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (x === Infinity) return Infinity;
  let e = 0;
  let m = x;
  if (m < 2.2250738585072014e-308) {
    // subnormal: scale up exactly
    m = m * 18014398509481984; // 2^54
    e = -54;
  }
  buf.setFloat64(0, m);
  const hiWord = buf.getUint32(0);
  const exponent = ((hiWord >>> 20) & 0x7ff) - 1023;
  e += exponent;
  // set exponent field to 0 → m in [1, 2)
  buf.setUint32(0, (hiWord & 0x800fffff) | (1023 << 20));
  m = buf.getFloat64(0);
  if (m > 2 * SQRT1_2) {
    m = m / 2;
    e += 1;
  }
  // m in [√½, √2): log m = 2·atanh(s), s = (m−1)/(m+1), |s| ≤ 0.1716
  const s = (m - 1) / (m + 1);
  const s2 = s * s;
  // series: s·(1 + s²/3 + s⁴/5 + … + s^(2n)/(2n+1)), n = 16 (truncation < 1e-26)
  let q = 1 / 33;
  q = q * s2 + 1 / 31;
  q = q * s2 + 1 / 29;
  q = q * s2 + 1 / 27;
  q = q * s2 + 1 / 25;
  q = q * s2 + 1 / 23;
  q = q * s2 + 1 / 21;
  q = q * s2 + 1 / 19;
  q = q * s2 + 1 / 17;
  q = q * s2 + 1 / 15;
  q = q * s2 + 1 / 13;
  q = q * s2 + 1 / 11;
  q = q * s2 + 1 / 9;
  q = q * s2 + 1 / 7;
  q = q * s2 + 1 / 5;
  q = q * s2 + 1 / 3;
  const logm = 2 * s + 2 * s * s2 * q;
  return e * LN2_HI + (logm + e * LN2_LO);
}

/** x^y for x ≥ 0 (or negative x with integer y). Small integer exponents use exact repeated multiplication. */
export function pow(x: number, y: number): number {
  if (y === 0) return 1;
  if (y === 1) return x;
  if (y === 2) return x * x;
  if (y === 0.5) return Math.sqrt(x);
  if (Number.isInteger(y) && Math.abs(y) <= 64) {
    let n = Math.abs(y);
    let base = x;
    let acc = 1;
    while (n > 0) {
      if (n % 2 === 1) acc *= base;
      base *= base;
      n = Math.floor(n / 2);
    }
    return y < 0 ? 1 / acc : acc;
  }
  if (x < 0) {
    if (!Number.isInteger(y)) return NaN;
    const r = exp(y * log(-x));
    return y % 2 === 0 ? r : -r;
  }
  if (x === 0) return y > 0 ? 0 : Infinity;
  return exp(y * log(x));
}

/** 2^x */
export function exp2(x: number): number {
  return exp(x * LN2);
}
