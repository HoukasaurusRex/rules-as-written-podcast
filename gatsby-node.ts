import fileSystem, { promises as fs } from 'fs'
import path from 'path'
import type { GatsbyNode, Reporter } from 'gatsby'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import type { feedData, Videos, Episode } from './types/media-types'
import fetchFeedData from './src/fetch-feed-data'
import { listPlaylistVideos } from './src/yt-apis'
import { toSlug } from './src/utils/slug'

dotenv.config()

const { TRANSCRIPTS_API, YT_DATA_API_KEY, YT_PLAYLIST_ID } = process.env

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

const downloadPlaylistVideos = async ({
  reporter,
  apiKey,
  playlistId
}: {
  reporter: Reporter
  apiKey: string
  playlistId: string
}): Promise<Videos> => {
  const listPlaylistVideosTimer = reporter.activityTimer('listPlaylistVideos')
  // const listCaptionsTimer = reporter.activityTimer('listCaptions')
  // const dlCaptionsTimer = reporter.activityTimer('dlCaptions')
  listPlaylistVideosTimer.start()
  const playlistVideos = await listPlaylistVideos({ apiKey, playlistId })
  listPlaylistVideosTimer.end()
  // listCaptionsTimer.start()
  // const captions =
  //   playlistVideos &&
  //   (await Promise.all(
  //     playlistVideos.map(
  //       async video =>
  //         video?.contentDetails?.videoId &&
  //         listCaptions({ apiKey, videoId: video?.contentDetails?.videoId })
  //     )
  //   ))
  // listCaptionsTimer.end()
  // dlCaptionsTimer.start()
  // const downloads =
  //   captions &&
  //   (await Promise.all(
  //     captions.map(
  //       async caption =>
  //         caption && caption[0]?.id && downloadCaptions({ apiKey, id: caption[0].id })
  //     )
  //   ).catch((err: Error) => {
  //     reporter.error(err)
  //     throw err
  //   }))
  // dlCaptionsTimer.end()
  // downloads?.forEach(dl => {
  //   reporter.info(JSON.stringify(dl, undefined, 2))
  // })
  const videosDataMap: {
    [title: string]: {
      videoId?: string | null
      videoPublishedAt?: string | null
    }
  } = {}
  playlistVideos?.forEach(video => {
    if (video.snippet?.title) {
      videosDataMap[video.snippet.title] = {
        videoId: video.contentDetails?.videoId,
        videoPublishedAt: video.contentDetails?.videoPublishedAt
      }
    }
  })
  return videosDataMap
}

const writeEpisodeDataMap = async (
  feed: feedData,
  videos: Videos
): Promise<Array<Episode> | null> => {
  if (!feed.items) {
    return null
  }
  const episodeDataMap = await Promise.all(
    feed.items.map(async podcastData => {
      const res = await fetch(
        `https://${TRANSCRIPTS_API}?videoId=${videos[podcastData.title]?.videoId}`
      )
      const json: {
        statusCode: number
        body: { message: string; data: Array<{ text: string; start: number; duration: number }> }
      } = await res.json()
      const episodeData = {
        date: podcastData.pubDate,
        guid: podcastData.guid,
        title: podcastData.title,
        slug: toSlug(podcastData.title),
        videoId: videos[podcastData.title]?.videoId,
        captions: json.body?.data
      }
      await fs.writeFile(
        path.join(__dirname, `/src/episode-data/${episodeData.slug}.json`),
        JSON.stringify(episodeData, null, 2)
      )
      return episodeData
    })
  )

  return episodeDataMap
}

const writeTranscripts = async (episodeDataMap: Array<Episode> | null) => {
  if (!episodeDataMap) {
    return
  }
  await Promise.all(
    episodeDataMap.map(async episode => {
      const { title, slug, videoId, captions, guid, date } = episode
      const text = captions?.map(caption => caption.text).join(' ')
      const frontmatter = { title, slug, videoId, guid, date }
      const md = `
    ---
    ${JSON.stringify(frontmatter, null, 2)}
    ---

    ${text}
    `
      await fs.writeFile(path.join(__dirname, `/src/markdown-pages/${episode.slug}.md`), md)
    })
  )
}
export const onPreExtractQueries: GatsbyNode['onPreExtractQueries'] = async ({ reporter }) => {
  reporter.info('HIT onPreExtractQueries')
}

export const onPreInit: GatsbyNode['onPreInit'] = async ({ reporter }) => {
  reporter.info('HIT onPreInit')
  reporter.info(process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'development') return
  const feed = await downloadRSSFeedData({ reporter })
  const latestEpisode = feed.items?.pop()
  const url = latestEpisode?.enclosure?.url
  if (url) {
    await downloadLatestEpisode({ url, reporter, fileName: `${latestEpisode?.guid}.mp3` })
  }
  const videos =
    YT_DATA_API_KEY && YT_PLAYLIST_ID
      ? await downloadPlaylistVideos({
          reporter,
          apiKey: YT_DATA_API_KEY,
          playlistId: YT_PLAYLIST_ID
        })
      : {}
  const episodeDataMap = TRANSCRIPTS_API ? await writeEpisodeDataMap(feed, videos) : null
  await writeTranscripts(episodeDataMap)
}

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const episodePostTemplate = path.resolve('src/templates/episode.tsx')
  const result: {
    errors?: any
    data?: {
      allMarkdownRemark: {
        edges: Array<{
          node: {
            frontmatter: {
              slug: string
              title: string
              guid: string
              videoId: string
              date: string
            }
          }
        }>
      }
    }
  } = await graphql(`
    {
      allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }, limit: 1000) {
        edges {
          node {
            frontmatter {
              date
              slug
              title
              guid
              videoId
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
      context: {
        slug: node.frontmatter.slug,
        date: node.frontmatter.date,
        title: node.frontmatter.title,
        guid: node.frontmatter.guid,
        videoId: node.frontmatter.videoId
      }
    })
  })
}
