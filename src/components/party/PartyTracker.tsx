import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $activeTab, $editMode } from '../../stores/party'
import { usePartyApi } from './hooks/usePartyApi'
import PartyCodeGate from './PartyCodeGate'
import CharacterTabs from './CharacterTabs'
import CharacterForm from './CharacterForm'
import GoldTracker from './GoldTracker'

interface Props {
  partyId: string
}

export default function PartyTracker({ partyId }: Props) {
  const {
    party,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  } = usePartyApi(partyId)
  const activeTab = useStore($activeTab)
  const editMode = useStore($editMode)
  const [showCharForm, setShowCharForm] = useState(false)

  if (!party) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text/40">Loading party...</div>
      </div>
    )
  }

  const activeCharacter = party.characters.find((c) => c.id === activeTab)
  const lootPoolItems = party.inventoryItems.filter((i) => !i.characterId)
  const lootPoolMagic = party.magicItems.filter((i) => !i.characterId)

  return (
    <div className="mx-auto max-w-2xl px-space-4 pb-[180px] pt-space-4">
      {/* Header */}
      <div className="mb-space-6 flex items-center justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-text">{party.name}</h1>
          <p className="m-0 text-xs text-text/40">
            {party.characters.length} character{party.characters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <PartyCodeGate partyId={partyId} />
      </div>

      {/* Loot lock banner */}
      {party.lootActiveBy && (
        <div className="mb-space-4 rounded-[5px] border border-gold-gp/30 bg-gold-gp/10 px-space-4 py-space-3 text-center text-sm text-gold-gp">
          {party.lootActiveBy} is distributing loot...
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'party' ? (
        <div className="space-y-space-6">
          {/* Party aggregate gold */}
          {party.characters.length > 0 && (
            <section>
              <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
                Party Wealth
              </h2>
              <div className="grid grid-cols-5 gap-space-2">
                {(['pp', 'gp', 'ep', 'sp', 'cp'] as const).map((denom) => {
                  const total = party.characters.reduce((sum, c) => sum + (c[denom] ?? 0), 0)
                  const colorMap = { pp: 'text-gold-pp', gp: 'text-gold-gp', ep: 'text-gold-ep', sp: 'text-gold-sp', cp: 'text-gold-cp' }
                  return (
                    <div key={denom} className="flex flex-col items-center rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg p-space-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${colorMap[denom]}`}>
                        {denom.toUpperCase()}
                      </span>
                      <span className="text-xl font-bold tabular-nums text-text">
                        {total}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Loot Pool */}
          {(lootPoolItems.length > 0 || lootPoolMagic.length > 0) && (
            <section>
              <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
                Loot Pool
              </h2>
              {lootPoolItems.length > 0 && (
                <div className="mb-space-3 space-y-space-1">
                  {lootPoolItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[5px] bg-bg px-space-3 py-space-2 text-sm">
                      <span className="text-text">{item.name}</span>
                      <span className="text-text/40">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              {lootPoolMagic.length > 0 && (
                <div className="space-y-space-1">
                  {lootPoolMagic.map((item) => {
                    const rarityColors: Record<string, string> = {
                      Common: 'text-rarity-common',
                      Uncommon: 'text-rarity-uncommon',
                      Rare: 'text-rarity-rare',
                      'Very Rare': 'text-rarity-very-rare',
                      Legendary: 'text-rarity-legendary',
                      Artifact: 'text-rarity-artifact',
                    }
                    return (
                      <div key={item.id} className="flex items-center justify-between rounded-[5px] bg-bg px-space-3 py-space-2 text-sm">
                        <span className={rarityColors[item.rarity ?? ''] ?? 'text-text'}>{item.name}</span>
                        <span className="text-xs text-text/40">{item.rarity}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Character list */}
          <section>
            <div className="mb-space-3 flex items-center justify-between">
              <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
                Characters
              </h2>
              {editMode && (
                <button
                  onClick={() => setShowCharForm(true)}
                  className="rounded-[5px] bg-primary/20 px-space-3 py-space-1 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
                >
                  + Add Character
                </button>
              )}
            </div>

            {party.characters.length === 0 ? (
              <div className="rounded-[5px] border border-dashed border-[color:var(--color-bg-lighten-20)] py-space-8 text-center text-sm text-text/30">
                {editMode ? 'Add your first character to get started' : 'No characters yet'}
              </div>
            ) : (
              <div className="space-y-space-2">
                {party.characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => $activeTab.set(char.id)}
                    className="flex w-full items-center justify-between rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-left transition-colors hover:bg-bg-light"
                  >
                    <div>
                      <div className="font-medium text-text">{char.name}</div>
                      <div className="text-xs text-text/40">
                        {char.class && `${char.class} `}Lv.{char.level}
                      </div>
                    </div>
                    <div className="text-right text-sm tabular-nums text-gold-gp">
                      {char.gp ?? 0} GP
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : activeCharacter ? (
        <div className="space-y-space-6">
          {/* Character header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="m-0 text-xl font-bold text-text">{activeCharacter.name}</h2>
              <p className="m-0 text-xs text-text/40">
                {activeCharacter.class && `${activeCharacter.class} · `}Level {activeCharacter.level}
              </p>
            </div>
            {editMode && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${activeCharacter.name}?`)) {
                    deleteCharacter(activeCharacter.id)
                    $activeTab.set('party')
                  }
                }}
                className="rounded-[5px] px-space-3 py-space-2 text-xs text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </div>

          {/* Gold */}
          <section>
            <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
              Currency
            </h3>
            <GoldTracker
              character={activeCharacter}
              onUpdate={updateCharacter}
            />
          </section>

          {/* Character inventory */}
          <section>
            <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
              Inventory
            </h3>
            {party.inventoryItems.filter((i) => i.characterId === activeCharacter.id).length === 0 ? (
              <div className="rounded-[5px] border border-dashed border-[color:var(--color-bg-lighten-20)] py-space-4 text-center text-xs text-text/30">
                No items yet
              </div>
            ) : (
              <div className="space-y-space-1">
                {party.inventoryItems
                  .filter((i) => i.characterId === activeCharacter.id)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[5px] bg-bg px-space-3 py-space-2 text-sm">
                      <span className="text-text">{item.name}</span>
                      <span className="text-text/40">×{item.quantity}</span>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* Character magic items */}
          <section>
            <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
              Magic Items
              <span className="ml-space-2 text-xs font-normal text-text/30">
                ({party.magicItems.filter((i) => i.characterId === activeCharacter.id && i.attuned).length}/3 attuned)
              </span>
            </h3>
            {party.magicItems.filter((i) => i.characterId === activeCharacter.id).length === 0 ? (
              <div className="rounded-[5px] border border-dashed border-[color:var(--color-bg-lighten-20)] py-space-4 text-center text-xs text-text/30">
                No magic items
              </div>
            ) : (
              <div className="space-y-space-1">
                {party.magicItems
                  .filter((i) => i.characterId === activeCharacter.id)
                  .map((item) => {
                    const rarityColors: Record<string, string> = {
                      Common: 'text-rarity-common',
                      Uncommon: 'text-rarity-uncommon',
                      Rare: 'text-rarity-rare',
                      'Very Rare': 'text-rarity-very-rare',
                      Legendary: 'text-rarity-legendary',
                      Artifact: 'text-rarity-artifact',
                    }
                    return (
                      <div key={item.id} className="flex items-center justify-between rounded-[5px] bg-bg px-space-3 py-space-2 text-sm">
                        <div className="flex items-center gap-space-2">
                          <span className={rarityColors[item.rarity ?? ''] ?? 'text-text'}>{item.name}</span>
                          {item.attuned && (
                            <span className="rounded-full bg-primary/20 px-space-2 py-0.5 text-[10px] font-semibold uppercase text-primary-muted">
                              Attuned
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-text/40">{item.rarity}</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* Character tabs */}
      <CharacterTabs characters={party.characters} />

      {/* Add character modal */}
      {showCharForm && (
        <CharacterForm
          onSubmit={async (name, charClass, level) => {
            await addCharacter(name, charClass, level)
            setShowCharForm(false)
          }}
          onClose={() => setShowCharForm(false)}
        />
      )}
    </div>
  )
}
