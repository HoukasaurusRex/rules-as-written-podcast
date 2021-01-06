export default {
  siteMetadata: {
    title: 'Rules As Written',
    description:
      'A weekly podcast where we talk about the rules in as many D&D 5E books we can afford to help you level up your player game.',
    author: '@HoukasaurusRex'
  },
  plugins: [
    '@chakra-ui/gatsby-plugin',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `${__dirname}/src/data/`
      }
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Rules As Written',
        short_name: 'RAW',
        start_url: '/',
        background_color: '#1A202C',
        theme_color: '#bb4430',
        display: 'minimal-ui',
        icon: 'src/images/icon.png'
      }
    },
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        workboxConfig: {
          runtimeCaching: [
            {
              urlPattern: /\/$/,
              handler: 'StaleWhileRevalidate'
            },
            {
              urlPattern: /\.mp3$/,
              handler: 'CacheFirst'
            },
            {
              // Use cacheFirst since these don't need to be revalidated (same RegExp
              // and same reason as above)
              urlPattern: /(\.js$|\.css$|static\/)/,
              handler: 'CacheFirst'
            },
            {
              // page-data.json files, static query results and app-data.json
              // are not content hashed
              urlPattern: /^https?:.*\/page-data\/.*\.json/,
              handler: 'StaleWhileRevalidate'
            },
            {
              // Add runtime caching of various other page resources
              urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
              handler: 'StaleWhileRevalidate'
            },
            {
              // Google Fonts CSS (doesn't end in .css so we need to specify it)
              urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
              handler: 'StaleWhileRevalidate'
            },
            {
              urlPattern: /^https?:\/\/api\.houk\.space\/feed-to-json.*/,
              handler: 'CacheFirst'
            }
          ]
        }
      }
    }
  ]
}
