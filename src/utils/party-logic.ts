/** Denomination keys used for gold tracking */
export type Denomination = 'cp' | 'sp' | 'ep' | 'gp' | 'pp'
export const DENOMINATIONS: readonly Denomination[] = ['cp', 'sp', 'ep', 'gp', 'pp'] as const

/** Transaction types that reduce a character's gold */
const OUTGOING_TYPES = ['spend', 'buy'] as const

/**
 * Returns the sign multiplier for a transaction type.
 * Spend/buy reduce gold (-1), everything else adds (+1).
 * When undoing, the sign is inverted.
 */
export const getTransactionSign = (type: string, isUndo = false): 1 | -1 => {
  const isOutgoing = (OUTGOING_TYPES as readonly string[]).includes(type)
  const sign = isOutgoing ? -1 : 1
  return (isUndo ? -sign : sign) as 1 | -1
}

/**
 * Splits a total amount among `count` recipients using round-robin remainder distribution.
 * First characters receive the remainder (1 extra each).
 * Returns an array of per-recipient amounts.
 */
export const splitGold = (total: number, count: number): number[] => {
  if (count <= 0 || total <= 0) return Array(Math.max(count, 0)).fill(0)

  const perChar = Math.floor(total / count)
  let remainder = total % count

  return Array.from({ length: count }, () => {
    const extra = remainder > 0 ? 1 : 0
    if (remainder > 0) remainder--
    return perChar + extra
  })
}

/** Possible inventory actions resulting from a transaction */
export type InventoryAction = 'create' | 'increment' | 'decrement' | 'delete' | 'none'

/**
 * Determines what inventory operation to perform based on transaction type and existing quantity.
 * For undo operations, the action is inverted (undo-buy removes, undo-sell adds).
 */
export const computeInventoryAction = (
  txType: string,
  existingQuantity: number | null,
  isUndo = false,
): InventoryAction => {
  const isAdding = isUndo ? txType === 'sell' : txType === 'buy'
  const isRemoving = isUndo ? txType === 'buy' : txType === 'sell'

  if (isAdding) {
    return existingQuantity != null ? 'increment' : 'create'
  }
  if (isRemoving) {
    if (existingQuantity == null) return 'none'
    return (existingQuantity ?? 1) <= 1 ? 'delete' : 'decrement'
  }
  return 'none'
}

/**
 * Checks whether a character has reached the attunement slot limit (default 3 per D&D 5e rules).
 */
export const isAttunementFull = (currentAttuned: number, maxSlots = 3): boolean =>
  currentAttuned >= maxSlots

/**
 * Builds a gold delta record with the sign applied to each denomination.
 * Used to construct the SQL update for character gold.
 */
export const buildGoldDelta = (
  denominations: Partial<Record<Denomination, number | null>>,
  sign: 1 | -1,
): Record<Denomination, number> => {
  const result = {} as Record<Denomination, number>
  for (const denom of DENOMINATIONS) {
    result[denom] = sign * (denominations[denom] ?? 0) || 0
  }
  return result
}
