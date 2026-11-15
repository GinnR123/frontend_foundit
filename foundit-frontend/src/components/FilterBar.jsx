import { Search } from 'lucide-react'

const CATEGORIES = ['Wallet / Bag', 'ID / Document', 'Gadget', 'Keys', 'Pet', 'Other']

export default function FilterBar({ query, onQueryChange, category, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search title, description, or location"
          aria-label="Search items"
          className="h-10 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink"
        />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        <button
          type="button"
          aria-pressed={category === 'All'}
          onClick={() => onCategoryChange('All')}
          className={`h-7 rounded-md border px-2.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
            category === 'All'
              ? 'border-ink bg-ink text-white'
              : 'border-line bg-surface text-ink-soft hover:border-line-strong'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => onCategoryChange(c)}
            className={`h-7 rounded-md border px-2.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
              category === c
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-surface text-ink-soft hover:border-line-strong'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
