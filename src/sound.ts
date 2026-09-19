let ctx: AudioContext | null = null

/** Synthesised button thud. Created lazily so it starts inside a user gesture. */
export function playThud(kind: 'heavy' | 'light' = 'heavy') {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()

    const heavy = kind === 'heavy'
    const t = ctx.currentTime

    // Low body: a sine that drops in pitch.
    const osc = ctx.createOscillator()
    const body = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(heavy ? 170 : 260, t)
    osc.frequency.exponentialRampToValueAtTime(heavy ? 45 : 90, t + 0.12)
    body.gain.setValueAtTime(heavy ? 0.7 : 0.35, t)
    body.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.24 : 0.13))
    osc.connect(body).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.3)

    // Short filtered noise burst for the "clack" of the impact.
    const len = Math.floor(ctx.sampleRate * 0.03)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    const lp = ctx.createBiquadFilter()
    const click = ctx.createGain()
    noise.buffer = buf
    lp.type = 'lowpass'
    lp.frequency.value = heavy ? 1400 : 2400
    click.gain.setValueAtTime(heavy ? 0.35 : 0.2, t)
    click.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
    noise.connect(lp).connect(click).connect(ctx.destination)
    noise.start(t)
  } catch {
    // Audio unavailable; the visual press still works.
  }
}
