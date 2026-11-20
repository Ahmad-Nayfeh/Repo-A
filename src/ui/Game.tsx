import { useEffect, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { dailyCondition, type GameSession } from './session';
import { NetworkView, type Selection } from './NetworkView';
import { t, fmt, clock } from '../i18n/i18n';
import type { Action, ActionResult, Justification } from '../engine/sim';
import type { Switch } from '../engine/model';
import { CABLE_3x300AL } from '../data/params';
import { Results } from './Results';
import { chime } from '../audio/synth';
import { Icon } from './icons';
import { analyze, goalKey, lookStep, nextStep, principleKey, actOf } from './hints';
import { tutorialSteps, currentStep, ackStep, type TutStep } from './tutorial';
import { useSpotlight } from './spotlight';
import { DemoPlayer } from './Demo';

type Tab = 'crews' | 'evidence' | 'log';

/**
 * Game screen v2 (D-019, research/13):
 * - one goal line that always says what to do now; three numbers that matter (homes off, clock, customer-minutes)
 * - the map is the main surface; tapping a device opens one action card with large labelled buttons
 * - a guide card for the lesson steps and for the tiered hints (look → why → exact step → watch the solution)
 * - secondary information (crews, evidence, log) sits in a drawer and is hidden in the first lesson
 */
export function Game({ s, onExit, onNext, onTakeOver }: { s: GameSession; onExit: () => void; onNext?: () => void; onTakeOver?: (a: Action[]) => void }) {
  void s.tick.value;
  const sim = s.sim, sc = s.scenario;
  const tutorial = s.mode === 'tutorial';
  const [sel, setSel] = useState<Selection>(null);
  const [tab, setTab] = useState<Tab | null>(null);
  const [toast, setToast] = useState<{ text: string; kind: 'bad' | 'good' | 'info' } | null>(null);
  const [check, setCheck] = useState<{ action: Action; sw: string; crew: number | null } | null>(null);
  const [ringPick, setRingPick] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 600px)').matches);
  const [engineer, setEngineer] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [hintTier, setHintTier] = useState(0); // 0 = closed
  const [demo, setDemo] = useState(false);
  const [idle, setIdle] = useState(false);
  const lastAct = useRef(Date.now());
  const [steps] = useState<TutStep[] | null>(() => (tutorial ? tutorialSteps(s) : null));
  const [, force] = useState(0);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(max-width: 600px)');
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  // tier 0: after 25 s without progress the hint button pulses — nothing pops up (research/13 §4)
  useEffect(() => {
    const id = window.setInterval(() => setIdle(Date.now() - lastAct.current > 25000), 2000);
    return () => clearInterval(id);
  }, []);

  const a = analyze(sc, sim);
  const step = steps ? steps[currentStep(steps, s)]! : null;
  const stepIdx = steps ? currentStep(steps, s) : -1;
  // open the device the lesson step is about
  useEffect(() => { if (step?.site) setSel({ kind: 'site', id: step.site }); }, [stepIdx]);

  const hint = hintTier >= 3 ? nextStep(sc, sim) : hintTier >= 1 ? lookStep(sc, sim) : null;
  const targets = step ? step.targets.concat(step.act ? [step.act] : []) : hint ? hint.targets.concat(hintTier >= 3 && hint.act ? [hint.act] : []) : [];
  useSpotlight('.game', demo ? [] : targets);
  useEffect(() => { if (hintTier >= 3 && hint?.site && !step) setSel({ kind: 'site', id: hint.site }); }, [hintTier, hint?.key, hint?.site]);
  // phones: bring the highlighted map element into view (the guide card stays pinned at the top)
  useEffect(() => {
    if (!narrow || (!step && hintTier === 0)) return;
    const id = window.setTimeout(() => document.querySelector('.game .net .spot')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
    return () => clearTimeout(id);
  }, [stepIdx, hintTier, narrow]);

  const msg = (r: ActionResult) => {
    if (r.ok) return;
    const key = `blk_${r.reason}`;
    const data: Record<string, string | number> = { ...(r.reasonData ?? {}) };
    if (typeof data.crew === 'number') data.crew = data.crew + 1;
    setToast({ text: t(key) !== key ? t(key, data) : t(`err_${r.reason}`), kind: 'bad' });
  };
  const run = (act: Action) => {
    // lesson gate: one action at a time, explained — never a silent no-op (research/13 §1)
    if (step) {
      if (step.act === null || actOf(act) !== step.act) { setToast({ text: t('tut_notNow'), kind: 'info' }); return; }
    }
    lastAct.current = Date.now(); setIdle(false);
    const trips = sim.relayRecords.length;
    const offBefore = sim.customersOff();
    const r = s.apply(act);
    if (r.reason === 'needChecklist' && (act.kind === 'remote' || act.kind === 'crewOp')) {
      setCheck({ action: act, sw: act.switch, crew: act.kind === 'crewOp' ? act.crew : null });
      return;
    }
    if (!r.ok) { msg(r); return; }
    const back = offBefore - sim.customersOff();
    if (sim.relayRecords.length > trips) { chime(); setToast({ text: t('tripped_again'), kind: 'bad' }); }
    else if (back > 0) setToast({ text: t('homesBack', { n: back }), kind: 'good' });
    else setToast(null);
  };
  const readAll = () => {
    if (step && step.act !== 'readAll') { setToast({ text: t('tut_notNow'), kind: 'info' }); return; }
    lastAct.current = Date.now();
    for (const x of sc.sites) if (x.kind === 'rmu' && x.remote && x.commsOk) s.apply({ kind: 'readRemote', site: x.id });
    setToast(null);
  };
  const select = (x: Selection) => {
    setSel(x);
    if (narrow) requestAnimationFrame(() => document.querySelector('.card-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };
  const openHint = () => {
    const nt = Math.min(3, hintTier + 1);
    setHintTier(nt);
    s.help.tier = Math.max(s.help.tier, nt);
  };
  const takeOver = (acts: Action[]) => { setDemo(false); s.help.demo = true; onTakeOver?.(acts); };

  if (demo) return <div class="game"><DemoPlayer base={s} onClose={() => setDemo(false)} onTakeOver={sim.complete ? undefined : takeOver} /></div>;
  if (sim.complete && showResults && !tutorial) return <Results s={s} onExit={onExit} onBack={() => setShowResults(false)} onNext={onNext} onWatch={() => setDemo(true)} />;

  const ringOfFault = a.ring.id;
  const ladderRing = ringPick ?? ringOfFault;
  const showRing = narrow || sc.rings.length > 1 ? (narrow ? ladderRing : ringPick) : null;
  const goal = step ? null : t(goalKey(a));
  return (
    <div class={`game ${tutorial ? 'lesson' : ''}`}>
      <header class="hud2">
        <button class="ghost icon-only" onClick={onExit} aria-label={t('menu')}><Icon name="menu" size={22} /></button>
        <div class="goal" aria-live="polite">
          <span class="goal-k">{t('goal')}</span>
          <b>{step ? t(`goalTut_${step.id}`) : goal}</b>
        </div>
        <div class="stats">
          <div class={`stat ${sim.customersOff() > 0 ? 'bad' : 'good'}`}><Icon name="house" size={18} /><span><b>{fmt(sim.customersOff())}</b><small>{t('homesOff')}</small></span></div>
          <div class="stat"><Icon name="clock" size={18} /><span><b>{clock(sim.hourOfDay())}</b><small>{t('time')}</small></span></div>
          <div class="stat" title={t('cmlRuleNote')}><Icon name="star" size={18} /><span><b>{fmt(sim.metrics().cmlOfgem)}</b><small>{t('customerMinutes')}</small></span></div>
        </div>
        {!tutorial && <button class={`hint-btn ${idle && hintTier === 0 ? 'pulse' : ''}`} onClick={openHint} aria-label={t('hint')}><Icon name="bulb" size={20} /> <span>{t('hint')}</span></button>}
      </header>
      {s.mode === 'daily' && s.date && <p class="cond-chip">{t('daily')} · <b>{t(`cond_${dailyCondition(s.date).id}`)}</b></p>}
      {toast && <div class={`toast2 ${toast.kind}`} role={toast.kind === 'bad' ? 'alert' : 'status'} onClick={() => setToast(null)}>{toast.text}</div>}

      <div class="board2">
        <section class="map2">
          <div class="toolbar">
            <button class="tool" data-act="readAll" onClick={readAll}><Icon name="read" /> {t('readAll')}</button>
            {!tutorial && <>
              <button class="tool" data-act="wait:5" onClick={() => run({ kind: 'wait', minutes: 5 })}><Icon name="clock" /> {t('wait5')}</button>
              <button class="tool" data-act="advance" onClick={() => run({ kind: 'advance' })}><Icon name="fwd" /> {t('advance')}</button>
            </>}
            {(sc.rings.length > 1) && <div class="ring-tabs" role="group" aria-label={t('ring')}>
              {!narrow && <button class={ringPick === null ? 'on' : ''} onClick={() => setRingPick(null)}>{t('allRings')}</button>}
              {sc.rings.map((r) => <button key={r.id} class={showRing === r.id ? 'on' : ''} onClick={() => setRingPick(r.id)}>{r.id}</button>)}
            </div>}
          </div>
          <NetworkView s={s} selection={sel} onSelect={select} ringFilter={showRing} vertical={narrow} />
          <Legend />
        </section>
        <aside class="side2">
          {(step || hintTier > 0) && <GuideCard s={s} step={step} steps={steps} tier={hintTier} onMore={openHint} onClose={() => setHintTier(0)}
            onContinue={() => { if (step) { ackStep(step); force((n) => n + 1); } }} onDemo={() => { s.help.demo = true; setDemo(true); }} onExit={onExit} onNext={onNext} />}
          <div class="card-panel">
            <DeviceCard s={s} sel={sel} run={run} engineer={engineer} />
          </div>
          {!tutorial && (
            <div class="drawer">
              <nav class="tabs2" role="tablist">
                {(['crews', 'evidence', 'log'] as Tab[]).map((k) => (
                  <button key={k} role="tab" aria-selected={tab === k} class={tab === k ? 'on' : ''} onClick={() => setTab(tab === k ? null : k)}>{t(`tab${k[0]!.toUpperCase()}${k.slice(1)}`)}</button>
                ))}
              </nav>
              {tab && <div class="tab-body">
                {tab === 'crews' && <CrewPanel s={s} />}
                {tab === 'evidence' && <EvidencePanel s={s} engineer={engineer} />}
                {tab === 'log' && <LogPanel s={s} />}
                <label class="eng"><input type="checkbox" checked={engineer} onChange={(e) => setEngineer((e.target as HTMLInputElement).checked)} /> {t('engineerView')}</label>
              </div>}
            </div>
          )}
        </aside>
      </div>
      {check && <Checklist s={s} c={check} onCancel={() => setCheck(null)} onConfirm={(j) => {
        const act = { ...check.action, justification: j } as Action;
        setCheck(null);
        run(act);
      }} />}
      <p class="ruleset-note">{t('rulesetNote')}</p>
    </div>
  );
}

function Legend() {
  return (
    <ul class="legend" aria-label={t('legend')}>
      <li><svg viewBox="0 0 24 8" aria-hidden="true"><line x1="1" y1="4" x2="23" y2="4" class="lg-live" /></svg>{t('lgLive')}</li>
      <li><svg viewBox="0 0 24 8" aria-hidden="true"><line x1="1" y1="4" x2="23" y2="4" class="lg-dead" /></svg>{t('lgDead')}</li>
      <li><svg viewBox="0 0 24 10" aria-hidden="true"><line x1="3" y1="6" x2="8" y2="6" class="lg-sw" /><line x1="8" y1="6" x2="16" y2="6" class="lg-sw" /><line x1="16" y1="6" x2="21" y2="6" class="lg-sw" /></svg>{t('lgClosed')}</li>
      <li><svg viewBox="0 0 24 10" aria-hidden="true"><line x1="3" y1="7" x2="8" y2="7" class="lg-sw" /><line x1="8" y1="7" x2="15" y2="2" class="lg-sw" /><line x1="16" y1="7" x2="21" y2="7" class="lg-sw" /></svg>{t('lgOpen')}</li>
      <li><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 11V1H10L8.8 3 10 5H3" class="lg-flag" /></svg>{t('lgFlag')}</li>
      <li><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6 6 1.5 11 6V11H1Z" class="lg-home" /></svg>{t('lgHomes')}</li>
    </ul>
  );
}

function GuideCard({ s, step, steps, tier, onMore, onClose, onContinue, onDemo, onExit, onNext }: {
  s: GameSession; step: TutStep | null; steps: TutStep[] | null; tier: number; onMore: () => void; onClose: () => void; onContinue: () => void; onDemo: () => void; onExit: () => void; onNext?: () => void;
}) {
  const sc = s.scenario, sim = s.sim;
  if (step && steps) {
    const n = steps.indexOf(step);
    const end = step.id === 'end';
    return (
      <section class={`guide ${end ? 'win' : ''}`} aria-live="polite">
        <div class="guide-top"><span class="guide-k">{t('lesson1')}</span><span class="dots" aria-label={`${n + 1}/${steps.length}`}>{steps.map((_, j) => <i key={j} class={j < n ? 'done' : j === n ? 'now' : ''} />)}</span></div>
        {end && <p class="big-win"><Icon name="house" size={28} /> {t('tut_endTitle', { n: step.params.n! })} · {clock(sim.hourOfDay())}</p>}
        <p class="guide-text">{t(step.key, step.params)}</p>
        {step.id === 'bracket' && <p class="term"><b>FPI</b> · {t('term_fpi')}</p>}
        {step.id === 'openFar' && <p class="term"><b>{t('isolated')}</b> · {t('term_isolate')}</p>}
        {step.id === 'closeNop' && <p class="term"><b>NOP</b> · {t('term_nop')}</p>}
        <div class="btns">
          {step.act === null && !end && <button class="primary" onClick={onContinue}>{t('continue')}</button>}
          {end && <><button class="primary" onClick={onNext}>{t('nextLesson')}</button><button onClick={onExit}>{t('menu')}</button></>}
        </div>
      </section>
    );
  }
  const look = lookStep(sc, sim);
  const exact = tier >= 3 ? nextStep(sc, sim) : null;
  return (
    <section class="guide hint" aria-live="polite">
      <div class="guide-top"><span class="guide-k"><Icon name="bulb" size={16} /> {t('hint')} · {t(`tier${tier}`)}</span><button class="ghost icon-only" onClick={onClose} aria-label={t('close')}><Icon name="x" size={18} /></button></div>
      {tier === 1 && <p class="guide-text">{t(look.key, look.params)}</p>}
      {tier === 2 && <p class="guide-text">{t(principleKey(sc, sim))}</p>}
      {exact && <p class="guide-exact"><Icon name="hand" size={18} /> {t(exact.key, { ...exact.params, how: exact.params.how === 'remote' ? t('howRemote') : exact.params.how === 'crew' ? t('howCrew') : '' })}</p>}
      <div class="btns">
        {tier < 3 && <button onClick={onMore}>{t(tier === 1 ? 'moreHelpWhy' : 'moreHelpExact')}</button>}
        <button class={tier >= 3 ? 'primary' : ''} onClick={onDemo}><Icon name="play" size={16} /> {t('watchSolution')}</button>
      </div>
      <p class="muted small">{t(tier >= 3 ? 'hintCostExact' : 'hintCost')}</p>
    </section>
  );
}

function swName(sw: Switch): string {
  if (sw.kind === 'CB') return t('breakerName');
  const sideA = sw.id.endsWith('-L');
  return t(sideA ? 'switchL' : 'switchR', { to: sideA ? 'A' : 'B' });
}

function DeviceCard({ s, sel, run, engineer }: { s: GameSession; sel: Selection; run: (a: Action) => void; engineer: boolean }) {
  const sim = s.sim;
  if (!sel) return <div class="device empty"><Icon name="hand" size={28} /><p>{t('selectSomething')}</p></div>;
  if (sel.kind === 'cable') return <CablePanel s={s} id={sel.id} run={run} />;
  const site = s.scenario.sites.find((x) => x.id === sel.id)!;
  const isGs = site.kind === 'gs';
  const switches = isGs ? sim.net.switches.filter((x) => x.kind === 'CB' && x.site === site.id) : sim.net.switches.filter((x) => x.site === site.id && x.kind !== 'FUSE_SWITCH');
  const crewsHere = sim.crews.filter((c) => c.site === site.id && c.busyUntil <= sim.t);
  const busyHere = sim.crews.filter((c) => c.site === site.id && c.busyUntil > sim.t);
  const coming = sim.crews.filter((c) => c.travellingTo === site.id);
  const idleCrews = sim.crews.filter((c) => c.busyUntil <= sim.t && c.site !== site.id && c.travellingTo === null);
  const ring = site.ring ? s.scenario.rings.find((r) => r.id === site.ring) : undefined;
  const reads = sim.readings.filter((r) => r.site === site.id);
  const latest = (fpi: string) => { const xs = reads.filter((r) => r.fpi === fpi); return xs[xs.length - 1]; };
  const on = !isGs && sim.isEnergised(`${site.id}B`);
  const B = (act: Action, label: string, icon: string, primary = false) => (
    <button key={actOf(act)} class={`act ${primary ? 'primary' : ''}`} data-act={actOf(act)} onClick={() => run(act)}><Icon name={icon} size={18} /> {label}</button>
  );
  const opBtns = (sw: Switch) => {
    const op: 'open' | 'close' = sw.closed ? 'open' : 'close';
    const out: JSX.Element[] = [];
    if (sim.secured.has(sw.id) && !sw.closed) return out;
    if (sw.remote && site.commsOk) out.push(B({ kind: 'remote', switch: sw.id, op }, `${t(op === 'open' ? 'actOpen' : 'actClose')} · ${t('actRemote')}`, op === 'open' ? 'open' : 'close', true));
    for (const c of crewsHere) out.push(B({ kind: 'crewOp', crew: c.id, switch: sw.id, op }, `${t(op === 'open' ? 'actOpen' : 'actClose')} · ${t('crew', { n: c.id + 1 })}`, op === 'open' ? 'open' : 'close'));
    return out;
  };
  return (
    <div class="device">
      <div class="dev-head">
        <span class={`dev-ico ${isGs ? 'gs' : on ? 'on' : 'off'}`}><Icon name={isGs ? 'gs' : 'rmu'} size={26} /></span>
        <div>
          <h3>{isGs ? t('gridStation', { name: site.label }) : t('rmu', { id: site.id })}</h3>
          {!isGs && <p class="dev-sub"><span class={`chip ${on ? 'good' : 'bad'}`}>{on ? t('supplyOn') : t('supplyOff')}</span> {t('homesN', { n: site.customers! })} · {fmt(site.kva!)} kVA · {site.remote ? (site.commsOk ? t('automated') : t('commsLost')) : t('manual')}</p>}
          {isGs && <p class="dev-sub">{t('gsSub')}</p>}
        </div>
      </div>
      <ul class="sw-list">
        {switches.map((sw) => {
          const isNop = ring?.nop === sw.id || s.scenario.rings.some((r) => r.nop === sw.id);
          const tripped = sw.kind === 'CB' && sim.relayRecords.some((rr) => rr.cb === sw.id) && !sw.closed;
          return (
            <li key={sw.id} class={`${sel.sw === sw.id ? 'focus' : ''}`} data-id={`row:${sw.id}`}>
              <div class="sw-row">
                <span class={`sw-state ${sw.closed ? 'closed' : 'open'}`}>{sw.closed ? t('closed') : t('open')}</span>
                <b>{swName(sw)}</b> <bdi class="mono">{sw.id}</bdi>
                {isNop && <span class="chip">NOP</span>}
                {tripped && <span class="chip bad">{t('tripped')}</span>}
                {sw.earthed && <span class="chip good"><Icon name="earth" size={14} /> {t('earthed')}</span>}
                {sim.secured.has(sw.id) && <span class="chip"><Icon name="lock" size={14} /> {t('secured')}</span>}
                {sim.provedDead.has(sw.id) && !sw.earthed && <span class="chip">{t('provedDead')}</span>}
              </div>
              <div class="btns">
                {opBtns(sw)}
                {sw.kind === 'LBS' && crewsHere.map((c) => [
                  !sw.closed && !sim.secured.has(sw.id) && B({ kind: 'secure', crew: c.id, switch: sw.id }, t('actSecure'), 'lock'),
                  sim.secured.has(sw.id) && !sw.earthed && !sim.provedDead.has(sw.id) && B({ kind: 'proveDead', crew: c.id, switch: sw.id }, t('actProveDead'), 'bolt'),
                  sim.secured.has(sw.id) && !sw.earthed && sim.provedDead.has(sw.id) && B({ kind: 'earth', crew: c.id, switch: sw.id, on: true }, t('actEarthOn'), 'earth'),
                  sw.earthed && B({ kind: 'earth', crew: c.id, switch: sw.id, on: false }, t('actEarthOff'), 'earth'),
                  sim.secured.has(sw.id) && !sw.earthed && B({ kind: 'secure', crew: c.id, switch: sw.id, on: false }, t('actUnsecure'), 'lock'),
                ])}
              </div>
              {!sw.remote && crewsHere.length === 0 && !isGs && <p class="muted small">{t('needCrewHere')}</p>}
            </li>
          );
        })}
      </ul>
      {!isGs && (
        <div class="fpis2">
          <h4><Icon name="flag" size={16} /> {t('fpiReadings')}</h4>
          {(['FL', 'FR'] as const).map((side) => {
            const id = `${site.id}-${side}`;
            const f = sim.net.fpis.find((x) => x.id === id)!;
            const r = latest(id);
            const lit = r && (r.phase || r.earth);
            const stamp = r && lit && r.remote ? (r.since !== undefined && r.since >= 0 ? ` · ${t('flagAt', { time: clock(sim.hourOfDay(r.since)) })}` : ` · ${t('flagOld')}`) : '';
            return <p key={id} class="fpi-row">{side === 'FL' ? t('sideTowardA') : t('sideTowardB')} · <span class="muted">{f.type === 'three-phase' ? t('fpiType3') : t('fpiTypeE')}</span>: {r ? <b class={lit ? 'lit' : ''}>{lit ? t('fpiLit') : t('fpiDark')}</b> : <span class="muted">{t('fpiNotRead')}</span>}{r && <span class="muted"> ({t('readAt', { time: clock(sim.hourOfDay(r.t)) })}{stamp})</span>}</p>;
          })}
          <div class="btns">
            {site.remote && site.commsOk && B({ kind: 'readRemote', site: site.id }, t('actReadRemote'), 'read')}
            {crewsHere.map((c) => B({ kind: 'readFpi', crew: c.id }, `${t('actReadFpi')} · ${t('crew', { n: c.id + 1 })}`, 'read'))}
          </div>
        </div>
      )}
      <div class="crew-box">
        {crewsHere.length + busyHere.length + coming.length > 0 && <p class="muted small"><Icon name="truck" size={16} /> {[...crewsHere, ...busyHere].map((c) => t('crew', { n: c.id + 1 })).concat(coming.map((c) => `${t('crew', { n: c.id + 1 })} → ${clock(sim.hourOfDay(c.busyUntil))}`)).join(' · ')}</p>}
        <div class="btns">
          {!isGs && idleCrews.map((c) => B({ kind: 'dispatch', crew: c.id, site: site.id }, t('actDispatch', { crew: c.id + 1 }), 'truck'))}
          {crewsHere.map((c) => B({ kind: 'standClear', crew: c.id }, t('actStandClear', { crew: c.id + 1 }), 'x'))}
          {sim.damageReported && !sim.damageAttended && crewsHere.map((c) => B({ kind: 'attendDamage', crew: c.id }, t('actAttend'), 'eye'))}
        </div>
      </div>
      {engineer && !isGs && site.remote && site.commsOk && sim.pf && <p class="eng-data">V = {fmt((sim.pf.vPu.get(`${site.id}B`) ?? 0) * 13.8, 2)} kV</p>}
    </div>
  );
}

function CablePanel({ s, id, run }: { s: GameSession; id: string; run: (a: Action) => void }) {
  const sim = s.sim;
  const cab = sim.net.cables.find((c) => c.id === id)!;
  const live = sim.cableEnergised(id);
  const rating = s.scenario.groundTempC === 40 ? CABLE_3x300AL.ampacity40C : CABLE_3x300AL.ampacityA;
  const ends = sim.switchesBounding(id);
  const B = (act: Action, label: string, icon: string, primary = false) => (
    <button class={`act ${primary ? 'primary' : ''}`} data-act={actOf(act)} onClick={() => run(act)}><Icon name={icon} size={18} /> {label}</button>
  );
  return (
    <div class="device">
      <div class="dev-head">
        <span class={`dev-ico ${live ? 'on' : 'off'}`}><Icon name="cable" size={26} /></span>
        <div>
          <h3>{t('cable', { id })}</h3>
          <p class="dev-sub"><span class={`chip ${live ? 'good' : 'bad'}`}>{live ? t('cableLive') : t('cableDead')}</span> {t('cableInfo', { len: fmt(cab.lengthKm, 2), amps: rating })}</p>
        </div>
      </div>
      {sim.suspect.has(id) && !live && <p class="muted">{t('cableSuspect')}</p>}
      <p class="muted small">{ends.map((e) => `${e.id}: ${e.closed ? t('closed') : t('open')}${e.earthed ? ` · ${t('earthed')}` : ''}${sim.secured.has(e.id) ? ` · ${t('secured')}` : ''}`).join(' — ')}</p>
      {sim.permits.has(id) ? <p><span class="chip"><Icon name="permit" size={14} /> {t('permitHeld')}</span>{sim.repairing === id ? <span class="chip"><Icon name="wrench" size={14} /> {t('repairing')}</span> : null}</p> : <p class="muted small">{t('permitNeeds')}</p>}
      <div class="btns">
        {!sim.permits.has(id) && B({ kind: 'permit', cable: id, on: true }, t('permitIssue'), 'permit', true)}
        {sim.permits.has(id) && !sim.repairing && !sim.repaired.has(id) && B({ kind: 'repair', cable: id }, t('repairStart'), 'wrench', true)}
        {sim.repaired.has(id) && <span class="chip good"><Icon name="check" size={14} /> {t('repaired')}</span>}
        {sim.permits.has(id) && sim.repairing !== id && B({ kind: 'permit', cable: id, on: false }, t('permitCancel'), 'x')}
      </div>
    </div>
  );
}

function CrewPanel({ s }: { s: GameSession }) {
  const sim = s.sim;
  return (
    <ul class="crews">
      {sim.crews.map((c) => {
        const eta = clock(sim.hourOfDay(c.busyUntil));
        let st = c.site ? t('crewAt', { site: c.site }) : c.task === 'clear' ? t('crewClear') : t('crewBase');
        if (c.travellingTo) st = t('crewTravel', { site: c.travellingTo, eta });
        else if (c.busyUntil > sim.t) st = t('crewBusy', { task: t(`task_${c.task ?? 'operate'}`), eta });
        return <li key={c.id}><Icon name="truck" size={16} /> <b>{t('crew', { n: c.id + 1 })}</b> — {st}</li>;
      })}
    </ul>
  );
}

function EvidencePanel({ s, engineer }: { s: GameSession; engineer: boolean }) {
  const sim = s.sim;
  const items = [];
  for (const r of sim.relayRecords) {
    items.push(<li key={`r${r.t}${r.cb}`}><b>{t('relayRecord', { cb: r.cb, time: clock(sim.hourOfDay(r.t)) })}</b><br />
      {t('relayDetail', { element: r.element === 'phase' ? t('elementPhase') : t('elementEarth'), ia: Math.round(r.iMaxA), i0: Math.round(r.i3i0A), ph: r.phases.toUpperCase() })}</li>);
  }
  const dmg = sim.log.find((l) => l.kind === 'damageReport');
  if (dmg) {
    const cab = sim.net.cables.find((c) => c.id === String(dmg.data.cable))!;
    const ends = sim.switchesBounding(cab.id).map((x) => x.site);
    items.push(<li key="dmg" class="warn"><b>{t('damageReport', { a: ends[0] ?? '', b: ends[ends.length - 1] ?? '', time: clock(sim.hourOfDay(dmg.t)) })}</b><br />{sim.damageAttended ? t('damageAttended') : t('damageNotAttended')}</li>);
  }
  if (sim.log.some((l) => l.kind === 'calls')) items.push(<li key="calls">{t('calls')}</li>);
  if (engineer && sim.pf) {
    for (const r of s.scenario.rings) {
      const a = sim.pf.cableA.get(r.cables[0]!) ?? 0, b = sim.pf.cableA.get(r.cables[r.cables.length - 1]!) ?? 0;
      items.push(<li key={`f${r.id}`} class="eng-data">{r.id}: I(A) = {fmt(a)} A · I(B) = {fmt(b)} A</li>);
    }
  }
  return items.length ? <ul class="evidence">{items}</ul> : <p class="muted">{t('noEvidence')}</p>;
}

function LogPanel({ s }: { s: GameSession }) {
  const sim = s.sim;
  const fmtData = (d: Record<string, string | number | boolean>) => {
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(d)) {
      if (k === 'op') out[k] = v === 'open' ? t('opened') : t('closedV');
      else if (k === 'on') out[k] = 'cable' in d ? (v ? t('issued') : t('cancelled')) : (v ? t('on') : t('off'));
      else if (k === 'task') out[k] = t(`task_${v}`);
      else if (k === 'crew') out[k] = Number(v) + 1;
      else if (k === 'reason') out[k] = t(`blk_${v}`) !== `blk_${v}` ? t(`blk_${v}`, {}) : String(v);
      else if (k === 'element') out[k] = v === 'phase' ? t('elementPhase') : t('elementEarth');
      else if (k === 'live') out[k] = v ? t('liveYes') : t('liveNo');
      else out[k] = typeof v === 'boolean' ? String(v) : v;
    }
    return out;
  };
  return (
    <ol class="log" reversed>
      {[...sim.log].reverse().filter((l) => l.kind !== 'fault' || s.sim.complete).map((l, i) => (
        <li key={i}><time>{clock(sim.hourOfDay(l.t))}</time> {t(`log_${l.kind}`, fmtData(l.data))}</li>
      ))}
    </ol>
  );
}

function Checklist({ s, c, onCancel, onConfirm }: { s: GameSession; c: { sw: string; crew: number | null }; onCancel: () => void; onConfirm: (j: Justification) => void }) {
  const p = s.sim.closePreview(c.sw, c.crew);
  const allOk = p.delayLeftMin === 0 && p.crewsInside.length === 0 && !p.damage && p.dutyLeft > 0;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    (document.querySelector('.modal button.primary:not([disabled]), .modal button') as HTMLElement | null)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Tab') {
        const els = [...document.querySelectorAll<HTMLElement>('.modal button:not([disabled])')];
        if (!els.length) return;
        const i = els.indexOf(document.activeElement as HTMLElement);
        const n = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i + 1) % els.length;
        els[n]!.focus(); e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus(); };
  }, []);
  const row = (ok: boolean, text: string) => <li class={ok ? 'ok' : 'no'}><Icon name={ok ? 'check' : 'x'} size={18} /> <span>{text}</span></li>;
  return (
    <div class="modal-back" role="dialog" aria-modal="true" aria-labelledby="chk-title">
      <div class="modal">
        <h3 id="chk-title">{t('checklistTitle')}</h3>
        <p>{t('checklistIntro', { n: p.unproven })}</p>
        <ul class="checklist2">
          {row(p.delayLeftMin === 0, t('chkDelay', { rule: t('chkDelayRule'), state: p.delayLeftMin === 0 ? t('chkElapsed') : t('chkRemaining', { min: p.delayLeftMin }) }))}
          {row(p.crewsInside.length === 0, `${t('chkCrews', { state: p.crewsInside.length === 0 ? t('chkOk') : t('chkNotOk') })}${p.crewsInside.length ? ` (${p.crewsInside.map((x) => `${t('crew', { n: x.crew + 1 })} @ ${x.site}`).join(', ')})` : ''}`)}
          {row(!p.damage, t('chkDamage', { state: !p.damage ? t('chkOk') : t('chkNotOk') }))}
          {row(p.dutyLeft > 0, t('chkDuty', { n: p.dutyLeft }))}
        </ul>
        <p class="muted small">{t('chkNote')}</p>
        {!allOk && <p class="warn-text">{t('chkFix')}</p>}
        <div class="btns">
          <button onClick={onCancel}>{t('cancel')}</button>
          {p.delayLeftMin > 0 && p.crewsInside.length === 0 && !p.damage && <button onClick={() => { s.apply({ kind: 'wait', minutes: p.delayLeftMin }); onConfirm('delay'); }}><Icon name="clock" size={16} /> {t('chkWaitN', { min: p.delayLeftMin })}</button>}
          <button class="primary" disabled={!allOk} onClick={() => onConfirm('delay')}>{t('chkConfirm')}</button>
        </div>
      </div>
    </div>
  );
}

