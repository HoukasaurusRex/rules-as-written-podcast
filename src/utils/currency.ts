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

const GP_RATES: Record<Denomination, number> = {
  pp: 10,
  gp: 1,
  ep: 0.5,
  sp: 0.1,
  cp: 0.01,
}

export function totalGpValue(coins: { pp?: number; gp?: number; ep?: number; sp?: number; cp?: number }): number {
  let total = 0
  for (const d of DENOMINATIONS) {
    total += (coins[d] ?? 0) * GP_RATES[d]
  }
  return Math.floor(total)
}
