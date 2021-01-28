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
      <SEO title="404: Not found" />
      <Heading>Roll Investigation?</Heading>
      <Text fontSize="xl" my={5}>
        You just hit a route that doesn&#39;t exist... the sadness.
      </Text>
      <Text fontSize="xl" my={5}>
        If you think something is broken, you might be right. I&#39;m just a guy who likes to make
        websites, stuff breaks all the time and it&#39;s an adventure all on its own maintaining
        this special little site. If you shoot Toby an email at{' '}
        <Link isExternal href="mailto:toby@rulesaswrittenshow.com" color="#bb4430">
          toby@rulesaswrittenshow.com
        </Link>{' '}
        and tell us what you&#39;re trying to do, I&#39;ll fix it as soon as I can!
      </Text>
    </Box>
  </>
)
export default NotFoundPage
