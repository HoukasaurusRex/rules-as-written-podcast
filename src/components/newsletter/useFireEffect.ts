import { useEffect, useState, useCallback, useRef, type ReactNode, createElement, Suspense, lazy } from 'react'

const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then(m => ({ default: m.DotLottieReact }))
)

// Must be >= animation duration (fire-d.lottie is 1.3s at 24fps)
const FIRE_DURATION = 1500
const WARMUP_DURATION = 400

export function useFireEffect(trigger: boolean) {
  const [isActive, setIsActive] = useState(false)
  const [showFlame, setShowFlame] = useState(false)
  const [warmup, setWarmup] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => {
    if (!trigger) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsActive(false)
      return
    }

    setIsActive(true)
    setWarmup(true)

    schedule(() => {
      setWarmup(false)
      setShowFlame(true)
    }, WARMUP_DURATION)

    schedule(() => {
      setShowFlame(false)
      setIsActive(false)
    }, WARMUP_DURATION + FIRE_DURATION)

    return clearTimers
  }, [trigger, schedule, clearTimers])

  const phase = warmup ? 1 : showFlame ? 2 : null

  let FireOverlay: ReactNode = null
  if (showFlame) {
    FireOverlay = createElement(
      Suspense,
      { fallback: null },
      createElement(
        'div',
        { className: 'newsletter-fire' },
        createElement(
          'div',
          { className: 'newsletter-flame newsletter-flame--active' },
          createElement(DotLottieReact, {
            src: '/animations/fire-d.lottie',
            loop: false,
            autoplay: true,
            style: { width: '100%', height: '100%' },
          })
        )
      )
    )
  }

  return { phase, isActive, FireOverlay }
}
