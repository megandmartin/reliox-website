import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const maxChecksumBytes = 64 * 1024;
const maxReleaseBytes = 1024 ** 3;

export function validateRelease(release) {
  if (!release || typeof release !== 'object') throw new Error('Release metadata is missing.');
  if (typeof release.version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(release.version)) throw new Error('Release version is invalid.');
  if (release.filename !== `Reliox-${release.version}-macOS-Apple-Silicon.zip`) throw new Error('Release filename does not match its version.');
  if (!Number.isSafeInteger(release.bytes) || release.bytes <= 0 || release.bytes > maxReleaseBytes) throw new Error('Release byte count must be positive and at most 1 GiB.');
  if (typeof release.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(release.sha256)) throw new Error('Release SHA-256 must be 64 lowercase hexadecimal characters.');
  const url = new URL(release.url);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Release URL must be an HTTP(S) URL without credentials, query or fragment.');
  if (!url.pathname.endsWith(`/releases/download/v${release.version}/${release.filename}`)) throw new Error('Release URL does not match its version and filename.');
  return { url, checksumUrl: new URL('SHA256SUMS', url) };
}

export function checksumFor(text, filename) {
  const matches = text.split(/\r?\n/).map(line => /^([a-fA-F0-9]{64})[ \t]+[* ]?(.+?)\s*$/.exec(line)).filter(match => match?.[2] === filename);
  if (matches.length !== 1) throw new Error(`SHA256SUMS must contain exactly one entry for ${filename}.`);
  return matches[0][1].toLowerCase();
}

async function responseFor(url, signal, label) {
  const response = await fetch(url, { signal, redirect: 'follow', headers: { 'Accept-Encoding': 'identity' } });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`${label} request failed with HTTP ${response.status}.`);
  }
  if (!response.body) throw new Error(`${label} response has no body.`);
  return response;
}

async function readChecksum(response) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > maxChecksumBytes) throw new Error('SHA256SUMS exceeds the 64 KiB limit.');
    chunks.push(chunk);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
}

// This downloads into a streaming hash only. It never saves, extracts or runs the app.
export async function verifyRelease(release, { timeoutMs = 300000 } = {}) {
  const { url, checksumUrl } = validateRelease(release);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new Error('Verification timeout must be a positive millisecond count.');
  const signal = AbortSignal.timeout(timeoutMs);
  const sums = await readChecksum(await responseFor(checksumUrl, signal, 'SHA256SUMS'));
  if (checksumFor(sums, release.filename) !== release.sha256) throw new Error('Published SHA256SUMS disagrees with release.json.');

  const response = await responseFor(url, signal, 'Release ZIP');
  const contentLength = response.headers.get('content-length');
  if (contentLength !== null && (!/^\d+$/.test(contentLength) || Number(contentLength) !== release.bytes)) {
    await response.body.cancel();
    throw new Error(`Release ZIP Content-Length differs from the expected ${release.bytes} bytes.`);
  }
  const hash = createHash('sha256');
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
    if (bytes > release.bytes) throw new Error(`Release ZIP exceeds the expected ${release.bytes} bytes.`);
    hash.update(chunk);
  }
  if (bytes !== release.bytes) throw new Error(`Release ZIP contains ${bytes} bytes; expected ${release.bytes}.`);
  const sha256 = hash.digest('hex');
  if (sha256 !== release.sha256) throw new Error('Release ZIP SHA-256 differs from release.json and SHA256SUMS.');
  return { version: release.version, filename: release.filename, bytes, sha256 };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const release = JSON.parse(await readFile(new URL('../public/release.json', import.meta.url), 'utf8'));
    console.log(`Verifying ${release.filename} (${release.bytes} bytes); no file will be saved.`);
    const result = await verifyRelease(release);
    console.log(`Verified ${result.bytes} bytes and SHA-256 ${result.sha256}`);
    console.log('The ZIP matches the published metadata. This does not verify signing, notarization, safety or native app behavior.');
  } catch (error) {
    console.error(`Release verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
