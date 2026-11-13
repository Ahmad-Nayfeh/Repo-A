import type { GameSession } from './session';
import type { Selection } from './NetworkView';
import { t } from '../i18n/i18n';

/**
 * Phone view (D3-05): one ring drawn as a vertical ladder from grid station A (top) to B (bottom). Every RMU and
 * cable is a full-width button (≥ 44 px) — also the keyboard / screen-reader path. Same visual language as the
 * SVG: live ━ / dead ┅, ■ closed / □ open, ⏚ earthed, 🔒 locked, 📄 permit, ⚡ flagged FPI (as read), 🚚 crew.
 */
export function RingLadder({ s, ringId, selection, onSelect }: { s: GameSession; ringId: string; selection: Selection; onSelect: (x: Selection) => void }) {
  void s.tick.value;
  const sim = s.sim;
  const ring = s.scenario.rings.find((r) => r.id === ringId)!;
  const sw = (id: string) => sim.net.switches.find((x) => x.id === id)!;
  const cbA = sw(ring.ringSwitches[0]!), cbB = sw(ring.ringSwitches[ring.ringSwitches.length - 1]!);
  const lit = new Set(sim.readings.filter((r) => r.phase || r.earth).map((r) => r.site));
  const cableRow = (cid: string) => {
    const live = sim.cableEnergised(cid);
    const earthed = sim.switchesBounding(cid).some((x) => x.earthed);
    const on = selection?.kind === 'cable' && selection.id === cid;
    return (
      <li key={cid}>
        <button class={`ladder-cable ${live ? 'live' : 'dead'} ${sim.suspect.has(cid) && !live ? 'suspect' : ''} ${on ? 'sel' : ''}`} onClick={() => onSelect({ kind: 'cable', id: cid })}
          aria-label={`${t('cable', { id: cid })}: ${live ? t('cableLive') : t('cableDead')}`}>
          <span class="bar" aria-hidden="true">{live ? '┃' : '┇'}</span> {cid} {earthed ? '⏚' : ''} {sim.permits.has(cid) ? '📄' : ''}
        </button>
      </li>
    );
  };
  return (
    <ol class="ladder" dir="ltr" aria-label={`${t('ring')} ${ring.id}`}>
      <li><button class={`ladder-gs ${selection?.kind === 'site' && selection.id === 'GA' ? 'sel' : ''}`} onClick={() => onSelect({ kind: 'site', id: 'GA' })}>A · {cbA.closed ? '■' : '□'} {cbA.id}</button></li>
      {ring.rmus.map((id, k) => {
        const site = s.scenario.sites.find((x) => x.id === id)!;
        const L = sw(`${id}-L`), R = sw(`${id}-R`);
        const on = sim.isEnergised(`${id}B`);
        const crews = sim.crews.filter((c) => c.site === id || c.travellingTo === id).length;
        const sel = selection?.kind === 'site' && selection.id === id;
        return [
          cableRow(ring.cables[k]!),
          <li key={id}>
            <button class={`ladder-rmu ${on ? 'on' : 'off'} ${sel ? 'sel' : ''}`} onClick={() => onSelect({ kind: 'site', id })}
              aria-label={`${t('rmu', { id })}: ${on ? t('supplyOn') : t('supplyOff')}`}>
              <span>{L.closed ? '■' : '□'}{L.earthed ? '⏚' : ''}{sim.secured.has(L.id) ? '🔒' : ''}</span>
              <b>{id}</b> {on ? '●' : '×'} {ring.nop === L.id || ring.nop === R.id ? 'NOP' : ''} {site.remote ? (site.commsOk ? '📡' : '⨯') : ''} {lit.has(id) ? '⚡' : ''} {crews ? `🚚${crews > 1 ? crews : ''}` : ''}
              <span>{R.closed ? '■' : '□'}{R.earthed ? '⏚' : ''}{sim.secured.has(R.id) ? '🔒' : ''}</span>
            </button>
          </li>,
        ];
      })}
      {cableRow(ring.cables[ring.cables.length - 1]!)}
      <li><button class={`ladder-gs ${selection?.kind === 'site' && selection.id === 'GB' ? 'sel' : ''}`} onClick={() => onSelect({ kind: 'site', id: 'GB' })}>B · {cbB.closed ? '■' : '□'} {cbB.id}</button></li>
    </ol>
  );
}
