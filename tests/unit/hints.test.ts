import { describe, it, expect } from 'vitest';
import { generateScenario } from '../../src/engine/scenario/district';
import { Simulation, type Action } from '../../src/engine/sim';
import { nextStep, actToAction, analyze, lookStep } from '../../src/ui/hints';

/** Following only the tier-3 hint ("exact next step") must always finish the shift safely (D-019). */
function followHints(seed: number, d: 'easy' | 'normal' | 'hard') {
  const sc = generateScenario(seed, d);
  const sim = new Simulation(sc);
  sim.apply({ kind: 'advance' });
  for (let n = 0; n < 600 && !sim.complete; n++) {
    const st = nextStep(sc, sim)!;
    expect(lookStep(sc, sim).key).toMatch(/^h1_/);
    const a = actToAction(st.act!);
    expect(a, `${d} ${seed}: ${st.key} has no engine action`).not.toBeNull();
    let r = sim.apply(a!);
    // the UI routes these through the checklist dialog exactly like this
    if (!r.ok && r.reason === 'needChecklist') r = sim.apply({ ...a!, justification: 'delay' } as Action);
    if (!r.ok && r.reason === 'delayNotElapsed') sim.apply({ kind: 'wait', minutes: Number(r.reasonData?.leftMin ?? 1) });
    if (!r.ok && r.reason === 'crewsNotClear') sim.apply({ kind: 'standClear', crew: Number(r.reasonData?.crew) });
  }
  return { sim, sc };
}

describe('tiered hints', () => {
  for (const d of ['easy', 'normal', 'hard'] as const) {
    it(`tier-3 hints alone complete ${d} shifts with no safety star-events`, () => {
      for (let seed = 1; seed <= 12; seed++) {
        const { sim } = followHints(seed, d);
        expect(sim.complete, `${d} seed ${seed}`).toBe(true);
        expect(sim.metrics().starEvents, `${d} seed ${seed}`).toBe(0);
      }
    });
  }
  it('goal phase starts at "locate" and never reveals the fault before evidence', () => {
    const sc = generateScenario(5, 'normal');
    const sim = new Simulation(sc);
    sim.apply({ kind: 'advance' });
    const a = analyze(sc, sim);
    expect(a.phase).toBe('locate');
    expect(a.located).toBeNull();
  });
});
