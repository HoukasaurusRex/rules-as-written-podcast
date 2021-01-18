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
})()
