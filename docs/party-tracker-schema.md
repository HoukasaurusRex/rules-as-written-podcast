# Party Tracker Database Schema

## Entity Relationship Diagram

```
parties
  id              uuid PK
  name            text
  code            text UNIQUE
  code_hash       text
  loot_active_by  text
  show_ep         boolean
  show_pp         boolean
  created_at      timestamptz
  |
  |--- 1:N ---> characters
  |               id, party_id FK, name, class, level,
  |               cp, sp, ep, gp, pp, sort_order
  |
  |--- 1:N ---> item_catalog (party-scoped homebrew)
  |               id, party_id FK (null = global SRD),
  |               source ('srd'|'homebrew'), srd_index,
  |               name, category, cost, weight,
  |               [weapon/armor/mount/tool fields]
  |
  |--- 1:N ---> inventory_items
  |               id, party_id FK, character_id FK,
  |               name, quantity, weight, srd_index,
  |               catalog_item_id FK ---> item_catalog
  |
  |--- 1:N ---> magic_items
  |               id, party_id FK, character_id FK,
  |               name, rarity, description,
  |               attuned, requires_attunement, srd_index
  |
  |--- 1:N ---> transactions
                  id, party_id FK, character_id FK,
                  type, cp/sp/ep/gp/pp,
                  item_name, note, undone, undoes_id
```

## Item Catalog Architecture

The `item_catalog` table is the single source of truth for all item definitions.

### Scoping

- **SRD items**: `party_id = NULL`, `source = 'srd'`. Global, shared across all parties. Seeded from `src/data/srd-equipment.json` via `scripts/seed-catalog.ts`.
- **Homebrew items**: `party_id = <uuid>`, `source = 'homebrew'`. Private to the party that created them. Auto-created when a custom item is added.

### Category-Specific Fields

The catalog stores enriched data per equipment category:

| Category | Fields |
| -------- | ------ |
| Weapon | damage_dice, damage_type, two_handed_dice, two_handed_type, weapon_category, weapon_range, range_normal, range_long, properties[] |
| Armor | ac_base, ac_dex_bonus, armor_category, str_minimum, stealth_disadvantage |
| Mounts and Vehicles | speed_qty, speed_unit, capacity, vehicle_category |
| Tools | tool_category, description |
| Adventuring Gear | description |

### Data Flow

```
dnd5eapi.co (build-time)
    |
    v
scripts/fetch-srd-data.ts
    |
    v
src/data/srd-equipment.json (client-side autocomplete)
    |
    v
scripts/seed-catalog.ts
    |
    v
item_catalog table (DB, source of truth)
    |
    v
inventory_items.catalog_item_id FK
    |
    v
GET /api/party/:id (JOIN returns catalog data)
    |
    v
React components (category filtering, detail display)
```

### Catalog Resolution

When an inventory item is created (direct add, buy, loot, undo), the server resolves the `catalog_item_id`:

1. Try `srd_index` match in `item_catalog` (global)
2. Fall back to case-insensitive name match (`WHERE party_id IS NULL OR party_id = :partyId`)
3. If no match: auto-create a homebrew entry (`source: 'homebrew'`, `party_id: partyId`)
