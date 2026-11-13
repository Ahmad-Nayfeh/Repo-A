/**
 * GOLDEN — Baran & Wu 33-bus radial feeder, MATPOWER `case33bw` data variant (fetched at test time, D-005).
 * Expected (research/04-power-flow.md, PF-C1 [D] three independent solvers; literature 202.67–202.68 kW [S]):
 *   total losses 202.677 kW, minimum voltage 0.913090 pu at bus 18.
 * Tolerances (FIDELITY F1): losses ±0.1 %, Vmin ±1e-4 pu.
 */
import { describe, it, expect } from 'vitest';
import { fetchCached, matpowerBlock } from './fetch';
import type { Network } from '../../src/engine/model';
import { buildTopology } from '../../src/engine/topology';
import { solvePowerFlow, S_BASE_MVA } from '../../src/engine/powerflow';

const URL = 'https://raw.githubusercontent.com/MATPOWER/matpower/master/data/case33bw.m';

function buildNetwork(text: string): { net: Network; loads: Map<string, { p: number; q: number }> } {
  const bus = matpowerBlock(text, 'bus');
  const branch = matpowerBlock(text, 'branch');
  const kV = bus[0]![9]!;
  const net: Network = {
    buses: bus.map((b) => ({ id: `B${String(b[0]).padStart(2, '0')}`, kind: b[1] === 3 ? 'source' : 'node', vnKV: kV })),
    sources: [{ id: 'S1', bus: 'B01', vSetPu: 1.0, skMVA: 1e9, rx: 0.1, earthing: { kind: 'solid' }, z0OverZ1: 1 }],
    cableTypes: [], cables: [], switches: [], transformerTypes: [], transformers: [], loads: [], fpis: [], relays: [], fMainsHz: 60,
  };
  branch.forEach((r, k) => {
    if (r[10] !== 1) return; // status
    const tid = `T${k}`;
    net.cableTypes.push({ id: tid, r20: r[2]!, rOp: r[2]!, x: r[3]!, r0: 0, x0: 0, c0nF: 0, ampacityA: 1000, conductorK: 94, areaMm2: 1, screenIk1s_kA: 1, src: 'case33bw' });
    net.cables.push({ id: `L${k + 1}`, from: `B${String(r[0]).padStart(2, '0')}`, to: `B${String(r[1]).padStart(2, '0')}`, type: tid, lengthKm: 1 });
  });
  const loads = new Map<string, { p: number; q: number }>();
  for (const b of bus) {
    if (b[2] === 0 && b[3] === 0) continue;
    const id = `D${b[0]}`;
    net.loads.push({ id, bus: `B${String(b[0]).padStart(2, '0')}`, customers: 1, pPeakMW: b[2]! / 1000, qPeakMvar: b[3]! / 1000, cls: 'mixed' });
    loads.set(id, { p: b[2]! / 1000, q: b[3]! / 1000 });
  }
  void S_BASE_MVA;
  return { net, loads };
}

describe('GOLDEN power flow — 33-bus (case33bw)', async () => {
  const text = await fetchCached('case33bw.m', URL);
  it.skipIf(text === null)('losses 202.677 kW ±0.1 %, Vmin 0.913090 pu @ bus 18 ±1e-4', () => {
    const { net, loads } = buildNetwork(text!);
    const topo = buildTopology(net);
    const pf = solvePowerFlow(net, topo, loads);
    expect(pf.converged).toBe(true);
    let vmin = 9, at = '';
    for (const [id, v] of pf.vPu) if (v < vmin) { vmin = v; at = id; }
    console.log(`[golden 33-bus] losses=${pf.lossesKW.toFixed(4)} kW  Vmin=${vmin.toFixed(6)} pu @ ${at}  iters=${pf.iterations}`);
    expect(Math.abs(pf.lossesKW - 202.677) / 202.677).toBeLessThan(0.001);
    expect(Math.abs(vmin - 0.91309)).toBeLessThan(1e-4);
    expect(at).toBe('B18');
    // power balance property: source P = Σ load P + losses
    let pl = 0; for (const v of loads.values()) pl += v.p;
    expect(Math.abs(pf.sourceMW - (pl + pf.lossesKW / 1000))).toBeLessThan(1e-9);
  });
});
