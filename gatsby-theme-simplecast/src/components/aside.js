/** @jsx jsx */
import { useEffect, useState } from "react"
import { jsx, Image, Box, Heading, useColorMode } from "theme-ui"
import { graphql, useStaticQuery } from "gatsby"
import { FaExternalLinkAlt as ExternalLinkIcon } from "react-icons/fa"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import Link from "./link"
import Markdown from "react-markdown"
import { trackEvent } from '../utils'

const PodcastProvider = styled(Link)(
  css({
    mb: 5,
    display: "flex",
    alignItems: "center",
    img: { m: 0, mr: 3 },
  })
)
const importLogo = async (logoName, { colorMode = 'light', fileType = 'png', setState = () => {} }) => {
  const logo = await import(`../images/${logoName}-${colorMode}.${fileType}`)
  setState(logo.default)
}

function Aside({ markdown }) {
  // const [colorMode, _] = useColorMode()
  // const logoColorMode = colorMode === 'default' ? 'light' : colorMode
  const logoColorMode = 'dark' // light mode is super broken in theme-ui for this site
  const [spotifyLogo, setSpotifyLogo] = useState()
  const [applePodcastLogo, setApplePodcastLogo] = useState()
  const [googlePodcastLogo, setGooglePodcastLogo] = useState()
  const [patreonLogo, setPatreonLogo] = useState()
  const isBrowser = typeof window !== 'undefined'
  isBrowser && importLogo('spotify', { setState: setSpotifyLogo, colorMode: logoColorMode })
  isBrowser && importLogo('apple', { setState: setApplePodcastLogo, colorMode: logoColorMode, fileType: logoColorMode === 'dark' ? 'svg' : 'png' })
  isBrowser && importLogo('google', { setState: setGooglePodcastLogo, colorMode: logoColorMode, fileType: logoColorMode === 'dark' ? 'svg' : 'png' })
  isBrowser && importLogo('patreon', { setState: setPatreonLogo, colorMode: logoColorMode })
  const { site: { siteMetadata: { patrons, spotify_url, apple_podcasts_url, google_podcasts_url, patreon_url }}} = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          patrons
          spotify_url
          apple_podcasts_url
          google_podcasts_url
          patreon_url
        }
      }
    }
  `)
  return (
    <aside className="sidebar">
      <div
        sx={{
          mb: 2,
          pr: [10, 0],
          a: { color: "text", textDecoration: "none" }
        }}
      >
        <Link/>
        {spotify_url && spotifyLogo && (
          <PodcastProvider to={spotify_url} isExternal >
            <img onClick={() => trackEvent('provider', { value: 'spotify' })} src={spotifyLogo} alt="Spotify" width="90" height={25} />
          </PodcastProvider>
        )}
        {apple_podcasts_url && applePodcastLogo && (
          <PodcastProvider to={apple_podcasts_url} isExternal >
            <img onClick={() => trackEvent('provider', { value: 'apple' })} src={applePodcastLogo} alt="Apple Podcasts" height={25} />
          </PodcastProvider>
        )}
        {google_podcasts_url && googlePodcastLogo && (
          <PodcastProvider to={google_podcasts_url} isExternal >
            <img onClick={() => trackEvent('provider', { value: 'google' })} src={googlePodcastLogo} alt="Google Podcasts" height={25} />
          </PodcastProvider>
        )}
        {patreon_url && patreonLogo && (
          <PodcastProvider to={patreon_url} isExternal >
            <img onClick={() => trackEvent('support', { value: 'patreon' })} src={patreonLogo} alt="Support us on Patreon" height={25} />
          </PodcastProvider>
        )}
      </div>
      {markdown && (
        <div>
          {markdown.frontmatter.guestName && (
            <div
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h5 className="guest">Guest</h5>
              {markdown.frontmatter.guestPhoto && (
                <Image
                  sx={{
                    borderRadius: 0,
                    width: "100%",
                    maxWidth: 100,
                    objectFit: 'cover'
                  }}
                  src={markdown.frontmatter.guestPhoto}
                  alt={markdown.frontmatter.guestName}
                />
              )}
              <h4 sx={{ mt: 3, mb: 1 }}>{markdown.frontmatter.guestName}</h4>
              <Markdown>{markdown.frontmatter.guestSummary}</Markdown>
            </div>
          )}
        </div>
      )}
      {markdown && markdown.frontmatter.resources && (
        <div>
          <h5>Resources</h5>
          <ul>
            {markdown.frontmatter.resources.map((resource, i) => (
              <li key={i}>
                <ExternalLinkIcon />
                <Markdown>{resource}</Markdown>
              </li>
            ))}
          </ul>
        </div>
      )}
      {patrons && patrons.length && (
        <Box>
          <Heading as="h5">Special Thanks to our Top Patrons</Heading>
          <ul>
          {patrons.map((patron, i) => (
            <li key={i}>{patron}</li>
          ))}
          </ul>
        </Box>
      )}
    </aside>
  )
}

export default Aside
