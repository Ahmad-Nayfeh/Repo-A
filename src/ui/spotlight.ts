import { useEffect } from 'preact/hooks';

/**
 * Spotlight (research/13 §3: highlight the target, softly dim the rest — no hard click-blocking).
 * Adds .spot to every element inside `root` whose data-id or data-act is in `targets`, and .spotlight to the root.
 * Runs after every render so it follows the live state.
 */
export function useSpotlight(rootSel: string, targets: string[]) {
  useEffect(() => {
    const root = document.querySelector(rootSel);
    if (!root) return;
    root.querySelectorAll('.spot').forEach((e) => e.classList.remove('spot'));
    root.classList.toggle('spotlight', targets.length > 0);
    for (const id of targets) {
      const q = `[data-id="${CSS.escape(id)}"], [data-act="${CSS.escape(id)}"]`;
      root.querySelectorAll(q).forEach((e) => e.classList.add('spot'));
    }
  });
}
