/** @jsx jsx */
import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { jsx, Flex, Box, Text, useThemeUI } from "theme-ui"
import { EpisodeConsumer } from "./context"
import { FaPlay as PlayIcon } from "react-icons/fa"
import { MdMenu as MenuIcon, MdClose as CloseMenuIcon } from "react-icons/md"
import onClickOutside from "react-onclickoutside"
import Link from "./link"
import Bars from "./bars"

function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)
  Navigation.handleClickOutside = () => setIsOpen(false)
  const twoDigits = n => (n.toString().length < 2 ? `0${n}` : n)
  const { theme } = useThemeUI()
  const { site, allEpisode, allMarkdownRemark } = useStaticQuery(graphql`
    query navQuery {
      site {
        siteMetadata {
          title
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
  allEpisode.nodes = allEpisode.nodes.sort((a, b) => b.number - a.number)
  const Logo = () => (
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
            <button
              sx={{
                position: "relative",
                zIndex: 998,
                display: "flex",
                p: 3,
                backgroundColor: "background",
                color: "text",
                borderColor: "backgroundLighten20",
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
              boxShadow: ['none', '5px 0 10px rgb(0 0 0 / 70%)'],
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
            <div sx={{ ml: 6, pb: 4 }}>
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
