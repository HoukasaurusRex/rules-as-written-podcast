import { atom } from 'nanostores'

export interface PartyCharacter {
  id: string
  partyId: string
  name: string
  class: string | null
  level: number
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
  sortOrder: number
}

export interface CatalogItem {
  id: string
  category: string
  damageDice: string | null
  damageType: string | null
  twoHandedDice: string | null
  twoHandedType: string | null
  weaponCategory: string | null
  weaponRange: string | null
  rangeNormal: number | null
  rangeLong: number | null
  properties: string[] | null
  acBase: number | null
  acDexBonus: boolean | null
  armorCategory: string | null
  strMinimum: number | null
  stealthDisadvantage: boolean | null
  speedQty: number | null
  speedUnit: string | null
  capacity: string | null
  vehicleCategory: string | null
  description: string | null
  toolCategory: string | null
}

export interface PartyInventoryItem {
  id: string
  partyId: string
  characterId: string | null
  name: string
  quantity: number
  weight: number | null
  srdIndex: string | null
  catalogItemId: string | null
  catalogItem?: CatalogItem
  createdAt: string
}

export interface PartyMagicItem {
  id: string
  partyId: string
  characterId: string | null
  name: string
  rarity: string | null
  description: string | null
  attuned: boolean
  requiresAttunement: boolean
  srdIndex: string | null
  createdAt: string
}

export interface PartyData {
  id: string
  name: string
  code: string
  lootActiveBy: string | null
  showEp: boolean
  showPp: boolean
  createdAt: string
  characters: PartyCharacter[]
  inventoryItems: PartyInventoryItem[]
  magicItems: PartyMagicItem[]
}

export interface Transaction {
  id: string
  partyId: string
  characterId: string | null
  type: string
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
  itemName: string | null
  note: string | null
  undone: boolean
  undoesId: string | null
  createdAt: string
}

export const $partyData = atom<PartyData | null>(null)
export const $editMode = atom(false)
export const $recentTransactions = atom<Transaction[]>([])
export const $activeTab = atom<string>('party') // 'party' or character id
