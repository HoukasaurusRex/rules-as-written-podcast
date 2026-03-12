import { useState, useEffect, useCallback, useMemo } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode, $recentTransactions, type Transaction } from '../../stores/party'
import { isDebitTransaction } from '../../utils/currency'

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
  const recentTxs = useStore($recentTransactions)
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  const [showFullHistory, setShowFullHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const PAGE_SIZE = 10

  const loadTransactions = useCallback(async (offset = 0) => {
    setLoading(true)
    const rows = await onListTransactions(characterId, PAGE_SIZE, offset)
    if (offset === 0) {
      setApiTransactions(rows)
      $recentTransactions.set([])
    } else {
      setApiTransactions((prev) => [...prev, ...rows])
    }
    setHasMore(rows.length === PAGE_SIZE)
    setLoading(false)
  }, [characterId, onListTransactions, PAGE_SIZE])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Merge recent (optimistic) transactions with API results, deduplicate by ID
  const transactions = useMemo(() => {
    const apiIds = new Set(apiTransactions.map((t) => t.id))
    const newRecent = recentTxs.filter((t) => !apiIds.has(t.id))
    // Filter by characterId if viewing a specific character
    const filtered = characterId
      ? newRecent.filter((t) => t.characterId === characterId)
      : newRecent
    return [...filtered, ...apiTransactions]
  }, [apiTransactions, recentTxs, characterId])

  if (loading && transactions.length === 0) {
    return <div className="py-space-4 text-center text-xs text-text/30">Loading history...</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-[5px] border border-dashed border-bg-lighter py-space-4 text-center text-xs text-text/30">
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
          const isDebit = isDebitTransaction(tx.type)
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

      {!showFullHistory && transactions.length >= 10 && (
        <button
          type="button"
          onClick={async () => {
            setShowFullHistory(true)
            const rows = await onListTransactions(characterId, 100, 0)
            setAllTransactions(rows)
          }}
          className="mt-space-3 w-full rounded-[5px] border border-bg-lighter py-space-2 text-xs text-text/40 transition-colors hover:bg-bg-light"
        >
          Older transactions
        </button>
      )}

      {/* Full history modal */}
      {showFullHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-space-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFullHistory(false) }}
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-xl border border-bg-lighter bg-bg shadow-lg sm:rounded-[5px]">
            <div className="flex shrink-0 items-center justify-between border-b border-bg-lighter px-space-4 py-space-3">
              <h3 className="m-0 text-base font-bold text-text">Transaction History</h3>
              <button
                type="button"
                onClick={() => setShowFullHistory(false)}
                className="text-sm text-text/50 hover:text-text"
              >
                Close
              </button>
            </div>
            <div className="shrink-0 border-b border-bg-lighter px-space-4 py-space-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item, note, type..."
                className="w-full rounded-[5px] border border-bg-lighter bg-bg-light px-space-3 py-space-2 text-sm text-text placeholder-text/30 outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-space-4">
              <div className="space-y-space-1">
                {allTransactions
                  .filter((tx) => {
                    if (!searchQuery.trim()) return true
                    const q = searchQuery.toLowerCase()
                    return (
                      tx.itemName?.toLowerCase().includes(q) ||
                      tx.note?.toLowerCase().includes(q) ||
                      tx.type.toLowerCase().includes(q) ||
                      (tx.characterId && characterNames[tx.characterId]?.toLowerCase().includes(q))
                    )
                  })
                  .map((tx) => {
                    const isDebit = isDebitTransaction(tx.type)
                    const isUndo = tx.type === 'undo'
                    return (
                      <div
                        key={tx.id}
                        className={`flex items-center justify-between rounded-[5px] px-space-3 py-space-2 text-sm ${
                          tx.undone ? 'bg-bg-light/50 opacity-50' : 'bg-bg-light'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-space-2">
                            <span className={`font-medium ${isUndo ? 'text-text/50' : isDebit ? 'text-red-400' : 'text-green-400'}`}>
                              {isDebit ? '−' : '+'}{formatAmount(tx)}
                            </span>
                          </div>
                          <div className="mt-0.5 truncate text-xs text-text/40">
                            {TYPE_LABELS[tx.type] ?? tx.type}
                            {tx.itemName && ` · ${tx.itemName}`}
                            {tx.note && ` · ${tx.note}`}
                            {tx.characterId && characterNames[tx.characterId] && ` · ${characterNames[tx.characterId]}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-space-2">
                          <span className="text-[10px] text-text/30">{formatTime(tx.createdAt)}</span>
                          {editMode && !tx.undone && tx.type !== 'undo' && (
                            <button
                              type="button"
                              onClick={() => onUndo(tx.id)}
                              className="rounded px-space-2 py-space-1 text-[10px] text-text/30 hover:bg-bg-lighter hover:text-text/60"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
