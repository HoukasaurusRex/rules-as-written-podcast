import type { CatalogItem } from '../stores/party'

export const EQUIPMENT_CATEGORIES = [
  'Weapon',
  'Adventuring Gear',
  'Tools',
  'Armor',
  'Mounts and Vehicles',
] as const

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  Weapon: 'Weapons',
  'Adventuring Gear': 'Gear',
  Tools: 'Tools',
  Armor: 'Armor',
  'Mounts and Vehicles': 'Mounts',
}

export const getItemDetails = (item: CatalogItem): string[] => {
  const details: string[] = []

  // Weapon details
  if (item.damageDice) {
    details.push(`${item.damageDice} ${item.damageType ?? ''}`.trim())
  }
  if (item.twoHandedDice) {
    details.push(`2H: ${item.twoHandedDice}`)
  }
  if (item.weaponCategory && item.weaponRange) {
    details.push(`${item.weaponCategory} ${item.weaponRange}`)
  }
  if (item.rangeNormal) {
    const range = item.rangeLong
      ? `${item.rangeNormal}/${item.rangeLong} ft`
      : `${item.rangeNormal} ft`
    details.push(range)
  }
  if (item.properties?.length) {
    details.push(item.properties.join(', '))
  }

  // Armor details
  if (item.acBase != null) {
    const dex = item.acDexBonus ? ' + Dex' : ''
    details.push(`AC ${item.acBase}${dex}`)
  }
  if (item.armorCategory) {
    details.push(item.armorCategory)
  }
  if (item.strMinimum) {
    details.push(`STR ${item.strMinimum}`)
  }
  if (item.stealthDisadvantage) {
    details.push('Stealth disadvantage')
  }

  // Mount/Vehicle details
  if (item.speedQty) {
    details.push(`Speed: ${item.speedQty} ${item.speedUnit ?? 'ft'}`)
  }
  if (item.capacity) {
    details.push(`Capacity: ${item.capacity}`)
  }

  return details
}
