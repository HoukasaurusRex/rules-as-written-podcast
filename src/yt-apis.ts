import { youtube_v3, google } from 'googleapis' // eslint-disable-line camelcase
import type { GaxiosResponse } from 'gaxios'

export const listPlaylistVideos = async ({
  playlistId,
  apiKey
}: {
  playlistId: string
  apiKey: string
  // eslint-disable-next-line camelcase
}): Promise<youtube_v3.Schema$PlaylistItem[] | undefined> => {
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey
  })
  const res = await youtube.playlistItems.list({
    part: ['snippet'],
    playlistId
  })
  return res.data.items
}

export const listCaptions = async ({
  videoId,
  apiKey
}: {
  videoId: string
  apiKey: string
  // eslint-disable-next-line camelcase
}): Promise<youtube_v3.Schema$Caption[] | undefined> => {
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey
  })
  const res = await youtube.captions.list({
    part: ['snippet'],
    videoId
  })
  return res.data.items
}

export const downloadCaptions = async ({
  id,
  apiKey
}: {
  id: string
  apiKey: string
  // eslint-disable-next-line camelcase
}) => {
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey
  })
  const res = await youtube.captions.download({
    id,
    tfmt: 'srt'
  })
  console.log({ res })
  return res
}
