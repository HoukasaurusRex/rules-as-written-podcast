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
import { FaPlayCircle } from '@react-icons/all-files/fa/FaPlayCircle'
import { FaPauseCircle } from '@react-icons/all-files/fa/FaPauseCircle'
import { FaCommentMedical } from '@react-icons/all-files/fa/FaCommentMedical'
import dayjs from 'dayjs'
import TransitionLink from 'gatsby-plugin-transition-link/AniLink'
import { feedItem, Episode } from '../../types/media-types'
import { toSlug } from '../utils/slug'
import { secondsToTimestamp } from '../utils/time'

const AudioCard = ({
  item: { title, pubDate, enclosure, contentSnippet, itunes },
  linkToPage = true,
  cardTitle = true,
  cardBG = true,
  selfHostedFile,
  preload = 'auto'
}: {
  item: feedItem | Episode
  selfHostedFile: string
  linkToPage?: boolean
  cardTitle?: boolean
  cardBG?: boolean
  preload?: string
}): JSX.Element => {
  const url = enclosure?.url || ''
  const duration = itunes?.duration
  const [audioURL, setAudioURL] = useState('')
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
    // @ts-ignore next-line
    pa.track({ name: 'Play Episode', value: title })
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
  const setBackupAudioURL = () => {
    setSelfHostedFileFailed(true)
    setAudioURL(url)
    console.warn('Cannot import from self hosted audio file. It may be out of date.')
  }
  const importSelfHostedFile = async () => {
    const importedURL = await importURL()
    setAudioURL(importedURL.default)
  }
  if (selfHostedFile && !selfHostedFileFailed && !audioURL) {
    importSelfHostedFile().catch(setBackupAudioURL)
  } else if (!audioURL && !selfHostedFile) {
    setAudioURL(url)
  }
  return (
    <Box w="100%" marginTop="30px" maxWidth="600px" px="0.5rem">
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
            <FaPlayCircle size="35px" style={{ display: !isPlaying ? 'block' : 'none' }} />
            <FaPauseCircle size="35px" style={{ display: isPlaying ? 'block' : 'none' }} />
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
            {linkToPage ? (
              <Tooltip
                shouldWrapChildren
                label="Open Episode Page"
                hasArrow
                placement="top"
                fontSize="xs"
                offset={[0, 15]}
              >
                <TransitionLink paintDrip to={toSlug(title || '')} color="#bb4430" duration={0.6}>
                  <ExternalLinkIcon />
                </TransitionLink>
              </Tooltip>
            ) : (
              <Tooltip
                shouldWrapChildren
                label="Make us an audio comment on Anchor and we'll feature it on the show!"
                hasArrow
                fontSize="xs"
                placement="top"
                offset={[0, 15]}
              >
                <Link
                  href="https://anchor.fm/rules-as-written/message"
                  target="_blank"
                  rel="noreferrer noopener"
                  _hover={{ textDecor: 'none' }}
                >
                  <FaCommentMedical style={{ marginLeft: 'auto' }} />
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
            preload={preload}
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
