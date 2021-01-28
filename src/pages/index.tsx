import React, { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import fetchFeedData from '../fetch-feed-data'
import SEO from '../components/seo'
import Hero from '../components/hero'
import Episodes from '../components/audio-cards'
import { feedData } from '../../types/media-types'
import metadata from '../data/rss.json'

const IndexPage: () => JSX.Element = () => {
  const data: feedData = {}
  const [fd, setFeedData] = useState(data)
  useEffect(() => {
    fetchFeedData().then(d => setFeedData(d))
  }, [])
  return (
    <>
      <SEO title="Home" pathname="/" />
      <Hero title={metadata.title} description={metadata.description} />
      <Box
        as="main"
        position="relative"
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
