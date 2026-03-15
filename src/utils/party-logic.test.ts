import { describe, test, expect } from 'vitest'
import {
  getTransactionSign,
  splitGold,
  computeInventoryAction,
  isAttunementFull,
  buildGoldDelta,
} from './party-logic'

describe('getTransactionSign', () => {
  test('spend and buy are negative', () => {
    expect(getTransactionSign('spend')).toBe(-1)
    expect(getTransactionSign('buy')).toBe(-1)
  })

  test('earn, sell, and loot are positive', () => {
    expect(getTransactionSign('earn')).toBe(1)
    expect(getTransactionSign('sell')).toBe(1)
    expect(getTransactionSign('loot')).toBe(1)
  })

  test('undo inverts the sign', () => {
    expect(getTransactionSign('buy', true)).toBe(1)
    expect(getTransactionSign('spend', true)).toBe(1)
    expect(getTransactionSign('earn', true)).toBe(-1)
    expect(getTransactionSign('sell', true)).toBe(-1)
  })

  test('unknown types default to positive', () => {
    expect(getTransactionSign('unknown')).toBe(1)
  })
})

describe('splitGold', () => {
  test('splits evenly among characters', () => {
    expect(splitGold(10, 2)).toEqual([5, 5])
    expect(splitGold(9, 3)).toEqual([3, 3, 3])
  })

  test('distributes remainder to first characters', () => {
    expect(splitGold(10, 3)).toEqual([4, 3, 3])
    expect(splitGold(7, 3)).toEqual([3, 2, 2])
    expect(splitGold(11, 4)).toEqual([3, 3, 3, 2])
  })

  test('handles total less than character count', () => {
    expect(splitGold(2, 5)).toEqual([1, 1, 0, 0, 0])
    expect(splitGold(1, 3)).toEqual([1, 0, 0])
  })

  test('handles single character', () => {
    expect(splitGold(42, 1)).toEqual([42])
  })

  test('handles zero total', () => {
    expect(splitGold(0, 3)).toEqual([0, 0, 0])
  })

  test('handles zero characters', () => {
    expect(splitGold(10, 0)).toEqual([])
  })

  test('handles negative total', () => {
    expect(splitGold(-5, 3)).toEqual([0, 0, 0])
  })
})

describe('computeInventoryAction', () => {
  test('buy with no existing item creates', () => {
    expect(computeInventoryAction('buy', null)).toBe('create')
  })

  test('buy with existing item increments', () => {
    expect(computeInventoryAction('buy', 3)).toBe('increment')
  })

  test('sell with quantity > 1 decrements', () => {
    expect(computeInventoryAction('sell', 5)).toBe('decrement')
    expect(computeInventoryAction('sell', 2)).toBe('decrement')
  })

  test('sell with quantity 1 deletes', () => {
    expect(computeInventoryAction('sell', 1)).toBe('delete')
  })

  test('sell with null quantity deletes (defaults to 1)', () => {
    expect(computeInventoryAction('sell', null)).toBe('none')
  })

  test('sell with no existing item is a no-op', () => {
    expect(computeInventoryAction('sell', null)).toBe('none')
  })

  test('undo buy with existing item decrements/deletes', () => {
    expect(computeInventoryAction('buy', 3, true)).toBe('decrement')
    expect(computeInventoryAction('buy', 1, true)).toBe('delete')
    expect(computeInventoryAction('buy', null, true)).toBe('none')
  })

  test('undo sell re-adds item', () => {
    expect(computeInventoryAction('sell', 2, true)).toBe('increment')
    expect(computeInventoryAction('sell', null, true)).toBe('create')
  })

  test('non buy/sell types are no-ops', () => {
    expect(computeInventoryAction('earn', 5)).toBe('none')
    expect(computeInventoryAction('loot', null)).toBe('none')
  })
})

describe('isAttunementFull', () => {
  test('allows when under limit', () => {
    expect(isAttunementFull(0)).toBe(false)
    expect(isAttunementFull(1)).toBe(false)
    expect(isAttunementFull(2)).toBe(false)
  })

  test('rejects at exactly 3', () => {
    expect(isAttunementFull(3)).toBe(true)
  })

  test('rejects over 3', () => {
    expect(isAttunementFull(5)).toBe(true)
  })

  test('respects custom max slots', () => {
    expect(isAttunementFull(2, 2)).toBe(true)
    expect(isAttunementFull(1, 2)).toBe(false)
  })
})

describe('buildGoldDelta', () => {
  test('applies positive sign to all denominations', () => {
    expect(buildGoldDelta({ cp: 10, sp: 5, gp: 3 }, 1)).toEqual({
      cp: 10, sp: 5, ep: 0, gp: 3, pp: 0,
    })
  })

  test('applies negative sign to all denominations', () => {
    expect(buildGoldDelta({ cp: 10, sp: 5, gp: 3 }, -1)).toEqual({
      cp: -10, sp: -5, ep: 0, gp: -3, pp: 0,
    })
  })

  test('handles null values as zero', () => {
    expect(buildGoldDelta({ cp: null, sp: null }, 1)).toEqual({
      cp: 0, sp: 0, ep: 0, gp: 0, pp: 0,
    })
  })

  test('handles empty denominations', () => {
    expect(buildGoldDelta({}, 1)).toEqual({
      cp: 0, sp: 0, ep: 0, gp: 0, pp: 0,
    })
  })
})
