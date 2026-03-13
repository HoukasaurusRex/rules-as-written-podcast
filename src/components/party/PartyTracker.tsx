import { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useStore } from '@nanostores/react'
import { $activeTab, $editMode } from '../../stores/party'
import { DENOMINATIONS, totalGpValue } from '../../utils/currency'
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
  const [assigningLootItemId, setAssigningLootItemId] = useState<string | null>(null)

  // Initialize tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab) $activeTab.set(tab)
  }, [])

  if (!party) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-space-2">
        <DotLottieReact
          src="/animations/campfire.lottie"
          loop
          autoplay
          style={{ width: 96, height: 96 }}
        />
        <div className="text-xs text-text/30">Loading party...</div>
      </div>
    )
  }

  const activeCharacter = party.characters.find((c) => c.id === activeTab)
  const characterNames = Object.fromEntries(party.characters.map((c) => [c.id, c.name]))

  return (
    <div className="mx-auto max-w-2xl px-space-4 pb-20 pt-space-4">
      {/* Party name — centered, auto-scrolls if too long */}
      <div className="mb-space-4 overflow-hidden text-center">
        <h1
          className="m-0 whitespace-nowrap text-xl font-bold text-text"
          style={{ animation: party.name.length > 25 ? 'marquee-scroll 12s linear infinite' : 'none' }}
        >
          {party.name}
        </h1>
        <p className="m-0 text-xs text-text/40">
          {party.characters.length} character{party.characters.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Unlock editing (shown when not in edit mode) */}
      <PartyCodeGate partyId={partyId} />

      {/* Loot lock banner — reserved space, no layout shift */}
      <div className={`flex items-center justify-between rounded-[5px] px-space-4 py-space-2 text-xs transition-opacity ${
        party.lootActiveBy ? 'bg-gold-gp/10 text-gold-gp opacity-100' : 'pointer-events-none opacity-0'
      }`}>
        <span>{party.lootActiveBy ? `${party.lootActiveBy} is distributing loot...` : '\u00A0'}</span>
        {editMode && party.lootActiveBy && (
          <button
            type="button"
            onClick={() => api.updateParty({ lootActiveBy: null })}
            className="rounded px-space-2 py-space-1 text-gold-gp/70 transition-colors hover:text-gold-gp"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'party' ? (
        <div className="space-y-space-6">
          {/* Toolbar: Share + Settings gear + Loot */}
          <div className="flex items-center gap-space-2">
            <button
              type="button"
              onClick={async () => {
                const url = window.location.href
                const shareText = `Join ${party.name} on Rules as Written\nParty code: ${party.code}\n${url}`
                if (navigator.share) {
                  await navigator.share({ text: shareText })
                } else {
                  await navigator.clipboard.writeText(shareText)
                }
              }}
              className="flex items-center gap-space-2 rounded-[5px] border border-bg-lighter bg-bg px-space-3 py-space-2 text-xs text-text/60 transition-colors hover:bg-bg-light"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Invite to party
            </button>

            {/* Settings gear dropdown */}
            {editMode && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-center rounded-[5px] border border-bg-lighter bg-bg p-space-2 text-text/50 transition-colors hover:bg-bg-light hover:text-text/70"
                  aria-label="Party settings"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                {showSettings && (
                  <div className="absolute left-0 top-full z-20 mt-space-1 w-48 rounded-[5px] border border-bg-lighter bg-bg-light p-space-3 shadow-lg">
                    <div className="space-y-space-3">
                      <label className="flex items-center justify-between text-xs text-text/70">
                        Show Electrum (EP)
                        <input type="checkbox" checked={party.showEp ?? false} onChange={(e) => api.updateParty({ showEp: e.target.checked })} className="accent-primary" />
                      </label>
                      <label className="flex items-center justify-between text-xs text-text/70">
                        Show Platinum (PP)
                        <input type="checkbox" checked={party.showPp ?? false} onChange={(e) => api.updateParty({ showPp: e.target.checked })} className="accent-primary" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loot button — right-aligned */}
            {editMode && (
              <button
                type="button"
                onClick={() => !party.lootActiveBy && setShowLootMode(true)}
                disabled={!!party.lootActiveBy}
                className={`ml-auto flex items-center gap-space-1 rounded-[5px] border px-space-3 py-space-2 text-sm font-medium transition-colors ${
                  party.lootActiveBy
                    ? 'border-bg-lighter text-text/30 cursor-not-allowed'
                    : 'border-gold-gp/30 bg-gold-gp/10 text-gold-gp hover:bg-gold-gp/20'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="10" width="20" height="12" rx="2" /><path d="M2 10l2-6h16l2 6" /><line x1="12" y1="10" x2="12" y2="16" /><circle cx="12" cy="16" r="1" />
                </svg>
                Loot
              </button>
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

          {/* Unclaimed Loot (magic items first, then regular items) */}
          {(() => {
            const lootItems = party.inventoryItems.filter((i) => !i.characterId)
            const lootMagic = party.magicItems.filter((i) => !i.characterId)
            if (lootItems.length === 0 && lootMagic.length === 0) return null
            return (
              <section>
                <h2 className="m-0 mb-space-3 text-sm font-semibold uppercase tracking-wider text-text/50">
                  Unclaimed Loot
                </h2>
                {lootMagic.length > 0 && (
                  <div className="mb-space-2">
                    <MagicItemList
                      items={lootMagic}
                      characters={party.characters}
                      currentCharacterId={null}
                      onUpdate={api.upsertMagicItem}
                      onDelete={api.deleteMagicItem}
                      showHeading={false}
                    />
                  </div>
                )}
                {lootItems.length > 0 && (
                  <div className="space-y-space-1">
                    {lootItems.map((item) => (
                      <div key={item.id} className="rounded-[5px] bg-bg">
                        <div className="flex items-center justify-between px-space-3 py-space-2 text-sm">
                          <span className="text-text">{item.name}</span>
                          <div className="flex items-center gap-space-2">
                            <span className="text-text/40">×{item.quantity}</span>
                            {editMode && (
                              <>
                                {party.characters.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setAssigningLootItemId(assigningLootItemId === item.id ? null : item.id)}
                                    className="rounded px-space-2 py-space-1 text-[10px] text-text/40 hover:bg-bg-light hover:text-text/60"
                                  >
                                    Assign
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => api.deleteItem(item.id)}
                                  className="rounded px-space-2 py-space-1 text-[10px] text-error/50 hover:bg-error/10 hover:text-error"
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {assigningLootItemId === item.id && editMode && (
                          <div className="flex flex-wrap gap-space-1 border-t border-bg-lighter px-space-3 py-space-2">
                            {party.characters.map((c) => (
                              <button
                                type="button"
                                key={c.id}
                                onClick={() => {
                                  api.upsertItem({ id: item.id, characterId: c.id })
                                  setAssigningLootItemId(null)
                                }}
                                className="rounded px-space-2 py-space-1 text-xs bg-bg-light text-text/50 transition-colors hover:bg-bg-lighter"
                              >
                                {c.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                        {totalGpValue(char)} GP
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Party transaction history */}
          <TransactionHistory
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
              <h2 className="m-0 text-lg font-bold text-text">{activeCharacter.name}</h2>
              <p className="m-0 text-xs text-text/40">
                {activeCharacter.class && `${activeCharacter.class} · `}Level {activeCharacter.level}
              </p>
            </div>
            {editMode && (
              <button
                onClick={() => setShowTxModal(true)}
                className="rounded-[5px] bg-primary/20 px-space-3 py-space-2 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
              >
                Transaction
              </button>
            )}
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
            characterId={activeCharacter.id}
            characterNames={characterNames}
            onListTransactions={api.listTransactions}
            onUndo={api.undoTransaction}
          />

          {/* Remove character — at bottom of page */}
          {editMode && (
            <div className="pt-space-4 text-center">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${activeCharacter.name} from the party? This cannot be undone.`)) {
                    api.deleteCharacter(activeCharacter.id)
                    $activeTab.set('party')
                  }
                }}
                className="inline-block rounded-[5px] px-space-4 py-space-2 text-xs text-error/60 transition-colors hover:text-error"
              >
                Remove character from party
              </button>
            </div>
          )}
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
