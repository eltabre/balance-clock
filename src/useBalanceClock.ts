import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { STORAGE_KEY, freshState, restore, sync, view } from './clockLogic'
import { CAP_SECONDS, type ClockState, type Mode } from './types'

export interface UseBalanceClock {
  mode: Mode
  /** Balance in seconds. Positive = leisure banked, negative = study owed. */
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

function loadState(): ClockState {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // storage blocked; start fresh
  }
  return restore(raw, Date.now())
}

/** Writes state with a fresh `lastSeen` heartbeat. Never settles time. */
function persist(s: ClockState) {
  s.lastSeen = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // storage blocked or full; the clock still works, it just won't survive a reload
  }
}

export function useBalanceClock(): UseBalanceClock {
  // Mutable source of truth. Mutating it never re-renders on its own.
  const [state] = useState(loadState)
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  const lastKey = useRef('')

  // Display only: never adds time. Re-renders only when a displayed second changes.
  useEffect(() => {
    const id = setInterval(() => {
      const v = view(state, Date.now())
      const key = [
        state.mode,
        Math.floor(v.study),
        Math.floor(v.leisure),
        Math.floor(Math.abs(v.balance)),
        v.balance > 0,
      ].join(':')
      if (key !== lastKey.current) {
        lastKey.current = key
        rerender()
      }
    }, 200)
    return () => clearInterval(id)
  }, [state])

  // Heartbeat + save on an interval, when the page is hidden, and on pagehide.
  useEffect(() => {
    const save = () => persist(state)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save()
    }
    save()
    const id = setInterval(save, 1000)
    window.addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(id)
      window.removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [state])

  const setMode = useCallback(
    (next: Mode) => {
      if (next === state.mode) return
      const now = Date.now()
      sync(state, now)
      state.mode = next
      state.since = next === null ? null : now
      persist(state)
      rerender()
    },
    [state],
  )

  const pause = useCallback(() => setMode(null), [setMode])

  const reset = useCallback(() => {
    Object.assign(state, freshState(Date.now()))
    persist(state)
    rerender()
  }, [state])

  const v = view(state, Date.now())
  return {
    mode: state.mode,
    balance: v.balance,
    studyToday: v.study,
    leisureToday: v.leisure,
    atCap: Math.abs(v.balance) >= CAP_SECONDS,
    setMode,
    pause,
    reset,
  }
}
