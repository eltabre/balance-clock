import type { Mode } from './types'

export interface UseBalanceClock {
  mode: Mode
  /** Balance in seconds. Positive = study owed, negative = leisure banked. */
  balance: number
  /** Seconds spent in study mode today. */
  studyToday: number
  /** Seconds spent in leisure mode today. */
  leisureToday: number
  /** True when balance has hit +CAP_SECONDS or -CAP_SECONDS. */
  atCap: boolean
  setMode: (mode: Mode) => void
  pause: () => void
  reset: () => void
}

// TODO: implement the real hook. Requirements:
//
// - Accounting is timestamp-based. Store `since` as epoch ms and compute
//   elapsed time on read (Date.now() - since). Never accumulate inside
//   setInterval — the interval should only drive re-renders/display, not be
//   the source of truth for elapsed time.
//
// - Clamp balance to the range [-CAP_SECONDS, +CAP_SECONDS].
//
// - Persist state to a single namespaced localStorage key. Save on an
//   interval and on the 'pagehide' event. Reset studyToday/leisureToday to 0
//   at local midnight (when `day` no longer matches today's date), but carry
//   the balance forward unchanged.
//
// - On load, if a mode was still running (state.mode is non-null), use the
//   persisted `lastSeen` heartbeat to decide how much time to credit before
//   resuming. If `lastSeen` is older than some grace window (e.g. the tab
//   was closed for a long time, or the machine was asleep), do not credit
//   that stretch and refuse to resume running — come back up paused instead.
//
// - Guard against dt <= 0 when computing elapsed time — the system clock can
//   jump backwards (NTP sync, manual change, sleep/wake weirdness).
//
// - Re-render only when the displayed second changes, not on every interval
//   tick, to avoid unnecessary renders.
export function useBalanceClock(): UseBalanceClock {
  return {
    mode: null,
    balance: 0,
    studyToday: 0,
    leisureToday: 0,
    atCap: false,
    setMode: () => {},
    pause: () => {},
    reset: () => {},
  }
}
