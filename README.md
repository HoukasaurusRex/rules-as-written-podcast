<!-- markdownlint-disable MD041 MD033 -->
[![Build, Test & Deploy](https://github.com/HoukasaurusRex/rules-as-written-podcast/actions/workflows/build-test-deploy.yml/badge.svg)](https://github.com/HoukasaurusRex/rules-as-written-podcast/actions/workflows/build-test-deploy.yml)
[![D&D 5e SRD Updated](https://img.shields.io/github/last-commit/HoukasaurusRex/rules-as-written-podcast/master?path=src%2Fdata%2Fsrd-equipment.json&label=D%26D%205e%20SRD)](https://github.com/HoukasaurusRex/rules-as-written-podcast/commits/master/src/data/srd-equipment.json)

<br />
<p align="center">
  <a href="https://rulesaswrittenshow.com">
    <img src="public/images/raw-logo-fancy.webp" alt="Rules As Written" width="100">
  </a>

  <h1 align="center">Rules As Written</h1>

  <p align="center">
    Website and party tracker for the Rules As Written D&D podcast
    <br />
    <br />
    <a href="https://rulesaswrittenshow.com">Visit Site</a>
    &middot;
    <a href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues">Request Feature</a>
  </p>
  <p align="center">
    Have a question? <a mailto:"jt@rulesaswrittenshow.com">Drop us a line</a>
  </p>
</p>

## About

We're the first D&D podcast started in China and we love deep diving into the rules of the game and why we enjoy playing it.

Here we talk about the rules in the Dungeons and Dragons Player's Handbook and as many 5E expansions as we can afford.
We release new episodes weekly and range in topics from book section deep diving to interesting items and traps and everything in between.

The site features episode pages with an integrated audio player, a newsletter, GitHub Discussions-powered comments, and a collaborative Party Tracker for managing gold, inventory, and magic items during sessions.

![Rules as Written Map](public/raw-banner.jpg)

## Party Tracker

A collaborative D&D party management tool for tracking gold, inventory, and magic items in real-time.

**Features**: Per-denomination gold tracking (CP/SP/EP/GP/PP) with auto-split, inventory management with SRD autocomplete and category filtering (Weapons, Gear, Tools, Armor, Mounts), enriched item details (damage, AC, speed), magic item registry with attunement tracking, Loot Mode for post-encounter distribution, transaction ledger with undo, collaborative editing via D&D-themed party codes (ADJECTIVE-CREATURE-NUMBER), real-time sync, and mobile-first design. Item definitions backed by an `item_catalog` table ready for homebrew content.

**Tracked in**: [GitHub Project #17](https://github.com/users/HoukasaurusRex/projects/17) | v2 ideas in [Project #18](https://github.com/users/HoukasaurusRex/projects/18)

## Glossary

| Term | Meaning |
| ---- | ------- |
| **RAW** | Rules As Written -- interpreting D&D rules exactly as printed, without house rules. Also the podcast name. |
| **SRD** | System Reference Document -- the official open-licensed D&D 5e rules data. This project fetches equipment and magic item data from [dnd5eapi.co](https://www.dnd5eapi.co/) at build time for autocomplete. |
| **5e** | Fifth Edition of Dungeons & Dragons (2014), the ruleset this podcast covers. |
| **PHB** | Player's Handbook -- the core D&D 5e rulebook for players. |
| **DMG** | Dungeon Master's Guide -- the core D&D 5e rulebook for DMs. |
| **CP / SP / EP / GP / PP** | Copper, Silver, Electrum, Gold, and Platinum Pieces -- D&D currency denominations. 1 GP = 2 EP = 10 SP = 100 CP. 1 PP = 10 GP. |
| **Attunement** | A D&D mechanic where a character must bond with a magic item to use it. Each character can attune to at most 3 items. |

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | [Astro](https://astro.build/) 6 (hybrid SSR) with React islands |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 (CSS-first config) |
| Database | [Neon PostgreSQL](https://neon.tech/) via [Drizzle ORM](https://orm.drizzle.team/) |
| Hosting | [Netlify](https://netlify.com/) (SSR adapter, Functions, deploy previews) |
| Language | [TypeScript](https://www.typescriptlang.org/) strict mode |
| Testing | [Playwright](https://playwright.dev/) e2e regression tests |
| Analytics | [Umami](https://umami.is/) (self-hosted) |
| Comments | [giscus](https://giscus.app/) (GitHub Discussions) |
| Search | [Fuse.js](https://www.fusejs.io/) fuzzy autocomplete for SRD items |
| State | [nanostores](https://github.com/nanostores/nanostores) cross-island state |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v25.8.0+ (see `.nvmrc`)
- [Yarn](https://yarnpkg.com/) Berry (enabled via corepack)
- [Docker](https://www.docker.com/) (optional, for local Party Tracker database)

### Installation

```sh
corepack enable
yarn install
```

### Development

```sh
yarn dev
```

### Local Database (Party Tracker)

```sh
yarn db:up           # Start PostgreSQL in Docker
yarn db:push         # Apply schema
yarn db:seed-catalog # Seed item catalog with SRD equipment
yarn db:seed         # Seed sample party data
yarn db:studio       # Browse data in Drizzle Studio
```

### Build

```sh
yarn build    # Fetch content + SRD data + production build
yarn preview  # Serve production build locally
```

### Tests

```sh
yarn test:e2e  # Playwright regression tests
yarn check     # TypeScript type checking
```

## Project Structure

```text
├── .github/workflows/     CI/CD pipelines
├── drizzle/               Database migrations
├── e2e/                   Playwright test specs
├── netlify/functions/     Serverless API (subscribe, contact, party)
├── public/                Static assets (images, service worker, manifest)
├── docs/                  Architecture docs (schema diagrams)
├── scripts/               Build scripts (fetch Notion/SRD, seed catalog, backfill)
├── src/
│   ├── components/        Astro + React components
│   │   └── party/         Party Tracker islands
│   ├── content/           Episode markdown (generated from Notion)
│   ├── data/              SRD equipment + magic item JSON (generated)
│   ├── db/                Database schema
│   ├── layouts/           Page layouts
│   ├── pages/             Astro routes
│   ├── stores/            nanostores (episode + party state)
│   ├── styles/            Tailwind config + global CSS
│   └── utils/             Helpers (episodes, feed, currency, party codes)
├── astro.config.ts
├── drizzle.config.ts
├── netlify.toml
└── package.json
```

## Deployment

Netlify auto-deploys from `master`. Config in `netlify.toml`, publishes `dist/`.

### Deploy Previews

Each PR automatically gets:

- An isolated Neon database branch
- Drizzle migrations run against the branch
- A Netlify preview deploy with a clickable GitHub Deployment link
- Auto-cleanup of the DB branch and deployment when the PR closes

### CI

GitHub Actions runs on push/PR to `master`:

- TypeScript type checking (`yarn check`)
- Production build (`yarn build`)
- Playwright e2e regression tests

### Pre-commit

Husky runs `yarn check && yarn build` before each commit.

## Environment Variables

| Variable | Purpose |
| -------- | ------- |
| `NOTION_TOKEN` | Notion API token for fetching episode content |
| `NOTION_DB_ID` | Notion database ID containing episodes |
| `NETLIFY_DATABASE_URL` | Neon PostgreSQL pooled connection (Party Tracker runtime) |
| `NETLIFY_DATABASE_URL_UNPOOLED` | Neon PostgreSQL direct connection (Drizzle migrations) |
