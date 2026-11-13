import { describe, it, expect } from 'vitest';
import { generateGrading, evaluate, referenceGrading, defaultSettings, relayTime, CTI_S, INRUSH_MULT } from '../../src/engine/grading';

describe('Grading mode engine', () => {
  it('fault currents: LV-terminal < cable-end < busbar; min (LL, c=1.0) < max (3PH, c=1.1)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = generateGrading(seed);
      const c = (id: string) => g.cases.find((x) => x.id === id)!.iA;
      expect(c('lv-max')).toBeLessThan(c('cable-max'));
      expect(c('cable-max')).toBeLessThan(c('bus-max'));
      for (const w of ['lv', 'cable', 'bus']) expect(c(`${w}-min`)).toBeLessThan(c(`${w}-max`));
      // bus 3PH max = c·Un/√3 / Zq ⇒ consistent with S''k (IEC 60909): I = S''k / (√3·Un)
      expect(Math.abs(c('bus-max') - (g.skMVA * 1e6) / (Math.sqrt(3) * 13.8e3)) / c('bus-max')).toBeLessThan(1e-9);
    }
  });
  it('reference grading exists and passes every rule on 60 seeds', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const g = generateGrading(seed);
      const r = referenceGrading(g);
      expect(r, `seed ${seed}`).not.toBeNull();
      const failing = r!.evaluation.checks.filter((c) => !c.ok);
      expect(failing, `seed ${seed}`).toEqual([]);
    }
  });
  it('rules detect violations: CTI, inrush and load', () => {
    const g = generateGrading(7);
    const s = defaultSettings(g);
    // identical relays upstream and downstream ⇒ zero margin ⇒ CTI fails
    const same = { T: { ...s.T }, F: { ...s.T, pickupA: s.F.pickupA }, I: { ...s.T, pickupA: s.I.pickupA } };
    same.F.tms = same.T.tms; 
    const ev = evaluate(g, same);
    expect(ev.checks.some((c) => c.id === 'cti' && !c.ok)).toBe(true);
    // T pickup below 150 % overload ⇒ load check fails
    expect(evaluate(g, { ...s, T: { ...s.T, pickupA: g.inT } }).checks.find((c) => c.id === 'load' && c.relay === 'T')!.ok).toBe(false);
    // instantaneous high-set below inrush current ⇒ inrush check fails
    const hs = { ...s, T: { ...s.T, hsA: INRUSH_MULT * g.inT * 0.8, hsDelayS: 0 } };
    expect(evaluate(g, hs).checks.find((c) => c.id === 'inrush' && c.relay === 'T')!.ok).toBe(false);
    expect(CTI_S).toBe(0.3);
    expect(relayTime(s.T, s.T.pickupA)).toBe(Infinity);
  });
});
