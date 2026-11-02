# Verify the published Mac download

Run this from a checkout with Node.js 22 or later:

```sh
npm run verify:release
```

This is an opt-in network check. It reads `public/release.json`, downloads the public `SHA256SUMS` file, and compares the entry for the exact release filename. It then streams the ZIP through a SHA-256 hash and verifies the exact byte count. No GitHub credentials or dependency installation are needed.

The command downloads the full release, currently about 140 MB, but does not save, extract or execute it. Any HTTP failure, checksum disagreement, size mismatch or timeout returns a nonzero exit code. It limits checksum text to 64 KiB, release size to 1 GiB, and the whole verification to five minutes. Retry later if a slow or interrupted connection times out.

A successful result means the hosted ZIP matches the repository metadata and published checksum file. Those records share the same publisher; this is an integrity check, not an independent attestation of the app's origin or safety. It does not establish Apple signing/notarization, successful installation, native behavior or live provider compatibility.

## Recorded manual check

On 3 November 2026 (Singapore time), an anonymous run against the public Reliox 0.9.0 release completed successfully:

```text
Bytes:   139710328
SHA-256: e951d21df5cc4a4abeb47c5153e01be250815afc5f82274d2af96220084d8383
```

The streamed ZIP matched both `public/release.json` and the release's `SHA256SUMS` entry. This records one check of that version at that time. Run the command again to check the currently hosted bytes.

## Test the verifier without downloading the app

```sh
node --test scripts/verify-release.test.mjs
```

The tests serve small synthetic files from a temporary local HTTP server. They cover matching bytes, corruption, truncated and oversized responses, HTTP errors, inconsistent metadata, absent or duplicate checksum entries, checksum size limits and timeouts. Ordinary automated tests do not fetch the native ZIP.
