import React from 'react'
import { ColorModeScript } from '@chakra-ui/react'

export const onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([<ColorModeScript useSystemColorMode key="chakra-ui-no-flash" />])
}
export * from './src/theme-provider'
