# Venkata Nithin — Interactive Portfolio

Next.js App Router / React / TypeScript source, hosted through the Sites Vinext Worker integration. Tailwind CSS, React Three Fiber, Drei, GSAP ScrollTrigger, Motion, and Lenis.

## Features

- Warm editorial hero, solid black typography, fluid difference cursor, and compact glass navigation.
- One persistent 3D portal. Its center stays at 50%; ResizeObserver keeps projection aligned during expansion, while framebuffer resizing is debounced to avoid repeated GPU reallocations. Refresh no longer resets the portal to its initial corner geometry.
- Custom reference-based geometric laptop with thin, individually instanced keycaps and nonoverlapping main keyboard / numpad. World-space camera spline crosses inside the display at 65.4%. About appears only after 85%.
- Three education milestones, the exact nine approved technical skills, source-reviewed CampusFlow showcase, and six approved learning / experience items with the supplied original PDF certificates, lazy preview images, and the embedded Coursera verification link.
- Seven working experiments: typing, bubble/insertion sort visualization, 2048, reaction time, minimax tic-tac-toe, isolated JavaScript worker playground with a two-second execution timeout, and a practical source retrieval experiment.
- Server-side contact submissions, a responsive pastel feedback wall with separate form, approval notifications across tabs and periodic refresh, rate limiting, honeypot fields, input validation, and same-origin checks.
- Resume PDF viewer and download. The current PDF is served from the repository's `public/Venkata-Nithin-Resume.pdf`.
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

## Resume updates

The public resume page embeds and links to `/Venkata-Nithin-Resume.pdf`. To replace the resume, update `public/Venkata-Nithin-Resume.pdf` in the GitHub repository and commit the change to `main`. Cloudflare Pages automatically builds and deploys commits from that branch. There is no admin login or in-site upload workflow.

Contact messages are saved to the inbox; they do not trigger email delivery. Feedback is private until approved, and only approved feedback is returned by the public wall endpoint.

## Data

D1 schema and generated migrations are committed under `db/` and `drizzle/`. The site uses D1 for its server-side features. R2 is configured for the Cloudflare project but is not used for resume publishing; the resume is a static file in `public/`.

## Verification

- TypeScript and the Worker production build.
- Camera/display intersection, keyboard clearance, and continuous camera path.
- Pairwise key spacing, 2048 single-merge rules, and minimax draw behavior.
- Server route integration using real in-memory SQLite and an R2 contract adapter: authorization, same-origin enforcement, validation, rate limits, contact persistence, moderation, PDF upload, private preview, publication, and download.
- Browser checks of centered portal layout, navigation, experiments, and responsive layouts.

The managed browser disables WebGL. GPU appearance, laptop fidelity, camera choreography as perceived on physical devices, and real-device Core Web Vitals remain unverified. The model is custom reference-based geometry, not manufacturer CAD. No absolute guarantee of zero errors or photorealistic fidelity is made.

## CampusFlow source review

The actual repository was cloned and inspected, including StudentController, department / placement endpoints, the React application, IMPLEMENTATION_STATUS.md and UPGRADE_NOTES.md. The portfolio distinguishes persistent REST CRUD from browser-local academic demonstrations and UI-only authentication. No live deployment URL or invented project statistics are shown.
