import React from 'react'
import { VStack } from '@chakra-ui/react'
import AudioCard from './audio-card'
import { feedData } from '../types'

export default function Episodes({ feedData }: { feedData: feedData } ) {
  const episodes = feedData.items?.map(item => (
    <AudioCard key={item.guid} item={item} />
  ))
  return <VStack>{episodes}</VStack>
}
