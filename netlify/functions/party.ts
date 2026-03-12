import type { Handler, HandlerEvent } from '@netlify/functions'
import { eq, desc, and, sql } from 'drizzle-orm'
import { getDb, DatabaseUnavailableError } from '../../src/db'
import {
  parties,
  characters,
  transactions,
  inventoryItems,
  magicItems,
} from '../../src/db/schema'
import { generateCode, hashCode, verifyCode } from '../../src/utils/party-codes'

type RouteHandler = (
  event: HandlerEvent,
  params: Record<string, string>,
) => Promise<{ statusCode: number; body: string }>

const json = (statusCode: number, data: unknown) => ({
  statusCode,
  body: JSON.stringify(data),
})

const error = (statusCode: number, message: string) =>
  json(statusCode, { error: message })

// Parse path segments: /api/party/:id/characters/:cid etc.
function matchRoute(
  path: string,
  method: string,
): { handler: RouteHandler; params: Record<string, string> } | null {
  const segments = path.replace(/^\/api\/party\/?/, '').split('/').filter(Boolean)

  // POST /api/party — create party
  if (segments.length === 0 && method === 'POST') {
    return { handler: createParty, params: {} }
  }

  // GET /api/party/health — diagnostic endpoint
  if (segments.length === 1 && segments[0] === 'health' && method === 'GET') {
    return { handler: healthCheck, params: {} }
  }

  // GET /api/party/:id — get full party
  if (segments.length === 1 && method === 'GET') {
    return { handler: getParty, params: { id: segments[0] } }
  }

  // PATCH /api/party/:id — update party
  if (segments.length === 1 && method === 'PATCH') {
    return { handler: updateParty, params: { id: segments[0] } }
  }

  // POST /api/party/:id/validate-code
  if (segments.length === 2 && segments[1] === 'validate-code' && method === 'POST') {
    return { handler: validateCode, params: { id: segments[0] } }
  }

  // POST /api/party/:id/characters
  if (segments.length === 2 && segments[1] === 'characters' && method === 'POST') {
    return { handler: addCharacter, params: { id: segments[0] } }
  }

  // PATCH /api/party/:id/characters/:cid
  if (segments.length === 3 && segments[1] === 'characters' && method === 'PATCH') {
    return { handler: updateCharacter, params: { id: segments[0], cid: segments[2] } }
  }

  // DELETE /api/party/:id/characters/:cid
  if (segments.length === 3 && segments[1] === 'characters' && method === 'DELETE') {
    return { handler: deleteCharacter, params: { id: segments[0], cid: segments[2] } }
  }

  // POST /api/party/:id/transaction
  if (segments.length === 2 && segments[1] === 'transaction' && method === 'POST') {
    return { handler: addTransaction, params: { id: segments[0] } }
  }

  // POST /api/party/:id/transaction/:tid/undo
  if (segments.length === 4 && segments[1] === 'transaction' && segments[3] === 'undo' && method === 'POST') {
    return { handler: undoTransaction, params: { id: segments[0], tid: segments[2] } }
  }

  // GET /api/party/:id/transactions
  if (segments.length === 2 && segments[1] === 'transactions' && method === 'GET') {
    return { handler: listTransactions, params: { id: segments[0] } }
  }

  // POST /api/party/:id/item
  if (segments.length === 2 && segments[1] === 'item' && method === 'POST') {
    return { handler: upsertItem, params: { id: segments[0] } }
  }

  // DELETE /api/party/:id/item/:iid
  if (segments.length === 3 && segments[1] === 'item' && method === 'DELETE') {
    return { handler: deleteItem, params: { id: segments[0], iid: segments[2] } }
  }

  // POST /api/party/:id/magic-item
  if (segments.length === 2 && segments[1] === 'magic-item' && method === 'POST') {
    return { handler: upsertMagicItem, params: { id: segments[0] } }
  }

  // DELETE /api/party/:id/magic-item/:mid
  if (segments.length === 3 && segments[1] === 'magic-item' && method === 'DELETE') {
    return { handler: deleteMagicItem, params: { id: segments[0], mid: segments[2] } }
  }

  // POST /api/party/:id/loot
  if (segments.length === 2 && segments[1] === 'loot' && method === 'POST') {
    return { handler: addLoot, params: { id: segments[0] } }
  }

  return null
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolvePartyId(identifier: string): Promise<string | null> {
  const db = getDb()
  if (UUID_REGEX.test(identifier)) return identifier
  // Look up by code (shortcode format like ARCANE-OWLBEAR-42)
  const party = await db.query.parties.findFirst({
    where: eq(parties.code, identifier.toUpperCase()),
    columns: { id: true },
  })
  return party?.id ?? null
}

async function requireCode(event: HandlerEvent, partyId: string): Promise<string | null> {
  const code = event.headers['x-party-code']
  if (!code) return 'Party code required'

  const db = getDb()
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    columns: { codeHash: true },
  })
  if (!party) return 'Party not found'

  const valid = await verifyCode(code, party.codeHash)
  if (!valid) return 'Invalid party code'

  return null
}

function parseBody(event: HandlerEvent): Record<string, unknown> {
  try {
    return JSON.parse(event.body ?? '{}')
  } catch {
    return {}
  }
}

// --- Route Handlers ---

const healthCheck: RouteHandler = async () => {
  const envStatus = {
    PREVIEW_DATABASE_URL: !!process.env.PREVIEW_DATABASE_URL,
    NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
  }
  try {
    const db = getDb()
    await db.execute(sql`SELECT 1`)
    return json(200, { status: 'ok', env: envStatus })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json(503, { status: 'error', env: envStatus, error: message })
  }
}

const createParty: RouteHandler = async (event) => {
  const { name } = parseBody(event)
  if (!name || typeof name !== 'string') return error(400, 'Party name required')

  const code = generateCode()
  const codeHash = await hashCode(code)

  const db = getDb()
  const [party] = await db.insert(parties).values({ name, code, codeHash }).returning()

  return json(201, { id: party.id, name: party.name, code })
}

const getParty: RouteHandler = async (_event, { id }) => {
  const db = getDb()
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, id),
    columns: { codeHash: false },
    with: {
      characters: { orderBy: [characters.sortOrder] },
      inventoryItems: true,
      magicItems: true,
    },
  })
  if (!party) return error(404, 'Party not found')
  return json(200, party)
}

const updateParty: RouteHandler = async (event, { id }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)
  const updates: Record<string, unknown> = {}
  if (typeof body.name === 'string') updates.name = body.name
  if (body.lootActiveBy === null || typeof body.lootActiveBy === 'string') {
    updates.lootActiveBy = body.lootActiveBy
  }
  if (typeof body.showEp === 'boolean') updates.showEp = body.showEp
  if (typeof body.showPp === 'boolean') updates.showPp = body.showPp

  if (Object.keys(updates).length === 0) return error(400, 'No valid fields to update')

  const db = getDb()
  await db.update(parties).set(updates).where(eq(parties.id, id))
  return json(200, { success: true })
}

const validateCode: RouteHandler = async (event, { id }) => {
  const { code } = parseBody(event)
  if (!code || typeof code !== 'string') return error(400, 'Code required')

  const db = getDb()
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, id),
    columns: { codeHash: true },
  })
  if (!party) return error(404, 'Party not found')

  const valid = await verifyCode(code, party.codeHash)
  return valid ? json(200, { valid: true }) : error(401, 'Invalid code')
}

const addCharacter: RouteHandler = async (event, { id }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)
  if (!body.name || typeof body.name !== 'string') return error(400, 'Character name required')

  const db = getDb()
  const maxOrder = await db
    .select({ max: sql<number>`coalesce(max(${characters.sortOrder}), -1)` })
    .from(characters)
    .where(eq(characters.partyId, id))

  const [character] = await db
    .insert(characters)
    .values({
      partyId: id,
      name: body.name,
      class: typeof body.class === 'string' ? body.class : null,
      level: typeof body.level === 'number' ? body.level : 1,
      sortOrder: (maxOrder[0]?.max ?? -1) + 1,
    })
    .returning()

  return json(201, character)
}

const updateCharacter: RouteHandler = async (event, { id, cid }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)
  const updates: Record<string, unknown> = {}

  for (const field of ['name', 'class'] as const) {
    if (typeof body[field] === 'string') updates[field] = body[field]
  }
  for (const field of ['level', 'cp', 'sp', 'ep', 'gp', 'pp', 'sortOrder'] as const) {
    if (typeof body[field] === 'number') updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) return error(400, 'No valid fields to update')

  const db = getDb()
  const [updated] = await db
    .update(characters)
    .set(updates)
    .where(and(eq(characters.id, cid), eq(characters.partyId, id)))
    .returning()

  if (!updated) return error(404, 'Character not found')
  return json(200, updated)
}

const deleteCharacter: RouteHandler = async (event, { id, cid }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const db = getDb()
  const [deleted] = await db
    .delete(characters)
    .where(and(eq(characters.id, cid), eq(characters.partyId, id)))
    .returning({ id: characters.id })

  if (!deleted) return error(404, 'Character not found')
  return json(200, { success: true })
}

const addTransaction: RouteHandler = async (event, { id }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)
  if (!body.type || typeof body.type !== 'string') return error(400, 'Transaction type required')

  const db = getDb()
  const [tx] = await db
    .insert(transactions)
    .values({
      partyId: id,
      characterId: typeof body.characterId === 'string' ? body.characterId : null,
      type: body.type,
      cp: typeof body.cp === 'number' ? body.cp : 0,
      sp: typeof body.sp === 'number' ? body.sp : 0,
      ep: typeof body.ep === 'number' ? body.ep : 0,
      gp: typeof body.gp === 'number' ? body.gp : 0,
      pp: typeof body.pp === 'number' ? body.pp : 0,
      itemName: typeof body.itemName === 'string' ? body.itemName : null,
      note: typeof body.note === 'string' ? body.note : null,
    })
    .returning()

  // Update character gold if a character is specified
  if (tx.characterId) {
    const sign = ['spend', 'buy'].includes(tx.type) ? -1 : 1
    await db
      .update(characters)
      .set({
        cp: sql`${characters.cp} + ${sign * (tx.cp ?? 0)}`,
        sp: sql`${characters.sp} + ${sign * (tx.sp ?? 0)}`,
        ep: sql`${characters.ep} + ${sign * (tx.ep ?? 0)}`,
        gp: sql`${characters.gp} + ${sign * (tx.gp ?? 0)}`,
        pp: sql`${characters.pp} + ${sign * (tx.pp ?? 0)}`,
      })
      .where(eq(characters.id, tx.characterId))
  }

  return json(201, tx)
}

const undoTransaction: RouteHandler = async (event, { id, tid }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const db = getDb()
  const original = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, tid), eq(transactions.partyId, id)),
  })
  if (!original) return error(404, 'Transaction not found')
  if (original.undone) return error(400, 'Transaction already undone')

  // Mark original as undone
  await db.update(transactions).set({ undone: true }).where(eq(transactions.id, tid))

  // Create inverse transaction
  const [inverse] = await db
    .insert(transactions)
    .values({
      partyId: id,
      characterId: original.characterId,
      type: 'undo',
      cp: -(original.cp ?? 0),
      sp: -(original.sp ?? 0),
      ep: -(original.ep ?? 0),
      gp: -(original.gp ?? 0),
      pp: -(original.pp ?? 0),
      itemName: original.itemName,
      note: `Undo: ${original.note ?? original.type}`,
      undoesId: tid,
    })
    .returning()

  // Reverse character gold
  if (original.characterId) {
    const sign = ['spend', 'buy'].includes(original.type) ? 1 : -1
    await db
      .update(characters)
      .set({
        cp: sql`${characters.cp} + ${sign * (original.cp ?? 0)}`,
        sp: sql`${characters.sp} + ${sign * (original.sp ?? 0)}`,
        ep: sql`${characters.ep} + ${sign * (original.ep ?? 0)}`,
        gp: sql`${characters.gp} + ${sign * (original.gp ?? 0)}`,
        pp: sql`${characters.pp} + ${sign * (original.pp ?? 0)}`,
      })
      .where(eq(characters.id, original.characterId))
  }

  return json(201, inverse)
}

const listTransactions: RouteHandler = async (event, { id }) => {
  const params = new URLSearchParams(event.queryStringParameters as Record<string, string> ?? {})
  const limit = Math.min(parseInt(params.get('limit') ?? '20'), 100)
  const offset = parseInt(params.get('offset') ?? '0')
  const characterId = params.get('characterId')

  const db = getDb()
  const conditions = [eq(transactions.partyId, id)]
  if (characterId) conditions.push(eq(transactions.characterId, characterId))

  const rows = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset)

  return json(200, rows)
}

const upsertItem: RouteHandler = async (event, { id }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)

  // Update existing item
  if (typeof body.id === 'string') {
    const updates: Record<string, unknown> = {}
    if (typeof body.name === 'string') updates.name = body.name
    if (typeof body.quantity === 'number') updates.quantity = body.quantity
    if (typeof body.characterId === 'string' || body.characterId === null) {
      updates.characterId = body.characterId
    }
    if (typeof body.weight === 'number' || body.weight === null) updates.weight = body.weight

    const db = getDb()
    const [updated] = await db
      .update(inventoryItems)
      .set(updates)
      .where(and(eq(inventoryItems.id, body.id), eq(inventoryItems.partyId, id)))
      .returning()

    if (!updated) return error(404, 'Item not found')
    return json(200, updated)
  }

  // Create new item
  if (!body.name || typeof body.name !== 'string') return error(400, 'Item name required')

  const db = getDb()
  const [item] = await db
    .insert(inventoryItems)
    .values({
      partyId: id,
      characterId: typeof body.characterId === 'string' ? body.characterId : null,
      name: body.name,
      quantity: typeof body.quantity === 'number' ? body.quantity : 1,
      weight: typeof body.weight === 'number' ? body.weight : null,
      srdIndex: typeof body.srdIndex === 'string' ? body.srdIndex : null,
    })
    .returning()

  return json(201, item)
}

const deleteItem: RouteHandler = async (event, { id, iid }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const db = getDb()
  const [deleted] = await db
    .delete(inventoryItems)
    .where(and(eq(inventoryItems.id, iid), eq(inventoryItems.partyId, id)))
    .returning({ id: inventoryItems.id })

  if (!deleted) return error(404, 'Item not found')
  return json(200, { success: true })
}

const upsertMagicItem: RouteHandler = async (event, { id }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)

  // Update existing magic item
  if (typeof body.id === 'string') {
    const updates: Record<string, unknown> = {}
    if (typeof body.name === 'string') updates.name = body.name
    if (typeof body.rarity === 'string') updates.rarity = body.rarity
    if (typeof body.description === 'string') updates.description = body.description
    if (typeof body.attuned === 'boolean') updates.attuned = body.attuned
    if (typeof body.requiresAttunement === 'boolean') {
      updates.requiresAttunement = body.requiresAttunement
    }
    if (typeof body.characterId === 'string' || body.characterId === null) {
      updates.characterId = body.characterId
      // Un-attune when moving to loot pool
      if (body.characterId === null) updates.attuned = false
    }

    // Enforce 3-attunement-slot limit
    if (updates.attuned === true && typeof body.characterId === 'string') {
      const db = getDb()
      const attunedCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(magicItems)
        .where(
          and(
            eq(magicItems.characterId, body.characterId),
            eq(magicItems.attuned, true),
            sql`${magicItems.id} != ${body.id}`,
          ),
        )
      if ((attunedCount[0]?.count ?? 0) >= 3) {
        return error(400, 'Character already has 3 attuned items')
      }
    }

    const db = getDb()
    const [updated] = await db
      .update(magicItems)
      .set(updates)
      .where(and(eq(magicItems.id, body.id), eq(magicItems.partyId, id)))
      .returning()

    if (!updated) return error(404, 'Magic item not found')
    return json(200, updated)
  }

  // Create new magic item
  if (!body.name || typeof body.name !== 'string') return error(400, 'Item name required')

  const db = getDb()
  const [item] = await db
    .insert(magicItems)
    .values({
      partyId: id,
      characterId: typeof body.characterId === 'string' ? body.characterId : null,
      name: body.name,
      rarity: typeof body.rarity === 'string' ? body.rarity : null,
      description: typeof body.description === 'string' ? body.description : null,
      requiresAttunement: typeof body.requiresAttunement === 'boolean' ? body.requiresAttunement : false,
      srdIndex: typeof body.srdIndex === 'string' ? body.srdIndex : null,
    })
    .returning()

  return json(201, item)
}

const deleteMagicItem: RouteHandler = async (event, { id, mid }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const db = getDb()
  const [deleted] = await db
    .delete(magicItems)
    .where(and(eq(magicItems.id, mid), eq(magicItems.partyId, id)))
    .returning({ id: magicItems.id })

  if (!deleted) return error(404, 'Magic item not found')
  return json(200, { success: true })
}

const addLoot: RouteHandler = async (event, { id }) => {
  const authErr = await requireCode(event, id)
  if (authErr) return error(401, authErr)

  const body = parseBody(event)
  const db = getDb()

  // Get all characters in the party for gold split
  const partyCharacters = await db
    .select()
    .from(characters)
    .where(eq(characters.partyId, id))
    .orderBy(characters.sortOrder)

  if (partyCharacters.length === 0) return error(400, 'Party has no characters')

  const lootNote = typeof body.note === 'string' ? body.note : ''

  const results: { transactions: unknown[]; items: unknown[]; magicItems: unknown[] } = {
    transactions: [],
    items: [],
    magicItems: [],
  }

  // Split gold round-robin among characters
  const gold = body.gold as Record<string, number> | undefined
  if (gold) {
    for (const denom of ['cp', 'sp', 'ep', 'gp', 'pp'] as const) {
      const total = typeof gold[denom] === 'number' ? gold[denom] : 0
      if (total <= 0) continue

      const perChar = Math.floor(total / partyCharacters.length)
      let remainder = total % partyCharacters.length

      for (const char of partyCharacters) {
        const amount = perChar + (remainder > 0 ? 1 : 0)
        if (remainder > 0) remainder--
        if (amount <= 0) continue

        const values = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, [denom]: amount }

        const [tx] = await db
          .insert(transactions)
          .values({
            partyId: id,
            characterId: char.id,
            type: 'loot',
            ...values,
            note: `Loot split: ${total} ${denom.toUpperCase()}${lootNote ? ` · ${lootNote}` : ''}`,
          })
          .returning()
        results.transactions.push(tx)

        await db
          .update(characters)
          .set({ [denom]: sql`${characters[denom]} + ${amount}` })
          .where(eq(characters.id, char.id))
      }
    }
  }

  // Add inventory items to loot pool (unassigned)
  const items = body.items as Array<{ name: string; quantity?: number; srdIndex?: string }> | undefined
  if (items?.length) {
    for (const item of items) {
      if (!item.name) continue
      const [created] = await db
        .insert(inventoryItems)
        .values({
          partyId: id,
          name: item.name,
          quantity: item.quantity ?? 1,
          srdIndex: item.srdIndex ?? null,
        })
        .returning()
      results.items.push(created)
    }
  }

  // Add magic items to loot pool (unassigned)
  const mItems = body.magicItems as Array<{
    name: string
    rarity?: string
    requiresAttunement?: boolean
    srdIndex?: string
  }> | undefined
  if (mItems?.length) {
    for (const item of mItems) {
      if (!item.name) continue
      const [created] = await db
        .insert(magicItems)
        .values({
          partyId: id,
          name: item.name,
          rarity: item.rarity ?? null,
          requiresAttunement: item.requiresAttunement ?? false,
          srdIndex: item.srdIndex ?? null,
        })
        .returning()
      results.magicItems.push(created)
    }
  }

  return json(201, results)
}

// --- Main Handler ---

export const handler: Handler = async (event) => {
  const path = event.path
  const method = event.httpMethod

  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Party-Code',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  }

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  const route = matchRoute(path, method)
  if (!route) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) }
  }

  // Resolve shortcode to UUID if the route has an `id` param
  if (route.params.id) {
    const resolved = await resolvePartyId(route.params.id)
    if (!resolved) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Party not found' }) }
    }
    route.params.id = resolved
  }

  try {
    const result = await route.handler(event, route.params)
    return { ...result, headers }
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      console.error('Database unavailable:', err.cause)
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Database unavailable. The party tracker requires a database connection.' }),
      }
    }
    console.error('Party API error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
