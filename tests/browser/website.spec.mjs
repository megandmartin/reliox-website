import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const release = JSON.parse(await readFile(new URL('../../public/release.json', import.meta.url), 'utf8'));

async function openHome(page) {
  await page.goto('/');
  await expect(page.locator('#launch-film')).toHaveClass(/is-enhanced/);
}

async function settleViewport(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function selectedTab(page, name, { focused = false } = {}) {
  const tab = page.getByRole('tab', { name, exact: true });
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(tab).toHaveAttribute('tabindex', '0');
  if (focused) await expect(tab).toBeFocused();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.getByRole('tabpanel', { name, exact: true })).toBeVisible();
  for (const other of await page.getByRole('tab').all()) {
    if (await other.getAttribute('id') !== await tab.getAttribute('id')) {
      await expect(other).toHaveAttribute('aria-selected', 'false');
      await expect(other).toHaveAttribute('tabindex', '-1');
    }
  }
}

test('experience tabs support click and keyboard navigation', async ({ page }) => {
  await openHome(page);
  const conversations = page.getByRole('tab', { name: 'Conversations', exact: true });
  const people = page.getByRole('tab', { name: 'People & circles', exact: true });
  await selectedTab(page, 'Conversations');
  await people.click();
  await selectedTab(page, 'People & circles');
  await people.press('ArrowRight');
  await selectedTab(page, 'Today & next steps', { focused: true });
  await page.keyboard.press('ArrowRight');
  await selectedTab(page, 'Conversations', { focused: true });
  await page.keyboard.press('ArrowLeft');
  await selectedTab(page, 'Today & next steps', { focused: true });
  await page.keyboard.press('Home');
  await selectedTab(page, 'Conversations', { focused: true });
  await conversations.press('End');
  await selectedTab(page, 'Today & next steps', { focused: true });
});

test('public pages fit the viewport and load without script errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/download/', '/privacy/', '/releases/']) {
    const response = await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} should not overflow horizontally`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('reduced motion prevents autoplay and pauses a running muted preview', async ({ page }) => {
  await openHome(page);
  const launch = page.locator('#launch-film');
  const video = launch.locator('video');
  await launch.scrollIntoViewIfNeeded();
  await expect(launch).toBeInViewport({ ratio: 0.45 });
  await settleViewport(page);
  await expect(video).toHaveJSProperty('paused', true);
  await expect(launch.locator('.film-play')).toBeVisible();

  // Positive control: the same real media plays when motion is permitted.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(video).toHaveJSProperty('paused', false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toHaveJSProperty('paused', true);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await launch.scrollIntoViewIfNeeded();
  await settleViewport(page);
  await expect(video).toHaveJSProperty('paused', true);
});

test('a paused muted preview stays paused after leaving and returning', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openHome(page);
  const launch = page.locator('#launch-film');
  const video = launch.locator('video');
  await launch.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', false);
  await expect(video).toHaveJSProperty('muted', true);

  // Native control chrome differs by browser. Use the standard media API to
  // produce a real pause event, without mocking playback or the site state.
  await video.evaluate(element => element.pause());
  await expect(video).toHaveJSProperty('paused', true);
  await expect(launch.locator('.film-play')).toBeVisible();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(launch).not.toBeInViewport();
  await launch.scrollIntoViewIfNeeded();
  await expect(launch).toBeInViewport({ ratio: 0.45 });
  await settleViewport(page);
  await expect(video).toHaveJSProperty('paused', true);
  await expect(video).toHaveJSProperty('muted', true);
});

test('starting one film pauses the other when both players are visible', async ({ page }) => {
  await openHome(page);
  // A tall real viewport keeps both players visible so scrolling cannot be
  // the reason that the first video pauses. No media APIs are mocked.
  const width = page.viewportSize().width;
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width, height: height + 100 });
  const launch = page.locator('#launch-film');
  const walkthrough = page.locator('#product-demo');
  await expect(launch).toBeInViewport({ ratio: 0.45 });
  await expect(walkthrough).toBeInViewport({ ratio: 0.45 });
  await launch.locator('.film-play').click();
  await expect(launch.locator('video')).toHaveJSProperty('paused', false);
  await walkthrough.locator('.film-play').click();
  await expect(walkthrough.locator('video')).toHaveJSProperty('paused', false);
  await expect(launch.locator('video')).toHaveJSProperty('paused', true);
  await launch.locator('.film-play').click();
  await expect(launch.locator('video')).toHaveJSProperty('paused', false);
  await expect(walkthrough.locator('video')).toHaveJSProperty('paused', true);
});

test('Mac download resolves to the versioned release without transferring the app', async ({ page, baseURL }) => {
  const externalRequests = [];
  await page.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== new URL(baseURL).origin) {
      externalRequests.push(route.request().url());
      await route.abort('blockedbyclient');
    } else await route.continue();
  });
  let resolveRedirect;
  const redirect = new Promise(resolve => { resolveRedirect = resolve; });
  await page.route('**/download/mac/', async route => {
    // Read the real preview-server response, stopping before the external hop.
    const response = await route.fetch({ maxRedirects: 0 });
    resolveRedirect({ status: response.status(), location: response.headers().location });
    // A 204 leaves the current page in place and transfers no release bytes.
    await route.fulfill({ status: 204, body: '' });
  });
  await page.goto('/download/');
  const direct = page.locator('.direct-download');
  await expect(direct).toHaveAttribute('href', '/download/mac/');
  await direct.click({ noWaitAfter: true });
  expect(await redirect).toEqual({ status: 307, location: release.url });
  expect(externalRequests).toEqual([]);
});
