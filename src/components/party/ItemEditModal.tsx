import { useState } from 'react'
import { useDialog } from './hooks/useDialog'

interface InventoryFields {
  type: 'inventory'
  id: string
  name: string
  quantity: number
  weight: number | null
}

interface MagicItemFields {
  type: 'magic'
  id: string
  name: string
  rarity: string | null
  description: string | null
  requiresAttunement: boolean
}

type ItemFields = InventoryFields | MagicItemFields

interface Props {
  item: ItemFields
  onSave: (updates: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']

export default function ItemEditModal({ item, onSave, onClose }: Props) {
  const { dialogProps } = useDialog(onClose)
  const [name, setName] = useState(item.name)
  const [submitting, setSubmitting] = useState(false)

  // Inventory-specific
  const [quantity, setQuantity] = useState(item.type === 'inventory' ? item.quantity : 1)
  const [weight, setWeight] = useState(item.type === 'inventory' ? item.weight ?? '' : '')

  // Magic-specific
  const [rarity, setRarity] = useState(item.type === 'magic' ? item.rarity ?? '' : '')
  const [description, setDescription] = useState(item.type === 'magic' ? item.description ?? '' : '')
  const [requiresAttunement, setRequiresAttunement] = useState(
    item.type === 'magic' ? item.requiresAttunement : false,
  )

  async function handleSave() {
    if (!name.trim() || submitting) return
    setSubmitting(true)

    const updates: Record<string, unknown> = { id: item.id, name: name.trim() }

    if (item.type === 'inventory') {
      updates.quantity = quantity
      updates.weight = weight === '' ? null : Number(weight)
    } else {
      updates.rarity = rarity || null
      updates.description = description || null
      updates.requiresAttunement = requiresAttunement
    }

    await onSave(updates)
    setSubmitting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-space-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      {...dialogProps}
      aria-labelledby="item-edit-title"
    >
      <div className="w-full max-w-sm rounded-[5px] border border-bg-lighter bg-bg-light p-space-6 shadow-lg">
        <h3 id="item-edit-title" className="m-0 mb-space-4 text-base font-bold text-text">
          Edit {item.type === 'magic' ? 'Magic Item' : 'Item'}
        </h3>

        <div className="space-y-space-3">
          <div>
            <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-sm text-text outline-none focus:border-primary"
              style={{ fontSize: '16px' }}
            />
          </div>

          {item.type === 'inventory' && (
            <>
              <div>
                <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputMode="numeric"
                  className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-sm text-text outline-none focus:border-primary"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">Weight (lb)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  inputMode="decimal"
                  placeholder="Optional"
                  className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-sm text-text placeholder-text/30 outline-none focus:border-primary"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </>
          )}

          {item.type === 'magic' && (
            <>
              <div>
                <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">Rarity</label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value)}
                  className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-sm text-text outline-none focus:border-primary"
                  style={{ fontSize: '16px' }}
                >
                  <option value="">Unknown</option>
                  {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Item description..."
                  className="w-full resize-none rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-sm text-text placeholder-text/30 outline-none focus:border-primary"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <label className="flex items-center gap-space-2 text-xs text-text/70">
                <input
                  type="checkbox"
                  checked={requiresAttunement}
                  onChange={(e) => setRequiresAttunement(e.target.checked)}
                  className="accent-primary"
                />
                Requires attunement
              </label>
            </>
          )}
        </div>

        <div className="mt-space-4 flex gap-space-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-2 text-sm text-text/60 transition-colors hover:bg-bg-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || !name.trim()}
            className="flex-1 rounded-[5px] bg-primary px-space-4 py-space-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
