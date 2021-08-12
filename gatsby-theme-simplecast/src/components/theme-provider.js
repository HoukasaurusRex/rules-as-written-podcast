import React from "react"
import { ThemeProvider as ThemeUI, Themed } from "theme-ui"
import { SkipNavLink } from "@reach/skip-nav"
import Layout from "./layout"
import Player from "./player"
import { EpisodeProvider, EpisodeConsumer } from "./context"
import theme from '../theme'

const ThemeProvider = (props) => {
  const { children } = props
  const episodeSlug = props.episodeSlug ? props.episodeSlug : "show"
  return (
    <ThemeUI theme={theme}>
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