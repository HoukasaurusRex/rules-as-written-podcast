import { getCollection } from 'astro:content'
import { fetchFeedData, type Episode } from './feed'

const RSS_FEED_URL = 'https://anchor.fm/s/44a4277c/podcast/rss'

export interface MergedEpisode extends Episode {
  slug: string
  markdown?: {
    title: string
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
  const [rssEpisodes, contentEntries] = await Promise.all([
    fetchFeedData(RSS_FEED_URL),
    getCollection('episodes', (entry) => entry.data.status === 'Published'),
  ])

  return rssEpisodes.map((episode) => {
    const content = contentEntries.find((entry) => entry.data.id === episode.id)
    return {
      ...episode,
      slug: `show/${episode.number}/${episode.title
        .trim()
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')}`,
      markdown: content
        ? {
            title: content.data.title,
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
