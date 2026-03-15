import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Fuse from 'fuse.js'

export interface SrdEquipment {
  index: string
  name: string
  cost: { quantity: number; unit: string } | null
  weight: number | null
  category: string
  damage?: { dice: string; type: string }
  twoHandedDamage?: { dice: string; type: string }
  range?: { normal: number; long?: number }
  weaponCategory?: string
  weaponRange?: string
  properties?: string[]
  armorClass?: { base: number; dexBonus: boolean }
  armorCategory?: string
  strMinimum?: number
  stealthDisadvantage?: boolean
  speed?: { quantity: number; unit: string }
  capacity?: string
  vehicleCategory?: string
  description?: string
  toolCategory?: string
}

export interface SrdMagicItem {
  index: string
  name: string
  rarity: string
  requiresAttunement: boolean
  description: string
}

export type SrdItem = SrdEquipment | SrdMagicItem

export interface CustomItem {
  name: string
}

interface Props {
  type: 'equipment' | 'magic-item'
  onSelect: (item: SrdItem | CustomItem) => void
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  clearOnSelect?: boolean
  customItems?: Array<{ name: string; [key: string]: unknown }>
  filterCategory?: string
}

let equipmentCache: SrdEquipment[] | null = null
let magicItemsCache: SrdMagicItem[] | null = null

export async function loadSrdData(type: 'equipment' | 'magic-item') {
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
  clearOnSelect = true,
  customItems,
  filterCategory,
}: Props) {
  const [internalValue, setInternalValue] = useState('')
  const value = controlledValue ?? internalValue
  const setValue = controlledOnChange ?? setInternalValue

  const [suggestions, setSuggestions] = useState<Array<SrdItem | CustomItem>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [srdData, setSrdData] = useState<SrdItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!customItems) loadSrdData(type).then(setSrdData)
  }, [type, customItems])

  // Filter by category if specified
  const filteredData = useMemo(() => {
    if (customItems) return customItems
    if (!filterCategory) return srdData
    return (srdData as SrdEquipment[]).filter((e) => e.category === filterCategory)
  }, [srdData, customItems, filterCategory])

  // Build Fuse index
  const fuse = useMemo(() => {
    const items = filteredData as Array<{ name: string }>
    return new Fuse(items, {
      keys: ['name'],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 1,
    })
  }, [filteredData])

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([])
      return
    }
    const results = fuse.search(value, { limit: 10 })
    setSuggestions(results.map((r) => r.item))
    setSelectedIndex(-1)
  }, [value, fuse])

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
    (item: SrdItem | CustomItem) => {
      onSelect(item)
      if (clearOnSelect) setValue('')
      setShowSuggestions(false)
    },
    [onSelect, setValue, clearOnSelect],
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
        if (clearOnSelect) setValue('')
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  function getSubtext(item: SrdItem | CustomItem): string {
    if ('cost' in item && item.cost) return `${item.cost.quantity} ${item.cost.unit}`
    if ('rarity' in item) return item.rarity
    return ''
  }

  const listboxId = `autocomplete-listbox-${type}`
  const isExpanded = showSuggestions && suggestions.length > 0

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
        role="combobox"
        aria-expanded={isExpanded}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={selectedIndex >= 0 ? `${listboxId}-option-${selectedIndex}` : undefined}
        className="w-full rounded-[5px] border border-bg-lighter bg-bg px-space-4 py-space-3 text-base text-text placeholder-text/30 outline-none focus:border-primary"
        style={{ fontSize: '16px' }}
      />

      {isExpanded && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${type === 'equipment' ? 'Equipment' : 'Magic item'} suggestions`}
          className="absolute top-full left-0 z-50 mt-space-1 max-h-60 w-full overflow-y-auto rounded-[5px] border border-bg-lighter bg-bg-light shadow-lg"
        >
          {suggestions.map((item, i) => (
            <li
              key={'index' in item ? item.index : item.name}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
            >
              <button
                tabIndex={-1}
                onClick={() => selectItem(item)}
                className={`flex w-full items-center justify-between px-space-4 py-space-3 text-left text-sm transition-colors ${
                  i === selectedIndex ? 'bg-bg-lighter text-text' : 'text-text/80 hover:bg-bg-lighter'
                }`}
              >
                <span>{item.name}</span>
                {getSubtext(item) && (
                  <span className="ml-space-2 text-xs text-text/40">{getSubtext(item)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isExpanded ? `${suggestions.length} result${suggestions.length !== 1 ? 's' : ''} available` : ''}
      </div>
    </div>
  )
}
