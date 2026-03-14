import { readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { AssemblyAI } from 'assemblyai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import YAML from 'yaml'
import { fetchFeedData, type Episode } from '../src/utils/feed'
import { slugify } from '../src/utils/slugify'

const RSS_FEED_URL = 'https://anchor.fm/s/44a4277c/podcast/rss'
const KEILA_BASE = 'https://mail.houk.space/api/v1'
const KEILA_SENDER_ID = 'nms_aJMpZgdr'
const KEILA_SEGMENT_ID = 'nsgm_aJMpZgdr'

async function main() {
  const episodeNumber = parseInt(process.argv[2], 10)
  if (!episodeNumber || isNaN(episodeNumber)) {
    console.error('Usage: yarn generate-article <episode-number>')
    process.exit(1)
  }

  const requiredEnv = ['ASSEMBLYAI_API_KEY', 'GEMINI_API_KEY', 'KEILA_API_KEY'] as const
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`)
      process.exit(1)
    }
  }

  console.log(`Fetching RSS feed...`)
  const episodes = await fetchFeedData(RSS_FEED_URL)
  const episode = episodes.find((e) => e.number === episodeNumber)
  if (!episode) {
    console.error(`Episode ${episodeNumber} not found in RSS feed`)
    console.error(`Available episodes: ${episodes.map((e) => e.number).join(', ')}`)
    process.exit(1)
  }
  console.log(`Found: "${episode.title}" (${episode.enclosure_url ? 'has audio' : 'no audio'})`)

  console.log('Submitting audio for transcription...')
  const transcript = await transcribeAudio(episode.enclosure_url)
  console.log(`Transcription complete (${transcript.length} characters)`)

  console.log('Generating article and newsletter with Gemini...')
  const { article, summary, newsletter } = await generateContent(episode, transcript)
  console.log(`Article: ${article.length} chars, Newsletter: ${newsletter.length} chars`)

  const filePath = await writeDraftEpisode(episode, article, summary)
  console.log(`Draft created: ${filePath}`)

  const campaignUrl = await createKeilaDraft(episode, newsletter)
  console.log(`Newsletter draft: ${campaignUrl}`)

  console.log('\nDone! Review the draft:')
  console.log(`  File: ${filePath}`)
  console.log(`  Keystatic: http://localhost:4321/keystatic`)
}

async function transcribeAudio(audioUrl: string): Promise<string> {
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })
  const transcript = await client.transcripts.transcribe({
    audio_url: audioUrl,
    speaker_labels: true,
  })
  if (transcript.status === 'error') {
    throw new Error(`Transcription failed: ${transcript.error}`)
  }
  return transcript.text ?? ''
}

async function generateContent(
  episode: Episode,
  transcript: string,
): Promise<{ article: string; summary: string; newsletter: string }> {
  const templatePath = resolve(import.meta.dirname, 'templates/article-prompt.md')
  const template = readFileSync(templatePath, 'utf-8')

  const episodeSlug = slugify(episode.title)
  const prompt = template
    .replace('{{EPISODE_TITLE}}', episode.title)
    .replace(/\{\{EPISODE_NUMBER\}\}/g, String(episode.number))
    .replace('{{EPISODE_SLUG}}', episodeSlug)
    .replace('{{TRANSCRIPT}}', transcript)

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const parts = text.split('---NEWSLETTER---')
  if (parts.length < 2) {
    console.error('Warning: AI response missing ---NEWSLETTER--- delimiter')
    console.error('Raw output (first 500 chars):', text.slice(0, 500))
    return { article: text.trim(), summary: extractSummary(text), newsletter: '' }
  }

  const article = parts[0].trim()
  const newsletter = parts[1].trim()
  return { article, summary: extractSummary(article), newsletter }
}

function extractSummary(article: string): string {
  const lines = article
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
  return lines[0]?.slice(0, 200) ?? ''
}

async function writeDraftEpisode(
  episode: Episode,
  article: string,
  summary: string,
): Promise<string> {
  const slug = slugify(episode.title)
  const showDir = episode.title.toLowerCase().startsWith('short rest') ? 'short-rest' : 'raw'
  const dir = resolve(import.meta.dirname, `../src/content/episodes/${showDir}/${slug}`)
  await mkdir(dir, { recursive: true })

  const frontmatter = YAML.stringify({
    id: episode.id,
    title: episode.title,
    season: episode.season,
    edition: '5e',
    summary,
    status: 'Unpublished',
  })

  const content = `---\n${frontmatter}---\n\n${article}\n`
  const filePath = `${dir}/index.md`
  await writeFile(filePath, content)
  return filePath
}

async function createKeilaDraft(
  episode: Episode,
  newsletterContent: string,
): Promise<string> {
  const res = await fetch(`${KEILA_BASE}/campaigns`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KEILA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        subject: `RaW EP${episode.number} - ${episode.title}`,
        text_body: newsletterContent,
        settings: { type: 'markdown' },
        sender_id: KEILA_SENDER_ID,
        segment_id: KEILA_SEGMENT_ID,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`Keila campaign creation failed (${res.status}): ${body}`)
    return '(failed)'
  }

  const data = (await res.json()) as { data?: { id?: string } }
  return `https://mail.houk.space/campaigns/${data.data?.id ?? 'unknown'}`
}

main().catch((err) => {
  console.error('Failed to generate article:', err)
  process.exit(1)
})
