import { LogIn, LogOut, Plus, ShieldCheck } from 'lucide-react'

export default function Navbar({ session, view, onNavigate, onOpenAuth, onOpenReport, onOpenGuide, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold tracking-tight text-ink">FoundIt</span>
          <span className="hidden text-[13px] text-ink-soft sm:inline">Community Lost &amp; Found</span>
        </div>

        <nav className="ml-4 flex gap-1" aria-label="Main">
          <button
            type="button"
            onClick={() => onNavigate('feed')}
            aria-current={view === 'feed' ? 'page' : undefined}
            className={`-mb-px h-14 border-b-2 px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              view === 'feed' ? 'border-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            Lost &amp; Found
          </button>
          <button
            type="button"
            onClick={() => onNavigate('finder')}
            aria-current={view === 'finder' ? 'page' : undefined}
            className={`-mb-px h-14 border-b-2 px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              view === 'finder' ? 'border-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            Finder
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenGuide}
          className="hidden h-9 px-2 text-[13px] text-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:inline-flex sm:items-center"
        >
          How it works
        </button>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden items-center gap-1.5 text-xs text-ink-soft sm:flex">
                {session.role === 'admin' && <ShieldCheck size={13} aria-hidden="true" />}
                Signed in as <span className="font-medium text-ink">{session.full_name}</span>
                <span className="text-line-strong">|</span>
                <span className="italic">demo session</span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <LogOut size={15} aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <LogIn size={15} aria-hidden="true" />
              Sign in
            </button>
          )}
          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-black hover:bg-[#d6c9b2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus size={15} aria-hidden="true" />
            Report Item
          </button>
        </div>
      </div>
    </header>
  )
}
