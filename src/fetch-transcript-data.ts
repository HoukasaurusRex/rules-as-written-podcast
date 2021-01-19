import fileSystem, { promises as fs } from 'fs'
import path from 'path'
import type { Reporter } from 'gatsby'
import fetch from 'node-fetch'
import YAML from 'yamljs'
import type { feedData, Videos, Episode } from '../types/media-types'
import fetchFeedData from './fetch-feed-data'
import { listPlaylistVideos } from './yt-apis'
import { toSlug } from './utils/slug'

export const downloadRSSFeedData = async ({
  reporter
}: {
  reporter: Reporter
}): Promise<feedData> => {
  const fetchFeedDataTimer = reporter.activityTimer('Downloading RSS feed data')
  fetchFeedDataTimer.start()
  const data = await fetchFeedData({ request: fetch })
  const rssFilePath = path.join(__dirname, '/data/rss.json')
  await fs.writeFile(rssFilePath, JSON.stringify(data, null, 2))
  fetchFeedDataTimer.end()
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
    const dlLatestEpisodeTimer = reporter.activityTimer(
      `Downloading latest episode audio file for cache to  data/${fileName}`
    )
    dlLatestEpisodeTimer.start()
    return fetch(url).then(res => {
      const latestEpisodeFilePath = path.join(__dirname, `/data/${fileName}`)
      const fileStream = fileSystem.createWriteStream(latestEpisodeFilePath)
      res.body.pipe(fileStream)
      res.body.on('error', reject)
      fileStream.on('finish', () => {
        dlLatestEpisodeTimer.end()
        return resolve(fileStream)
      })
    })
  })

export const getPlaylistVideos = async ({
  reporter,
  apiKey,
  playlistId
}: {
  reporter: Reporter
  apiKey: string
  playlistId: string
}): Promise<Videos> => {
  const listPlaylistVideosTimer = reporter.activityTimer('Fetching playlist data from YouTube')
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

export const downloadEpisodeData = async ({
  feed,
  videos,
  reporter,
  transcriptsAPI
}: {
  feed: feedData
  videos: Videos
  reporter: Reporter
  transcriptsAPI: string
}): Promise<Array<Episode> | null> => {
  if (!feed.items) {
    return null
  }
  const dlTranscriptTimer = reporter.activityTimer('Downloading transcripts')
  dlTranscriptTimer.start()
  const episodeDataMap = await Promise.all(
    feed.items.map(async podcastData => {
      const res = await fetch(
        `https://${transcriptsAPI}?videoId=${videos[podcastData.title]?.videoId}`
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
      return episodeData
    })
  )
  dlTranscriptTimer.end()

  return episodeDataMap
}

export const createMD = async ({
  episodeDataMap,
  reporter
}: {
  episodeDataMap: Array<Episode> | null
  reporter: Reporter
}): Promise<Array<{ frontmatter: Episode; md: string }>> => {
  if (!episodeDataMap) {
    throw new Error(`Expecting episodeDataMap but received ${episodeDataMap}`)
  }
  const createPagesTimer = reporter.activityTimer('Creating markdown pages')
  createPagesTimer.start()
  const pages = await Promise.all(
    episodeDataMap.map(async episode => {
      const { title, slug, videoId, captions, guid, date } = episode
      const text = captions?.map(caption => caption.text).join(' ')
      const frontmatter = { title, slug, videoId: videoId || '', guid, date }
      const md = `---\n${YAML.stringify(frontmatter, 2)}\n---\n${text}`
      await fs.writeFile(path.join(__dirname, `/markdown-pages/${episode.slug}.md`), md)
      return { frontmatter, md }
    })
  )
  createPagesTimer.end()
  return pages
}
