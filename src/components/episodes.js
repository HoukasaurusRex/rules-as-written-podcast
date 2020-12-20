import React from 'react'
import { useAsync } from 'react-async'
import {xml2js} from 'xml-js'

import { VStack } from '@chakra-ui/react'
import AudioCard from './audio-card'

const fetchFeed = async ({anchorId}, {signal}) => {
  const res = await fetch(`https://anchor.fm/s/${anchorId}/podcast/rss`, { signal })
  if (!res.ok) throw new Error(res.statusText)
  const xmlData = await res.text()
  const jsonData = xml2js(xmlData)
  return jsonData
}

export default function Episodes() {
  const anchorId = '44a4277c'
  const { data, error, isPending } = useAsync({ promiseFn: fetchFeed, anchorId })
  if (isPending) return 'Loading...'
  if (error) return `Something went wrong loading the episodes: ${error.message}`
  if (data) {
    const episodes = data.feed?.items
      ? data.feed?.items.map(item => <AudioCard />)
      : <AudioCard />
    return (
      <VStack >
        {episodes}
      </VStack>
    )
  }
  return null
}