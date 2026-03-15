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

export const isDebitTransaction = (type: string): boolean =>
  ['spend', 'buy'].includes(type)

export const getHiddenDenominations = (party: { showEp?: boolean; showPp?: boolean }): Denomination[] =>
  [!party.showEp && 'ep', !party.showPp && 'pp'].filter(Boolean) as Denomination[]

const GP_RATES: Record<Denomination, number> = {
  pp: 10,
  gp: 1,
  ep: 0.5,
  sp: 0.1,
  cp: 0.01,
}

export const totalGpValue = (coins: { pp?: number; gp?: number; ep?: number; sp?: number; cp?: number }): number => {
  let total = 0
  for (const d of DENOMINATIONS) {
    total += (coins[d] ?? 0) * GP_RATES[d]
  }
  return Math.floor(total)
}
