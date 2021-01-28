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
  const dataFolder = path.join(__dirname, '/data')
  await fs.rmdir(dataFolder, { recursive: true })
  await fs.mkdir(dataFolder)
  await fs.writeFile(`${dataFolder}/rss.json`, JSON.stringify(data, null, 2))
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
      const episodeData: Episode = {
        pubDate: podcastData.pubDate,
        guid: podcastData.guid,
        title: podcastData.title,
        slug: toSlug(podcastData.title),
        videoId: videos[podcastData.title]?.videoId,
        enclosure: podcastData.enclosure,
        itunes: podcastData.itunes
      }
      if (!videos[podcastData.title]?.videoId) {
        return episodeData
      }
      const res = await fetch(
        `https://${transcriptsAPI}?videoId=${videos[podcastData.title]?.videoId}`
      )
      const json: {
        message: string
        data: Array<{ text: string; start: number; duration: number }>
      } = await res.json()
      episodeData.captions = json.data
      const episodeDataFolder = path.join(__dirname, `/episode-data`)
      await fs.rmdir(episodeDataFolder, { recursive: true })
      await fs.mkdir(episodeDataFolder)
      await fs.writeFile(
        `${episodeDataFolder}/${episodeData.slug}.json`,
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
  const mdPagesFolder = path.join(__dirname, `/markdown-pages`)
  await fs.rmdir(mdPagesFolder, { recursive: true })
  await fs.mkdir(mdPagesFolder)
  const pages = await Promise.all(
    episodeDataMap.map(async episode => {
      const { title, slug, videoId, captions, guid, pubDate, enclosure, itunes } = episode
      const text = captions?.map(caption => caption.text).join(' ') || ''
      const frontmatter = { title, slug, videoId: videoId || '', guid, pubDate, enclosure, itunes }
      const md = `---\n${YAML.stringify(frontmatter, 2)}\n---\n`
      await fs.writeFile(`${mdPagesFolder}/${episode.slug}.md`, md)
      return { frontmatter, md }
    })
  )
  createPagesTimer.end()
  return pages
}
