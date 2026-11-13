/**
 * GOLDEN — short circuit. Sources and expected values: research/02-faults-short-circuit.md (GT-1..GT-5)
 * and research/10-sc-protection-round2.md (GT-R2-A). Tolerances per FIDELITY F2.
 */
import { describe, it, expect } from 'vitest';
import { faultSequenceCurrents, seqToPhase, shortCircuit } from '../../src/engine/shortcircuit';
import { c, abs } from '../../src/engine/math/complex';
import { emptyNet, cableType, relErr } from './helpers';

describe('GOLDEN SC — GT-3 Glover/Sarma/Overbye 5e Ex. 9.2–9.5 (sequence algebra, pu)', () => {
  // Z1 = j0.13893, Z2 = j0.14562, Z0 = j0.25 pu, VF = 1.05 pu, Ibase 4.1837 kA [SC-04 pp. 475–489]
  const z1 = c(0, 0.13893), z2 = c(0, 0.14562), z0 = c(0, 0.25), e = c(1.05), zf = c(0);
  const IB = 4.1837;
  it('3-phase: |I1| = 7.558 pu', () => {
    const s = faultSequenceCurrents('3PH', e, z1, z2, z0, zf);
    expect(relErr(abs(s.i1), 7.558)).toBeLessThan(0.0005);
  });
  it('SLG: Ia = 5.8928 pu = 24.65 kA; |Vbg| = |Vcg| = 1.179 pu', () => {
    const s = faultSequenceCurrents('SLG', e, z1, z2, z0, zf);
    const p = seqToPhase(s);
    expect(relErr(abs(p.a), 5.8928)).toBeLessThan(0.0005);
    expect(relErr(abs(p.a) * IB, 24.65)).toBeLessThan(0.001);
    // sequence voltages at fault: V1 = E − Z1 I1, V2 = −Z2 I2, V0 = −Z0 I0
    const sub = (a: {re:number;im:number}, b: {re:number;im:number}) => c(a.re - b.re, a.im - b.im);
    const mul = (a: {re:number;im:number}, b: {re:number;im:number}) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
    const v = seqToPhase({ i1: sub(e, mul(z1, s.i1)), i2: c(-mul(z2, s.i2).re, -mul(z2, s.i2).im), i0: c(-mul(z0, s.i0).re, -mul(z0, s.i0).im) });
    expect(relErr(abs(v.b), 1.179)).toBeLessThan(0.001);
    expect(relErr(abs(v.c), 1.179)).toBeLessThan(0.001);
    expect(abs(v.a)).toBeLessThan(1e-12);
  });
  it('LL: Ib = 6.391 pu = 26.74 kA', () => {
    const p = seqToPhase(faultSequenceCurrents('LL', e, z1, z2, z0, zf));
    expect(relErr(abs(p.b), 6.391)).toBeLessThan(0.0005);
    expect(relErr(abs(p.b) * IB, 26.74)).toBeLessThan(0.001);
  });
  it('DLG: I1 = 4.5464, I2 = 2.8730, I0 = 1.6734 pu; Ib = 6.8983 pu; In = 5.0202 pu', () => {
    const s = faultSequenceCurrents('DLG', e, z1, z2, z0, zf);
    expect(relErr(abs(s.i1), 4.5464)).toBeLessThan(0.0005);
    expect(relErr(abs(s.i2), 2.8730)).toBeLessThan(0.0005);
    expect(relErr(abs(s.i0), 1.6734)).toBeLessThan(0.0005);
    const p = seqToPhase(s);
    expect(relErr(abs(p.b), 6.8983)).toBeLessThan(0.0005);
    expect(relErr(3 * abs(s.i0), 5.0202)).toBeLessThan(0.0005);
  });
});

describe('GOLDEN SC — GT-5 Schneider CT18 §4.1 (36 kV, c = 1, all fault types)', () => {
  // Zd = j1.22, Zi = j1.17, Zo = j1.04 Ω; published 17 / 18 / 15 / 17.6 kA [SC-02 p.19] (rounded → ±1.5 %)
  const e = c(36000 / Math.sqrt(3)), z1 = c(0, 1.22), z2 = c(0, 1.17), z0 = c(0, 1.04), zf = c(0);
  const kA = (x: number) => x / 1000;
  it('3PH 17 kA, SLG 18 kA, LL 15 kA, DLG 17.6 kA', () => {
    expect(relErr(kA(abs(seqToPhase(faultSequenceCurrents('3PH', e, z1, z2, z0, zf)).a)), 17)).toBeLessThan(0.015);
    expect(relErr(kA(abs(seqToPhase(faultSequenceCurrents('SLG', e, z1, z2, z0, zf)).a)), 18)).toBeLessThan(0.015);
    expect(relErr(kA(abs(seqToPhase(faultSequenceCurrents('LL', e, z1, z2, z0, zf)).b)), 15)).toBeLessThan(0.015);
    const dlg = seqToPhase(faultSequenceCurrents('DLG', e, z1, z2, z0, zf));
    expect(relErr(kA(Math.max(abs(dlg.b), abs(dlg.c))), 17.6)).toBeLessThan(0.015);
  });
});

describe('GOLDEN SC — network level', () => {
  it('GT-1 CT158 §2.4: 20 kV, 500 MVA upstream + 2 km 3×50 Cu line ⇒ IA ≈ 6,415 A (±1 %), ip ≈ 10,887 A (±1 %)', () => {
    // Upstream Zup = U²/Psc = 0.8 Ω; X = 0.98·Z, R = 0.2·Z ⇒ R/X = 0.2/0.98; line R = 0.72 Ω, X = 0.8 Ω; c = 1 [SC-01 pp.18–20]
    const net = emptyNet(50);
    net.buses.push({ id: 'S', kind: 'source', vnKV: 20 }, { id: 'A', kind: 'node', vnKV: 20 });
    net.sources.push({ id: 'Q', bus: 'S', vSetPu: 1, skMVA: 500, rx: 0.2 / 0.98, earthing: { kind: 'solid' }, z0OverZ1: 1 });
    net.cableTypes.push(cableType('OHL', { r20: 0.36, rOp: 0.36, x: 0.4 }));
    net.cables.push({ id: 'L', from: 'S', to: 'A', type: 'OHL', lengthKm: 2 });
    const r = shortCircuit(net, { bus: 'A' }, '3PH', { cFactor: 1, maxCase: true });
    expect(relErr(r.ikA, 6415)).toBeLessThan(0.01);
    expect(relErr(r.ipA, 10887)).toBeLessThan(0.01);
    expect(relErr(r.cables.get('L')!.iMax, r.ikA)).toBeLessThan(1e-9); // all fault current flows in the line
  });

  it('GT-4 CT18 §4.3: SLG, 5.5 kV, Rn = 100 Ω, C0 = 1 µF total ⇒ If ≈ 31.75 + j2.99 A (|If| = 31.89 A ±1 %)', () => {
    const net = emptyNet(50);
    net.buses.push({ id: 'S', kind: 'source', vnKV: 5.5 }, { id: 'X', kind: 'node', vnKV: 5.5 });
    // ω=2π·50 (paper uses 314) ; Z1, Z2 ≈ 0 (very stiff source), network capacitance 1 µF as a 1 km cable, tiny series Z
    net.sources.push({ id: 'Q', bus: 'S', vSetPu: 1, skMVA: 1e7, rx: 0.1, earthing: { kind: 'resistance', rOhm: 100 }, z0OverZ1: 1 });
    net.cableTypes.push(cableType('C', { r20: 1e-6, rOp: 1e-6, x: 1e-6, r0: 1e-6, x0: 1e-6, c0nF: 1000 }));
    net.cables.push({ id: 'K', from: 'S', to: 'X', type: 'C', lengthKm: 1 });
    const r = shortCircuit(net, { bus: 'S' }, 'SLG', { cFactor: 1 });
    expect(relErr(r.earthCurrentA, Math.hypot(31.75, 2.99))).toBeLessThan(0.01);
    // healthy phases rise to line-to-line voltage (≈ 5,500 V)
    expect(relErr(r.vPhase.b, 5500)).toBeLessThan(0.01);
    expect(relErr(r.vPhase.c, 5500)).toBeLessThan(0.01);
  });

  it('GT-R2-A: 20 MVA 33/11 kV Dyn, 10 % (X only) ⇒ solid SLG 10,497 A; NER 15.9 Ω ⇒ 399 A (±0.5 %)', () => {
    const mk = (earthing: { kind: 'solid' } | { kind: 'resistance'; rOhm: number }) => {
      const net = emptyNet(50);
      net.buses.push({ id: 'S', kind: 'source', vnKV: 11 });
      // X1 = X2 = X0 = 0.605 Ω on 11 kV: S''k = U²/X = 200 MVA with c = 1, pure reactance
      net.sources.push({ id: 'T', bus: 'S', vSetPu: 1, skMVA: 200, rx: 0, earthing, z0OverZ1: 1 });
      return net;
    };
    expect(relErr(shortCircuit(mk({ kind: 'solid' }), { bus: 'S' }, 'SLG', { cFactor: 1 }).ikA, 10497)).toBeLessThan(0.005);
    expect(relErr(shortCircuit(mk({ kind: 'resistance', rOhm: 15.9 }), { bus: 'S' }, 'SLG', { cFactor: 1 }).ikA, 399.1)).toBeLessThan(0.005);
  });
});
