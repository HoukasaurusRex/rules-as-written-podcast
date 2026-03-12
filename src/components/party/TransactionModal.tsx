import { useState } from 'react'
import ItemAutocomplete from './ItemAutocomplete'
import type { PartyCharacter } from '../../stores/party'

type TxType = 'buy' | 'sell'
type Denom = 'cp' | 'sp' | 'ep' | 'gp' | 'pp'

interface Props {
  character: PartyCharacter
  onSubmit: (tx: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export default function TransactionModal({ character, onSubmit, onClose }: Props) {
  const [txType, setTxType] = useState<TxType>('buy')
  const [itemName, setItemName] = useState('')
  const [amount, setAmount] = useState(0)
  const [denom, setDenom] = useState<Denom>('gp')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || amount <= 0) return

    setSubmitting(true)
    await onSubmit({
      characterId: character.id,
      type: txType,
      [denom]: amount,
      itemName: itemName || undefined,
      note: note || undefined,
    })
    setSubmitting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-space-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-t-xl border border-[color:var(--color-bg-lighten-20)] bg-bg-light p-space-6 shadow-lg sm:rounded-[5px]">
        <h3 className="m-0 mb-space-4 text-lg font-bold text-text">Transaction</h3>

        {/* Buy/Sell toggle */}
        <div className="mb-space-4 flex rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg p-space-1">
          {(['buy', 'sell'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTxType(t)}
              className={`flex-1 rounded-[3px] py-space-2 text-sm font-medium capitalize transition-colors ${
                txType === t
                  ? 'bg-primary text-white'
                  : 'text-text/50 hover:text-text/70'
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
              placeholder="Search SRD items or type custom..."
              onSelect={(item) => {
                setItemName(item.name)
                if ('cost' in item && item.cost) {
                  setAmount(item.cost.quantity)
                  setDenom(item.cost.unit as Denom)
                }
              }}
            />
          </div>

          {/* Amount + denomination */}
          <div className="flex gap-space-3">
            <div className="flex-1">
              <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
                Amount
              </label>
              <input
                type="number"
                min={0}
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                inputMode="numeric"
                className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-base text-text outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="w-24">
              <label className="mb-space-1 block text-xs uppercase tracking-wider text-text/50">
                Coin
              </label>
              <select
                value={denom}
                onChange={(e) => setDenom(e.target.value as Denom)}
                className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-3 py-space-3 text-base text-text outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              >
                {(['gp', 'sp', 'cp', 'ep', 'pp'] as const).map((d) => (
                  <option key={d} value={d}>{d.toUpperCase()}</option>
                ))}
              </select>
            </div>
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
              className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none focus:border-primary"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex gap-space-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-sm text-text/60 transition-colors hover:bg-bg-light"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amount <= 0}
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
