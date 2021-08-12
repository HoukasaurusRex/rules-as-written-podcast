import React from 'react'
import ThemeProvider from './src/components/theme-provider'

export const wrapPageElement = ({ element, props }, options) => (
  <ThemeProvider {...{...props, ...options}}>
    {element}
  </ThemeProvider>
)
