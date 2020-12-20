import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { Box } from '@chakra-ui/react'
import SEO from "../components/seo"
import Hero from '../components/hero'
import Episodes from '../components/episodes'
import AudioCard from '../components/audio-card'

const IndexPage = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  )
  return (
    <>
      <SEO title="Home" />
      <Hero title={site.siteMetadata.title} description={site.siteMetadata.description}/>
      <Box as="main" marginTop="50px">
        <Episodes/>
      </Box>
    </>
  )
}

export default IndexPage
