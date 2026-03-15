import { describe, test, expect } from 'vitest'
import { getItemDetails, EQUIPMENT_CATEGORIES, CATEGORY_LABELS } from './inventory-categories'
import type { CatalogItem } from '../stores/party'

const baseCatalogItem: CatalogItem = {
  id: 'test',
  category: 'Adventuring Gear',
  damageDice: null,
  damageType: null,
  twoHandedDice: null,
  twoHandedType: null,
  weaponCategory: null,
  weaponRange: null,
  rangeNormal: null,
  rangeLong: null,
  properties: null,
  acBase: null,
  acDexBonus: null,
  armorCategory: null,
  strMinimum: null,
  stealthDisadvantage: null,
  speedQty: null,
  speedUnit: null,
  capacity: null,
  vehicleCategory: null,
  description: null,
  toolCategory: null,
}

describe('EQUIPMENT_CATEGORIES', () => {
  test('contains all 5 D&D equipment categories', () => {
    expect(EQUIPMENT_CATEGORIES).toHaveLength(5)
    expect(EQUIPMENT_CATEGORIES).toContain('Weapon')
    expect(EQUIPMENT_CATEGORIES).toContain('Adventuring Gear')
    expect(EQUIPMENT_CATEGORIES).toContain('Tools')
    expect(EQUIPMENT_CATEGORIES).toContain('Armor')
    expect(EQUIPMENT_CATEGORIES).toContain('Mounts and Vehicles')
  })

  test('all categories have display labels', () => {
    for (const cat of EQUIPMENT_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeTruthy()
    }
  })
})

describe('getItemDetails', () => {
  test('returns empty array for item with no special fields', () => {
    expect(getItemDetails(baseCatalogItem)).toEqual([])
  })

  test('returns damage info for weapons', () => {
    const weapon: CatalogItem = {
      ...baseCatalogItem,
      category: 'Weapon',
      damageDice: '1d8',
      damageType: 'Slashing',
      weaponCategory: 'Martial',
      weaponRange: 'Melee',
      properties: ['Versatile'],
    }
    const details = getItemDetails(weapon)
    expect(details).toContain('1d8 Slashing')
    expect(details).toContain('Martial Melee')
    expect(details).toContain('Versatile')
  })

  test('includes two-handed damage when present', () => {
    const weapon: CatalogItem = {
      ...baseCatalogItem,
      damageDice: '1d8',
      damageType: 'Slashing',
      twoHandedDice: '1d10',
      twoHandedType: 'Slashing',
    }
    const details = getItemDetails(weapon)
    expect(details).toContain('2H: 1d10')
  })

  test('includes range for ranged weapons', () => {
    const ranged: CatalogItem = {
      ...baseCatalogItem,
      damageDice: '1d8',
      damageType: 'Piercing',
      weaponCategory: 'Martial',
      weaponRange: 'Ranged',
      rangeNormal: 150,
      rangeLong: 600,
    }
    const details = getItemDetails(ranged)
    expect(details).toContain('150/600 ft')
  })

  test('returns AC info for armor', () => {
    const armor: CatalogItem = {
      ...baseCatalogItem,
      category: 'Armor',
      acBase: 18,
      acDexBonus: false,
      armorCategory: 'Heavy',
      strMinimum: 15,
      stealthDisadvantage: true,
    }
    const details = getItemDetails(armor)
    expect(details).toContain('AC 18')
    expect(details).toContain('Heavy')
    expect(details).toContain('STR 15')
    expect(details).toContain('Stealth disadvantage')
  })

  test('includes dex bonus notation for light armor', () => {
    const armor: CatalogItem = {
      ...baseCatalogItem,
      acBase: 12,
      acDexBonus: true,
      armorCategory: 'Light',
    }
    const details = getItemDetails(armor)
    expect(details).toContain('AC 12 + Dex')
  })

  test('returns speed and capacity for mounts', () => {
    const mount: CatalogItem = {
      ...baseCatalogItem,
      category: 'Mounts and Vehicles',
      speedQty: 60,
      speedUnit: 'ft/round',
      capacity: '480 lb.',
    }
    const details = getItemDetails(mount)
    expect(details).toContain('Speed: 60 ft/round')
    expect(details).toContain('Capacity: 480 lb.')
  })
})
