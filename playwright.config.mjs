import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 30_000,
  globalTimeout: 4 * 60_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }, testIgnore: '**/phone.spec.mjs' },
    { name: 'chromium-phone', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 900 } }, testIgnore: '**/phone.spec.mjs' },
    { name: 'webkit-phone', use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4174',
    env: { PORT: '4174' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
