import { useStore } from '@nanostores/react'
import { $activeTab, type PartyCharacter } from '../../stores/party'

interface Props {
  characters: PartyCharacter[]
}

export default function CharacterTabs({ characters }: Props) {
  const activeTab = useStore($activeTab)

  return (
    <div className="fixed bottom-[70px] left-0 right-0 z-10 border-t border-[color:var(--color-bg-lighten-20)] bg-bg">
      <nav className="flex overflow-x-auto" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'party'}
          onClick={() => $activeTab.set('party')}
          className={`flex min-w-[80px] shrink-0 flex-col items-center gap-space-1 px-space-4 py-space-3 text-xs font-medium transition-colors ${
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
            onClick={() => $activeTab.set(char.id)}
            className={`flex min-w-[80px] shrink-0 flex-col items-center gap-space-1 px-space-4 py-space-3 text-xs font-medium transition-colors ${
              activeTab === char.id
                ? 'border-t-2 border-primary text-primary'
                : 'text-text/50 hover:text-text/70'
            }`}
          >
            <span className="text-base">
              {char.name.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[60px] truncate">{char.name}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
