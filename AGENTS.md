# FingerFox — Agent Rules (survives context resets)

> Condensed from spec sections 4, 7, 9, 10 and 11. Read this first on every context reset.

## Engine rules (section 4)

### 4.1 Determinism
- Every game simulation is a pure function of `(seed, fixed-timestep ticks, input events)`.
- Seeded RNG (mulberry32). Never call `Math.random()` or `Date.now()` inside `game.ts`.
- This enables replays, ghosts, and server-side verification.

### 4.2 Input layer
- One adapter emits: `{ char, t, kind: 'char' | 'backspace' | 'space' | 'enter' | 'escape' }`.
- Desktop: `keydown` with `event.key`, ignore modifiers and repeats.
- Mobile: hidden `<textarea>` with `autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="done"` and `font-size: 16px+`.
  - Focus from real user gesture. Refocus on tap.
  - Derive characters from `beforeinput`/`input` by diffing field value.
  - Handle `compositionstart/update/end`.
  - Handle `visualViewport` resize.
  - `touch-action: manipulation`, `overscroll-behavior: none`, `user-select: none`.
  - Tap targets 44px minimum. Portrait first. Must work at 360x640.

### 4.3 Metrics
- WPM = (correct chars / 5) / minutes. Also raw WPM, accuracy %, consistency (CV of inter-key intervals), per-key latency and error rate.
- A character is correct only if correct at the moment typed. Corrected mistakes still count as errors.
- Show formula in tooltip on results screen.

### 4.4 Weak-key model
- EWMA of latency and error rate per key, stored locally in IndexedDB.
- Every word generator takes `weights` from this model to over-sample weak keys.
- Keyboard heatmap on stats page. Colour by meaning (text/outline, not filled pills).

### 4.5 Content
- Word lists by frequency tier, structure ready for more languages.
- Quotes only from public domain. Record in `docs/licenses.md`.
- Tiers: lowercase, capitals, punctuation, numbers, symbols.

## Performance budgets (section 7)

- Lighthouse: Performance 95+, Accessibility 95+, SEO 100, Best Practices 95+
- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Initial JS on landing < 150 KB gzipped
- Each game chunk < 120 KB gzipped
- Fonts self-hosted via `next/font` with `display: swap`
- Game loop: 60 fps on mid-range phone, no allocations in loop, cap DPR at 2

## Scalability and anti-cheat (section 9)

- Stateless Next.js. State in IndexedDB (guest), MongoDB (accounts), Redis (leaderboards).
- `POST /api/runs`: validate with zod, size limit, rate limit per IP hash and per user, idempotency key.
- Leaderboards in Redis sorted sets: `lb:{game}:{period}`.
- Client submits `{ seed, compact keystroke log }`. Server replays and recomputes.
- Reject sustained impossible speeds or perfectly uniform inter-key timing.
- Separate leaderboards for physical keyboard vs touch input.
- MongoDB indexes: `(userId, game, createdAt)`. Keystroke logs TTL 30 days.
- Per-game feature flag (`enabled` in manifest).
- Structured logs with no personal data.

## Compliance checklist (section 10) — MANDATORY

1. **Privacy policy & ToS.** Real pages, plain language, matches actual code behavior.
2. **Refund & Cookie policies.** `/refund` says free. `/cookies` lists every cookie/storage key.
3. **Cookie consent.** Essential-only default. Accept and Reject with equal visual weight. Sign-up: Terms checkbox (unticked), marketing checkbox (unticked), store consent text+version+timestamp.
4. **Data minimization.** Only: handle, email (accounts), run summaries, aggregated per-key stats. Keystroke logs only for leaderboard runs, deleted after 30 days. No IP storage, no fingerprinting.
5. **Audit third-party SDKs.** Maintain `docs/third-party.md`. No ad/tracking SDKs. Self-hosted fonts. `pnpm audit` in CI.
6. **No dark patterns.** No guilt copy, no fake countdowns, no pre-ticked boxes, no hard-to-find cancel/delete. Install prompts dismissible. No fees in v1.
7. **No fake reviews.** No testimonials until real. No unsupported claims. `LiveDot` only for real live data.
8. **Accessibility.** Meaningful alt text. WCAG AA contrast (4.5:1 / 3:1). Errors not color-only. Canvas has accessible name. `aria-live="polite"` for periodic updates. No flashing >3/sec. Honour `prefers-reduced-motion`. Game speed setting.
9. **Keyboard navigation.** Skip link, visible focus, logical tab order, Esc pauses games, no keyboard traps. Footer/contact show business details.
10. **Age consent.** Accounts 18+ only. Neutral age prompt, no pre-selected value. Under 18: guest only (data on device). No tracking/ads for children.
11. **Unsubscribe.** Transactional only in v1. Any marketing email needs opt-in + one-click unsubscribe + `List-Unsubscribe` header.
12. **Licensed assets.** OFL fonts, self-hosted. Lucide icons or original SVG. Sounds via WebAudio or CC0. Public domain quotes. Every asset in `docs/licenses.md`.
13. **Data deletion.** Settings: "Delete account and data" with `ConfirmDialog` + `typeToConfirm`. "Export data" (JSON). Guests: "Clear local data". Request address on `/privacy`.

## ChaiUI design rules (section 11) — NON-NEGOTIABLE

### Install
1. Add registry to `components.json`: `"registries": { "@chaiui": "https://ui.chaicode.com/r/{name}.json" }`
2. Install theme: `npx shadcn@latest add @chaiui/chaiui`
3. Install components individually: `npx shadcn@latest add @chaiui/<name>`
4. Swap `<a>` for `next/link` in blocks
5. Remove Google Fonts `@import`, use `next/font` instead

### Color rules
- Dark default: `oklch(0.145 0 0)`, pure neutral greys.
- Accent = cream highlight for highlighted phrases and occasional active state only.
- **Orange is NEVER a fill.** Allowed only on: logo, `hover:text-brand` on links, animated badge glint, 10% footer hairline, segmented control dark-brown active fill.
- No orange buttons, headings, ticks, progress bars, or badges.
- Meaning via text/outline: green=correct/done, red=wrong, yellow=medium, purple=special. Never filled status pills.

### Typography
- Manrope: everything (body, headings)
- Montserrat: card titles, prices, card buttons, highlight phrase
- Onest: wordmark only
- Geist Mono: typing text in games

### Sizing
- Hero h1: `text-[42px] md:text-6xl lg:text-7xl font-semibold tracking-tight`
- Page title: `text-2xl sm:text-3xl font-medium`, centred
- Section h2: `text-2xl sm:text-[30px] font-medium`
- Lead: `text-base md:text-xl text-neutral-400`

### Layout & Components
- One highlight phrase per paragraph (Montserrat, medium, tight tracking, capitalize, cream)
- Cards: warm hairline, faint fill, blur, no shadow, `sm:opacity-90 hover:opacity-100`
- Page width: `max-w-6xl` with `p-6 sm:p-12`
- Buttons: one solid per screen (asymmetric corners, white, ArrowUpRight), outline beside it
- Navbar: sticky, transparent, blurs after scroll, `inline` layout
- Motion: 200-300ms hovers, reveal on scroll once, honour `prefers-reduced-motion`
- Copy: no em dashes, sentence case, no all-caps eyebrows

### Game canvas surface (controlled exception)
- Neutral dark background, white/neutral text
- Cream for current target/active character
- Green for correct, red for wrong + underline
- Particles: white or cream only
- HUD: plain text, not filled pills
- No orange anywhere in canvas

### Verification checklist (run before finishing UI work)
- [ ] Dark and light themes working
- [ ] 390px width, no horizontal scroll
- [ ] Search code for em dashes (—)
- [ ] Search code for `bg-orange` and `#FF7D0C` fills
- [ ] Screenshots of landing, catalog, one game, results, leaderboard in both themes

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
