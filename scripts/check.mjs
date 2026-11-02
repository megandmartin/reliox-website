import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, dirname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { site } from '../src/site.mjs';

const root = resolve('dist');
const routes = ['/', '/download/', '/privacy/', '/releases/'];
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const release = JSON.parse(await readFile('public/release.json', 'utf8'));
const pages = new Map(await Promise.all([...routes, '/404.html'].map(async route => [route, await readFile(join(root, route.endsWith('/') ? `${route}index.html` : route), 'utf8')])));
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(([, name, value]) => [name.toLowerCase(), value]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attrs(tag));
const ids = html => new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(([, id]) => id));
const htmlFile = route => join(root, route.endsWith('/') ? `${route}index.html` : route);

// These checks inspect the exported site, including assets and cross-page references.
// They do not make network requests to third-party sites or download the native app.
test('every public page has a useful, accessible document and share metadata', async () => {
  for (const [route, html] of pages) {
    assert.match(html, /<!doctype html>/i, `${route}: missing HTML doctype`);
    assert.match(html, /<html\b[^>]*lang="en"/, `${route}: missing document language`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: expected one page heading`);
    assert.match(html, /<main\b[^>]*id="main"/, `${route}: missing main landmark`);
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1];
    assert.ok(title?.includes(site.name), `${route}: title should identify Reliox`);
    const metas = tags(html, 'meta');
    const meta = name => metas.find(item => item.name === name || item.property === name)?.content;
    assert.ok(meta('description')?.length > 40, `${route}: missing useful page description`);
    const canonicalPath = route === '/404.html' ? '/404/' : route;
    assert.ok(tags(html, 'link').some(item => item.rel === 'canonical' && item.href === `${site.origin}${canonicalPath}`), `${route}: wrong canonical URL`);
    assert.equal(meta('og:url'), `${site.origin}${canonicalPath}`, `${route}: wrong Open Graph URL`);
    assert.equal(meta('twitter:card'), 'summary_large_image', `${route}: missing large share card`);
    assert.ok(meta('og:image:alt'), `${route}: missing social image description`);
    for (const image of tags(html, 'img')) {
      assert.ok(Object.hasOwn(image, 'alt'), `${route}: image needs alt text, or an empty alt for decoration`);
      assert.ok(Number(image.width) > 0 && Number(image.height) > 0, `${route}: image dimensions prevent layout shifts`);
    }
    const allIds = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(([, id]) => id);
    assert.equal(new Set(allIds).size, allIds.length, `${route}: duplicate IDs`);
    for (const tag of [...html.matchAll(/<[^/!][^>]*>/g)].map(([value]) => attrs(value))) {
      for (const name of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
        for (const id of (tag[name] || '').split(/\s+/).filter(Boolean)) assert.ok(ids(html).has(id), `${route}: ${name} points to missing #${id}`);
      }
    }
  }
});

test('internal links, scripts, posters, images and fragment targets exist', async () => {
  for (const [route, html] of pages) {
    for (const [, attribute, raw] of html.matchAll(/\b(href|src|poster)=["']([^"']+)["']/g)) {
      if (/^(?:https?:|mailto:|data:|tel:|\/\/)/i.test(raw)) continue;
      const url = new URL(raw.replaceAll('&amp;', '&'), `${site.origin}${route}`);
      if (url.origin !== site.origin) continue;
      if (config.redirects.some(item => item.source === url.pathname && !item.has)) continue;
      const file = htmlFile(decodeURIComponent(url.pathname));
      assert.ok(file.startsWith(root + sep), `${route}: ${attribute} escapes output directory`);
      const info = await stat(file).catch(() => null);
      assert.ok(info?.isFile() && info.size > 0, `${route}: broken ${attribute} ${raw}`);
      if (url.hash && file.endsWith('.html')) {
        const target = await readFile(file, 'utf8');
        assert.ok(ids(target).has(decodeURIComponent(url.hash.slice(1))), `${route}: broken fragment ${raw}`);
      }
    }
  }
});

test('release version, download redirects and published checksum metadata agree', async () => {
  assert.equal(release.version, site.version, 'release version differs from the website');
  assert.equal(site.release, `${site.repo}/releases/tag/v${release.version}`, 'release notes link uses a different version');
  assert.match(release.sha256, /^[a-f0-9]{64}$/, 'SHA-256 must contain exactly 64 lowercase hex characters');
  assert.ok(Number.isSafeInteger(release.bytes) && release.bytes > 0, 'download size must be a positive byte count');
  assert.equal(release.sizeMB, Math.round(release.bytes / 100000) / 10, 'displayed MB differs from byte count');
  assert.equal(release.filename, `Reliox-${release.version}-macOS-Apple-Silicon.zip`);
  assert.equal(release.url, `${site.repo}/releases/download/v${release.version}/${release.filename}`);
  assert.ok(!Number.isNaN(Date.parse(release.date)), 'release date is invalid');
  assert.equal(config.redirects.find(item => item.source === site.download)?.destination, release.url, 'production download redirect differs from release metadata');
  assert.deepEqual(JSON.parse(await readFile('dist/release.json', 'utf8')), release, 'exported release metadata differs from source');
  // Keep the early-access disclosure attached to the actual published signing state.
  if (!release.notarized) assert.match(pages.get('/download/'), /has not been notarized by Apple/, 'download page must disclose missing notarization');
});

test('crawler files list the public canonical routes', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => value);
  assert.deepEqual(locations.sort(), routes.map(route => `${site.origin}${route}`).sort());
  assert.match(await readFile('dist/robots.txt', 'utf8'), new RegExp(`Sitemap: ${site.origin.replaceAll('.', '\\.')}\\/sitemap\\.xml`));
});

test('hosting preserves essential security headers and canonical redirects', () => {
  const headers = new Map(config.headers.find(item => item.source === '/(.*)')?.headers.map(item => [item.key.toLowerCase(), item.value]));
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.match(headers.get('strict-transport-security') || '', /max-age=\d+/);
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "base-uri 'self'"]) assert.ok(headers.get('content-security-policy')?.includes(directive), `missing CSP directive: ${directive}`);
  assert.ok(config.redirects.some(item => item.permanent && item.has?.some(rule => rule.type === 'host' && rule.value === new URL(site.origin).hostname.replace(/^www\./, '')) && item.destination === `${site.origin}/$1`), 'apex should redirect to canonical www domain');
});

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !['qa', 'node_modules', 'dist'].includes(entry.name)) files.push(...await markdownFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}

test('repository documentation links and the public preview image remain usable', async () => {
  const repository = resolve('.');
  const documents = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', ...await markdownFiles('docs')];
  for (const document of documents) {
    const content = (await readFile(document, 'utf8')).replace(/^```[\s\S]*?^```/gm, '');
    const targets = [
      ...[...content.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^)]*["'])?\)/g)].map(match => match[1] || match[2]),
      ...tags(content, 'img').map(image => image.src).filter(Boolean),
    ];
    for (const target of targets) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;
      const path = decodeURIComponent(target.split(/[?#]/)[0]);
      if (!path) continue;
      const destination = path.startsWith('/') ? resolve(repository, `.${path}`) : resolve(dirname(document), path);
      assert.ok(destination.startsWith(repository + sep), `${document}: link escapes repository: ${target}`);
      const info = await stat(destination).catch(() => null);
      assert.ok(info && (info.isDirectory() || info.isFile() && info.size > 0), `${document}: broken local documentation link ${target}`);
    }
  }
  const preview = 'docs/assets/reliox-repository-preview.png';
  const image = await readFile(preview);
  assert.ok(image.length > 24 && image.length <= 1000000, `${preview}: must be a PNG of at most 1 MB`);
  assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), `${preview}: invalid PNG signature`);
  assert.equal(image.toString('ascii', 12, 16), 'IHDR', `${preview}: missing PNG image header`);
  assert.equal(image.readUInt32BE(16), 1280, `${preview}: expected 1280px width`);
  assert.equal(image.readUInt32BE(20), 640, `${preview}: expected 640px height`);
});

async function findPort() {
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise((done, reject) => socket.close(error => error ? reject(error) : done()));
  return port;
}

test('preview serves pages, real download redirects, 404s and video byte ranges', { timeout: 15000 }, async t => {
  const port = await findPort();
  const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => server.kill());
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(([code]) => { throw new Error(`preview server exited early (${code})`); }),
    new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('preview server did not start')), 5000); timer.unref(); }),
  ]);
  const origin = `http://127.0.0.1:${port}`;
  for (const route of routes) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, `${route}: preview failed`);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.equal(await response.text(), pages.get(route));
  }
  const redirect = await fetch(origin + site.download, { redirect: 'manual' });
  assert.equal(redirect.status, 307);
  assert.equal(redirect.headers.get('location'), release.url, 'preview download differs from production release');
  const absent = await fetch(`${origin}/a-page-that-does-not-exist/`);
  assert.equal(absent.status, 404);
  assert.equal(await absent.text(), pages.get('/404.html'));
  const film = tags(pages.get('/'), 'source').find(item => item.type === 'video/mp4')?.src;
  assert.ok(film, 'homepage should provide a playable film source');
  const range = await fetch(origin + film, { headers: { Range: 'bytes=0-31' } });
  assert.equal(range.status, 206, 'video must support byte-range seeking');
  assert.match(range.headers.get('content-range'), /^bytes 0-31\/\d+$/);
  assert.equal((await range.arrayBuffer()).byteLength, 32);
  const invalidRange = await fetch(origin + film, { headers: { Range: 'bytes=999999999999-' } });
  assert.equal(invalidRange.status, 416, 'out-of-bounds range should be rejected');
  const head = await fetch(origin + film, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.ok(Number(head.headers.get('content-length')) > 0);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
});
