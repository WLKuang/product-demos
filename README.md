# Interactive product demos

Three working front-end demos, each built from a short, founder-style brief using Claude Code.

| Demo | What it shows |
|------|---------------|
| **Membership CRM** (`/membership`) | Staff dashboard for a museum membership team: KPIs, searchable member table, member record panel, renewals workflow |
| **Venue-hire client portal** (`/venue-hire`) | Client-facing booking journey: spaces, four-step enquiry with a live quote and availability rules, booking tracker with deposit, contract, final numbers and balance |
| **Café operations dashboard** (`/ops`) | Morning dashboard for a three-shop bubble-tea chain: sales charts, stock levels and ordering, staff rota with shift swaps |

All organisations, people and figures are fictional. Nothing is saved: each demo resets when the page reloads.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The static site is written to `dist/`. Routes use a hash (`/#/membership`), so it works on any static host without extra configuration.

Every push to `main` rebuilds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

## Structure

- `src/ui/` – shared interface parts used by every demo (app frames, data table, tooltips, dialogs, charts)
- `src/demos/<name>/` – one folder per demo: fictional data, a small store for its state, and its screens
- `src/demos/registry.ts` – the brief and notes shown for each demo on the portfolio page

Built with React, TypeScript, Vite and Tailwind CSS.
