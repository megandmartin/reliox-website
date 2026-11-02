# Website roadmap

This tracks improvements to the public Reliox website. Native-app releases have a separate development process. Proposed work should have a clear scope and acceptance criteria before implementation.

| Status | Improvement | Result or acceptance criteria |
| --- | --- | --- |
| Next | [Accessible film transcripts and captions](https://github.com/megandmartin/reliox-website/issues/1) | Visitors can follow the approved launch film and walkthrough without sound; reviewed captions match the original audio. |
| Implemented | [Browser interaction regression coverage](https://github.com/megandmartin/reliox-website/issues/2) | [Browser tests](../tests/browser/website.spec.mjs) cover Chromium and WebKit at desktop and emulated phone widths, including menu, keyboard tabs, reduced motion, playback coordination, and download routing. |
| Implemented | [Release asset verification](RELEASE-VERIFICATION.md) | An opt-in streaming check compares the public ZIP size and SHA-256 with release metadata and the published checksum file. Ordinary CI uses synthetic files. |

Good first contributions include reproducing a browser-specific issue, clarifying an installation step or fixing an accessibility problem with a focused before-and-after example. See [how to contribute](../CONTRIBUTING.md), [open issues](https://github.com/megandmartin/reliox-website/issues) or [suggest an improvement](https://github.com/megandmartin/reliox-website/issues/new?template=feature_request.yml).
