# Contributing to the Reliox website

Thanks for helping make Reliox easier to discover, understand and use. This repository contains the public website, installation guidance and release information. The native Mac app is developed separately.

## Useful ways to help

- Report a broken page, download link or confusing installation step.
- Improve copy, accessibility, keyboard navigation or mobile layouts.
- Test a page in another browser and share reproducible findings.
- Suggest a focused improvement to the website or public documentation.

Check [existing issues](https://github.com/megandmartin/reliox-website/issues) before opening a report. For a substantial change, open a proposal first so the work has a clear scope. The [website roadmap](docs/ROADMAP.md) lists useful next steps.

## Run it locally

Use Node.js 22 or later. There are no dependencies to install.

```sh
git clone https://github.com/megandmartin/reliox-website.git
cd reliox-website
npm run dev
```

Open <http://127.0.0.1:4173>. After editing source files, stop and rerun the command to rebuild; the preview server does not watch files.

Before submitting:

```sh
npm test
```

This builds the site and checks the generated output and local preview server. For visual or interaction changes, also check the rendered page at desktop and phone widths. Test keyboard navigation, visible focus and reduced motion. Include a screenshot or short recording when it helps a reviewer understand the change.

## Keep changes focused

Create a branch, make a small change and open a pull request that explains the problem, the resulting behavior and what you checked. Edit `src/` or `public/`; `dist/` is generated and stays out of Git. Preserve the current visual identity and straightforward, factual tone.

Keep the early-access status, Mac requirements and installation limitations accurate. A passing website check does not verify native app behavior. Release binaries and native-app changes need their own maintainer review; see [development and release notes](docs/DEVELOPMENT.md).

Use only approved example data in screenshots and recordings. Never upload private conversations, contact details, credentials, account tokens, recordings or diagnostic logs containing personal data. Issues and pull requests are public. Report security vulnerabilities through [private vulnerability reporting](SECURITY.md).

No project-wide license file is provided. Please discuss reuse of branding, screenshots or release binaries with the maintainer before including them in another project.
