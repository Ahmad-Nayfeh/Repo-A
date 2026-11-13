/**
 * One synthesized trip chime (GDD §6; D-011: audio beyond one chime is v1.x). No audio files; the AudioContext
 * is only created after a user gesture (any action), and a mute setting is respected.
 */
import { store } from '../i18n/i18n';

let ctx: AudioContext | null = null;
export const isMuted = () => store.get('gs.mute') === '1';
export function setMuted(m: boolean) { store.set('gs.mute', m ? '1' : '0'); }

export function chime() {
  if (isMuted()) return;
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    for (const [f, dt] of [[880, 0], [660, 0.18]] as const) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now + dt);
      g.gain.exponentialRampToValueAtTime(0.15, now + dt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(now + dt); o.stop(now + dt + 0.4);
    }
  } catch { /* audio unavailable */ }
}
