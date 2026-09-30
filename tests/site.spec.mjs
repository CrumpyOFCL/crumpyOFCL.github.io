import { test, expect } from './fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';

const slugs = ['a-course-in-time', 'sword-saint-broken-bridge', 'waking-nightmare', 'tabi'];
const noHorizontalScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('recruiter journey: first screen, case study, back to work', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const fold = async (locator) => (await locator.boundingBox()).y < 800;
  expect(await fold(page.locator('h1'))).toBe(true);
  expect(await fold(page.locator('.start__title a'))).toBe(true);
  expect(await fold(page.locator('.intro__contact a[href^="mailto:"]'))).toBe(true);
  expect(await fold(page.locator('.nav__resume'))).toBe(true);
  await page.locator('.start').getByRole('link', { name: /Read case study/ }).click();
  await expect(page).toHaveURL(/a-course-in-time\.html$/);
  await expect(page.locator('h1')).toHaveText('A Course In Time');
  await expect(page.locator('#team')).toContainText('Payton Saunders');
  await page.getByRole('link', { name: /Selected work/ }).click();
  await expect(page.locator('#work')).toBeInViewport();
});

test('every case study loads directly and after a refresh', async ({ page }) => {
  for (const slug of slugs) {
    await page.goto(`/${slug}.html`);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.reload();
    await expect(page.locator('.quick')).toBeVisible();
  }
});

test('old addresses redirect', async ({ page }) => {
  await page.goto('/phobiavr.html');
  await expect(page).toHaveURL(/waking-nightmare\.html$/);
  await page.goto('/opengl-desert.html');
  await expect(page).toHaveURL(/index\.html#about$/);
});

test('era inspector: keyboard route through all three switches', async ({ page }) => {
  await page.goto('/');
  const era = page.locator('#era');
  await era.getByRole('button', { name: 'Move right' }).focus();
  const press = async (key, times = 1) => { for (let i = 0; i < times; i++) await page.keyboard.press(key); };
  await press('ArrowRight', 3);
  await expect(page.locator('[data-era-status]')).toContainText('collapsed');
  await press('q');
  await expect(era).toHaveAttribute('data-era', 'past');
  await press('ArrowRight', 7);
  await expect(page.locator('[data-era-status]')).toContainText('wall');
  await press('q');
  await press('ArrowRight', 3);
  await expect(page.locator('[data-era-status]')).toContainText('Rubble');
  await press('q');
  await press('ArrowRight', 2);
  await expect(era).toHaveAttribute('data-state', 'won');
  await expect(page.locator('[data-era-status]')).toContainText('3 era switches');
});

test('era inspector: switching into a wall is a death, and reset works (tap controls)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const era = page.locator('#era');
  const tap = (name) => era.getByRole('button', { name }).click();
  await tap('Move right'); await tap('Move right');
  await tap(/Switch era/);
  for (let i = 0; i < 7; i++) await tap('Move right');
  await tap(/Switch era/);
  await tap('Move right');
  await tap(/Switch era/);
  await expect(era).toHaveAttribute('data-state', 'crushed');
  await expect(page.locator('[data-era-status]')).toContainText('crush check');
  await tap('Reset');
  await expect(era).toHaveAttribute('data-state', 'play');
  await expect(era).toHaveAttribute('data-era', 'present');
  const box = await era.getByRole('button', { name: 'Move left' }).boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('without JavaScript the inspector is a static diagram with the route in text', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('[data-era-controls]')).toBeHidden();
  await expect(page.locator('[data-era-status]')).toContainText('Route:');
  await expect(page.locator('.era__layer--both')).toBeVisible();
  await expect(page.locator('#work-sword-saint-broken-bridge .cover__frame img')).toBeVisible();
  await context.close();
});

test('reduced motion: no transitions, no scroll scenes, nothing hidden', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('[data-era-player]').evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThan(0.01);
  await expect(page.locator('html')).not.toHaveClass(/scenes-on/);
  await page.goto('/a-course-in-time.html');
  expect(await page.locator('.decision').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test('scroll scenes: covers arrive as their scene scrolls in', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/scenes-on/);
  const scene = page.locator('#work-sword-saint-broken-bridge');
  const before = Number(await scene.evaluate((el) => el.style.getPropertyValue('--p')));
  await scene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const after = Number(await scene.evaluate((el) => el.style.getPropertyValue('--p')));
  expect(before).toBeLessThan(after);
  expect(after).toBeGreaterThan(0.5);
});

test('case study: contents highlight follows the reader; cover names are unique', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/tabi.html');
  await page.locator('#screens').scrollIntoViewIfNeeded();
  await expect(page.locator('.toc a[href="#screens"]')).toHaveAttribute('aria-current', 'location');
  for (const path of ['/', '/tabi.html']) {
    await page.goto(path);
    const names = await page.locator('[style*="view-transition-name"]').evaluateAll((els) => els.map((e) => e.style.viewTransitionName));
    expect(new Set(names).size).toBe(names.length);
  }
});

test('layouts hold from 320px to 1920px', async ({ page }) => {
  for (const width of [320, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of ['', ...slugs]) {
      await page.goto(slug ? `/${slug}.html` : '/');
      expect(await noHorizontalScroll(page), `${slug || 'home'} at ${width}px`).toBe(true);
    }
  }
});

for (const scheme of ['light', 'dark']) {
  for (const width of [390, 1280]) {
    test(`axe: no WCAG A/AA violations (${scheme}, ${width}px)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      for (const slug of ['', ...slugs, '404']) {
        await page.goto(slug ? `/${slug}.html` : '/');
        const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(scan.violations.map((v) => `${slug || 'home'}: ${v.id} ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
      }
    });
  }
}
