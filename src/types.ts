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
  /** "build" = do it. "break" = avoid it; a logged day is a slip. */
  kind: HabitKind
  /** Break habits: what triggers the urge. */
  cue: string | null
  /** Break habits: what to do instead (replace, don't just delete). */
  replacement: string | null
  /** Habit contract: what you owe if you miss (or slip). */
  consequence: string | null
  witness: string | null
  /** Dates ("YYYY-MM-DD") whose penalty is already paid. */
  paidPenaltyDates: string[]
}

export type HabitKind = 'build' | 'break'

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
