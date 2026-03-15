import { useStore } from '@nanostores/react'
import { $activeTab, type PartyCharacter } from '../../stores/party'

interface Props {
  characters: PartyCharacter[]
}

function setTab(tabId: string) {
  $activeTab.set(tabId)
  const url = new URL(window.location.href)
  url.searchParams.set('tab', tabId)
  history.replaceState(null, '', url.toString())
}

export default function CharacterTabs({ characters }: Props) {
  const activeTab = useStore($activeTab)

  const allTabIds = ['party', ...characters.map((c) => c.id)]

  function handleKeyDown(e: React.KeyboardEvent) {
    const currentIndex = allTabIds.indexOf(activeTab)
    if (currentIndex === -1) return

    let nextIndex: number | null = null
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % allTabIds.length
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + allTabIds.length) % allTabIds.length
    else if (e.key === 'Home') nextIndex = 0
    else if (e.key === 'End') nextIndex = allTabIds.length - 1

    if (nextIndex !== null) {
      e.preventDefault()
      setTab(allTabIds[nextIndex])
      const tablist = (e.currentTarget as HTMLElement)
      const buttons = tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      buttons[nextIndex]?.focus()
    }
  }

  return (
    <div
      className="character-tabs fixed bottom-0 left-0 right-0 z-10 border-t border-bg-lighter bg-bg transition-[bottom] duration-200"
      style={{ bottom: 'var(--character-tabs-bottom, 0px)' }}
    >
      <nav className="flex justify-center overflow-x-auto scrollbar-none" role="tablist" onKeyDown={handleKeyDown}>
        <button
          role="tab"
          aria-selected={activeTab === 'party'}
          tabIndex={activeTab === 'party' ? 0 : -1}
          onClick={() => setTab('party')}
          className={`flex min-h-17 min-w-[72px] shrink-0 flex-col items-center gap-space-1 px-space-3 py-space-3 text-xs font-medium transition-colors ${
            activeTab === 'party'
              ? 'border-t-2 border-primary text-primary'
              : 'text-text/50 hover:text-text/70'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Party
        </button>

        {characters.map((char) => (
          <button
            key={char.id}
            role="tab"
            aria-selected={activeTab === char.id}
            aria-label={char.name}
            tabIndex={activeTab === char.id ? 0 : -1}
            onClick={() => setTab(char.id)}
            className={`flex min-w-[72px] shrink-0 flex-col items-center gap-space-1 px-space-3 py-space-3 text-xs font-medium transition-colors ${
              activeTab === char.id
                ? 'border-t-2 border-primary text-primary'
                : 'text-text/50 hover:text-text/70'
            }`}
          >
            <span className="text-base">
              {char.name.charAt(0).toUpperCase()}
            </span>
            <span className="inline-block max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap">
              {char.name}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
