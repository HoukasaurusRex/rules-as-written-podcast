import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import AudioCard from './audio-card'
import { feedData as fd } from '../../types/media-types'

import './loading-ellipses.css'

export default function Episodes({ feedData }: { feedData: fd }): JSX.Element {
  const episodes = feedData.items?.map((item, i) => {
    const selfHostedFile = i === 0 ? `${item.guid}.mp3` : ''
    return <AudioCard key={item.guid} item={item} selfHostedFile={selfHostedFile} />
  }) || <Text className="loading">loading episodes</Text>
  return <VStack position="relative">{episodes}</VStack>
}
