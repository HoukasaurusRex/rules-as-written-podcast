import { useCallback, useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { $partyData, $editMode, type PartyData } from '../../../stores/party'

const POLL_INTERVAL = 5000

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

  if (!res.ok) throw new Error(data.error ?? `API error: ${res.status}`)
  return data
}

export function usePartyApi(partyId: string | undefined) {
  const party = useStore($partyData)
  const editMode = useStore($editMode)
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined)

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
      const character = await apiFetch(
        `/${partyId}/characters`,
        { method: 'POST', body: JSON.stringify({ name, class: charClass, level }) },
        partyId,
      )
      await fetchParty()
      return character
    },
    [partyId, fetchParty],
  )

  const updateCharacter = useCallback(
    async (characterId: string, updates: Record<string, unknown>) => {
      if (!partyId) return
      // Optimistic update
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
      } catch {
        if (prev) $partyData.set(prev)
      }
    },
    [partyId],
  )

  const deleteCharacter = useCallback(
    async (characterId: string) => {
      if (!partyId) return
      await apiFetch(
        `/${partyId}/characters/${characterId}`,
        { method: 'DELETE' },
        partyId,
      )
      await fetchParty()
    },
    [partyId, fetchParty],
  )

  const addTransaction = useCallback(
    async (tx: Record<string, unknown>) => {
      if (!partyId) return
      const result = await apiFetch(
        `/${partyId}/transaction`,
        { method: 'POST', body: JSON.stringify(tx) },
        partyId,
      )
      await fetchParty()
      return result
    },
    [partyId, fetchParty],
  )

  const undoTransaction = useCallback(
    async (txId: string) => {
      if (!partyId) return
      const result = await apiFetch(
        `/${partyId}/transaction/${txId}/undo`,
        { method: 'POST' },
        partyId,
      )
      await fetchParty()
      return result
    },
    [partyId, fetchParty],
  )

  const listTransactions = useCallback(
    async (characterId?: string, limit = 20, offset = 0) => {
      if (!partyId) return []
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
      if (characterId) params.set('characterId', characterId)
      return apiFetch(`/${partyId}/transactions?${params}`)
    },
    [partyId],
  )

  const upsertItem = useCallback(
    async (item: Record<string, unknown>) => {
      if (!partyId) return
      const result = await apiFetch(
        `/${partyId}/item`,
        { method: 'POST', body: JSON.stringify(item) },
        partyId,
      )
      await fetchParty()
      return result
    },
    [partyId, fetchParty],
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!partyId) return
      await apiFetch(`/${partyId}/item/${itemId}`, { method: 'DELETE' }, partyId)
      await fetchParty()
    },
    [partyId, fetchParty],
  )

  const upsertMagicItem = useCallback(
    async (item: Record<string, unknown>) => {
      if (!partyId) return
      const result = await apiFetch(
        `/${partyId}/magic-item`,
        { method: 'POST', body: JSON.stringify(item) },
        partyId,
      )
      await fetchParty()
      return result
    },
    [partyId, fetchParty],
  )

  const deleteMagicItem = useCallback(
    async (itemId: string) => {
      if (!partyId) return
      await apiFetch(`/${partyId}/magic-item/${itemId}`, { method: 'DELETE' }, partyId)
      await fetchParty()
    },
    [partyId, fetchParty],
  )

  const addLoot = useCallback(
    async (loot: { gold?: Record<string, number>; items?: unknown[]; magicItems?: unknown[] }) => {
      if (!partyId) return
      const result = await apiFetch(
        `/${partyId}/loot`,
        { method: 'POST', body: JSON.stringify(loot) },
        partyId,
      )
      await fetchParty()
      return result
    },
    [partyId, fetchParty],
  )

  const updateParty = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!partyId) return
      await apiFetch(
        `/${partyId}`,
        { method: 'PATCH', body: JSON.stringify(updates) },
        partyId,
      )
      await fetchParty()
    },
    [partyId, fetchParty],
  )

  return {
    party,
    editMode,
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
