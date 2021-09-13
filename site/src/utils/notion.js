const { Client, LogLevel } = require("@notionhq/client")
const YAML = require('yaml')
const fs = require('fs').promises
const { slugify } = require('./utils')

const blockToMD = (block) => {
  const { type } = block
  if (type == 'unsupported') return ''
  const text = block[type].text.map(val => val.text.content).join('\n')
  switch (type) {
    case 'paragraph':
      return `${text}`
    case 'heading_1':
      return `# ${text}`
    case 'heading_2':
      return `## ${text}`
    case 'heading_3':
      return `### ${text}`
    case 'numbered_list_item':
      return `- ${text}`
    case 'bulleted_list_item':
      return `${text}`
    default:
      return `${text}`
  }
}

const shapeMetadata = (meta) => ({
  createdTime: meta.created_time,
  lastEditedTime: meta.last_edited_time,
  page_id: meta.id,
  id: meta.properties['id'].rich_text[0]?.plain_text,
  title: meta.properties['Name'].title[0].text.content,
  show: meta.properties['Show']?.select?.name,
  summary: meta.properties['Summary'].rich_text[0]?.plain_text,
  image: meta.properties['Image']?.url,
  resources: meta.properties['Resources'].rich_text[0]?.plain_text.split(',').map(link => `[${link}](${link})`),
  guestName: meta.properties['Guest Name'].rich_text[0]?.plain_text,
  guestPhoto: meta.properties['Guest Photo']?.url,
  guestSummary: meta.properties['Guest Summary'].rich_text[0]?.plain_text,
  status: meta.properties['Status'].select.name
})

const getPagesMeta = async(notion, { notionPagesDatabaseId }) => {
  const pagesMeta = await notion.databases.query({
    database_id: notionPagesDatabaseId,
    filter: {
      property: "Status",
      select: {
        equals: "Published",
      },
    }
  })
  return pagesMeta.results.map(meta => shapeMetadata(meta))
}

const getPageContent = (notion, { pageId }) => notion.blocks.children.list({ block_id: pageId })

const pageContentToMD = (pageContent) => pageContent.results.map(block => blockToMD(block)).join('\n\n')

const downloadNotionPages = async({ notion_token, notion_pages_database_id, markdownPath }) => {
  const notion = new Client({
    auth: notion_token,
    logLevel: LogLevel[process.env.LOG_LEVEL] || LogLevel.WARN
  })
  const pagesMeta = await getPagesMeta(notion, { notionPagesDatabaseId: notion_pages_database_id })
  await Promise.all(pagesMeta.map(async(meta) => {
    const pageContent = await getPageContent(notion, { pageId: meta.page_id })
    const md = pageContentToMD(pageContent)
    const pageDir = `${markdownPath}/${slugify(meta.title)}`
    await fs.mkdir(pageDir, { recursive: true })
    await fs.writeFile(`${pageDir}/index.md`, `---\n${YAML.stringify(meta)}---\n\n${md}\n`)
  }))
}

module.exports = downloadNotionPages
