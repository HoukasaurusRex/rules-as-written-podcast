import { useEffect, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode } from '../../../stores/party'
import { apiFetch } from './usePartyApi'

export function useEditMode(partyId: string | undefined) {
  const editMode = useStore($editMode)

  // Check localStorage on mount
  useEffect(() => {
    if (!partyId) return
    const stored = localStorage.getItem(`party-code-${partyId}`)
    if (stored) $editMode.set(true)
  }, [partyId])

  const validateCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!partyId) return false
      try {
        const result = await apiFetch(`/${partyId}/validate-code`, {
          method: 'POST',
          body: JSON.stringify({ code }),
        })
        if (result.valid) {
          localStorage.setItem(`party-code-${partyId}`, code)
          $editMode.set(true)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [partyId],
  )

  const clearEditMode = useCallback(() => {
    if (partyId) localStorage.removeItem(`party-code-${partyId}`)
    $editMode.set(false)
  }, [partyId])

  return { editMode, validateCode, clearEditMode }
}
