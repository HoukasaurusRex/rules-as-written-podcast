module.exports = ({ markdownPath = `${__dirname}/content/episodes`, disqusShortname, mcEndpoint }) => ({
  siteMetadata: {
    title: `Podcast Name`,
    description: `Podcast description.`,
    author: `@vojtaholik`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    {
      resolve: 'gatsby-plugin-theme-ui',
      options: {
        preset: require('./src/theme'),
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: markdownPath,
        name: `episodes`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-theme-simplecast`,
        short_name: `simplecast`,
        start_url: `/`,
        background_color: `#9A3C31`,
        theme_color: `#9A3C31`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-disqus`,
      options: {
          shortname: disqusShortname
      }
    },
    {
      resolve: 'gatsby-plugin-mailchimp',
        options: {
            endpoint: mcEndpoint,
            timeout: 15000,
        },
    }
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
})
