import React from 'react'
import { graphql } from 'gatsby'
import {
  Box,
  Flex,
  Heading,
  Center,
  Text,
  Link,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  useColorModeValue,
  useBreakpointValue
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import SEO from '../components/seo'
import AudioCard from '../components/audio-card'
import { Episode, Captions } from '../../types/media-types'
import { secondsToTimestamp } from '../utils/time'

const EpisodePage: React.FunctionComponent<{
  data: {
    markdownRemark: {
      html: string
      frontmatter: Episode
    }
    episodeDataJson: {
      captions: Captions
    }
  }
}> = ({ data }) => {
  const {
    markdownRemark: { frontmatter },
    episodeDataJson
  } = data
  const selfHostedFile = `${frontmatter.guid}.mp3`
  const lines = episodeDataJson?.captions.map(caption => (
    <Flex key={caption.start} justifyContent="start">
      <Box as="aside" flex="1" opacity="0.5">
        {secondsToTimestamp(caption.start)}
      </Box>
      <Text flex="10" px="1rem">
        {caption.text}
      </Text>
    </Flex>
  )) || (
    <Text>
      <span role="img" aria-label="wrench">
        🔧
      </span>{' '}
      Our constructs are working hard on making a transcript for this episode, come back later!
    </Text>
  )
  return (
    <Box position="relative">
      <SEO title={frontmatter.title} pathname={frontmatter.slug} />
      <Center flexDir="column">
        <Heading paddingTop="70px" paddingBottom="30px" textAlign="center">
          {frontmatter.title}
        </Heading>
        <AudioCard
          item={frontmatter}
          selfHostedFile={selfHostedFile}
          linkToPage={false}
          cardBG={false}
          cardTitle={false}
        />
        <Flex
          justifyContent="space-around"
          alignItems="center"
          flexDir={useBreakpointValue({ base: 'column', sm: 'row' })}
        >
          <Popover>
            <PopoverTrigger>
              <Button m="1rem">Wonky Transcription?</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Blame the Constructs</PopoverHeader>
              <PopoverBody>
                <Text mb="1rem">
                  Toby and I would love to improve the transcriptions, but we&apos;re currently
                  working furiously to give you more great content so we let YouTube do it for us{' '}
                  <span role="img" aria-label="wink">
                    😉
                  </span>
                  .
                </Text>
                <Text>
                  If you know your way around YouTube captioning and would like to be a part of the
                  Rules as Written team to help improve this page, visit{' '}
                  <Link
                    href="https://www.youtube.com/channel/UCpqh72Jl2K09HvKBiqMixAA"
                    target="_blank"
                    color="#bb4430"
                  >
                    our YouTube channel <ExternalLinkIcon />
                  </Link>
                </Text>
                <Text>
                  and let us know at{' '}
                  <Link
                    href="mailto:toby@rulesaswrittenshow.com?subject=Transcriptions"
                    color="#bb4430"
                  >
                    toby@rulesaswrittenshow.com
                  </Link>{' '}
                  so we can give you a glorious shoutout on our channel!
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Button as="a" href="https://anchor.fm/rules-as-written/support" target="_blank" m="1rem">
            Support us on Anchor{' '}
            <span role="img" aria-label="heart">
              ❤️
            </span>
          </Button>
        </Flex>
        <Box
          as="main"
          position="relative"
          minHeight="50vh"
          w="550px"
          maxW="100%"
          px={useBreakpointValue({ base: '0.5rem', sm: '2rem' })}
          py="2rem"
          my="2rem"
          borderRadius="md"
          bgColor={useColorModeValue('gray.200', 'gray.900')}
          boxShadow={useColorModeValue('sm', 'md')}
          mx="auto"
        >
          {lines}
        </Box>
      </Center>
    </Box>
  )
}

export default EpisodePage

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      frontmatter {
        pubDate
        guid
        title
        videoId
        slug
        enclosure {
          url
        }
        itunes {
          duration
        }
      }
    }
    episodeDataJson(slug: { eq: $slug }) {
      captions {
        start
        duration
        text
      }
    }
  }
`
