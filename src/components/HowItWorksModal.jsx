import { Search, MapPin, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Modal from './Modal'

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Browse or find a report',
    text: 'Browse Lost and Found reports, filter by type or category, or use Finder to search open reports with everyday language and date ranges.',
  },
  {
    number: '02',
    icon: Plus,
    title: 'Report a lost or found item',
    text: 'Choose Report Item, add a description and contact details, then enter a landmark or find the location on the map. A map pin is optional.',
  },
  {
    number: '03',
    icon: MapPin,
    title: 'Open a report to follow up',
    text: 'Select a report in the list or map to view its details, location, contact information, and any possible match in this demo.',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Mark a report resolved',
    text: 'The report owner or demo admin can mark an open report resolved after the item has been returned.',
  },
]

export default function HowItWorksModal({ onClose, onGoFinder, onReport }) {
  return (
    <Modal title="How FoundIt works" onClose={onClose} wide>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
        <p className="text-sm leading-relaxed text-ink-soft">
          A quick guide to the community Lost &amp; Found prototype. Reports and sign-in are demo data stored in this browser.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map(({ number, icon: Icon, title, text }) => (
            <li key={number} className="border border-line bg-surface p-4">
              <div className="flex items-center gap-2 text-ink">
                <span className="font-mono text-xs text-ink-soft">{number}</span>
                <Icon size={16} aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-start gap-2 border-l-2 border-accent bg-paper px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
          <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-ink" />
          Demo sign-in only: contact visibility is a frontend behavior, not real access control.
        </div>
      </div>
      <div className="mt-auto flex shrink-0 justify-end gap-2 border-t border-line bg-surface px-5 py-3">
        <button type="button" onClick={onGoFinder} className="h-9 border border-line px-3 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Open Finder
        </button>
        <button type="button" onClick={onReport} className="h-9 bg-accent px-3 text-sm font-medium text-black hover:bg-[#d6c9b2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Report an item
        </button>
      </div>
    </Modal>
  )
}
