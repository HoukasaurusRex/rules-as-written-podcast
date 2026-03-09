import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { $currentEpisode } from '../stores/episode'
import type { Episode } from '../utils/feed'

export default function PlayerH5({ initialEpisode }: { initialEpisode: Episode }) {
  const episode = useStore($currentEpisode) ?? initialEpisode

  useEffect(() => {
    if (!$currentEpisode.get()) {
      $currentEpisode.set(initialEpisode)
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Episode>).detail
      $currentEpisode.set(detail)
    }
    window.addEventListener('play-episode', handler)
    return () => window.removeEventListener('play-episode', handler)
  }, [initialEpisode])

  // Restore last played position
  useEffect(() => {
    const lp = localStorage.getItem(`lastPlayed${episode.number}`)
    if (lp) {
      const { lastPlayed } = JSON.parse(lp)
      const audio = document.querySelector('.rhap_container audio') as HTMLAudioElement | null
      if (audio && lastPlayed) {
        audio.currentTime = lastPlayed
      }
    }
  }, [episode.number])

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
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        <div style={{ padding: '0 8px', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 310 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-4)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {episode.title} - EP{episode.number}
          </h3>
        </div>
        <AudioPlayer
          src={episode.enclosure_url}
          showJumpControls={false}
          customAdditionalControls={[]}
          layout="horizontal-reverse"
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            color: 'var(--color-text)',
          }}
          onListen={(e) => {
            const audio = e.target as HTMLAudioElement
            localStorage.setItem(
              `lastPlayed${episode.number}`,
              JSON.stringify({ lastPlayed: audio.currentTime }),
            )
          }}
        />
      </div>
    </div>
  )
}
