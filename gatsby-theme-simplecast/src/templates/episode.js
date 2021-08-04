/** @jsx jsx */
import { jsx, Text } from "theme-ui"
import { graphql } from "gatsby"
import { EpisodeConsumer } from "../components/context"
import SEO from "../components/seo"
import Header from "../components/header"
import Aside from "../components/aside"
import { SkipNavContent } from "@reach/skip-nav"

function EpisodeTemplate({ data: { episode, markdownRemark, site } }) {
  const image = markdownRemark?.frontmatter?.image?.childImageSharp?.original?.src || site?.siteMetadata?.episodeImage || site?.siteMetadata?.image
  const markdown = markdownRemark && markdownRemark
  const { spotify_url, apple_podcasts_url, google_podcasts_url, patreon_url } = episode
  const pathname = typeof window !== 'undefined' && new URL(window.location.href).pathname
  const rawHTMLDescription = episode.description
  const doc = typeof DOMParser !== 'undefined' && new DOMParser().parseFromString(rawHTMLDescription, "text/html");
  const description = doc ? doc.querySelector('p').textContent : rawHTMLDescription
  return (
    <EpisodeConsumer>
      {context => (
        <div>
          <SEO
            title={episode.title && episode.title}
            image={image}
            description={description}
            pathname={pathname}
          />
          <div
            sx={{
              display: "flex",
              flexDirection: ["column", "row"],
            }}
          >
            <SkipNavContent sx={{ maxWidth: ["100%", 710] }}>
              <Header context={context} episode={episode} image={image} />
              <article>
                {description &&
                    <Text>{description}</Text>
                }
                {markdown && (
                  <div dangerouslySetInnerHTML={{ __html: markdown.html }} />
                )}
              </article>
            </SkipNavContent>
            <Aside markdown={markdown} spotify_url={spotify_url} apple_podcasts_url={apple_podcasts_url} google_podcasts_url={google_podcasts_url} patreon_url={patreon_url} />
          </div>
        </div>
      )}
    </EpisodeConsumer>
  )
}

export default EpisodeTemplate

export const episodeQuery = graphql`
  query($id: String!) {
    site {
      siteMetadata {
        image
        episodeImage
      }
    }
    episode(id: { eq: $id }) {
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
    markdownRemark(frontmatter: { id: { eq: $id } }) {
      html
      frontmatter {
        id
        title
        resources
        guestName
        guestSummary
        guestPhoto {
          childImageSharp {
            fluid(maxWidth: 200) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        image {
          childImageSharp {
            original {
              src
            }
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`
