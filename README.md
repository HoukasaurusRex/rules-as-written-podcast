[![Netlify Status](https://api.netlify.com/api/v1/badges/bbdf7d4d-7242-4e9f-a4fe-9e1fd523fa3e/deploy-status)](https://app.netlify.com/projects/rules-as-written/deploys)
[![CI](https://github.com/HoukasaurusRex/rules-as-written-podcast/actions/workflows/ci.yml/badge.svg)](https://github.com/HoukasaurusRex/rules-as-written-podcast/actions/workflows/ci.yml)
[![Contributors][contributors-shield]][contributors-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Twitter: HoukasaurusRex][twitter-shield]][twitter-url]

<br />
<p align="center">
  <a href="https://rulesaswrittenshow.com">
    <img src="public/images/raw-logo-fancy.webp" alt="Logo" height="80">
  </a>

  <h1 align="center">Rules As Written</h1>

  <p align="center">
    Static site for the Rules As Written D&D podcast
    <br />
    <br />
    <a href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues">Report Bug</a>
    ·
    <a href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues">Request Feature</a>
  </p>
</p>

## About the Project

We're the first (and only) D&D podcast based in China and we love deep diving into the rules of the game and why we enjoy playing it.

Here we talk about the rules in the Dungeons and Dragons Player's Handbook and as many 5E expansions as we can afford.
We release new episodes weekly and range in topics from book section deep diving to interesting items and traps and everything in between.

* Check us out at: https://rulesaswrittenshow.com
* Support us at: https://www.patreon.com/RulesAsWritten
* Contact us at: toby@rulesaswrittenshow.com

New episodes every Sunday!

[![][product-screenshot]][product-url]

## Party Tracker MVP

A collaborative D&D party management tool that lets groups track gold, inventory, and magic items in real-time during sessions.

**Features**: Per-denomination gold tracking (CP/SP/EP/GP/PP) with auto-split, inventory management with SRD autocomplete, magic item registry with attunement tracking, Loot Mode for post-encounter distribution, transaction history with undo, collaborative editing via D&D-themed party codes, real-time sync, and mobile-first design.

**Stack**: Astro 6 hybrid mode, React islands, Tailwind CSS v4, Netlify Functions, Neon PostgreSQL via Drizzle ORM.

**Plan**: See [implementation plan](.claude/plans/deep-tumbling-donut.md) | Tracked in [GitHub Project #17](https://github.com/users/HoukasaurusRex/projects/17) (issues #44–#58)

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) v25.8.0+ (see `.nvmrc`)
* [Yarn](https://yarnpkg.com/) Berry (enabled via corepack)

### Installation

```sh
corepack enable
yarn install
```

### Development

```sh
yarn dev
```

### Build

```sh
yarn build
```

### Tests

```sh
# Run Playwright regression tests
yarn test:e2e
```

## Tech Stack

* [Astro](https://astro.build/) 6 with React islands
* [TypeScript](https://www.typescriptlang.org/) strict mode
* [Playwright](https://playwright.dev/) for e2e testing
* [Umami](https://umami.is/) for analytics
* [giscus](https://giscus.app/) for comments

## Contact

* JT Houk - [@HoukasaurusRex](https://twitter.com/HoukasaurusRex)

[contributors-shield]: https://img.shields.io/github/contributors/HoukasaurusRex/rules-as-written-podcast.svg?style=flat-square
[contributors-url]: https://github.com/HoukasaurusRex/rules-as-written-podcast/graphs/contributors
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/jt-houk/
[product-screenshot]: public/images/raw-logo-fancy.webp
[product-url]: https://rulesaswrittenshow.com
[twitter-shield]: https://img.shields.io/twitter/follow/HoukasaurusRex.svg?style=social
[twitter-url]: https://twitter.com/HoukasaurusRex
[issues-url]: https://github.com/HoukasaurusRex/rules-as-written-podcast/issues
