import Parser from 'rss-parser'
import { feedData, feedItem } from './types'

const parser: Parser<feedData, feedItem> = new Parser()

const fetchFeedData: () => Promise<feedData & Parser.Output<feedItem>> = () =>
  parser.parseURL('https://anchor.fm/s/44a4277c/podcast/rss')

export default fetchFeedData
