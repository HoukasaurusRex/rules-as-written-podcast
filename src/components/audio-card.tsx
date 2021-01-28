import React, { useRef, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  useColorModeValue,
  Link,
  Tooltip
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa'
import dayjs from 'dayjs'
import { feedItem, Episode } from '../../types/media-types'
import { toSlug } from '../utils/slug'
import { secondsToTimestamp } from '../utils/time'

const AudioCard = ({
  item: {
    title,
    pubDate,
    enclosure: { url },
    itunes: { duration }
  },
  linkToPage = true,
  cardTitle = true,
  cardBG = true,
  selfHostedFile
}: {
  item: feedItem | Episode
  selfHostedFile: string
  linkToPage?: boolean
  cardTitle?: boolean
  cardBG?: boolean
}): JSX.Element => {
  const [audioURL, setAudioURL] = useState(url)
  const [selfHostedFileFailed, setSelfHostedFileFailed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const importURL = () => import(`../data/${selfHostedFile}`)
  const fPubDate = dayjs(pubDate).format('MMM D, YYYY')
  const audio = useRef(global.window && new Audio())
  const currentTimestamp = secondsToTimestamp(currentTime)
  const durationTimestamp = secondsToTimestamp(duration)
  const play = async () => {
    setIsPlaying(true)
    await audio?.current?.play()
  }
  const pause = async () => {
    setIsPlaying(false)
    await audio?.current?.pause()
  }
  const updateTime = () => {
    setCurrentTime(audio?.current?.currentTime || 0)
  }
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio?.current?.currentTime) return
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
  const selectedStyles = {
    boxShadow: useColorModeValue('md', 'lg'),
    transform: 'translateY(-1px)'
  }
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
    <Box w="100%" marginTop="30px" maxWidth="600px" px="15">
      <Box
        _hover={cardBG ? selectedStyles : undefined}
        _focusWithin={cardBG ? selectedStyles : undefined}
        p="5px"
        marginTop="15px"
        rounded="md"
        bgColor={cardBG ? useColorModeValue('gray.200', 'gray.900') : undefined}
        boxShadow={cardBG ? useColorModeValue('sm', 'md') : undefined}
        transition="all ease-in-out 0.2s"
      >
        <Box d="flex" alignItems="flex-end" cursor="default">
          <Button
            p="5px"
            flex="1"
            m="auto"
            marginLeft="0"
            background="transparent"
            _hover={{ background: 'transparent' }}
            isLoading={isLoading}
            onClick={!isPlaying ? play : pause}
          >
            {!isPlaying && <FaPlayCircle size="35px" />}
            {isPlaying && <FaPauseCircle size="35px" />}
          </Button>
          <Box p="5px" flex="8">
            {cardTitle && (
              <Heading as="h3" fontSize="sm">
                {title}
              </Heading>
            )}
            <Text fontSize="xs">{fPubDate}</Text>
          </Box>
          <Box p="5px" flex="5" textAlign="right">
            {linkToPage && (
              <Tooltip
                shouldWrapChildren
                label="Open Episode Page"
                hasArrow
                placement="top"
                fontSize="xs"
                offset={[0, 15]}
              >
                <Link isExternal href={toSlug(title)} color="#bb4430">
                  <ExternalLinkIcon />
                </Link>
              </Tooltip>
            )}
            <Text fontSize="xs">
              {currentTimestamp} / {durationTimestamp}
            </Text>
          </Box>
        </Box>
        <Box mx="5px">
          {/* eslint-disable jsx-a11y/media-has-caption */}
          {/* TODO: use video element with track for subtitles */}
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
