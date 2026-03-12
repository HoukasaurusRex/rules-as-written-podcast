import { useStore } from '@nanostores/react'
import { $editMode, type PartyCharacter } from '../../stores/party'
import { DENOMINATIONS, DENOM_COLORS, DENOM_LABELS, type Denomination } from '../../utils/currency'

interface Props {
  character: PartyCharacter
  onUpdate: (characterId: string, updates: Record<string, unknown>) => void
}

export default function GoldTracker({ character, onUpdate }: Props) {
  const editMode = useStore($editMode)

  function adjust(denom: Denomination, delta: number) {
    const current = character[denom] ?? 0
    const next = Math.max(0, current + delta)
    onUpdate(character.id, { [denom]: next })
  }

  return (
    <div className="grid grid-cols-5 gap-space-2">
      {DENOMINATIONS.map((denom) => (
        <div
          key={denom}
          className="flex flex-col items-center rounded-[5px] border border-bg-lighter bg-bg p-space-2"
        >
          <span className={`text-xs font-bold uppercase tracking-wider ${DENOM_COLORS[denom]}`}>
            {DENOM_LABELS[denom]}
          </span>
          <span className="my-space-1 text-xl font-bold tabular-nums text-text">
            {character[denom] ?? 0}
          </span>
          {editMode && (
            <div className="flex gap-space-1">
              <button
                onClick={() => adjust(denom, -1)}
                className="flex h-11 w-11 items-center justify-center rounded-[5px] bg-bg-light text-lg font-bold text-text/60 transition-colors hover:bg-bg-lighter active:bg-primary/20"
                aria-label={`Remove 1 ${DENOM_LABELS[denom]}`}
              >
                −
              </button>
              <button
                onClick={() => adjust(denom, 1)}
                className="flex h-11 w-11 items-center justify-center rounded-[5px] bg-bg-light text-lg font-bold text-text/60 transition-colors hover:bg-bg-lighter active:bg-primary/20"
                aria-label={`Add 1 ${DENOM_LABELS[denom]}`}
              >
                +
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
