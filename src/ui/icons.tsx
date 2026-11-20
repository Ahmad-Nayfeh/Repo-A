/**
 * One consistent icon set (24×24, stroke = currentColor) replacing emoji in the game UI (research/13 §6: custom
 * icons, no emoji). Drawn for this project; no third-party artwork.
 */
const P: Record<string, string> = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  house: 'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  truck: 'M2 7h11v9H2zM13 10h4l3 3v3h-7M6.5 18.5a1.5 1.5 0 1 0 0-.01M16.5 18.5a1.5 1.5 0 1 0 0-.01',
  flag: 'M6 21V4M6 4h11l-2 4 2 4H6',
  bolt: 'M13 2 5 14h6l-1 8 8-12h-6z',
  antenna: 'M12 10v11M8 21h8M8.5 6.5a5 5 0 0 1 7 0M6 4a8.5 8.5 0 0 1 12 0M12 10a1 1 0 1 0 0-.01',
  lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  earth: 'M12 3v9M5 12h14M7.5 15.5h9M10 19h4',
  permit: 'M7 3h7l4 4v14H7zM14 3v4h4M9.5 12h6M9.5 15.5h6',
  wrench: 'M14.5 6.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  fwd: 'M5 5l8 7-8 7zM13 5l8 7-8 7z',
  play: 'M7 4l13 8-13 8z',
  pause: 'M7 4h3.5v16H7zM13.5 4H17v16h-3.5z',
  stepf: 'M6 5l9 7-9 7zM17 5h2v14h-2z',
  stepb: 'M18 5l-9 7 9 7zM5 5h2v14H5z',
  check: 'M4 12.5l5 5L20 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  read: 'M4 17h3l3-8 4 12 3-7h3',
  open: 'M4 16h5l8-7M15 16h5',
  close: 'M4 16h16',
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1V4.5a1.5 1.5 0 0 1 3 0V12m0-.5v-5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.5 14a1.5 1.5 0 0 1 2.5-1.7L8 15',
  gs: 'M3 21V9l9-5 9 5v12zM8 21v-6h8v6M9 11.5a2 2 0 1 0 0-.01M15 11.5a2 2 0 1 0 0-.01',
  rmu: 'M5 4h14v17H5zM5 9h14M9 13v4M15 13v4M12 6.5h.01',
  cable: 'M3 17c4 0 4-10 9-10s5 10 9 10',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
};

export function Icon({ name, size = 20, class: cls = '', title }: { name: keyof typeof P | string; size?: number; class?: string; title?: string }) {
  const d = P[name] ?? P.x!;
  const filled = name === 'play' || name === 'pause' || name === 'stepf' || name === 'stepb' || name === 'fwd' || name === 'bolt' || name === 'star';
  return (
    <svg class={`ico ${cls}`} width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      stroke-width={filled ? 0 : 2} stroke-linecap="round" stroke-linejoin="round" aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}
