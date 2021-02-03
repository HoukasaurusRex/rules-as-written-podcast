[![Netlify Status][netlify-shield]][netlify-url]
[![Contributors][contributors-shield]][contributors-url]
[![HitCount][hitcount-shield]][hitcount-url]
[![Language grade: JavaScript][lgtm-shield]][lgtm-url]
[![FOSSA Status][fossa-shield]][fossa-url]
[![David Dependencies Status][dependencies-shield]][dependencies-url]
[![License: MIT][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Twitter: HoukasaurusRex][twitter-shield]][twitter-url]

<br />
<p align="center">
  <a href="https://rulesaswritten.com">
    <img src="src/images/icon.png" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">Rules As Written</h3>

  <p align="center">
    Static site for the Rules As Written podcast
    <br />
    <br />
    <a href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues">Report Bug</a>
    ·
    <a href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues">Request Feature</a>
  </p>
</p>

## About the Project

[![][product-screenshot]][product-url]

### Built With

* [Gatsby](https://gatsbyjs.com/)
* [Chakra UI](https://chakra-ui.com/)

## ☕️ Getting Started

To get it running locally, install dependencies with yarn and run the commands

### Prerequisites

* yarn

```sh
npm install yarn@latest -g
```

### Installation

```sh
# Install dependencies
yarn install

# Run local dev server
yarn dev
```

### YouTube Pipeline

* Playlist ID: UUpqh72Jl2K09HvKBiqMixAA
* GET https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=UUpqh72Jl2K09HvKBiqMixAA&key=[YOUR_API_KEY]
  Authorization: Bearer [YOUR_ACCESS_TOKEN]
  Accept: application/json

## 🗺 Roadmap

* [x] Add external cast apps icons
* [x] Fix nightmode ssr in main bg
* [x] Episode page w/ transcript and playback card
* [x] Performance update
* [ ] Upcoming features page
* [ ] Add commenting
* [ ] About page
* [ ] Parse description from rss
* [ ] Send a voice message https://anchor.fm/rules-as-written/message
* [ ] All episodes page
* [ ] Paginate episodes list on home
* [ ] Mark Played
* [ ] Save playback state
* [ ] Debounce updateTime events
* [ ] Show notes expand
* [ ] Queue episodes
* [ ] Sticky playback to nav on episode page
* [ ] Highlight transcript section as it plays
* [ ] Click transcript section to jump audio
* [ ] Add D&D themed 404
* [ ] Fun playback animation
* [ ] Add Newsletter
* [ ] Future episodes page
* [ ] Create Gatsby podcast theme
* [x] Fetch metadata on build
* [x] Fix linting (ugh)

## 🛠 Contributing

Want to make a change? Any contributions you make are **greatly appreciated**.

Check out the [issues page][issues-url]

1. Clone the repo
2. Create your Feature Branch (`gco -b release/my-project`)
3. Commit your Changes (`git commit -m add: small addition`)
4. Push to the Branch (`git push origin release/my-project`)
5. Open a Pull Request

## ✏️ Contact

* JT Houk - [@HoukasaurusRex](https://twitter.com/HoukasaurusRex)

[![FOSSA Status][fossa-scan]][fossa-url]

[logo]: src/images/icon.png
[url]: https://rulesaswrittenshow.com
[github-url]: https://github.com/HoukasaurusRex
[netlify-shield]: https://api.netlify.com/api/v1/badges/bbdf7d4d-7242-4e9f-a4fe-9e1fd523fa3e/deploy-status
[netlify-url]: https://app.netlify.com/sites/rules-as-written/deploys
[contributors-shield]: https://img.shields.io/github/contributors/HoukasaurusRex/rules-as-written-podcast.svg\?style\=flat-square
[contributors-url]: https://github.com/HoukasaurusRex/rules-as-written-podcast/graphs/contributors
[hitcount-shield]: https://hits.dwyl.com/HoukasaurusRex/jthoukspace.svg
[hitcount-url]: https://hits.dwyl.com/HoukasaurusRex/jthoukspace
[dependencies-shield]: https://david-dm.org/HoukasaurusRex/rules-as-written-podcast.svg
[dependencies-url]: https://david-dm.org/HoukasaurusRex/rules-as-written-podcast
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg\?style\=flat-square\&logo\=linkedin\&colorB\=555
[linkedin-url]: https://www.linkedin.com/in/jt-houk/
[product-screenshot]: https://source.unsplash.com/600x300/\?nature,water
[product-url]: https://rulesaswrittenshow.com
[lgtm-shield]: https://img.shields.io/lgtm/grade/javascript/g/HoukasaurusRex/rules-as-written-podcast.svg\?logo\=lgtm\&logoWidth\=18\&style\=flat-square
[lgtm-url]: https://lgtm.com/projects/g/HoukasaurusRex/rules-as-written-podcast/context:javascript
[fossa-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2FHoukasaurusRex%2Frules-as-written-podcast.svg\?type\=shield\&style\=flat-square
[fossa-url]: https://app.fossa.com/projects/git%2Bgithub.com%2FHoukasaurusRex%2Frules-as-written-podcast\?ref\=badge_shield
[fossa-scan]: https://app.fossa.com/api/projects/git%2Bgithub.com%2FHoukasaurusRex%2Frules-as-written-podcast.svg\?type\=large
[twitter-shield]: https://img.shields.io/twitter/follow/HoukasaurusRex.svg\?style\=social
[twitter-url]: https://twitter.com/HoukasaurusRex
[issues-url]: https://github.com/HoukasaurusRex/rules-as-written-podcast/issues
