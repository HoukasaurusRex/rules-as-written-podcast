import { useEffect, useRef, useState, useCallback } from 'react'
import { FireEffect, type FirePhase } from './fire-particles'

export function useFireEffect(
  wrapperRef: React.RefObject<HTMLElement | null>,
  trigger: boolean,
) {
  const [phase, setPhase] = useState<FirePhase | null>(null)
  const [isActive, setIsActive] = useState(false)
  const effectRef = useRef<FireEffect | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const cleanup = useCallback(() => {
    effectRef.current?.destroy()
    effectRef.current = null
    if (canvasRef.current?.parentNode) {
      canvasRef.current.parentNode.removeChild(canvasRef.current)
    }
    canvasRef.current = null
    setIsActive(false)
    setPhase(null)
  }, [])

  useEffect(() => {
    if (!trigger || !wrapperRef.current) return

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Skip fire, go straight to complete
      setPhase(4)
      setIsActive(false)
      return
    }

    const wrapper = wrapperRef.current

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;border-radius:inherit;'
    wrapper.appendChild(canvas)
    canvasRef.current = canvas

    // Create and start effect
    const effect = new FireEffect()
    effectRef.current = effect

    effect.onPhaseChange((p) => setPhase(p))
    effect.onComplete(() => {
      cleanup()
    })

    setIsActive(true)
    effect.start(canvas)

    return cleanup
  }, [trigger, wrapperRef, cleanup])

  return { phase, isActive }
}
