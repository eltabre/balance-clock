export type Mode = 'study' | 'leisure' | null

export interface ClockState {
  mode: Mode
  /** Epoch ms when the current mode started running, or null if paused. */
  since: number | null
  /** Balance in seconds. Positive = leisure banked, negative = study owed. */
  balance: number
  /** Seconds spent in study mode today. */
  studyToday: number
  /** Seconds spent in leisure mode today. */
  leisureToday: number
  /** Local date string (YYYY-MM-DD) the daily totals belong to. */
  day: string
  /** Epoch ms heartbeat, updated periodically while a mode is running. */
  lastSeen: number
}

export const CAP_SECONDS = 3 * 60 * 60
