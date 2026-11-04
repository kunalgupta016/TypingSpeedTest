# FingerFox

FingerFox is a free, guest-first typing practice site built with Next.js. It includes eleven one-minute typing games, seeded prompt generation, lowercase/capital/punctuation/number/symbol content tiers, per-key personalization, local stats, data export and deletion, and an offline app shell.

Guest run summaries and aggregated per-key metrics stay in browser storage. There are no accounts, cloud scores, advertising, or analytics in this release. The leaderboard page explains that online rankings are not available.

## Run locally

Requirements: Node.js 22 and pnpm 12.

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Quality checks

```sh
pnpm lint
pnpm typecheck
pnpm audit
pnpm build
```

For the visual review set, run `pnpm dev` and then `pnpm capture:screenshots` in another terminal. The capture script uses an installed Google Chrome and saves dark/light screenshots in `docs/screenshots/`.

For Vercel deployments, set the following environment variables in Project Settings > Environment Variables:

- `NEXT_PUBLIC_SITE_URL` = your deployed HTTPS URL, for example `https://fingerfox.vercel.app`
- `NEXT_PUBLIC_LEGAL_NAME` = your public legal name or studio name
- `NEXT_PUBLIC_BUSINESS_ADDRESS` = your public postal or remote-operation address
- `NEXT_PUBLIC_CONTACT_EMAIL` = a monitored support email
- `NEXT_PUBLIC_GRIEVANCE_CONTACT` = a privacy or complaint contact email

The footer, contact page, metadata, sitemap, and robots file use these settings. `.env.example` shows the Vercel-ready defaults used for local builds.

## Product boundaries

- Scores and per-key practice history are local to one browser profile.
- Raw key events are held in memory during a round and discarded after computing the summary.
- No account, age-gate, payment, or online leaderboard backend is configured.
- Offline support caches the static shell; first use still needs a network connection.
- Appearance follows the operating system by default. Choose System, Light, or Dark in Settings.

See [PLAN.md](./PLAN.md), [docs/third-party.md](./docs/third-party.md), [docs/licenses.md](./docs/licenses.md), and [docs/mobile-input.md](./docs/mobile-input.md).

See [docs/game-modes.md](./docs/game-modes.md) for each game's rules and [docs/gameplay-research.md](./docs/gameplay-research.md) for the interaction references behind the modes.
