import { config, collection, fields } from '@keystatic/core'

const episodeSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  id: fields.text({
    label: 'Episode ID',
    description: 'Must match RSS GUID for episode merging',
  }),
  season: fields.integer({ label: 'Season', defaultValue: 1 }),
  edition: fields.select({
    label: 'Rules Edition',
    options: [
      { label: 'D&D 5e', value: '5e' },
      { label: 'D&D 5.5e (2024)', value: '5.5e' },
    ],
    defaultValue: '5e',
  }),
  summary: fields.text({ label: 'Summary', multiline: true }),
  status: fields.select({
    label: 'Status',
    options: [
      { label: 'Unpublished', value: 'Unpublished' },
      { label: 'Published', value: 'Published' },
    ],
    defaultValue: 'Unpublished',
  }),
  image: fields.url({ label: 'Image URL' }),
  resources: fields.array(fields.text({ label: 'Resource link' }), {
    label: 'Resources',
    itemLabel: (props) => props.value,
  }),
  guestName: fields.text({ label: 'Guest Name' }),
  guestPhoto: fields.url({ label: 'Guest Photo URL' }),
  guestSummary: fields.text({ label: 'Guest Summary', multiline: true }),
  content: fields.markdoc({ label: 'Content', extension: 'md' }),
}

export default config({
  storage: { kind: 'local' },
  collections: {
    raw: collection({
      label: 'RaW Episodes',
      slugField: 'title',
      path: 'src/content/episodes/raw/*/',
      format: { contentField: 'content' },
      schema: episodeSchema,
    }),
    'short-rest': collection({
      label: 'Short Rest Episodes',
      slugField: 'title',
      path: 'src/content/episodes/short-rest/*/',
      format: { contentField: 'content' },
      schema: episodeSchema,
    }),
  },
})
