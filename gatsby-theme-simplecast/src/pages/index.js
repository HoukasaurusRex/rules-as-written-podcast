/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql, useStaticQuery } from "gatsby"
import Episode from "../templates/episode"

export default function Index() {
  const { site, allEpisode, allMarkdownRemark } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          image
          episodeImage
          apple_podcasts_url
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
  allEpisode.nodes = allEpisode.nodes.sort((a, b) => b.number - a.number)
  const MarkdownForLatestEpisode = allMarkdownRemark.edges.filter(
    Markdown => Markdown.node.frontmatter.id === allEpisode.nodes[0].id
  )
  return (
    <Episode
      data={{
        episode: allEpisode.nodes[0],
        markdownRemark: MarkdownForLatestEpisode[0]?.node,
        site
      }}
    />
  )
}
