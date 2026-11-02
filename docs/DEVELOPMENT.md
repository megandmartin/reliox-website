# Development and releases

## Website structure

The site is static HTML, CSS and JavaScript, built with Node.js 22 or later. There are no runtime or build dependencies to install.

| Path | Purpose |
| --- | --- |
| `src/site.mjs` | Page templates, product metadata and release links |
| `public/` | Styles, browser scripts, approved screenshots, films and release metadata |
| `scripts/build.mjs` | Generates `dist/`, the sitemap and robots file |
| `scripts/serve.mjs` | Local preview server with download redirect and media range support |
| `vercel.json` | Hosting configuration, redirects, security headers and cache policy |

`npm run dev` builds the site and serves it at <http://127.0.0.1:4173>. Restart the command after source changes; it does not watch files. `npm run build` produces `dist/` without starting a server. `npm start` serves an existing build. Set `PORT` to choose a different local port.

The published pages are `/`, `/download/`, `/privacy/` and `/releases/`, with a custom 404 page. The canonical origin is <https://www.relioxos.com>.

## Validation

Run `npm test` before submitting a change; it builds the site and checks the generated output, local preview server, and synthetic release-verifier cases. Run `npm run test:browser` for interface changes after the [browser-test setup](ENGINEERING.md). The [engineering notes](ENGINEERING.md) describe coverage and boundaries. Review the rendered result separately when changing content, layout or interaction.

Check desktop and phone widths, menu and tab keyboard behavior, focus visibility, reduced motion and the download journey. For media changes, check poster loading, play, pause, sound, seeking and fullscreen in the affected browsers. A website build or browser check does not verify native installation, account authorization, audio capture or longer-term app use.

## Hosting

Vercel hosts the `reliox-website` project from `main`, with generated output in `dist/`. The apex domain redirects to `www.relioxos.com`. Redirects, CSP and other response headers are defined in `vercel.json`.

The website has no database, account system, data capture form or analytics scripts. Keep changes consistent with the published [privacy explanation](https://www.relioxos.com/privacy/). Do not add tracking or external services as part of an unrelated presentation change.

## Repository artwork

The README uses [the repository preview](assets/reliox-repository-preview.png), a 1280 × 640 PNG under 1 MB. Its [editable HTML source](assets/reliox-repository-preview.html) uses the approved screenshots in `public/assets/`. Open it in a browser at a 1280 × 640 viewport to capture an updated image. Keep example data and early-access requirements visible.

GitHub's repository link card is configured separately: open **Settings → General → Social preview → Edit → Upload an image** and select that PNG. Updating the README image alone does not set the repository's social preview. See [GitHub's social-preview guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview).

## Mac releases

The ZIP and `SHA256SUMS` are GitHub Release assets, separate from the website deployment. `/download/mac/` redirects to the versioned ZIP. Native app source is maintained separately; this repository does not build the app.

Reliox 0.9.0 is an early-access development build for Apple Silicon Macs running macOS 14 or later. It is ad-hoc signed and has not been notarized by Apple. Keep those facts visible in download and release guidance. Native-device acceptance, account connections and recording permissions require separate verification.

For a maintainer preparing a release:

1. Build and verify the native app separately. Preserve its existing bundle, Keychain, encryption and storage identifiers.
2. Package `Reliox.app`, verify the extracted copy and compute its SHA-256 checksum.
3. Publish the ZIP and `SHA256SUMS` as release assets after the release is approved.
4. Update the version and release URL in `src/site.mjs`, the download redirects in `vercel.json` and `scripts/serve.mjs`, and the size, filename, URL and checksum in `public/release.json`.
5. Run website validation and browser checks. After deployment, test the public download anonymously and compare its hash and archive contents with the approved build.

Use only approved synthetic demo screenshots, app icons and public release artifacts. Never add native workspace data, private conversations, credentials, model sessions or diagnostic logs to this repository.

## Homepage films

`public/media/` contains the 38-second launch film and the two-minute product walkthrough, plus their posters. Both films are 1080p H.264/AAC MP4 with front-loaded metadata for progressive playback. The launch film is approximately 4.5 MB; the walkthrough is approximately 22.7 MB.

The hero previews muted when at least 45% of the player is visible. It pauses out of view and respects manual pauses, reduced motion and data saving. The sound button restarts playback with sound through a user gesture. The walkthrough loads on explicit play. Starting one player pauses the other, and both pause when the page is hidden. Native controls and direct-file links remain available.

Both videos use `preload="none"`. A permitted hero autoplay can still start a transfer when the player enters view. The preview server and Vercel support byte ranges for seeking. Media have a one-year immutable cache: use a new filename when replacing a film or poster. Preserve the existing edit, timing and sound unless the task explicitly calls for a film revision.
