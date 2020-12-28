import React, { useRef, useState } from 'react'
import { Box, Heading, Text, Input, Button, useColorModeValue } from '@chakra-ui/react'
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa'
import dayjs from 'dayjs'
import { feedItem } from '../types'

const secondsToTimestamp = (s: number) => {
  const m = 60
  const h = 60 * 60
  const hours = Math.floor(s / h)
  const mins = Math.floor(s / m)
  const secs = Math.floor(s % m)
  return `${hours ? hours + ':': ''}${mins + ':'}${secs < 10 ? '0' + secs : secs}`
}

const AudioCard = ({ item: { title, pubDate, enclosure: { url }, itunes: { duration } } }: { item: feedItem }) => {
  let [isPlaying, setIsPlaying] = useState(false)
  let [currentTime, setCurrentTime] = useState(0)
  const fPubDate = dayjs(pubDate).format('MMM D, YYYY')
  const audio = useRef(new Audio())
  const currentTimestamp = secondsToTimestamp(currentTime)
  const durationTimestamp = secondsToTimestamp(duration)
  const play = async() => {
    setIsPlaying(true)
    await audio.current.play()
  }
  const pause = async() => {
    setIsPlaying(false)
    await audio.current.pause()
  }
  const updateTime = () => {
    setCurrentTime(audio.current.currentTime)
  }
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekedTime = Number(e.target.value)
    setCurrentTime(seekedTime)
    audio.current.currentTime = seekedTime
  }
  return (
    <Box w="100%" marginTop="35px" maxWidth="600px">
      <Box p="5px 25px" d="flex" alignItems="flex-end" _hover={{bgColor: useColorModeValue('gray.100', 'gray.700')}} cursor="default" borderRadius="10px" onClick={!isPlaying ? play : pause}>
        <Button p="5px" flex="1" m="auto" background="transparent" _hover={{ background: 'transparent' }}>
          {!isPlaying && <FaPlayCircle size="35px"/>}
          {isPlaying && <FaPauseCircle size="35px"/>}
        </Button>
        <Box p="5px" flex="3">
          <Heading as="h3" fontSize="sm">{title}</Heading>
          <Text fontSize="xs">{fPubDate}</Text>
        </Box>
        <Box p="5px" flex="5">
          <Text fontSize="xs" textAlign="right">{currentTimestamp} / {durationTimestamp}</Text>
        </Box>
      </Box>
      <Box w="85%" m="auto">
        <audio ref={audio} src={url} onTimeUpdate={updateTime}></audio>
        <Input type="range" p="0" border="none" appearance="auto" value={currentTime} onChange={seek} max={duration}/>
      </Box>
    </Box>
  )
}

export default AudioCard
