import { useEffect, useState } from 'react'
import { CheckCircle2, MapPin, ShieldAlert } from 'lucide-react'
import Modal from './Modal'
import { getPossibleMatches, resolveItem } from '../services/api'
import { StatusBadge } from './ItemCard'

export default function ItemDetailModal({ item, session, onClose, onResolved, onSwitchItem }) {
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState(null)
  const [matches, setMatches] = useState([])
  const [matchesLoading, setMatchesLoading] = useState(false)

  const isOwner = session && session.id === item.user_id
  const isAdmin = session && session.role === 'admin'
  const canResolve = (isOwner || isAdmin) && item.status === 'OPEN'

  async function handleResolve() {
    if (!canResolve || resolving) return
    setResolving(true)
    setError(null)
    try {
      const updated = await resolveItem(item.id)
      onResolved(updated)
    } catch (e) {
      setError(e.message || 'Could not mark this item resolved')
      setResolving(false)
    }
  }

  useEffect(() => {
    if (item.matched_item_id == null) {
      setMatches([])
      return
    }
    let cancelled = false
    setMatchesLoading(true)
    getPossibleMatches(item.id)
      .then((result) => {
        if (!cancelled) setMatches(result)
      })
      .catch(() => {
        if (!cancelled) setMatches([])
      })
      .finally(() => {
        if (!cancelled) setMatchesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [item.id, item.matched_item_id])

  return (
    <Modal title="Item Details" onClose={onClose}>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <StatusBadge type={item.type} status={item.status} />
          {item.matched_item_id != null && (
            <span
              className="inline-flex h-5 items-center rounded border border-dashed border-line-strong px-1.5 text-[11px] text-ink-soft"
              title="Simulated match indicator for the prototype — no live AI matching is running."
            >
              Possible Match #{item.matched_item_id}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">{item.title}</h3>

        <dl className="mt-3 space-y-2 text-[13px]">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-soft">Category</dt>
            <dd className="text-ink">{item.category}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-soft">Location</dt>
            <dd className="flex items-start gap-1 text-ink">
              <MapPin size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
              {item.location_name || 'Not specified'}
              {item.latitude != null && item.longitude != null && (
                <span className="ml-1 text-ink-soft">
                  ({item.latitude.toFixed(4)}, {item.longitude.toFixed(4)})
                </span>
              )}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-soft">Reported</dt>
            <dd className="text-ink">
              {new Date(item.created_at).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-soft">Posted by</dt>
            <dd className="text-ink">{item.full_name}</dd>
          </div>
        </dl>

        <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-ink">
          {item.description}
        </p>

        <div className="mt-4 rounded-md border border-line bg-paper px-3 py-2.5">
          <p className="text-[12px] font-medium text-ink">Contact information</p>
          {session ? (
            <>
              <p className="mt-0.5 text-[13px] text-ink">{item.contact_info || 'Not provided'}</p>
              <p className="mt-1 flex items-start gap-1 text-[11px] text-ink-soft">
                <ShieldAlert size={12} aria-hidden="true" className="mt-0.5 shrink-0" />
                Demo only: sign-in is simulated in the browser. Real access control will be enforced by the backend.
              </p>
            </>
          ) : (
            <p className="mt-0.5 text-[12px] text-ink-soft">
              Sign in (demo) to view contact details.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-lost bg-lost-bg px-3 py-2 text-[12px] text-lost" role="alert">
            {error}
          </p>
        )}

        {canResolve && (
          <button
            type="button"
            onClick={handleResolve}
            disabled={resolving}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            {resolving ? 'Marking resolved…' : 'Mark Resolved'}
          </button>
        )}

        {item.matched_item_id != null && (
          <div className="mt-4 rounded-md border border-line">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-[12px] font-medium text-ink">
                Possible Match #{item.matched_item_id}
              </p>
              <span className="text-[11px] text-ink-soft">Simulated match</span>
            </div>
            <div className="px-3 py-2.5">
              {matchesLoading ? (
                <p className="text-[12px] text-ink-soft">Loading match…</p>
              ) : matches.length === 0 ? (
                <p className="text-[12px] text-ink-soft">Match details are not available.</p>
              ) : (
                matches.map((m) => (
                  <div key={m.id} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge type={m.type} status={m.status} />
                      <span className="text-[13px] font-medium text-ink">{m.title}</span>
                    </div>
                    <p className="text-[12px] text-ink-soft">
                      {m.location_name || 'No location given'}
                      {m.match_reason ? ` · ${m.match_reason}` : ''}
                    </p>
                    {onSwitchItem && (
                      <button
                        type="button"
                        onClick={() => onSwitchItem(m.id)}
                        className="self-start text-[12px] font-medium text-ink underline hover:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
                      >
                        View matched report
                      </button>
                    )}
                  </div>
                ))
              )}
              <p className="mt-2 text-[11px] text-ink-soft">
                Match suggestions are simulated in this frontend prototype until connected to the backend AI service.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
