export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday

export interface Habit {
  id: number
  name: string
  color: string
  /** Days of week this habit is scheduled on. Empty array = every day. */
  activeDays: Weekday[]
  reminderTime: string | null // "HH:MM" or null
  createdAt: string // ISO date
  archived: boolean
  /** "I am a ___" — the identity this habit is voting for (Atomic Habits, ch. 2). */
  identity: string | null
  /** Habit stacking: "After I [stackAfterHabitId], I will [this habit]." */
  stackAfterHabitId: number | null
  stackAfterHabitName: string | null
}

export interface User {
  id: number
  name: string
  email: string
}

/** Completion log: dateISO ("YYYY-MM-DD") -> set of habit ids completed that day */
export type CompletionLog = Record<string, number[]>

export interface HabitStreak {
  current: number
  best: number
}
