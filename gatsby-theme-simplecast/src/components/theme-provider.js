import React, { useEffect } from "react"
import { ThemeProvider as ThemeUI, Themed, useColorMode } from "theme-ui"
import { SkipNavLink } from "@reach/skip-nav"
import Layout from "./layout"
import Player from "./player"
import { EpisodeProvider, EpisodeConsumer } from "./context"
import theme from '../theme'

const ThemeProvider = (props) => {
  const { children } = props
  const episodeSlug = props.episodeSlug ? props.episodeSlug : "show"
  const [colorMode, setColorMode] = useColorMode()
  const userColorMode = typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? 'dark'
    : 'light'
    useEffect(() => {
      setColorMode(userColorMode)
    }, [userColorMode])
  const jankyTheme = {
    ...theme,
    colors: {
      ...theme.colors.modes[userColorMode],
      modes: theme.colors.modes
    }
  }
  return (
    <ThemeUI theme={jankyTheme}>
      <EpisodeProvider>
        <Themed.root>
          <SkipNavLink />
          <Layout {...props}>
            {props.location.pathname.includes(episodeSlug) ||
            props.location.pathname === "/" ? (
              <EpisodeConsumer>
                {context => <Player episode={context.state} />}
              </EpisodeConsumer>
            ) : null}
            {children}
          </Layout>
        </Themed.root>
      </EpisodeProvider>
    </ThemeUI>
  )
}

export default ThemeProvider