import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

const pages = [
  ['home', '/'],
  ['acit', '/projects/a-course-in-time/index.html'],
  ['waking-nightmare', '/projects/waking-nightmare/index.html'],
  ['tabi', '/projects/tabi/index.html'],
  ['sdcs', '/projects/sdcs-booking-app/index.html'],
  ['lit-flux', '/projects/lit-flux-mechanics-showcase/index.html'],
  ['gdt2', '/projects/gdt2/index.html'],
  ['ikemen', '/projects/sword-saint-broken-bridge/index.html'],
];

async function axe(page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const brief = result.violations.map(v => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n');
  expect(brief, brief).toBe('');
}

test.beforeAll(() => {
  mkdirSync('docs/screenshots', { recursive: true });
  mkdirSync('prototypes', { recursive: true });
});

test('title screen shows, then yields to the map', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  await expect(page.locator('.pixel-logo')).toHaveAttribute('aria-label', 'Tyler Crump');
  await expect(page.locator('.title-screen__sub')).toHaveText('Game designer · gameplay and tools');
  await expect(page.locator('.press-start')).toHaveText('PRESS START');
  await expect(page.locator('.title-hotel')).toBeVisible();
  await expect(page.locator('.recruiter-skip')).toHaveText('Recruiter view: projects and contact');
  await page.clock.fastForward(3000);
  await expect(page.locator('#title-screen')).toBeHidden();
  await expect(page.locator('#map')).toBeVisible();
  await expect(page.locator('#node-a-course-in-time')).toBeVisible();
});

test('any key or click skips the title into the hub', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.keyboard.press('KeyK');
  await expect(page.locator('#title-screen')).toBeHidden();
  await page.goto('/');
  await page.locator('#title-screen').click();
  await expect(page.locator('#title-screen')).toBeHidden();
  await expect(page.locator('.overworld')).toBeVisible();
});

test('skip to CV opens the list and the save file without waiting', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('.recruiter-skip').click();
  await expect(page.locator('#title-screen')).toBeHidden();
  await expect(page.locator('#work')).toBeVisible();
  await expect(page.locator('#save')).toBeInViewport();
  await expect(page.locator('#glance-title')).toHaveText('At a glance');
  await expect(page.locator('#save')).toContainText('Game designer · gameplay and tools');
});

test('keyboard walks the path and opens a character card', async ({ page }) => {
  await page.goto('/#map');
  const castle = page.locator('#node-a-course-in-time');
  const waking = page.locator('#node-waking-nightmare');
  await castle.focus();
  await page.keyboard.press('ArrowDown');
  await expect(waking).toBeFocused();
  await page.keyboard.press('KeyW');
  await expect(castle).toBeFocused();
  await page.keyboard.press('KeyS');
  await expect(waking).toBeFocused();
  await page.keyboard.press('Enter');
  const card = page.locator('#card-waking-nightmare');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Team of 5');
  await expect(card).toContainText('LOCKED');
  await expect(card).toContainText('evidence coming');
  await expect(card).toContainText('Stage');
  await expect(card).toContainText('Timeframe');
  await expect(card.locator('.stat__fill')).toHaveCount(0);
  await card.getByRole('link', { name: /START LEVEL/ }).click();
  await expect(page).toHaveURL(/waking-nightmare/);
});

test('masthead List link opens the list', async ({ page }) => {
  await page.goto('/#map');
  await page.locator('a[href="#work"]').first().click();
  await expect(page.locator('#work')).toBeVisible();
  await expect(page.locator('#work-title')).toBeFocused();
  for (const slug of ['a-course-in-time', 'waking-nightmare', 'tabi', 'sword-saint-broken-bridge', 'sdcs-booking-app', 'lit-flux-mechanics-showcase', 'gdt2']) {
    await expect(page.locator(`#work a[href*="${slug}"]`).first()).toBeVisible();
  }
});

test('list view reaches every level, including a locked experiment card', async ({ page }) => {
  await page.goto('/#map');
  await page.locator('[data-list-toggle]').click();
  await expect(page.locator('#work')).toBeVisible();
  for (const slug of ['a-course-in-time', 'waking-nightmare', 'tabi', 'sword-saint-broken-bridge', 'sdcs-booking-app', 'lit-flux-mechanics-showcase', 'gdt2']) {
    await expect(page.locator(`#work a[href*="${slug}"]`).first()).toBeVisible();
  }
  await page.locator('#node-gdt2').click();
  const card = page.locator('#card-gdt2');
  await expect(card).toBeVisible();
  await expect(card.getByText('Role', { exact: true })).toBeVisible();
  await expect(card).toContainText('LOCKED');
  await expect(card).toContainText('evidence coming');
  await expect(card.locator('.stat__fill')).toHaveCount(0);
});

test('flagship card uses confirmed facts and not a score', async ({ page }) => {
  await page.goto('/#map');
  await page.locator('#node-a-course-in-time').click();
  const card = page.locator('#card-a-course-in-time');
  await expect(card).toContainText('Team lead — mainly audio, coding and level design');
  await expect(card).toContainText('Team of 5');
  await expect(card).toContainText('Unity 6');
  await expect(card).toContainText('Switch time');
  await expect(card).toContainText('In development (playable build on itch.io)');
  await expect(card).toContainText('LOCKED · dates coming');
  await expect(card.locator('.stat__fill')).toHaveCount(0);
  await expect(card).not.toContainText('%');
});

test('case study keeps every section, with checkpoints and a way back to the map', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html');
  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#decisions')).toBeVisible();
  await expect(page.locator('#role')).toBeVisible();
  await expect(page.locator('#still')).toBeVisible();
  await expect(page.locator('.cs-section__cp').first()).toContainText('Checkpoint');
  await page.locator('a[href="#what"]').click();
  await expect(page.locator('a[href="#what"]')).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('link', { name: '← Back to map' })).toHaveAttribute('href', /#map$/);
});

test('ikemen go page states the confirmed work and leaves the rest pending', async ({ page }) => {
  await page.goto('/projects/sword-saint-broken-bridge/index.html');
  await expect(page.locator('h1')).toHaveText('Sword Saint: Broken Bridge');
  await expect(page.locator('.lede')).toContainText('built in Ikemen GO');
  await expect(page.locator('.cs-head__sub')).toHaveText('Designed by Tyler Crump');
  await expect(page.locator('.cs-head__tier')).toContainText('Supporting');
  await expect(page.locator('.lede')).toContainText('solo design project');
  await expect(page.locator('.lede')).toContainText('open-source fighting game engine');
  await expect(page.locator('#role')).toContainText('mirror fighter');
  await expect(page.locator('#what')).toContainText('lightning special');
  await expect(page.locator('#what')).toContainText('timed perfect block');
  await expect(page.locator('#what')).toContainText('stamina');
  await expect(page.locator('#overview')).toContainText('Solo');
  await expect(page.locator('#overview')).toContainText('Fighter Factory Studio (sprites and animation)');
  await expect(page.locator('#overview')).toContainText('Notepad++ (editing character and stage files)');
  await expect(page.locator('#media .media-frame--sheet')).toHaveCount(1);
  await expect(page.locator('#media .media-frame--gif')).toHaveCount(2);
  await expect(page.locator('#media .media-frame--stage')).toHaveCount(1);
  await expect(page.locator('#media .media-frame--clip')).toHaveCount(1);
  await expect(page.locator('#media')).toContainText('Coming soon');
  await expect(page.locator('#level')).toBeVisible();
  await expect(page.locator('#level')).toContainText('Broken Bridge');
  await expect(page.locator('#level')).toContainText('animated lightning and rain');
  await expect(page.locator('main')).not.toContainText('Aseprite');
  await expect(page.locator('main')).not.toContainText('hand-animated');
  await expect(page.locator('main')).not.toContainText(/\bAI\b/);
});

test('direct hash keeps the rest of the level on the page', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html#reflection');
  await expect(page.locator('#reflection')).toBeVisible();
  await expect(page.locator('#overview')).toBeVisible();
});

test('filters, skill filter, reset and empty state', async ({ page }) => {
  await page.goto('/#work');
  const status = page.locator('[data-filter-status]');
  await expect(status).toContainText('Showing all 7 projects');
  await page.locator('input[name="discipline"][value="UX"]').check();
  await expect(status).toContainText('Showing 2 of 7');
  await expect(page.locator('[data-project="a-course-in-time"]')).toBeHidden();
  await expect(page.locator('[data-project="tabi"]')).toBeVisible();
  await page.locator('select[data-filter="engine"]').selectOption('React Native');
  await expect(status).toContainText('Showing 1 of 7');
  await expect(page.locator('[data-project="sdcs-booking-app"]')).toBeVisible();
  await page.locator('[data-filters]').getByRole('button', { name: 'Clear filters' }).click();
  await expect(status).toContainText('Showing all 7 projects');
  await page.locator('[data-skill="Unity 2019"]').click();
  await expect(page.locator('[data-skill-chip]')).toContainText('Unity 2019');
  await expect(page.locator('[data-project="waking-nightmare"]')).toBeVisible();
  await expect(page.locator('[data-project="a-course-in-time"]')).toBeHidden();
  await page.locator('[data-skill-chip] button').click();
  await expect(status).toContainText('Showing all 7 projects');
  await page.locator('select[data-filter="type"]').selectOption('Client project');
  await page.locator('select[data-filter="year"]').selectOption('2025');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.locator('[data-clear]').click();
  await expect(page.locator('[data-empty]')).toBeHidden();
});

test('iteration tabs, compare slider and era diagram', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html');
  await page.locator('#still-title').click();
  const tabs = page.locator('#iterations [role="tab"]');
  await expect(tabs).toHaveCount(4);
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#a-course-in-time-panel-1')).toBeVisible();
  await expect(page.locator('#a-course-in-time-panel-0')).toBeHidden();
  await page.keyboard.press('End');
  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await tabs.nth(1).click();
  const range = page.locator('#a-course-in-time-cmp-1');
  await range.focus();
  await range.press('ArrowRight');
  const value = await range.inputValue();
  expect(Number(value)).toBeGreaterThan(50);
  await expect(page.locator('[data-dg-desc]')).toContainText('Past:');
  await page.locator('[data-dg="present"]').click();
  await expect(page.locator('[data-dg-desc]')).toContainText('Present:');
  await page.locator('[data-dg="present"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-dg="past"]')).toHaveAttribute('aria-pressed', 'true');
});

test('disclosures open from the keyboard', async ({ page }) => {
  await page.goto('/#docs');
  const doc = page.locator('#docs details').first();
  await expect(doc).not.toHaveAttribute('open', '');
  await doc.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(doc).toHaveAttribute('open', '');
  await expect(doc).toContainText('Coming soon');
});

test('keyboard path reaches a case study and contact without a mouse', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.getByRole('link', { name: 'Read the flagship case study' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/a-course-in-time/);
  await expect(page.locator('h1')).toContainText('A Course In Time');
  await page.locator('a[href$="index.html#contact"]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#contact')).toBeInViewport();
});

test('reduced motion shows a static title, then the map, with no blink or walk', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
  const blink = await page.locator('.press-start').evaluate(el => getComputedStyle(el).animationName);
  expect(blink === 'none').toBeTruthy();
  await page.clock.fastForward(3000);
  await expect(page.locator('#title-screen')).toBeHidden();
  await expect(page.locator('#map')).toBeVisible();
  const avatar = await page.locator('.avatar').evaluate(el => getComputedStyle(el).animationName);
  expect(avatar === 'none').toBeTruthy();
  const duration = await page.goto('/projects/a-course-in-time/index.html').then(() => page.locator('.dg__cell--wall').first().evaluate(el => getComputedStyle(el).transitionDuration));
  expect(duration === '0s' || duration === '0ms').toBeTruthy();
  const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(behavior).toBe('auto');
});

test('older era mark does not recolour the page', async ({ page }) => {
  await page.goto('/#map');
  await page.locator('[data-egg]').click();
  await expect(page.locator('#egg-note')).toContainText('1743 / Today / 2311');
  await expect(page.locator('html')).not.toHaveAttribute('data-era', /.+/);
});

for (const [name, path] of pages) {
  test(`axe ${name}`, async ({ page }) => {
    await page.goto(path === '/' ? '/#map' : path);
    if (path === '/') await page.locator('.press-start').evaluate(el => { el.style.animation = 'none'; }).catch(() => {});
    await axe(page);
  });
}

test('axe title screen', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('.press-start').evaluate(el => { el.style.animation = 'none'; });
  await axe(page);
});

test('axe character card and reduced-motion home', async ({ page }) => {
  await page.goto('/#map');
  await page.locator('#node-a-course-in-time').click();
  await axe(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await axe(page);
});

test('screenshots at review widths', async ({ page }) => {
  test.setTimeout(300000);
  await page.clock.install();
  const widths = [375, 700, 768, 800, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await page.goto('/');
    await page.evaluate((ms) => {
      for (const anim of document.getAnimations()) { anim.pause(); anim.currentTime = ms; }
    }, 1300);
    await page.screenshot({ path: `docs/screenshots/title-mid-${width}.png` });
    await page.evaluate((ms) => {
      for (const anim of document.getAnimations()) { anim.currentTime = ms; }
    }, 2600);
    await page.locator('.press-start').evaluate(el => { el.style.animation = 'none'; el.style.opacity = '1'; });
    await page.screenshot({ path: `docs/screenshots/title-final-${width}.png` });
    await page.screenshot({ path: `docs/screenshots/title-${width}.png` });
    await page.keyboard.press('KeyK');
    await expect(page.locator('#title-screen')).toBeHidden();
    await page.screenshot({ path: `docs/screenshots/hub-${width}.png`, fullPage: width === 375 || width === 1440 });
    await page.screenshot({ path: `docs/screenshots/home-${width}.png`, fullPage: width === 375 || width === 1440 });
    await page.locator('#node-a-course-in-time').click();
    await page.screenshot({ path: `docs/screenshots/card-${width}.png` });
    await page.keyboard.press('Escape');
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#save');
  await page.locator('#save').screenshot({ path: 'docs/screenshots/desktop-hero-1440.png' });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#map');
  await page.locator('#node-a-course-in-time').click();
  await page.screenshot({ path: 'docs/screenshots/character-card-1280.png' });
  await page.keyboard.press('Escape');

  await page.goto('/projects/a-course-in-time/index.html');
  await page.screenshot({ path: 'docs/screenshots/acit-present-1280.png', fullPage: true });
  await page.screenshot({ path: 'docs/screenshots/acit-past-1280.png', fullPage: true });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#map');
  await page.screenshot({ path: 'docs/screenshots/mobile-home-375.png', fullPage: true });
  await page.goto('/projects/a-course-in-time/index.html');
  await page.screenshot({ path: 'docs/screenshots/mobile-case-375.png', fullPage: true });
  await page.goto('/projects/tabi/index.html');
  await page.screenshot({ path: 'docs/screenshots/travel-app-375.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'docs/screenshots/travel-app-1280.png', fullPage: true });
  await page.goto('/projects/sword-saint-broken-bridge/index.html');
  await page.screenshot({ path: 'docs/screenshots/ikemen-present-1280.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'docs/screenshots/ikemen-375.png', fullPage: true });

  for (const concept of ['era-lens', 'evidence-ledger', 'design-constellation', 'hotel-map', 'workbench']) {
    await page.setViewportSize({ width: 1100, height: 760 });
    await page.goto(`/prototypes/${concept}.html`);
    await page.screenshot({ path: `prototypes/${concept}.png`, fullPage: true });
  }
});
