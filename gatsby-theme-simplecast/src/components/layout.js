/** @jsx jsx */
import { useEffect } from "react"
import PropTypes from "prop-types"
import Navigation from "./navigation"
import { jsx, Container, Box, useColorMode, useThemeUI } from "theme-ui"
import "@reach/skip-nav/styles.css"
import "./layout.css"

function Layout({ children }) {
  const [colorMode, setColorMode] = useColorMode()
  const userColorMode = typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? 'dark'
    : colorMode
  const { theme } = useThemeUI()
    useEffect(() => {
      setColorMode(userColorMode)
    }, [userColorMode])
  console.log({theme, colorMode})
  return (
    <Box>
      <Container
        sx={{
          p: 0,
          display: "flex",
          flexDirection: ["column", "row"],
          flex: "1",
          maxWidth: 1200
        }}
      >
        <Navigation eventTypes="click" />
        <main sx={{ width: "100%", ml: [ 0, 300] }}>{children}</main>
      </Container>
    </Box>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
