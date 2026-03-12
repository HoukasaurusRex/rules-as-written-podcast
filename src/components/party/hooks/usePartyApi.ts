import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $partyData, $editMode, $recentTransactions, type PartyData } from '../../../stores/party'
import { randomErrorMessage } from '../../../utils/error-messages'

const POLL_INTERVAL = 5000

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

function getStoredCode(partyId: string): string | null {
  try {
    return localStorage.getItem(`party-code-${partyId}`)
  } catch {
    return null
  }
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  partyId?: string,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (partyId) {
    const code = getStoredCode(partyId)
    if (code) headers['X-Party-Code'] = code
  }

  const res = await fetch(`/api/party${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? 'Unknown error')
  }
  return data
}

function toastForError(err: unknown): ToastState {
  if (err instanceof ApiError) {
    // 4xx: pass server's specific message through to user
    if (err.status >= 400 && err.status < 500) {
      return { message: err.serverMessage, variant: 'error' }
    }
  }
  // 5xx / network / unknown: show D&D-themed message, log real error
  console.error('Party API error:', err)
  return { message: randomErrorMessage(), variant: 'error' }
}

export function usePartyApi(partyId: string | undefined) {
  const party = useStore($partyData)
  const editMode = useStore($editMode)
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const [toast, setToast] = useState<ToastState>(null)

  const clearToast = useCallback(() => setToast(null), [])

  const fetchParty = useCallback(async () => {
    if (!partyId) return
    try {
      const data: PartyData = await apiFetch(`/${partyId}`)
      $partyData.set(data)
    } catch (err) {
      // Don't toast on polling failures — just log
      console.error('Failed to fetch party:', err)
    }
  }, [partyId])

  // Poll for updates
  useEffect(() => {
    if (!partyId) return

    fetchParty()

    const poll = () => {
      if (document.hasFocus()) fetchParty()
    }
    pollRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [partyId, fetchParty])

  const addCharacter = useCallback(
    async (name: string, charClass?: string, level?: number) => {
      if (!partyId) return
      try {
        const character = await apiFetch(
          `/${partyId}/characters`,
          { method: 'POST', body: JSON.stringify({ name, class: charClass, level }) },
          partyId,
        )
        await fetchParty()
        return character
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const updateCharacter = useCallback(
    async (characterId: string, updates: Record<string, unknown>) => {
      if (!partyId) return
      const prev = $partyData.get()
      if (prev) {
        $partyData.set({
          ...prev,
          characters: prev.characters.map((c) =>
            c.id === characterId ? { ...c, ...updates } : c,
          ),
        })
      }
      try {
        await apiFetch(
          `/${partyId}/characters/${characterId}`,
          { method: 'PATCH', body: JSON.stringify(updates) },
          partyId,
        )
      } catch (err) {
        if (prev) $partyData.set(prev)
        setToast(toastForError(err))
      }
    },
    [partyId],
  )

  const deleteCharacter = useCallback(
    async (characterId: string) => {
      if (!partyId) return
      try {
        await apiFetch(
          `/${partyId}/characters/${characterId}`,
          { method: 'DELETE' },
          partyId,
        )
        await fetchParty()
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const addTransaction = useCallback(
    async (tx: Record<string, unknown>) => {
      if (!partyId) return
      try {
        const result = await apiFetch(
          `/${partyId}/transaction`,
          { method: 'POST', body: JSON.stringify(tx) },
          partyId,
        )
        // Inject into recent transactions for immediate UI update
        if (result?.id) {
          $recentTransactions.set([result, ...$recentTransactions.get()])
        }
        await fetchParty()
        return result
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const undoTransaction = useCallback(
    async (txId: string) => {
      if (!partyId) return
      try {
        const result = await apiFetch(
          `/${partyId}/transaction/${txId}/undo`,
          { method: 'POST' },
          partyId,
        )
        await fetchParty()
        return result
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
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

  const upsertItem = useCallback(
    async (item: Record<string, unknown>) => {
      if (!partyId) return
      try {
        const result = await apiFetch(
          `/${partyId}/item`,
          { method: 'POST', body: JSON.stringify(item) },
          partyId,
        )
        await fetchParty()
        return result
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!partyId) return
      try {
        await apiFetch(`/${partyId}/item/${itemId}`, { method: 'DELETE' }, partyId)
        await fetchParty()
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const upsertMagicItem = useCallback(
    async (item: Record<string, unknown>) => {
      if (!partyId) return
      try {
        const result = await apiFetch(
          `/${partyId}/magic-item`,
          { method: 'POST', body: JSON.stringify(item) },
          partyId,
        )
        await fetchParty()
        return result
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const deleteMagicItem = useCallback(
    async (itemId: string) => {
      if (!partyId) return
      try {
        await apiFetch(`/${partyId}/magic-item/${itemId}`, { method: 'DELETE' }, partyId)
        await fetchParty()
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const addLoot = useCallback(
    async (loot: { gold?: Record<string, number>; items?: unknown[]; magicItems?: unknown[] }) => {
      if (!partyId) return
      try {
        const result = await apiFetch(
          `/${partyId}/loot`,
          { method: 'POST', body: JSON.stringify(loot) },
          partyId,
        )
        await fetchParty()
        return result
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
  )

  const updateParty = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!partyId) return
      try {
        await apiFetch(
          `/${partyId}`,
          { method: 'PATCH', body: JSON.stringify(updates) },
          partyId,
        )
        await fetchParty()
      } catch (err) {
        setToast(toastForError(err))
      }
    },
    [partyId, fetchParty],
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
