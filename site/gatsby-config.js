require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: 'Rules as Written',
    description: 'A weekly podcast where we talk about the rules in as many D&D 5E books we can afford to help you level up your player game.',
    author: '@HoukasaurusRex',
    siteUrl: 'https://rulesaswrittenshow.com',
    lang: 'en',
    keywords: ['D&D', "Player's Handbook", 'Dungeons and Dragons', 'Tabletop RPG', 'Podcast'],
    episodeImage: 'https://res.cloudinary.com/jthouk/image/upload/v1627979106/Rules%20as%20Written/lazy-bard_esoxs7.gif',
    image: 'https://rulesaswrittenshow.com/raw-banner.jpg'
  },
  plugins: [
    {
      resolve: '@vojtaholik/gatsby-theme-simplecast',
      options: {
        simplecastApiSecret: process.env.SIMPLECAST_API_SECRET,
        //podcastId: process.env.PODCAST_ID,
        markdownPath: 'content/episodes',
        episodeSlug: 'show',
        rssFeedURL: 'https://anchor.fm/s/44a4277c/podcast/rss',
        headerImageHeight: [300, 400],
        spotify_url: "https://open.spotify.com/show/3QsthThGhfigIwbGHauPfQ",
        apple_podcasts_url: "https://podcasts.apple.com/us/podcast/rules-as-written-a-d-d-podcast/id1545377455",
        google_podcasts_url: "https://podcasts.google.com/feed/aHR0cHM6Ly9hbmNob3IuZm0vcy80NGE0Mjc3Yy9wb2RjYXN0L3Jzcw",
        patreon_url: 'https://www.patreon.com/RulesAsWritten'
      },
    },
    `gatsby-plugin-theme-ui`,
  ],
}
