import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const widths = [375, 768, 1280];
const routes = [
  ['about', '/#about', 'About me', '#about'],
  ['acit', '/#acit', 'A Course In Time', '#acit'],
  ['sword-saint', '/#sword-saint', 'Sword Saint: Broken Bridge', '#sword-saint'],
  ['tabi', '/#tabi', 'Tabi', '#tabi'],
  ['more', '/#more', 'More', '#more'],
];

async function axe(page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const brief = result.violations.map(v => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n');
  expect(brief, brief).toBe('');
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});

test('About is the default landing page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('#about-title')).toHaveText('About me');
  await expect(page.locator('.appbar-title')).toHaveText('Tyler Crump');
  await expect(page.locator('.appbar-sub')).toHaveText('Game designer · gameplay and tools');
  await expect(page.locator('#tab-about')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#acit')).toBeHidden();
  await expect(page.locator('.tab-switch, .tabbar-add, #title-screen, .recruiter-skip')).toHaveCount(0);
});

test('each tab opens its page and the back button returns', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/');
  const order = [
    ['#tab-acit', '#acit', 'A Course In Time'],
    ['#tab-sword-saint', '#sword-saint', 'Sword Saint: Broken Bridge'],
    ['#tab-tabi', '#tabi', 'Tabi'],
    ['#tab-more', '#more', 'More'],
    ['#tab-about', '#about', 'About me'],
  ];
  for (const [tab, panel, title] of order) {
    await page.locator(tab).click();
    await expect(page.locator(panel)).toBeVisible();
    await expect(page.locator(`${panel} .page-title`)).toHaveText(title);
    await expect(page.locator(tab)).toHaveAttribute('aria-current', 'page');
  }
  await page.goBack();
  await expect(page.locator('#more')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#tabi')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#sword-saint')).toBeVisible();
});

test('hash routes open the right panel, including a More card', async ({ page }) => {
  await page.goto('/#sword-saint');
  await expect(page.locator('#sword-saint-title')).toHaveText('Sword Saint: Broken Bridge');
  await expect(page.locator('#tab-sword-saint')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#sword-saint')).toContainText('Designed by Tyler Crump');
  await expect(page.locator('#sword-saint')).toContainText('built in Ikemen GO');

  await page.goto('/#waking-nightmare');
  await expect(page.locator('#more')).toBeVisible();
  await expect(page.locator('#waking-nightmare')).toHaveAttribute('open', '');
  await expect(page.locator('#tab-more')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#waking-nightmare')).toContainText('Client handover');
});

test('arrow keys move between tabs', async ({ page }) => {
  await page.goto('/#about');
  await page.locator('#tab-about').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-acit')).toBeFocused();
  await expect(page.locator('#acit')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.locator('#tab-more')).toBeFocused();
  await expect(page.locator('#more')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.locator('#about')).toBeVisible();
});

test('More cards expand in place', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#more');
  const titles = page.locator('#more .work-title');
  await expect(titles).toHaveText([
    'Waking Nightmare Experience',
    'SDCS Booking App',
    'LIT_Flux Mechanics Showcase',
    'GDT2',
  ]);
  await page.locator('#sdcs-booking-app > summary').click();
  await expect(page.locator('#sdcs-booking-app')).toHaveAttribute('open', '');
  await expect(page.locator('#sdcs-booking-app a[href="https://github.com/CrumpyOFCL/Comp2750-Assignment"]')).toBeVisible();
});

test('the TC button opens and closes the contact sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const btn = page.locator('#account-btn');
  await btn.click();
  const sheet = page.locator('#contact-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText('tylercrump@outlook.com.au');
  await expect(sheet.getByRole('link', { name: /tylercrump@outlook.com.au/ })).toHaveAttribute('href', 'mailto:tylercrump@outlook.com.au');
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
});

for (const [name, url] of routes) {
  test(`axe on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url);
    await axe(page);
  });
}

test('axe on the contact sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.locator('#account-btn').click();
  await expect(page.locator('#contact-sheet')).toBeVisible();
  await axe(page);
});

for (const width of widths) {
  for (const [name, url] of routes) {
    test(`screenshot shell-${name}-${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.goto(url === '/#about' ? '/' : url);
      await expect(page.locator(`#${name === 'about' ? 'about' : name} .page-title`)).toBeVisible();
      await page.screenshot({ path: `docs/screenshots/shell-${name}-${width}.png` });
    });
  }
  test(`screenshot shell-contact-${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await page.goto('/');
    await page.locator('#account-btn').click();
    await expect(page.locator('#contact-sheet')).toBeVisible();
    await page.screenshot({ path: `docs/screenshots/shell-contact-${width}.png` });
  });
}
