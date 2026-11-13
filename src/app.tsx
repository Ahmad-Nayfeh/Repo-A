import { useEffect, useState } from 'preact/hooks';
import { lang, applyDocLang, store, t } from './i18n/i18n';
import { Home, ModelNotes, Glossary, About } from './ui/Pages';
import { Game } from './ui/Game';
import { GameSession, dailySeed, dailyDifficulty, todayUTC, decodeActions, TRAINING, ENGINE_VERSION, dailyResult } from './ui/session';
import type { Difficulty } from './engine/scenario/district';
import { generateScenario } from './engine/scenario/district';
import { runBot } from './engine/bot';

function parseHash(): { path: string; q: URLSearchParams } {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  return { path: path || '/', q: new URLSearchParams(qs ?? '') };
}

export function App() {
  const [route, setRoute] = useState(parseHash());
  const [theme, setThemeS] = useState(store.get('gs.theme') ?? 'dark');
  const [session, setSession] = useState<GameSession | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  void lang.value;

  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  useEffect(() => { applyDocLang(); }, [lang.value]);
  useEffect(() => { document.documentElement.dataset.theme = theme; store.set('gs.theme', theme); }, [theme]);

  // build a session for play routes
  useEffect(() => {
    const { path, q } = route;
    setNotice(null);
    if (path === '/daily') {
      const date = todayUTC();
      setSession(new GameSession({ mode: 'daily', seed: dailySeed(date), difficulty: dailyDifficulty(date), date }));
    } else if (path === '/training') {
      const i = Math.min(2, Math.max(0, Number(q.get('t') ?? 0)));
      const tr = TRAINING[i]!;
      setSession(new GameSession({ mode: 'training', seed: tr.seed, difficulty: tr.difficulty, training: i }));
    } else if (path === '/play') {
      const seed = Number(q.get('s') ?? 1) >>> 0;
      const d = (['easy', 'normal', 'hard'].includes(q.get('d') ?? '') ? q.get('d') : 'normal') as Difficulty;
      const v = Number(q.get('v') ?? ENGINE_VERSION);
      if (v !== ENGINE_VERSION) setNotice(t('replayOldVersion', { v, cur: ENGINE_VERSION }));
      if (seed === dailySeed() && !dailyResult()) { setNotice(t('dailyLocked')); setSession(null); return; }
      const tr = q.get('t');
      let replay;
      try { replay = q.get('a') ? decodeActions(q.get('a')!) : undefined; } catch { replay = undefined; }
      setSession(new GameSession({ mode: tr !== null ? 'training' : 'free', seed, difficulty: d, training: tr !== null ? Number(tr) : undefined, replay }));
    } else setSession(null);
  }, [route]);

  // test & bot seam (docs/org/game-design.md: agents need a harness to play); scores are local, so nothing to protect
  (window as unknown as { __gs: unknown }).__gs = {
    session: () => session,
    botHash: (seed: number, d: Difficulty) => runBot(generateScenario(seed, d)).sim.hash(),
    botActions: (seed: number, d: Difficulty) => runBot(generateScenario(seed, d)).actions,
  };
  const go = (h: string) => { location.hash = h; };
  const inGame = ['/daily', '/training', '/play'].includes(route.path);
  return (
    <main class="app">
      {notice && <div class="toast" role="status" onClick={() => setNotice(null)}>{notice}</div>}
      {inGame && session && <Game key={`${route.path}?${route.q}`} s={session} onExit={() => go('#/')} onNext={session.mode === 'training' && session.training < 2 ? () => go(`#/training?t=${session.training + 1}`) : undefined} />}
      {inGame && !session && !notice && <p class="muted">{t('loading')}</p>}
      {route.path === '/' && <Home go={go} theme={theme} setTheme={setThemeS} />}
      {route.path === '/notes' && <ModelNotes go={go} />}
      {route.path === '/glossary' && <Glossary go={go} />}
      {route.path === '/about' && <About go={go} />}
    </main>
  );
}
