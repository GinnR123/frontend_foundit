import { LogIn, LogOut, Plus, ShieldCheck } from 'lucide-react'

export default function Navbar({ session, onOpenAuth, onOpenReport, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-semibold tracking-tight text-ink">FoundIt</span>
          <span className="hidden text-xs text-ink-soft sm:inline">Community Lost &amp; Found</span>
        </div>

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
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Plus size={15} aria-hidden="true" />
            Report Item
          </button>
        </div>
      </div>
    </header>
  )
}
