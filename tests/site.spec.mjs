import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

const pages = [
  ['home', '/'],
  ['acit', '/projects/a-course-in-time/index.html'],
  ['waking-nightmare', '/projects/waking-nightmare/index.html'],
  ['japan', '/projects/japan-trip-planner/index.html'],
  ['sdcs', '/projects/sdcs-booking-app/index.html'],
  ['lit-flux', '/projects/lit-flux-mechanics-showcase/index.html'],
  ['gdt2', '/projects/gdt2/index.html'],
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

test('home era switch re-themes, persists, and is keyboard operable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Tyler Crump');
  await expect(page.locator('#glance-title')).toHaveText('At a glance');
  const past = page.locator('[data-set-era="past"]').first();
  const present = page.locator('[data-set-era="present"]').first();
  await past.click();
  await expect(page.locator('html')).toHaveAttribute('data-era', 'past');
  await expect(past).toHaveAttribute('aria-pressed', 'true');
  await expect(present).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-era', 'past');
  await past.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('html')).toHaveAttribute('data-era', 'present');
  await page.keyboard.press('End');
  await expect(page.locator('html')).toHaveAttribute('data-era', 'future');
  await page.evaluate(() => localStorage.removeItem('era'));
});

test('case study lens, all, and table of contents', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html');
  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#decisions')).toBeHidden();
  await page.locator('[data-set-era="past"]').click();
  await expect(page.locator('#decisions')).toBeVisible();
  await expect(page.locator('#overview')).toBeHidden();
  await expect(page.locator('[data-lens-status]')).toContainText('how it was made');
  await page.locator('[data-set-era="all"]').click();
  await expect(page.locator('#overview')).toBeVisible();
  await expect(page.locator('#decisions')).toBeVisible();
  await expect(page.locator('#gaps')).toBeVisible();
  await page.locator('[data-set-era="present"]').click();
  await page.locator('a[href="#level"]').click();
  await expect(page.locator('#level')).toBeVisible();
  await expect(page.locator('#overview')).toBeHidden();
  await expect(page.locator('a[href="#level"]')).toHaveAttribute('aria-current', 'true');
});

test('direct hash opens the matching lens', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html#reflection');
  await expect(page.locator('#reflection')).toBeVisible();
  await expect(page.locator('#overview')).toBeHidden();
});

test('filters, skill filter, reset and empty state', async ({ page }) => {
  await page.goto('/#work');
  const status = page.locator('[data-filter-status]');
  await expect(status).toContainText('Showing all 6 projects');
  await page.locator('input[name="discipline"][value="UX"]').check();
  await expect(status).toContainText('Showing 2 of 6');
  await expect(page.locator('[data-project="a-course-in-time"]')).toBeHidden();
  await expect(page.locator('[data-project="japan-trip-planner"]')).toBeVisible();
  await page.locator('select[data-filter="engine"]').selectOption('React Native');
  await expect(status).toContainText('Showing 1 of 6');
  await expect(page.locator('[data-project="sdcs-booking-app"]')).toBeVisible();
  await page.locator('[data-filters]').getByRole('button', { name: 'Clear filters' }).click();
  await expect(status).toContainText('Showing all 6 projects');
  await page.locator('[data-skill="Unity 2019"]').click();
  await expect(page.locator('[data-skill-chip]')).toContainText('Unity 2019');
  await expect(page.locator('[data-project="waking-nightmare"]')).toBeVisible();
  await expect(page.locator('[data-project="a-course-in-time"]')).toBeHidden();
  await page.locator('[data-skill-chip] button').click();
  await expect(status).toContainText('Showing all 6 projects');
  await page.locator('select[data-filter="type"]').selectOption('Client project');
  await page.locator('select[data-filter="year"]').selectOption('2025');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.locator('[data-clear]').click();
  await expect(page.locator('[data-empty]')).toBeHidden();
});

test('iteration tabs, compare slider and era diagram', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html');
  await page.locator('[data-set-era="past"]').click();
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
  await page.locator('[data-set-era="present"]').click();
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
  await expect(doc).toContainText('Evidence pending');
});

test('keyboard path reaches work, a case study and contact without a mouse', async ({ page }) => {
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

test('reduced motion removes transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/a-course-in-time/index.html');
  const duration = await page.locator('.dg__cell--wall').first().evaluate(el => getComputedStyle(el).transitionDuration);
  expect(duration === '0s' || duration === '0ms').toBeTruthy();
  const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(behavior).toBe('auto');
});

for (const [name, path] of pages) {
  for (const era of ['past', 'present', 'future']) {
    test(`axe ${name} ${era}`, async ({ page }) => {
      await page.goto(path);
      if (name !== 'home') {
        await page.locator(`[data-set-era="${era}"]`).click();
      } else {
        await page.locator(`[data-set-era="${era}"]`).first().click();
      }
      await axe(page);
    });
  }
}

test('axe case study All lens', async ({ page }) => {
  await page.goto('/projects/a-course-in-time/index.html');
  await page.locator('[data-set-era="all"]').click();
  await axe(page);
});

test('screenshots at review widths', async ({ page }) => {
  test.setTimeout(180000);
  const widths = [375, 768, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('era'));
    await page.reload();
    await page.screenshot({ path: `docs/screenshots/home-${width}.png`, fullPage: width === 375 || width === 1440 });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.hero').screenshot({ path: 'docs/screenshots/desktop-hero-1440.png' });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/projects/a-course-in-time/index.html');
  await page.screenshot({ path: 'docs/screenshots/acit-present-1280.png', fullPage: true });
  await page.locator('[data-set-era="past"]').click();
  await page.screenshot({ path: 'docs/screenshots/acit-past-1280.png', fullPage: true });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.screenshot({ path: 'docs/screenshots/mobile-home-375.png', fullPage: true });
  await page.goto('/projects/a-course-in-time/index.html');
  await page.screenshot({ path: 'docs/screenshots/mobile-case-375.png', fullPage: true });
  await page.goto('/projects/japan-trip-planner/index.html');
  await page.screenshot({ path: 'docs/screenshots/travel-app-375.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'docs/screenshots/travel-app-1280.png', fullPage: true });

  for (const concept of ['era-lens', 'evidence-ledger', 'design-constellation', 'hotel-map', 'workbench']) {
    await page.setViewportSize({ width: 1100, height: 760 });
    await page.goto(`/prototypes/${concept}.html`);
    await page.screenshot({ path: `prototypes/${concept}.png`, fullPage: true });
  }
});
