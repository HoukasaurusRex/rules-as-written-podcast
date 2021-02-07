import React from 'react'
import { Text, Heading, Box, Link } from '@chakra-ui/react'

import SEO from '../components/seo'

const NotFoundPage: () => JSX.Element = () => (
  <>
    <Box
      role="alert"
      h="100vh"
      d="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      m="auto"
      px="1rem"
      maxW="600px"
    >
      <SEO title="About Us" />
      <Heading>Who We Are</Heading>
      <Text fontSize="xl" my={5}>
        Hey guys, JT here 👋
      </Text>
      <Text fontSize="xl" my={5}>
        Toby and I made this podcast because we couldn&apos;t find any other D&D podcasts that just
        try to explain the rules of D&D. We&apos;re just here to have some fun and share some of our
        knowledge and experience with you guys
      </Text>
    </Box>
  </>
)
export default NotFoundPage
