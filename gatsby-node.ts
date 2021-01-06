import fileSystem, { promises as fs } from 'fs'
import progress from 'progress-stream'
import path from 'path'
import type { GatsbyNode, Reporter } from 'gatsby'
import type { IProgressReporter } from 'gatsby-cli/lib/reporter/reporter-progress'
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

const downloadLatestEpisode = async ({
  url,
  reporter,
  fileName
}: {
  url: string
  reporter: Reporter
  fileName: string
}) => {
  const fetchLatestEpisodeTimer = reporter.activityTimer('Retrieving latest episode file')
  const writeDataTimer = reporter.activityTimer(`Writing episode data to src/data/${fileName}`)
  fetchLatestEpisodeTimer.start()
  const res = await fetch(url)
  fetchLatestEpisodeTimer.end()
  const latestEpisodeFilePath = path.join(__dirname, `/src/data/${fileName}`)
  writeDataTimer.start()
  const fileStream = fileSystem.createWriteStream(latestEpisodeFilePath)
  res.body.pipe(fileStream)
  res.body.on('error', Promise.reject)
  const { resolve } = Promise
  const stat = fileSystem.statSync(latestEpisodeFilePath)
  const stream = progress({
    length: stat.size,
    time: 100 /* ms */
  })
  let prevTransferred = 0
  let progressReport: IProgressReporter

  stream.on('progress', ({ length, transferred, eta, percentage }) => {
    const increment = transferred - prevTransferred
    reporter.info(`ETA: ${eta}, ${percentage}%`)
    progressReport = reporter.createProgress('Downloading episode ', length)
    progressReport.start()
    progressReport.tick(transferred)
    prevTransferred = transferred
  })
  res.body.pipe(stream)
  fileStream.on('finish', () => {
    progressReport.done()
    writeDataTimer.end()
    resolve(fileStream)
  })
  return resolve
}

export const onPreBuild: GatsbyNode['onPreBuild'] = async ({ reporter }) => {
  const data = await downloadRSSFeedData({ reporter })
  const latestEpisode = data?.items?.pop()
  const url = latestEpisode?.enclosure?.url
  if (url) {
    await downloadLatestEpisode({ url, reporter, fileName: `${latestEpisode?.guid}.mp3` })
  }
}
