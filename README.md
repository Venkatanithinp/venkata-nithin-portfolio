# Venkata Nithin — Interactive Portfolio

Next.js App Router / React / TypeScript source, hosted through the Sites Vinext Worker integration. Tailwind CSS, React Three Fiber, Drei, GSAP ScrollTrigger, Motion, and Lenis.

## Features

- Warm editorial hero, solid black typography, fluid difference cursor, and compact glass navigation.
- One persistent 3D portal. Its center stays at 50%; ResizeObserver keeps projection aligned during expansion, while framebuffer resizing is debounced to avoid repeated GPU reallocations. Refresh no longer resets the portal to its initial corner geometry.
- Custom reference-based geometric laptop with thin, individually instanced keycaps and nonoverlapping main keyboard / numpad. World-space camera spline crosses inside the display at 65.4%. About appears only after 85%.
- Three education milestones, the exact nine approved technical skills, source-reviewed CampusFlow showcase, and six approved learning / experience items with the supplied original PDF certificates, lazy preview images, and the embedded Coursera verification link.
- Seven working experiments: typing, bubble/insertion sort visualization, 2048, reaction time, minimax tic-tac-toe, isolated JavaScript worker playground with a two-second execution timeout, and a practical source retrieval experiment.
- Server-side contact submissions, a responsive pastel feedback wall with separate form, approval notifications across tabs and periodic refresh, rate limiting, honeypot fields, input validation, and same-origin checks.
- Resume PDF viewer / download and private owner upload, draft preview, and publish workflow. Draft files remain private in R2; D1 selects the published version. Publishing a new PDF needs no redeployment.
- The initial public resume is derived from the existing supplied resume: phone removed, overlapping skill text repaired, and virtual internship dates aligned with the approved brief. The original source file is unchanged.
- VN. AI. has a half-transparent glass panel with black answer bubbles and white text, server-side intent matching, contextual follow-ups, and useful links. It retrieves approved information server-side. It does not call a paid generative model or claim to generate open-ended AI answers. The AI experiment demonstrates weighted knowledge retrieval explicitly.
- Selected headings and introductions reveal word by word, with reduced-motion support.
- Prewarmed digital shaders, scroll-sampled camera quaternions without time lag, cached tunnel geometry, bounded shadow updates, adaptive DPR, fewer mobile particles, rendering paused behind About, responsive layouts, keyboard controls, and reduced-motion / WebGL-unavailable alternatives.

## Run

```sh
pnpm install
pnpm dev
pnpm build
pnpm typecheck
node --experimental-strip-types scripts/check-choreography.mjs
node scripts/check-server.mjs
node --experimental-strip-types scripts/check-laptop.mjs
node --experimental-strip-types scripts/check-portfolio.mjs
```

The maintained Sites scripts own runtime setup. The build produces `dist/client` and `dist/server` with D1 / R2 bindings from `.openai/hosting.json`. Do not use a static-only deployment for this version.

## Owner access

The site is public; its admin API uses an independent username/password account, not public email or ChatGPT identity headers. Initial setup requires a private high-entropy activation code, verified against a server-side hash and expiry. Only one admin account can be created. Passwords use salted PBKDF2-HMAC-SHA256 (100,000 iterations, Workers runtime cap) with a separate server-secret HMAC pepper. Google Authenticator-compatible TOTP is optional at setup, encrypted at rest, and verified with replay protection. Sessions are random tokens stored only as hashes in D1, expire after eight hours and use Secure, HttpOnly, SameSite=Strict cookies. Login requests are rate limited. A single-use recovery code resets the password, disables TOTP and revokes sessions; keep it in a password manager. Recovery issues a replacement recovery code.

Required secret runtime configuration: ADMIN_AUTH_SECRET, ADMIN_SETUP_HASH, ADMIN_SETUP_EXPIRES. Never rotate ADMIN_AUTH_SECRET after creating the account without a credential migration: it protects password verification and TOTP encryption. Activation stops working after the account exists or its expiry. There is no public registration or email-based password reset. Recovery currently returns the account to password-only login; save the recovery code securely.

Visit /admin, enter the private activation code, choose a username and a password of at least 16 characters, and optionally add the manual time-based setup key to Google Authenticator. Store the recovery code displayed after account creation. Future logins require your username, password and (if enabled) a fresh authenticator code. No ChatGPT sign-in button is shown.

Upload a PDF smaller than 5 MB, preview the draft, and publish it. Contact messages and all feedback states remain private. Only approved feedback is returned by the public wall endpoint. Contact messages are saved to the inbox; they do not trigger email delivery.

## Data

D1 schema and generated migrations are committed under `db/` and `drizzle/`. Sites applies hosted migrations at publication. Local preview uses its own database. R2 stores uploaded PDF versions; the file signature and size are checked server-side. Public PDF responses select only the current published version. The initial PDF is used until the owner publishes an upload.

## Verification

- TypeScript and the Worker production build.
- Camera/display intersection, keyboard clearance, and continuous camera path.
- Pairwise key spacing, 2048 single-merge rules, and minimax draw behavior.
- Server route integration using real in-memory SQLite and an R2 contract adapter: authorization, same-origin enforcement, validation, rate limits, contact persistence, moderation, PDF upload, private preview, publication, and download.
- Browser checks of centered portal layout, navigation, experiments, and responsive layouts.

The managed browser disables WebGL. GPU appearance, laptop fidelity, camera choreography as perceived on physical devices, and real-device Core Web Vitals remain unverified. The model is custom reference-based geometry, not manufacturer CAD. No absolute guarantee of zero errors or photorealistic fidelity is made.

## CampusFlow source review

The actual repository was cloned and inspected, including StudentController, department / placement endpoints, the React application, IMPLEMENTATION_STATUS.md and UPGRADE_NOTES.md. The portfolio distinguishes persistent REST CRUD from browser-local academic demonstrations and UI-only authentication. No live deployment URL or invented project statistics are shown.
