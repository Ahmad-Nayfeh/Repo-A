import { useState } from 'preact/hooks';
import type { GameSession } from './session';
import { t, fmt } from '../i18n/i18n';

export function Results({ s, onExit, onBack, onNext }: { s: GameSession; onExit: () => void; onBack: () => void; onNext?: () => void }) {
  const sim = s.sim;
  const m = sim.metrics();
  const par = s.par();
  const stars = s.stars();
  const f = s.scenario.fault;
  const cab = sim.net.cables.find((c) => c.id === f.cable)!;
  const rec = sim.relayRecords[0];
  const [copied, setCopied] = useState(false);
  const label = s.mode === 'daily' ? `${t('daily')} ${s.date}` : s.mode === 'training' ? `${t('training')} ${s.training + 1}` : `${t('freePlay')} #${s.scenario.seed} ${t(s.scenario.difficulty)}`;
  const share = `⚡ ${t('title')} · ${label} · ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} · ${fmt(m.cmlOfgem)} ${t('customerMinutes')} (${t('parCml')} ${fmt(par)}) · ${fmt(m.switchingOps)} ops\n${s.replayUrl()}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(share); setCopied(true); } catch { setCopied(false); }
  };
  const [eng] = useState(() => {
    // engine's full solution, revealed only after the run (D3-26)
    return { ik: rec ? Math.round(rec.iMaxA) : 0, i0: rec ? Math.round(rec.i3i0A) : 0 };
  });
  const row = (k: string, v: string) => <tr><th scope="row">{k}</th><td>{v}</td></tr>;
  return (
    <div class="results">
      <h2>{t('results')}</h2>
      <p class="stars" aria-label={`${t('stars')}: ${stars}/3`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
      <p class="muted">{t('starsRule')}</p>
      <table class="metrics">
        <tbody>
          {row(t('yourCml'), fmt(m.cmlOfgem))}
          {row(t('parCml'), Number.isFinite(par) ? fmt(par) : '—')}
          {row(t('cmlIeee'), fmt(m.cmlIeee))}
          {row(t('ci'), fmt(m.ci))}
          {row(t('ops'), fmt(m.switchingOps))}
          {row(t('duty'), fmt(m.dutyUsed))}
          {row(t('overloadMin'), fmt(m.overloadMin))}
          {row(t('nearMisses'), fmt(m.nearMisses))}
          {row(t('starEvents'), m.starEvents ? fmt(m.starEvents) : t('none'))}
          {row(t('timeToPermit'), m.timeToPermitMin === null ? '—' : `${fmt(m.timeToPermitMin)} min`)}
        </tbody>
      </table>
      <h3>{t('whatHappened')}</h3>
      <p>{t('faultWas', { type: t(`type_${f.type}`), cause: t(`cause_${f.cause}`), cable: f.cable, pct: Math.round(f.frac * 100), from: cab.from.replace(/[LRB]$/, ''), ik: eng.ik, i0: eng.i0 })}</p>
      {rec && <p>{t('measuredVsActual', { element: rec.element === 'phase' ? t('elementPhase') : t('elementEarth'), ia: Math.round(rec.iMaxA), i0: Math.round(rec.i3i0A) })}</p>}
      <pre class="share" dir="ltr">{share}</pre>
      <div class="btns">
        <button class="primary" onClick={copy}>{copied ? t('copied') : t('share')}</button>
        {onNext && <button onClick={onNext}>{t('nextTraining')}</button>}
        <button onClick={onBack}>{t('networkView')}</button>
        <button onClick={onExit}>{t('menu')}</button>
      </div>
    </div>
  );
}
