import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    headless: true,
    // Set PW_CHROMIUM to use a preinstalled Chromium instead of Playwright's download.
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'python3 -m http.server 4321',
    port: 4321,
    reuseExistingServer: true,
    timeout: 15000,
  },
});
