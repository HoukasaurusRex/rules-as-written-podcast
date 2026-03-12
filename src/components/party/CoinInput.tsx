import { useState, useCallback } from 'react'
import {
  DENOMINATIONS,
  DENOM_COLORS,
  DENOM_LABELS,
  type Denomination,
} from '../../utils/currency'

export type CoinValues = Record<Denomination, number>

interface Props {
  values: CoinValues
  onChange?: (values: CoinValues) => void
  readOnly?: boolean
  hiddenDenoms?: Denomination[]
  compact?: boolean
}

const EMPTY: CoinValues = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }

export function emptyCoinValues(): CoinValues {
  return { ...EMPTY }
}

export default function CoinInput({
  values,
  onChange,
  readOnly = false,
  hiddenDenoms = [],
  compact = false,
}: Props) {
  const [editingDenom, setEditingDenom] = useState<Denomination | null>(null)
  const [editValue, setEditValue] = useState('')

  const visible = DENOMINATIONS.filter((d) => !hiddenDenoms.includes(d))

  const update = useCallback(
    (denom: Denomination, value: number) => {
      if (!onChange) return
      onChange({ ...values, [denom]: Math.max(0, value) })
    },
    [values, onChange],
  )

  function startEditing(denom: Denomination) {
    if (readOnly || !onChange) return
    setEditingDenom(denom)
    setEditValue(String(values[denom] || ''))
  }

  function commitEdit(denom: Denomination) {
    const parsed = parseInt(editValue)
    if (!isNaN(parsed) && parsed >= 0) {
      update(denom, parsed)
    }
    setEditingDenom(null)
  }

  return (
    <div
      className={`grid gap-space-2 ${compact ? 'gap-space-1' : ''}`}
      style={{ gridTemplateColumns: `repeat(${visible.length}, 1fr)` }}
    >
      {visible.map((denom) => (
        <div key={denom} className="flex flex-col items-center">
          {/* Up arrow */}
          {!readOnly && onChange && (
            <button
              onClick={() => update(denom, (values[denom] ?? 0) + 1)}
              className={`flex w-full items-center justify-center rounded-t-[5px] bg-bg-light text-text/40 transition-colors hover:bg-bg-lighter hover:text-text/70 active:bg-primary/20 ${
                compact ? 'h-8' : 'h-11'
              }`}
              aria-label={`Add 1 ${DENOM_LABELS[denom]}`}
            >
              <svg width={compact ? 14 : 18} height={compact ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          )}

          {/* Value */}
          {editingDenom === denom ? (
            <input
              type="number"
              min={0}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commitEdit(denom)}
              onKeyDown={(e) => e.key === 'Enter' && commitEdit(denom)}
              autoFocus
              inputMode="numeric"
              className={`w-full border-x border-bg-lighter bg-bg text-center tabular-nums text-text outline-none ${
                compact ? 'py-1 text-base' : 'py-2 text-xl font-bold'
              }`}
              style={{ fontSize: '16px' }}
            />
          ) : (
            <button
              onClick={() => startEditing(denom)}
              disabled={readOnly}
              className={`flex w-full items-center justify-center border-x border-bg-lighter bg-bg tabular-nums text-text transition-colors ${
                readOnly ? 'cursor-default' : 'cursor-text hover:bg-bg-light'
              } ${compact ? 'py-1 text-base' : 'py-2 text-xl font-bold'}`}
            >
              {values[denom] ?? 0}
            </button>
          )}

          {/* Down arrow */}
          {!readOnly && onChange && (
            <button
              onClick={() => update(denom, (values[denom] ?? 0) - 1)}
              className={`flex w-full items-center justify-center rounded-b-[5px] bg-bg-light text-text/40 transition-colors hover:bg-bg-lighter hover:text-text/70 active:bg-primary/20 ${
                compact ? 'h-8' : 'h-11'
              }`}
              aria-label={`Remove 1 ${DENOM_LABELS[denom]}`}
            >
              <svg width={compact ? 14 : 18} height={compact ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}

          {/* Label */}
          <span className={`mt-space-1 text-xs font-bold uppercase tracking-wider ${DENOM_COLORS[denom]}`}>
            {DENOM_LABELS[denom]}
          </span>
        </div>
      ))}
    </div>
  )
}
