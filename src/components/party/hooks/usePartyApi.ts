import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $partyData, $editMode, $recentTransactions, type PartyData } from '../../../stores/party'
import { randomErrorMessage } from '../../../utils/error-messages'

const POLL_INTERVAL = 5000
const DEBOUNCE_MS = 1500

export type ToastState = { message: string; variant: 'success' | 'error' } | null

class ApiError extends Error {
  status: number
  serverMessage: string

  constructor(status: number, serverMessage: string) {
    super(`API error: ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.serverMessage = serverMessage
  }
}

const getStoredCode = (partyId: string): string | null => {
  try {
    return localStorage.getItem(`party-code-${partyId}`)
  } catch {
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiFetch = async <T = any>(
  path: string,
  options: RequestInit = {},
  partyId?: string,
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (partyId) {
    const code = getStoredCode(partyId)
    if (code) headers['X-Party-Code'] = code
  }

  const res = await fetch(`/api/party${path}`, { ...options, headers })

  let data: T
  try {
    data = await res.json()
  } catch {
    throw new ApiError(res.status, `Server returned non-JSON response (${res.status})`)
  }

  if (!res.ok) {
    throw new ApiError(res.status, ((data as Record<string, unknown>).error as string) ?? 'Unknown error')
  }
  return data
}

const toastForError = (err: unknown): ToastState => {
  if (err instanceof ApiError) {
    if (err.status >= 400 && err.status < 500) {
      return { message: err.serverMessage, variant: 'error' }
    }
  }
  console.error('Party API error:', err)
  return { message: randomErrorMessage(), variant: 'error' }
}

export const usePartyApi = (partyId: string | undefined) => {
  const party = useStore($partyData)
  const editMode = useStore($editMode)
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const [toast, setToast] = useState<ToastState>(null)

  const clearToast = useCallback(() => setToast(null), [])

  // Per-character debounce state for batching rapid coin updates
  const pendingUpdatesRef = useRef<Map<string, {
    timer: ReturnType<typeof setTimeout>
    updates: Record<string, unknown>
    prevState: PartyData | null
  }>>(new Map())

  const fetchParty = useCallback(async () => {
    if (!partyId) return
    try {
      const data: PartyData = await apiFetch(`/${partyId}`)
      $partyData.set(data)
    } catch (err) {
      console.error('Failed to fetch party:', err)
    }
  }, [partyId])

  // Poll for updates
  useEffect(() => {
    if (!partyId) return

    fetchParty()

    const poll = () => {
      if (document.hasFocus() && pendingUpdatesRef.current.size === 0) fetchParty()
    }
    pollRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [partyId, fetchParty])

  // Factory for simple API actions: try/catch + toast + refetch
  const apiAction = <TArgs extends unknown[], TResult = unknown>(
    fn: (...args: TArgs) => Promise<TResult>,
    deps: unknown[] = [],
  ) =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(async (...args: TArgs): Promise<TResult | undefined> => {
      if (!partyId) return undefined
      try {
        const result = await fn(...args)
        await fetchParty()
        return result
      } catch (err) {
        setToast(toastForError(err))
        return undefined
      }
    }, [partyId, fetchParty, ...deps])

  const addCharacter = apiAction(
    async (name: string, charClass?: string, level?: number) =>
      apiFetch(
        `/${partyId}/characters`,
        { method: 'POST', body: JSON.stringify({ name, class: charClass, level }) },
        partyId,
      ),
  )

  const updateCharacter = useCallback(
    (characterId: string, updates: Record<string, unknown>) => {
      if (!partyId) return

      // Optimistic update immediately
      const currentState = $partyData.get()
      if (currentState) {
        $partyData.set({
          ...currentState,
          characters: currentState.characters.map((c) =>
            c.id === characterId ? { ...c, ...updates } : c,
          ),
        })
      }

      const pending = pendingUpdatesRef.current
      const existing = pending.get(characterId)

      if (existing) {
        clearTimeout(existing.timer)
        Object.assign(existing.updates, updates)
      }

      const entry = existing ?? {
        timer: undefined as unknown as ReturnType<typeof setTimeout>,
        updates: { ...updates },
        prevState: currentState,
      }

      entry.timer = setTimeout(async () => {
        pending.delete(characterId)
        try {
          await apiFetch(
            `/${partyId}/characters/${characterId}`,
            { method: 'PATCH', body: JSON.stringify(entry.updates) },
            partyId,
          )
        } catch (err) {
          if (entry.prevState) $partyData.set(entry.prevState)
          setToast(toastForError(err))
        }
      }, DEBOUNCE_MS)

      if (!existing) pending.set(characterId, entry)
    },
    [partyId],
  )

  const deleteCharacter = apiAction(
    async (characterId: string) => {
      await apiFetch(`/${partyId}/characters/${characterId}`, { method: 'DELETE' }, partyId)
    },
  )

  const addTransaction = apiAction(
    async (tx: Record<string, unknown>) => {
      const result = await apiFetch(
        `/${partyId}/transaction`,
        { method: 'POST', body: JSON.stringify(tx) },
        partyId,
      )
      if (result?.id) {
        $recentTransactions.set([result, ...$recentTransactions.get()])
      }
      return result
    },
  )

  const undoTransaction = apiAction(
    async (txId: string) => {
      const result = await apiFetch(
        `/${partyId}/transaction/${txId}/undo`,
        { method: 'POST' },
        partyId,
      )
      if (result?.id) {
        $recentTransactions.set([result, ...$recentTransactions.get()])
      }
      return result
    },
  )

  const listTransactions = useCallback(
    async (characterId?: string, limit = 20, offset = 0) => {
      if (!partyId) return []
      try {
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
        if (characterId) params.set('characterId', characterId)
        return await apiFetch(`/${partyId}/transactions?${params}`)
      } catch (err) {
        setToast(toastForError(err))
        return []
      }
    },
    [partyId],
  )

  const upsertItem = apiAction(
    async (item: Record<string, unknown>) =>
      apiFetch(`/${partyId}/item`, { method: 'POST', body: JSON.stringify(item) }, partyId),
  )

  const deleteItem = apiAction(
    async (itemId: string) => {
      await apiFetch(`/${partyId}/item/${itemId}`, { method: 'DELETE' }, partyId)
    },
  )

  const upsertMagicItem = apiAction(
    async (item: Record<string, unknown>) =>
      apiFetch(`/${partyId}/magic-item`, { method: 'POST', body: JSON.stringify(item) }, partyId),
  )

  const deleteMagicItem = apiAction(
    async (itemId: string) => {
      await apiFetch(`/${partyId}/magic-item/${itemId}`, { method: 'DELETE' }, partyId)
    },
  )

  const addLoot = apiAction(
    async (loot: { gold?: Record<string, number>; items?: unknown[]; magicItems?: unknown[]; note?: string; autoConvert?: boolean }) => {
      const result = await apiFetch(
        `/${partyId}/loot`,
        { method: 'POST', body: JSON.stringify(loot) },
        partyId,
      )
      if (result?.transactions && Array.isArray(result.transactions) && result.transactions.length) {
        $recentTransactions.set([...result.transactions, ...$recentTransactions.get()])
      }
      return result
    },
  )

  const updateParty = apiAction(
    async (updates: Record<string, unknown>) => {
      await apiFetch(`/${partyId}`, { method: 'PATCH', body: JSON.stringify(updates) }, partyId)
    },
  )

  return {
    party,
    editMode,
    toast,
    clearToast,
    fetchParty,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addTransaction,
    undoTransaction,
    listTransactions,
    upsertItem,
    deleteItem,
    upsertMagicItem,
    deleteMagicItem,
    addLoot,
    updateParty,
  }
}

export { apiFetch }
