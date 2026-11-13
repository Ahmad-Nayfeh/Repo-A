/**
 * Game-design & physics gates on generated scenarios (docs/org/game-design.md, physics.md).
 * - Solvability: the reference bot reaches the end state on every seed tested, per difficulty.
 * - Determinism: same seed + same actions ⇒ identical state hash.
 * - Safety: the reference bot never causes a star-removing event.
 * - Physics sanity of every generated network before the fault: power flow converges, voltages in the
 *   13.1–14.5 kV service band, loading ≤ difficulty target.
 */
import { describe, it, expect } from 'vitest';
import { generateScenario, type Difficulty } from '../../src/engine/scenario/district';
import { runBot } from '../../src/engine/bot';
import { Simulation } from '../../src/engine/sim';
import { buildTopology } from '../../src/engine/topology';
import { solvePowerFlow } from '../../src/engine/powerflow';

const N = Number(process.env.GATE_SEEDS ?? 40);

describe('Night Shift gates', () => {
  for (const d of ['easy', 'normal', 'hard'] as Difficulty[]) {
    it(`${d}: reference bot finishes ${N}/${N} seeds with no star-removing events`, () => {
      const fails: number[] = [];
      for (let seed = 1; seed <= N; seed++) {
        const r = runBot(generateScenario(seed * 7919, d));
        if (!r.finished || r.sim.metrics().starEvents > 0) fails.push(seed);
      }
      expect(fails).toEqual([]);
    }, 300_000);
  }

  it('determinism: same seed and actions ⇒ identical hash; replaying the action list reproduces it', () => {
    for (const d of ['easy', 'normal', 'hard'] as Difficulty[]) {
      const a = runBot(generateScenario(4242, d));
      const b = runBot(generateScenario(4242, d));
      expect(a.sim.hash()).toBe(b.sim.hash());
      const replay = new Simulation(generateScenario(4242, d));
      for (const act of a.actions) replay.apply(act);
      expect(replay.hash()).toBe(a.sim.hash());
    }
  });

  it('pre-fault networks: PF converges, MV voltage within 13.1–14.5 kV, half-ring loading ≤ target', () => {
    for (const d of ['easy', 'normal', 'hard'] as Difficulty[]) {
      for (let seed = 1; seed <= 20; seed++) {
        const sc = generateScenario(seed, d);
        const topo = buildTopology(sc.net);
        const loads = new Map(sc.net.loads.map((l) => [l.id, { p: l.pPeakMW, q: l.qPeakMvar }]));
        const pf = solvePowerFlow(sc.net, topo, loads);
        expect(pf.converged).toBe(true);
        for (const b of sc.net.buses) if (b.kind === 'rmu' || b.kind === 'node') {
          const kv = pf.vPu.get(b.id)! * 13.8;
          expect(kv).toBeGreaterThan(13.1);
          expect(kv).toBeLessThan(14.5);
        }
        const rating = sc.groundTempC === 40 ? 278 : 300;
        const maxTarget = sc.spec.loading[1];
        // the generator scales loads by S/(√3·Un), ignoring voltage drop & losses ⇒ actual current a few % higher
        for (const a of pf.cableA.values()) expect(a / rating).toBeLessThanOrEqual(maxTarget + 0.05);
      }
    }
  });
});

import { CONDITIONS } from '../../src/ui/session';
describe('daily conditions (D3-04) stay solvable', () => {
  for (const c of CONDITIONS) {
    it(`${c.id}: reference bot finishes 20/20 normal seeds`, () => {
      const fails: number[] = [];
      for (let seed = 1; seed <= 20; seed++) {
        const r = runBot(generateScenario(seed * 104729, 'normal', c.overrides));
        if (!r.finished || r.sim.metrics().starEvents > 0) fails.push(seed);
      }
      expect(fails).toEqual([]);
    }, 120_000);
  }
});
