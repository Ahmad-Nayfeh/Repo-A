/**
 * Seeded PRNG: sfc32 seeded via splitmix32 (research/04 §6.4). Integer ops only (Math.imul, >>>),
 * which are exactly specified ⇒ identical sequences on every JS engine.
 * Named sub-streams so adding a consumer does not shift other streams.
 */
export function splitmix32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

export function fnv1a32(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export class Rng {
  private a: number; private b: number; private c: number; private d: number;
  constructor(seed: number) {
    const sm = splitmix32(seed);
    this.a = sm(); this.b = sm(); this.c = sm(); this.d = sm();
    for (let i = 0; i < 12; i++) this.nextU32();
  }
  /** Independent stream derived from this seed and a name. */
  static stream(seed: number, name: string): Rng {
    return new Rng((seed ^ fnv1a32(name)) >>> 0);
  }
  nextU32(): number {
    const t = (((this.a + this.b) >>> 0) + this.d) >>> 0;
    this.d = (this.d + 1) >>> 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) >>> 0;
    this.c = ((this.c << 21) | (this.c >>> 11)) >>> 0;
    this.c = (this.c + t) >>> 0;
    return t >>> 0;
  }
  /** uniform in [0, 1) with 32-bit resolution */
  next(): number { return this.nextU32() / 4294967296; }
  /** integer in [lo, hi] inclusive */
  int(lo: number, hi: number): number { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  range(lo: number, hi: number): number { return lo + (hi - lo) * this.next(); }
  pick<T>(arr: readonly T[]): T { return arr[this.int(0, arr.length - 1)]!; }
  /** weighted choice; weights need not sum to 1 */
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0;
    for (const w of weights) total += w;
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) { r -= weights[i]!; if (r < 0) return items[i]!; }
    return items[items.length - 1]!;
  }
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) { const j = this.int(0, i); const t = arr[i]!; arr[i] = arr[j]!; arr[j] = t; }
    return arr;
  }
}

/** FNV-1a over the IEEE-754 bit patterns of numbers (for state hashing). */
export class Hasher {
  private h = 0x811c9dc5;
  private dv = new DataView(new ArrayBuffer(8));
  private byte(b: number) { this.h ^= b & 0xff; this.h = Math.imul(this.h, 0x01000193) >>> 0; }
  num(x: number): this {
    this.dv.setFloat64(0, x);
    for (let i = 0; i < 8; i++) this.byte(this.dv.getUint8(i));
    return this;
  }
  str(s: string): this { for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); this.byte(c); this.byte(c >>> 8); } return this; }
  digest(): string { return (this.h >>> 0).toString(16).padStart(8, '0'); }
}
