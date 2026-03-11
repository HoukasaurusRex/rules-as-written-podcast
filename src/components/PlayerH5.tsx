import { useEffect, useRef } from 'react'
import { useStore } from '@nanostores/react'
import H5AudioPlayer from 'react-h5-audio-player'

// CJS/ESM interop: the default export may be wrapped
const AudioPlayer = (H5AudioPlayer as unknown as { default: typeof H5AudioPlayer }).default ?? H5AudioPlayer
import 'react-h5-audio-player/lib/styles.css'
import './player-theme.css'
import '../styles/marquee.css'
import { $currentEpisode, $episodeList } from '../stores/episode'
import type { Episode } from '../utils/feed'

interface PlayerH5Props {
  initialEpisode: Episode
  allEpisodes?: Episode[]
}

export default function PlayerH5({ initialEpisode, allEpisodes = [] }: PlayerH5Props) {
  const episode = useStore($currentEpisode) ?? initialEpisode
  const playerRef = useRef<InstanceType<typeof AudioPlayer>>(null)
  const lastSaveRef = useRef(0)

  // Initialize stores
  useEffect(() => {
    if (!$currentEpisode.get()) $currentEpisode.set(initialEpisode)
    if (allEpisodes.length) $episodeList.set(allEpisodes)
  }, [initialEpisode, allEpisodes])

  // Play-episode event handler (from sidebar buttons)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Episode>).detail
      const current = $currentEpisode.get()
      if (current && current.id === detail.id) {
        const audio = playerRef.current?.audio?.current
        if (audio) audio.paused ? audio.play() : audio.pause()
      } else {
        $currentEpisode.set(detail)
      }
    }
    window.addEventListener('play-episode', handler)
    return () => window.removeEventListener('play-episode', handler)
  }, [])

  // Restore position and volume on episode change
  useEffect(() => {
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
  }, [episode.number])

  // Next/prev navigation
  const episodes = useStore($episodeList)
  const currentIndex = episodes.findIndex((ep) => ep.id === episode.id)

  const goToEpisode = (index: number) => {
    const target = episodes[index]
    if (target) {
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
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '8px 16px' }}>
        <div style={{ maxWidth: 310, flexShrink: 0 }} className="marquee marquee--scroll">
          <h3 className="marquee-inner" style={{ margin: 0, fontSize: 'var(--font-size-4)', gap: '3rem', display: 'inline-flex' }}>
            <span>{title}</span>
            <span aria-hidden="true">{title}</span>
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
