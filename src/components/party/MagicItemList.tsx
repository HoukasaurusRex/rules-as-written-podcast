import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode, type PartyMagicItem, type PartyCharacter } from '../../stores/party'
import ItemAutocomplete from './ItemAutocomplete'
import ItemEditModal from './ItemEditModal'

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
  onAdd?: (item: Record<string, unknown>) => Promise<void>
  onUpdate: (item: Record<string, unknown>) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
  showHeading?: boolean
}

export default function MagicItemList({
  items,
  characters,
  currentCharacterId,
  onAdd,
  onUpdate,
  onDelete,
  showHeading = true,
}: Props) {
  const editMode = useStore($editMode)
  const [showAddInput, setShowAddInput] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [assigningItem, setAssigningItem] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<PartyMagicItem | null>(null)

  const attunedCount = items.filter(
    (i) => i.characterId === currentCharacterId && i.attuned,
  ).length

  return (
    <section>
      {showHeading && (
        <div className="mb-space-3 flex items-center justify-between">
          <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
            {currentCharacterId ? 'Magic Items' : 'Unclaimed Loot'}
            {currentCharacterId && (
              <span className="ml-space-2 text-xs font-normal text-text/30">
                ({attunedCount}/3 attuned)
              </span>
            )}
          </h3>
          {editMode && onAdd && (
            <button
              type="button"
              onClick={() => setShowAddInput(!showAddInput)}
              className="rounded-[5px] bg-primary/20 px-space-3 py-space-1 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
            >
              {showAddInput ? 'Cancel' : '+ Add'}
            </button>
          )}
        </div>
      )}

      {showAddInput && editMode && onAdd && (
        <div className="mb-space-3 flex gap-space-2">
          <div className="flex-1">
            <ItemAutocomplete
              type="magic-item"
              placeholder="Search magic items..."
              onSelect={async (item) => {
                await onAdd({
                  characterId: currentCharacterId,
                  name: item.name,
                  rarity: 'rarity' in item ? item.rarity : undefined,
                  requiresAttunement: 'requiresAttunement' in item ? item.requiresAttunement : false,
                  srdIndex: 'index' in item ? item.index : undefined,
                })
                setShowAddInput(false)
              }}
            />
          </div>
        </div>
      )}

      {items.length === 0 && showHeading ? (
        <div className="rounded-[5px] border border-dashed border-bg-lighter py-space-4 text-center text-xs text-text/30">
          {currentCharacterId ? 'No magic items' : 'No unclaimed loot'}
        </div>
      ) : (
        <div className="space-y-space-1">
          {[...items].sort((a, b) => a.name.localeCompare(b.name)).map((item) => {
            const colorParts = (RARITY_COLORS[item.rarity ?? ''] ?? 'text-text border-bg-lighter').split(' ')
            const textColor = colorParts[0]
            const borderColor = colorParts[1] ?? 'border-bg-lighter'
            const isExpanded = expandedId === item.id
            const descSnippet = item.description?.slice(0, 60)

            return (
              <div key={item.id} className={`rounded-[5px] border bg-bg ${borderColor}`}>
                {/* Main row: name + description snippet + quick actions */}
                <div className="flex items-center gap-space-2 px-space-3 py-space-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex min-w-0 flex-1 items-center gap-space-2 text-left"
                  >
                    <svg
                      width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 text-text/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-space-1">
                        <span className={`truncate text-sm font-medium ${textColor}`}>{item.name}</span>
                        {item.attuned && (
                          <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0 text-[9px] font-semibold uppercase text-primary-muted">
                            A
                          </span>
                        )}
                      </div>
                      {descSnippet && (
                        <div className="truncate text-[11px] text-text/30">
                          {descSnippet}{(item.description?.length ?? 0) > 60 ? '…' : ''}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Quick actions — always visible in edit mode */}
                  {editMode && (
                    <div className="flex shrink-0 items-center gap-space-1">
                      {item.requiresAttunement && item.characterId && (
                        <button
                          type="button"
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
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setAssigningItem(assigningItem === item.id ? null : item.id) }}
                        className="rounded px-space-2 py-space-1 text-[10px] text-text/40 hover:bg-bg-light hover:text-text/60"
                      >
                        {currentCharacterId ? 'Give' : 'Assign'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${item.name}?`)) onDelete(item.id) }}
                        className="rounded px-space-2 py-space-1 text-[10px] text-error/50 hover:bg-error/10 hover:text-error"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Assignment dropdown */}
                {assigningItem === item.id && editMode && (
                  <div className="flex flex-wrap gap-space-1 border-t border-bg-lighter px-space-3 py-space-2">
                    <button
                      type="button"
                      onClick={() => { onUpdate({ id: item.id, characterId: null }); setAssigningItem(null) }}
                      className={`rounded px-space-2 py-space-1 text-xs transition-colors ${
                        !item.characterId ? 'bg-primary/20 text-primary-muted' : 'bg-bg-light text-text/50 hover:bg-bg-lighter'
                      }`}
                    >
                      Loot Pool
                    </button>
                    {characters.map((char) => (
                      <button
                        type="button"
                        key={char.id}
                        onClick={() => { onUpdate({ id: item.id, characterId: char.id }); setAssigningItem(null) }}
                        className={`rounded px-space-2 py-space-1 text-xs transition-colors ${
                          item.characterId === char.id ? 'bg-primary/20 text-primary-muted' : 'bg-bg-light text-text/50 hover:bg-bg-lighter'
                        }`}
                      >
                        {char.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-bg-lighter px-space-3 py-space-3 text-xs text-text/50">
                    <p className="m-0 mb-space-2 leading-relaxed text-text/60">
                      {item.description || <span className="italic text-text/20">No description</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-space-3">
                      <span><span className="text-text/30">Rarity:</span> {item.rarity || 'Unknown'}</span>
                      {item.requiresAttunement && <span>Requires attunement</span>}
                      {item.srdIndex && <span><span className="text-text/30">SRD:</span> {item.srdIndex}</span>}
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="rounded-[5px] bg-bg-light px-space-3 py-space-1 text-xs text-text/50 hover:bg-bg-lighter hover:text-text/70"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {editingItem && (
        <ItemEditModal
          item={{
            type: 'magic',
            id: editingItem.id,
            name: editingItem.name,
            rarity: editingItem.rarity,
            description: editingItem.description,
            requiresAttunement: editingItem.requiresAttunement,
          }}
          onSave={onUpdate}
          onClose={() => setEditingItem(null)}
        />
      )}
    </section>
  )
}
