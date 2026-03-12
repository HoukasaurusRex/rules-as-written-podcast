import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode } from '../../stores/party'

interface Transaction {
  id: string
  partyId: string
  characterId: string | null
  type: string
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
  itemName: string | null
  note: string | null
  undone: boolean
  undoesId: string | null
  createdAt: string
}

interface Props {
  partyId: string
  characterId?: string
  characterNames: Record<string, string>
  onListTransactions: (characterId?: string, limit?: number, offset?: number) => Promise<Transaction[]>
  onUndo: (txId: string) => Promise<void>
}

const TYPE_LABELS: Record<string, string> = {
  add: 'Added',
  spend: 'Spent',
  buy: 'Bought',
  sell: 'Sold',
  split: 'Split',
  loot: 'Loot',
  undo: 'Undo',
}

function formatAmount(tx: Transaction): string {
  const parts: string[] = []
  if (tx.pp) parts.push(`${Math.abs(tx.pp)} PP`)
  if (tx.gp) parts.push(`${Math.abs(tx.gp)} GP`)
  if (tx.ep) parts.push(`${Math.abs(tx.ep)} EP`)
  if (tx.sp) parts.push(`${Math.abs(tx.sp)} SP`)
  if (tx.cp) parts.push(`${Math.abs(tx.cp)} CP`)
  return parts.join(', ') || '0'
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function TransactionHistory({
  partyId,
  characterId,
  characterNames,
  onListTransactions,
  onUndo,
}: Props) {
  const editMode = useStore($editMode)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  const loadTransactions = useCallback(async (offset = 0) => {
    setLoading(true)
    const rows = await onListTransactions(characterId, 20, offset)
    if (offset === 0) {
      setTransactions(rows)
    } else {
      setTransactions((prev) => [...prev, ...rows])
    }
    setHasMore(rows.length === 20)
    setLoading(false)
  }, [characterId, onListTransactions])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  if (loading && transactions.length === 0) {
    return <div className="py-space-4 text-center text-xs text-text/30">Loading history...</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-[5px] border border-dashed border-[color:var(--color-bg-lighten-20)] py-space-4 text-center text-xs text-text/30">
        No transactions yet
      </div>
    )
  }

  return (
    <section>
      <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
        Transaction History
      </h3>
      <div className="space-y-space-1">
        {transactions.map((tx) => {
          const isDebit = ['spend', 'buy'].includes(tx.type)
          const isUndo = tx.type === 'undo'

          return (
            <div
              key={tx.id}
              className={`flex items-center justify-between rounded-[5px] px-space-3 py-space-2 text-sm ${
                tx.undone ? 'bg-bg/50 opacity-50' : 'bg-bg'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-space-2">
                  <span className={`font-medium ${isUndo ? 'text-text/50' : isDebit ? 'text-red-400' : 'text-green-400'}`}>
                    {isDebit ? '−' : '+'}{formatAmount(tx)}
                  </span>
                  {tx.undone && (
                    <span className="text-[10px] text-text/30 line-through">undone</span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-xs text-text/40">
                  {TYPE_LABELS[tx.type] ?? tx.type}
                  {tx.itemName && ` · ${tx.itemName}`}
                  {tx.note && ` · ${tx.note}`}
                  {tx.characterId && !characterId && characterNames[tx.characterId] && (
                    <> · {characterNames[tx.characterId]}</>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-space-2">
                <span className="text-[10px] text-text/30">{formatTime(tx.createdAt)}</span>
                {editMode && !tx.undone && tx.type !== 'undo' && (
                  <button
                    onClick={() => onUndo(tx.id)}
                    className="rounded px-space-2 py-space-1 text-[10px] text-text/30 transition-colors hover:bg-bg-light hover:text-text/60"
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => loadTransactions(transactions.length)}
          disabled={loading}
          className="mt-space-3 w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] py-space-2 text-xs text-text/40 transition-colors hover:bg-bg-light"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </section>
  )
}
