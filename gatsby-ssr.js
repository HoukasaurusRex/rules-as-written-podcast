import React from 'react'
import { ColorModeScript } from '@chakra-ui/react'

export const onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([
    <ColorModeScript
      initialColorMode={new Date().getHours() >= 18 ? 'dark' : 'light'}
      key="chakra-ui-no-flash"
    />
  ])
}
export * from './src/theme-provider'
