import { useCallback, useEffect, useRef, useState } from 'react'
import type { CompletionLog, Habit, Weekday } from '../types'
import { api, ApiError } from '../lib/api'
import { todayKey } from '../lib/dates'
import { notify } from '../lib/notifications'

export interface NewHabitInput {
  name: string
  color: string
  activeDays: Weekday[]
  reminderTime: string | null
  identity: string | null
  stackAfterHabitId: number | null
}

/** Wire shape returned by the Laravel API (snake_case, nested completions). */
interface ApiHabit {
  id: number
  name: string
  color: string
  active_days: number[]
  reminder_time: string | null
  archived: boolean
  created_at: string
  identity: string | null
  stack_after_habit_id: number | null
  stack_after?: { id: number; name: string } | null
  completions?: { date: string }[]
}

function fromApi(habit: ApiHabit): Habit {
  return {
    id: habit.id,
    name: habit.name,
    color: habit.color,
    activeDays: habit.active_days as Weekday[],
    reminderTime: habit.reminder_time,
    archived: habit.archived,
    createdAt: habit.created_at,
    identity: habit.identity,
    stackAfterHabitId: habit.stack_after_habit_id,
    stackAfterHabitName: habit.stack_after?.name ?? null,
  }
}

function toApi(input: Partial<NewHabitInput>) {
  return {
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.color !== undefined && { color: input.color }),
    ...(input.activeDays !== undefined && { active_days: input.activeDays }),
    ...(input.reminderTime !== undefined && { reminder_time: input.reminderTime }),
    ...(input.identity !== undefined && { identity: input.identity?.trim() || null }),
    ...(input.stackAfterHabitId !== undefined && { stack_after_habit_id: input.stackAfterHabitId }),
  }
}

function buildLog(habits: ApiHabit[]): CompletionLog {
  const log: CompletionLog = {}
  for (const habit of habits) {
    for (const completion of habit.completions ?? []) {
      log[completion.date] = [...(log[completion.date] ?? []), habit.id]
    }
  }
  return log
}

export function useHabits(onUnauthorized: () => void) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [log, setLog] = useState<CompletionLog>({})
  const [loading, setLoading] = useState(true)
  const notifiedToday = useRef<Set<string>>(new Set())

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized()
      else console.error(err)
    },
    [onUnauthorized],
  )

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<ApiHabit[]>('/habits')
      setHabits(data.map(fromApi))
      setLog(buildLog(data))
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  useEffect(() => {
    reload()
  }, [reload])

  // Poll once a minute for due reminders on habits not yet completed today.
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const key = todayKey()
      const doneToday = log[key] ?? []

      for (const habit of habits) {
        if (habit.archived || !habit.reminderTime) continue
        if (habit.reminderTime !== hhmm) continue
        if (doneToday.includes(habit.id)) continue
        const dedupeKey = `${habit.id}:${key}:${hhmm}`
        if (notifiedToday.current.has(dedupeKey)) continue

        notifiedToday.current.add(dedupeKey)
        notify('Habit reminder', `Time for "${habit.name}"`)
      }
    }

    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [habits, log])

  const addHabit = useCallback(
    async (input: NewHabitInput) => {
      try {
        const created = await api.post<ApiHabit>('/habits', toApi(input))
        setHabits((prev) => [...prev, fromApi(created)])
      } catch (err) {
        handleError(err)
      }
    },
    [handleError],
  )

  const updateHabit = useCallback(
    async (id: number, patch: Partial<NewHabitInput>) => {
      const previous = habits
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)))
      try {
        await api.patch(`/habits/${id}`, toApi(patch))
      } catch (err) {
        setHabits(previous)
        handleError(err)
      }
    },
    [habits, handleError],
  )

  const deleteHabit = useCallback(
    async (id: number) => {
      const previousHabits = habits
      const previousLog = log
      setHabits((prev) => prev.filter((h) => h.id !== id))
      setLog((prev) => {
        const next: CompletionLog = {}
        for (const [date, ids] of Object.entries(prev)) next[date] = ids.filter((habitId) => habitId !== id)
        return next
      })
      try {
        await api.delete(`/habits/${id}`)
      } catch (err) {
        setHabits(previousHabits)
        setLog(previousLog)
        handleError(err)
      }
    },
    [habits, log, handleError],
  )

  const toggleCompletion = useCallback(
    async (habitId: number, dateKey: string) => {
      const previous = log
      setLog((prev) => {
        const dayList = prev[dateKey] ?? []
        const nextDayList = dayList.includes(habitId)
          ? dayList.filter((id) => id !== habitId)
          : [...dayList, habitId]
        return { ...prev, [dateKey]: nextDayList }
      })
      try {
        await api.post(`/habits/${habitId}/toggle`, { date: dateKey })
      } catch (err) {
        setLog(previous)
        handleError(err)
      }
    },
    [log, handleError],
  )

  const activeHabits = habits.filter((h) => !h.archived)

  return { habits, activeHabits, log, loading, addHabit, updateHabit, deleteHabit, toggleCompletion }
}
