/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import Episode from "gatsby-theme-simplecast/src/templates/episode"

export default function Index({ data: { allEpisode, allMarkdownRemark } }) {
  const MarkdownForLatestEpisode = allMarkdownRemark.edges.filter(
    Markdown => Markdown.node.frontmatter.id === allEpisode.nodes[0].id
  )

  const data = useStaticQuery(graphql`
    {
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
  `)
  return (
    <Episode
      data={{
        episode: data.allEpisode.nodes[0],
        markdownRemark:
          MarkdownForLatestEpisode[0] && MarkdownForLatestEpisode[0].node,
      }}
    />
  )
}
