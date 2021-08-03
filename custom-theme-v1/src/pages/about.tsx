import React from 'react'
import { Text, Box, Image } from '@chakra-ui/react'
import bannerURL from '../images/raw-banner.jpg'
import lazyBardURL from '../images/lazy-bard.gif'
import SEO from '../components/seo'

const AboutPage: () => JSX.Element = () => (
  <>
    <Box bg={`center / cover no-repeat url(${bannerURL})`} width="100vw" height="300px" />
    <Box
      d="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      my="2rem"
      mx="auto"
      px="1rem"
      maxW="600px"
    >
      <SEO title="About Us" />
      <Text fontSize="xl" my={5}>
        Hey guys, JT here 👋
      </Text>
      <Text fontSize="xl">
        Toby and I made this podcast because we couldn&apos;t find any other D&D podcasts that just
        try to explain the rules of D&D. We&apos;re just here to have some fun and share some of our
        knowledge and experience with you guys.
      </Text>
      <Image src={lazyBardURL} my={5} />
    </Box>
  </>
)
export default AboutPage
