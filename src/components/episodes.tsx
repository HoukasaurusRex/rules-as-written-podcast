import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import AudioCard from './audio-card'
import { feedData as fd } from '../types'

import './loading-ellipses.css'

export default function Episodes({ feedData }: { feedData: fd }): JSX.Element {
  const episodes = feedData.items?.map(item => <AudioCard key={item.guid} item={item} />) || (
    <Text className="loading">loading episodes</Text>
  )
  return <VStack position="relative">{episodes}</VStack>
}
