<a href="https://www.relioxos.com/">
  <img src="docs/assets/reliox-repository-preview.png" alt="Reliox — a little space for your people. Preview of the native Mac workspace with example conversations and relationship context." width="1280" height="640">
</a>

# Reliox

**A little space. For your people.**

Conversations, the details you want to remember, and the follow-up you promised. Reliox brings them together in a calm workspace on your Mac.

Created by [Megan Martinsone](https://github.com/megandmartin).

[Visit the website](https://www.relioxos.com/) · [Download for Mac](https://www.relioxos.com/download/) · [Watch the walkthrough](https://www.relioxos.com/#watch-demo) · [Release notes](https://www.relioxos.com/releases/) · [Engineering notes](docs/ENGINEERING.md)

[![Website checks](https://github.com/megandmartin/reliox-website/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/megandmartin/reliox-website/actions/workflows/checks.yml) [![Early access 0.10.0](https://img.shields.io/badge/early_access-0.10.0-7056ad)](https://github.com/megandmartin/reliox-website/releases/tag/v0.10.0) [![macOS 14+ · Apple Silicon](https://img.shields.io/badge/macOS_14%2B-Apple_Silicon-34313e)](https://www.relioxos.com/download/)

## A person. The whole thread.

| In Reliox | What it helps you do |
| --- | --- |
| Conversations | Read selected or imported context beside notes and a reply draft. |
| People & circles | Keep the little details, relationship history, and follow-up preferences together. |
| Today & next steps | Give a promise a next step, with the original context close by. |
| Local workspace | Save your own workspace encrypted on your Mac; explore the temporary demo without connecting accounts. |

The [recorded walkthrough](https://www.relioxos.com/#watch-demo) uses example conversations. You can also [read the films in text](https://www.relioxos.com/films/). Read [how Reliox handles data](https://www.relioxos.com/privacy/) before bringing in your own context.

> [!IMPORTANT]
> **Mac early access:** Reliox 0.10.0 requires Apple Silicon and macOS 14 or later. The app is ad-hoc signed and **not Apple notarized**. Read the [installation guidance](https://www.relioxos.com/download/#install) and [release checksums](https://github.com/megandmartin/reliox-website/releases/tag/v0.10.0) before opening it. Optional connections and AI features need separate setup; live account compatibility is still being tested.

## Inside this repository

The Reliox website brings the product demo, Mac download, installation guide, privacy explanation, and release notes together. This repository builds that website and distributes versioned downloads through [GitHub Releases](https://github.com/megandmartin/reliox-website/releases).

The site is static HTML, CSS, and JavaScript generated with Node.js, with **no runtime or build dependencies**. It has no accounts, analytics scripts, or data collection forms. Screenshots use synthetic demo data.

| Source | Purpose |
| --- | --- |
| [`src/site.mjs`](src/site.mjs) | Page content, templates, and shared metadata. |
| [`src/films.mjs`](src/films.mjs) | Recorded-film transcripts and caption references. |
| [`public/`](public/) | Styles, browser interactions, screenshots, and films. |
| [`scripts/`](scripts/) | Build, preview server, contract checks, and release verification. |
| [`tests/browser/`](tests/browser/) | Chromium and WebKit interaction checks at desktop and emulated phone widths. |
| [Engineering notes](docs/ENGINEERING.md) | Architecture, design tradeoffs, and reproducible test setup. |

Browser tests exercise keyboard navigation, responsive layouts, motion preferences, and real media playback. The [release verifier](docs/RELEASE-VERIFICATION.md) streams the public ZIP and checks its byte count and SHA-256 without saving or running it.

## Run it locally

Use **Node.js 22 or later**. The build and Node checks need no dependency installation.

```sh
git clone https://github.com/megandmartin/reliox-website.git
cd reliox-website
npm run dev
```

Open [127.0.0.1:4173](http://127.0.0.1:4173). After editing source files, restart `npm run dev` to rebuild, then refresh your browser.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Build and serve a local preview. |
| `npm test` | Check generated pages, links, metadata, documentation, HTTP behavior, and release-verifier failure cases. |
| `npm run test:browser` | Run browser checks after the [test-tooling setup](docs/ENGINEERING.md). |
| `npm run verify:release` | Stream and verify the public Mac ZIP against its size and checksums. |
| `npm run build` | Generate the deployable website in `dist/`. |
| `npm start` | Serve an existing build. |

See the [development guide](docs/DEVELOPMENT.md) for hosting, release updates, and film behavior. Browser tests use a pinned development dependency; the production build stays dependency-free.

## Help shape the next version

Useful contributions include clearer installation instructions, accessible interactions, responsive layouts, and reproducible bug reports. Start with the [contribution guide](CONTRIBUTING.md) and [website roadmap](docs/ROADMAP.md).

- [Report a problem or suggest an improvement](https://github.com/megandmartin/reliox-website/issues/new/choose).
- [Report a security vulnerability privately](SECURITY.md).

Use example data in public feedback. Keep private conversations, recordings, contact details, and credentials out of issues and pull requests.
