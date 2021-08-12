/** @jsx jsx */
import React from "react"
import { jsx } from "theme-ui"
import { graphql, useStaticQuery } from "gatsby"

const EpisodeContext = React.createContext()

export function EpisodeProvider(props) {
  const { allEpisode } = useStaticQuery(graphql`
    {
      allEpisode {
        totalCount
        nodes {
          id
          title
          description
          number
          enclosure_url
          fields {
            slug
          }
        }
      }
    }
  `)

  const [currentPlaying, setCurrentPlaying] = React.useState(allEpisode.nodes[0])

  return (
    <EpisodeContext.Provider
      value={{
        state: currentPlaying,
        setCurrentPlaying,
      }}
      {...props}
    />
  )
}

export const EpisodeConsumer = ({ children }) => (
  <EpisodeContext.Consumer>{children}</EpisodeContext.Consumer>
)
