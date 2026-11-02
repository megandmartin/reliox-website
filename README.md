# Reliox website

Public homepage and Mac download landing page for Reliox.

- Canonical site: https://www.relioxos.com
- Homepage: `/`
- Download and installation: `/download/`
- Privacy explanation: `/privacy/`
- Release notes and checksum: `/releases/`

## Development

Node.js 22+; no runtime or build dependencies.

```sh
npm run dev
```

The preview runs at http://127.0.0.1:4173. `npm run build` generates `dist/` from `src/site.mjs` and `public/`.

## Hosting and releases

Vercel project: `reliox-website` in `megandmartins-projects`. Production branch: `main`.
The apex redirects to `www.relioxos.com`. Vercel config includes TLS, CSP and other security headers.

The Mac ZIP is a GitHub Release asset, not part of the website deployment. `/download/mac/` redirects to the versioned binary. Download instructions distinguish a native Mac app from a browser app and clearly disclose the ad-hoc signature and lack of Apple notarization.

To update a release:

1. Build and verify the Mac app separately. Preserve the existing bundle, Keychain, crypto and storage identifiers.
2. Package `Reliox.app`, verify the extracted copy, and compute SHA-256.
3. Publish the ZIP and `SHA256SUMS` as release assets.
4. Update the version and release URL in `src/site.mjs`, the download redirect in `vercel.json` and `scripts/serve.mjs`, and `public/release.json`.
5. Run build and browser checks, then deploy. Test the production download anonymously, including file hash and contents.

The native application source stays in its original local handoff directory. Only approved synthetic demo screenshots, the app icon, public website source and release artifacts are published here. No private conversations, credentials, model sessions, logs or native app evidence are included in this repository.

## Scope

No database, account system, data capture form or analytics scripts. Account authorization, microphone/system capture, native-device acceptance and Apple notarization are separate from website verification. The app supports Apple Silicon and macOS 14+; other operating systems and a browser app are not offered.

## Homepage films

The hero contains the supplied 38-second launch film; a two-minute product walkthrough appears below the feature sections. Both are self-hosted under `public/media/` as 1080p H.264/AAC MP4 with front-loaded metadata for progressive playback. The launch film is approximately 4.5 MB; the walkthrough is approximately 22.7 MB. Source edits, timing and sound are preserved.

The hero starts muted when at least 45% of its player enters the viewport, pauses when it leaves, and honors manual pauses, reduced-motion and data-saving preferences. “Watch from the start with sound” restarts and unmutes through a user gesture. The walkthrough only loads on explicit play. Native playback, seeking, audio and fullscreen controls remain available, as do posters and direct-file links. Videos pause when the page is hidden; starting one pauses the other.

`preload="none"` prevents the full videos from transferring on arrival. Vercel serves media byte ranges for seeking. These media URLs have a one-year immutable cache: use a new filename when replacing a film or poster. No new video service, cookie or third-party player is used.
