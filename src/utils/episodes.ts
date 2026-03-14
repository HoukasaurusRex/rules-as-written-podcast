import { getCollection } from 'astro:content'
import { fetchFeedData, type Episode } from './feed'

const RSS_FEED_URL = 'https://anchor.fm/s/44a4277c/podcast/rss'

type ShowType = 'RaW' | 'Short Rest'

export interface MergedEpisode extends Episode {
  slug: string
  markdown?: {
    title: string
    show: ShowType
    season?: number
    edition?: '5e' | '5.5e'
    summary?: string | null
    image?: string | null
    resources?: string[] | null
    guestName?: string | null
    guestPhoto?: string | null
    guestSummary?: string | null
  }
  body?: string
}

export async function getEpisodes(): Promise<MergedEpisode[]> {
  const publishedOnly = (entry: { data: { status: string } }) =>
    entry.data.status === 'Published'
  const [rssEpisodes, rawEntries, srEntries] = await Promise.all([
    fetchFeedData(RSS_FEED_URL),
    getCollection('raw', publishedOnly),
    getCollection('short-rest', publishedOnly),
  ])
  const taggedEntries = [
    ...rawEntries.map((e) => ({ ...e, show: 'RaW' as ShowType })),
    ...srEntries.map((e) => ({ ...e, show: 'Short Rest' as ShowType })),
  ]

  return rssEpisodes.map((episode) => {
    const content = taggedEntries.find((entry) => entry.data.id === episode.id)
    return {
      ...episode,
      season: content?.data.season ?? episode.season,
      slug: `show/${episode.number}/${episode.title
        .trim()
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')}`,
      markdown: content
        ? {
            title: content.data.title,
            show: content.show,
            season: content.data.season,
            edition: content.data.edition,
            summary: content.data.summary,
            image: content.data.image,
            resources: content.data.resources,
            guestName: content.data.guestName,
            guestPhoto: content.data.guestPhoto,
            guestSummary: content.data.guestSummary,
          }
        : undefined,
      body: content?.body,
    }
  })
}

export function getDescriptionFromHTML(html: string): string {
  const match = html.match(/<p>(.*?)<\/p>/)
  return match ? match[0].replace(/(<p>|<\/p>)/g, '') : html
}
