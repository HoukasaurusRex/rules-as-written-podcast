import React, { useState, useEffect } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { Box, useColorModeValue } from '@chakra-ui/react'
import SEO from '../components/seo'
import Hero from '../components/hero'
import Episodes from '../components/episodes'
import Parser from 'rss-parser'
import { feedData, feedItem } from '../types'

const data: feedData = {}

const parser: Parser<feedData, feedItem> = new Parser()

const fetchFeedData = async (setFeedData: React.Dispatch<React.SetStateAction<feedData>> ) => {
  const feedData = await parser.parseURL('https://anchor.fm/s/44a4277c/podcast/rss')
  setFeedData(feedData)
}

const IndexPage = () => {
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
  const [feedData, setFeedData] = useState(data)
  useEffect(() => {
    fetchFeedData(setFeedData)
  }, [])
  return (
    <>
      <SEO title="Home" />
      <Hero
        title={site.siteMetadata.title}
        description={site.siteMetadata.description}
      />
      <Box as="main" position="relative" bgColor={useColorModeValue('white', 'gray.800')}>
        <Episodes feedData={feedData} />
      </Box>
    </>
  )
}

export default IndexPage
