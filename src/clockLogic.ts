import { CAP_SECONDS, type ClockState, type Mode } from './types'

export const STORAGE_KEY = 'balance-clock:v1'
/** If the page was last seen longer ago than this, a running clock is not resumed. */
export const GRACE_MS = 5 * 60 * 1000

export const clamp = (n: number) => Math.max(-CAP_SECONDS, Math.min(CAP_SECONDS, n))

const direction = (mode: Mode) => (mode === 'study' ? 1 : mode === 'leisure' ? -1 : 0)

/** Local calendar date, e.g. "2026-09-19". */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function freshState(now: number): ClockState {
  return {
    mode: null,
    since: null,
    balance: 0,
    studyToday: 0,
    leisureToday: 0,
    day: dayKey(now),
    lastSeen: now,
  }
}

/** Seconds since `since`; 0 if not running or the system clock went backwards. */
function elapsed(s: ClockState, now: number): number {
  if (s.mode === null || s.since === null) return 0
  return Math.max(0, (now - s.since) / 1000)
}

/** Fold the running interval into the stored totals and restart it from `now`. */
function settle(s: ClockState, now: number) {
  const dt = elapsed(s, now)
  if (s.mode !== null) s.since = now
  if (dt <= 0) return
  if (s.mode === 'study') s.studyToday += dt
  else if (s.mode === 'leisure') s.leisureToday += dt
  s.balance = clamp(s.balance + direction(s.mode) * dt)
}

/**
 * Bring stored state up to `now`: if local midnight has passed, settle up to
 * midnight, zero the daily totals (balance carries), then settle the rest.
 */
export function sync(s: ClockState, now: number) {
  const today = dayKey(now)
  if (s.day !== today) {
    const midnight = startOfDay(now)
    if (s.since !== null && s.since < midnight) settle(s, midnight)
    s.studyToday = 0
    s.leisureToday = 0
    s.day = today
  }
  settle(s, now)
}

export interface View {
  study: number
  leisure: number
  balance: number
}

/** What to display at `now`. Pure: stored state plus the unsettled elapsed time. */
export function view(s: ClockState, now: number): View {
  let study = s.studyToday
  let leisure = s.leisureToday
  let dt = elapsed(s, now)

  if (s.day !== dayKey(now)) {
    study = 0
    leisure = 0
    dt = s.since === null ? 0 : Math.max(0, (now - Math.max(s.since, startOfDay(now))) / 1000)
  }
  if (s.mode === 'study') study += dt
  else if (s.mode === 'leisure') leisure += dt

  return {
    study,
    leisure,
    balance: clamp(s.balance + direction(s.mode) * elapsed(s, now)),
  }
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function parse(raw: string | null): ClockState | null {
  if (!raw) return null
  try {
    const o = JSON.parse(raw) as Partial<Record<keyof ClockState, unknown>>
    if (o.mode !== null && o.mode !== 'study' && o.mode !== 'leisure') return null
    if (!isNum(o.balance) || !isNum(o.studyToday) || !isNum(o.leisureToday)) return null
    if (!isNum(o.lastSeen) || typeof o.day !== 'string') return null
    const running = o.mode !== null && isNum(o.since)
    return {
      mode: running ? o.mode : null,
      since: running ? (o.since as number) : null,
      balance: clamp(o.balance),
      studyToday: Math.max(0, o.studyToday),
      leisureToday: Math.max(0, o.leisureToday),
      day: o.day,
      lastSeen: o.lastSeen,
    }
  } catch {
    return null
  }
}

/**
 * Rebuild state from what was saved. A running clock is credited only up to
 * the last heartbeat (the last moment the page was known to be alive). If the
 * heartbeat is within the grace window it resumes from now; otherwise it comes
 * back paused, and the unknown gap is never credited.
 */
export function restore(raw: string | null, now: number): ClockState {
  const s = parse(raw) ?? freshState(now)
  const lastSeen = Math.min(s.lastSeen, now)

  if (s.mode !== null) {
    sync(s, lastSeen)
    if (now - lastSeen > GRACE_MS) {
      s.mode = null
      s.since = null
    } else {
      s.since = now
    }
  }

  sync(s, now)
  s.lastSeen = now
  return s
}
