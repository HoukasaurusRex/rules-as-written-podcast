import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $partyData } from '../../stores/party'
import type { PartyCharacter, PartyInventoryItem } from '../../stores/party'
import type { Denomination } from '../../utils/currency'
import CoinInput, { emptyCoinValues, type CoinValues } from './CoinInput'
import ItemAutocomplete from './ItemAutocomplete'

type TxType = 'buy' | 'sell'

interface Props {
  character: PartyCharacter
  onSubmit: (tx: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export default function TransactionModal({ character, onSubmit, onClose }: Props) {
  const party = useStore($partyData)
  const [txType, setTxType] = useState<TxType>('buy')
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [coins, setCoins] = useState<CoinValues>(emptyCoinValues())
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hiddenDenoms: Denomination[] = []
  if (party && !party.showEp) hiddenDenoms.push('ep')
  if (party && !party.showPp) hiddenDenoms.push('pp')

  // For sell mode: show only inventory items as suggestions
  const inventoryItems: PartyInventoryItem[] = party
    ? party.inventoryItems.filter((i) => i.characterId === character.id)
    : []
  const sellSuggestions = inventoryItems.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    id: i.id,
  }))

  const hasCoins = Object.values(coins).some((v) => v > 0)

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    if (submitting || !hasCoins) return

    setSubmitting(true)

    // Multiply coins by quantity for total cost
    const totalCoins: Record<string, number> = {}
    for (const [k, v] of Object.entries(coins)) {
      if (v > 0) totalCoins[k] = v * quantity
    }

    await onSubmit({
      characterId: character.id,
      type: txType,
      ...totalCoins,
      itemName: itemName || undefined,
      note: note || (quantity > 1 ? `×${quantity}` : undefined),
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center sm:p-space-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-t-xl border border-bg-lighter bg-bg-light p-space-6 shadow-lg sm:rounded-[5px]">
        <h3 className="m-0 mb-space-4 text-lg font-bold text-text">Transaction</h3>

        {/* Buy/Sell toggle */}
        <div className="mb-space-4 flex rounded-[5px] border border-bg-lighter bg-bg p-space-1">
          {(['buy', 'sell'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTxType(t)
                setItemName('')
                setCoins(emptyCoinValues())
              }}
              className={`flex-1 rounded-[3px] py-space-2 text-sm font-medium capitalize transition-colors ${
                txType === t ? 'bg-primary text-white' : 'text-text/50 hover:text-text/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-space-4">
          {/* Item search */}
          <div>
            <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              Item
            </label>
            <ItemAutocomplete
              type="equipment"
              value={itemName}
              onChange={setItemName}
              clearOnSelect={false}
              placeholder={txType === 'sell' ? 'Search inventory...' : 'Search items or type custom...'}
              customItems={txType === 'sell' ? sellSuggestions : undefined}
              onSelect={(item) => {
                setItemName(item.name)
                if ('cost' in item && item.cost) {
                  const newCoins = emptyCoinValues()
                  const unit = item.cost.unit as Denomination
                  if (unit in newCoins) newCoins[unit] = item.cost.quantity
                  setCoins(newCoins)
                }
              }}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              Quantity
            </label>
            <div className="flex items-center gap-space-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-[5px] bg-bg text-lg text-text/50 hover:bg-bg-lighter"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputMode="numeric"
                className="w-16 rounded-[5px] border border-bg-lighter bg-bg px-space-2 py-space-2 text-center text-base tabular-nums text-text outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-[5px] bg-bg text-lg text-text/50 hover:bg-bg-lighter"
              >
                +
              </button>
              {quantity > 1 && (
                <span className="text-xs text-text/40">
                  Total: ×{quantity}
                </span>
              )}
            </div>
          </div>

          {/* Coins (per unit) */}
          <div>
            <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              {quantity > 1 ? 'Price per unit' : 'Amount'}
            </label>
            <CoinInput
              values={coins}
              onChange={setCoins}
              hiddenDenoms={hiddenDenoms}
              compact
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. From the merchant in Waterdeep"
              className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none focus:border-primary"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex gap-space-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-sm text-text/60 transition-colors hover:bg-bg-light"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !hasCoins}
              className="flex-1 rounded-[5px] bg-primary px-space-4 py-space-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {submitting ? 'Processing...' : txType === 'buy' ? 'Buy' : 'Sell'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
