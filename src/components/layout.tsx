import React from 'react'
import PropTypes from 'prop-types'
import { Box, Link, Button, Text } from '@chakra-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import Navbar from './navbar'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Box role="alert" h="100vh" d="flex" flexDirection="column" maxW="600px" justifyContent="center" alignItems="center">
      <Text>Something went wrong:</Text>
      <Text as="pre">{error.message}</Text>
      <Button maxW="200px" onClick={resetErrorBoundary}>Refresh</Button>
    </Box>
  )
}

const Layout = ({ children }: { children: React.ReactChildren }) => {
  return (
    <>
      <Navbar />
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { window.location.reload() }}>
        {children}
      </ErrorBoundary>
      <Box as="footer" marginTop="2rem" fontSize="sm" paddingLeft="5px">
        © {new Date().getFullYear()}, Built with{' '}
        <Link
          isExternal
          textDecor="underline"
          color="purple.500"
          href="https://www.gatsbyjs.com"
        >
          Gatsby
        </Link>,{' '}
        <Link
          isExternal
          textDecor="underline"
          color="purple.500"
          href="https://www.chakra-ui.com"
        >
          Chakra UI
        </Link>, and ❤️
      </Box>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
