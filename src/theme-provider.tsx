import { extendTheme, ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import Layout from './components/layout'

export const wrapPageElement = ({ element }) => {
  const initialColorMode = new Date().getHours() >= 18 ? 'dark' : 'light'
  const theme = extendTheme({
    config: {
      useSystemColorMode: true,
      initialColorMode
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
