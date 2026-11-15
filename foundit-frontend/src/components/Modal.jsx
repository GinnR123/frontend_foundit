import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Shared modal shell: Escape closes, backdrop click closes, clicks inside do not,
// body scroll is locked while open, focus returns to the opener on close.
export default function Modal({ title, onClose, children, wide = false }) {
  const panelRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    restoreFocusRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      restoreFocusRef.current?.focus?.()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-lg border border-line bg-surface shadow-sm outline-none`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
