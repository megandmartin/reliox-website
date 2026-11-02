import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { checksumFor, validateRelease, verifyRelease } from './verify-release.mjs';

const fixture = Buffer.from('Synthetic release bytes for verification tests.');
const sha256 = createHash('sha256').update(fixture).digest('hex');
const filename = 'Reliox-0.9.0-macOS-Apple-Silicon.zip';

async function serve(t, options = {}) {
  let zipRequests = 0;
  const server = createServer((request, response) => {
    if (request.url.endsWith('/SHA256SUMS')) {
      if (options.hang) return;
      response.writeHead(options.sumsStatus ?? 200);
      response.end(options.sums ?? `${sha256}  ${filename}\n`);
      return;
    }
    if (options.redirect && request.url.endsWith(`/${filename}`)) {
      response.writeHead(302, { Location: '/redirected-asset.zip' }).end();
      return;
    }
    zipRequests++;
    response.writeHead(options.zipStatus ?? 200, options.chunked ? {} : { 'Content-Length': (options.bytes ?? fixture).length });
    response.write((options.bytes ?? fixture).subarray(0, 9));
    response.end((options.bytes ?? fixture).subarray(9));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((done, reject) => server.close(error => error ? reject(error) : done()));
  });
  const release = { version: '0.9.0', filename, sha256, bytes: fixture.length, url: `http://127.0.0.1:${server.address().port}/releases/download/v0.9.0/${filename}` };
  return { release, zipRequests: () => zipRequests };
}

test('streams the release and matches both byte count and SHA-256', async t => {
  const { release } = await serve(t);
  assert.deepEqual(await verifyRelease(release), { version: release.version, filename, bytes: fixture.length, sha256 });
});

test('accepts a streamed response without a Content-Length header', async t => {
  const { release } = await serve(t, { chunked: true });
  assert.equal((await verifyRelease(release)).sha256, sha256);
});

test('follows a normal release-asset redirect', async t => {
  const { release } = await serve(t, { redirect: true });
  assert.equal((await verifyRelease(release)).sha256, sha256);
});

test('rejects corrupted bytes even when the expected length matches', async t => {
  const { release } = await serve(t, { bytes: Buffer.alloc(fixture.length, 1) });
  await assert.rejects(verifyRelease(release), /SHA-256 differs/);
});

test('rejects a wrong size from the response header', async t => {
  const { release } = await serve(t, { bytes: Buffer.concat([fixture, Buffer.from('extra')]) });
  await assert.rejects(verifyRelease(release), /Content-Length differs/);
});

test('bounds a response with extra bytes and no Content-Length', async t => {
  const { release } = await serve(t, { bytes: Buffer.concat([fixture, Buffer.from('extra')]), chunked: true });
  await assert.rejects(verifyRelease(release), /exceeds the expected/);
});

test('rejects a truncated response without Content-Length', async t => {
  const { release } = await serve(t, { bytes: fixture.subarray(0, 10), chunked: true });
  await assert.rejects(verifyRelease(release), /contains 10 bytes; expected/);
});

test('rejects a failed ZIP request', async t => {
  const { release } = await serve(t, { zipStatus: 404 });
  await assert.rejects(verifyRelease(release), /Release ZIP request failed with HTTP 404/);
});

test('rejects a failed checksum request before requesting the ZIP', async t => {
  const { release, zipRequests } = await serve(t, { sumsStatus: 503 });
  await assert.rejects(verifyRelease(release), /SHA256SUMS request failed with HTTP 503/);
  assert.equal(zipRequests(), 0);
});

test('rejects checksum metadata disagreement before requesting the ZIP', async t => {
  const { release, zipRequests } = await serve(t, { sums: `${'0'.repeat(64)}  ${filename}\n` });
  await assert.rejects(verifyRelease(release), /disagrees with release.json/);
  assert.equal(zipRequests(), 0);
});

test('rejects a missing or duplicate checksum entry', async t => {
  const { release } = await serve(t, { sums: `${sha256}  other.zip\n` });
  await assert.rejects(verifyRelease(release), /exactly one entry/);
  assert.throws(() => checksumFor(`${sha256}  ${filename}\n${sha256} *${filename}\n`, filename), /exactly one entry/);
});

test('supports binary checksum markers and CRLF files', () => {
  assert.equal(checksumFor(`${sha256.toUpperCase()} *${filename}\r\n`, filename), sha256);
});

test('bounds checksum response size', async t => {
  const { release, zipRequests } = await serve(t, { sums: 'a'.repeat(65537) });
  await assert.rejects(verifyRelease(release), /64 KiB limit/);
  assert.equal(zipRequests(), 0);
});

test('times out a stalled request', async t => {
  const { release } = await serve(t, { hang: true });
  await assert.rejects(verifyRelease(release, { timeoutMs: 25 }), error => error.name === 'TimeoutError');
});

test('rejects inconsistent manifest metadata without downloading', async t => {
  const { release, zipRequests } = await serve(t);
  for (const change of [{ version: '0.9.1' }, { filename: '../private.zip' }, { bytes: -1 }, { bytes: 2 ** 31 }, { sha256: 'invalid' }, { url: 'file:///tmp/private' }, { url: `${release.url}?token=secret` }]) {
    await assert.rejects(verifyRelease({ ...release, ...change }));
  }
  assert.equal(zipRequests(), 0);
  assert.equal(validateRelease(release).checksumUrl.pathname, '/releases/download/v0.9.0/SHA256SUMS');
});
