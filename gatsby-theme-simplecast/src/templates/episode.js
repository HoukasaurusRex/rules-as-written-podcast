/** @jsx jsx */
import { jsx, Text, Box, Heading, Image } from "theme-ui"
import { graphql } from "gatsby"
import { EpisodeConsumer } from "../components/context"
import SEO from "../components/seo"
import Header from "../components/header"
import Aside from "../components/aside"
import { SkipNavContent } from "@reach/skip-nav"
import { Disqus } from 'gatsby-plugin-disqus'
import Newsletter from '../components/newsletter'

const getDescriptionFromHTML = (html) =>  typeof DOMParser !== 'undefined'
    ? new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector('p')
      .textContent
    : html
      .match(/<p>(.*?)<\/p>/)[0]
      .replace(/(<p>|<\/p>)/g, '')



function EpisodeTemplate({ data: { episode, markdownRemark, site } }) {
  const image = markdownRemark?.frontmatter?.image || site?.siteMetadata?.episodeImage || site?.siteMetadata?.image
  const markdown = markdownRemark
  const url =  typeof window !== 'undefined' && new URL(window.location.href)
  const pathname = url && url.pathname
  const description = getDescriptionFromHTML(episode.description)
  return (
    <EpisodeConsumer>
      {context => (
        <div>
          <SEO
            title={episode.title && episode.title}
            image={image}
            description={description && description}
            pathname={pathname && pathname}
          />
          <div
            sx={{
              display: "flex",
              flexDirection: ["column", "row"]
            }}
          >
            <SkipNavContent sx={{ maxWidth: ["100%", 650] }}>
              <Header context={context} episode={episode} image={image} />
              <article>
                <Heading>Show Notes</Heading>
                {description &&
                  <Text as="p" sx={{ pt: 30 }}>{description}</Text>
                }
                {markdown && (
                  <Box sx={{ pt: 30 }} dangerouslySetInnerHTML={{ __html: markdown.html }} />
                )}
              </article>
              <Box as="footer" sx={{ px: 30, textAlign: 'center' }}>
                <Text as="p" sx={{ mb: 30 }} >
                  Can't get enough of us?
                  <br/>
                  Stay on top of the latest releases and extra goodies by subscribing to our weekly newsletter!
                </Text>
                <Newsletter />
              </Box>
              <Box sx={{ p: 30  }}>
                <Disqus config={{ url: url.href, identifier: episode.id, title: episode.title }}/>
              </Box>
            </SkipNavContent>
            <Aside markdown={markdown} />
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
        patreon_url
      }
    }
    episode(id: { eq: $id }) {
      id
      title
      description
      number
      enclosure_url
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
        guestPhoto
        image
      }
    }
  }
`
