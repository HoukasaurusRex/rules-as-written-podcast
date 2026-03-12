import { pgTable, uuid, text, integer, boolean, real, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const parties = pgTable('parties', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique().notNull(),
  codeHash: text('code_hash').notNull(),
  lootActiveBy: text('loot_active_by'),
  showEp: boolean('show_ep').default(false),
  showPp: boolean('show_pp').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: uuid('party_id')
    .notNull()
    .references(() => parties.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  class: text('class'),
  level: integer('level').default(1),
  cp: integer('cp').default(0),
  sp: integer('sp').default(0),
  ep: integer('ep').default(0),
  gp: integer('gp').default(0),
  pp: integer('pp').default(0),
  sortOrder: integer('sort_order').default(0),
})

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: uuid('party_id')
    .notNull()
    .references(() => parties.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'set null',
  }),
  type: text('type').notNull(),
  cp: integer('cp').default(0),
  sp: integer('sp').default(0),
  ep: integer('ep').default(0),
  gp: integer('gp').default(0),
  pp: integer('pp').default(0),
  itemName: text('item_name'),
  note: text('note'),
  undone: boolean('undone').default(false),
  undoesId: uuid('undoes_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: uuid('party_id')
    .notNull()
    .references(() => parties.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  quantity: integer('quantity').default(1),
  weight: real('weight'),
  srdIndex: text('srd_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const magicItems = pgTable('magic_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: uuid('party_id')
    .notNull()
    .references(() => parties.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id').references(() => characters.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  rarity: text('rarity'),
  description: text('description'),
  attuned: boolean('attuned').default(false),
  requiresAttunement: boolean('requires_attunement').default(false),
  srdIndex: text('srd_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Relations for Drizzle query builder
export const partiesRelations = relations(parties, ({ many }) => ({
  characters: many(characters),
  transactions: many(transactions),
  inventoryItems: many(inventoryItems),
  magicItems: many(magicItems),
}))

export const charactersRelations = relations(characters, ({ one, many }) => ({
  party: one(parties, {
    fields: [characters.partyId],
    references: [parties.id],
  }),
  transactions: many(transactions),
  inventoryItems: many(inventoryItems),
  magicItems: many(magicItems),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  party: one(parties, {
    fields: [transactions.partyId],
    references: [parties.id],
  }),
  character: one(characters, {
    fields: [transactions.characterId],
    references: [characters.id],
  }),
}))

export const inventoryItemsRelations = relations(
  inventoryItems,
  ({ one }) => ({
    party: one(parties, {
      fields: [inventoryItems.partyId],
      references: [parties.id],
    }),
    character: one(characters, {
      fields: [inventoryItems.characterId],
      references: [characters.id],
    }),
  }),
)

export const magicItemsRelations = relations(magicItems, ({ one }) => ({
  party: one(parties, {
    fields: [magicItems.partyId],
    references: [parties.id],
  }),
  character: one(characters, {
    fields: [magicItems.characterId],
    references: [characters.id],
  }),
}))
