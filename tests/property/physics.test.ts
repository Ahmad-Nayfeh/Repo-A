/**
 * Physics property tests (docs/org/physics.md gate 2) on generated networks and random seeds.
 */
import { describe, it, expect } from 'vitest';
import { generateScenario, type Difficulty } from '../../src/engine/scenario/district';
import { buildTopology } from '../../src/engine/topology';
import { solvePowerFlow } from '../../src/engine/powerflow';
import { shortCircuit } from '../../src/engine/shortcircuit';
import { operateTime } from '../../src/engine/protection';
import { Simulation } from '../../src/engine/sim';
import { Rng } from '../../src/engine/rng';
import type { Network } from '../../src/engine/model';

const DIFFS: Difficulty[] = ['easy', 'normal', 'hard'];
const N = 70; // 3 × 70 = 210 cases per property

function pfAt(net: Network, scale: number) {
  const topo = buildTopology(net);
  const loads = new Map(net.loads.map((l) => [l.id, { p: l.pPeakMW * scale, q: l.qPeakMvar * scale }]));
  return { topo, pf: solvePowerFlow(net, topo, loads), loads };
}

describe('physics properties', () => {
  it('power balance: source P = Σ load P + losses (1e-6 pu of 10 MVA) on 210 random networks/load levels', () => {
    for (const d of DIFFS) for (let i = 0; i < N; i++) {
      const sc = generateScenario(1000 + i, d);
      const scale = 0.3 + new Rng(i).next() * 0.9;
      const { pf, loads } = pfAt(sc.net, scale);
      let pl = 0; for (const v of loads.values()) pl += v.p;
      expect(pf.converged).toBe(true);
      expect(Math.abs(pf.sourceMW - (pl + pf.lossesKW / 1000))).toBeLessThan(1e-5);
    }
  });

  it('voltage magnitude is non-increasing from each grid station to the normally open point (no generation)', () => {
    for (const d of DIFFS) for (let i = 0; i < N; i++) {
      const sc = generateScenario(2000 + i, d);
      const { pf } = pfAt(sc.net, 1);
      for (const ring of sc.rings) {
        const nop = ring.ringSwitches.indexOf(ring.nop);
        const busbars = ring.rmus.map((id) => pf.vPu.get(`${id}B`)!);
        const k = Math.floor((nop - 1) / 2); // RMU holding the NOP
        const sideA = busbars.slice(0, k + (ring.nop.endsWith('-R') ? 1 : 0));
        const sideB = busbars.slice(k + (ring.nop.endsWith('-R') ? 1 : 0)).reverse();
        for (const side of [sideA, sideB]) for (let j = 1; j < side.length; j++) expect(side[j]!).toBeLessThanOrEqual(side[j - 1]! + 1e-12);
      }
    }
  });

  it('fault current is non-increasing with fault resistance (SLG and 3PH, random cable and position)', () => {
    for (const d of DIFFS) for (let i = 0; i < N; i++) {
      const sc = generateScenario(3000 + i, d);
      const rng = new Rng(i);
      const cab = rng.pick(sc.net.cables);
      const frac = rng.range(0.05, 0.95);
      for (const type of ['SLG', '3PH'] as const) {
        let prev = Infinity;
        for (const zf of [0, 0.5, 2, 5, 20]) {
          const r = shortCircuit(sc.net, { cable: cab.id, frac }, type, { zfOhm: zf });
          if (!r.energised) break;
          expect(r.ikA).toBeLessThanOrEqual(prev + 1e-9);
          prev = r.ikA;
        }
      }
    }
  });

  it('every fault current ≤ the c_max bolted value of the same type; I_SLG ≤ I_3PH wherever |Z0| ≥ |Z1|', () => {
    for (const d of DIFFS) for (let i = 0; i < N; i++) {
      const sc = generateScenario(4000 + i, d);
      const rng = new Rng(i + 77);
      const cab = rng.pick(sc.net.cables);
      const loc = { cable: cab.id, frac: rng.range(0.05, 0.95) };
      for (const type of ['SLG', 'LL', 'DLG', '3PH'] as const) {
        const bolted = shortCircuit(sc.net, loc, type, { maxCase: true });
        const withZ = shortCircuit(sc.net, loc, type, { maxCase: false, zfOhm: rng.range(0, 3) });
        if (!bolted.energised) continue;
        expect(withZ.ikA).toBeLessThanOrEqual(bolted.ikA * (1 + 1e-9));
      }
      const s1 = shortCircuit(sc.net, loc, 'SLG'), s3 = shortCircuit(sc.net, loc, '3PH');
      if (s1.energised) {
        const m0 = Math.hypot(s1.z0.re, s1.z0.im), m1 = Math.hypot(s1.z1.re, s1.z1.im);
        if (m0 >= m1) expect(s1.ikA).toBeLessThanOrEqual(s3.ikA * (1 + 1e-9));
        // equipment rating (21 kA) is respected by the generated networks
        expect(Math.max(s1.ikA, s3.ikA) / 1000).toBeLessThan(21);
      }
    }
  });

  it('relay operate time is non-increasing with current for every curve', () => {
    for (const curve of ['IEC_SI', 'IEC_VI', 'IEC_EI', 'IEC_LTI', 'IEEE_MI', 'IEEE_VI', 'IEEE_EI'] as const) {
      let prev = Infinity;
      for (let m = 1.01; m < 40; m *= 1.05) { const t = operateTime(curve, m * 100, 100, 0.3); expect(t).toBeLessThanOrEqual(prev); prev = t; }
    }
  });
});

describe('fault passage indicators (indication logic P-03/P-04, OP-05 §11.3)', () => {
  it('only indicators between the feeding source and the fault flag; earth-only FPIs stay dark on a symmetrical fault', () => {
    let checked = 0;
    for (let seed = 1; seed <= 60 && checked < 30; seed++) {
      const sc = generateScenario(seed, 'normal');
      const sim = new Simulation(sc);
      sim.advance();
      const rec = sim.relayRecords[0]!;
      const ring = sc.rings.find((r) => r.ringSwitches[0] === rec.cb || r.ringSwitches[r.ringSwitches.length - 1] === rec.cb)!;
      const fedA = ring.ringSwitches[0] === rec.cb;
      const f = ring.cables.indexOf(sc.fault.cable);
      for (let k = 0; k < ring.rmus.length; k++) {
        const between = fedA ? k < f : k >= f;  // RMU k lies on the path source → fault
        for (const side of ['FL', 'FR'] as const) {
          const fp = sc.net.fpis.find((x) => x.id === `${ring.rmus[k]}-${side}`)!;
          const st = sim.fpi.get(fp.id)!;
          const flagged = st.phase || st.earth;
          if (sc.staleFpis.includes(fp.id)) continue;
          // the panel facing away from the source on the RMU just before the fault, and every panel on the path, carry fault current
          const onPath = between && !(fedA ? (side === 'FL' && k === f) : (side === 'FR' && k === f - 1));
          const visible = fp.type === 'three-phase' || sc.fault.type !== '3PH';
          if (!onPath) expect(flagged).toBe(false);
          else if (!visible) expect(flagged).toBe(false);
          else expect(flagged).toBe(true);
        }
      }
      checked++;
    }
    expect(checked).toBe(30);
  });
});
