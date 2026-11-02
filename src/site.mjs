export const site = {
  name: 'Reliox',
  origin: 'https://www.relioxos.com',
  version: '0.9.0',
  date: '3 November 2026',
  repo: 'https://github.com/megandmartin/reliox-website',
  release: 'https://github.com/megandmartin/reliox-website/releases/tag/v0.9.0',
  download: '/download/mac/',
  minOS: 'macOS 14 Sonoma or later',
};

const arrow = '<span aria-hidden="true">↗</span>';
const downloadIcon = '<span class="download-symbol" aria-hidden="true">↓</span>';
export const downloadButton = (label = 'Download for Mac', href = '/download/', extra = '') => `<a class="button button-primary ${extra}" href="${href}">${downloadIcon}${label}</a>`;
const icon = '<img class="brand-icon" src="/assets/icon-96.png" alt="" width="36" height="36">';

function header(path) {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="nav-wrap">
    <a class="wordmark" href="/" aria-label="Reliox home">${icon}<span>Reliox</span></a>
    <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button>
    <nav id="main-nav" aria-label="Main navigation">
      <a href="/#experience">The experience</a><a href="/#how-it-works">How it works</a><a href="/privacy/" ${path === '/privacy/' ? 'aria-current="page"' : ''}>Privacy</a>
      ${downloadButton('Download for Mac', '/download/', 'nav-download')}
    </nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer wrap"><div class="footer-top"><a class="wordmark" href="/">${icon}<span>Reliox</span></a><p>A little space. For your people.</p></div>
  <div class="footer-bottom"><span>© 2026 Reliox</span><nav aria-label="Footer navigation"><a href="/download/">Download</a><a href="/privacy/">Privacy</a><a href="/releases/">Release notes</a><a href="${site.repo}/issues">Feedback ${arrow}</a></nav><span class="footer-note">Made for the Mac. Built around people.</span></div></footer>`;
}

export function layout({ title, description, path = '/', body, pageClass = '', scripts = [], preloadImages = [] }) {
  return `<!doctype html><html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title><meta name="description" content="${description}">
  <meta name="theme-color" content="#faf9fc"><meta name="color-scheme" content="light">
  <link rel="canonical" href="${site.origin}${path}"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Reliox"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${site.origin}${path}"><meta property="og:image" content="${site.origin}/assets/social-preview.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Reliox — A little space. For your people. A native Mac workspace for conversations, relationships and next steps.">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${site.origin}/assets/social-preview.png">
  ${preloadImages.map(src => `<link rel="preload" as="image" href="${src}" fetchpriority="high">`).join('')}<link rel="stylesheet" href="/styles.css"><script src="/main.js" defer></script>${scripts.map(src => `<script src="${src}" defer></script>`).join('')}
  </head><body class="${pageClass}">${header(path)}<main id="main">${body}</main>${footer()}</body></html>`;
}

const faq = (question, answer) => `<details><summary>${question}<span aria-hidden="true">+</span></summary><div class="faq-answer">${answer}</div></details>`;

function filmPlayer({ id, title, duration, file, poster, autoplay = false, caption }) {
  return `<figure class="film-player${autoplay ? ' hero-film' : ''}" id="${id}" data-video-player${autoplay ? ' data-autoplay="visible"' : ''}>
    <div class="film-topline"><span>${title}</span><span class="film-duration">${duration}</span></div>
    <div class="film-frame">
      <video id="${id}-video" width="1920" height="1080" controls playsinline preload="none"${autoplay ? ' muted' : ''} poster="${poster}" aria-label="${title}" aria-describedby="${id}-caption">
        <source src="${file}" type="video/mp4">
        Your browser does not support this video. <a href="${file}">Open the film.</a>
      </video>
      <button class="film-play" type="button" aria-label="Watch ${title.toLowerCase()} with sound" hidden><span class="play-symbol" aria-hidden="true"></span><span>Watch ${autoplay ? 'the film' : 'the walkthrough'}<small>${duration} · Sound on</small></span></button>
      ${autoplay ? '<button class="film-sound" type="button" hidden><span class="play-symbol" aria-hidden="true"></span>Watch from the start with sound</button>' : ''}
    </div>
    <figcaption id="${id}-caption"><span>${caption}</span><a href="${file}">Open video <span aria-hidden="true">↗</span></a></figcaption>
    <p class="film-status" role="status" aria-live="polite"></p>
  </figure>`;
}

export function home() {
  return layout({
    title: 'Reliox — A little space for your people, on your Mac',
    description: 'Keep conversations, relationships and follow-ups close in one calm Mac workspace. Explore Reliox and download the early-access app for Apple Silicon Macs.',
    scripts: ['/video.js'],
    preloadImages: ['/media/reliox-launch-poster.webp'],
    body: `
    <section class="hero wrap">
      <div class="eyebrow"><span class="mini-star" aria-hidden="true">✦</span> A LITTLE SPACE. FOR YOUR PEOPLE.</div>
      <h1>Your people.<br><span>All the context.</span></h1>
      <p class="hero-copy">The conversation. The little details. The thing you promised.<br class="desktop-break"> Bring them together in a calm space on your Mac.</p>
      <div class="hero-actions">${downloadButton()}<a class="text-link watch-film-link" href="#launch-film"><span class="play-symbol" aria-hidden="true"></span>Watch the film <span class="watch-link-duration">0:38</span></a></div>
      <p class="compatibility">Apple Silicon · macOS 14+ <span aria-hidden="true">/</span> Early access</p>
      <div class="hero-stage">
        ${filmPlayer({ id: 'launch-film', title: 'The Reliox launch film', duration: '0:38', file: '/media/reliox-launch-v1.mp4', poster: '/media/reliox-launch-poster.webp', autoplay: true, caption: 'One message. A little more context. Scroll to preview; press play for the full film.' })}
      </div>
    </section>

    <section class="intro wrap reveal" aria-labelledby="intro-title"><p class="eyebrow">FOR THE PEOPLE YOU WANT TO KEEP CLOSE</p><h2 id="intro-title">You remember the person.<br><span>Reliox keeps the context.</span></h2><p>A friend’s update. A promising introduction. A follow-up from last week. Give the details a home, so being thoughtful takes a little less effort.</p></section>

    <section id="experience" class="experience wrap" aria-labelledby="experience-title">
      <div class="section-heading reveal"><div><p class="eyebrow">ONE SPACE, A LITTLE MORE HEADSPACE</p><h2 id="experience-title">From “where was that?”<br>to “I’m on it.”</h2></div><p>Conversations, people and next steps.<br>Connected by context, at your pace.</p></div>
      <div class="experience-tabs" role="tablist" aria-label="Explore the Reliox app">
        <button id="tab-inbox" role="tab" aria-selected="true" aria-controls="panel-inbox" tabindex="0" data-tab="inbox">Conversations</button>
        <button id="tab-people" role="tab" aria-selected="false" aria-controls="panel-people" tabindex="-1" data-tab="people">People & circles</button>
        <button id="tab-today" role="tab" aria-selected="false" aria-controls="panel-today" tabindex="-1" data-tab="today">Today & next steps</button>
      </div>
      <div class="experience-panel" id="panel-inbox" role="tabpanel" aria-labelledby="tab-inbox" tabindex="0"><div class="feature-copy"><span class="feature-number">01 / CONVERSATIONS</span><h3>Pick up the thread.<br>Keep the person in view.</h3><p>Read selected or imported conversations alongside the notes, history and next steps for that person.</p><p class="feature-detail">Start with pasted context or a reviewed chat export. Optional account connections have their own setup and coverage limits.</p></div><div class="feature-image"><img src="/assets/inbox.webp" alt="Example conversation with relationship notes and a draft reply" width="1600" height="1024" loading="lazy"></div></div>
      <div class="experience-panel" id="panel-people" role="tabpanel" aria-labelledby="tab-people" tabindex="0" hidden><div class="feature-copy"><span class="feature-number">02 / PEOPLE & CIRCLES</span><h3>A person.<br>More than a profile.</h3><p>Remember how you met, what matters to them and where you left off. Organize people into circles that make sense to you.</p><p class="feature-detail">Add notes, choose a follow-up cadence and keep personal and work context clearly scoped.</p></div><div class="feature-image"><img src="/assets/people.webp" alt="Example person profile with notes, a relationship circle and follow-up preferences" width="1600" height="1024" loading="lazy"></div></div>
      <div class="experience-panel" id="panel-today" role="tabpanel" aria-labelledby="tab-today" tabindex="0" hidden><div class="feature-copy"><span class="feature-number">03 / TODAY & NEXT STEPS</span><h3>The next small thing.<br>Right where you need it.</h3><p>See the conversations and follow-ups that need your attention. Turn a promise into a task beside its original context.</p><p class="feature-detail">Review why something is highlighted. You decide what matters, what to do and when.</p></div><div class="feature-image"><img src="/assets/today.webp" alt="Reliox Today view with example priorities and relationship follow-ups" width="1600" height="1024" loading="lazy"></div></div>
      <noscript><p class="no-script-note">This preview shows Conversations. Reliox also includes editable person profiles, relationship circles and a Today view for follow-ups.</p></noscript>
    </section>

    <section class="small-space wrap reveal"><div class="small-space-copy"><p class="eyebrow">PRESENT WHEN YOU NEED IT</p><h2>A small presence.<br>A bigger picture.</h2><p>A star on your desktop. A quick inbox. A full workspace when it’s time to focus. Reliox opens up with the task, then gets out of your way.</p><div class="keyboard-line"><kbd>esc</kbd><span>Back to a little space.</span></div></div><div class="scale-scene" aria-label="Reliox expands from a small desktop rail into a conversation view"><div class="scene-orbit"></div><img class="rail-preview" src="/assets/rail.webp" alt="The narrow Reliox navigation rail" width="132" height="1080" loading="lazy"><div class="compact-preview"><img src="/assets/compact.webp" alt="The compact Reliox inbox" width="956" height="1360" loading="lazy"></div><span class="scene-label">YOUR DESKTOP. A LITTLE LIGHTER.</span></div></section>

    <section class="voice-section wrap reveal"><div class="voice-visual"><div class="audio-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="transcript-sample"><span class="small-label">A LITTLE LESS NOTE-TAKING</span><p>“Let’s catch up next week.<br>I’ll bring the first draft.”</p><span class="transcript-caption">Illustrative transcript</span></div><div class="task-chip"><span aria-hidden="true">✓</span> Bring the first draft <span class="chip-label">Your next step</span></div></div><div class="voice-copy"><p class="eyebrow">STAY IN THE CONVERSATION</p><h2>Be there.<br>Bring the words along.</h2><p>Capture a thought or a meeting with local English transcription. Review the words, correct speaker labels and save the next step.</p><p class="feature-detail">Recording starts with your click and a visible indicator. Microphone and system audio need macOS permission.</p></div></section>

    <section id="watch-demo" class="demo-section wrap reveal" aria-labelledby="demo-title">
      <div class="section-heading"><div><p class="eyebrow">A CLOSER LOOK</p><h2 id="demo-title">One person.<br>The whole thread.</h2></div><div class="demo-intro"><p>Follow a conversation from scattered messages to a clear next step. A two-minute look inside the Mac app.</p><span class="demo-note">Recorded walkthrough · Example conversations</span></div></div>
      ${filmPlayer({ id: 'product-demo', title: 'The Reliox product walkthrough', duration: '2:02', file: '/media/reliox-walkthrough-v1.mp4', poster: '/media/reliox-demo-poster.webp', caption: 'See conversations, meeting notes and reviewed next steps in one recorded demo.' })}
    </section>

    <section class="privacy-section wrap reveal"><div class="privacy-mark" aria-hidden="true">✦</div><p class="eyebrow">YOUR CONTEXT IS PERSONAL</p><h2>Keep it close.<br><span>Keep the choice.</span></h2><p>Your saved workspace is encrypted on your Mac. Start without connecting accounts. Optional cloud drafts show the exact context before you choose to share it.</p><a href="/privacy/" class="text-link">How Reliox handles your data ${arrow}</a><div class="privacy-principles"><span>Encrypted local workspace</span><span>Cloud only by choice</span><span>Replies you review</span></div></section>

    <section id="how-it-works" class="steps-section wrap reveal"><div class="section-heading"><div><p class="eyebrow">START SMALL</p><h2>A little closer.<br>In a few minutes.</h2></div><p>No account needed to explore.<br>No inbox to connect on day one.</p></div><ol class="steps"><li><span class="step-number">01</span><h3>Make a little space.</h3><p>Download Reliox for your Mac. Move it to Applications and open it.</p></li><li><span class="step-number">02</span><h3>Get a feel for it.</h3><p>Explore the temporary demo. Sample people and conversations are ready to try.</p></li><li><span class="step-number">03</span><h3>Bring your own context.</h3><p>Open your encrypted space. Add a person, paste a conversation or capture a thought.</p></li></ol></section>

    <section class="faq-section wrap reveal"><div><p class="eyebrow">A FEW THINGS TO KNOW</p><h2>Before you<br>make space.</h2></div><div class="faq-list">
      ${faq('What can I download today?', '<p>Reliox 0.9.0 is an early-access native Mac development build for Apple Silicon, running macOS 14 or later. It includes a temporary demo, an encrypted local workspace, person profiles, tasks, conversation capture, and local voice features. It is ad-hoc signed and has not been notarized by Apple. <a href="/download/">See compatibility and installation details.</a></p>')}
      ${faq('Do I have to connect my accounts?', '<p>No. Start with the temporary demo, then add your own notes, people, tasks and selected conversation context. Gmail, Apple Messages and optional Beeper connections have separate setup requirements. Imports are snapshots. Live account compatibility is still being tested.</p>')}
      ${faq('Does Reliox automatically send messages?', '<p>Ordinary reply tools create drafts for you to review and copy. The experimental desktop assistant has a separate, attended WhatsApp/Telegram flow that requires approval for each send attempt. Live messaging remains unverified, and it is not an autonomous inbox manager.</p>')}
      ${faq('Can I use it on Windows, my phone or in a browser?', '<p>The current download runs on Apple Silicon Macs. You download it through your browser, then use it as a native Mac app. Windows, Intel Mac, iPhone, Android and browser app versions are not available in this release.</p>')}
      ${faq('Is the early-access download free?', '<p>There is no charge for the current early-access download. Optional third-party services or models may require their own account, subscription or setup. No future pricing is promised.</p>')}
    </div></section>

    <section class="final-cta wrap reveal"><img src="/assets/icon-192.png" width="80" height="80" alt="Reliox app icon" loading="lazy"><p class="eyebrow">LESS TO HOLD IN YOUR HEAD</p><h2>A little space.<br>For your people.</h2><p>Start with one conversation. See where it takes you.</p>${downloadButton()}<p class="compatibility">Mac with Apple Silicon · macOS 14+ · Early access</p></section>
    `,
  });
}

export function downloadPage() {
  return layout({ title: 'Download Reliox for Mac — Early access & installation', path: '/download/', description: 'Download Reliox 0.9.0 for Apple Silicon Macs running macOS 14 or later. Read early-access details, installation steps and Apple security guidance before opening.', pageClass: 'download-page', body: `
    <section class="download-hero wrap"><div class="download-heading"><a href="/" class="back-link">← Back to Reliox</a><p class="eyebrow">YOUR MAC. YOUR PEOPLE. YOUR SPACE.</p><h1>Make a little<br><span>space for Reliox.</span></h1><p class="large-copy">A calm home for conversations, relationships<br class="desktop-break"> and the next thing you want to remember.</p><div class="platform-notice" hidden role="status"></div></div>
    <div class="download-card"><img src="/assets/icon-192.png" alt="Reliox app icon" width="96" height="96"><span class="release-badge">EARLY ACCESS · ${site.version}</span><h2>Reliox for Mac</h2><p>Apple Silicon · macOS 14 or later</p><p class="download-size" data-release-size>ZIP download · Native Mac app</p><div class="development-notice"><strong>A development build, shared early.</strong><p>This app is ad-hoc signed and has not been notarized by Apple. macOS may block the first launch. Read the installation notes below before opening it.</p></div>${downloadButton('Download for Mac', site.download, 'direct-download')}<span class="download-helper" role="status" aria-live="polite"></span><p class="download-disclaimer">No charge for this build. No account needed to explore.</p><a class="release-details-link" href="/releases/">Release notes & checksums ${arrow}</a></div></section>
    <section id="install" class="install-section wrap"><div class="section-heading"><div><p class="eyebrow">A FEW SIMPLE STEPS</p><h2>From download<br>to your desktop.</h2></div></div><ol class="install-steps"><li><span class="step-number">01</span><div><h3>Download and move.</h3><p>Open the downloaded ZIP. Drag <strong>Reliox.app</strong> into your Applications folder, then open it. Reliox lives in your menu bar and floating panel.</p></div></li><li><span class="step-number">02</span><div><h3>Know what you’re opening.</h3><p>Apple cannot verify this development build. If you trust the download and macOS blocks it, open <strong>System Settings → Privacy & Security</strong> after attempting to launch, and look for <strong>Open Anyway</strong>. Your Mac may ask for confirmation.</p><p>Follow <a href="https://support.apple.com/en-us/102445">Apple’s guidance on opening apps safely</a>. If macOS reports malware or a damaged file, stop and report it; do not override that warning. Managed Macs may prevent opening unnotarized apps.</p></div></li><li><span class="step-number">03</span><div><h3>Explore, then make it yours.</h3><p>Choose <strong>Explore temporary demo</strong> to try sample conversations without an account. Demo edits last only for that session. Choose <strong>Open my encrypted space</strong> for your own saved work; macOS may ask for Keychain access.</p></div></li></ol></section>
    <section class="release-info wrap"><div><p class="eyebrow">IN THIS DOWNLOAD</p><h2>A working beginning.</h2><p>Start with the local workspace. Add connections and optional AI when they are useful to you.</p></div><div class="release-included"><div><h3>Ready to explore</h3><p>Temporary demo · encrypted local workspace · notes and person profiles · circles · tasks and follow-ups · pasted context and reviewed imports · local English transcription.</p></div><div><h3>Needs separate setup</h3><p>Gmail and Apple Messages permissions, optional Beeper, local drafting models, and cloud draft connections. Microphone and system-audio recording require macOS permission.</p></div><div><h3>Still being tested</h3><p>Live account compatibility, live desktop messaging, recording across devices and longer-term use. This release is not an autonomous assistant or a notarized public release.</p></div></div></section>
    <section class="support-strip wrap"><div><h2>A question, a snag, an idea?</h2><p>Share feedback without including private messages, account tokens or personal data.</p></div><a class="button button-secondary" href="${site.repo}/issues">Share feedback ${arrow}</a></section>
  ` });
}

export function privacyPage() {
  return layout({ title: 'Reliox privacy — Your context, your Mac, your choices', path: '/privacy/', description: 'Understand how Reliox stores your workspace locally, handles optional account connections, previews cloud draft context and hosts this website and its downloads.', body: `
    <article class="prose-page wrap"><a href="/" class="back-link">← Back to Reliox</a><p class="eyebrow">PRIVACY, IN PLAIN LANGUAGE</p><h1>Your context.<br><span>Your choices.</span></h1><p class="prose-lead">Reliox is built around a local workspace. Here’s what that means in the current early-access build.</p><p class="updated">Updated ${site.date} · Applies to Reliox ${site.version} and this website.</p>
    <h2>Your saved workspace stays on your Mac.</h2><p>The app encrypts saved workspace content on this Mac using AES-GCM. Its encryption key and account credentials use macOS Keychain. The temporary demo uses example data and does not save your demo edits as a personal workspace.</p><p>This is local storage, not an end-to-end encrypted sync service. Your Mac’s security, backups and access controls still matter. Losing the original key can make device-bound backups unreadable. Portable backups use a separate passphrase that you must keep.</p>
    <h2>You choose the context you bring in.</h2><p>You can start with your own notes, tasks and selected pasted text without connecting accounts. Reviewed chat exports are snapshots, not a continuing connection. Optional Gmail, Apple Messages and Beeper connections have their own permissions and coverage limits. Provider tokens are held in Keychain.</p><p>Private and excluded scope settings restrict which content appears in automatic insights, search and optional draft context. Read the scope shown in the app. Exports and external backup copies need their own care; deleting something in the app does not erase every copy you have made.</p>
    <h2>Cloud drafting is a separate choice.</h2><p>Local templates work without a cloud model. Optional local AI needs separate model setup. A cloud draft connection shows the exact context before you choose to share it with the configured provider. That provider processes what you approve under its own terms and privacy policy. Do not send information you are not entitled to share.</p>
    <h2>Recording starts with you.</h2><p>Recording begins with your click and a visible indicator. macOS asks for microphone or system-audio access when needed. Audio is handled in memory for the current session; saved transcripts are encrypted in the local workspace. Record only conversations you are permitted to record. Local English speech recognition is included in this build.</p>
    <h2>You review replies and actions.</h2><p>The ordinary reply studio produces editable drafts. A separate experimental desktop assistant can attempt an explicitly approved WhatsApp or Telegram send while you attend it. It requires separate setup and approval for each attempt. Live messaging remains unverified. Optional Hermes drafting has its own isolated profile and may keep its own session history outside the Reliox vault.</p>
    <h2>This website and download use hosting providers.</h2><p>This static website has no accounts, advertising pixels, analytics scripts, newsletter form or application-data upload. It is hosted on Vercel, which may process normal request information such as IP address, browser details and access logs. App files and source for this website are hosted on GitHub, which receives download requests. These providers handle their infrastructure data under their own policies.</p><p><a href="https://vercel.com/legal/privacy-policy">Vercel privacy policy</a> · <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub privacy statement</a></p>
    <h2>Feedback is public.</h2><p>The feedback link opens this website’s GitHub issues. Do not include private conversations, account credentials, recordings or personal contact information. You can <a href="${site.repo}/issues">raise a product or privacy question</a> there without sharing those details.</p>
    </article>
  ` });
}

export function releasesPage() {
  return layout({ title: 'Reliox release notes — Mac early access version 0.9.0', path: '/releases/', description: 'Read what changed in Reliox 0.9.0, check Mac compatibility and verify the early-access download with its published SHA-256 checksum before installing.', body: `<article class="prose-page wrap"><a href="/download/" class="back-link">← Download Reliox</a><p class="eyebrow">A LITTLE BETTER, RELEASE BY RELEASE</p><h1>What’s new<br><span>in your space.</span></h1><div class="release-title"><h2>Reliox ${site.version}</h2><span>${site.date} · Early access</span></div><p class="prose-lead">Relio OS is now Reliox. A new name for the same local Mac workspace, with a home on the web.</p><ul><li>Updated app name, menus, onboarding and permission descriptions.</li><li>Existing storage paths, encryption context, Keychain identifiers and saved preferences are retained.</li><li>Direct Mac download with installation guidance and published checksums.</li><li>Existing glass themes, conversation capture, profiles, circles, tasks and local voice tools are preserved.</li></ul><h2>Compatibility</h2><p>Apple Silicon Mac (M-series) · ${site.minOS}. This release does not include Intel, Windows, iPhone, Android or browser app builds.</p><h2>Early-access status</h2><p>Ad-hoc signed; not Apple notarized. Live account connections, attended desktop messaging and microphone/system-audio capture still have validation limits. Local drafts and optional cloud providers can require additional setup. The demo needs no account and uses sample data.</p><h2>Verify your download</h2><p>The exact file size and SHA-256 checksum are published with the release. Compare them if you want to verify that your file matches the published build.</p><div id="checksum-details" class="checksum-details"><p>View the checksum file on GitHub with the release.</p></div><p><a class="button button-secondary" href="${site.release}">Open release & checksums ${arrow}</a></p>${downloadButton()}</article>` });
}

export function notFoundPage() {
  return layout({ title: 'Page not found — Reliox', path: '/404/', description: 'This page could not be found. Return to Reliox or download the Mac app.', body: `<section class="not-found wrap"><p class="eyebrow">A LITTLE OUT OF PLACE</p><h1>Let’s get<br><span>you home.</span></h1><p>This page isn’t here. Your people are one click closer.</p><a class="button button-primary" href="/">Back to Reliox <span aria-hidden="true">↗</span></a></section>` });
}
