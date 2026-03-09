import { useRef, useState, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $currentEpisode } from '../stores/episode'
import formatTime from '../utils/formatTime'
import type { Episode } from '../utils/feed'

export default function PlayerCustom({ initialEpisode }: { initialEpisode: Episode }) {
  const episode = useStore($currentEpisode) ?? initialEpisode

  const isBrowser = typeof window !== 'undefined'
  const adEndTime = 0
  const lp = isBrowser ? localStorage.getItem(`lastPlayed${episode.number}`) : null
  const lastVolume = isBrowser ? localStorage.getItem('lastVolumeSetting') : null
  const lastPlayed = lp ? JSON.parse(lp).lastPlayed : adEndTime
  const audio = useRef<HTMLAudioElement>(isBrowser ? new Audio() : (null as unknown as HTMLAudioElement))
  const progress = useRef<HTMLDivElement>(null)
  const [timeWasLoaded, setTimeWasLoaded] = useState(lastPlayed !== 0)
  const [progressTime, setProgressTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(lastPlayed)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!$currentEpisode.get()) {
      $currentEpisode.set(initialEpisode)
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Episode>).detail
      $currentEpisode.set(detail)
      // Auto-play when triggered from header or nav play buttons
      requestAnimationFrame(() => {
        audio.current.src = detail.enclosure_url
        audio.current.play().catch(() => {})
      })
    }
    window.addEventListener('play-episode', handler)
    return () => window.removeEventListener('play-episode', handler)
  }, [initialEpisode])

  useEffect(() => {
    audio.current.src = episode.enclosure_url
    audio.current.preload = 'auto'
  }, [episode.enclosure_url])

  const timeUpdate = () => {
    const { currentTime: cTime = 0, duration: d = 0 } = audio.current
    const pTime = (cTime / d) * 100
    if (Number.isNaN(pTime)) return
    setProgressTime(pTime)
    setCurrentTime(cTime)
    setDuration(d)
    if (!timeWasLoaded) {
      localStorage.setItem(
        `lastPlayed${episode.number}`,
        JSON.stringify({ lastPlayed: cTime }),
      )
    }
    setTimeWasLoaded(false)
  }

  const volumeUpdate = (e: Event) => {
    if (timeWasLoaded && lastVolume) {
      ;(e.currentTarget as HTMLAudioElement).volume = JSON.parse(lastVolume).lastVolumePref
      setTimeWasLoaded(false)
    }
  }

  const groupUpdates = (e: Event) => {
    if (lastPlayed) {
      audio.current.currentTime = lastPlayed
    }
    timeUpdate()
    volumeUpdate(e)
  }

  const playPause = () => {
    setPlaying(!audio.current.paused)
    const method = audio.current.paused ? 'add' : 'remove'
    document.querySelector('.bars')?.classList[method]('bars--paused')
  }

  const togglePlay = async () => {
    setPlaying(false)
    const method = audio.current.paused ? 'play' : 'pause'
    await audio.current[method]()
  }

  const scrubTime = (e: React.MouseEvent<HTMLDivElement>) =>
    (e.nativeEvent.offsetX / (progress.current?.offsetWidth ?? 1)) * audio.current.duration

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    audio.current.currentTime = scrubTime(e)
  }

  useEffect(() => {
    const el = audio.current
    el.addEventListener('play', playPause)
    el.addEventListener('pause', playPause)
    el.addEventListener('timeupdate', timeUpdate)
    el.addEventListener('volumechange', volumeUpdate)
    el.addEventListener('loadedmetadata', groupUpdates)
    el.addEventListener('durationchange', () => setLoading(true))
    el.addEventListener('emptied', () => setLoading(true))
    el.addEventListener('canplay', () => setLoading(false))

    return () => {
      el.removeEventListener('play', playPause)
      el.removeEventListener('pause', playPause)
      el.removeEventListener('timeupdate', timeUpdate)
      el.removeEventListener('volumechange', volumeUpdate)
      el.removeEventListener('loadedmetadata', groupUpdates)
    }
  }, [])

  if (!loading && playing && audio.current.paused) {
    togglePlay()
  }

  return (
    <div
      className="player"
      style={{
        zIndex: 10,
        position: 'fixed',
        width: '100%',
        color: 'var(--color-text)',
        borderTop: '1px solid var(--color-bg-lighten-10)',
        backgroundColor: 'var(--color-bg)',
        height: 'auto',
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 15px 8px',
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px' }}>
          <button
            onClick={togglePlay}
            aria-label={playing ? 'pause' : `play ${episode.title}`}
            type="button"
            style={{
              backgroundImage: `linear-gradient(270deg, var(--color-primary-lighten-70) 20%, var(--color-primary-darken) 100%)`,
              color: 'var(--color-text)',
              border: 'none',
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span className="sr-only">{playing ? 'Pause' : 'Play'}</span>
            {playing ? (
              <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor">
                <path d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z" />
              </svg>
            ) : (
              <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor">
                <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
              </svg>
            )}
          </button>
          <div style={{ paddingLeft: 16, overflow: 'hidden', whiteSpace: 'nowrap', height: 60, display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-4)', overflow: 'hidden' }}>
              {episode.title} - EP{episode.number}
            </h3>
          </div>
        </div>

        <div style={{ marginLeft: 8, width: '100%', display: 'flex', alignItems: 'center', maxWidth: 600, margin: '0 auto' }}>
          <span style={{ fontVariantNumeric: 'tabular-nums', width: 50, fontSize: 'var(--font-size-1)', textAlign: 'center', opacity: 0.6 }}>
            {formatTime(currentTime)}
          </span>
          <div
            className="progress"
            onClick={scrub}
            ref={progress}
            style={{
              margin: '0 8px',
              height: 2,
              flexGrow: 1,
              borderRadius: 5,
              maxWidth: 460,
              backgroundColor: 'var(--color-bg-lighten-10)',
            }}
          >
            <div
              className="progress__time"
              style={{
                width: `${progressTime}%`,
                backgroundImage: `linear-gradient(224deg, var(--color-primary-lighten-70) 0%, var(--color-primary-darken) 100%)`,
              }}
            />
          </div>
          <span style={{ fontVariantNumeric: 'tabular-nums', width: 50, fontSize: 'var(--font-size-1)', textAlign: 'center', opacity: 0.6 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
