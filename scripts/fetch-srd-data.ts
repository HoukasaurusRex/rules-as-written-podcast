import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const API_HOST = 'https://www.dnd5eapi.co'
const API_BASE = `${API_HOST}/api/2014`
const DATA_DIR = join(import.meta.dirname, '..', 'src', 'data')
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 500
const MAX_RETRIES = 3

interface SrdEquipmentItem {
  index: string
  name: string
  cost: { quantity: number; unit: string } | null
  weight: number | null
  category: string
}

interface SrdMagicItem {
  index: string
  name: string
  rarity: string
  requiresAttunement: boolean
  description: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchJson<T>(url: string, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (res.status === 429) {
        const delay = attempt * 2000
        console.warn(`Rate limited, waiting ${delay}ms before retry...`)
        await sleep(delay)
        continue
      }
      if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`)
      return (await res.json()) as T
    } catch (err) {
      if (attempt === retries) throw err
      const delay = attempt * 1000
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  throw new Error(`Failed after ${retries} attempts`)
}

async function fetchInBatches<TInput, TOutput>(
  items: TInput[],
  fetchFn: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> {
  const results: TOutput[] = []
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(fetchFn))
    results.push(...batchResults)
    if (i + BATCH_SIZE < items.length) await sleep(BATCH_DELAY_MS)
  }
  return results
}

async function fetchEquipment(): Promise<SrdEquipmentItem[]> {
  console.log('Fetching SRD equipment list...')
  const list = await fetchJson<{ results: { index: string; url: string }[] }>(
    `${API_BASE}/equipment`,
  )
  console.log(
    `Found ${list.results.length} equipment items, fetching details...`,
  )

  const details = await fetchInBatches(list.results, (item) =>
    fetchJson<{
      index: string
      name: string
      cost?: { quantity: number; unit: string }
      weight?: number
      equipment_category?: { name: string }
    }>(`${API_HOST}${item.url}`),
  )

  return details
    .map((d) => ({
      index: d.index,
      name: d.name,
      cost: d.cost ?? null,
      weight: d.weight ?? null,
      category: d.equipment_category?.name ?? 'Other',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function fetchMagicItems(): Promise<SrdMagicItem[]> {
  console.log('Fetching SRD magic items list...')
  const list = await fetchJson<{ results: { index: string; url: string }[] }>(
    `${API_BASE}/magic-items`,
  )
  console.log(
    `Found ${list.results.length} magic items, fetching details...`,
  )

  const details = await fetchInBatches(list.results, (item) =>
    fetchJson<{
      index: string
      name: string
      rarity?: { name: string }
      desc?: string[]
      requires_attunement?: string
    }>(`${API_HOST}${item.url}`),
  )

  return details
    .map((d) => ({
      index: d.index,
      name: d.name,
      rarity: d.rarity?.name ?? 'Unknown',
      requiresAttunement: d.requires_attunement !== undefined,
      description: (d.desc ?? []).join('\n').slice(0, 500),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true })

  try {
    const equipment = await fetchEquipment()
    const equipmentPath = join(DATA_DIR, 'srd-equipment.json')
    writeFileSync(equipmentPath, JSON.stringify(equipment, null, 2))
    console.log(`Wrote ${equipment.length} equipment items to ${equipmentPath}`)
  } catch (err) {
    console.error('Failed to fetch SRD equipment data:', err)
    console.error('Continuing build without equipment data.')
  }

  try {
    const magicItems = await fetchMagicItems()
    const magicPath = join(DATA_DIR, 'srd-magic-items.json')
    writeFileSync(magicPath, JSON.stringify(magicItems, null, 2))
    console.log(`Wrote ${magicItems.length} magic items to ${magicPath}`)
  } catch (err) {
    console.error('Failed to fetch SRD magic items data:', err)
    console.error('Continuing build without magic items data.')
  }
}

main()
