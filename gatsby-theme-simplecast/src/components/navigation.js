/** @jsx jsx */
import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { jsx, Flex, Box, Text, Image, useThemeUI } from "theme-ui"
import { EpisodeConsumer } from "./context"
import { FaPlay as PlayIcon } from "react-icons/fa"
import { MdMenu as MenuIcon, MdClose as CloseMenuIcon } from "react-icons/md"
import onClickOutside from "react-onclickoutside"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import Link from "./link"
import Bars from "./bars"
import { trackEvent } from "../utils"
import showLogo from '../images/icon-xl.png'

const IconProvider = styled(Link)(
  css({
    display: "flex",
    alignItems: "center"
  })
)

const importIcon = async (iconName, setState = () => {}) => {
  const icon = await import(`../images/${iconName}-icon.png`)
  setState(icon.default)
}

const Navigation = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)
  Navigation.handleClickOutside = () => setIsOpen(false)
  const twoDigits = n => (n.toString().length < 2 ? `0${n}` : n)
  const { theme } = useThemeUI()
  const [spotifyIcon, setSpotifyIcon] = useState()
  const [applePodcastIcon, setApplePodcastIcon] = useState()
  const [googlePodcastIcon, setGooglePodcastIcon] = useState()
  const [patreonIcon, setPatreonIcon] = useState()
  const isBrowser = typeof window !== 'undefined'
  isBrowser && importIcon('spotify', setSpotifyIcon)
  isBrowser && importIcon('apple', setApplePodcastIcon)
  isBrowser && importIcon('google', setGooglePodcastIcon)
  isBrowser && importIcon('patreon', setPatreonIcon)
  const { site, allEpisode, allMarkdownRemark } = useStaticQuery(graphql`
    query navQuery {
      site {
        siteMetadata {
          title
          spotify_url
          apple_podcasts_url
          google_podcasts_url
          patreon_url
        }
      }
      allEpisode {
        totalCount
        nodes {
          id
          title
          description
          number
          enclosure_url
          season
          fields {
            slug
          }
        }
      }
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              id
              summary
            }
          }
        }
      }
    }
  `)
  const { siteMetadata: { spotify_url, apple_podcasts_url, google_podcasts_url, patreon_url }} = site
  allEpisode.nodes = allEpisode.nodes.sort((a, b) => b.number - a.number)
  const Logo = () => (
    <Flex sx={{ alignItems: 'center' }}>
      <Image src={showLogo} sx={{ maxHeight: 50, display: ['none', 'block'] }} />
      <Box>
        <Link to="/">
          <Text sx={{ fontSize: 6, color: "primary", mb: 0 }}>
            {site.siteMetadata.title
              ? site.siteMetadata.title
              : "Podcast Name"}
          </Text>
        </Link>
        {allEpisode.nodes[0].season && (
          <h5
            sx={{
              textTransform: "uppercase",
              mb: 0,
              fontWeight: 400,
              fontSize: 0,
              opacity: 0.6,
            }}
          >
            season {twoDigits(allEpisode.nodes[0].season)}
          </h5>
        )}
      </Box>
    </Flex>
  )

  return (
    <EpisodeConsumer>
      {context => (
        <>
          <Flex
            sx={{
              variant: "header.logo.container",
            }}
          >
            <Flex
              sx={{
                variant: "header.logo",
              }}
            >
              <Logo />
            </Flex>
            <Flex sx={{ alignContent: 'center' }}>
            {spotify_url && spotifyIcon && (
              <IconProvider to={spotify_url} isExternal >
                <img onClick={() => trackEvent('provider::spotify')} src={spotifyIcon} alt="Spotify" height={20} sx={{ display: ['block', 'none'], my: 'auto', mx: 1 }} />
              </IconProvider>
            )}
            {apple_podcasts_url && applePodcastIcon && (
              <IconProvider to={apple_podcasts_url} isExternal >
                <img onClick={() => trackEvent('provider::apple')} src={applePodcastIcon} alt="Apple" height={20} sx={{ display: ['block', 'none'], my: 'auto', mx: 1 }} />
              </IconProvider>
            )}
            {google_podcasts_url && googlePodcastIcon && (
              <IconProvider to={google_podcasts_url} isExternal >
                <img onClick={() => trackEvent('provider::google')} src={googlePodcastIcon} alt="Google" height={20} sx={{ display: ['block', 'none'], my: 'auto', mx: 1 }} />
              </IconProvider>
            )}
            {patreon_url && patreonIcon && (
              <IconProvider to={patreon_url} isExternal >
                <img onClick={() => trackEvent('support::patreon')} src={patreonIcon} alt="Patreon" height={20} sx={{ display: ['block', 'none'], my: 'auto', mx: 1 }} />
              </IconProvider>
            )}
            </Flex>
            <button
              sx={{
                position: "relative",
                zIndex: 998,
                display: "flex",
                p: 3,
                backgroundColor: "background",
                border: 'none',
                color: "text",
                fontSize: 5,
              }}
              onClick={toggleMenu}
              aria-controls="menu"
              aria-haspopup="true"
              aria-expanded={isOpen ? "true" : "false"}
            >
              {isOpen ? <CloseMenuIcon /> : <MenuIcon />}
            </button>
          </Flex>
          <nav
            className="episodes_list"
            sx={{
              variant: "navigation.episodes",
              transform: [`translateX(${isOpen ? "0" : "-100%"})`, "none"],
              transition: "300ms cubic-bezier(1, 0, 0, 1)",
              boxShadow: ['none', theme.colors.shadowRight],
              '::-webkit-scrollbar': {
                width: '6px'
              },
              /* Handle */
              '::-webkit-scrollbar-thumb': {
                backgroundColor: theme.colors.primary,
                borderRadius: '10px',
                ':hover': {
                  backgroundColor: theme.colors.primaryDarken,
                }
              },
            }}
          >
            <div sx={{ pb: 4 }}>
              <Logo />
            </div>
            
            <ul id="menu" role="menu" sx={{ pb: 14 }}>
              {allEpisode.nodes.map(episode => (
                <li role="none" key={episode.id}>
                  {episode.id === context.state.id && <Bars />}
                  <Link
                    role="menuitem"
                    activeClassName="active"
                    to={episode.fields.slug}
                    onClick={toggleMenu}
                  >
                    <h4 sx={{ fontSize: 16 }}>{episode.title}</h4>
                    {allMarkdownRemark.edges.map(({ node: markdown }) => {
                      if (markdown.frontmatter.id === episode.id)
                        return (
                          markdown.frontmatter.summary && (
                            <p key={markdown.id} className="summary">
                              {markdown.frontmatter.summary}
                            </p>
                          )
                        )
                      else return null
                    })}
                  </Link>
                  {episode.id !== context.state.id && (
                    <button
                      tabIndex="-1"
                      onClick={() => context.setCurrentPlaying(episode)}
                    >
                      <PlayIcon aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </EpisodeConsumer>
  )
}

const clickOutsideConfig = {
  handleClickOutside: () => Navigation.handleClickOutside,
}

export default onClickOutside(Navigation, clickOutsideConfig)
