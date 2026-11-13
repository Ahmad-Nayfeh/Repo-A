/**
 * Dense complex LU factorisation with partial pivoting (Doolittle), stored as separate
 * re/im Float64Arrays, row-major. Deterministic: fixed loop order, pivot by largest |a|²
 * with lowest index winning ties.
 */
export class ComplexLU {
  readonly n: number;
  private re: Float64Array;
  private im: Float64Array;
  private piv: Int32Array;
  readonly singular: boolean;

  constructor(n: number, re: Float64Array, im: Float64Array) {
    this.n = n;
    this.re = Float64Array.from(re);
    this.im = Float64Array.from(im);
    this.piv = new Int32Array(n);
    let singular = false;
    const R = this.re, I = this.im;
    for (let i = 0; i < n; i++) this.piv[i] = i;
    for (let k = 0; k < n; k++) {
      // pivot
      let p = k;
      let best = R[k * n + k]! * R[k * n + k]! + I[k * n + k]! * I[k * n + k]!;
      for (let i = k + 1; i < n; i++) {
        const v = R[i * n + k]! * R[i * n + k]! + I[i * n + k]! * I[i * n + k]!;
        if (v > best) { best = v; p = i; }
      }
      if (best === 0 || best < 1e-300) { singular = true; continue; }
      if (p !== k) {
        for (let j = 0; j < n; j++) {
          const a = k * n + j, b = p * n + j;
          const tr = R[a]!; R[a] = R[b]!; R[b] = tr;
          const ti = I[a]!; I[a] = I[b]!; I[b] = ti;
        }
        const t = this.piv[k]!; this.piv[k] = this.piv[p]!; this.piv[p] = t;
      }
      const pr = R[k * n + k]!, pi = I[k * n + k]!;
      const d = pr * pr + pi * pi;
      for (let i = k + 1; i < n; i++) {
        const ar = R[i * n + k]!, ai = I[i * n + k]!;
        if (ar === 0 && ai === 0) continue;
        // l = a / pivot
        const lr = (ar * pr + ai * pi) / d;
        const li = (ai * pr - ar * pi) / d;
        R[i * n + k] = lr; I[i * n + k] = li;
        for (let j = k + 1; j < n; j++) {
          const ur = R[k * n + j]!, ui = I[k * n + j]!;
          if (ur === 0 && ui === 0) continue;
          R[i * n + j] = R[i * n + j]! - (lr * ur - li * ui);
          I[i * n + j] = I[i * n + j]! - (lr * ui + li * ur);
        }
      }
    }
    this.singular = singular;
  }

  /** Solve A x = b. Inputs/outputs as re/im arrays. */
  solve(br: Float64Array, bi: Float64Array): { re: Float64Array; im: Float64Array } {
    const n = this.n, R = this.re, I = this.im;
    const xr = new Float64Array(n), xi = new Float64Array(n);
    for (let i = 0; i < n; i++) { xr[i] = br[this.piv[i]!]!; xi[i] = bi[this.piv[i]!]!; }
    // forward (unit lower)
    for (let i = 0; i < n; i++) {
      let sr = xr[i]!, si = xi[i]!;
      for (let j = 0; j < i; j++) {
        const lr = R[i * n + j]!, li = I[i * n + j]!;
        sr -= lr * xr[j]! - li * xi[j]!;
        si -= lr * xi[j]! + li * xr[j]!;
      }
      xr[i] = sr; xi[i] = si;
    }
    // backward
    for (let i = n - 1; i >= 0; i--) {
      let sr = xr[i]!, si = xi[i]!;
      for (let j = i + 1; j < n; j++) {
        const ur = R[i * n + j]!, ui = I[i * n + j]!;
        sr -= ur * xr[j]! - ui * xi[j]!;
        si -= ur * xi[j]! + ui * xr[j]!;
      }
      const pr = R[i * n + i]!, pi = I[i * n + i]!;
      const d = pr * pr + pi * pi;
      xr[i] = (sr * pr + si * pi) / d;
      xi[i] = (si * pr - sr * pi) / d;
    }
    return { re: xr, im: xi };
  }
}
