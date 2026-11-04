# FingerFox — Architecture & Phase Plan

> This file is the source of truth. Updated at the end of every phase.

## 1. Architecture overview

```
Next.js (App Router, static generation)
├── Pages (SSG) — SEO-first, meaningful HTML without JS
├── Engine (framework-agnostic) — typing core, metrics, input adapters
├── Games (canvas 2D) — pure simulation + renderer + thin React mount
├── Features — stats, leaderboard, install prompt, consent, settings
└── PWA (Serwist) — offline play, install, background sync
```

**Key architectural decisions:**

| Decision | Rationale |
|---|---|
| Canvas 2D, no game engine | Games are 2D text games. A framework adds weight and learning curve for no gain. |
| Pure `game.ts` simulation | Determinism enables replays, ghosts, server-side anti-cheat verification. |
| React outside the hot loop | HUD updates via refs or throttled state. React reconciliation at 60fps would cause jank. |
| Seeded RNG (mulberry32) | Reproducible runs. Same seed + same inputs = same result. |
| IndexedDB via `idb` | Structured data, larger quota than localStorage, async. localStorage only for tiny flags (theme, consent). |
| Static generation | SEO, fast first load on phones, meaningful without JS. |
| Separate WS service for multiplayer | Serverless (Vercel) cannot hold persistent sockets. Phase 4 only. |

## 2. Folder tree

```
d:\nsp\
├── PLAN.md                       ← this file
├── AGENTS.md                     ← condensed rules for context resets
├── README.md
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
├── pnpm-lock.yaml
├── package.json
├── vitest.config.ts
├── playwright.config.ts
├── .env.example
├── config/
│   └── business.ts               ← legal placeholders, build fails if present in prod
├── docs/
│   ├── third-party.md            ← every dependency/SDK audit
│   ├── licenses.md               ← every font, image, sound, word list
│   └── mobile-input.md           ← mobile keyboard known limitations
├── public/
│   ├── manifest.webmanifest
│   ├── icons/                    ← 192, 512, 512-maskable
│   └── screenshots/              ← narrow + wide for install sheet
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← root layout, fonts, theme provider
│   │   ├── page.tsx              ← landing
│   │   ├── games/
│   │   │   ├── page.tsx          ← catalog
│   │   │   └── [slug]/
│   │   │       └── page.tsx      ← per-game page
│   │   ├── typing-test/
│   │   │   └── page.tsx          ← Zen Test landing
│   │   ├── leaderboard/
│   │   │   └── page.tsx
│   │   ├── learn/
│   │   │   ├── page.tsx
│   │   │   └── [guide]/
│   │   │       └── page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── refund/page.tsx
│   │   ├── cookies/page.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── api/                  ← Phase 3
│   │       └── runs/
│   ├── engine/
│   │   ├── input/
│   │   │   ├── types.ts          ← InputEvent type
│   │   │   ├── desktop-adapter.ts
│   │   │   ├── mobile-adapter.ts
│   │   │   └── detect-device.ts
│   │   ├── metrics/
│   │   │   ├── wpm.ts
│   │   │   ├── accuracy.ts
│   │   │   ├── consistency.ts
│   │   │   ├── per-key.ts
│   │   │   └── weak-key-model.ts ← EWMA per key
│   │   ├── content/
│   │   │   ├── word-lists/       ← frequency tiers
│   │   │   ├── quotes/           ← public domain
│   │   │   └── generators.ts     ← weighted by weak-key model
│   │   └── loop/
│   │       ├── game-loop.ts      ← fixed timestep RAF loop
│   │       └── rng.ts            ← mulberry32 seeded RNG
│   ├── games/
│   │   ├── registry.ts           ← single source of truth for game list
│   │   ├── types.ts              ← shared game interfaces
│   │   ├── zen-test/
│   │   │   ├── manifest.ts
│   │   │   ├── game.ts
│   │   │   ├── renderer.ts
│   │   │   ├── Game.tsx
│   │   │   └── __tests__/
│   │   ├── key-forge/
│   │   ├── word-rain/
│   │   ├── star-blaster/
│   │   ├── race-day/
│   │   ├── night-watch/
│   │   ├── slice/
│   │   ├── lane-runner/
│   │   ├── maze-keys/
│   │   ├── express-rush/
│   │   └── defuse/
│   ├── features/
│   │   ├── stats/
│   │   ├── leaderboard/
│   │   ├── install-prompt/
│   │   ├── consent/
│   │   └── settings/
│   ├── components/
│   │   └── ui/                   ← ChaiUI components (installed by CLI)
│   └── lib/
│       ├── db.ts                 ← IndexedDB wrapper
│       ├── fonts.ts              ← next/font setup
│       ├── seo.ts                ← metadata helpers
│       └── utils.ts
└── tests/
    ├── e2e/                      ← Playwright
    └── fixtures/
```

## 3. Dependencies

### Runtime (client)

| Package | Purpose | License | Gzip size (approx) |
|---|---|---|---|
| `next` | Framework, SSG, App Router | MIT | ~90 KB (framework, tree-shaken) |
| `react`, `react-dom` | UI library | MIT | ~45 KB |
| `idb` | IndexedDB wrapper | ISC | ~1.2 KB |
| `@serwist/next`, `serwist` | PWA service worker | MIT | ~15 KB |
| `motion` | Animations (Framer Motion successor) | MIT | ~18 KB (tree-shaken) |

### Runtime (server, Phase 3)

| Package | Purpose | License | Gzip size (approx) |
|---|---|---|---|
| `mongodb` | Database driver | Apache-2.0 | ~80 KB |
| `@upstash/redis` | Redis client for leaderboards | MIT | ~5 KB |
| `next-auth` | Auth.js for accounts | ISC | ~15 KB |
| `zod` | Schema validation | MIT | ~3 KB |
| `@upstash/ratelimit` | Rate limiting | MIT | ~2 KB |

### Dev

| Package | Purpose | License |
|---|---|---|
| `typescript` | Type checking | Apache-2.0 |
| `tailwindcss` v4 | Utility CSS | MIT |
| `@tailwindcss/postcss` | PostCSS plugin for TW v4 | MIT |
| `vitest` | Unit testing | MIT |
| `@playwright/test` | E2E testing | Apache-2.0 |
| `eslint`, `eslint-config-next` | Linting | MIT |
| `@lhci/cli` | Lighthouse CI | Apache-2.0 |
| `lucide-react` | Icons | ISC |

### ChaiUI (copied into project, not npm dependencies)

Installed via `npx shadcn@latest add @chaiui/<name>`. These are source files copied into `src/components/ui/`. No runtime dependency.

## 4. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Mobile keyboard input inconsistency | High | `beforeinput` + composition event handling + value diffing. Extensive testing on real devices. Document limitations. |
| Canvas performance on low-end phones | High | Cap DPR at 2, object pooling, batch draws, profile in Chrome DevTools mobile emulation. |
| ChaiUI component conflicts with TW v4 | Medium | Install theme first, test each component. ChaiUI uses TW v4 natively. |
| Lighthouse 95+ performance on mobile | Medium | Code splitting per game, lazy loading, self-hosted fonts, minimal JS on landing. |
| IndexedDB storage limits on Safari | Low | Keep data small (summaries, not raw logs). Prompt to create account for backup. |

## 5. Phase plan

### Phase 0: Foundation
- [x] Scaffold Next.js with pnpm, strict TypeScript, App Router, and Tailwind v4
- [x] Install ChaiUI theme, Button, and Card source components
- [x] Self-host Manrope, Montserrat, Onest, and Geist Mono through next/font/local
- [x] Build shared header, footer, responsive shell, and system dark/light themes
- [x] Add business configuration and production build validation
- [x] Add third-party, asset license, and mobile input documentation
- [x] Add CI for audit, lint, typecheck, and production build
- [ ] Capture visual screenshots and complete a real device accessibility review

### Phase 1: Engine + first 4 games
- [x] Deterministic prompt generation, pure simulation step, seeded RNG, and fixed-step loop utility
- [x] Desktop/mobile adapters, composition handling, visual viewport observation, Esc pause
- [x] WPM, raw WPM, accuracy, consistency, error-at-entry, and per-key metrics
- [x] Frequency lists and lowercase, capitals, punctuation, numbers, and symbols tiers
- [x] Zen Test, Key Forge, Word Rain, and Star Blaster routes on the shared typing engine
- [x] Local stats, per-key EWMA model, heatmap, export, and deletion controls
- [x] Manifest, offline shell service worker, metadata, sitemap, and robots route
- [x] Privacy, terms, refund, cookie, consent, and accessibility basics
- [ ] Registry acceptance tests and visual verification

### Phase 2: Remaining games
- [x] Add Race Day, Night Watch, Slice, Lane Runner, Maze Keys, Express Rush, and Defuse
- [x] Give each game a distinct content tier and mode descriptor
- [x] Add a learn index and four typing guides
- [ ] Build distinct game simulations/renderers, per-game 300+ word SEO pages, tests, and ghosts

### Phase 3: Accounts, leaderboards, anti-cheat
- [ ] Optional accounts (18+) - no identity provider or account data service configured
- [ ] `/api/runs` with zod validation - no run backend configured
- [ ] Redis leaderboards - no Redis service configured; UI clearly states rankings are unavailable
- [ ] Server-side replay verification
- [ ] Account deletion and export (guest local export/deletion are implemented)
- [ ] Full section 10 compliance after the account/data services and operator details exist

### Phase 4 (optional): Multiplayer
- [ ] Separate WebSocket service
- [ ] Private rooms, friend races
- [ ] Code Dash, Memory Flash

## 7. Current delivery boundary

The current implementation is a complete local guest practice release, not the full account/cloud product in phases 3-4. Production builds require real `NEXT_PUBLIC_*` business and domain values from `.env.example`; those values cannot be invented. The games currently share a deterministic text engine and differ by content tier/mode metadata rather than custom game-specific renderers. Visual screenshots, real-device checks, and automated registry tests remain open work.

## 6. Decisions log

| # | Decision | Reason | Date |
|---|---|---|---|
| 1 | Use mulberry32 for seeded RNG | Simple, fast, well-tested, fits in ~10 lines | 2026-10-31 |
| 2 | Canvas 2D without OffscreenCanvas | OffscreenCanvas has limited Safari support | 2026-10-31 |
| 3 | motion (framer-motion) for page animations | Required for ChaiUI components, tree-shakeable | 2026-10-31 |
| 4 | pnpm as package manager | Spec requirement, fast, strict | 2026-10-31 |
