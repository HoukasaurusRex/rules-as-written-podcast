import { useCallback } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode, $partyData, type PartyCharacter } from '../../stores/party'
import type { Denomination } from '../../utils/currency'
import CoinInput, { type CoinValues } from './CoinInput'

interface Props {
  character: PartyCharacter
  onUpdate: (characterId: string, updates: Record<string, unknown>) => void
}

export default function GoldTracker({ character, onUpdate }: Props) {
  const editMode = useStore($editMode)
  const party = useStore($partyData)

  const values: CoinValues = {
    pp: character.pp ?? 0,
    gp: character.gp ?? 0,
    ep: character.ep ?? 0,
    sp: character.sp ?? 0,
    cp: character.cp ?? 0,
  }

  const hiddenDenoms: Denomination[] = []
  if (party && !party.showEp) hiddenDenoms.push('ep')
  if (party && !party.showPp) hiddenDenoms.push('pp')

  const handleChange = useCallback(
    (newValues: CoinValues) => {
      const updates: Record<string, number> = {}
      for (const [k, v] of Object.entries(newValues)) {
        if (v !== values[k as Denomination]) {
          updates[k] = v
        }
      }
      if (Object.keys(updates).length > 0) {
        onUpdate(character.id, updates)
      }
    },
    [character.id, values, onUpdate],
  )

  return (
    <CoinInput
      values={values}
      onChange={editMode ? handleChange : undefined}
      readOnly={!editMode}
      hiddenDenoms={hiddenDenoms}
    />
  )
}
