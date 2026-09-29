import { test, expect } from './fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';
const slugs=['a-course-in-time','phobiavr','opengl-desert','tabi','sword-saint-broken-bridge'];
test('Recruiter journey and system view',async({page})=>{
 await page.goto('/');
 await expect(page.locator('h1')).toContainText('Game developer.');
 await page.getByRole('link',{name:'View case study'}).click();
 await expect(page).toHaveURL(/a-course-in-time.html/);
 await expect(page.locator('#contribution')).toContainText('moving-platform');
 const toggle=page.locator('[data-system-toggle]');
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await page.getByRole('link',{name:'All projects'}).click();
 await expect(page.locator('#tabi')).toBeVisible();
});
test('Responsive home at required widths',async({page})=>{
 for(const width of [1920,1440,1366,1024,768,430,390]){
  await page.setViewportSize({width,height:900});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
for(const width of [390,1280]) test(`Accessible pages at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const slug of ['',...slugs]){
  await page.goto(slug?`/${slug}.html`:'/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
 }
});
test('Project stage supports keyboard and reduced motion', async ({page}) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const scene=page.locator('.project-stage');
 await expect(scene.getByRole('button',{name:'Enable motion'})).toBeVisible();
 const sword=scene.getByRole('button',{name:/Sword Saint/});
 await sword.focus(); await page.keyboard.press('Enter');
 await expect(sword).toHaveAttribute('aria-pressed','true');
 await expect(scene.locator('[data-stage-link]')).toHaveAttribute('href','sword-saint-broken-bridge.html');
 await scene.locator('[data-stage-link]').click();
 await expect(page.locator('h1')).toContainText('Sword Saint');
 await expect(page.locator('.media-gallery img')).toHaveCount(2);
});
