import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const problems = [];
    page.on('pageerror', (error) => problems.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
    });
    const checkImages = async () => {
      const broken = await page.evaluate(() => [...document.images].filter((img) => {
        const panel = img.closest('.panel');
        if (panel && getComputedStyle(panel).display === 'none') return false;
        return img.complete && img.naturalWidth === 0;
      }).map((img) => img.currentSrc || img.src));
      for (const src of broken) problems.push(`image not loaded ${src}`);
    };
    const goto = page.goto.bind(page);
    page.goto = async (...args) => {
      const result = await goto(...args);
      await checkImages();
      return result;
    };
    await use(page);
    await checkImages();
    if (problems.length) throw new Error(problems.join('\n'));
  },
});

export { expect };
