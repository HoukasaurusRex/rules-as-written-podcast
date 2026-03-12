import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $partyData } from '../../stores/party'
import type { Denomination } from '../../utils/currency'
import CoinInput, { emptyCoinValues, type CoinValues } from './CoinInput'
import ItemAutocomplete from './ItemAutocomplete'

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
    note?: string
    autoConvert?: boolean
  }) => Promise<void>
  onClose: () => void
  playerName: string
  onLockLoot: (name: string | null) => Promise<void>
}

export default function LootMode({ onSubmit, onClose, playerName, onLockLoot }: Props) {
  const party = useStore($partyData)
  const [gold, setGold] = useState<CoinValues>(emptyCoinValues())
  const [items, setItems] = useState<LootItem[]>([])
  const [magicItems, setMagicItems] = useState<LootMagicItem[]>([])
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [splitCoins, setSplitCoins] = useState(true)

  const hiddenDenoms: Denomination[] = []
  if (party && !party.showEp) hiddenDenoms.push('ep')
  if (party && !party.showPp) hiddenDenoms.push('pp')

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
      note: description || undefined,
      autoConvert: splitCoins,
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-space-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel() }}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-xl border border-bg-lighter bg-bg shadow-lg sm:rounded-[5px]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-bg-lighter px-space-4 py-space-3">
        <h2 className="m-0 text-lg font-bold text-text">Loot Mode</h2>
        <div className="flex items-center gap-space-3">
          <span className="text-xs text-text/40">
            {totalEntries} item{totalEntries !== 1 ? 's' : ''} added
          </span>
          <button onClick={handleCancel} className="text-sm text-text/50 hover:text-text">
            Cancel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-space-4 pb-space-14">
        {/* Description */}
        <section className="mb-space-6">
          <label className="mb-space-2 block text-xs font-semibold uppercase tracking-wider text-text/50">
            Loot Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dragon's hoard, Goblin camp chest..."
            className="w-full rounded-[5px] border border-bg-lighter bg-bg-light px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none focus:border-primary"
            style={{ fontSize: '16px' }}
          />
        </section>

        {/* Gold */}
        <section className="mb-space-6">
          <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
            Gold (auto-splits evenly)
          </h3>
          <CoinInput values={gold} onChange={setGold} hiddenDenoms={hiddenDenoms} compact />
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
      <div className="shrink-0 border-t border-bg-lighter bg-bg p-space-4">
        <label className="mb-space-3 flex items-center gap-space-2 text-xs text-text/60">
          <input
            type="checkbox"
            checked={splitCoins}
            onChange={(e) => setSplitCoins(e.target.checked)}
            className="accent-primary"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="20" x2="22" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /><polyline points="4 10 12 4 20 10" /><line x1="4" y1="10" x2="4" y2="14" /><line x1="20" y1="10" x2="20" y2="14" />
          </svg>
          Split coins (convert for even distribution)
        </label>
        <button
          type="button"
          onClick={handleDone}
          disabled={submitting || totalEntries === 0}
          className="w-full rounded-[5px] bg-primary px-space-4 py-space-3 font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
        >
          {submitting ? 'Distributing...' : `Distribute Loot (${totalEntries} entries)`}
        </button>
      </div>
      </div>
    </div>
  )
}
