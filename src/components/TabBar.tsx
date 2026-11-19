import { CalendarDays, ListChecks, Plus, TrendingUp } from 'lucide-react'

export type Tab = 'today' | 'ledger' | 'stats'

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
  onAddHabit: () => void
}

const TABS: { id: Tab; label: string; icon: typeof ListChecks }[] = [
  { id: 'today', label: 'Today', icon: ListChecks },
  { id: 'ledger', label: 'Ledger', icon: CalendarDays },
  { id: 'stats', label: 'Stats', icon: TrendingUp },
]

export function TabBar({ active, onChange, onAddHabit }: TabBarProps) {
  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-hairline bg-ink px-2 py-2 sm:justify-center sm:gap-10">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex flex-col items-center gap-1 px-4 py-1.5 text-xs"
          style={{ color: active === id ? 'var(--color-paper)' : 'var(--color-muted)' }}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
      <button
        onClick={onAddHabit}
        className="flex flex-col items-center gap-1 px-4 py-1.5 text-xs text-moss sm:ml-4"
      >
        <Plus size={18} />
        Add
      </button>
    </nav>
  )
}
