import fileSystem, { promises as fs } from 'fs'
import path from 'path'
import type { Reporter } from 'gatsby'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import YAML from 'yamljs'
import type { feedData, Videos, Episode } from '../types/media-types'
import fetchFeedData from './fetch-feed-data'
import { listPlaylistVideos } from './yt-apis'
import { toSlug } from './utils/slug'

dotenv.config()

const { TRANSCRIPTS_API } = process.env

export const downloadRSSFeedData = async ({
  reporter
}: {
  reporter: Reporter
}): Promise<feedData> => {
  const fetchFeedDataTimer = reporter.activityTimer('Retrieving RSS feed data')
  const writeDataTimer = reporter.activityTimer('Writing feed data to data/rss.json')
  fetchFeedDataTimer.start()
  const data = await fetchFeedData({ request: fetch })
  fetchFeedDataTimer.end()
  const rssFilePath = path.join(__dirname, '/data/rss.json')
  writeDataTimer.start()
  await fs.writeFile(rssFilePath, JSON.stringify(data, undefined, 2))
  writeDataTimer.end()
  return data
}

export const downloadLatestEpisode = ({
  url,
  reporter,
  fileName
}: {
  url: string
  reporter: Reporter
  fileName: string
}): Promise<fileSystem.WriteStream> =>
  new Promise((resolve, reject) => {
    const fetchLatestEpisodeTimer = reporter.activityTimer('Retrieving latest episode file')
    const writeDataTimer = reporter.activityTimer(`Writing episode data to data/${fileName}`)
    fetchLatestEpisodeTimer.start()
    return fetch(url).then(res => {
      fetchLatestEpisodeTimer.end()
      const latestEpisodeFilePath = path.join(__dirname, `/data/${fileName}`)
      writeDataTimer.start()
      const fileStream = fileSystem.createWriteStream(latestEpisodeFilePath)
      res.body.pipe(fileStream)
      res.body.on('error', reject)
      fileStream.on('finish', () => {
        writeDataTimer.end()
        return resolve(fileStream)
      })
    })
  })

export const downloadPlaylistVideos = async ({
  reporter,
  apiKey,
  playlistId
}: {
  reporter: Reporter
  apiKey: string
  playlistId: string
}): Promise<Videos> => {
  const listPlaylistVideosTimer = reporter.activityTimer('listPlaylistVideos')
  listPlaylistVideosTimer.start()
  const playlistVideos = await listPlaylistVideos({ apiKey, playlistId })
  listPlaylistVideosTimer.end()
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

export const writeEpisodeDataMap = async ({
  feed,
  videos,
  reporter
}: {
  feed: feedData
  videos: Videos
  reporter: Reporter
}): Promise<Array<Episode> | null> => {
  if (!feed.items) {
    return null
  }
  const dlTranscriptTimer = reporter.activityTimer('Downloading transcripts')
  dlTranscriptTimer.start()
  const episodeDataMap = await Promise.all(
    feed.items.map(async podcastData => {
      reporter.info(videos[podcastData.title]?.videoId || `No videoId for ${podcastData.title}`)
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
        path.join(__dirname, `/episode-data/${episodeData.slug}.json`),
        JSON.stringify(episodeData, null, 2)
      )
      reporter.info(
        `Created data: ${path.join(__dirname, `/episode-data/${episodeData.slug}.json`)}`
      )
      return episodeData
    })
  )
  dlTranscriptTimer.end()

  return episodeDataMap
}

export const writeTranscripts = async ({
  episodeDataMap,
  reporter
}: {
  episodeDataMap: Array<Episode> | null
  reporter: Reporter
}): Promise<Array<string>> => {
  if (!episodeDataMap) {
    throw new Error(`Expecting episodeDataMap but received ${episodeDataMap}`)
  }
  const writeTranscriptTimer = reporter.activityTimer('Writing episode pages')
  writeTranscriptTimer.start()
  const pages = await Promise.all(
    episodeDataMap.map(async episode => {
      const { title, slug, videoId, captions, guid, date } = episode
      const text = captions?.map(caption => caption.text).join(' ')
      const frontmatter = { title, slug, videoId: videoId || '', guid, date }
      const md = `---\n${YAML.stringify(frontmatter, 2)}\n---\n${text}`
      await fs.writeFile(path.join(__dirname, `/markdown-pages/${episode.slug}.md`), md)
      reporter.info(`Writing page to ${path.join(__dirname, `/markdown-pages/${episode.slug}.md`)}`)
      reporter.info(JSON.stringify(episode, null, 2))
      return md
    })
  )
  writeTranscriptTimer.end()
  return pages
}
