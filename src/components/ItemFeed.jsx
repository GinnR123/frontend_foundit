import { RotateCcw } from 'lucide-react'
import ItemCard from './ItemCard'

export default function ItemFeed({ items, onSelectItem, onResetFilters, hasFilters }) {
  if (items.length === 0) {
    return (
      <div className="border border-line bg-surface px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">No reports match your filters</p>
        <p className="mt-1 text-[13px] text-ink-soft">Try a different search term or category.</p>
        {hasFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Reset Filters
          </button>
        )}
      </div>
    )
  }

  const lostCount = items.filter((item) => item.type === 'LOST').length
  const foundCount = items.filter((item) => item.type === 'FOUND').length
  const matchCount = items.filter((item) => item.matched_item_id != null).length

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        <span className="font-mono">{items.length} REPORTS</span>
        <span className="font-mono font-normal">{lostCount} LOST · {foundCount} FOUND · {matchCount} MATCHED</span>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} onClick={onSelectItem} />
          </li>
        ))}
      </ul>
    </div>
  )
}
