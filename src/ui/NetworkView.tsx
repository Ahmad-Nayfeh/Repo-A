import type { GameSession } from './session';
import { t } from '../i18n/i18n';

export type Selection = { kind: 'site'; id: string } | { kind: 'cable'; id: string } | null;

interface Props {
  s: GameSession;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  ringFilter: string | null; // phone ring-focused view
}

/**
 * Schematic network view (SVG). Geometry comes from the scenario layout (UI only). Diagrams are never mirrored
 * in RTL (SYNTHESIS §6): the element is rendered with dir="ltr".
 * Visual language (no information by colour alone): energised = solid line; dead = dashed; earthed = earth glyph;
 * permit = hatched band; open switch = gap with hollow square; NOP = "NOP" tag; FPI flagged (as read) = ⚡ badge.
 */
export function NetworkView({ s, selection, onSelect, ringFilter }: Props) {
  void s.tick.value; // subscribe to updates
  const sim = s.sim, sc = s.scenario;
  const sites = new Map(sc.sites.map((x) => [x.id, x]));
  const rings = ringFilter ? sc.rings.filter((r) => r.id === ringFilter) : sc.rings;
  const pts = rings.flatMap((r) => r.rmus.map((id) => sites.get(id)!));
  const ys = pts.map((p) => p.y);
  const minY = Math.min(-8, ...ys) - 10, maxY = Math.max(8, ...ys) + 12;
  const vb = `-12 ${minY} 124 ${maxY - minY}`;
  const latestRead = new Map<string, { lit: boolean; t: number }>();
  for (const r of sim.readings) latestRead.set(r.fpi, { lit: r.phase || r.earth, t: r.t });
  const sw = (id: string) => sim.net.switches.find((x) => x.id === id)!;

  return (
    <svg class="net" viewBox={vb} dir="ltr" role="img" aria-label={t('networkView')} preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="hatch" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="2" class="hatch" />
        </pattern>
      </defs>
      {rings.map((ring) => {
        const chain = [{ x: 0, y: 0 }, ...ring.rmus.map((id) => sites.get(id)!), { x: 100, y: 0 }];
        return (
          <g key={ring.id}>
            {ring.cables.map((cid, i) => {
              const a = chain[i]!, b = chain[i + 1]!;
              const live = sim.cableEnergised(cid);
              const permit = sim.permits.has(cid);
              const ends = sim.switchesBounding(cid);
              const earthed = ends.some((e) => e.earthed);
              const sel = selection?.kind === 'cable' && selection.id === cid;
              const suspect = sim.suspect.has(cid);
              return (
                <g key={cid} class="cable-g" onClick={() => onSelect({ kind: 'cable', id: cid })} role="button" tabIndex={0}
                  aria-label={`${t('cable', { id: cid })}: ${live ? t('cableLive') : t('cableDead')}`}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ kind: 'cable', id: cid }); }}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class="cable-hit" />
                  {permit && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class="cable-permit" stroke="url(#hatch)" />}
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class={`cable ${live ? 'live' : 'dead'} ${suspect && !live ? 'suspect' : ''} ${sel ? 'sel' : ''}`} />
                  {earthed && <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 2} class="glyph earth" text-anchor="middle">⏚</text>}
                </g>
              );
            })}
            {ring.rmus.map((id, k) => {
              const st = sites.get(id)!;
              const sel = selection?.kind === 'site' && selection.id === id;
              const on = sim.isEnergised(`${id}B`);
              const L = sw(`${id}-L`), R = sw(`${id}-R`);
              const prev = chain[k]!, next = chain[k + 2]!;
              const mark = (o: { x: number; y: number }, s0: typeof L) => {
                const dx = o.x - st.x, dy = o.y - st.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
                const mx = st.x + (dx / d) * 3.2, my = st.y + (dy / d) * 3.2;
                return (
                  <g>
                    <rect x={mx - 1.1} y={my - 1.1} width="2.2" height="2.2" class={`swm ${s0.closed ? 'closed' : 'open'} ${s0.earthed ? 'earthed' : ''}`} />
                    {sim.secured.has(s0.id) && <text x={mx} y={my - 1.8} class="glyph lock" text-anchor="middle">🔒</text>}
                  </g>
                );
              };
              const fl = latestRead.get(`${id}-FL`), fr = latestRead.get(`${id}-FR`);
              const crewsHere = sim.crews.filter((c) => c.site === id || c.travellingTo === id);
              return (
                <g key={id} data-id={id} class={`rmu ${sel ? "sel" : ""}`} onClick={() => onSelect({ kind: 'site', id })} role="button" tabIndex={0}
                  aria-label={`${t('rmu', { id })}: ${on ? t('supplyOn') : t('supplyOff')}`}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ kind: 'site', id }); }}>
                  {mark(prev, L)}{mark(next, R)}
                  <rect x={st.x - 2.4} y={st.y - 2.4} width="4.8" height="4.8" rx="1" class={`rmu-box ${on ? 'on' : 'off'}`} />
                  <text x={st.x} y={st.y + 0.9} class="rmu-ico" text-anchor="middle">{on ? '' : '×'}</text>
                  <text x={st.x} y={st.y + 6} class="label" text-anchor="middle">{id}</text>
                  {(ring.nop === L.id || ring.nop === R.id) && <text x={st.x} y={st.y - 4.2} class="nop" text-anchor="middle">NOP</text>}
                  {st.remote && <text x={st.x + 3.4} y={st.y - 2.6} class={`glyph rtu ${st.commsOk ? '' : 'lost'}`}>{st.commsOk ? '📡' : '⨯'}</text>}
                  {(fl?.lit || fr?.lit) && <text x={st.x - 4.6} y={st.y - 2.6} class="glyph fpi">⚡</text>}
                  {crewsHere.length > 0 && <text x={st.x + 3.2} y={st.y + 4.4} class="glyph crew">🚚{crewsHere.length > 1 ? crewsHere.length : ''}</text>}
                </g>
              );
            })}
          </g>
        );
      })}
      {(['GA', 'GB'] as const).map((g) => {
        const x = g === 'GA' ? 0 : 100;
        const sel = selection?.kind === 'site' && selection.id === g;
        return (
          <g key={g} data-id={g} class={`gs ${sel ? "sel" : ""}`} onClick={() => onSelect({ kind: 'site', id: g })} role="button" tabIndex={0}
            aria-label={t('gridStation', { name: g === 'GA' ? 'A' : 'B' })} onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ kind: 'site', id: g }); }}>
            <rect x={x - 5} y={-5} width="10" height="10" rx="1.5" class="gs-box" />
            <text x={x} y={1.2} class="gs-label" text-anchor="middle">{g === 'GA' ? 'A' : 'B'}</text>
            {rings.map((r) => {
              const cbId = g === 'GA' ? r.ringSwitches[0]! : r.ringSwitches[r.ringSwitches.length - 1]!;
              const cb = sw(cbId);
              const tripped = sim.relayRecords.some((rr) => rr.cb === cbId) && !cb.closed;
              return <text key={cbId} x={x} y={8.5 + 3.2 * sc.rings.indexOf(r)} class={`cb ${cb.closed ? 'closed' : 'open'} ${tripped ? 'tripped' : ''}`} text-anchor="middle">{cb.closed ? '■' : '□'} {r.id}</text>;
            })}
          </g>
        );
      })}
    </svg>
  );
}
