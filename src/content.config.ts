import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/episodes' }),
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    show: z.string().optional(),
    summary: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    resources: z.array(z.string()).nullable().optional(),
    guestName: z.string().nullable().optional(),
    guestPhoto: z.string().nullable().optional(),
    guestSummary: z.string().nullable().optional(),
    status: z.string(),
  }),
})

export const collections = { episodes }
