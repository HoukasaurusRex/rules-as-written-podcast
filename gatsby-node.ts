import fileSystem, { promises as fs } from 'fs'
import path from 'path'
import type { GatsbyNode, Reporter } from 'gatsby'
import fetch from 'node-fetch'
import { feedData } from './src/types'
import fetchFeedData from './src/fetch-feed-data'

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

export const onPreBuild: GatsbyNode['onPreBuild'] = async ({ reporter }) => {
  const data = await downloadRSSFeedData({ reporter })
  const latestEpisode = data?.items?.pop()
  const url = latestEpisode?.enclosure?.url
  if (url) {
    await downloadLatestEpisode({ url, reporter, fileName: `${latestEpisode?.guid}.mp3` })
  }
}
