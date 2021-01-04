import React, { useState, useEffect } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { Box, useColorModeValue } from '@chakra-ui/react'
import fetchFeedData from '../fetch-feed-data'
import SEO from '../components/seo'
import Hero from '../components/hero'
import Episodes from '../components/episodes'
import { feedData } from '../types'

const IndexPage: () => JSX.Element = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  )
  const data: feedData = {}
  const [fd, setFeedData] = useState(data)
  useEffect(() => {
    fetchFeedData().then(d => setFeedData(d))
  }, [])
  return (
    <>
      <SEO title="Home" />
      <Hero title={site.siteMetadata.title} description={site.siteMetadata.description} />
      <Box
        as="main"
        position="relative"
        bgColor={useColorModeValue('white', 'gray.800')}
        minHeight="50vh"
        paddingBottom="30px"
        _before={{
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: '#bb4430',
          opacity: '0.8',
          transform: 'skew(-70deg)',
          transformOrigin: 'top'
        }}
      >
        <Episodes feedData={fd} />
      </Box>
    </>
  )
}

export default IndexPage
