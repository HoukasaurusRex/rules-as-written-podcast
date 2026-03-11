import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import './player-theme.css'
import '../styles/marquee.css'
import { $currentEpisode, $episodeList } from '../stores/episode'
import type { Episode } from '../utils/feed'
import formatTime from '../utils/formatTime'

// Module-level — persists across React remounts and page navigations
const audio = typeof window !== 'undefined' ? new Audio() : (null as unknown as HTMLAudioElement)
if (audio) audio.preload = 'auto'
let currentSrc = '' // tracks which src is loaded, survives remounts

interface PlayerProps {
  initialEpisode?: Episode
  allEpisodes?: Episode[]
}

export default function Player({ initialEpisode, allEpisodes = [] }: PlayerProps) {
  const storeEpisode = useStore($currentEpisode)
  const episode = storeEpisode ?? initialEpisode ?? null
  const progressRef = useRef<HTMLDivElement>(null)
  const lastSaveRef = useRef(0)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('playerCollapsed') === 'true'
  )

  // Initialize stores
  useEffect(() => {
    const init = (window as any).__PLAYER_INIT__ as { currentEpisode?: Episode; episodes?: Episode[] } | undefined
    const ep = initialEpisode ?? init?.currentEpisode
    const eps = allEpisodes.length ? allEpisodes : (init?.episodes ?? [])
    const current = $currentEpisode.get()
    if (ep && (!current || current.id !== ep.id)) $currentEpisode.set(ep)
    if (eps.length) $episodeList.set(eps)
  }, [initialEpisode, allEpisodes])

  // Re-sync on navigation
  useEffect(() => {
    const handler = () => {
      const init = (window as any).__PLAYER_INIT__ as { currentEpisode?: Episode; episodes?: Episode[] } | undefined
      if (init?.episodes?.length) $episodeList.set(init.episodes)
      const isEpisodePage = window.location.pathname.startsWith('/show/')
      const current = $currentEpisode.get()
      if (isEpisodePage && init?.currentEpisode && init.currentEpisode.id !== current?.id) {
        $currentEpisode.set(init.currentEpisode)
      }
    }
    document.addEventListener('astro:page-load', handler)
    return () => document.removeEventListener('astro:page-load', handler)
  }, [])

  // Sync audio element with episode — only change src when episode actually changes
  useEffect(() => {
    if (!episode || !audio) return
    // Check both module-level tracker AND the audio element's actual src
    if (currentSrc === episode.enclosure_url || audio.src === episode.enclosure_url) {
      currentSrc = episode.enclosure_url
      return
    }
    currentSrc = episode.enclosure_url
    audio.src = episode.enclosure_url

    // Restore position from localStorage for new episodes
    const lp = localStorage.getItem(`lastPlayed${episode.number}`)
    if (lp) {
      const { lastPlayed } = JSON.parse(lp)
      if (lastPlayed) {
        audio.addEventListener('loadedmetadata', () => { audio.currentTime = lastPlayed }, { once: true })
      }
    }
  }, [episode?.enclosure_url])

  // Restore volume on first mount
  useEffect(() => {
    if (!audio) return
    const vol = localStorage.getItem('lastVolumeSetting')
    if (vol) {
      const { lastVolumePref } = JSON.parse(vol)
      if (lastVolumePref !== undefined) {
        audio.volume = lastVolumePref
        setVolume(lastVolumePref)
      }
    }
  }, [])

  // Detect marquee overflow for player title
  const titleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const inner = el.querySelector('.marquee-inner') as HTMLElement
    if (inner && inner.scrollWidth > el.clientWidth) {
      el.classList.add('is-overflowing')
    } else {
      el.classList.remove('is-overflowing')
    }
  }, [episode?.title])

  // Sync React state with audio events
  useEffect(() => {
    if (!audio) return
    const onPlay = () => {
      setPlaying(true)
      document.querySelector('.bars')?.classList.remove('bars--paused')
    }
    const onPause = () => {
      setPlaying(false)
      document.querySelector('.bars')?.classList.add('bars--paused')
    }
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      // Throttled localStorage save (~1s)
      const now = Date.now()
      if (now - lastSaveRef.current >= 1000 && $currentEpisode.get()) {
        lastSaveRef.current = now
        const ep = $currentEpisode.get()!
        localStorage.setItem(`lastPlayed${ep.number}`, JSON.stringify({ lastPlayed: audio.currentTime }))
      }
    }
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onVolumeChange = () => {
      setVolume(audio.volume)
      localStorage.setItem('lastVolumeSetting', JSON.stringify({ lastVolumePref: audio.volume }))
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('volumechange', onVolumeChange)

    // Sync initial state (audio may already be playing from before remount)
    setPlaying(!audio.paused)
    setCurrentTime(audio.currentTime)
    setDuration(audio.duration || 0)
    setVolume(audio.volume)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('volumechange', onVolumeChange)
    }
  }, [])

  // Play-episode event from sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Episode>).detail
      const current = $currentEpisode.get()
      if (current && current.id === detail.id) {
        audio.paused ? audio.play() : audio.pause()
      } else {
        $currentEpisode.set(detail)
        // src change handled by the sync effect above, then auto-play
        requestAnimationFrame(() => audio.play().catch(() => {}))
      }
      setCollapsed(false)
      localStorage.setItem('playerCollapsed', 'false')
    }
    window.addEventListener('play-episode', handler)
    return () => window.removeEventListener('play-episode', handler)
  }, [])

  // Next/prev
  const episodes = useStore($episodeList)
  const currentIndex = episode ? episodes.findIndex((ep) => ep.id === episode.id) : -1

  const goToEpisode = useCallback((index: number) => {
    const target = episodes[index]
    if (target) {
      $currentEpisode.set(target)
      requestAnimationFrame(() => audio.play().catch(() => {}))
    }
  }, [episodes])

  const handleNext = () => { if (currentIndex > 0) goToEpisode(currentIndex - 1) }
  const handlePrev = () => { if (currentIndex < episodes.length - 1) goToEpisode(currentIndex + 1) }

  const togglePlay = () => { audio.paused ? audio.play() : audio.pause() }

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }

  const changeVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    audio.volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  }

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('playerCollapsed', String(next))
  }

  if (!episode) return null

  const progress = duration ? (currentTime / duration) * 100 : 0
  const title = `${episode.title} - EP${episode.number}`
  const hasSkip = episodes.length > 1

  return (
    <div className="player-bar">
      {/* Collapse toggle */}
      <button onClick={toggleCollapse} className="player-collapse-btn" aria-label={collapsed ? 'Expand player' : 'Collapse player'} type="button">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className={`player-collapse-icon ${collapsed ? 'player-collapse-icon--flipped' : ''}`}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
      </button>

      {/* Player content */}
      <div className={`player-content ${collapsed ? 'player-content--collapsed' : ''}`}>
        {/* Title (hidden on mobile) */}
        <div ref={titleRef} className="player-title marquee marquee--scroll" style={{ maxWidth: 310, flexShrink: 0 }}>
          <h3 className="marquee-inner" style={{ margin: 0, fontSize: 'var(--font-size-4)' }}>
            {title}
            <span aria-hidden="true">{` ${title}`}</span>
          </h3>
        </div>

        {/* Controls */}
        <div className="player-controls">
          {/* Main controls: prev, play/pause, next */}
          <div className="player-main-controls">
            {hasSkip && (
              <button onClick={handlePrev} className="player-skip-btn" aria-label="Previous" type="button" disabled={currentIndex >= episodes.length - 1}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
            )}
            <button onClick={togglePlay} className="player-play-btn" aria-label={playing ? 'Pause' : 'Play'} type="button">
              {playing ? (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            {hasSkip && (
              <button onClick={handleNext} className="player-skip-btn" aria-label="Next" type="button" disabled={currentIndex <= 0}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            )}
          </div>

          {/* Progress section */}
          <div className="player-progress-section">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div className="player-progress-bar" ref={progressRef} onClick={scrub}>
              <div className="player-progress-filled" style={{ width: `${progress}%` }} />
              <div className="player-progress-indicator" style={{ left: `${progress}%` }} />
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>

          {/* Volume */}
          <div className="player-volume">
            <button className="player-volume-btn" type="button" onClick={() => { audio.volume = audio.volume > 0 ? 0 : 1 }} aria-label="Mute">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                {volume === 0
                  ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                }
              </svg>
            </button>
            <div className="player-volume-bar" onClick={changeVolume}>
              <div className="player-volume-filled" style={{ width: `${volume * 100}%` }} />
              <div className="player-volume-indicator" style={{ left: `${volume * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
