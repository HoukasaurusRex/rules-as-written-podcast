import { extendTheme, ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import Layout from './components/layout'

export const wrapPageElement = ({ element }) => {
  const theme = extendTheme({
    config: {
      useSystemColorMode: true
    },
    styles: {
      global: {
        a: {
          color: '#bb4430'
        }
      }
    }
  })
  return (
    <ChakraProvider theme={theme}>
      <Layout>{element}</Layout>
    </ChakraProvider>
  )
}
