/** Regression for review G-01: a replay link must reproduce the game exactly (initial 'advance' applied once). */
import { describe, it, expect } from 'vitest';
import { GameSession } from '../../src/ui/session';
import { runBot } from '../../src/engine/bot';
import { generateScenario } from '../../src/engine/scenario/district';

describe('replay links', () => {
  for (const [seed, d] of [[777, 'easy'], [31337, 'normal'], [4242, 'hard']] as const) {
    it(`${d} seed ${seed}: replaying the recorded actions gives the same hash and customer-minutes`, () => {
      const live = new GameSession({ mode: 'free', seed, difficulty: d });
      for (const a of runBot(generateScenario(seed, d)).actions.slice(1)) live.apply(a);
      expect(live.sim.complete).toBe(true);
      const replay = new GameSession({ mode: 'free', seed, difficulty: d, replay: live.actions });
      expect(replay.sim.hash()).toBe(live.sim.hash());
      expect(replay.sim.metrics().cmlOfgem).toBe(live.sim.metrics().cmlOfgem);
    });
  }
});
