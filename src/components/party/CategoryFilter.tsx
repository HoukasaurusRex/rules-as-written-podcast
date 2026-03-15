import { useRef, useCallback } from 'react'
import { EQUIPMENT_CATEGORIES, CATEGORY_LABELS, type EquipmentCategory } from '../../utils/inventory-categories'

interface Props {
  selected: string | null
  onChange: (category: string | null) => void
  counts?: Record<string, number>
}

const CategoryIcon = ({ category, size = 16 }: { category: string | null; size?: number }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (!category) {
    // All: 2x2 grid
    return (
      <svg {...props} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  }

  switch (category) {
    case 'Weapon':
      // Sword
      return (
        <svg {...props} aria-hidden="true">
          <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
          <path d="M13 19l6-6" />
          <path d="m16 16 4 4" />
          <path d="m19 21 2-2" />
        </svg>
      )
    case 'Adventuring Gear':
      // Backpack
      return (
        <svg {...props} aria-hidden="true">
          <path d="M4 10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M9 8V5a3 3 0 0 1 6 0v3" />
          <path d="M8 14h8" />
          <path d="M8 18h8" />
        </svg>
      )
    case 'Tools':
      // Hammer
      return (
        <svg {...props} aria-hidden="true">
          <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
          <path d="M17.64 15 22 10.64" />
          <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
        </svg>
      )
    case 'Armor':
      // Shield
      return (
        <svg {...props} aria-hidden="true">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
      )
    case 'Mounts and Vehicles':
      // Horse head
      return (
        <svg {...props} aria-hidden="true">
          <path d="M14 4.5C14 3 16 1 18 1c.5 2 1 4 0 6l-2 3v4l-1 2H9l-1-3-3-3 1-3c1-1 3-1 4 0l1 1" />
          <circle cx="17" cy="4" r="1" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

const allCategories = [null, ...EQUIPMENT_CATEGORIES] as const

const CategoryFilter = ({ selected, onChange, counts }: Props) => {
  const navRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const buttons = navRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      if (!buttons?.length) return

      const currentIndex = Array.from(buttons).findIndex((btn) => btn.getAttribute('aria-selected') === 'true')
      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = (currentIndex + 1) % buttons.length
          break
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = (currentIndex - 1 + buttons.length) % buttons.length
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = buttons.length - 1
          break
        default:
          return
      }

      buttons[nextIndex].focus()
      const category = buttons[nextIndex].dataset.category
      onChange(category === '' ? null : (category as EquipmentCategory))
    },
    [onChange],
  )

  return (
    <div
      ref={navRef}
      role="tablist"
      aria-label="Filter by item category"
      onKeyDown={handleKeyDown}
      className="mb-space-3 flex gap-space-1 overflow-x-auto scrollbar-none"
    >
      {allCategories.map((category) => {
        const isActive = selected === category
        const label = category ? CATEGORY_LABELS[category] : 'All'
        const count = category
          ? counts?.[category] ?? 0
          : counts
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : 0

        return (
          <button
            key={category ?? 'all'}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            data-category={category ?? ''}
            title={`${label}${count ? ` (${count})` : ''}`}
            onClick={() => onChange(category)}
            className={`flex shrink-0 items-center gap-space-1 rounded-[5px] border px-space-2 py-space-1 text-xs font-medium transition-colors ${
              isActive
                ? 'border-primary bg-primary/20 text-primary-muted'
                : 'border-bg-lighter bg-bg-light text-text/50 hover:bg-bg-lighter hover:text-text/70'
            }`}
          >
            <CategoryIcon category={category} size={14} />
            <span className="hidden sm:inline">{label}</span>
            {count > 0 && (
              <span className={`text-[10px] ${isActive ? 'text-primary-muted/70' : 'text-text/30'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
