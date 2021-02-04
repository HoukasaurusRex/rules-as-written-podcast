import React from 'react'
import { Box, Button, Text } from '@chakra-ui/react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

const ErrorFallback: React.FunctionComponent<{
  error: Error
  resetErrorBoundary: () => void
}> = ({ error, resetErrorBoundary }) => (
  <Box
    role="alert"
    h="100vh"
    d="flex"
    flexDirection="column"
    maxW="600px"
    justifyContent="center"
    alignItems="center"
    margin="auto"
  >
    <Text>Something went wrong:</Text>
    <Text p="1rem">
      {error.message}
    </Text>
    <Button maxW="200px" onClick={resetErrorBoundary}>
      Refresh
    </Button>
  </Box>
)

const ErrorBoundary = ({ children }: { children: React.ReactChildren }): JSX.Element => (
  <ReactErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      window.location.reload()
    }}
  >
    {children}
  </ReactErrorBoundary>
)

export default ErrorBoundary
