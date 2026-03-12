import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode, type PartyInventoryItem } from '../../stores/party'
import ItemAutocomplete from './ItemAutocomplete'

interface Props {
  items: PartyInventoryItem[]
  characterId: string | null
  onAdd: (item: Record<string, unknown>) => Promise<void>
  onUpdate: (item: Record<string, unknown>) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
}

export default function InventoryList({ items, characterId, onAdd, onUpdate, onDelete }: Props) {
  const editMode = useStore($editMode)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  return (
    <section>
      <div className="mb-space-3 flex items-center justify-between">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
          Inventory
          {items.length > 0 && (
            <span className="ml-space-2 text-xs font-normal text-text/30">({items.length})</span>
          )}
        </h3>
        {editMode && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-[5px] bg-primary/20 px-space-3 py-space-1 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
          >
            {showAdd ? 'Cancel' : '+ Add Item'}
          </button>
        )}
      </div>

      {showAdd && editMode && (
        <div className="mb-space-3">
          <ItemAutocomplete
            type="equipment"
            placeholder="Search equipment or type custom item..."
            onSelect={async (item) => {
              await onAdd({
                characterId,
                name: item.name,
                srdIndex: 'index' in item ? item.index : undefined,
                weight: 'weight' in item ? item.weight : undefined,
              })
              setShowAdd(false)
            }}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-[5px] border border-dashed border-bg-lighter py-space-4 text-center text-xs text-text/30">
          No items
        </div>
      ) : (
        <div className="space-y-space-1">
          {items.map((item) => {
            const isExpanded = expandedId === item.id
            return (
              <div key={item.id} className="rounded-[5px] bg-bg">
                {/* Item row */}
                <div className="flex items-center justify-between px-space-3 py-space-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex min-w-0 flex-1 items-center gap-space-2 text-left"
                  >
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 text-text/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="truncate text-sm text-text">{item.name}</span>
                  </button>
                  <div className="flex items-center gap-space-2">
                    {editMode && (
                      <button
                        onClick={() => {
                          const newQty = (item.quantity ?? 1) - 1
                          if (newQty <= 0) onDelete(item.id)
                          else onUpdate({ id: item.id, quantity: newQty })
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded bg-bg-light text-xs text-text/50 hover:bg-bg-lighter"
                      >
                        −
                      </button>
                    )}
                    <span className="min-w-6 text-center text-sm tabular-nums text-text/60">
                      ×{item.quantity}
                    </span>
                    {editMode && (
                      <>
                        <button
                          onClick={() => onUpdate({ id: item.id, quantity: (item.quantity ?? 1) + 1 })}
                          className="flex h-8 w-8 items-center justify-center rounded bg-bg-light text-xs text-text/50 hover:bg-bg-lighter"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded text-xs text-error/50 hover:bg-error/10 hover:text-error"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-bg-lighter px-space-3 py-space-3 text-xs text-text/50">
                    {editingId === item.id ? (
                      <div className="space-y-space-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-sm text-text outline-none focus:border-primary"
                          style={{ fontSize: '16px' }}
                        />
                        <div className="flex gap-space-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-1 text-xs text-text/50 hover:bg-bg-light"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editName.trim()) {
                                onUpdate({ id: item.id, name: editName.trim() })
                              }
                              setEditingId(null)
                            }}
                            className="rounded-[5px] bg-primary px-space-3 py-space-1 text-xs font-medium text-white hover:bg-primary-light"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.weight != null && (
                          <div className="mb-space-1">
                            <span className="text-text/30">Weight:</span> {item.weight} lb
                          </div>
                        )}
                        {item.srdIndex && (
                          <div className="mb-space-1">
                            <span className="text-text/30">SRD:</span> {item.srdIndex}
                          </div>
                        )}
                        {!item.weight && !item.srdIndex && (
                          <div className="mb-space-1 text-text/30">Custom item</div>
                        )}
                        {editMode && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditName(item.name)
                            }}
                            className="mt-space-2 rounded-[5px] bg-bg-light px-space-3 py-space-1 text-xs text-text/50 hover:bg-bg-lighter hover:text-text/70"
                          >
                            Edit name
                          </button>
                        )}
                      </>
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
