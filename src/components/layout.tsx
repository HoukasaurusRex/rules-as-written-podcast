import React from 'react'
import { Box, Link, useColorModeValue } from '@chakra-ui/react'
import ErrorBoundary from './error-boundary'
import Navbar from './navbar'

const Layout = ({ children }: { children: React.ReactChildren }): JSX.Element => (
  <>
    <Navbar />
    <ErrorBoundary>{children}</ErrorBoundary>
    <Box
      as="footer"
      py="1rem"
      fontSize="xs"
      textAlign="center"
      color={useColorModeValue('gray.700', 'gray.400')}
      position="relative"
    >
      © {new Date().getFullYear()}, Built with{' '}
      <Link isExternal color="purple.500" href="https://www.gatsbyjs.com">
        Gatsby
      </Link>
      ,{' '}
      <Link isExternal color="purple.500" href="https://www.chakra-ui.com">
        Chakra UI
      </Link>
      , and ❤️ by{' '}
      <Link isExternal color="purple.500" href="https://jt.houk.space">
        JT
      </Link>
      . If you want us to keep going, please support us on{' '}
      <Link isExternal color="purple.500" href="https://anchor.fm/rules-as-written/support">
        anchor
      </Link>
    </Box>
  </>
)

export default Layout
