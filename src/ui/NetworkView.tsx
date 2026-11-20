import type { GameSession } from './session';
import { t, fmt } from '../i18n/i18n';
import { analyze } from './hints';

export type Selection = { kind: 'site'; id: string; sw?: string } | { kind: 'cable'; id: string } | null;

interface Props {
  s: GameSession;
  selection: Selection;
  onSelect: (sel: Selection) => void;
  ringFilter: string | null;
  /** draw the ring top-to-bottom (phones) */
  vertical?: boolean;
}

type Pt = { x: number; y: number };

/**
 * Network view v2 (D-019, research/13 §6, research/14 §2): a readable "control-room mimic".
 * - Live cables glow and carry moving current dashes in the direction of supply; dead cables are grey and dashed.
 * - Every RMU feeds a cluster of homes whose windows light or go dark with supply (customer impact is visible).
 * - Switches are drawn as single-line symbols on both sides of each RMU and are tappable on their own.
 * - Fault indicators are flags (filled = fault current passed, hollow = read and not passed), shown as read.
 * Nothing relies on colour alone: dash pattern, symbol shape and labels carry the same information.
 * Diagrams are never mirrored in RTL (SYNTHESIS §6): the element is dir="ltr".
 * Every element carries data-id ("R1-3", "GA", "sw:R1-3-L", "cable:R1-C4") for the guide spotlight.
 */
export function NetworkView({ s, selection, onSelect, ringFilter, vertical = false }: Props) {
  void s.tick.value;
  const sim = s.sim, sc = s.scenario;
  const sites = new Map(sc.sites.map((x) => [x.id, x]));
  const rings = ringFilter ? sc.rings.filter((r) => r.id === ringFilter) : sc.rings;
  const P = (p: Pt): Pt => (vertical ? { x: p.y * 1.5, y: p.x * 1.1 } : p);
  // bounds
  const raw: Pt[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, ...rings.flatMap((r) => r.rmus.map((id) => sites.get(id)!)).flatMap((p) => [p, { x: p.x, y: p.y + (p.y > 0 ? 13 : -13) }])];
  const pp = raw.map(P);
  const pad = 9;
  const minX = Math.min(...pp.map((p) => p.x)) - pad - (vertical ? 4 : 6), maxX = Math.max(...pp.map((p) => p.x)) + pad + (vertical ? 4 : 6);
  const minY = Math.min(...pp.map((p) => p.y)) - pad, maxY = Math.max(...pp.map((p) => p.y)) + pad;
  const sw = (id: string) => sim.net.switches.find((x) => x.id === id)!;
  const latestRead = new Map<string, { lit: boolean; t: number }>();
  for (const r of sim.readings) latestRead.set(r.fpi, { lit: r.phase || r.earth, t: r.t });
  const selId = selection?.kind === 'site' ? selection.id : selection?.kind === 'cable' ? `cable:${selection.id}` : null;
  // the cable the player's own evidence has pinned down (never the hidden truth)
  const located = sim.faultPresent && !sim.complete ? analyze(sc, sim).located : null;
  const key = (e: KeyboardEvent, f: () => void) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } };

  return (
    <svg class={`net v2 ${vertical ? 'vertical' : ''}`} viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} dir="ltr" role="group" aria-label={t('networkView')} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.9" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="winglow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="0.6" /></filter>
        <pattern id="hatch" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.6" class="hatch" /></pattern>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" class="gridline" /></pattern>
        <symbol id="house" viewBox="0 0 10 10"><path d="M1 5 5 1.4 9 5V9.2H1Z" style="fill: var(--hb); stroke: var(--hs); stroke-width: 0.5" /><rect x="2.3" y="5.3" width="2" height="1.9" style="fill: var(--wf)" /><rect x="5.7" y="5.3" width="2" height="1.9" style="fill: var(--wf)" /></symbol>
        <symbol id="truck" viewBox="0 0 12 7"><path d="M0.5 1h6.5v4.2H0.5zM7 2.4h2.4l2 1.8v1H7z" style="fill: #f2f4f8; stroke: #8794a8; stroke-width: 0.2" /><circle cx="2.8" cy="5.6" r="1" style="fill: #20283a" /><circle cx="9" cy="5.6" r="1" style="fill: #20283a" /><rect x="3" y="0.2" width="1.4" height="0.8" style="fill: var(--beacon)" /></symbol>
      </defs>
      <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="url(#grid)" class="bg" />
      {rings.map((ring) => {
        const chain: Pt[] = [{ x: 0, y: 0 }, ...ring.rmus.map((id) => sites.get(id)!), { x: 100, y: 0 }];
        // supply direction: walk from each grid station through closed switches
        const closedUpTo = (k: number) => ring.ringSwitches.slice(0, 2 * k + 1).every((id) => sw(id).closed);
        const closedFrom = (k: number) => ring.ringSwitches.slice(2 * k + 1).every((id) => sw(id).closed);
        return (
          <g key={ring.id} class="ring">
            {ring.cables.map((cid, i) => {
              const a = P(chain[i]!), b = P(chain[i + 1]!);
              const live = sim.cableEnergised(cid);
              const dir = live ? (closedUpTo(i) ? 1 : closedFrom(i) ? -1 : 1) : 0;
              const [x1, y1, x2, y2] = dir < 0 ? [b.x, b.y, a.x, a.y] : [a.x, a.y, b.x, b.y];
              const permit = sim.permits.has(cid);
              const earthed = sim.switchesBounding(cid).some((e) => e.earthed);
              const suspect = sim.suspect.has(cid) && !live;
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              const select = () => onSelect({ kind: 'cable', id: cid });
              return (
                <g key={cid} data-id={`cable:${cid}`} class={`cable-g ${selId === `cable:${cid}` ? 'sel' : ''}`} onClick={select} role="button" tabindex={0}
                  aria-label={`${t('cable', { id: cid })}: ${live ? t('cableLive') : t('cableDead')}${earthed ? ` · ${t('earthed')}` : ''}${permit ? ` · ${t('permitHeld')}` : ''}`}
                  onKeyDown={(e) => key(e, select)}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class="cable-hit" />
                  {permit && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class="cable-permit" stroke="url(#hatch)" />}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} class={`cable ${live ? 'live' : 'dead'} ${suspect ? 'suspect' : ''}`} filter={live ? 'url(#glow)' : undefined} />
                  {live && <line x1={x1} y1={y1} x2={x2} y2={y2} class="flow" />}
                  {earthed && <g class="earth-g" transform={`translate(${mx} ${my - 3.2})`}><path d="M0 -1.6V0M-1.6 0H1.6M-1.05 0.75H1.05M-0.5 1.5H0.5" class="earth-sym" /></g>}
                  {located === cid && <g class="fault-mark" transform={`translate(${mx} ${my})`}><circle r="1.9" /><path d="M0.3 -1.3 -0.7 0.2H0.1L-0.3 1.3 0.8 -0.3H0Z" /></g>}
                  <text x={mx} y={my + (vertical ? 0.8 : 3.6)} dx={vertical ? 3 : 0} class="cable-label" text-anchor={vertical ? 'start' : 'middle'}>{cid.split('-')[1]}</text>
                </g>
              );
            })}
            {ring.rmus.map((id, k) => {
              const st = sites.get(id)!;
              const c = P(st);
              const on = sim.isEnergised(`${id}B`);
              const L = sw(`${id}-L`), R = sw(`${id}-R`);
              const prev = P(chain[k]!), next = P(chain[k + 2]!);
              const out = st.y > 0.5 ? 1 : -1; // homes on the outside of the ring
              const hv = vertical ? { x: c.x + out * 9.5, y: c.y } : { x: c.x, y: c.y + out * 8.5 };
              const select = (swId?: string) => onSelect({ kind: 'site', id, sw: swId });
              const swMark = (o: Pt, s0: typeof L) => {
                const dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy) || 1;
                const ux = dx / d, uy = dy / d;
                const mx = c.x + ux * 4.6, my = c.y + uy * 4.6;
                const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
                const isNop = ring.nop === s0.id;
                const fpi = latestRead.get(`${id}-F${s0.id.endsWith('-L') ? 'L' : 'R'}`);
                return (
                  <g data-id={`sw:${s0.id}`} class={`swm-g ${s0.closed ? 'closed' : 'open'} ${s0.earthed ? 'earthed' : ''} ${selection?.kind === 'site' && selection.sw === s0.id ? 'sel' : ''}`}
                    onClick={(e) => { e.stopPropagation(); select(s0.id); }} role="button" tabindex={0}
                    aria-label={`${t(s0.id.endsWith('-L') ? 'switchL' : 'switchR', { to: s0.id.endsWith('-L') ? 'A' : 'B' })} ${s0.id}: ${s0.closed ? t('closed') : t('open')}${isNop ? ` · ${t('nop')}` : ''}`}
                    onKeyDown={(e) => key(e, () => select(s0.id))}>
                    <circle cx={mx} cy={my} r="2.6" class="sw-hit" />
                    <g transform={`translate(${mx} ${my}) rotate(${ang})`}>
                      <rect x="-1.45" y="-1.45" width="2.9" height="2.9" rx="0.5" class="sw-box" />
                      {s0.closed ? <line x1="-0.95" y1="0" x2="0.95" y2="0" class="sw-blade" /> : <line x1="-0.95" y1="0.55" x2="0.7" y2="-0.85" class="sw-blade" />}
                      <circle cx="-0.95" cy={s0.closed ? 0 : 0.55} r="0.32" class="sw-pivot" />
                    </g>
                    {isNop && <g class="nop-tag"><rect x={mx - 2.6} y={my - (vertical ? -2.4 : 4.9)} width="5.2" height="2.3" rx="0.6" /><text x={mx} y={my - (vertical ? -4.1 : 3.2)} text-anchor="middle">NOP</text></g>}
                    {s0.earthed && <path transform={`translate(${mx + uy * 2.4} ${my - ux * 2.4})`} d="M0 -1.2V0M-1.2 0H1.2M-0.8 0.6H0.8M-0.35 1.2H0.35" class="earth-sym" />}
                    {sim.secured.has(s0.id) && <g transform={`translate(${mx - uy * 2.6 - 0.8} ${my + ux * 2.6 - 0.9})`} class="lock-sym"><rect x="0" y="0.8" width="1.6" height="1.3" rx="0.2" /><path d="M0.35 0.8V0.45a0.45 0.45 0 0 1 0.9 0V0.8" /></g>}
                    {fpi && <g transform={`translate(${mx + ux * 0.2 - uy * 3.2} ${my + uy * 0.2 + ux * 3.2 - (vertical ? 0 : 0.5)})`} class={`fpi-flag ${fpi.lit ? 'lit' : 'dark'}`}>
                      <path d="M0 1.6V-1.8M0 -1.8H1.9L1.5 -1.1L1.9 -0.4H0" /></g>}
                  </g>
                );
              };
              const crewsHere = sim.crews.filter((cr) => cr.site === id);
              const coming = sim.crews.filter((cr) => cr.travellingTo === id);
              const remote = st.remote;
              return (
                <g key={id} data-id={id} class={`rmu ${on ? 'on' : 'off'} ${selId === id ? 'sel' : ''}`} onClick={() => select()} role="button" tabindex={0}
                  aria-label={`${t('rmu', { id })}: ${on ? t('supplyOn') : t('supplyOff')} · ${t('homesN', { n: st.customers ?? 0 })}`}
                  onKeyDown={(e) => key(e, () => select())}>
                  <rect x={Math.min(c.x, hv.x) - 4.5} y={Math.min(c.y, hv.y) - 4.5} width={Math.abs(hv.x - c.x) + 9} height={Math.abs(hv.y - c.y) + 9} class="hit" />
                  <line x1={c.x} y1={c.y} x2={hv.x} y2={hv.y} class={`service ${on ? 'live' : 'dead'}`} />
                  <g class={`homes ${on ? 'lit' : 'dark'}`}>
                    {[-1, 0, 1].map((j) => {
                      const hx = vertical ? hv.x + (out > 0 ? 0 : -3.2) + Math.abs(j) * out * 0.2 : hv.x + j * 3.3 - 1.6;
                      const hy = vertical ? hv.y + j * 3.3 - 1.6 : hv.y + (out > 0 ? 0 : -3.2) - Math.abs(j) * 0.0;
                      return <use key={j} href="#house" x={hx} y={hy} width="3.2" height="3.2" />;
                    })}
                    <text x={vertical ? hv.x + out * 4.6 : hv.x} y={vertical ? hv.y + 0.8 : hv.y + (out > 0 ? 6.2 : -4.3)} text-anchor={vertical ? (out > 0 ? 'start' : 'end') : 'middle'} class="homes-n">{fmt(st.customers ?? 0)}</text>
                  </g>
                  {swMark(prev, L)}{swMark(next, R)}
                  <rect x={c.x - 2.7} y={c.y - 2.2} width="5.4" height="4.4" rx="0.8" class="rmu-box" />
                  <line x1={c.x - 2.7} y1={c.y - 0.6} x2={c.x + 2.7} y2={c.y - 0.6} class="rmu-line" />
                  <circle cx={c.x} cy={c.y + 0.9} r="0.8" class={`lamp ${on ? 'on' : 'off'}`} />
                  {vertical
                    ? <text x={c.x - out * 3.6} y={c.y + 0.8} class="label" text-anchor={out < 0 ? 'start' : 'end'}>{id}</text>
                    : <text x={c.x} y={c.y + (out > 0 ? -3.4 : 5.4)} class="label" text-anchor="middle">{id}</text>}
                  {remote && <g class={`rtu ${st.commsOk ? '' : 'lost'}`} transform={`translate(${c.x + 2.1} ${c.y - 2.2})`}><path d="M0 0V-1.8M-0.9 -2.6a1.3 1.3 0 0 1 1.8 0M-1.5 -3.2a2.1 2.1 0 0 1 3 0" />{!st.commsOk && <path d="M-1.6 -3.4 1.6 0" class="slash" />}</g>}
                  {(crewsHere.length > 0 || coming.length > 0) && <use href="#truck" class={`truck ${crewsHere.length ? 'here' : 'coming'}`} x={c.x - 3.6 - (vertical ? 0 : 0)} y={c.y + (out > 0 && !vertical ? -6.4 : 2.6)} width="4.2" height="2.45" />}
                </g>
              );
            })}
          </g>
        );
      })}
      {(['GA', 'GB'] as const).map((g) => {
        const c = P({ x: g === 'GA' ? 0 : 100, y: 0 });
        const select = () => onSelect({ kind: 'site', id: g });
        return (
          <g key={g} data-id={g} class={`gs ${selId === g ? 'sel' : ''}`} onClick={select} role="button" tabindex={0}
            aria-label={t('gridStation', { name: g === 'GA' ? 'A' : 'B' })} onKeyDown={(e) => key(e, select)}>
            <rect x={c.x - 6} y={c.y - 6} width="12" height="12" class="hit" />
            <rect x={c.x - 4.2} y={c.y - 4.2} width="8.4" height="8.4" rx="1.4" class="gs-box" />
            <circle cx={c.x - 0.9} cy={c.y - 0.4} r="1.6" class="gs-coil" /><circle cx={c.x + 0.9} cy={c.y - 0.4} r="1.6" class="gs-coil" />
            <text x={c.x} y={c.y + 3.3} class="gs-label" text-anchor="middle">{g === 'GA' ? 'A' : 'B'}</text>
            {rings.map((r) => {
              const cbId = g === 'GA' ? r.ringSwitches[0]! : r.ringSwitches[r.ringSwitches.length - 1]!;
              const cb = sw(cbId);
              const tripped = sim.relayRecords.some((rr) => rr.cb === cbId) && !cb.closed;
              const first = sites.get(g === 'GA' ? r.rmus[0]! : r.rmus[r.rmus.length - 1]!)!;
              const f = P(first);
              const d = Math.hypot(f.x - c.x, f.y - c.y) || 1;
              const bx = c.x + ((f.x - c.x) / d) * 6.4, by = c.y + ((f.y - c.y) / d) * 6.4;
              return (
                <g key={cbId} data-id={`sw:${cbId}`} class={`cb-g ${cb.closed ? 'closed' : 'open'} ${tripped ? 'tripped' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'site', id: g, sw: cbId }); }}
                  role="button" tabindex={0} aria-label={`${t('breakerName')} ${cbId}: ${cb.closed ? t('closed') : t('open')}${tripped ? ` · ${t('tripped')}` : ''}`}
                  onKeyDown={(e) => key(e, () => onSelect({ kind: 'site', id: g, sw: cbId }))}>
                  <circle cx={bx} cy={by} r="2.6" class="sw-hit" />
                  {tripped && <circle cx={bx} cy={by} r="2.3" class="trip-ring" />}
                  <rect x={bx - 1.3} y={by - 1.3} width="2.6" height="2.6" rx="0.3" class="cb-box" />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
