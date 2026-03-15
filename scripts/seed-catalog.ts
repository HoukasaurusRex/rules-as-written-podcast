import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema.ts'
import srdEquipment from '../src/data/srd-equipment.json' with { type: 'json' }

const url = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL
if (!url) {
  console.error('No database URL set. Add NETLIFY_DATABASE_URL to .env')
  process.exit(1)
}

const client = postgres(url)
const db = drizzle(client, { schema })

interface SrdItem {
  index: string
  name: string
  cost: { quantity: number; unit: string } | null
  weight: number | null
  category: string
  damage?: { dice: string; type: string }
  twoHandedDamage?: { dice: string; type: string }
  range?: { normal: number; long?: number }
  weaponCategory?: string
  weaponRange?: string
  properties?: string[]
  armorClass?: { base: number; dexBonus: boolean }
  armorCategory?: string
  strMinimum?: number
  stealthDisadvantage?: boolean
  speed?: { quantity: number; unit: string }
  capacity?: string
  vehicleCategory?: string
  description?: string
  toolCategory?: string
}

const mapToCatalogRow = (item: SrdItem) => ({
  source: 'srd' as const,
  srdIndex: item.index,
  name: item.name,
  costQty: item.cost?.quantity ?? null,
  costUnit: item.cost?.unit ?? null,
  weight: item.weight,
  category: item.category,
  damageDice: item.damage?.dice ?? null,
  damageType: item.damage?.type ?? null,
  twoHandedDice: item.twoHandedDamage?.dice ?? null,
  twoHandedType: item.twoHandedDamage?.type ?? null,
  weaponCategory: item.weaponCategory ?? null,
  weaponRange: item.weaponRange ?? null,
  rangeNormal: item.range?.normal ?? null,
  rangeLong: item.range?.long ?? null,
  properties: item.properties ?? null,
  acBase: item.armorClass?.base ?? null,
  acDexBonus: item.armorClass?.dexBonus ?? null,
  armorCategory: item.armorCategory ?? null,
  strMinimum: item.strMinimum ?? null,
  stealthDisadvantage: item.stealthDisadvantage ?? null,
  speedQty: item.speed?.quantity ?? null,
  speedUnit: item.speed?.unit ?? null,
  capacity: item.capacity ?? null,
  vehicleCategory: item.vehicleCategory ?? null,
  description: item.description ?? null,
  toolCategory: item.toolCategory ?? null,
})

const seed = async () => {
  const items = srdEquipment as SrdItem[]
  console.log(`Seeding ${items.length} SRD equipment items into item_catalog...`)

  let created = 0
  let updated = 0

  for (const item of items) {
    const row = mapToCatalogRow(item)
    const existing = await db.query.itemCatalog.findFirst({
      where: eq(schema.itemCatalog.srdIndex, item.index),
      columns: { id: true },
    })

    if (existing) {
      await db.update(schema.itemCatalog).set(row).where(eq(schema.itemCatalog.id, existing.id))
      updated++
    } else {
      await db.insert(schema.itemCatalog).values(row)
      created++
    }
  }

  console.log(`Catalog seed complete: ${created} created, ${updated} updated`)
  await client.end()
}

seed().catch((err) => {
  console.error('Catalog seed failed:', err)
  process.exit(1)
})
