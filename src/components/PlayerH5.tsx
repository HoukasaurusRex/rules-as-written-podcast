import { useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import H5AudioPlayer from 'react-h5-audio-player'

// CJS/ESM interop: the default export may be wrapped
const AudioPlayer = (H5AudioPlayer as unknown as { default: typeof H5AudioPlayer }).default ?? H5AudioPlayer
import 'react-h5-audio-player/lib/styles.css'
import './player-theme.css'
import '../styles/marquee.css'
import { $currentEpisode, $episodeList } from '../stores/episode'
import type { Episode } from '../utils/feed'

// Module-level playback state — survives React remounts across page navigations
let savedPlayback: { src: string; time: number; playing: boolean } | null = null

interface PlayerH5Props {
  initialEpisode?: Episode
  allEpisodes?: Episode[]
}

export default function PlayerH5({ initialEpisode, allEpisodes = [] }: PlayerH5Props) {
  const storeEpisode = useStore($currentEpisode)
  const episode = storeEpisode ?? initialEpisode ?? null
  const playerRef = useRef<InstanceType<typeof AudioPlayer>>(null)
  const lastSaveRef = useRef(0)
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('playerCollapsed') === 'true'
  )

  // Initialize stores from props or from PodcastLayout's injected data
  useEffect(() => {
    const init = (window as any).__PLAYER_INIT__ as { currentEpisode?: Episode; episodes?: Episode[] } | undefined
    const ep = initialEpisode ?? init?.currentEpisode
    const eps = allEpisodes.length ? allEpisodes : (init?.episodes ?? [])
    const current = $currentEpisode.get()
    if (ep && (!current || current.id !== ep.id)) $currentEpisode.set(ep)
    if (eps.length) $episodeList.set(eps)
  }, [initialEpisode, allEpisodes])

  // Re-sync episode list on navigation (but don't change current episode unless on a /show/ page)
  useEffect(() => {
    const handler = () => {
      const init = (window as any).__PLAYER_INIT__ as { currentEpisode?: Episode; episodes?: Episode[] } | undefined
      if (init?.episodes?.length) $episodeList.set(init.episodes)
      // Only auto-switch episode when navigating to an episode page
      const isEpisodePage = window.location.pathname.startsWith('/show/')
      const current = $currentEpisode.get()
      if (isEpisodePage && init?.currentEpisode && init.currentEpisode.id !== current?.id) {
        $currentEpisode.set(init.currentEpisode)
      }
    }
    document.addEventListener('astro:page-load', handler)
    return () => document.removeEventListener('astro:page-load', handler)
  }, [])

  // Save playback state before unmount (survives React remounts)
  useEffect(() => {
    return () => {
      const audio = playerRef.current?.audio?.current
      if (audio && audio.src) {
        savedPlayback = { src: audio.src, time: audio.currentTime, playing: !audio.paused }
      }
    }
  }, [])

  // Restore playback state after mount
  useEffect(() => {
    if (!savedPlayback || !episode) return
    const audio = playerRef.current?.audio?.current
    if (!audio) return
    // Wait for the audio element to be ready
    const restore = () => {
      if (audio.src.includes(episode.enclosure_url) || savedPlayback?.src.includes(episode.enclosure_url)) {
        audio.currentTime = savedPlayback!.time
        if (savedPlayback!.playing) audio.play().catch(() => {})
      }
      savedPlayback = null
    }
    if (audio.readyState >= 1) {
      restore()
    } else {
      audio.addEventListener('loadedmetadata', restore, { once: true })
    }
  }, [episode?.enclosure_url])

  // Play-episode event handler (from sidebar buttons)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Episode>).detail
      const current = $currentEpisode.get()
      if (current && current.id === detail.id) {
        const audio = playerRef.current?.audio?.current
        if (audio) audio.paused ? audio.play() : audio.pause()
      } else {
        // Clear saved playback so we don't restore old position for new episode
        savedPlayback = null
        $currentEpisode.set(detail)
      }
      setCollapsed(false)
      localStorage.setItem('playerCollapsed', 'false')
    }
    window.addEventListener('play-episode', handler)
    return () => window.removeEventListener('play-episode', handler)
  }, [])

  // Restore position and volume on episode change (from localStorage)
  useEffect(() => {
    if (!episode) return
    // Skip if we have saved playback state (handled by the restore effect above)
    if (savedPlayback) return
    const audio = playerRef.current?.audio?.current
    if (!audio) return
    const lp = localStorage.getItem(`lastPlayed${episode.number}`)
    if (lp) {
      const { lastPlayed } = JSON.parse(lp)
      if (lastPlayed) audio.currentTime = lastPlayed
    }
    const vol = localStorage.getItem('lastVolumeSetting')
    if (vol) {
      const { lastVolumePref } = JSON.parse(vol)
      if (lastVolumePref !== undefined) audio.volume = lastVolumePref
    }
  }, [episode?.number])

  // Next/prev navigation
  const episodes = useStore($episodeList)
  const currentIndex = episode ? episodes.findIndex((ep) => ep.id === episode.id) : -1

  const goToEpisode = (index: number) => {
    const target = episodes[index]
    if (target) {
      savedPlayback = null
      $currentEpisode.set(target)
      setTimeout(() => playerRef.current?.audio?.current?.play(), 100)
    }
  }

  const handleNext = () => {
    if (currentIndex > 0) goToEpisode(currentIndex - 1)
  }

  const handlePrevious = () => {
    if (currentIndex < episodes.length - 1) goToEpisode(currentIndex + 1)
  }

  // Throttled localStorage writes (~1s)
  const handleListen = (e: Event) => {
    if (!episode) return
    const now = Date.now()
    if (now - lastSaveRef.current < 1000) return
    lastSaveRef.current = now
    const audio = e.target as HTMLAudioElement
    localStorage.setItem(
      `lastPlayed${episode.number}`,
      JSON.stringify({ lastPlayed: audio.currentTime }),
    )
  }

  const handleVolumeChange = (e: Event) => {
    const audio = e.target as HTMLAudioElement
    localStorage.setItem('lastVolumeSetting', JSON.stringify({ lastVolumePref: audio.volume }))
  }

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('playerCollapsed', String(next))
  }

  if (!episode) return null

  const title = `${episode.title} - EP${episode.number}`

  return (
    <div className="player" style={{
      zIndex: 10,
      position: 'fixed',
      width: '100%',
      bottom: 0,
      left: 0,
      backgroundColor: 'var(--color-bg)',
      borderTop: '1px solid var(--color-bg-lighten-10)',
      color: 'var(--color-text)',
    }}>
      <button
        onClick={toggleCollapse}
        aria-label={collapsed ? 'Expand player' : 'Collapse player'}
        type="button"
        style={{
          position: 'absolute',
          top: -24,
          right: 16,
          width: 32,
          height: 24,
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-bg-lighten-10)',
          borderBottom: 'none',
          borderRadius: '4px 4px 0 0',
          color: 'var(--color-text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
      </button>

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: collapsed ? 'none' : 'flex',
        alignItems: 'center',
        padding: '8px 16px',
      }}>
        <div style={{ maxWidth: 310, flexShrink: 0 }} className="player-title marquee marquee--scroll">
          <h3 className="marquee-inner" style={{ margin: 0, fontSize: 'var(--font-size-4)' }}>
            {title}
            <span aria-hidden="true">{` ${title}`}</span>
          </h3>
        </div>
        <AudioPlayer
          ref={playerRef}
          src={episode.enclosure_url}
          showSkipControls={episodes.length > 1}
          showJumpControls={false}
          customAdditionalControls={[]}
          layout="horizontal-reverse"
          onClickNext={handleNext}
          onClickPrevious={handlePrevious}
          onListen={handleListen}
          onVolumeChange={handleVolumeChange}
          onPlay={() => document.querySelector('.bars')?.classList.remove('bars--paused')}
          onPause={() => document.querySelector('.bars')?.classList.add('bars--paused')}
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            color: 'var(--color-text)',
          }}
        />
      </div>
    </div>
  )
}
