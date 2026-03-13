export const prerender = true

import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getEpisodes } from '@utils/episodes'
import { slugify } from '@utils/slugify'

export async function GET(context: APIContext) {
  const episodes = await getEpisodes()

  return rss({
    title: 'Rules as Written',
    description:
      'A weekly podcast where we talk about the rules in as many D&D 5E books we can afford to help you level up your player game.',
    site: context.site!,
    items: episodes.map((episode) => ({
      title: episode.title,
      description: episode.description,
      link: `/show/${episode.number}/${slugify(episode.title)}/`,
      pubDate: new Date(),
      enclosure: {
        url: episode.enclosure_url,
        type: 'audio/mpeg',
        length: 0,
      },
    })),
  })
}
