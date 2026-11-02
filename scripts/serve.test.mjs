import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

test('preview handles empty files, HEAD requests and media ranges without losing availability', { timeout: 15000 }, async t => {
  // An isolated output directory lets this run alongside site builds and browser tests.
  const directory = await mkdtemp(join(tmpdir(), 'reliox-preview-test-'));
  await mkdir(join(directory, 'dist'));
  await writeFile(join(directory, 'dist', 'empty.txt'), '');
  await writeFile(join(directory, 'dist', 'sample.txt'), '0123456789');
  await writeFile(join(directory, 'dist', '404.html'), '<h1>Missing page</h1>');
  const script = fileURLToPath(new URL('./serve.mjs', import.meta.url));
  const server = spawn(process.execPath, [script], {
    cwd: directory,
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let errors = '';
  server.stderr.on('data', chunk => { errors += chunk; });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  });
  const origin = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error(`Preview did not start: ${errors}`)), 5000);
    server.stdout.on('data', chunk => {
      output += chunk;
      const match = /http:\/\/127\.0\.0\.1:\d+/.exec(output);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited (${code}): ${errors}`)); });
  });

  await t.test('zero-byte GET and HEAD return an empty successful response', async () => {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(`${origin}/empty.txt`, { method });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-length'), '0');
      assert.equal((await response.arrayBuffer()).byteLength, 0);
    }
    const next = await fetch(`${origin}/sample.txt`);
    assert.equal(await next.text(), '0123456789', 'server must remain available after an empty file');
  });

  await t.test('HEAD ignores Range and reports the full representation length', async () => {
    const response = await fetch(`${origin}/sample.txt`, { method: 'HEAD', headers: { Range: 'bytes=0-3' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-length'), '10');
    assert.equal(response.headers.get('content-range'), null);
    assert.equal((await response.arrayBuffer()).byteLength, 0);
  });

  await t.test('GET still supports bounded and suffix byte ranges', async () => {
    for (const [range, expected, contentRange] of [
      ['bytes=2-5', '2345', 'bytes 2-5/10'],
      ['bytes=-3', '789', 'bytes 7-9/10'],
    ]) {
      const response = await fetch(`${origin}/sample.txt`, { headers: { Range: range } });
      assert.equal(response.status, 206);
      assert.equal(response.headers.get('content-range'), contentRange);
      assert.equal(response.headers.get('content-length'), String(expected.length));
      assert.equal(await response.text(), expected);
    }
  });

  await t.test('unsatisfiable ranges are rejected without taking down the server', async () => {
    for (const [path, range] of [['empty.txt', 'bytes=0-0'], ['sample.txt', 'bytes=-0'], ['sample.txt', 'bytes=10-']]) {
      const response = await fetch(`${origin}/${path}`, { headers: { Range: range } });
      assert.equal(response.status, 416);
      await response.arrayBuffer();
    }
    const response = await fetch(`${origin}/sample.txt`);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '0123456789');
  });

  await t.test('unsupported methods return a clear method contract', async () => {
    const response = await fetch(`${origin}/sample.txt`, { method: 'POST' });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET, HEAD');
    assert.equal((await response.arrayBuffer()).byteLength, 0);
  });

  await t.test('missing pages return the custom 404 for GET and no body for HEAD', async () => {
    const missing = await fetch(`${origin}/missing/`);
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), '<h1>Missing page</h1>');
    const head = await fetch(`${origin}/missing/`, { method: 'HEAD' });
    assert.equal(head.status, 404);
    assert.equal((await head.arrayBuffer()).byteLength, 0);
  });
  assert.equal(errors, '', 'preview must not log server errors');
});
