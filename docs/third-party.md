# Third-party dependency review

Reviewed November 2, 2026. FingerFox does not load advertising, analytics, session replay, or social SDKs. The client stores guest data in the browser and does not send run summaries to a service.

| Package or service | Purpose | Data exposure | License |
| --- | --- | --- | --- |
| Next.js | Page rendering and static routes | Hosting provider may process routine requests | MIT |
| React / React DOM | User interface | None sent by the library | MIT |
| Tailwind CSS v4 and `@tailwindcss/postcss` | Styles and CSS compilation | Build time only | MIT |
| ChaiUI registry source | Button and card components; source is copied into `src/components/ui` | No runtime service | Component files retain their source notices; MIT-compatible source |
| Radix Slot | Polymorphic ChaiUI button | UI only | MIT |
| class-variance-authority, clsx, tailwind-merge | UI class composition | UI only | Apache-2.0 / MIT |
| Lucide React | ChaiUI button arrow icon | UI only | ISC |
| TypeScript, `@types/node`, `@types/react`, `@types/react-dom` | Type checking and editor types | Build time only | Apache-2.0 / MIT |
| ESLint, `eslint-config-next` | Static code checks | Build/CI only | MIT |
| Playwright | Local Chrome screenshot capture script; not loaded by the app | Runs only when explicitly invoked | Apache-2.0 |
| Manrope, Montserrat, Onest, Geist Mono | Self-hosted font files loaded through `next/font/local` | No external font request | SIL Open Font License 1.1 |
| IndexedDB and localStorage | Browser-native guest summaries, consent, round length, and appearance preference | Data remains on the device | Browser platform |
| CacheStorage `fingerfox-shell-v1` | Offline static shell | Static pages and assets only | Browser platform |

No Google Fonts CSS import remains. Run `pnpm audit` in CI. Review this list whenever a package or external service is added.
