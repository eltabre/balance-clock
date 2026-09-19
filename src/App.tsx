import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { fmt } from './fmt'
import { playThud } from './sound'
import { CAP_SECONDS } from './types'
import { useBalanceClock } from './useBalanceClock'

type ButtonId = 'study' | 'leisure' | 'pause' | 'reset'

function App() {
  const { mode, balance, studyToday, leisureToday, atCap, setMode, pause, reset } =
    useBalanceClock()

  const [pressed, setPressed] = useState<ButtonId | null>(null)
  const pressTimer = useRef<number | undefined>(undefined)

  const press = useCallback((id: ButtonId, action: () => void) => {
    playThud(id === 'study' || id === 'leisure' ? 'heavy' : 'light')
    setPressed(id)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(null), 140)
    action()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === '1') {
        press('study', () => setMode('study'))
      } else if (e.key === '2') {
        press('leisure', () => setMode('leisure'))
      } else if (e.key === ' ') {
        e.preventDefault()
        press('pause', pause)
      }
    }
    // Stops a focused button from also "clicking" when space is released.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [press, setMode, pause])

  const balanceLabel = balance > 0 ? 'Leisure banked' : 'Study owed'
  const balanceValue = fmt(Math.abs(balance))
  const meterFraction = Math.max(-1, Math.min(1, balance / CAP_SECONDS))

  const status = atCap
    ? `Balance capped — ${mode === 'study' ? 'Study' : mode === 'leisure' ? 'Leisure' : 'Paused'}`
    : mode === 'study'
      ? 'Study running'
      : mode === 'leisure'
        ? 'Leisure running'
        : 'Paused'

  return (
    <div className="app">
      <div className="panels">
        <button
          type="button"
          className={`panel panel-study${mode === 'study' ? ' running' : ''}${pressed === 'study' ? ' pressed' : ''}`}
          onClick={() => press('study', () => setMode('study'))}
          aria-pressed={mode === 'study'}
        >
          <span className="panel-name">Study</span>
          <span className="panel-total">{fmt(studyToday)}</span>
        </button>

        <button
          type="button"
          className={`panel panel-leisure${mode === 'leisure' ? ' running' : ''}${pressed === 'leisure' ? ' pressed' : ''}`}
          onClick={() => press('leisure', () => setMode('leisure'))}
          aria-pressed={mode === 'leisure'}
        >
          <span className="panel-name">Leisure</span>
          <span className="panel-total">{fmt(leisureToday)}</span>
        </button>
      </div>

      <div className="balance">
        <div className="balance-readout">
          <span className="balance-value">{balanceValue}</span>
          <span className="balance-label">{balanceLabel}</span>
        </div>

        <div className="meter" role="img" aria-label={`${balanceLabel} ${balanceValue}`}>
          <div className="meter-track">
            <div className="meter-center" />
            <div
              className={`meter-fill${meterFraction >= 0 ? ' positive' : ' negative'}`}
              style={{
                left: meterFraction >= 0 ? '50%' : `${50 + meterFraction * 50}%`,
                width: `${Math.abs(meterFraction) * 50}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="status">{status}</div>

      <div className="controls">
        <button
          type="button"
          className={`control-btn${pressed === 'pause' ? ' pressed' : ''}`}
          onClick={() => press('pause', pause)}
        >
          Pause
        </button>
        <button
          type="button"
          className={`control-btn${pressed === 'reset' ? ' pressed' : ''}`}
          onClick={() => press('reset', reset)}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default App
