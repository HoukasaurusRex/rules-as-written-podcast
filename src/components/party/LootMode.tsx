import { useState, useEffect } from 'react'
import ItemAutocomplete from './ItemAutocomplete'
import { DENOMINATIONS, DENOM_COLORS, type Denomination } from '../../utils/currency'

interface LootItem {
  name: string
  quantity: number
  srdIndex?: string
}

interface LootMagicItem {
  name: string
  rarity?: string
  requiresAttunement?: boolean
  srdIndex?: string
}

interface Props {
  onSubmit: (loot: {
    gold?: Record<string, number>
    items?: LootItem[]
    magicItems?: LootMagicItem[]
  }) => Promise<void>
  onClose: () => void
  playerName: string
  onLockLoot: (name: string | null) => Promise<void>
}

export default function LootMode({ onSubmit, onClose, playerName, onLockLoot }: Props) {
  const [gold, setGold] = useState<Record<Denomination, number>>({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 })
  const [items, setItems] = useState<LootItem[]>([])
  const [magicItems, setMagicItems] = useState<LootMagicItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Lock loot on mount
  useEffect(() => { onLockLoot(playerName) }, [])

  const totalEntries = items.length + magicItems.length + Object.values(gold).filter((v) => v > 0).length

  async function handleDone() {
    setSubmitting(true)

    const goldEntries = Object.fromEntries(
      Object.entries(gold).filter(([, v]) => v > 0),
    )

    await onSubmit({
      gold: Object.keys(goldEntries).length > 0 ? goldEntries : undefined,
      items: items.length > 0 ? items : undefined,
      magicItems: magicItems.length > 0 ? magicItems : undefined,
    })

    await onLockLoot(null)
    setSubmitting(false)
    onClose()
  }

  function handleCancel() {
    onLockLoot(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--color-bg-lighten-20)] px-space-4 py-space-3">
        <h2 className="m-0 text-lg font-bold text-text">Loot Mode</h2>
        <div className="flex items-center gap-space-3">
          <span className="text-xs text-text/40">
            {totalEntries} item{totalEntries !== 1 ? 's' : ''} added
          </span>
          <button
            onClick={handleCancel}
            className="text-sm text-text/50 hover:text-text"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-space-4 pb-space-14">
        {/* Gold */}
        <section className="mb-space-6">
          <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
            Gold (auto-splits evenly)
          </h3>
          <div className="grid grid-cols-5 gap-space-2">
            {DENOMINATIONS.map((denom) => (
                <div key={denom} className="flex flex-col items-center gap-space-1">
                  <span className={`text-xs font-bold uppercase ${DENOM_COLORS[denom]}`}>
                    {denom.toUpperCase()}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={gold[denom] || ''}
                    onChange={(e) => setGold({ ...gold, [denom]: parseInt(e.target.value) || 0 })}
                    inputMode="numeric"
                    className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg-light px-space-2 py-space-2 text-center text-base tabular-nums text-text outline-none focus:border-primary"
                    style={{ fontSize: '16px' }}
                  />
                </div>
            ))}
          </div>
        </section>

        {/* Items */}
        <section className="mb-space-6">
          <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
            Items (added to loot pool)
          </h3>
          <ItemAutocomplete
            type="equipment"
            placeholder="Search equipment or type custom..."
            onSelect={(item) => {
              setItems([...items, { name: item.name, quantity: 1, srdIndex: 'index' in item ? item.index : undefined }])
            }}
          />
          {items.length > 0 && (
            <div className="mt-space-2 space-y-space-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-[5px] bg-bg-light px-space-3 py-space-2 text-sm">
                  <span className="text-text">{item.name}</span>
                  <button
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    className="text-xs text-red-400/50 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Magic Items */}
        <section className="mb-space-6">
          <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
            Magic Items (added to loot pool)
          </h3>
          <ItemAutocomplete
            type="magic-item"
            placeholder="Search magic items or type custom..."
            onSelect={(item) => {
              setMagicItems([
                ...magicItems,
                {
                  name: item.name,
                  rarity: 'rarity' in item ? item.rarity : undefined,
                  requiresAttunement: 'requiresAttunement' in item ? item.requiresAttunement : false,
                  srdIndex: 'index' in item ? item.index : undefined,
                },
              ])
            }}
          />
          {magicItems.length > 0 && (
            <div className="mt-space-2 space-y-space-1">
              {magicItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-[5px] bg-bg-light px-space-3 py-space-2 text-sm">
                  <div>
                    <span className="text-text">{item.name}</span>
                    {item.rarity && (
                      <span className="ml-space-2 text-xs text-text/40">{item.rarity}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setMagicItems(magicItems.filter((_, j) => j !== i))}
                    className="text-xs text-red-400/50 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Done button */}
      <div className="border-t border-[color:var(--color-bg-lighten-20)] bg-bg p-space-4">
        <button
          onClick={handleDone}
          disabled={submitting || totalEntries === 0}
          className="w-full rounded-[5px] bg-primary px-space-4 py-space-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
        >
          {submitting ? 'Distributing...' : `Distribute Loot (${totalEntries} entries)`}
        </button>
      </div>
    </div>
  )
}
