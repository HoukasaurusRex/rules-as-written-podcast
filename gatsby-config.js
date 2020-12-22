module.exports = {
  siteMetadata: {
    title: 'Rules As Written',
    description:
      'A weekly podcast where we talk about the rules in as many D&D 5E books we can afford to help you level up your player game.',
    author: '@HoukasaurusRex',
  },
  plugins: [
    '@chakra-ui/gatsby-plugin',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#bb4430',
        theme_color: '#bb4430',
        display: 'minimal-ui',
        icon: 'src/images/icon.png',
      },
    },
    'gatsby-plugin-offline',
  ],
}
