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

  const valHeight = compact ? 'h-8' : 'h-10'
  const arrowSize = compact ? 'text-xs' : 'text-base'

  return (
    <div
      className={`grid ${compact ? 'gap-space-1' : 'gap-space-2'}`}
      style={{ gridTemplateColumns: `repeat(${visible.length}, 1fr)` }}
    >
      {visible.map((denom) => (
        <div key={denom} className="flex flex-col items-center">
          {/* Up arrow */}
          {!readOnly && onChange && (
            <button
              type="button"
              onClick={() => update(denom, (values[denom] ?? 0) + 1)}
              className={`flex w-full items-center justify-center text-text/30 transition-colors hover:text-text/60 active:text-primary ${arrowSize} ${compact ? 'h-6' : 'h-8'}`}
              aria-label={`Add 1 ${DENOM_LABELS[denom]}`}
            >
              ▲
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
              className={`${valHeight} w-full rounded-[5px] border border-bg-lighter bg-bg text-center tabular-nums text-text outline-none focus:border-primary ${
                compact ? 'text-sm' : 'text-lg font-bold'
              }`}
            />
          ) : (
            <button
              type="button"
              onClick={() => startEditing(denom)}
              disabled={readOnly}
              className={`${valHeight} flex w-full items-center justify-center rounded-[5px] border border-bg-lighter bg-bg tabular-nums text-text transition-colors ${
                readOnly ? 'cursor-default' : 'cursor-text hover:bg-bg-light'
              } ${compact ? 'text-sm' : 'text-lg font-bold'}`}
            >
              {values[denom] ?? 0}
            </button>
          )}

          {/* Down arrow */}
          {!readOnly && onChange && (
            <button
              type="button"
              onClick={() => update(denom, (values[denom] ?? 0) - 1)}
              className={`flex w-full items-center justify-center text-text/30 transition-colors hover:text-text/60 active:text-primary ${arrowSize} ${compact ? 'h-6' : 'h-8'}`}
              aria-label={`Remove 1 ${DENOM_LABELS[denom]}`}
            >
              ▼
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
