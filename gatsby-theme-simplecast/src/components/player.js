// by Wes Bos, syntax.fm
// https://github.com/wesbos/Syntax/blob/master/components/Player.js
/** @jsx jsx */
import { useRef, useState } from 'react'
import { FaPlay, FaPause } from "react-icons/fa"
import { jsx, Container, useThemeUI, Spinner } from "theme-ui"
import { keyframes } from "@emotion/react"
import formatTime from "../utils/formatTime"
import VisuallyHidden from "@reach/visually-hidden"
import { trackEvent } from '../utils'
// import VolumeBars from "./volumeBars"

const bounce = keyframes`
  from {
    transform: translateX(0)
  }
  to {
    transform: translateX(-200px)
  }
`

const Player = ({ episode }) => {
  const themeContext = useThemeUI()
  const { theme } = themeContext

  const adEndTime = 33
  const isBrowser = typeof window !== "undefined"
  const lp = isBrowser && localStorage.getItem(`lastPlayed${episode.number}`)
  const lastVolume = isBrowser && localStorage.getItem(`lastVolumeSetting`)
  const lastPlayed = lp ? JSON.parse(lp).lastPlayed : adEndTime
  const lastVolumePref = lastVolume ? JSON.parse(lastVolume).lastVolumePref : 1

  const audio = useRef(isBrowser && new Audio())
  const progress = useRef(isBrowser && HTMLDivElement)
  const [tooltipPosition, setTooltipPosition] = useState(adEndTime)
  const [tooltipTime, setTooltipTime] = useState(`0:${adEndTime}`)
  const [timeWasLoaded, setTimeWasLoaded] = useState(lastPlayed !== 0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [progressTime, setProgressTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(lastPlayed)
  const [currentVolume, setCurrentVolume] = useState(lastVolumePref)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  
  const timeUpdate = e => {
    // Check if the user already had a curent time
    const { currentTime: cTime = 0, duration: d = 0 } = audio.current
    const pTime = (cTime / d) * 100
    if (Number.isNaN(pTime)) return
    setProgressTime(pTime)
    setCurrentTime(cTime)
    setDuration(d)
    if (!timeWasLoaded) {
      localStorage.setItem(`lastPlayed${episode.number}`, JSON.stringify({ lastPlayed: cTime }))
    }
    setTimeWasLoaded(false)
  }
  
  const volumeUpdate = e => {
    // Check if the user already had a curent volume
    if (timeWasLoaded && lastVolume) {
      e.currentTarget.volume = JSON.parse(lastVolume).lastVolumePref
      setTimeWasLoaded(false)
    }
  }
  
  const groupUpdates = e => {
    if (lastPlayed) {
      audio.current.currentTime = lastPlayed
    }
    timeUpdate(e)
    volumeUpdate(e)
  }
  const playPause = () => {
    setPlaying(!audio.current.paused)
    const method = audio.current.paused ? "add" : "remove"
    // TODO: make el ref
    document.querySelector(".bars").classList[method]("bars--paused") // 💩
  }
  const togglePlay = async () => {
    setPlaying(false)
    const method = audio.current.paused ? "play" : "pause"
    await audio.current[method]()
    if (method === 'play') trackEvent(`play::${episode.title}`)
  }
  
  const scrubTime = e => (e.nativeEvent.offsetX / progress.current.offsetWidth) * audio.current.duration
  
  const scrub = e => {
    audio.current.currentTime = scrubTime(e)
  }
  
  const seekTime = e => {
    setTooltipPosition(e.nativeEvent.pageX + 20)
    setTooltipTime(formatTime(scrubTime(e)))
  }
  
  const volume = e => {
    audio.current.volume = e.currentTarget.value
    setCurrentVolume(e.currentTarget.value)
  }
  
  const speedUp = () => {
    audio.current.speed(0.25)
  }
  
  const speedDown = e => {
    e.preventDefault()
    audio.current.speed(-0.25)
  }

  if (!loading && playing && audio.current.paused) {
    togglePlay()
  }

  return (
    <div
      sx={{
        zIndex: 10,
        position: "fixed",
        width: "100%",
        color: "text",
        borderTop: "1px solid",
        borderColor: "backgroundLighten10",
        backgroundColor: "background",
        height: ["auto", 60],
        bottom: 0,
        left: 0,
        display: "flex",

        alignItems: "center",
      }}
      className="player"
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: ["column", "row"],
          alignItems: ["flex-start", "center"],
          justifyContent: ['center', 'flex-start'],
          px: ['15px', 'inherit'],
          pb: [2, "inherit"],
          pt: [0, "inherit"],
          maxWidth: 1200
        }}
      >
        <div
          sx={{
            width: "fit-content",
            margin: ['auto', 2],
            maxWidth: ["100%", 310],
            display: "flex",
            alignItems: "center",
            "*": {
              m: 0,
            },
          }}
        >
          <button
            tabIndex="0"
            sx={{
              backgroundImage: `linear-gradient(270deg, ${theme.colors.primaryLighten70} 20%, ${theme.colors.primaryDarken} 100%)`,
              color: "text",
              border: "none",
              width: "100%",
              maxWidth: 40,
              height: 40,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 1,
              cursor: "pointer",
              svg: {
                mt: "1px",
                ml: playing ? "0" : "2px",
              },
            }}
            onClick={togglePlay}
            aria-label={playing ? "pause" : `play ${episode.title}`}
            type="button"
          >
            <VisuallyHidden>{playing ? "Pause" : "Play"}</VisuallyHidden>{" "}
            {playing && loading
              ? <Spinner variant='styles.spinner'/>
              : playing
                ? <FaPause />
                : <FaPlay />}
          </button>
          <div
            sx={{
              pl: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: ["flex-start", "flex-end"],
              width: "100%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              height: 60,
              ".fade-out": {
                display: ["none", "block"],
                position: "absolute",
                zIndex: 999,
                width: 40,
                height: 60,
                backgroundImage:
                  `linear-gradient(270deg, ${theme.colors.background} 20%, rgba(26,34,50,0) 100%)`,
              },
              h3: {
                overflow: "hidden",
                position: "relative",
                fontSize: 4,
                display: "block",
              },
              ":hover": {
                h3: { animation: `${bounce} 5s linear infinite` },
              },
            }}
          >
            <h3>
              {episode.title} - EP{episode.number}
            </h3>
            <div className="fade-out" />
          </div>
        </div>

        <div
          sx={{
            ml: [0, 2],
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: ['center', 'flex-start'],
            maxWidth: 600,
            margin: 'auto',
            span: {
              fontVariantNumeric: "tabular-nums",
              width: ["auto", 50],
              fontSize: 1,
              textAlign: "center",
              opacity: 0.6,
            },
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <div
            sx={{
              mx: 2,
              height: [4, 2],
              flexGrow: "1",
              borderRadius: '5px',
              maxWidth: 460,
              backgroundColor: "backgroundLighten10",
            }}
            className="progress"
            onClick={scrub}
            onMouseMove={seekTime}
            onMouseEnter={() => {
              setShowTooltip(true)
            }}
            onMouseLeave={() => {
              setShowTooltip(false)
            }}
            ref={progress}
          >
            <div
              className="progress__time"
              sx={{
                width: `${progressTime}%`,
                backgroundImage: `linear-gradient(224deg, ${theme.colors.primaryLighten70} 0%, ${theme.colors.primaryDarken} 100%)`,
              }}
            />
          </div>
          <span>{formatTime(duration)}</span>
          <div
            style={{
              position: "absolute",
              left: `${tooltipPosition}px`,
              opacity: `${showTooltip ? "1" : "0"}`,
            }}
          >
            {tooltipTime}
          </div>
        </div>
        <audio
          ref={audio}
          onPlay={playPause}
          onPause={playPause}
          onTimeUpdate={timeUpdate}
          onVolumeChange={volumeUpdate}
          onLoadedMetadata={groupUpdates}
          onDurationChange={() => {setLoading(true)}}
          onEmptied={() => {setLoading(true)}}
          onCanPlay={() => {setLoading(false)}}
          src={episode.enclosure_url}
          preload='auto'
        />
      </Container>
    </div>
  )
  
}

export default Player
