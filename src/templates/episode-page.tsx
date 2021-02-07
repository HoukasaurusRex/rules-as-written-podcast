import React, { ComponentType } from 'react'
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
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import SEO from '../components/seo'
import AudioCard from '../components/audio-card'
import { secondsToTimestamp } from '../utils/time'
import { EpisodePageQuery, Maybe, EpisodeDataJsonCaptions } from '../../types/graphql-types'

interface CaptionLineComponent extends ListChildComponentProps {
  data: Maybe<Pick<EpisodeDataJsonCaptions, 'text' | 'start' | 'duration'>>[]
}

const Line: ComponentType<CaptionLineComponent> = ({ index, data, style }) => (
  <Flex key={data[index]?.start} justifyContent="start" style={style}>
    <Box as="aside" flex="1" opacity="0.5">
      {secondsToTimestamp(data[index]?.start)}
    </Box>
    <Text flex="10" px="1rem">
      {data[index]?.text}
    </Text>
  </Flex>
)

const Lines = (
  episodeDataJson: Maybe<{
    captions?: Maybe<Maybe<Pick<EpisodeDataJsonCaptions, 'text' | 'start' | 'duration'>>[]>
  }>
) =>
  episodeDataJson?.captions ? (
    <List
      itemData={episodeDataJson.captions}
      height={300}
      width="100%"
      itemCount={episodeDataJson.captions.length}
      itemSize={50}
      style={{ position: 'relative', borderRadius: '0.375rem' }}
    >
      {Line}
    </List>
  ) : (
    <Text paddingTop="2rem">
      <span role="img" aria-label="wrench">
        🔧
      </span>{' '}
      Our constructs are working hard on making a transcript for this episode, come back later!
    </Text>
  )

const EpisodePage: React.FC<{ data: EpisodePageQuery }> = ({ data }) => {
  const { markdownRemark, episodeDataJson } = data
  const frontmatter = markdownRemark?.frontmatter
  const selfHostedFile = `${frontmatter?.guid}.mp3`

  return (
    <Box position="relative">
      <SEO title={frontmatter?.title || ''} pathname={frontmatter?.slug} />
      <Center flexDir="column">
        <Heading
          paddingTop="70px"
          paddingBottom="30px"
          textAlign="center"
          w={useBreakpointValue({ base: '15rem', md: '18rem', lg: '100%' })}
        >
          {frontmatter?.title}
        </Heading>
        {frontmatter && (
          <AudioCard
            item={frontmatter}
            selfHostedFile={selfHostedFile}
            linkToPage={false}
            cardBG={false}
            cardTitle={false}
          />
        )}
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
          minHeight="300px"
          w="550px"
          maxW="100%"
          paddingLeft={useBreakpointValue({ base: '0.5rem', sm: '2rem' })}
          my="2rem"
          borderRadius="md"
          bgColor={useColorModeValue('gray.200', 'gray.900')}
          boxShadow={useColorModeValue('sm', 'md')}
          mx="auto"
        >
          {Lines(episodeDataJson)}
        </Box>
      </Center>
    </Box>
  )
}

export default EpisodePage

export const pageQuery = graphql`
  query EpisodePage($slug: String!) {
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
