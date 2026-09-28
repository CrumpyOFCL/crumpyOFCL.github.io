import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  const brief = result.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n');
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
  await expect(page.locator('#tab-acit')).toHaveAttribute('aria-label', 'A Course In Time');
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
    await expect(page.locator(`${panel} .page-title`).first()).toHaveText(title);
    await expect(page).toHaveURL(new RegExp(`${panel}$`));
  }
  await page.goBack();
  await expect(page.locator('#more')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#tabi')).toBeVisible();
});

test('keyboard moves between tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#about');
  await page.locator('#tab-about').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#acit$/);
  await expect(page.locator('#tab-acit')).toBeFocused();
  await expect(page.locator('#acit')).toBeVisible();
});

test('contact sheet traps focus and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#about');
  await page.locator('#account-btn').click();
  const sheet = page.locator('#contact-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('a[href^="mailto:"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(page.locator('#account-btn')).toBeFocused();
});

test('More play controls sit outside the summary', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#more');
  await expect(page.locator('a.play-pill')).toHaveCount(2);
  await expect(page.locator('#lit-flux-mechanics-showcase summary a')).toHaveCount(0);
  await expect(page.locator('#gdt2 summary a')).toHaveCount(0);
  await expect(page.locator('#lit-flux-mechanics-showcase .details-hint')).toHaveText('Details');
});

test('era diagram toggle changes the stage', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#acit');
  const stage = page.locator('#acit [data-stage]');
  await expect(stage).toHaveAttribute('data-stage', 'past');
  await page.locator('#acit [data-era="present"]').click();
  await expect(stage).toHaveAttribute('data-stage', 'present');
  await expect(page.locator('#acit [data-era="present"]')).toHaveAttribute('aria-pressed', 'true');
});

for (const [name, path] of routes) {
  test(`axe ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path);
    await axe(page);
  });
}

test('axe contact sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#about');
  await page.locator('#account-btn').click();
  await axe(page);
});

test('axe dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const [, path] of routes) {
    await page.goto(path);
    await axe(page);
  }
});

test('project tabs keep chips and media inside the first screen', async ({ page }) => {
  const checks = [
    [375, 812, 540],
    [1280, 800, 670],
  ];
  for (const [width, height, limit] of checks) {
    await page.setViewportSize({ width, height });
    for (const hash of ['#acit', '#sword-saint', '#tabi']) {
      await page.goto(`/${hash}`);
      for (const selector of [`${hash} .fact-chips`, `${hash} .proj-hero`]) {
        const box = await page.locator(selector).boundingBox();
        expect(box, selector).toBeTruthy();
        expect(box.y + box.height, `${hash} ${selector} at ${width}`).toBeLessThanOrEqual(limit);
      }
    }
  }
});

test('first-screen screenshots', async ({ page }) => {
  const shots = [
    ...routes.map(([name, path]) => [name, path, false]),
    ['contact', '/#about', true],
  ];
  for (const width of [375, 768, 1280]) {
    const height = width === 375 ? 812 : width === 768 ? 1024 : 800;
    await page.setViewportSize({ width, height });
    for (const [name, path, sheet] of shots) {
      await page.goto(path);
      if (sheet) await page.locator('#account-btn').click();
      await page.screenshot({
        path: `docs/screenshots/shell-${name}-${width}.png`,
        fullPage: false,
      });
      if (sheet) await page.keyboard.press('Escape');
    }
  }
});
