import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const episodeSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  season: z.number().optional(),
  edition: z.enum(['5e', '5.5e']).optional(),
  summary: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  resources: z.array(z.string()).nullable().optional(),
  guestName: z.string().nullable().optional(),
  guestPhoto: z.string().nullable().optional(),
  guestSummary: z.string().nullable().optional(),
  status: z.string(),
})

const raw = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/episodes/raw' }),
  schema: episodeSchema,
})

const shortRest = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/episodes/short-rest' }),
  schema: episodeSchema,
})

export const collections = { raw, 'short-rest': shortRest }
