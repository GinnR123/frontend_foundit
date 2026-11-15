import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import FilterBar from './components/FilterBar'
import ItemFeed from './components/ItemFeed'
import ItemMap from './components/ItemMap'
import ItemDetailModal from './components/ItemDetailModal'
import ReportModal from './components/ReportModal'
import AuthModal from './components/AuthModal'
import { getItems, getSession, logoutUser } from './services/api'

const STATUS_TABS = ['All', 'Lost', 'Found']

export default function App() {
  const [items, setItems] = useState([])
  const [statusTab, setStatusTab] = useState('All')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [session, setSession] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [focusItemId, setFocusItemId] = useState(null)
  const [openModal, setOpenModal] = useState(null) // 'auth' | 'report' | null
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    setSession(getSession())
    getItems()
      .then(setItems)
      .catch(() => setLoadError('Could not load reports. Refresh the page to try again.'))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (statusTab === 'Lost' && item.type !== 'LOST') return false
      if (statusTab === 'Found' && item.type !== 'FOUND') return false
      if (category !== 'All' && item.category !== category) return false
      if (q) {
        const haystack = `${item.title} ${item.description} ${item.location_name}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [items, statusTab, query, category])

  const hasFilters = statusTab !== 'All' || query.trim() !== '' || category !== 'All'

  function resetFilters() {
    setStatusTab('All')
    setQuery('')
    setCategory('All')
  }

  const selectedItem = useMemo(
    () => items.find((it) => it.id === selectedItemId) || null,
    [items, selectedItemId]
  )

  function handleResolved(updated) {
    setItems((list) => list.map((it) => (it.id === updated.id ? updated : it)))
    setSelectedItemId(null)
  }

  function handleCreated(item) {
    setItems((list) => [item, ...list])
    setOpenModal(null)
  }

  function handleAuthChange(next) {
    setSession(next)
    setOpenModal(null)
  }

  function handleLogout() {
    logoutUser()
    setSession(null)
  }

  const handleSelectItem = useCallback((item) => {
    setSelectedItemId(item.id)
    setFocusItemId(item.id)
  }, [])

  const clearFocus = useCallback(() => setFocusItemId(null), [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        session={session}
        onOpenAuth={() => setOpenModal('auth')}
        onOpenReport={() => setOpenModal('report')}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
        {loadError && (
          <p className="mb-3 rounded-md border border-lost bg-lost-bg px-3 py-2 text-[13px] text-lost" role="alert">
            {loadError}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
          <div className="flex flex-col gap-3">
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              category={category}
              onCategoryChange={setCategory}
            />
            <div className="flex gap-1 border-b border-line" role="tablist" aria-label="Filter by status">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={statusTab === tab}
                  onClick={() => setStatusTab(tab)}
                  className={`-mb-px h-8 border-b-2 px-3 text-[13px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    statusTab === tab
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink-soft hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ItemFeed
              items={filtered}
              onSelectItem={handleSelectItem}
              onResetFilters={resetFilters}
              hasFilters={hasFilters}
            />
          </div>

          <div className="lg:sticky lg:top-[72px] lg:h-[calc(100vh-88px)]">
            <div className="h-72 overflow-hidden rounded-lg border border-line lg:h-full">
              <ItemMap
                items={filtered}
                focusItemId={focusItemId}
                onFocusHandled={clearFocus}
                onSelectItem={(id) => setSelectedItemId(id)}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-surface py-3">
        <div className="mx-auto max-w-6xl px-4 text-[11px] text-ink-soft">
          FoundIt is a frontend prototype with demo data and simulated sign-in.
          Map data &copy; OpenStreetMap contributors.
        </div>
      </footer>

      {openModal === 'auth' && (
        <AuthModal onClose={() => setOpenModal(null)} onAuthChange={handleAuthChange} />
      )}
      {openModal === 'report' && (
        <ReportModal onClose={() => setOpenModal(null)} onCreated={handleCreated} />
      )}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          session={session}
          onClose={() => setSelectedItemId(null)}
          onResolved={handleResolved}
        />
      )}
    </div>
  )
}
