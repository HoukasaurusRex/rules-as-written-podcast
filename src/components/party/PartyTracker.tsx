import { useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $activeTab, $editMode } from '../../stores/party'
import { DENOMINATIONS, DENOM_COLORS } from '../../utils/currency'
import { usePartyApi } from './hooks/usePartyApi'
import { Toast } from '../Toast'
import CoinInput from './CoinInput'
import PartyCodeGate from './PartyCodeGate'
import CharacterTabs from './CharacterTabs'
import CharacterForm from './CharacterForm'
import GoldTracker from './GoldTracker'
import InventoryList from './InventoryList'
import MagicItemList from './MagicItemList'
import TransactionModal from './TransactionModal'
import TransactionHistory from './TransactionHistory'
import LootMode from './LootMode'
import type { Denomination } from '../../utils/currency'
import type { CoinValues } from './CoinInput'

interface Props {
  partyId: string
}

export default function PartyTracker({ partyId }: Props) {
  const api = usePartyApi(partyId)
  const { party } = api
  const activeTab = useStore($activeTab)
  const editMode = useStore($editMode)
  const [showCharForm, setShowCharForm] = useState(false)
  const [showTxModal, setShowTxModal] = useState(false)
  const [showLootMode, setShowLootMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Initialize tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab) $activeTab.set(tab)
  }, [])

  if (!party) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-text/40">Loading party...</div>
      </div>
    )
  }

  const activeCharacter = party.characters.find((c) => c.id === activeTab)
  const characterNames = Object.fromEntries(party.characters.map((c) => [c.id, c.name]))

  return (
    <div className="mx-auto max-w-2xl px-space-4 pb-[180px] pt-space-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-text">{party.name}</h1>
          <p className="m-0 text-xs text-text/40">
            {party.characters.length} character{party.characters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-space-2">
          {editMode && !party.lootActiveBy && (
            <button
              onClick={() => setShowLootMode(true)}
              className="flex items-center gap-space-1 rounded-[5px] border border-gold-gp/30 bg-gold-gp/10 px-space-3 py-space-2 text-sm font-medium text-gold-gp transition-colors hover:bg-gold-gp/20"
            >
              Loot
            </button>
          )}
          <PartyCodeGate partyId={partyId} />
        </div>
      </div>

      {/* Loot lock banner */}
      {party.lootActiveBy && (
        <div className="flex items-center justify-between rounded-[5px] border border-gold-gp/30 bg-gold-gp/10 px-space-4 py-space-3 text-sm text-gold-gp">
          <span>{party.lootActiveBy} is distributing loot...</span>
          {editMode && (
            <button
              type="button"
              onClick={() => api.updateParty({ lootActiveBy: null })}
              className="rounded px-space-2 py-space-1 text-xs text-gold-gp/70 transition-colors hover:bg-gold-gp/20 hover:text-gold-gp"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'party' ? (
        <div className="space-y-space-6">
          {/* Share + Settings row */}
          <div className="flex flex-wrap items-center gap-space-2">
            <button
              type="button"
              onClick={async () => {
                const url = window.location.href
                const text = `Join ${party.name} on Rules as Written`
                if (navigator.share) {
                  await navigator.share({ title: party.name, text, url })
                } else {
                  await navigator.clipboard.writeText(url)
                  api.clearToast()
                  // Brief visual feedback handled by toast
                }
              }}
              className="flex items-center gap-space-2 rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-xs text-text/60 transition-colors hover:bg-bg-light"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>

            {editMode && (
              <>
                <label className="flex items-center gap-space-2 rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-xs text-text/60">
                  <input type="checkbox" checked={party.showEp ?? false} onChange={(e) => api.updateParty({ showEp: e.target.checked })} className="accent-primary" />
                  EP
                </label>
                <label className="flex items-center gap-space-2 rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-xs text-text/60">
                  <input type="checkbox" checked={party.showPp ?? false} onChange={(e) => api.updateParty({ showPp: e.target.checked })} className="accent-primary" />
                  PP
                </label>
              </>
            )}
          </div>

          {/* Party aggregate gold */}
          {party.characters.length > 0 && (() => {
            const totals: CoinValues = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
            for (const c of party.characters) {
              for (const d of DENOMINATIONS) totals[d] += c[d] ?? 0
            }
            const hidden: Denomination[] = []
            if (!party.showEp) hidden.push('ep')
            if (!party.showPp) hidden.push('pp')
            return (
              <section>
                <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
                  Party Wealth
                </h2>
                <CoinInput values={totals} readOnly hiddenDenoms={hidden} />
              </section>
            )
          })()}

          {/* Unclaimed Loot (combined inventory + magic items) */}
          {(() => {
            const lootItems = party.inventoryItems.filter((i) => !i.characterId)
            const lootMagic = party.magicItems.filter((i) => !i.characterId)
            if (lootItems.length === 0 && lootMagic.length === 0) return null
            return (
              <section>
                <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
                  Unclaimed Loot
                </h2>
                {lootItems.length > 0 && (
                  <div className="mb-space-2 space-y-space-1">
                    {lootItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-[5px] bg-bg px-space-3 py-space-2 text-sm">
                        <span className="text-text">{item.name}</span>
                        <span className="text-text/40">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
                {lootMagic.length > 0 && (
                  <MagicItemList
                    items={lootMagic}
                    characters={party.characters}
                    currentCharacterId={null}
                    onAdd={api.upsertMagicItem}
                    onUpdate={api.upsertMagicItem}
                    onDelete={api.deleteMagicItem}
                  />
                )}
              </section>
            )
          })()}

          {/* Character list */}
          <section>
            <div className="mb-space-3 flex items-center justify-between">
              <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
                Characters
              </h2>
              {editMode && (
                <button
                  type="button"
                  onClick={() => setShowCharForm(true)}
                  className="rounded-[5px] bg-primary/20 px-space-3 py-space-1 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
                >
                  + Add Character
                </button>
              )}
            </div>

            {party.characters.length === 0 ? (
              <div className="rounded-[5px] border border-dashed border-bg-lighter py-space-8 text-center text-sm text-text/30">
                {editMode ? 'Add your first character to get started' : 'No characters yet'}
              </div>
            ) : (
              <div className="space-y-space-2">
                {party.characters.map((char) => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('tab', char.id)
                  return (
                    <button
                      key={char.id}
                      onClick={() => {
                        $activeTab.set(char.id)
                        history.replaceState(null, '', url.toString())
                      }}
                      className="flex w-full items-center justify-between rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-left transition-colors hover:bg-bg-light"
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
                  )
                })}
              </div>
            )}
          </section>

          {/* Party transaction history */}
          <TransactionHistory
            partyId={partyId}
            characterNames={characterNames}
            onListTransactions={api.listTransactions}
            onUndo={api.undoTransaction}
          />
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
            <div className="flex items-center gap-space-2">
              {editMode && (
                <>
                  <button
                    onClick={() => setShowTxModal(true)}
                    className="rounded-[5px] bg-primary/20 px-space-3 py-space-2 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
                  >
                    Transaction
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${activeCharacter.name}?`)) {
                        api.deleteCharacter(activeCharacter.id)
                        $activeTab.set('party')
                      }
                    }}
                    className="rounded-[5px] px-space-2 py-space-2 text-xs text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Gold */}
          <section>
            <h3 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
              Currency
            </h3>
            <GoldTracker character={activeCharacter} onUpdate={api.updateCharacter} />
          </section>

          {/* Inventory */}
          <InventoryList
            items={party.inventoryItems.filter((i) => i.characterId === activeCharacter.id)}
            characterId={activeCharacter.id}
            onAdd={api.upsertItem}
            onUpdate={api.upsertItem}
            onDelete={api.deleteItem}
          />

          {/* Magic Items */}
          <MagicItemList
            items={party.magicItems.filter((i) => i.characterId === activeCharacter.id)}
            characters={party.characters}
            currentCharacterId={activeCharacter.id}
            onAdd={api.upsertMagicItem}
            onUpdate={api.upsertMagicItem}
            onDelete={api.deleteMagicItem}
          />

          {/* Character transaction history */}
          <TransactionHistory
            partyId={partyId}
            characterId={activeCharacter.id}
            characterNames={characterNames}
            onListTransactions={api.listTransactions}
            onUndo={api.undoTransaction}
          />
        </div>
      ) : null}

      {/* Character tabs */}
      <CharacterTabs characters={party.characters} />

      {/* Modals */}
      {showCharForm && (
        <CharacterForm
          onSubmit={async (name, charClass, level) => {
            await api.addCharacter(name, charClass, level)
            setShowCharForm(false)
          }}
          onClose={() => setShowCharForm(false)}
        />
      )}

      {showTxModal && activeCharacter && (
        <TransactionModal
          character={activeCharacter}
          onSubmit={api.addTransaction}
          onClose={() => setShowTxModal(false)}
        />
      )}

      {showLootMode && (
        <LootMode
          onSubmit={api.addLoot}
          onClose={() => setShowLootMode(false)}
          playerName="Player"
          onLockLoot={async (name) => api.updateParty({ lootActiveBy: name })}
        />
      )}

      {api.toast && (
        <Toast
          message={api.toast.message}
          variant={api.toast.variant}
          onClose={api.clearToast}
        />
      )}
    </div>
  )
}
