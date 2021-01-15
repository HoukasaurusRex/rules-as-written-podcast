import React, { useRef, useState } from 'react'
import { Box, Heading, Text, Input, Button, useColorModeValue, transition } from '@chakra-ui/react'
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa'
import dayjs from 'dayjs'
import { feedItem } from '../../types/media-types'

const secondsToTimestamp = (s: number) => {
  const m = 60
  const h = 60 * 60
  const hours = Math.floor(s / h)
  const mins = Math.floor(s / m)
  const secs = Math.floor(s % m)
  return `${hours ? `${hours}:` : ''}${`${mins}:`}${secs < 10 ? `0${secs}` : secs}`
}

const AudioCard = ({
  item: {
    title,
    pubDate,
    enclosure: { url },
    itunes: { duration }
  },
  selfHostedFile
}: {
  item: feedItem
  selfHostedFile: string
}): JSX.Element => {
  const [audioURL, setAudioURL] = useState(url)
  const [selfHostedFileFailed, setSelfHostedFileFailed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const importURL = () => import(`../data/${selfHostedFile}`)
  const fPubDate = dayjs(pubDate).format('MMM D, YYYY')
  const audio = useRef(new Audio())
  const currentTimestamp = secondsToTimestamp(currentTime)
  const durationTimestamp = secondsToTimestamp(duration)
  const play = async () => {
    setIsPlaying(true)
    await audio.current.play()
  }
  const pause = async () => {
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
  const canplay = () => {
    setIsLoading(false)
  }
  const loading = () => {
    setIsLoading(true)
  }
  const selectedStyles = { boxShadow: useColorModeValue('lg', 'md') }
  if (selfHostedFile && !selfHostedFileFailed) {
    importURL()
      .then(importedURL => {
        setAudioURL(importedURL.default)
      })
      .catch(() => {
        setSelfHostedFileFailed(true)
        console.warn('Cannot import from self hosted audio file. It may be out of date.')
      })
  }
  return (
    <Box w="100%" marginTop="30px" maxWidth="600px" px="25px">
      <Box
        _hover={selectedStyles}
        _focusWithin={selectedStyles}
        p="5px"
        rounded="md"
        bgColor={useColorModeValue('gray.200', 'gray.900')}
        boxShadow={useColorModeValue('md', 'sm')}
        transition="box-shadow ease-in-out 0.2s"
      >
        <Box d="flex" alignItems="flex-end" cursor="default" onClick={!isPlaying ? play : pause}>
          <Button
            p="5px"
            flex="1"
            m="auto"
            marginLeft="0"
            background="transparent"
            _hover={{ background: 'transparent' }}
            isLoading={isLoading}
          >
            {!isPlaying && <FaPlayCircle size="35px" />}
            {isPlaying && <FaPauseCircle size="35px" />}
          </Button>
          <Box p="5px" flex="3">
            <Heading as="h3" fontSize="sm">
              {title}
            </Heading>
            <Text fontSize="xs">{fPubDate}</Text>
          </Box>
          <Box p="5px" flex="5">
            <Text fontSize="xs" textAlign="right">
              {currentTimestamp} / {durationTimestamp}
            </Text>
          </Box>
        </Box>
        <Box mx="5px">
          {/* eslint-disable jsx-a11y/media-has-caption */}
          <audio
            ref={audio}
            src={audioURL}
            onTimeUpdate={updateTime}
            onWaiting={loading}
            onCanPlay={canplay}
          />
          <Input
            type="range"
            p="0"
            border="none"
            appearance="auto"
            value={currentTime}
            onChange={seek}
            max={duration}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default AudioCard
