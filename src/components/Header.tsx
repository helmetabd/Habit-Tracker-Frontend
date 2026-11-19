import { Bell, BellOff, LogOut } from 'lucide-react'

interface HeaderProps {
  notificationsEnabled: boolean
  onRequestNotifications: () => void
  onLogout: () => void
}

const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export function Header({ notificationsEnabled, onRequestNotifications, onLogout }: HeaderProps) {
  return (
    <header className="flex items-start justify-between border-b border-hairline px-5 py-6 sm:px-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{TODAY_LABEL}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-paper">Habit Tracker</h1>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <button
          onClick={onRequestNotifications}
          title={notificationsEnabled ? 'Reminders on' : 'Enable reminders'}
          className="rounded-full border border-hairline p-2 text-muted transition-colors hover:text-paper"
        >
          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>
        <button
          onClick={onLogout}
          title="Log out"
          className="rounded-full border border-hairline p-2 text-muted transition-colors hover:text-paper"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
