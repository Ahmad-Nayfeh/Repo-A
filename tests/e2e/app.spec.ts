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
  await page.getByRole('tab', { name: 'Evidence' }).click();
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
  await expect(page.locator('.goal b')).toBeVisible();
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
  await expect(page.locator('.goal b')).toBeVisible();
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => (document.activeElement as Element | null)?.classList?.contains('rmu') ?? false);
  }
  expect(reached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /^RMU / })).toBeVisible();
  // feeder breakers are their own focusable map elements
  await expect(page.locator('[data-id="sw:R1-CBA"]')).toHaveAttribute('role', 'button');
});

test('log shows translated entries, never raw engine values (G re-verification regression)', async ({ browser }) => {
  for (const lang of ['en', 'ar'] as const) {
    const page = await browser.newPage();
    await page.addInitScript((l) => localStorage.setItem('gs.lang', l), lang);
    await page.goto('/#/play?v=1&s=777&d=easy');
    await page.waitForFunction(() => !!(window as any).__gs?.session());
    await page.evaluate(() => { const g = (window as any).__gs; const s = g.session(); for (const a of g.botActions(777, 'easy').slice(1)) s.apply(a); });
    await page.locator('.results .btns button').nth(2).click(); // back to the network (share, watch, network, menu)
    await page.locator('.tabs2 button').nth(2).click();         // Log tab
    const text = await page.locator('.log').innerText();
    expect(text.length).toBeGreaterThan(50);
    for (const raw of [' true', ' false', 'proveDead', 'readFpi', 'attendDamage', ' close\n', ' open\n']) expect(text).not.toContain(raw);
    await page.close();
  }
});

test('Grading: renders the TCC chart; the reference grading loaded via link passes every rule (★★★)', async ({ page }) => {
  const { generateGrading, referenceGrading } = await import('../../src/engine/grading');
  const g = generateGrading(5);
  const par = referenceGrading(g)!.settings;
  const enc = (['T', 'F', 'I'] as const).map((k) => { const r = par[k]; return [r.curve.replace('IEC_', ''), r.pickupA, r.tms, r.hsA ?? '', r.hsDelayS ?? ''].join(','); }).join(';');
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto(`/#/grading?s=5&r=${encodeURIComponent(enc)}`);
  await expect(page.locator('svg.tcc')).toBeVisible();
  await expect(page.getByText(/All rules pass/)).toBeVisible();
  await expect(page.locator('.starline')).toHaveText('★★★');
});

test('lesson 1: following the highlighted step restores every home (AR), no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'ar'));
  await page.goto('/#/');
  await page.locator('button.big').click();
  await expect(page.locator('.guide')).toBeVisible();
  for (let i = 0; i < 10 && !(await page.locator('.guide.win').count()); i++) {
    const spot = page.locator('button.spot').first();
    if (await spot.count()) await spot.click(); else await page.locator('.guide button.primary').click();
    await page.waitForTimeout(400); // let the next step render its spotlight
  }
  await expect(page.locator('.guide.win')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__gs.session().sim.customersOff())).toBe(0);
  expect(errors).toEqual([]);
});

test('lesson 1: an off-step action is explained, not executed', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto('/#/tutorial');
  await page.locator('.guide button.primary').click(); // continue past the intro
  await page.locator('[data-id="R1-4"]').click();
  await page.getByRole('button', { name: /Close · remote/ }).first().click();
  await expect(page.locator('.toast2.info')).toContainText('Not yet');
  expect(await page.evaluate(() => (window as any).__gs.session().actions.length)).toBe(1);
});

test('hints: three tiers then the solution player; taking over continues the game', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto('/#/play?v=1&s=4242&d=normal');
  await page.locator('.hint-btn').click();
  await expect(page.locator('.guide.hint')).toContainText('where to look');
  await page.getByRole('button', { name: 'Explain why' }).click();
  await page.getByRole('button', { name: 'Show the exact step' }).click();
  await expect(page.locator('.guide-exact')).toBeVisible();
  await expect(page.locator('button.spot')).toHaveCount(1);
  await page.getByRole('button', { name: /Watch the solution/ }).click();
  await expect(page.getByRole('dialog', { name: 'Watch the solution' })).toBeVisible();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: /Take over from here/ }).click();
  await expect(page.locator('.goal b')).toBeVisible();
  const help = await page.evaluate(() => (window as any).__gs.session().help);
  expect(help.demo).toBe(true);
});

test('lesson 1 → next lesson opens lesson 2 without the lesson 1 guide (regression)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gs.lang', 'en'));
  await page.goto('/#/tutorial');
  await expect(page.locator('.guide')).toContainText('Lesson 1');
  await page.evaluate(() => { location.hash = '#/training?t=0'; });
  await expect(page.locator('.hint-btn')).toBeVisible();
  await expect(page.locator('.guide')).toHaveCount(0);
});
