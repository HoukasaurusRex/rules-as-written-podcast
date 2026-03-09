import { resolve } from 'node:path'
import { downloadNotionPages } from '../src/utils/notion'

const notionToken = process.env.NOTION_TOKEN
const notionDatabaseId = process.env.NOTION_DB_ID
const markdownPath = resolve(import.meta.dirname, '../src/content/episodes')

async function main() {
  if (!notionToken || !notionDatabaseId) {
    console.warn('NOTION_TOKEN or NOTION_DB_ID not set, skipping content fetch')
    return
  }

  console.log('Fetching content from Notion...')
  await downloadNotionPages({ notionToken, notionDatabaseId, markdownPath })
  console.log('Content fetched successfully')
}

main().catch((err) => {
  console.error('Failed to fetch content:', err)
  process.exit(1)
})
