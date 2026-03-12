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

  return (
    <section>
      <div className="mb-space-3 flex items-center justify-between">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
          Inventory
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
        <div className="rounded-[5px] border border-dashed border-[color:var(--color-bg-lighten-20)] py-space-4 text-center text-xs text-text/30">
          No items
        </div>
      ) : (
        <div className="space-y-space-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-[5px] bg-bg px-space-3 py-space-2"
            >
              <span className="text-sm text-text">{item.name}</span>
              <div className="flex items-center gap-space-2">
                {editMode && (
                  <>
                    <button
                      onClick={() => {
                        const newQty = (item.quantity ?? 1) - 1
                        if (newQty <= 0) onDelete(item.id)
                        else onUpdate({ id: item.id, quantity: newQty })
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded bg-bg-light text-xs text-text/50 hover:bg-bg-lighter"
                    >
                      −
                    </button>
                  </>
                )}
                <span className="min-w-[24px] text-center text-sm tabular-nums text-text/60">
                  ×{item.quantity}
                </span>
                {editMode && (
                  <>
                    <button
                      onClick={() => onUpdate({ id: item.id, quantity: (item.quantity ?? 1) + 1 })}
                      className="flex h-7 w-7 items-center justify-center rounded bg-bg-light text-xs text-text/50 hover:bg-bg-lighter"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="ml-space-1 flex h-7 w-7 items-center justify-center rounded text-xs text-red-400/50 hover:bg-red-400/10 hover:text-red-400"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
