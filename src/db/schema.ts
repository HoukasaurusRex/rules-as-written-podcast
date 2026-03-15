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

export const itemCatalog = pgTable('item_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: uuid('party_id').references(() => parties.id, { onDelete: 'cascade' }),
  source: text('source').notNull(), // 'srd' | 'homebrew'
  srdIndex: text('srd_index').unique(),
  name: text('name').notNull(),
  costQty: integer('cost_qty'),
  costUnit: text('cost_unit'),
  weight: real('weight'),
  category: text('category').notNull(),
  // Weapon fields
  damageDice: text('damage_dice'),
  damageType: text('damage_type'),
  twoHandedDice: text('two_handed_dice'),
  twoHandedType: text('two_handed_type'),
  weaponCategory: text('weapon_category'),
  weaponRange: text('weapon_range'),
  rangeNormal: integer('range_normal'),
  rangeLong: integer('range_long'),
  properties: text('properties').array(),
  // Armor fields
  acBase: integer('ac_base'),
  acDexBonus: boolean('ac_dex_bonus'),
  armorCategory: text('armor_category'),
  strMinimum: integer('str_minimum'),
  stealthDisadvantage: boolean('stealth_disadvantage'),
  // Mount/Vehicle fields
  speedQty: real('speed_qty'),
  speedUnit: text('speed_unit'),
  capacity: text('capacity'),
  vehicleCategory: text('vehicle_category'),
  // Shared
  description: text('description'),
  toolCategory: text('tool_category'),
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
  catalogItemId: uuid('catalog_item_id').references(() => itemCatalog.id, { onDelete: 'set null' }),
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
  catalogItems: many(itemCatalog),
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

export const itemCatalogRelations = relations(itemCatalog, ({ one, many }) => ({
  party: one(parties, {
    fields: [itemCatalog.partyId],
    references: [parties.id],
  }),
  inventoryItems: many(inventoryItems),
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
    catalogItem: one(itemCatalog, {
      fields: [inventoryItems.catalogItemId],
      references: [itemCatalog.id],
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
