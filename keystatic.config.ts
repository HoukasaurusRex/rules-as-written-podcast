import { config, collection, fields } from '@keystatic/core'

export default config({
  storage: { kind: 'local' },
  collections: {
    episodes: collection({
      label: 'Episodes',
      slugField: 'title',
      path: 'src/content/episodes/*/',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        id: fields.text({
          label: 'Episode ID',
          description: 'Must match RSS GUID for episode merging',
        }),
        show: fields.select({
          label: 'Show',
          options: [
            { label: 'Rules as Written', value: 'RaW' },
            { label: 'Short Rest', value: 'Short Rest' },
          ],
          defaultValue: 'RaW',
        }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Ideas', value: 'Ideas' },
            { label: 'Selected for Recording', value: 'Selected for Recording' },
            { label: 'Recorded', value: 'Recorded' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Published', value: 'Published' },
          ],
          defaultValue: 'Draft',
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
      },
    }),
  },
})
