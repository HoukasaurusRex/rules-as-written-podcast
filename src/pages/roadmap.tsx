import React, { useState, useEffect } from 'react'
import { Box, Heading, ListItem, List, ListIcon } from '@chakra-ui/react'
import { FaCheckCircle } from '@react-icons/all-files/fa/FaCheckCircle'
import { FaWrench } from '@react-icons/all-files/fa/FaWrench'
import SEO from '../components/seo'
import { Issue } from '../../types/github-types'

const RoadmapPage: () => JSX.Element = () => {
  const d: Array<Issue> = []
  const [issues, setIssues] = useState(d)
  useEffect(() => {
    fetch('https://api.github.com/repos/HoukasaurusRex/rules-as-written-podcast/issues', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
      .then(res => res.json())
      .then((body: Array<Issue>) => {
        setIssues(body)
      })
  }, [])
  const Issues = issues
    .sort((cur, prev) => (cur.number > prev.number && cur.state !== 'closed' ? 1 : 0))
    .map(iss => {
      const isClosed = iss.state === 'closed'
      return (
        <ListItem
          key={iss.id}
          textDecoration={isClosed ? 'line-through' : 'unset'}
          color={isClosed ? 'gray' : 'unset'}
        >
          <ListIcon
            as={isClosed ? FaCheckCircle : FaWrench}
            color={isClosed ? 'green.500' : 'gray.500'}
          />
          {iss.title}
        </ListItem>
      )
    })
  return (
    <>
      <SEO
        title="Roadmap"
        pathname="/roadmap"
        description="Here's what's in the pipeline for the site. Request a feature to help us prioritize development!"
      />
      <Box
        as="section"
        position="relative"
        minHeight="calc(100vh - 60px)"
        d="flex"
        flexDir="column"
        alignItems="center"
        _before={{
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: '#bb4430',
          opacity: '0.8',
          transform: 'skew(-70deg)',
          transformOrigin: 'top'
        }}
      >
        <Box as="main" position="relative">
          <Heading as="h1" paddingTop="70px" position="relative" textAlign="center">
            Roadmap
          </Heading>
          <Heading as="h2" maxWidth="600px" fontSize="1em" py="3rem">
            Here&apos;s what&apos;s in the pipeline for the site. Request a feature to help us
            prioritize development!
          </Heading>
          <List marginLeft="1rem" marginBottom="3rem" spacing={3}>
            {Issues}
          </List>
        </Box>
      </Box>
    </>
  )
}

export default RoadmapPage
