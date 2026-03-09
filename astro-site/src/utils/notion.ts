import { Client, LogLevel } from '@notionhq/client'
import type {
  BlockObjectResponse,
  RichTextItemResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import YAML from 'yaml'
import { mkdir, writeFile } from 'node:fs/promises'
import { slugify } from './slugify'

interface EpisodeMeta {
  createdTime: string
  lastEditedTime: string
  page_id: string
  id: string | undefined
  title: string
  show: string | undefined
  summary: string | undefined
  image: string | null | undefined
  resources: string[] | null | undefined
  guestName: string | undefined
  guestPhoto: string | null | undefined
  guestSummary: string | undefined
  status: string
}

function getRichText(prop: { rich_text: RichTextItemResponse[] }): string | undefined {
  return prop.rich_text[0]?.plain_text
}

function blockToMD(block: BlockObjectResponse): string {
  const type = block.type
  // @ts-expect-error -- dynamic block type access
  const richText = block[type]?.rich_text as RichTextItemResponse[] | undefined
  if (!richText?.length) return ''

  const text = richText.map((val) => val.plain_text).join('\n')
  switch (type) {
    case 'paragraph':
      return text
    case 'heading_1':
      return `# ${text}`
    case 'heading_2':
      return `## ${text}`
    case 'heading_3':
      return `### ${text}`
    case 'numbered_list_item':
      return `- ${text}`
    case 'bulleted_list_item':
      return text
    default:
      return text
  }
}

function shapeMetadata(meta: PageObjectResponse): EpisodeMeta {
  const props = meta.properties
const idProp = props['id'] as { rich_text: RichTextItemResponse[] }
const titleProp = props['Name'] as { title: { text: { content: string } }[] }
const showProp = props['Show'] as { select?: { name: string } }
const summaryProp = props['Summary'] as { rich_text: RichTextItemResponse[] }
const imageProp = props['Image'] as { url?: string | null }
const resourcesProp = props['Resources'] as { rich_text: RichTextItemResponse[] }
const guestNameProp = props['Guest Name'] as { rich_text: RichTextItemResponse[] }
const guestPhotoProp = props['Guest Photo'] as { url?: string | null }
const guestSummaryProp = props['Guest Summary'] as { rich_text: RichTextItemResponse[] }
const statusProp = props['Status'] as { select: { name: string } }

  const resourcesText = getRichText(resourcesProp)

  return {
    createdTime: meta.created_time,
    lastEditedTime: meta.last_edited_time,
    page_id: meta.id,
    id: getRichText(idProp),
    title: titleProp.title[0].text.content,
    show: showProp?.select?.name,
    summary: getRichText(summaryProp),
    image: imageProp?.url,
    resources: resourcesText
      ? resourcesText.split(',').map((link) => `[${link.trim()}](${link.trim()})`)
      : null,
    guestName: getRichText(guestNameProp),
    guestPhoto: guestPhotoProp?.url,
    guestSummary: getRichText(guestSummaryProp),
    status: statusProp.select.name,
  }
}

export async function downloadNotionPages({
  notionToken,
  notionDatabaseId,
  markdownPath,
}: {
  notionToken: string
  notionDatabaseId: string
  markdownPath: string
}): Promise<void> {
  const notion = new Client({
    auth: notionToken,
    logLevel: (LogLevel as Record<string, LogLevel>)[process.env.LOG_LEVEL ?? ''] || LogLevel.WARN,
  })

  const pagesResponse = await notion.databases.query({
    database_id: notionDatabaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
  })

  const pagesMeta = pagesResponse.results.map((meta) =>
    shapeMetadata(meta as PageObjectResponse),
  )

  await Promise.all(
    pagesMeta.map(async (meta) => {
      const pageContent = await notion.blocks.children.list({ block_id: meta.page_id })
      const md = pageContent.results
        .map((block) => blockToMD(block as BlockObjectResponse))
        .join('\n\n')

      const pageDir = `${markdownPath}/${slugify(meta.title)}`
      await mkdir(pageDir, { recursive: true })
      await writeFile(`${pageDir}/index.md`, `---\n${YAML.stringify(meta)}---\n\n${md}\n`)
    }),
  )
}
