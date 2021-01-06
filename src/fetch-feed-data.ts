import type nodeFetch from 'node-fetch' // eslint-disable-line import/no-duplicates
import type {
  BodyInit as NodeBodyInit,
  HeadersInit as NodeHeadersInit,
  RequestInit as NodeRequestInit
} from 'node-fetch' // eslint-disable-line import/no-duplicates
import type { AbortSignal as NodeAbortSignal } from 'node-fetch/externals' // eslint-disable-line import/no-unresolved
import { feedData, feedAPIResponseBody } from './types'

interface RequestConfig extends RequestInit, NodeRequestInit {
  body: BodyInit & NodeBodyInit
  headers: HeadersInit & NodeHeadersInit
  signal: AbortSignal & NodeAbortSignal
}

interface FetchFeedDataConfig {
  feedURL?: string
  request?: typeof fetch | typeof nodeFetch
  requestConfig?: RequestConfig
}

const fetchFeedData = async (config: FetchFeedDataConfig = {}): Promise<feedData> => {
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
