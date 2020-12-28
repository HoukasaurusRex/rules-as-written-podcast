import React from 'react'
import { Text, Heading, Box } from '@chakra-ui/react'

import SEO from '../components/seo'

const NotFoundPage = () => (
  <>
    <Box role="alert" h="100vh" d="flex" alignItems="center" justifyContent="center" flexDirection="column">
      <SEO title="404: Not found" />
      <Heading>404: Not Found</Heading>
      <Text fontSize="xl" my={5}>
        You just hit a route that doesn&#39;t exist... the sadness.
      </Text>
    </Box>
  </>
)
export default NotFoundPage
