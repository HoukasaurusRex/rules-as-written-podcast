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

export interface PartyInventoryItem {
  id: string
  partyId: string
  characterId: string | null
  name: string
  quantity: number
  weight: number | null
  srdIndex: string | null
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
