import type nodeFetch from 'node-fetch'
import { feedData, feedAPIResponseBody } from './types'

type fetchFeedDataConfig = {
  feedURL?: string
  request?: typeof fetch | typeof nodeFetch
  requestConfig?: RequestInit & import('node-fetch').RequestInit
}
const fetchFeedData = async (config: fetchFeedDataConfig = {}): Promise<feedData> => {
  const {
    request = fetch,
    feedURL = 'https://anchor.fm/s/44a4277c/podcast/rss',
    requestConfig
  } = config
  const res = await request(
    `https://api.houk.space/feed-to-json?url=${encodeURIComponent(feedURL)}`,
    requestConfig
  )
  const body: feedAPIResponseBody = await res.json()
  return body.data
}

export default fetchFeedData
