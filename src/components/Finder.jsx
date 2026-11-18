import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import ItemCard from './ItemCard'
import { searchFinder } from '../services/api'

const CHIPS = [
  'Unclaimed this week',
  'Unclaimed past 3 days',
  'Unclaimed electronics',
  'Unclaimed bags & wallets',
]

export default function Finder({ items, onSelectItem }) {
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState(null) // { summary, items }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const openItems = useMemo(() => items.filter((item) => item.status === 'OPEN'), [items])
  const visibleItems = result ? result.items : openItems
  const summary = result?.summary || `Showing all ${openItems.length} unclaimed items.`

  async function run(q = query, from = startDate, to = endDate) {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const { item_ids, summary } = await searchFinder(q, {
        startDate: from || undefined,
        endDate: to || undefined,
      })
      const byId = new Map(items.map((it) => [it.id, it]))
      setResult({ summary, items: item_ids.map((id) => byId.get(id)).filter(Boolean) })
    } catch {
      setError('Search could not be completed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setQuery('')
    setStartDate('')
    setEndDate('')
    setResult(null)
    setError(null)
  }

  return (
    <section aria-labelledby="finder-heading" className="mx-auto w-full max-w-3xl">
      <div className="mb-5 border-b border-line-strong pb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">Natural-language search</p>
        <h1 id="finder-heading" className="mt-1 text-2xl font-semibold leading-tight text-ink sm:text-[30px]">Finder</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Query unclaimed (open) items using everyday language and date ranges.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); run() }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="finder-query" className="sr-only">Search query</label>
        <div className="flex gap-2">
          <input
            id="finder-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Unclaimed tumblers from Nov 10 to Nov 17"
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-black hover:bg-[#d6c9b2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={15} aria-hidden="true" />
            {loading ? 'Searching…' : 'Find Items'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 shrink-0 items-center rounded-md border border-line bg-surface px-4 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="finder-from" className="text-[12px] text-ink-soft">From</label>
          <input
            id="finder-from" type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-[13px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink"
          />
          <label htmlFor="finder-to" className="text-[12px] text-ink-soft">To</label>
          <input
            id="finder-to" type="date" value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 rounded-md border border-line bg-surface px-2 text-[13px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink"
          />
        </div>

        <div className="mt-1 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => { setQuery(chip); run(chip, '', '') }}
              className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-2.5 text-[12px] text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-lost" role="alert">{error}</p>}
      <p className="mt-6 border-b border-line pb-2 font-mono text-xs text-ink-soft" role="status">{summary}</p>
      {visibleItems.length > 0 ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} onClick={onSelectItem} variant="card" />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">No unclaimed items match. Try a broader query or clear the date range.</p>
      )}
    </section>
  )
}
