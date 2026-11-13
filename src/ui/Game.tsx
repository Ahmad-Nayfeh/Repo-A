import { useState } from 'preact/hooks';
import { dailyCondition, type GameSession } from './session';
import { NetworkView, type Selection } from './NetworkView';
import { RingLadder } from './RingLadder';
import { useEffect } from 'preact/hooks';
import { t, fmt, clock } from '../i18n/i18n';
import { MIN, type Action, type ActionResult, type Justification } from '../engine/sim';
import type { Switch } from '../engine/model';
import { CABLE_3x300AL } from '../data/params';
import { Results } from './Results';
import { chime } from '../audio/synth';

type Tab = 'site' | 'crews' | 'log' | 'evidence';

export function Game({ s, onExit, onNext }: { s: GameSession; onExit: () => void; onNext?: () => void }) {
  void s.tick.value;
  const sim = s.sim;
  const [sel, setSel] = useState<Selection>(null);
  const [tab, setTab] = useState<Tab>('evidence');
  const [toast, setToast] = useState<string | null>(null);
  const [check, setCheck] = useState<{ action: Action; sw: string; crew: number | null } | null>(null);
  const [ringFilter, setRingFilter] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 600px)').matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(max-width: 600px)');
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const trippedRing = s.scenario.rings.find((r) => sim.relayRecords.some((x) => x.cb === r.ringSwitches[0] || x.cb === r.ringSwitches[r.ringSwitches.length - 1]))?.id ?? s.scenario.rings[0]!.id;
  const ladderRing = ringFilter ?? trippedRing;
  const [engineer, setEngineer] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const m = sim.metrics();

  const msg = (r: ActionResult) => {
    if (r.ok) { setToast(null); return; }
    const key = `blk_${r.reason}`;
    const data: Record<string, string | number> = { ...(r.reasonData ?? {}) };
    if (typeof data.crew === 'number') data.crew = data.crew + 1; // crews are shown 1-based (G-04)
    const text = t(key) !== key ? t(key, data) : t(`err_${r.reason}`);
    setToast(text);
  };
  const run = (a: Action) => {
    const trips = sim.relayRecords.length;
    const r = s.apply(a);
    if (r.reason === 'needChecklist' && (a.kind === 'remote' || a.kind === 'crewOp')) {
      setCheck({ action: a, sw: a.switch, crew: a.kind === 'crewOp' ? a.crew : null });
      // the request was recorded by the engine as a no-op; keep replay faithful
      return;
    }
    msg(r);
    if (sim.relayRecords.length > trips) chime();
  };
  const select = (x: Selection) => {
    setSel(x); setTab('site');
    if (narrow) requestAnimationFrame(() => document.querySelector('.panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (sim.complete && showResults) return <Results s={s} onExit={onExit} onBack={() => setShowResults(false)} onNext={onNext} />;

  const hour = sim.hourOfDay();
  const hintKey = trainingHint(s);
  return (
    <div class="game">
      <header class="hud">
        <button class="ghost" onClick={onExit} aria-label={t('menu')}>☰</button>
        <div class="stat"><span>{t('time')}</span><b>{clock(hour)}</b></div>
        <div class="stat"><span>{t('customersOff')}</span><b class={m.customersTotal && sim.customersOff() > 0 ? 'warn' : ''}>{fmt(sim.customersOff())}</b></div>
        <div class="stat" title={t('cmlRuleNote')}><span>{t('customerMinutes')} ⓘ</span><b>{fmt(m.cmlOfgem)}</b></div>
        <div class="hud-actions">
          <button onClick={() => run({ kind: 'wait', minutes: 5 })}>{t('wait5')}</button>
          <button class="primary" onClick={() => run({ kind: 'advance' })}>{t('advance')} ⏭</button>
        </div>
      </header>
      {s.mode === 'daily' && s.date && <div class="hint" role="note">📅 {t('daily')} · <b>{t(`cond_${dailyCondition(s.date).id}`)}</b></div>}
      {hintKey && <div class="hint" role="note">💡 {t(hintKey)}</div>}
      {toast && <div class="toast" role="alert" onClick={() => setToast(null)}>{toast}</div>}
      <div class="board">
        <section class="map">
          <div class="ring-picker" role="group" aria-label={t('ring')}>
            {!narrow && <button class={ringFilter === null ? 'on' : ''} onClick={() => setRingFilter(null)}>{t('allRings')}</button>}
            {s.scenario.rings.map((r) => <button key={r.id} class={(narrow ? ladderRing : ringFilter) === r.id ? 'on' : ''} onClick={() => setRingFilter(r.id)}>{r.id}</button>)}
            <label class="eng"><input type="checkbox" checked={engineer} onChange={(e) => setEngineer((e.target as HTMLInputElement).checked)} /> {t('engineerView')}</label>
          </div>
          {narrow
            ? <RingLadder s={s} ringId={ladderRing} selection={sel} onSelect={select} />
            : <><NetworkView s={s} selection={sel} onSelect={select} ringFilter={ringFilter} /><SwitchList s={s} onSelect={select} ringFilter={ringFilter} /></>}
        </section>
        <aside class="panel">
          <nav class="tabs" role="tablist">
            {(['site', 'crews', 'evidence', 'log'] as Tab[]).map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} class={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t(`tab${k[0]!.toUpperCase()}${k.slice(1)}`)}</button>
            ))}
          </nav>
          <div class="tab-body">
            {tab === 'site' && <SitePanel s={s} sel={sel} run={run} engineer={engineer} />}
            {tab === 'crews' && <CrewPanel s={s} run={run} />}
            {tab === 'evidence' && <EvidencePanel s={s} engineer={engineer} />}
            {tab === 'log' && <LogPanel s={s} />}
          </div>
        </aside>
      </div>
      {check && <Checklist s={s} c={check} onCancel={() => setCheck(null)} onConfirm={(j) => {
        const a = { ...check.action, justification: j } as Action;
        setCheck(null);
        run(a);
      }} />}
      <p class="ruleset-note">{t('rulesetNote')}</p>
    </div>
  );
}

/** Training hints follow the actual stage of the job (G-06). Guided training may consult the scenario. */
function trainingHint(s: GameSession): string | null {
  if (s.training < 0) return null;
  if (s.training === 1) return 'tr2';
  if (s.training === 2) return 'tr3';
  const sim = s.sim;
  const fc = s.scenario.fault.cable;
  if (sim.complete) return null;
  if (!sim.faultPresent || sim.repaired.has(fc)) return 'tr1_6';
  if (sim.repairing) return 'tr1_rep';
  if (sim.permits.has(fc)) return 'tr1_rep0';
  const isolated = sim.switchesBounding(fc).every((x) => !x.closed);
  if (!isolated) return sim.readings.length === 0 ? (sim.t < 2 * MIN ? 'tr1_1' : 'tr1_2') : 'tr1_3';
  const restorable = sim.net.loads.filter((l) => !sim.isEnergised(l.bus)).length;
  if (restorable > 0) return 'tr1_4';
  return 'tr1_5';
}

function swName(s: GameSession, sw: Switch): string {
  if (sw.kind === 'CB') return t('breakerName');
  const sideA = sw.id.endsWith('-L');
  return t(sideA ? 'switchL' : 'switchR', { to: sideA ? 'A' : 'B' });
}

function SitePanel({ s, sel, run, engineer }: { s: GameSession; sel: Selection; run: (a: Action) => void; engineer: boolean }) {
  const sim = s.sim;
  if (!sel) return <p class="muted">{t('selectSomething')}</p>;
  if (sel.kind === 'cable') return <CablePanel s={s} id={sel.id} run={run} />;
  const site = s.scenario.sites.find((x) => x.id === sel.id)!;
  const switches = sim.net.switches.filter((x) => x.site === site.id && x.kind !== 'FUSE_SWITCH');
  const crewsHere = sim.crews.filter((c) => c.site === site.id && c.busyUntil <= sim.t);
  const idleCrews = sim.crews.filter((c) => c.busyUntil <= sim.t && c.site !== site.id);
  const ring = site.ring ? s.scenario.rings.find((r) => r.id === site.ring) : undefined;
  const reads = sim.readings.filter((r) => r.site === site.id);
  const latest = (fpi: string) => { const xs = reads.filter((r) => r.fpi === fpi); return xs[xs.length - 1]; };
  const opBtn = (sw: Switch, op: 'open' | 'close') => {
    const out = [];
    if (sw.remote && site.commsOk) out.push(<button key="r" onClick={() => run({ kind: 'remote', switch: sw.id, op })}>{t(op === 'open' ? 'actOpen' : 'actClose')} · {t('actRemote')}</button>);
    for (const c of crewsHere) out.push(<button key={`c${c.id}`} onClick={() => run({ kind: 'crewOp', crew: c.id, switch: sw.id, op })}>{t(op === 'open' ? 'actOpen' : 'actClose')} · {t('crew', { n: c.id + 1 })}</button>);
    return out;
  };
  return (
    <div class="site">
      <h3>{site.kind === 'gs' ? t('gridStation', { name: site.label }) : t('rmu', { id: site.id })}</h3>
      {site.kind === 'rmu' && <p>{t('packageSub', { kva: site.kva!, customers: site.customers! })} · <b>{sim.isEnergised(`${site.id}B`) ? t('supplyOn') : t('supplyOff')}</b></p>}
      {site.kind === 'rmu' && <p class="muted">{site.remote ? t('automated') : t('manual')}{site.remote && !site.commsOk ? ` · ${t('commsLost')}` : ''}</p>}
      <ul class="switches">
        {(site.kind === 'gs' ? sim.net.switches.filter((x) => x.kind === 'CB' && x.site === site.id) : switches).map((sw) => (
          <li key={sw.id}>
            <div><b>{swName(s, sw)}</b> · <bdi><code>{sw.id}</code></bdi></div>
            <div class="state">{sw.closed ? `■ ${t('closed')}` : `□ ${t('open')}`}{ring?.nop === sw.id ? ` · ${t('nop')}` : ''}{sw.earthed ? ` · ⏚ ${t('earthed')}` : ''}{sim.secured.has(sw.id) ? ` · 🔒 ${t('secured')}` : ''}{sim.provedDead.has(sw.id) && !sw.earthed ? ` · ✓ ${t('provedDead')}` : ''} · <span class="muted">{t('dutyLeft', { n: sw.faultMakeLeft })}</span></div>
            <div class="btns">
              {!(sim.secured.has(sw.id) && !sw.closed) && opBtn(sw, sw.closed ? 'open' : 'close')}
              {sw.kind === 'LBS' && crewsHere.map((c) => [
                !sw.closed && !sim.secured.has(sw.id) && <button key={`s${c.id}`} onClick={() => run({ kind: 'secure', crew: c.id, switch: sw.id })}>{t('actSecure')}</button>,
                sim.secured.has(sw.id) && !sw.earthed && !sim.provedDead.has(sw.id) && <button key={`p${c.id}`} onClick={() => run({ kind: 'proveDead', crew: c.id, switch: sw.id })}>{t('actProveDead')}</button>,
                sim.secured.has(sw.id) && !sw.earthed && sim.provedDead.has(sw.id) && <button key={`e${c.id}`} onClick={() => run({ kind: 'earth', crew: c.id, switch: sw.id, on: true })}>{t('actEarthOn')}</button>,
                sw.earthed && <button key={`x${c.id}`} onClick={() => run({ kind: 'earth', crew: c.id, switch: sw.id, on: false })}>{t('actEarthOff')}</button>,
                sim.secured.has(sw.id) && !sw.earthed && <button key={`u${c.id}`} onClick={() => run({ kind: 'secure', crew: c.id, switch: sw.id, on: false })}>{t('actUnsecure')}</button>,
              ])}
            </div>
          </li>
        ))}
      </ul>
      {site.kind === 'rmu' && (
        <div class="fpis">
          <h4>{t('fpiReadings')}</h4>
          {(['FL', 'FR'] as const).map((side) => {
            const id = `${site.id}-${side}`;
            const f = sim.net.fpis.find((x) => x.id === id)!;
            const r = latest(id);
            const lit = r && (r.phase || r.earth);
            const stamp = r && lit && r.remote ? (r.since !== undefined && r.since >= 0 ? ` · ${t('flagAt', { time: clock(sim.hourOfDay(r.since)) })}` : ` · ${t('flagOld')}`) : '';
            return <div key={id} class="fpi">{side === 'FL' ? t('sideTowardA') : t('sideTowardB')} · {f.type === 'three-phase' ? t('fpiType3') : t('fpiTypeE')}: {r ? <b class={lit ? 'lit' : ''}>{lit ? `⚡ ${t('fpiLit')}` : `○ ${t('fpiDark')}`} ({t('readAt', { time: clock(sim.hourOfDay(r.t)) })}{stamp})</b> : <span class="muted">{t('fpiNotRead')}</span>}</div>;
          })}
          <div class="btns">
            {site.remote && site.commsOk && <button onClick={() => run({ kind: 'readRemote', site: site.id })}>{t('actReadRemote')}</button>}
            {crewsHere.map((c) => <button key={c.id} onClick={() => run({ kind: 'readFpi', crew: c.id })}>{t('actReadFpi')} · {t('crew', { n: c.id + 1 })}</button>)}
          </div>
        </div>
      )}
      <div class="btns">
        {site.kind === 'rmu' && idleCrews.map((c) => <button key={c.id} onClick={() => run({ kind: 'dispatch', crew: c.id, site: site.id })}>🚚 {t('actDispatch', { crew: c.id + 1 })}</button>)}
        {crewsHere.map((c) => <button key={`sc${c.id}`} onClick={() => run({ kind: 'standClear', crew: c.id })}>{t('actStandClear', { crew: c.id + 1 })}</button>)}
        {sim.damageReported && !sim.damageAttended && crewsHere.map((c) => <button key={`ad${c.id}`} onClick={() => run({ kind: 'attendDamage', crew: c.id })}>{t('actAttend')}</button>)}
      </div>
      {site.kind === 'rmu' && crewsHere.length === 0 && !site.remote && <p class="muted">{t('noCrewHere')}</p>}
      {engineer && site.kind === 'rmu' && site.remote && site.commsOk && sim.pf && <p class="eng-data">V = {fmt((sim.pf.vPu.get(`${site.id}B`) ?? 0) * 13.8, 2)} kV</p>}
    </div>
  );
}

function CablePanel({ s, id, run }: { s: GameSession; id: string; run: (a: Action) => void }) {
  const sim = s.sim;
  const cab = sim.net.cables.find((c) => c.id === id)!;
  const live = sim.cableEnergised(id);
  const rating = s.scenario.groundTempC === 40 ? CABLE_3x300AL.ampacity40C : CABLE_3x300AL.ampacityA;
  const ends = sim.switchesBounding(id);
  return (
    <div class="site">
      <h3>{t('cable', { id })}</h3>
      <p>{t('cableInfo', { len: fmt(cab.lengthKm, 2), amps: rating })}</p>
      <p><b>{live ? t('cableLive') : t('cableDead')}</b>{sim.suspect.has(id) && !live ? ` · ${t('cableSuspect')}` : ''}</p>
      <p class="muted">{ends.map((e) => `${e.id}: ${e.closed ? t('closed') : t('open')}${e.earthed ? ' ⏚' : ''}${sim.secured.has(e.id) ? ' 🔒' : ''}`).join(' · ')}</p>
      {sim.permits.has(id) ? <p><b>📄 {t('permitHeld')}</b>{sim.repairing === id ? ` · 🔧 ${t('repairing')}` : ''}</p> : <p class="muted">{t('permitNeeds')}</p>}
      <div class="btns">
        {!sim.permits.has(id) && <button onClick={() => run({ kind: 'permit', cable: id, on: true })}>📄 {t('permitIssue')}</button>}
        {sim.permits.has(id) && !sim.repairing && !sim.repaired.has(id) && <button onClick={() => run({ kind: 'repair', cable: id })}>🔧 {t('repairStart')}</button>}
        {sim.repaired.has(id) && <span>✅ {t('repaired')}</span>}
        {sim.permits.has(id) && sim.repairing !== id && <button onClick={() => run({ kind: 'permit', cable: id, on: false })}>{t('permitCancel')}</button>}
      </div>
    </div>
  );
}

function CrewPanel({ s, run }: { s: GameSession; run: (a: Action) => void }) {
  const sim = s.sim;
  void run;
  return (
    <ul class="crews">
      {sim.crews.map((c) => {
        const eta = clock(sim.hourOfDay(c.busyUntil));
        let st = c.site ? t('crewAt', { site: c.site }) : c.task === 'clear' ? t('crewClear') : t('crewBase');
        if (c.travellingTo) st = t('crewTravel', { site: c.travellingTo, eta });
        else if (c.busyUntil > sim.t) st = t('crewBusy', { task: t(`task_${c.task ?? 'operate'}`), eta });
        return <li key={c.id}>🚚 <b>{t('crew', { n: c.id + 1 })}</b> — {st}</li>;
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
    const a = sim.switchesBounding(cab.id).map((x) => x.site);
    items.push(<li key="dmg" class="warn"><b>⚠ {t('damageReport', { a: a[0] ?? '', b: a[a.length - 1] ?? '', time: clock(sim.hourOfDay(dmg.t)) })}</b><br />{sim.damageAttended ? t('damageAttended') : t('damageNotAttended')}</li>);
  }
  if (sim.log.some((l) => l.kind === 'calls')) items.push(<li key="calls">📞 {t('calls')}</li>);
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

function SwitchList({ s, onSelect, ringFilter }: { s: GameSession; onSelect: (x: Selection) => void; ringFilter: string | null }) {
  const sim = s.sim;
  const rings = ringFilter ? s.scenario.rings.filter((r) => r.id === ringFilter) : s.scenario.rings;
  return (
    <details class="switch-list">
      <summary>{t('listView')}</summary>
      {rings.map((r) => (
        <ul key={r.id} aria-label={`${t('ring')} ${r.id}`}>
          {r.rmus.map((id) => (
            <li key={id}><button class="link" onClick={() => onSelect({ kind: 'site', id })}>{id}</button> {sim.isEnergised(`${id}B`) ? '●' : '○'} L:{sim.net.switches.find((x) => x.id === `${id}-L`)!.closed ? '■' : '□'} R:{sim.net.switches.find((x) => x.id === `${id}-R`)!.closed ? '■' : '□'}</li>
          ))}
          {r.cables.map((c) => <li key={c}><button class="link" onClick={() => onSelect({ kind: 'cable', id: c })}>{c}</button> {sim.cableEnergised(c) ? '━' : '┅'}</li>)}
          {(['GA', 'GB'] as const).map((g) => { const cb = sim.net.switches.find((x) => x.id === `${r.id}-${g === 'GA' ? 'CBA' : 'CBB'}`)!; return <li key={g}><button class="link" onClick={() => onSelect({ kind: 'site', id: g })}>{cb.id}</button> {cb.closed ? '■' : '□'}</li>; })}
        </ul>
      ))}
    </details>
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
      if (e.key === 'Tab') { // keep focus inside the dialog
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
  const ok = (b: boolean) => (b ? `✅ ${t('chkOk')}` : `❌ ${t('chkNotOk')}`);
  return (
    <div class="modal-back" role="dialog" aria-modal="true" aria-labelledby="chk-title">
      <div class="modal">
        <h3 id="chk-title">{t('checklistTitle')}</h3>
        <p>{t('checklistIntro', { n: p.unproven })}</p>
        <ul class="checklist">
          <li>{t('chkDelay', { rule: t('chkDelayRule'), state: p.delayLeftMin === 0 ? `✅ ${t('chkElapsed')}` : `❌ ${t('chkRemaining', { min: p.delayLeftMin })}` })}</li>
          <li>{t('chkCrews', { state: ok(p.crewsInside.length === 0) })}{p.crewsInside.length ? ` (${p.crewsInside.map((x) => `${t('crew', { n: x.crew + 1 })} @ ${x.site}`).join(', ')})` : ''}</li>
          <li>{t('chkDamage', { state: ok(!p.damage) })}</li>
          <li>{t('chkDuty', { n: p.dutyLeft })}</li>
        </ul>
        <p class="muted">{t('chkNote')}</p>
        {!allOk && <p class="warn-text">{t('chkFix')}</p>}
        <div class="btns">
          <button onClick={onCancel}>{t('cancel')}</button>
          <button class="primary" disabled={!allOk} onClick={() => onConfirm('delay')}>{t('chkConfirm')}</button>
        </div>
      </div>
    </div>
  );
}
