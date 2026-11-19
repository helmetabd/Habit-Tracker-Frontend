import { useCallback, useState } from 'react'
import { Header } from './components/Header'
import { TodayList } from './components/TodayList'
import { LedgerGrid } from './components/LedgerGrid'
import { StatsPanel } from './components/StatsPanel'
import { TabBar, type Tab } from './components/TabBar'
import { HabitForm } from './components/HabitForm'
import { AuthScreen } from './components/AuthScreen'
import { useAuth } from './hooks/useAuth'
import { useHabits } from './hooks/useHabits'
import { ensureNotificationPermission } from './lib/notifications'
import { todayKey } from './lib/dates'
import type { Habit } from './types'

export default function App() {
  const { user, loading: authLoading, login, register, logout } = useAuth()
  const onUnauthorized = useCallback(() => logout(), [logout])
  const { activeHabits, log, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits(onUnauthorized)

  const [tab, setTab] = useState<Tab>('today')
  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted',
  )

  if (authLoading) return null
  if (!user) return <AuthScreen onLogin={login} onRegister={register} />

  const openNewHabitForm = () => {
    setEditingHabit(undefined)
    setFormOpen(true)
  }

  const openEditHabitForm = (habit: Habit) => {
    setEditingHabit(habit)
    setFormOpen(true)
  }

  const handleRequestNotifications = async () => {
    const granted = await ensureNotificationPermission()
    setNotificationsEnabled(granted)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <Header
        notificationsEnabled={notificationsEnabled}
        onRequestNotifications={handleRequestNotifications}
        onLogout={logout}
      />

      <main className="flex-1 pb-4">
        {tab === 'today' && (
          <TodayList
            habits={activeHabits}
            log={log}
            onToggle={(habitId) => toggleCompletion(habitId, todayKey())}
            onAddHabit={openNewHabitForm}
          />
        )}
        {tab === 'ledger' && (
          <LedgerGrid
            habits={activeHabits}
            log={log}
            onToggleCell={toggleCompletion}
            onEditHabit={openEditHabitForm}
          />
        )}
        {tab === 'stats' && <StatsPanel habits={activeHabits} log={log} />}
      </main>

      <TabBar active={tab} onChange={setTab} onAddHabit={openNewHabitForm} />

      {formOpen && (
        <HabitForm
          initial={editingHabit}
          stackableHabits={activeHabits.filter((h) => h.id !== editingHabit?.id)}
          onSave={(input) => (editingHabit ? updateHabit(editingHabit.id, input) : addHabit(input))}
          onDelete={editingHabit ? () => deleteHabit(editingHabit.id) : undefined}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  )
}
