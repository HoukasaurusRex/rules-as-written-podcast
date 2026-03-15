import { useState, useMemo } from 'react'
import { useStore } from '@nanostores/react'
import { $editMode, type PartyInventoryItem } from '../../stores/party'
import { EQUIPMENT_CATEGORIES, CATEGORY_LABELS, getItemDetails, type EquipmentCategory } from '../../utils/inventory-categories'
import ItemEditModal from './ItemEditModal'
import ItemAutocomplete from './ItemAutocomplete'
import CategoryFilter from './CategoryFilter'

interface Props {
  items: PartyInventoryItem[]
  characterId: string | null
  onAdd: (item: Record<string, unknown>) => Promise<void>
  onUpdate: (item: Record<string, unknown>) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
}

const PREVIEW_HEIGHT = 'h-72'

const ItemRow = ({
  item,
  isExpanded,
  onToggle,
  editMode,
  onUpdate,
  onDelete,
  onEdit,
}: {
  item: PartyInventoryItem
  isExpanded: boolean
  onToggle: () => void
  editMode: boolean
  onUpdate: (updates: Record<string, unknown>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (item: PartyInventoryItem) => void
}) => {
  const catalogItem = item.catalogItem
  const details = catalogItem ? getItemDetails(catalogItem) : []

  return (
    <div className="rounded-[5px] bg-bg">
      <div className="flex items-center justify-between px-space-3 py-space-2">
        <button
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-space-2 text-left"
          aria-expanded={isExpanded}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`shrink-0 text-text/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="truncate text-sm text-text">{item.name}</span>
        </button>
        <div className="flex items-center gap-space-2">
          {editMode && (
            <button
              onClick={() => {
                const newQty = (item.quantity ?? 1) - 1
                if (newQty <= 0) onDelete(item.id)
                else onUpdate({ id: item.id, quantity: newQty })
              }}
              className="flex h-8 w-8 items-center justify-center rounded bg-bg-light text-xs text-text/50 hover:bg-bg-lighter"
              aria-label={`Decrease ${item.name} quantity`}
            >
              −
            </button>
          )}
          <span className="min-w-6 text-center text-sm tabular-nums text-text/60">
            ×{item.quantity}
          </span>
          {editMode && (
            <>
              <button
                onClick={() => onUpdate({ id: item.id, quantity: (item.quantity ?? 1) + 1 })}
                className="flex h-8 w-8 items-center justify-center rounded bg-bg-light text-xs text-text/50 hover:bg-bg-lighter"
                aria-label={`Increase ${item.name} quantity`}
              >
                +
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex h-8 w-8 items-center justify-center rounded text-xs text-error/50 hover:bg-error/10 hover:text-error"
                aria-label={`Delete ${item.name}`}
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-bg-lighter px-space-3 py-space-3 text-xs text-text/50">
          {item.weight != null && (
            <div className="mb-space-1">
              <span className="text-text/30">Weight:</span> {item.weight} lb
            </div>
          )}
          {details.length > 0 && (
            <div className="mb-space-1 flex flex-wrap gap-space-1">
              {details.map((detail) => (
                <span key={detail} className="rounded bg-bg-light px-space-2 py-0.5 text-[10px] text-text/40">
                  {detail}
                </span>
              ))}
            </div>
          )}
          {catalogItem?.description && (
            <div className="mb-space-1 text-text/40 italic">
              {catalogItem.description.length > 150
                ? `${catalogItem.description.slice(0, 150)}...`
                : catalogItem.description}
            </div>
          )}
          {!catalogItem && !item.weight && (
            <div className="mb-space-1 text-text/30">Custom item</div>
          )}
          {editMode && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="mt-space-2 rounded-[5px] bg-bg-light px-space-3 py-space-1 text-xs text-text/50 hover:bg-bg-lighter hover:text-text/70"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const getCategory = (item: PartyInventoryItem): string =>
  item.catalogItem?.category ?? 'Adventuring Gear'

const InventoryList = ({ items, characterId, onAdd, onUpdate, onDelete }: Props) => {
  const editMode = useStore($editMode)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<PartyInventoryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFullInventory, setShowFullInventory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      const cat = getCategory(item)
      counts[cat] = (counts[cat] ?? 0) + 1
    }
    return counts
  }, [items])

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items
    return items.filter((item) => getCategory(item) === selectedCategory)
  }, [items, selectedCategory])

  const sortedItems = useMemo(() => {
    if (selectedCategory) {
      return [...filteredItems].sort((a, b) => a.name.localeCompare(b.name))
    }
    const categoryOrder = new Map(EQUIPMENT_CATEGORIES.map((c, i) => [c, i]))
    return [...filteredItems].sort((a, b) => {
      const orderA = categoryOrder.get(getCategory(a) as EquipmentCategory) ?? 999
      const orderB = categoryOrder.get(getCategory(b) as EquipmentCategory) ?? 999
      if (orderA !== orderB) return orderA - orderB
      return a.name.localeCompare(b.name)
    })
  }, [filteredItems, selectedCategory])

  const renderItems = (itemList: PartyInventoryItem[]) => {
    if (selectedCategory) {
      return itemList.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          isExpanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          editMode={editMode}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEdit={setEditingItem}
        />
      ))
    }

    let lastCategory = ''
    return itemList.map((item) => {
      const cat = getCategory(item)
      const showHeader = cat !== lastCategory
      lastCategory = cat
      return (
        <div key={item.id}>
          {showHeader && (
            <div className="mb-space-1 mt-space-3 text-xs font-semibold uppercase tracking-wider text-text/30 first:mt-0">
              {CATEGORY_LABELS[cat as EquipmentCategory] ?? cat}
            </div>
          )}
          <ItemRow
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            editMode={editMode}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onEdit={setEditingItem}
          />
        </div>
      )
    })
  }

  const modalItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems
    const q = searchQuery.toLowerCase()
    return sortedItems.filter((item) => item.name.toLowerCase().includes(q))
  }, [sortedItems, searchQuery])

  const showOverflowButton = sortedItems.length > 8

  return (
    <section>
      <div className="mb-space-3 flex items-center justify-between">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-text/50">
          Inventory
          {items.length > 0 && (
            <span className="ml-space-2 text-xs font-normal text-text/30">({items.length})</span>
          )}
        </h3>
        {editMode && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-[5px] bg-primary/20 px-space-3 py-space-1 text-xs font-medium text-primary-muted transition-colors hover:bg-primary/30"
          >
            {showAdd ? 'Cancel' : '+ Add Item'}
          </button>
        )}
      </div>

      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        counts={categoryCounts}
      />

      {showAdd && editMode && (
        <div className="mb-space-3">
          <ItemAutocomplete
            type="equipment"
            placeholder="Search equipment or type custom item..."
            filterCategory={selectedCategory ?? undefined}
            onSelect={async (item) => {
              await onAdd({
                characterId,
                name: item.name,
                srdIndex: 'index' in item ? item.index : undefined,
                weight: 'weight' in item ? item.weight : undefined,
                category: 'category' in item ? item.category : selectedCategory ?? 'Adventuring Gear',
              })
              setShowAdd(false)
            }}
          />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-[5px] border border-dashed border-bg-lighter py-space-4 text-center text-xs text-text/30">
          {selectedCategory ? `No ${CATEGORY_LABELS[selectedCategory as EquipmentCategory]?.toLowerCase() ?? 'items'}` : 'No items'}
        </div>
      ) : (
        <>
          <div
            className={`relative ${showOverflowButton ? `${PREVIEW_HEIGHT} overflow-hidden` : ''} space-y-space-1`}
            style={showOverflowButton ? { maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)' } : undefined}
          >
            {renderItems(sortedItems)}
          </div>

          {showOverflowButton && (
            <button
              type="button"
              onClick={() => setShowFullInventory(true)}
              className="mt-space-3 w-full rounded-[5px] border border-bg-lighter py-space-2 text-xs text-text/40 transition-colors hover:bg-bg-light"
            >
              View all {selectedCategory ? CATEGORY_LABELS[selectedCategory as EquipmentCategory] : 'items'} ({filteredItems.length})
            </button>
          )}
        </>
      )}

      {showFullInventory && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center sm:p-space-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFullInventory(false) }}
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-xl border border-bg-lighter bg-bg shadow-lg sm:rounded-[5px]">
            <div className="flex shrink-0 items-center justify-between border-b border-bg-lighter px-space-4 py-space-3">
              <h3 className="m-0 text-base font-bold text-text">
                Inventory{selectedCategory ? ` \u2013 ${CATEGORY_LABELS[selectedCategory as EquipmentCategory]}` : ''}
              </h3>
              <button
                type="button"
                onClick={() => setShowFullInventory(false)}
                className="text-sm text-text/50 hover:text-text"
              >
                Close
              </button>
            </div>
            <div className="shrink-0 border-b border-bg-lighter px-space-4 py-space-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full rounded-[5px] border border-bg-lighter bg-bg-light px-space-3 py-space-2 text-sm text-text placeholder-text/30 outline-none focus:border-primary"
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="shrink-0 border-b border-bg-lighter px-space-4 py-space-2">
              <CategoryFilter
                selected={selectedCategory}
                onChange={setSelectedCategory}
                counts={categoryCounts}
              />
            </div>
            <div className="overflow-y-auto p-space-4">
              <div className="space-y-space-1">
                {modalItems.length === 0 ? (
                  <div className="py-space-4 text-center text-xs text-text/30">
                    No items match your search
                  </div>
                ) : (
                  renderItems(modalItems)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <ItemEditModal
          item={{
            type: 'inventory',
            id: editingItem.id,
            name: editingItem.name,
            quantity: editingItem.quantity,
            weight: editingItem.weight,
            category: editingItem.catalogItem?.category ?? 'Adventuring Gear',
          }}
          onSave={onUpdate}
          onClose={() => setEditingItem(null)}
        />
      )}
    </section>
  )
}

export default InventoryList
