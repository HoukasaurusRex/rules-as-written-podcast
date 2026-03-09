interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

export type FirePhase = 1 | 2 | 3 | 4

const COLORS = ['#FF6B35', '#FF4500', '#FF8C00', '#FFD700', '#FFA500', '#CC3300']

const PHASE_DURATIONS: Record<FirePhase, number> = {
  1: 400,
  2: 800,
  3: 800,
  4: 1000,
}

export class FireEffect {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private particles: Particle[] = []
  private phase: FirePhase = 1
  private phaseStart = 0
  private startTime = 0
  private rafId = 0
  private onPhaseChangeCb: ((phase: FirePhase) => void) | null = null
  private onCompleteCb: (() => void) | null = null
  private isMobile: boolean
  private width = 0
  private height = 0

  constructor() {
    this.isMobile =
      typeof window !== 'undefined' &&
      (window.matchMedia('(max-width: 768px)').matches || navigator.hardwareConcurrency < 4)
  }

  onPhaseChange(cb: (phase: FirePhase) => void) {
    this.onPhaseChangeCb = cb
  }

  onComplete(cb: () => void) {
    this.onCompleteCb = cb
  }

  start(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    if (!this.ctx) return

    this.width = canvas.offsetWidth
    this.height = canvas.offsetHeight
    canvas.width = this.width
    canvas.height = this.height

    this.particles = []
    this.phase = 1
    this.startTime = performance.now()
    this.phaseStart = this.startTime
    this.onPhaseChangeCb?.(1)

    this.loop(this.startTime)
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
    this.particles = []
    this.ctx = null
    this.canvas = null
    this.onPhaseChangeCb = null
    this.onCompleteCb = null
  }

  private loop = (now: number) => {
    if (!this.ctx || !this.canvas) return

    const phaseElapsed = now - this.phaseStart
    const phaseDuration = PHASE_DURATIONS[this.phase]

    // Advance phase
    if (phaseElapsed >= phaseDuration && this.phase < 4) {
      this.phase = (this.phase + 1) as FirePhase
      this.phaseStart = now
      this.onPhaseChangeCb?.(this.phase)
    }

    // Spawn particles
    this.spawn()

    // Update particles
    this.update()

    // Draw
    this.draw()

    // Check completion: phase 4 done and no particles left
    if (this.phase === 4 && now - this.phaseStart > PHASE_DURATIONS[4] && this.particles.length === 0) {
      this.onCompleteCb?.()
      return
    }

    this.rafId = requestAnimationFrame(this.loop)
  }

  private spawn() {
    const maxPerFrame = this.isMobile ? 15 : 30
    let count = 0

    switch (this.phase) {
      case 1:
        // No particles in warm-up
        break
      case 2:
        // Spawn from bottom edge
        count = Math.min(maxPerFrame, this.isMobile ? 5 : 12)
        for (let i = 0; i < count; i++) {
          this.particles.push(this.createParticle(
            Math.random() * this.width,
            this.height + Math.random() * 5,
            (Math.random() - 0.5) * 2,
            -(2 + Math.random() * 3),
          ))
        }
        break
      case 3:
        // Spawn from all edges
        count = Math.min(maxPerFrame, this.isMobile ? 10 : 25)
        for (let i = 0; i < count; i++) {
          const edge = Math.random()
          let x: number, y: number, vx: number, vy: number
          if (edge < 0.5) {
            // Bottom
            x = Math.random() * this.width
            y = this.height + Math.random() * 5
            vx = (Math.random() - 0.5) * 3
            vy = -(3 + Math.random() * 4)
          } else if (edge < 0.7) {
            // Left
            x = -Math.random() * 5
            y = this.height * (0.3 + Math.random() * 0.7)
            vx = 1 + Math.random() * 2
            vy = -(1 + Math.random() * 3)
          } else if (edge < 0.9) {
            // Right
            x = this.width + Math.random() * 5
            y = this.height * (0.3 + Math.random() * 0.7)
            vx = -(1 + Math.random() * 2)
            vy = -(1 + Math.random() * 3)
          } else {
            // Interior (embers rising from within)
            x = this.width * (0.1 + Math.random() * 0.8)
            y = this.height * (0.4 + Math.random() * 0.6)
            vx = (Math.random() - 0.5) * 2
            vy = -(2 + Math.random() * 3)
          }
          this.particles.push(this.createParticle(x, y, vx, vy))
        }
        break
      case 4:
        // No new spawns — let existing particles die
        break
    }
  }

  private createParticle(x: number, y: number, vx: number, vy: number): Particle {
    return {
      x, y, vx, vy,
      size: 2 + Math.random() * 6,
      opacity: 0.6 + Math.random() * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: 30 + Math.random() * 40,
    }
  }

  private update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life++
      p.x += p.vx
      p.y += p.vy

      // Slight turbulence
      p.vx += (Math.random() - 0.5) * 0.3
      // Flames rise and decelerate
      p.vy *= 0.98

      // Fade out over lifetime
      const lifeRatio = p.life / p.maxLife
      p.opacity = Math.max(0, (1 - lifeRatio) * 0.9)
      p.size *= 0.995

      if (p.life >= p.maxLife || p.opacity <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  private draw() {
    const ctx = this.ctx!
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.globalCompositeOperation = 'lighter'

    for (const p of this.particles) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
      gradient.addColorStop(0, p.color)
      gradient.addColorStop(1, 'transparent')

      ctx.globalAlpha = p.opacity
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }
}
