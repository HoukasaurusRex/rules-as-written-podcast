import React from 'react'
import {graphql} from 'gatsby'
import IndexPage from '@vojtaholik/gatsby-theme-simplecast/src/pages/index'

export default function Index({data: {allEpisode, allMarkdownRemark}}) {
  return <IndexPage data={{allEpisode, allMarkdownRemark}} />
}

export const indexQuery = graphql`
  query {
    allSite {
      nodes {
        siteMetadata {
          image
        }
      }
    }
    allEpisode {
      totalCount
      nodes {
        id
        title
        description
        number
        enclosure_url
        spotify_url
        apple_podcasts_url
        google_podcasts_url
        patreon_url
        fields {
          slug
        }
      }
    }
    allMarkdownRemark {
      edges {
        node {
          html
          frontmatter {
            id
            title
            resources
            guestSummary
            guestName
            guestPhoto
            image
          }
        }
      }
    }
  }
`
