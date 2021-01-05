import { promises as fs } from 'fs'
import path from 'path'
import { GatsbyNode } from 'gatsby'
import fetch from 'node-fetch'
import fetchFeedData from './src/fetch-feed-data'

export const onPreBuild: GatsbyNode['onPreBuild'] = async ({ reporter }) => {
  const fetchFeedDataTimer = reporter.activityTimer('Retrieved RSS feed data')
  fetchFeedDataTimer.start()
  const data = await fetchFeedData({ request: fetch })
  fetchFeedDataTimer.end()
  const rssFilePath = path.join(__dirname, '/src/data/rss.json')
  const writeDataTimer = reporter.activityTimer(`Wrote feed data to ${rssFilePath}`)
  writeDataTimer.start()
  await fs.writeFile(rssFilePath, JSON.stringify(data, undefined, 2))
  writeDataTimer.end()
}
