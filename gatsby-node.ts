import path from 'path'
import type { GatsbyNode } from 'gatsby'
import dotenv from 'dotenv'
import proxy from 'node-global-proxy'
import {
  downloadEpisodeData,
  createMD,
  downloadRSSFeedData,
  getPlaylistVideos,
  downloadLatestEpisode
} from './src/fetch-transcript-data'
import { Episode } from './types/media-types'

dotenv.config()

const { TRANSCRIPTS_API, YT_DATA_API_KEY, YT_PLAYLIST_ID, PROXY_URL } = process.env

export const onPreInit: GatsbyNode['onPreInit'] = async ({ reporter }) => {
  if (PROXY_URL) {
    // This is necessary if you're like me and live behind the China GFW and need to access Google APIs
    proxy.system()
    proxy.setConfig({
      http: `http://${PROXY_URL}`,
      https: `http://${PROXY_URL}`
    })
    proxy.start()
  }
  const feed = await downloadRSSFeedData({ reporter })
  const latestEpisode = feed.items && feed.items[0]
  const url = latestEpisode?.enclosure?.url
  if (url) {
    await downloadLatestEpisode({ url, reporter, fileName: `${latestEpisode?.guid}.mp3` })
  }
  const videos =
    YT_DATA_API_KEY && YT_PLAYLIST_ID
      ? await getPlaylistVideos({
          reporter,
          apiKey: YT_DATA_API_KEY,
          playlistId: YT_PLAYLIST_ID
        })
      : {}
  const episodeDataMap = TRANSCRIPTS_API
    ? await downloadEpisodeData({ feed, videos, reporter, transcriptsAPI: TRANSCRIPTS_API })
    : null
  const pages = await createMD({ episodeDataMap, reporter })
  reporter.info(
    `Successfully created pages:\n${JSON.stringify(
      pages.map(p => p.frontmatter.slug),
      null,
      2
    )}`
  )
  if (proxy.started) {
    proxy.stop()
  }
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const episodePostTemplate = path.resolve('src/templates/episode-page.tsx')
  const result: {
    errors?: any
    data?: {
      allMarkdownRemark: {
        edges: Array<{
          node: {
            frontmatter: Episode
          }
        }>
      }
    }
  } = await graphql(`
    {
      allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___pubDate] }, limit: 1000) {
        edges {
          node {
            frontmatter {
              pubDate
              slug
              title
              guid
              videoId
              enclosure {
                url
              }
              itunes {
                duration
              }
            }
          }
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }
  result.data?.allMarkdownRemark.edges.forEach(({ node }) => {
    if (!node.frontmatter.slug) return
    createPage({
      path: node.frontmatter.slug,
      component: episodePostTemplate,
      context: node.frontmatter
    })
  })
}
