import { extendTheme, ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import Layout from './components/layout'

export const wrapPageElement = ({ element }: { element: React.ReactChildren }): JSX.Element => {
  const initialColorMode = new Date().getHours() >= 18 ? 'dark' : 'light'
  const theme = extendTheme({
    config: {
      useSystemColorMode: true,
      initialColorMode
    }
  })
  return (
    <ChakraProvider theme={theme}>
      <Layout>{element}</Layout>
    </ChakraProvider>
  )
}
