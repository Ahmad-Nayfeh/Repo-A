import { useMemo, useState } from 'preact/hooks';
import { generateGrading, evaluate, referenceGrading, defaultSettings, relayTime, CTI_S, INRUSH_MULT, INRUSH_S, T_OVERLOAD, MAX_CLEAR_S, type Settings, type RelayKey, type RelaySetting } from '../engine/grading';
import { t, fmt } from '../i18n/i18n';
import { store } from '../i18n/i18n';

const RELAYS: RelayKey[] = ['T', 'F', 'I'];
const COLORS: Record<RelayKey, string> = { T: 'var(--ok)', F: 'var(--live)', I: 'var(--accent)' };
const DASH: Record<RelayKey, string> = { T: '', F: '6 3', I: '2 3' };

function encode(s: Settings): string {
  return RELAYS.map((k) => { const r = s[k]; return [r.curve.replace('IEC_', ''), r.pickupA, r.tms, r.hsA ?? '', r.hsDelayS ?? ''].join(','); }).join(';');
}
function decode(x: string | null): Settings | null {
  if (!x) return null;
  try {
    const parts = x.split(';').map((p) => p.split(','));
    const o = {} as Settings;
    RELAYS.forEach((k, i) => {
      const [c, pu, tms, hs, hd] = parts[i]!;
      o[k] = { curve: `IEC_${c}` as RelaySetting['curve'], pickupA: Number(pu), tms: Number(tms), ...(hs ? { hsA: Number(hs), hsDelayS: Number(hd) } : {}) };
    });
    return o;
  } catch { return null; }
}

export function Grading({ seed, initial, onExit }: { seed: number; initial: string | null; onExit: () => void }) {
  const g = useMemo(() => generateGrading(seed), [seed]);
  const [st, setSt] = useState<Settings>(() => decode(initial) ?? defaultSettings(g));
  const [showPar, setShowPar] = useState(false);
  const ev = evaluate(g, st);
  const par = useMemo(() => referenceGrading(g), [g]);
  const parScore = par?.evaluation.scoreS ?? Infinity;
  const stars = !ev.ok ? 0 : ev.scoreS <= parScore + 1e-9 ? 3 : ev.scoreS <= 1.25 * parScore ? 2 : 1;
  if (ev.ok) { const k = `gs.grading.${seed}`; const b = Number(store.get(k) ?? Infinity); if (ev.scoreS < b) store.set(k, String(ev.scoreS)); }
  const upd = (k: RelayKey, patch: Partial<RelaySetting>) => setSt({ ...st, [k]: { ...st[k], ...patch } });
  const link = `${location.href.split('#')[0]}#/grading?s=${seed}&r=${encodeURIComponent(encode(st))}`;
  const [copied, setCopied] = useState(false);

  return (
    <div class="grading">
      <header class="hud">
        <button class="ghost" onClick={onExit} aria-label={t('menu')}>☰</button>
        <div class="stat"><span>{t('grScore')}</span><b>{ev.ok ? `${fmt(ev.scoreS, 3)} s` : '—'}</b></div>
        <div class="stat"><span>{t('stars')}</span><b class="starline">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</b></div>
        <div class="hud-actions">
          <button onClick={() => setSt(defaultSettings(g))}>{t('grReset')}</button>
          <button class="primary" onClick={() => setShowPar(!showPar)}>{showPar ? t('grHidePar') : t('grShowPar')}</button>
        </div>
      </header>
      <p class="hint">🎯 {t('grBrief', { sk: g.skMVA, km: fmt(g.cableKm, 1), kva: g.trafoKVA, inT: fmt(g.inT, 1) })}</p>
      <div class="board">
        <section class="map">
          <Tcc g={g} st={st} par={showPar && par ? par.settings : null} />
          <ul class="tcc-legend">
            {RELAYS.map((k) => <li key={k}><svg width="30" height="10" aria-hidden="true"><line x1="0" x2="30" y1="5" y2="5" stroke={COLORS[k]} stroke-width="3" stroke-dasharray={DASH[k]} /></svg> {t(`gr_${k}`)}</li>)}
            {g.cases.filter((c) => c.level === 'max').map((c, i) => <li key={c.id}><b class="fault-key">{'①②③'[i]}</b> {t(`grCase_${c.where}`)} · <bdi dir="ltr">{fmt(c.iA)} A</bdi></li>)}
            {showPar && <li><svg width="30" height="10" aria-hidden="true"><line x1="0" x2="30" y1="5" y2="5" stroke="var(--muted)" stroke-width="1.5" /></svg> {t('grPar', { s: fmt(parScore, 3) })}</li>}
          </ul>
          <p class="muted small">{t('grLegend', { cti: fmt(CTI_S, 2), mult: fmt(INRUSH_MULT), ts: fmt(INRUSH_S, 2) })}</p>
        </section>
        <aside class="panel">
          {RELAYS.map((k) => (
            <fieldset key={k} class="relay-card" style={`border-color:${COLORS[k]}`}>
              <legend>{t(`gr_${k}`)}</legend>
              <div class="row">
                <label>{t('grCurve')} <select value={st[k].curve} onChange={(e) => upd(k, { curve: (e.target as HTMLSelectElement).value as RelaySetting['curve'] })}>
                  {(['IEC_SI', 'IEC_VI', 'IEC_EI'] as const).map((c) => <option key={c} value={c}>{t(`curve_${c}`)}</option>)}
                </select></label>
                <label>{t('grPickup')} <input type="number" inputMode="numeric" dir="ltr" min={1} step={1} value={st[k].pickupA} onChange={(e) => { const v = Number((e.target as HTMLInputElement).value); if (Number.isFinite(v) && v >= 1) upd(k, { pickupA: Math.round(v) }); else (e.target as HTMLInputElement).value = String(st[k].pickupA); }} /></label>
                <label>TMS <input type="number" inputMode="decimal" dir="ltr" min={0.05} max={1} step={0.025} value={st[k].tms} onChange={(e) => { const v = Number((e.target as HTMLInputElement).value); if (Number.isFinite(v) && v >= 0.05 && v <= 1) upd(k, { tms: v }); else (e.target as HTMLInputElement).value = String(st[k].tms); }} /></label>
              </div>
              {k === 'T' && (
                <div class="row">
                  <label class="toggle"><input type="checkbox" checked={st.T.hsA !== undefined} onChange={(e) => upd('T', (e.target as HTMLInputElement).checked ? { hsA: Math.ceil(1.3 * g.lvMaxA), hsDelayS: 0.05 } : { hsA: undefined, hsDelayS: undefined })} /> {t('grHighSet')}</label>
                  {st.T.hsA !== undefined && <>
                    <label>{t('grHsA')} <input type="number" dir="ltr" min={1} value={st.T.hsA} onChange={(e) => { const v = Number((e.target as HTMLInputElement).value); if (Number.isFinite(v) && v >= 1) upd('T', { hsA: Math.round(v) }); else (e.target as HTMLInputElement).value = String(st.T.hsA); }} /></label>
                    <label>{t('grHsDelay')} <input type="number" dir="ltr" min={0} max={1} step={0.01} value={st.T.hsDelayS} onChange={(e) => { const v = Number((e.target as HTMLInputElement).value); if (Number.isFinite(v) && v >= 0 && v <= 1) upd('T', { hsDelayS: v }); else (e.target as HTMLInputElement).value = String(st.T.hsDelayS); }} /></label>
                  </>}
                </div>
              )}
              <p class="muted small">{t('grLoadOf', { a: fmt(k === 'T' ? T_OVERLOAD * g.inT : k === 'F' ? g.feederLoadA : g.incomerLoadA) })}</p>
            </fieldset>
          ))}
        </aside>
      </div>
      <section class="card">
        <h3>{t('grChecks')}</h3>
        <table class="metrics">
          <thead><tr><th>{t('grCase')}</th><th>{t('gr_T')}</th><th>{t('gr_F')}</th><th>{t('gr_I')}</th></tr></thead>
          <tbody>{g.cases.map((c) => (
            <tr key={c.id}><th scope="row">{t(`grCase_${c.where}`)} · {t(`grLevel_${c.level}`)} · <bdi dir="ltr">{fmt(c.iA)} A</bdi></th>
              {RELAYS.map((k) => { const tm = ev.times[c.id]![k]; return <td key={k} dir="ltr">{tm === undefined ? '' : Number.isFinite(tm) ? `${fmt(tm, 3)} s` : '—'}</td>; })}</tr>
          ))}</tbody>
        </table>
        <ul class="checks">{ev.checks.filter((c) => !c.ok).filter((c, i, arr) => arr.findIndex((x) => x.id === c.id && x.relay === c.relay && x.caseId === c.caseId) === i).map((c, i) => <li key={i} class="warn-text">✗ {t(`grChk_${c.id}`, { relay: t(`gr_${c.relay}`), case: c.caseId ? t(`grCase_${c.caseId.split('-')[0]}`) : '', value: c.value === undefined || !Number.isFinite(c.value) ? '∞' : fmt(c.value, 3), limit: c.limit === undefined ? '' : fmt(c.limit, 3) })}</li>)}
          {ev.ok && <li>✅ {t('grAllOk', { cti: fmt(CTI_S, 2), max: fmt(MAX_CLEAR_S) })}</li>}</ul>
        {showPar && par && <div class="muted"><p>{t('grPar', { s: fmt(parScore, 3) })}</p><ul>{RELAYS.map((k) => <li key={k}>{t(`gr_${k}`)}: {t(`curve_${par.settings[k].curve}`)} · <bdi dir="ltr">{par.settings[k].pickupA} A · TMS {par.settings[k].tms}{par.settings[k].hsA ? ` · HS ${par.settings[k].hsA} A` : ''}</bdi></li>)}</ul></div>}
        <div class="btns"><button onClick={async () => { try { await navigator.clipboard.writeText(`⚡ ${t('title')} · ${t('grading')} #${seed} · ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} · ${ev.ok ? `${fmt(ev.scoreS, 3)} s` : '—'}\n${link}`); setCopied(true); } catch { setCopied(false); } }}>{copied ? t('copied') : t('share')}</button></div>
        <p class="ruleset-note">{t('grNote')}</p>
      </section>
    </div>
  );
}

/** Log-log time–current characteristic plot (never mirrored). */
function Tcc({ g, st, par }: { g: ReturnType<typeof generateGrading>; st: Settings; par: Settings | null }) {
  const W = 560, H = 360, L = 52, B = 34, T = 10, R = 12;
  const xMin = 10, xMax = 50000, yMin = 0.01, yMax = 100;
  const lx = (i: number) => L + ((Math.log10(i) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * (W - L - R);
  const ly = (s: number) => T + (1 - (Math.log10(s) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin))) * (H - T - B);
  const path = (s: RelaySetting) => {
    const pts: string[] = [];
    for (let e = Math.log10(s.pickupA * 1.02); e <= Math.log10(xMax); e += 0.01) {
      const i = 10 ** e, tm = relayTime(s, i);
      if (!Number.isFinite(tm)) continue;
      pts.push(`${lx(i).toFixed(1)},${ly(Math.min(Math.max(tm, yMin), yMax)).toFixed(1)}`);
    }
    return pts.length ? `M${pts.join('L')}` : '';
  };
  const xt = [10, 100, 1000, 10000], yt = [0.01, 0.1, 1, 10, 100];
  return (
    <svg class="tcc" viewBox={`0 0 ${W} ${H}`} dir="ltr" role="img" aria-label={t('grTcc')}>
      {xt.map((x) => <g key={x}><line x1={lx(x)} x2={lx(x)} y1={T} y2={H - B} class="grid" /><text x={lx(x)} y={H - B + 14} text-anchor="middle" class="axis">{x >= 1000 ? `${x / 1000}k` : x}</text></g>)}
      {yt.map((y) => <g key={y}><line x1={L} x2={W - R} y1={ly(y)} y2={ly(y)} class="grid" /><text x={L - 6} y={ly(y) + 4} text-anchor="end" class="axis">{y}</text></g>)}
      <text x={(W + L) / 2} y={H - 4} text-anchor="middle" class="axis">A (13.8 kV)</text>
      <text x={12} y={H / 2} text-anchor="middle" class="axis" transform={`rotate(-90 12 ${H / 2})`}>s</text>
      {g.cases.filter((c) => c.level === 'max').map((c, i) => <g key={c.id}><line x1={lx(c.iA)} x2={lx(c.iA)} y1={T} y2={H - B} class="fault" /><text x={lx(c.iA) + (i === 2 ? 4 : -4)} y={T + 14 + i * 18} class="fault-label" text-anchor={i === 2 ? 'start' : 'end'}>{'①②③'[i]}</text></g>)}
      <circle cx={lx(INRUSH_MULT * g.inT)} cy={ly(INRUSH_S)} r={4} class="inrush"><title>{t('grInrush')}</title></circle>
      {par && RELAYS.map((k) => <path key={`p${k}`} d={path(par[k])} class="par" />)}
      {RELAYS.map((k) => <path key={k} d={path(st[k])} fill="none" stroke={COLORS[k]} stroke-width={2.4} stroke-dasharray={DASH[k]} />)}
    </svg>
  );
}
