import { defineCollection, z } from 'astro:content'

const episodes = defineCollection({
  type: 'content',
  schema: z.object({
    createdTime: z.coerce.string(),
    lastEditedTime: z.coerce.string(),
    page_id: z.string(),
    id: z.string(),
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
