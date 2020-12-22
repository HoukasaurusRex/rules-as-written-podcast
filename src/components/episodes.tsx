import React, { useEffect, useState } from 'react'
import Parser from 'rss-parser'

import { VStack } from '@chakra-ui/react'
import AudioCard from './audio-card'

type feed = {
  author: string,
  copyright: string,
  creator: string,
  description: string,
  feedUrl: string,
  generator: string,
  image: {
    link: string,
    url: string,
    title: string,
  }
  itunes: {
    owner: {
      name: string,
      email: string
    },
    image: string,
    categories: Array<string>,
    categoriesWithSubs: Array<{
      name: string,
      subs: Array<{
        name: string
      }>
    }>,
    author: string,
  }
  language: string,
  lastBuildDate: string,
  link: string,
  title: string,
  items: Array<{
    content: string,
    contentSnippet: string,
    creator: string,
    'dc:creator': string,
    enclosure: {
      url: string,
      length: string,
      type: string
    }
    guid: string,
    isoDate: string,
    itunes: {
      summary: string,
      explicit: string,
      duration: string,
      image: string
    },
    link: string,
    pubDate: string,
    title: string
  }>
}

const parser: Parser<feed> = new Parser()

const fetchFeedData = async (setFeedData ) => {
  const feedData = await parser.parseURL(
    'https://anchor.fm/s/44a4277c/podcast/rss'
  )
  setFeedData(feedData)
}

export default function Episodes() {
  const [feedData, setFeedData] = useState({})
  useEffect(() => {
    fetchFeedData(setFeedData)
  }, [])
  // @ts-ignore
  const episodes = feedData.items?.map(item => (
    <AudioCard key={item.guid} episodeData={item} />
  ))
  return <VStack>{episodes}</VStack>
}
