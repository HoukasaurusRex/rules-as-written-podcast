import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, isNull, isNotNull, and } from 'drizzle-orm'
import * as schema from '../src/db/schema.ts'

const url = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL
if (!url) {
  console.error('No database URL set. Add NETLIFY_DATABASE_URL to .env')
  process.exit(1)
}

const client = postgres(url)
const db = drizzle(client, { schema })

const backfill = async () => {
  // 1. Link items with srdIndex to catalog entries
  const srdItems = await db
    .select({ id: schema.inventoryItems.id, srdIndex: schema.inventoryItems.srdIndex, partyId: schema.inventoryItems.partyId })
    .from(schema.inventoryItems)
    .where(and(isNotNull(schema.inventoryItems.srdIndex), isNull(schema.inventoryItems.catalogItemId)))

  let linked = 0
  for (const item of srdItems) {
    if (!item.srdIndex) continue
    const catalogEntry = await db.query.itemCatalog.findFirst({
      where: eq(schema.itemCatalog.srdIndex, item.srdIndex),
      columns: { id: true },
    })
    if (catalogEntry) {
      await db.update(schema.inventoryItems).set({ catalogItemId: catalogEntry.id }).where(eq(schema.inventoryItems.id, item.id))
      linked++
    }
  }
  console.log(`Linked ${linked} SRD items to catalog`)

  // 2. Create homebrew catalog entries for custom items (no srdIndex)
  const customItems = await db
    .select({ id: schema.inventoryItems.id, name: schema.inventoryItems.name, partyId: schema.inventoryItems.partyId })
    .from(schema.inventoryItems)
    .where(and(isNull(schema.inventoryItems.srdIndex), isNull(schema.inventoryItems.catalogItemId)))

  let created = 0
  for (const item of customItems) {
    const [catalogEntry] = await db
      .insert(schema.itemCatalog)
      .values({
        partyId: item.partyId,
        source: 'homebrew',
        name: item.name,
        category: 'Adventuring Gear',
      })
      .returning({ id: schema.itemCatalog.id })

    await db.update(schema.inventoryItems).set({ catalogItemId: catalogEntry.id }).where(eq(schema.inventoryItems.id, item.id))
    created++
  }
  console.log(`Created ${created} homebrew catalog entries for custom items`)

  console.log('Backfill complete')
  await client.end()
}

backfill().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
