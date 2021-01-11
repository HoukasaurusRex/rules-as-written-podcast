import fileSystem, { promises as fs } from 'fs'
import path from 'path'
import type { GatsbyNode, Reporter } from 'gatsby'
import { createFilePath } from 'gatsby-source-filesystem'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { feedData } from './src/types'
import fetchFeedData from './src/fetch-feed-data'
import { listPlaylistVideos, listCaptions, downloadCaptions } from './src/yt-apis'

dotenv.config()

const downloadRSSFeedData = async ({ reporter }: { reporter: Reporter }): Promise<feedData> => {
  const fetchFeedDataTimer = reporter.activityTimer('Retrieving RSS feed data')
  const writeDataTimer = reporter.activityTimer('Writing feed data to src/data/rss.json')
  fetchFeedDataTimer.start()
  const data = await fetchFeedData({ request: fetch })
  fetchFeedDataTimer.end()
  const rssFilePath = path.join(__dirname, '/src/data/rss.json')
  writeDataTimer.start()
  await fs.writeFile(rssFilePath, JSON.stringify(data, undefined, 2))
  writeDataTimer.end()
  return data
}

const downloadLatestEpisode = ({
  url,
  reporter,
  fileName
}: {
  url: string
  reporter: Reporter
  fileName: string
}) =>
  new Promise((resolve, reject) => {
    const fetchLatestEpisodeTimer = reporter.activityTimer('Retrieving latest episode file')
    const writeDataTimer = reporter.activityTimer(`Writing episode data to src/data/${fileName}`)
    fetchLatestEpisodeTimer.start()
    fetch(url).then(res => {
      fetchLatestEpisodeTimer.end()
      const latestEpisodeFilePath = path.join(__dirname, `/src/data/${fileName}`)
      writeDataTimer.start()
      const fileStream = fileSystem.createWriteStream(latestEpisodeFilePath)
      res.body.pipe(fileStream)
      res.body.on('error', reject)
      fileStream.on('finish', () => {
        writeDataTimer.end()
        resolve(fileStream)
      })
    })
  })

const downloadCaptionsToMD = async ({
  reporter,
  apiKey,
  playlistId
}: {
  reporter: Reporter
  apiKey: string
  playlistId: string
}) => {
  const listPlaylistVideosTimer = reporter.activityTimer('listPlaylistVideos')
  const listCaptionsTimer = reporter.activityTimer('listCaptions')
  const dlCaptionsTimer = reporter.activityTimer('dlCaptions')
  listPlaylistVideosTimer.start()
  const playlistVideos = await listPlaylistVideos({ apiKey, playlistId })
  listPlaylistVideosTimer.end()
  listCaptionsTimer.start()
  const captions =
    playlistVideos &&
    (await Promise.all(
      playlistVideos.map(
        async video =>
          video?.contentDetails?.videoId &&
          listCaptions({ apiKey, videoId: video?.contentDetails?.videoId })
      )
    ))
  listCaptionsTimer.end()
  dlCaptionsTimer.start()
  const downloads =
    captions &&
    (await Promise.all(
      captions.map(
        async caption =>
          caption && caption[0]?.id && downloadCaptions({ apiKey, id: caption[0].id })
      )
    ))
  dlCaptionsTimer.end()
  downloads?.forEach(dl => {
    reporter.info(JSON.stringify(dl, undefined, 2))
  })
  // map downloads to playlistVideos snippets
  // write to files
  // return map
}

export const onPreBootstrap: GatsbyNode['onPreBootstrap'] = async ({ reporter }) => {
  const data = await downloadRSSFeedData({ reporter })
  const latestEpisode = data?.items?.pop()
  const url = latestEpisode?.enclosure?.url
  if (url) {
    await downloadLatestEpisode({ url, reporter, fileName: `${latestEpisode?.guid}.mp3` })
  }
  const { YT_DATA_API_KEY: apiKey, YT_PLAYLIST_ID: playlistId } = process.env
  if (apiKey && playlistId) {
    await downloadCaptionsToMD({ reporter, apiKey, playlistId })
  }
}

export const onCreateNode: GatsbyNode['onCreateNode'] = ({ node, getNode, reporter }) => {
  if (node.internal.type === 'MarkdownRemark' && node.parent) {
    const filePath = createFilePath({ node, getNode, basePath: 'pages' })
    reporter.info(`Node created of type "${node.internal.type}"`)
  }
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions }) => {
  const { createPage } = actions
  const episodePostTemplate = path.resolve('src/templates/episode.tsx')
  const rssFeedData = await import('./src/data/rss.json')

  rssFeedData.items.forEach(item => {
    const slug = item.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
    createPage({
      path: slug,
      component: episodePostTemplate,
      context: {
        title: item.title
      }
    })
  })
}
