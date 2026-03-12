import { useStore } from '@nanostores/react'
import { $editMode, type PartyCharacter } from '../../stores/party'

const DENOMINATIONS = [
  { key: 'pp', label: 'PP', color: 'text-gold-pp' },
  { key: 'gp', label: 'GP', color: 'text-gold-gp' },
  { key: 'ep', label: 'EP', color: 'text-gold-ep' },
  { key: 'sp', label: 'SP', color: 'text-gold-sp' },
  { key: 'cp', label: 'CP', color: 'text-gold-cp' },
] as const

type Denomination = (typeof DENOMINATIONS)[number]['key']

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
      {DENOMINATIONS.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex flex-col items-center rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg p-space-2"
        >
          <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>
            {label}
          </span>
          <span className="my-space-1 text-xl font-bold tabular-nums text-text">
            {character[key] ?? 0}
          </span>
          {editMode && (
            <div className="flex gap-space-1">
              <button
                onClick={() => adjust(key, -1)}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[5px] bg-bg-light text-lg font-bold text-text/60 transition-colors hover:bg-bg-lighter active:bg-primary/20"
                aria-label={`Remove 1 ${label}`}
              >
                −
              </button>
              <button
                onClick={() => adjust(key, 1)}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[5px] bg-bg-light text-lg font-bold text-text/60 transition-colors hover:bg-bg-lighter active:bg-primary/20"
                aria-label={`Add 1 ${label}`}
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
