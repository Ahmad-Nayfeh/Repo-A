import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { GameSession } from './session';
import { NetworkView } from './NetworkView';
import { runBot } from '../engine/bot';
import type { Action } from '../engine/sim';
import { t, fmt, clock } from '../i18n/i18n';
import { Icon } from './icons';
import { useSpotlight } from './spotlight';

/**
 * "Watch the solution" (D-019, research/13 §5 — Nintendo Super Guide pattern): the reference strategy plays the
 * same incident like a narrated video. Pause, step back/forward, 1×/2×, and "take over from here" at any step.
 * It is generated from the deterministic engine (no recorded video file), so it always matches the incident.
 * Limitation (stated in the UI): it plays from the start of the incident, not from the player's current state.
 */
interface DemoStep { upto: number; a: Action }

function buildSteps(actions: Action[]): DemoStep[] {
  const out: DemoStep[] = [];
  actions.forEach((a, i) => { if (i > 0 && a.kind !== 'advance' && a.kind !== 'wait') out.push({ upto: i + 1, a }); });
  return out;
}

const targetOf = (a: Action, s: GameSession): string[] => {
  switch (a.kind) {
    case 'remote': case 'crewOp': case 'secure': case 'proveDead': case 'earth': return [`sw:${a.switch}`];
    case 'dispatch': case 'readRemote': return [a.site];
    case 'readFpi': case 'attendDamage': case 'standClear': { const c = s.sim.crews[a.crew]; return c?.site ? [c.site] : []; }
    case 'permit': case 'repair': return [`cable:${a.cable}`];
    default: return [];
  }
};

/** Caption: what happened and why, from the state before and after the action. */
function caption(a: Action, before: GameSession, after: GameSession): string {
  const sc = after.scenario, sim = after.sim;
  const ring = sc.rings.find((r) => r.ringSwitches.some((id) => 'switch' in a && id === a.switch)) ?? sc.rings[0]!;
  const fc = sc.fault.cable;
  const bounds = new Set(sim.switchesBounding(fc).map((x) => x.id));
  const restored = before.sim.customersOff() - sim.customersOff();
  const tripped = sim.relayRecords.length > before.sim.relayRecords.length;
  const crew: Record<string, number> = 'crew' in a ? { crew: a.crew + 1 } : {};
  let k: string; let p: Record<string, string | number> = { ...crew };
  switch (a.kind) {
    case 'readRemote': {
      const lit = sim.readings.filter((r) => r.site === a.site).slice(-2).some((r) => r.phase || r.earth);
      k = lit ? 'demo_readLit' : 'demo_readDark'; p = { site: a.site }; break;
    }
    case 'readFpi': {
      const site = sim.crews[a.crew]!.site ?? '';
      const lit = sim.readings.filter((r) => r.site === site).slice(-2).some((r) => r.phase || r.earth);
      k = lit ? 'demo_readLit' : 'demo_readDark'; p = { site, ...crew }; break;
    }
    case 'dispatch': k = 'demo_dispatch'; p = { site: a.site, ...crew }; break;
    case 'remote': case 'crewOp': {
      const sw = sim.net.switches.find((x) => x.id === a.switch)!;
      const how = a.kind === 'remote' ? t('demo_byRemote') : t('demo_byCrew', crew);
      p = { sw: a.switch, how, n: Math.max(0, restored) };
      if (a.op === 'open') k = bounds.has(a.switch) ? 'demo_openIsolate' : a.switch === ring.nop || !sc.net.switches.find((x) => x.id === a.switch)!.closed ? 'demo_openNop' : sw.kind === 'CB' ? 'demo_openCb' : 'demo_openSplit';
      else if (tripped) k = 'demo_closeTrip';
      else if (restored > 0) k = sw.kind === 'CB' ? 'demo_closeCbOk' : 'demo_closeRestore';
      else k = 'demo_closeDead';
      break;
    }
    case 'secure': k = a.on === false ? 'demo_unsecure' : 'demo_secure'; p = { sw: a.switch, ...crew }; break;
    case 'proveDead': k = 'demo_proveDead'; p = { sw: a.switch, ...crew }; break;
    case 'earth': k = a.on ? 'demo_earthOn' : 'demo_earthOff'; p = { sw: a.switch, ...crew }; break;
    case 'attendDamage': k = 'demo_attend'; break;
    case 'permit': k = a.on ? 'demo_permitOn' : 'demo_permitOff'; p = { cable: a.cable }; break;
    case 'repair': k = 'demo_repair'; p = { cable: a.cable }; break;
    case 'standClear': k = 'demo_standClear'; break;
    default: k = 'demo_wait';
  }
  return t(k, p);
}

export function DemoPlayer({ base, onClose, onTakeOver }: { base: GameSession; onClose: () => void; onTakeOver?: (actions: Action[]) => void }) {
  const actions = useMemo(() => runBot(base.scenario).actions, [base]);
  const steps = useMemo(() => buildSteps(actions), [actions]);
  const mk = (upto: number) => new GameSession({ mode: base.mode, seed: base.scenario.seed, difficulty: base.scenario.difficulty, training: base.training >= 0 ? base.training : undefined, date: base.date ?? undefined, replay: actions.slice(0, Math.max(1, upto)), ghost: true });
  const [i, setI] = useState(-1); // -1 = the moment after the trip
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [view, setView] = useState(() => ({ s: mk(1), cap: t('demo_start') }));
  const narrow = typeof matchMedia === 'function' && matchMedia('(max-width: 600px)').matches;
  const timer = useRef<number | null>(null);

  const goTo = (j: number) => {
    const jj = Math.max(-1, Math.min(steps.length - 1, j));
    if (jj < 0) { setView({ s: mk(1), cap: t('demo_start') }); setI(-1); return; }
    const before = mk(jj === 0 ? 1 : steps[jj - 1]!.upto);
    const after = mk(steps[jj]!.upto);
    setView({ s: after, cap: caption(steps[jj]!.a, before, after) });
    setI(jj);
  };
  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    timer.current = window.setTimeout(() => goTo(i + 1), (i < 0 ? 2600 : 3200) / speed);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, i, speed]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === 'ArrowRight') goTo(document.dir === 'rtl' ? i - 1 : i + 1);
      else if (e.key === 'ArrowLeft') goTo(document.dir === 'rtl' ? i + 1 : i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i]);
  const cur = i >= 0 ? steps[i]!.a : null;
  useSpotlight('.demo', cur ? targetOf(cur, view.s) : []);
  const sim = view.s.sim;
  const done = i >= steps.length - 1;
  return (
    <div class="demo" role="dialog" aria-modal="true" aria-labelledby="demo-title">
      <header class="demo-head">
        <span class="rec" aria-hidden="true" />
        <h2 id="demo-title">{t('demoTitle')}</h2>
        <span class="demo-clock"><Icon name="clock" size={16} /> {clock(sim.hourOfDay())}</span>
        <span class="demo-off"><Icon name="house" size={16} /> {t('homesOffN', { n: sim.customersOff() })}</span>
        <button class="ghost" onClick={onClose} aria-label={t('close')}><Icon name="x" /></button>
      </header>
      <div class="demo-stage">
        <NetworkView s={view.s} selection={null} onSelect={() => {}} ringFilter={narrow ? (view.s.scenario.rings.find((r) => r.cables.includes(view.s.scenario.fault.cable))!.id) : null} vertical={narrow} />
      </div>
      <div class="demo-caption" aria-live="polite">
        <bdi class="step-n" dir="ltr">{i < 0 ? '0' : fmt(i + 1)} / {fmt(steps.length)}</bdi>
        <p>{done && i >= 0 ? `${view.cap} ${t('demo_finished')}` : view.cap}</p>
      </div>
      <div class="demo-bar" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={i + 1}><span style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
      <div class="demo-controls">
        <button onClick={() => goTo(i - 1)} aria-label={t('demoBack')} disabled={i < 0}><Icon name="stepb" /></button>
        <button class="primary play" onClick={() => { if (done) goTo(-1); setPlaying((p) => !p || done); }} aria-label={playing ? t('demoPause') : t('demoPlay')}><Icon name={playing ? 'pause' : 'play'} /></button>
        <button onClick={() => goTo(i + 1)} aria-label={t('demoFwd')} disabled={done}><Icon name="stepf" /></button>
        <button class={`speed ${speed === 2 ? 'on' : ''}`} onClick={() => setSpeed(speed === 1 ? 2 : 1)} aria-label={t('demoSpeed')}>{speed}×</button>
        {onTakeOver && <button class="takeover" onClick={() => onTakeOver(actions.slice(0, i < 0 ? 1 : steps[i]!.upto))}><Icon name="hand" /> {t('demoTakeOver')}</button>}
      </div>
      <p class="demo-note muted">{t('demoNote')}</p>
    </div>
  );
}
