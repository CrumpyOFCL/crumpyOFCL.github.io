import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures.mjs';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('recruiter path has work, proof and contact', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('I design the rules');
  await expect(page.locator('#acit')).toBeVisible();
  await expect(page.locator('#sword-saint')).toBeVisible();
  await expect(page.locator('#tabi')).toBeVisible();
  await expect(page.locator('#other-work .archive-row')).toHaveCount(4);
  await expect(page.locator('a[href="mailto:tylercrump@outlook.com.au"]')).not.toHaveCount(0);
  await page.getByRole('link', { name: /Read case study/ }).click();
  await expect(page).toHaveURL(/#acit-case$/);
});

test('mobile menu and case details work without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: /Menu/ });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'More projects' }).click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#other-work$/);
  await page.locator('#tabi summary').click();
  await expect(page.locator('#tabi details')).toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const width of [390, 1280]) {
  test(`accessible content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`).join('\n')).toBe('');
  });
}
