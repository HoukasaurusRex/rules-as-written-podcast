import { promises as fs } from 'fs'
import { GatsbyNode } from 'gatsby'
import fetchFeedData from './src/fetch-feed-data'

export const onPreBuild: GatsbyNode['onPreBuild'] = async ({ reporter }) => {
  reporter.info('onPreBuild')
  const data = await fetchFeedData()
  reporter.info('retrieved data')
  await fs.writeFile('./src/data/metadata.json', JSON.stringify(data, undefined, 2))
  reporter.info('done')
}
