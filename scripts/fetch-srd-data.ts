import { writeFile, mkdir } from 'node:fs/promises'
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
  // Weapon fields
  damage?: { dice: string; type: string }
  twoHandedDamage?: { dice: string; type: string }
  range?: { normal: number; long?: number }
  weaponCategory?: string
  weaponRange?: string
  properties?: string[]
  // Armor fields
  armorClass?: { base: number; dexBonus: boolean }
  armorCategory?: string
  strMinimum?: number
  stealthDisadvantage?: boolean
  // Mount/Vehicle fields
  speed?: { quantity: number; unit: string }
  capacity?: string
  vehicleCategory?: string
  // Shared
  description?: string
  toolCategory?: string
}

interface SrdMagicItem {
  index: string
  name: string
  rarity: string
  requiresAttunement: boolean
  description: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const fetchJson = async <T>(url: string, retries = MAX_RETRIES): Promise<T> => {
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

const fetchInBatches = async <TInput, TOutput>(
  items: TInput[],
  fetchFn: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> => {
  const results: TOutput[] = []
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(fetchFn))
    results.push(...batchResults)
    if (i + BATCH_SIZE < items.length) await sleep(BATCH_DELAY_MS)
  }
  return results
}

const fetchEquipment = async (): Promise<SrdEquipmentItem[]> => {
  console.log('Fetching SRD equipment list...')
  const list = await fetchJson<{ results: { index: string; url: string }[] }>(
    `${API_BASE}/equipment`,
  )
  console.log(
    `Found ${list.results.length} equipment items, fetching details...`,
  )

  interface ApiEquipmentDetail {
    index: string
    name: string
    cost?: { quantity: number; unit: string }
    weight?: number
    equipment_category?: { name: string }
    desc?: string[]
    // Weapon
    damage?: { damage_dice: string; damage_type: { name: string } }
    two_handed_damage?: { damage_dice: string; damage_type: { name: string } }
    range?: { normal: number; long?: number }
    weapon_category?: string
    weapon_range?: string
    properties?: { name: string }[]
    // Armor
    armor_class?: { base: number; dex_bonus: boolean }
    armor_category?: string
    str_minimum?: number
    stealth_disadvantage?: boolean
    // Mount/Vehicle
    speed?: { quantity: number; unit: string }
    capacity?: string
    vehicle_category?: string
    // Tools
    tool_category?: string
  }

  const details = await fetchInBatches(list.results, (item) =>
    fetchJson<ApiEquipmentDetail>(`${API_HOST}${item.url}`),
  )

  return details
    .map((d) => {
      const item: SrdEquipmentItem = {
        index: d.index,
        name: d.name,
        cost: d.cost ?? null,
        weight: d.weight ?? null,
        category: d.equipment_category?.name ?? 'Other',
      }

      // Weapon fields
      if (d.damage) {
        item.damage = { dice: d.damage.damage_dice, type: d.damage.damage_type.name }
      }
      if (d.two_handed_damage) {
        item.twoHandedDamage = { dice: d.two_handed_damage.damage_dice, type: d.two_handed_damage.damage_type.name }
      }
      if (d.weapon_category) item.weaponCategory = d.weapon_category
      if (d.weapon_range) item.weaponRange = d.weapon_range
      if (d.properties?.length) item.properties = d.properties.map((p) => p.name)
      if (d.range && d.weapon_range) item.range = { normal: d.range.normal, ...(d.range.long ? { long: d.range.long } : {}) }

      // Armor fields
      if (d.armor_class) item.armorClass = { base: d.armor_class.base, dexBonus: d.armor_class.dex_bonus }
      if (d.armor_category) item.armorCategory = d.armor_category
      if (d.str_minimum) item.strMinimum = d.str_minimum
      if (d.stealth_disadvantage) item.stealthDisadvantage = true

      // Mount/Vehicle fields
      if (d.speed) item.speed = d.speed
      if (d.capacity) item.capacity = d.capacity
      if (d.vehicle_category) item.vehicleCategory = d.vehicle_category

      // Shared
      if (d.desc?.length) item.description = d.desc.join('\n').slice(0, 500)
      if (d.tool_category) item.toolCategory = d.tool_category

      return item
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

const fetchMagicItems = async (): Promise<SrdMagicItem[]> => {
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

const main = async () => {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    const equipment = await fetchEquipment()
    const equipmentPath = join(DATA_DIR, 'srd-equipment.json')
    await writeFile(equipmentPath, JSON.stringify(equipment, null, 2))
    console.log(`Wrote ${equipment.length} equipment items to ${equipmentPath}`)
  } catch (err) {
    console.error('Failed to fetch SRD equipment data:', err)
    console.error('Continuing build without equipment data.')
  }

  try {
    const magicItems = await fetchMagicItems()
    const magicPath = join(DATA_DIR, 'srd-magic-items.json')
    await writeFile(magicPath, JSON.stringify(magicItems, null, 2))
    console.log(`Wrote ${magicItems.length} magic items to ${magicPath}`)
  } catch (err) {
    console.error('Failed to fetch SRD magic items data:', err)
    console.error('Continuing build without magic items data.')
  }
}

main()
