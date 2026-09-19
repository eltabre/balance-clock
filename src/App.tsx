import { useEffect } from 'react'
import './App.css'
import { fmt } from './fmt'
import { CAP_SECONDS } from './types'
import { useBalanceClock } from './useBalanceClock'

function App() {
  const { mode, balance, studyToday, leisureToday, atCap, setMode, pause, reset } =
    useBalanceClock()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        setMode('study')
      } else if (e.key === '2') {
        setMode('leisure')
      } else if (e.key === ' ') {
        e.preventDefault()
        pause()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setMode, pause])

  const balanceLabel = balance < 0 ? 'Leisure banked' : 'Study owed'
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
          className={`panel panel-study${mode === 'study' ? ' running' : ''}`}
          onClick={() => setMode('study')}
          aria-pressed={mode === 'study'}
        >
          <span className="panel-name">Study</span>
          <span className="panel-total">{fmt(studyToday)}</span>
        </button>

        <button
          type="button"
          className={`panel panel-leisure${mode === 'leisure' ? ' running' : ''}`}
          onClick={() => setMode('leisure')}
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
        <button type="button" className="control-btn" onClick={pause}>
          Pause
        </button>
        <button type="button" className="control-btn" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  )
}

export default App
