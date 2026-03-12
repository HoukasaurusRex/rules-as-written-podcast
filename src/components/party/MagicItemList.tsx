import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode, type PartyMagicItem, type PartyCharacter } from '../../stores/party'
import ItemAutocomplete from './ItemAutocomplete'

const RARITY_COLORS: Record<string, string> = {
  Common: 'text-rarity-common border-rarity-common/30',
  Uncommon: 'text-rarity-uncommon border-rarity-uncommon/30',
  Rare: 'text-rarity-rare border-rarity-rare/30',
  'Very Rare': 'text-rarity-very-rare border-rarity-very-rare/30',
  Legendary: 'text-rarity-legendary border-rarity-legendary/30',
  Artifact: 'text-rarity-artifact border-rarity-artifact/30',
}

interface Props {
  items: PartyMagicItem[]
  characters: PartyCharacter[]
  currentCharacterId: string | null
  onAdd: (item: Record<string, unknown>) => Promise<void>
  onUpdate: (item: Record<string, unknown>) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
}

export default function MagicItemList({
  items,
  characters,
  currentCharacterId,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const editMode = useStore($editMode)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assigningItem, setAssigningItem] = useState<string | null>(null)

  const attunedCount = items.filter(
    (i) => i.characterId === currentCharacterId && i.attuned,
  ).length

  return (
    <section>
      <div className="mb-space-3 flex items-center justify-between">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
          {currentCharacterId ? 'Magic Items' : 'Unclaimed Loot'}
          {currentCharacterId && (
            <span className="ml-space-2 text-xs font-normal text-text/30">
              ({attunedCount}/3 attuned)
            </span>
          )}
        </h3>
        {editMode && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-[5px] bg-primary/20 px-space-3 py-space-1 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
          >
            {showAdd ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {showAdd && editMode && (
        <div className="mb-space-3">
          <ItemAutocomplete
            type="magic-item"
            placeholder="Search magic items or type custom..."
            onSelect={async (item) => {
              await onAdd({
                characterId: currentCharacterId,
                name: item.name,
                rarity: 'rarity' in item ? item.rarity : undefined,
                requiresAttunement: 'requiresAttunement' in item ? item.requiresAttunement : false,
                srdIndex: 'index' in item ? item.index : undefined,
              })
              setShowAdd(false)
            }}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-[5px] border border-dashed border-bg-lighter py-space-4 text-center text-xs text-text/30">
          {currentCharacterId ? 'No magic items' : 'No unclaimed loot'}
        </div>
      ) : (
        <div className="space-y-space-2">
          {items.map((item) => {
            const colorParts = (RARITY_COLORS[item.rarity ?? ''] ?? 'text-text border-bg-lighter').split(' ')
            const textColor = colorParts[0]
            const borderColor = colorParts[1] ?? 'border-bg-lighter'
            const isExpanded = expandedId === item.id

            return (
              <div key={item.id} className={`rounded-[5px] border bg-bg ${borderColor}`}>
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex w-full items-start justify-between p-space-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-space-2">
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`shrink-0 text-text/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className={`text-sm font-medium ${textColor}`}>{item.name}</span>
                      {item.attuned && (
                        <span className="rounded-full bg-primary/20 px-space-2 py-0.5 text-[10px] font-semibold uppercase text-primary-muted">
                          Attuned
                        </span>
                      )}
                    </div>
                    <div className="mt-space-1 pl-5 text-xs text-text/40">
                      {item.rarity}
                      {item.requiresAttunement && ' · Requires attunement'}
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-bg-lighter px-space-3 py-space-3">
                    {/* Description */}
                    {item.description && (
                      <p className="m-0 mb-space-3 text-xs leading-relaxed text-text/60">
                        {item.description}
                      </p>
                    )}

                    {/* Edit actions */}
                    {editMode && (
                      <div className="flex flex-wrap gap-space-1">
                        {item.requiresAttunement && item.characterId && (
                          <button
                            onClick={() => onUpdate({ id: item.id, attuned: !item.attuned })}
                            disabled={!item.attuned && attunedCount >= 3}
                            className={`rounded px-space-2 py-space-1 text-[10px] font-medium transition-colors ${
                              item.attuned
                                ? 'bg-primary/20 text-primary-muted hover:bg-primary/30'
                                : 'bg-bg-light text-text/40 hover:bg-bg-lighter disabled:opacity-30'
                            }`}
                          >
                            {item.attuned ? 'Unattune' : 'Attune'}
                          </button>
                        )}

                        <button
                          onClick={() => setAssigningItem(assigningItem === item.id ? null : item.id)}
                          className="rounded px-space-2 py-space-1 text-[10px] text-text/40 hover:bg-bg-light hover:text-text/60"
                        >
                          Assign
                        </button>

                        <button
                          onClick={() => onDelete(item.id)}
                          className="rounded px-space-2 py-space-1 text-[10px] text-red-400/50 hover:bg-red-400/10 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {/* Assignment dropdown */}
                    {assigningItem === item.id && editMode && (
                      <div className="mt-space-2 flex flex-wrap gap-space-1 border-t border-bg-lighter pt-space-2">
                        <button
                          onClick={() => {
                            onUpdate({ id: item.id, characterId: null })
                            setAssigningItem(null)
                          }}
                          className={`rounded px-space-2 py-space-1 text-xs transition-colors ${
                            !item.characterId ? 'bg-primary/20 text-primary-muted' : 'bg-bg-light text-text/50 hover:bg-bg-lighter'
                          }`}
                        >
                          Loot Pool
                        </button>
                        {characters.map((char) => (
                          <button
                            key={char.id}
                            onClick={() => {
                              onUpdate({ id: item.id, characterId: char.id })
                              setAssigningItem(null)
                            }}
                            className={`rounded px-space-2 py-space-1 text-xs transition-colors ${
                              item.characterId === char.id ? 'bg-primary/20 text-primary-muted' : 'bg-bg-light text-text/50 hover:bg-bg-lighter'
                            }`}
                          >
                            {char.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
