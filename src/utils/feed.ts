import { XMLParser } from 'fast-xml-parser'

export interface Episode {
  id: string
  title: string
  number: number
  description: string
  enclosure_url: string
  season: number
}

interface RSSItem {
  guid: string | { '#text': string }
  title: string
  'itunes:summary'?: string
  description?: string
  enclosure?: { '@_url': string } | { url: string }
  'itunes:season'?: number
}

interface RSSFeed {
  rss: {
    channel: {
      item: RSSItem[]
    }
  }
}

export async function fetchFeedData(rssFeedURL: string): Promise<Episode[]> {
  const res = await fetch(rssFeedURL)
  const xml = await res.text()

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })
  const feed: RSSFeed = parser.parse(xml)
  const items = feed.rss.channel.item

  return createCollection(items)
}

function createCollection(items: RSSItem[]): Episode[] {
  return items
    .map((item, idx) => ({
      id: typeof item.guid === 'string' ? item.guid : item.guid['#text'],
      title: item.title,
      number: items.length - idx,
      description: item['itunes:summary'] || item.description || '',
      enclosure_url:
        item.enclosure
          ? '@_url' in item.enclosure
            ? item.enclosure['@_url']
            : item.enclosure.url
          : '',
      season: item['itunes:season'] || 1,
    }))
    .sort((a, b) => b.number - a.number)
}
