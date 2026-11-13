import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { runBot } from '../../src/engine/bot';
import { generateScenario } from '../../src/engine/scenario/district';

/* eslint-disable @typescript-eslint/no-explicit-any -- window.__gs is an untyped test seam */

for (const lang of ['en', 'ar'] as const) {
  test(`home renders (${lang}), no console errors, no serious a11y violations`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript((l) => localStorage.setItem('gs.lang', l), lang);
    await page.goto('/#/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    const axe = await new AxeBuilder({ page } as never).analyze();
    const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('game: relay record shown, no critical a11y issues, checklist appears when re-closing the tripped breaker', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto('/#/training?t=0');
  await expect(page.getByText(/Relay record/)).toBeVisible();
  // a11y on the game screen
  const axe = await new AxeBuilder({ page } as never).analyze();
  expect(axe.violations.filter((v) => v.impact === 'critical').map((v) => v.id)).toEqual([]);
  // select the tripped breaker's grid station and re-close it: the checklist must appear (sections unproven)
  const rec = await page.evaluate(() => (window as any).__gs.session().sim.relayRecords[0].cb as string);
  const gs = rec.endsWith('CBA') ? 'GA' : 'GB';
  await page.locator(`.net .gs[aria-label*="${gs === 'GA' ? 'A' : 'B'}"]`).first().click();
  await page.getByRole('button', { name: /Close · remote/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/Pre-switching checklist/)).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('cross-engine determinism: browser hash equals Node hash for scripted bot runs', async ({ page }) => {
  await page.goto('/#/');
  for (const [seed, d] of [[11, 'easy'], [22, 'normal'], [33, 'hard']] as const) {
    const node = runBot(generateScenario(seed, d)).sim.hash();
    const browser = await page.evaluate(([s, dd]) => (window as any).__gs.botHash(s, dd), [seed, d] as const);
    expect(browser).toBe(node);
  }
});

test('complete a shift through the UI session and see the shift report with stars and share text', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto('/#/play?v=1&s=777&d=easy');
  await expect(page.getByText(/Relay record/)).toBeVisible();
  await page.evaluate(() => {
    const g = (window as any).__gs;
    const acts = g.botActions(777, 'easy');
    const s = g.session();
    for (const a of acts.slice(1)) s.apply(a); // first action (advance to trip) already applied by the session
  });
  await expect(page.getByRole('heading', { name: 'Shift report' })).toBeVisible();
  await expect(page.locator('.stars')).toContainText('★');
  await expect(page.locator('.share')).toContainText('Grid Shift');
});

test('keyboard: RMUs are reachable by Tab and selectable with Enter; switch list includes feeder breakers (G-02)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto('/#/training?t=0');
  await expect(page.getByText(/Relay record/)).toBeVisible();
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => (document.activeElement as Element | null)?.classList?.contains('rmu') ?? false);
  }
  expect(reached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /^RMU / })).toBeVisible();
  await page.getByText('Switching points').click();
  await expect(page.locator('.switch-list').getByRole('button', { name: 'R1-CBA' })).toBeVisible();
});

test('log shows translated entries, never raw engine values (G re-verification regression)', async ({ page }) => {
  for (const lang of ['en', 'ar'] as const) {
    await page.goto('/#/');
    await page.evaluate((l) => localStorage.setItem('gs.lang', l), lang);
    await page.reload();
    await page.goto('/#/play?v=1&s=777&d=easy');
    await page.waitForFunction(() => !!(window as any).__gs?.session());
    await page.evaluate(() => { const g = (window as any).__gs; const s = g.session(); for (const a of g.botActions(777, 'easy').slice(1)) s.apply(a); });
    await page.locator('.results .btns button').nth(1).click(); // back to the network
    await page.locator('.tabs button').nth(3).click();          // Log tab
    const text = await page.locator('.log').innerText();
    expect(text.length).toBeGreaterThan(50);
    for (const raw of [' true', ' false', 'proveDead', 'readFpi', 'attendDamage', ' close\n', ' open\n']) expect(text).not.toContain(raw);
  }
});
