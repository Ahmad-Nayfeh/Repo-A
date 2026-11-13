import { signal } from '@preact/signals';
import { generateScenario, type Difficulty, type DifficultySpec, type Scenario } from '../engine/scenario/district';
import { Simulation, type Action, type ActionResult } from '../engine/sim';
import { runBot } from '../engine/bot';
import { fnv1a32 } from '../engine/rng';
import { store } from '../i18n/i18n';

/** Engine + data version carried by every seed, share string and replay link (D-010). */
export const ENGINE_VERSION = 1;

export type PlayMode = 'daily' | 'training' | 'free';

export const TRAINING: { difficulty: Difficulty; seed: number; overrides: Partial<DifficultySpec>; hint: string }[] = [
  { difficulty: 'easy', seed: 101, overrides: { automated: 1, fpiType: 'three-phase', crews: 2 }, hint: 'tr1' },
  { difficulty: 'easy', seed: 202, overrides: { automated: 0.3, fpiType: 'three-phase' }, hint: 'tr2' },
  { difficulty: 'normal', seed: 303, overrides: { rings: 1, damageReports: false }, hint: 'tr3' },
];

export function todayUTC(): string { return new Date().toISOString().slice(0, 10); }
export function dailySeed(date = todayUTC()): number { return fnv1a32(`${date}|nightshift|v${ENGINE_VERSION}`); }
/** Daily condition-of-the-day: Friday hard, otherwise normal (D3-04 rotation, minimal v1). */
export function dailyDifficulty(date = todayUTC()): Difficulty { return new Date(`${date}T00:00:00Z`).getUTCDay() === 5 ? 'hard' : 'normal'; }

export class GameSession {
  readonly scenario: Scenario;
  readonly sim: Simulation;
  readonly actions: Action[] = [];
  readonly tick = signal(0);
  readonly mode: PlayMode;
  readonly training: number;
  readonly date: string | null;
  private parCache: number | null = null;

  constructor(opts: { mode: PlayMode; seed: number; difficulty: Difficulty; training?: number; date?: string; replay?: Action[] }) {
    this.mode = opts.mode;
    this.training = opts.training ?? -1;
    this.date = opts.date ?? null;
    const ov = this.training >= 0 ? TRAINING[this.training]!.overrides : {};
    this.scenario = generateScenario(opts.seed, opts.difficulty, ov);
    this.sim = new Simulation(this.scenario);
    // a replay already starts with the initial 'advance' (review G-01): never apply it twice
    if (opts.replay && opts.replay.length > 0) for (const a of opts.replay) this.apply(a);
    else this.apply({ kind: 'advance' }); // fault → protection trip
  }

  apply(a: Action): ActionResult {
    this.actions.push(a);
    const r = this.sim.apply(a);
    this.tick.value++;
    if (this.sim.complete) this.onComplete();
    return r;
  }

  /** CML of the reference strategy on the same scenario (computed in the browser, D3-22). */
  par(): number {
    if (this.parCache === null) {
      const r = runBot(this.scenario);
      this.parCache = r.finished ? r.sim.metrics().cmlOfgem : Infinity;
    }
    return this.parCache;
  }

  private parOverloadCache: number | null = null;
  parOverload(): number {
    if (this.parOverloadCache === null) { const r = runBot(this.scenario); this.parOverloadCache = r.sim.metrics().overloadMin; }
    return this.parOverloadCache;
  }

  stars(): number {
    if (!this.sim.complete) return 0;
    const m = this.sim.metrics();
    if (m.starEvents > 0) return 0;
    const par = this.par();
    // ★★★ also requires not running cables above rating longer than the reference strategy (review G-12, D-015)
    if (m.cmlOfgem <= par && m.overloadMin <= this.parOverload()) return 3;
    if (m.cmlOfgem <= 1.25 * par) return 2;
    return 1;
  }

  private done = false;
  private onComplete() {
    if (this.done) return;
    this.done = true;
    const m = this.sim.metrics();
    const key = `gs.best.${this.scenario.difficulty}`;
    const best = Number(store.get(key) ?? Infinity);
    if (m.cmlOfgem < best) store.set(key, String(m.cmlOfgem));
    if (this.mode === 'daily' && this.date) store.set(`gs.daily.${this.date}`, JSON.stringify({ cml: m.cmlOfgem, stars: this.stars() }));
    if (this.mode === 'training') store.set(`gs.training.${this.training}`, String(this.stars()));
  }

  replayUrl(): string {
    const a = btoa(unescape(encodeURIComponent(JSON.stringify(this.actions)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const base = location.href.split('#')[0];
    return `${base}#/play?v=${ENGINE_VERSION}&s=${this.scenario.seed}&d=${this.scenario.difficulty}${this.training >= 0 ? `&t=${this.training}` : ''}&a=${a}`;
  }
}

export function decodeActions(a: string): Action[] {
  const b64 = a.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(escape(atob(b64)))) as Action[];
}

export function dailyResult(date = todayUTC()): { cml: number; stars: number } | null {
  const s = store.get(`gs.daily.${date}`);
  if (!s) return null;
  try { return JSON.parse(s) as { cml: number; stars: number }; } catch { return null; }
}
