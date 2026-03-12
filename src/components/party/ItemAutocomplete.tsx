import { useState, useRef, useEffect, useCallback } from 'react'

interface SrdEquipment {
  index: string
  name: string
  cost: { quantity: number; unit: string } | null
  weight: number | null
  category: string
}

interface SrdMagicItem {
  index: string
  name: string
  rarity: string
  requiresAttunement: boolean
  description: string
}

type SrdItem = SrdEquipment | SrdMagicItem

interface Props {
  type: 'equipment' | 'magic-item'
  onSelect: (item: SrdItem | { name: string }) => void
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

let equipmentCache: SrdEquipment[] | null = null
let magicItemsCache: SrdMagicItem[] | null = null

async function loadSrdData(type: 'equipment' | 'magic-item') {
  if (type === 'equipment') {
    if (!equipmentCache) {
      try {
        const mod = await import('../../data/srd-equipment.json')
        equipmentCache = mod.default as SrdEquipment[]
      } catch {
        equipmentCache = []
      }
    }
    return equipmentCache
  } else {
    if (!magicItemsCache) {
      try {
        const mod = await import('../../data/srd-magic-items.json')
        magicItemsCache = mod.default as SrdMagicItem[]
      } catch {
        magicItemsCache = []
      }
    }
    return magicItemsCache
  }
}

export default function ItemAutocomplete({
  type,
  onSelect,
  placeholder = 'Search items...',
  value: controlledValue,
  onChange: controlledOnChange,
}: Props) {
  const [internalValue, setInternalValue] = useState('')
  const value = controlledValue ?? internalValue
  const setValue = controlledOnChange ?? setInternalValue

  const [suggestions, setSuggestions] = useState<SrdItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [srdData, setSrdData] = useState<SrdItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSrdData(type).then(setSrdData)
  }, [type])

  useEffect(() => {
    if (!value.trim() || srdData.length === 0) {
      setSuggestions([])
      return
    }
    const query = value.toLowerCase()
    const matches = srdData
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 8)
    setSuggestions(matches)
    setSelectedIndex(-1)
  }, [value, srdData])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectItem = useCallback(
    (item: SrdItem) => {
      onSelect(item)
      setValue('')
      setShowSuggestions(false)
    },
    [onSelect, setValue],
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectItem(suggestions[selectedIndex])
      } else if (value.trim()) {
        onSelect({ name: value.trim() })
        setValue('')
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none focus:border-primary"
        style={{ fontSize: '16px' }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-50 mt-space-1 max-h-[240px] w-full overflow-y-auto rounded-[5px] border border-[color:var(--color-bg-lighten-20)] bg-bg-light shadow-lg">
          {suggestions.map((item, i) => (
            <li key={item.index}>
              <button
                onClick={() => selectItem(item)}
                className={`flex w-full items-center justify-between px-space-4 py-space-3 text-left text-sm transition-colors ${
                  i === selectedIndex ? 'bg-bg-lighter text-text' : 'text-text/80 hover:bg-bg-lighter'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-xs text-text/40">
                  {'cost' in item && item.cost
                    ? `${item.cost.quantity} ${item.cost.unit}`
                    : 'rarity' in item
                      ? item.rarity
                      : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
