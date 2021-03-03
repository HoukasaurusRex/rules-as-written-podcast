import React, { useState, useEffect } from 'react'
import { Box, Heading, ListItem, List, ListIcon, Link, Tag } from '@chakra-ui/react'
import { FaCheckCircle } from '@react-icons/all-files/fa/FaCheckCircle'
import { FaWrench } from '@react-icons/all-files/fa/FaWrench'
import SEO from '../components/seo'
import { Issue, Label } from '../../types/github-types'

const RoadmapPage: () => JSX.Element = () => {
  const d: Array<Issue> = []
  const [issues, setIssues] = useState(d)
  useEffect(() => {
    fetch('https://api.github.com/repos/HoukasaurusRex/rules-as-written-podcast/issues?state=all', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
      .then(res => res.json())
      .then((body: Array<Issue>) => {
        setIssues(body)
      })
  }, [])
  const Issues = issues
    .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
    .sort((a, b) => a.comments - b.comments)
    .sort(a => (a.state !== 'closed' ? -1 : 0))
    .map(iss => {
      const isClosed = iss.state === 'closed'
      const tags = (labels: Array<Label>) =>
        labels.map(label => (
          <Tag key={label.id} color={label.color} marginLeft="1rem">
            {label.name}
          </Tag>
        ))
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
          <Link href={iss.html_url} isExternal>
            {iss.title}
          </Link>
          {tags(iss.labels)}
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
            Here&apos;s what&apos;s in the pipeline for the site.{' '}
            <Link
              href="https://github.com/HoukasaurusRex/rules-as-written-podcast/issues"
              isExternal
            >
              Request a feature
            </Link>{' '}
            to help us prioritize development!
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
