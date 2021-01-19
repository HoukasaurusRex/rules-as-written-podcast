import path from 'path'
import { promises as fs } from 'fs'
import reporter from 'gatsby-cli/lib/reporter'
import dotenv from 'dotenv'
import {
  writeEpisodeDataMap,
  writeTranscripts,
  downloadRSSFeedData,
  downloadPlaylistVideos,
  downloadLatestEpisode
} from './src/fetch-transcript-data'

dotenv.config()

const { TRANSCRIPTS_API, YT_DATA_API_KEY, YT_PLAYLIST_ID } = process.env

;(async () => {
  reporter.info(__dirname)
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
  const episodeDataMap = TRANSCRIPTS_API
    ? await writeEpisodeDataMap({ feed, videos, reporter })
    : null
  const transcripts = await writeTranscripts({ episodeDataMap, reporter })
  const files = await fs.readdir(path.join(__dirname, '/src/markdown-pages/'))
  reporter.info(JSON.stringify(files, undefined, 2))
  reporter.info(transcripts[0])
})()
