import { MapPin } from 'lucide-react'

const TYPE_STYLES = {
  LOST: 'bg-lost-bg text-lost',
  FOUND: 'bg-found-bg text-found',
  RESOLVED: 'bg-resolved-bg text-resolved',
}

export function StatusBadge({ type, status }) {
  const label = status === 'RESOLVED' ? 'RESOLVED' : type
  return (
    <span className={`inline-flex h-5 items-center rounded px-1.5 text-[11px] font-semibold tracking-wide ${TYPE_STYLES[label] || TYPE_STYLES.RESOLVED}`}>
      {label}
    </span>
  )
}

export default function ItemCard({ item, onClick, variant = 'row' }) {
  const muted = item.status === 'RESOLVED'
  const cardStyle = variant === 'card'
    ? 'border border-line hover:border-ink'
    : 'border-b border-line last:border-b-0'
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`block w-full ${cardStyle} bg-surface px-4 py-3 text-left hover:bg-paper focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent ${
        muted ? 'opacity-60' : ''
      }`}
    >
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
        <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-soft">
          {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <h3 className={`mt-2 text-base font-medium leading-snug ${muted ? 'text-ink-soft line-through decoration-line-strong' : 'text-ink'}`}>
        {item.title}
      </h3>
      <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{item.description}</p>
      <div className="mt-1 flex items-center gap-1 text-[12px] text-ink-soft">
        <MapPin size={12} aria-hidden="true" />
        <span className="truncate">{item.location_name || 'No location given'}</span>
        <span className="text-line-strong">·</span>
        <span className="shrink-0">{item.category}</span>
      </div>
    </button>
  )
}
