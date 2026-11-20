import type { GameSession } from './session';
import type { DifficultySpec } from '../engine/scenario/district';

/**
 * Lesson 1 — "The lights went out" (D-019, research/13 recommendation 1).
 * One action at a time, the target spotlighted, first homes back within about a minute of real time.
 * Physically correct order (we did NOT adopt the research note's "close the NOP first": that would re-energise the
 * fault from the other station): locate with indicators → isolate both ends → re-close the breaker → close the NOP.
 * Making the cable safe (earthing, permit, repair) is lesson 2; this lesson stops at restoration.
 */
export const TUTORIAL = {
  seed: 21,
  difficulty: 'easy' as const,
  overrides: { rings: 1, rmusPerRing: [5, 5], automated: 1, fpiType: 'three-phase', crews: 1, damageReports: false, hour: 2 } as Partial<DifficultySpec>,
};

export interface TutStep {
  id: string;
  /** i18n key of the instruction */
  key: string;
  params: Record<string, string | number>;
  targets: string[];
  /** site to open in the action panel */
  site?: string;
  /** the one action this step accepts (data-act); null = a "Continue" button */
  act: string | null;
  done: (s: GameSession) => boolean;
}

export function tutorialSteps(s: GameSession): TutStep[] {
  const sc = s.scenario, sim = s.sim;
  const ring = sc.rings[0]!;
  const fc = sc.fault.cable;
  const fi = ring.cables.indexOf(fc);
  const fedA = (sim.fedFrom(ring) ?? 'A') === 'A';
  const cb = fedA ? ring.ringSwitches[0]! : ring.ringSwitches[ring.ringSwitches.length - 1]!;
  const gs = fedA ? 'GA' : 'GB';
  const [near, far] = (() => { const e = sim.switchesBounding(fc).map((x) => x.id); return fedA ? [e[0]!, e[1]!] : [e[1]!, e[0]!]; })();
  const siteOf = (id: string) => sim.net.switches.find((x) => x.id === id)!.site;
  const lastLit = ring.rmus[fedA ? fi - 1 : fi]!, firstDark = ring.rmus[fedA ? fi : fi - 1]!;
  const dead = ring.rmus.filter((id) => !sim.isEnergised(`${id}B`));
  const nopSite = siteOf(ring.nop);
  const off0 = sim.customersOff();
  const sw = (id: string) => sim.net.switches.find((x) => x.id === id)!;
  let introSeen = false, bracketSeen = false;
  return [
    { id: 'intro', key: 'tut_intro', params: { n: off0, gs: gs === 'GA' ? 'A' : 'B' }, targets: [`sw:${cb}`, ...dead], act: null, done: () => introSeen, ...{ ack: () => { introSeen = true; } } },
    { id: 'read', key: 'tut_read', params: {}, targets: ['readAll'], act: 'readAll', done: (x) => dead.every((id) => x.sim.readings.some((r) => r.site === id)) },
    { id: 'bracket', key: 'tut_bracket', params: { a: lastLit, b: firstDark, cable: fc }, targets: [lastLit, firstDark, `cable:${fc}`], act: null, done: () => bracketSeen, ...{ ack: () => { bracketSeen = true; } } },
    { id: 'openNear', key: 'tut_openNear', params: { site: siteOf(near), sw: near }, targets: [`sw:${near}`], site: siteOf(near), act: `remote:${near}:open`, done: () => !sw(near).closed },
    { id: 'openFar', key: 'tut_openFar', params: { site: siteOf(far), sw: far }, targets: [`sw:${far}`], site: siteOf(far), act: `remote:${far}:open`, done: () => !sw(far).closed },
    { id: 'closeCb', key: 'tut_closeCb', params: { cb, gs: gs === 'GA' ? 'A' : 'B', site: lastLit }, targets: [`sw:${cb}`], site: gs, act: `remote:${cb}:close`, done: () => sw(cb).closed },
    { id: 'closeNop', key: 'tut_closeNop', params: { sw: ring.nop, site: nopSite, other: gs === 'GA' ? 'B' : 'A' }, targets: [`sw:${ring.nop}`], site: nopSite, act: `remote:${ring.nop}:close`, done: (x) => x.sim.customersOff() === 0 },
    { id: 'end', key: 'tut_end', params: { n: off0 }, targets: [], act: null, done: () => false },
  ] as TutStep[];
}

/** Acknowledge a "Continue" step. */
export function ackStep(step: TutStep) { (step as TutStep & { ack?: () => void }).ack?.(); }

export function currentStep(steps: TutStep[], s: GameSession): number {
  const i = steps.findIndex((st) => !st.done(s));
  return i < 0 ? steps.length - 1 : i;
}
