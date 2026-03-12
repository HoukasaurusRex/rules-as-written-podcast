export const DENOMINATIONS = ['pp', 'gp', 'ep', 'sp', 'cp'] as const
export type Denomination = (typeof DENOMINATIONS)[number]

export const DENOM_COLORS: Record<Denomination, string> = {
  pp: 'text-gold-pp',
  gp: 'text-gold-gp',
  ep: 'text-gold-ep',
  sp: 'text-gold-sp',
  cp: 'text-gold-cp',
}

export const DENOM_LABELS: Record<Denomination, string> = {
  pp: 'PP',
  gp: 'GP',
  ep: 'EP',
  sp: 'SP',
  cp: 'CP',
}

export function isDebitTransaction(type: string): boolean {
  return ['spend', 'buy'].includes(type)
}
