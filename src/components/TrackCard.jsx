// src/components/TrackCard.jsx
import { useState, useRef, useEffect } from 'react'
import { useSwipe } from '../hooks/useSwipe'
import { useLongPress } from '../hooks/useLongPress'
import Waveform from './Waveform'
import './TrackCard.css'

const ART_COLORS = ['#FF4D00', '#7B2FFF', '#CCFF00', '#2A2A2A', '#F2F2F2', '#0D0D0D', '#3D0099', '#CC3D00']

// Unique polygon clip per art slot
const ART_CLIPS = [
  'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)',
  'polygon(0% 8%, 100% 0%, 100% 92%, 0% 100%)',
  'polygon(0% 0%, 92% 8%, 100% 100%, 8% 92%)',
  'polygon(0% 0%, 100% 8%, 92% 100%, 0% 92%)',
  'polygon(8% 8%, 100% 0%, 92% 92%, 0% 100%)',
  'polygon(0% 0%, 92% 0%, 100% 92%, 8% 100%)',
  'polygon(4% 0%, 96% 4%, 100% 96%, 0% 100%)',
  'polygon(0% 4%, 100% 0%, 96% 100%, 4% 96%)',
]

const PREVIEW_DURATION = 30000

export default function TrackCard({
  track,
  index = 0,
  previewing = false,
  pinned = false,
  showPinLabel = false,
  onPreview,
  onPin,
  onSave,
}) {
  const [swiped, setSwiped] = useState(false)
  const timerRef = useRef(null)

  const swipe = useSwipe({
    onSwipeLeft:  () => setSwiped(true),
    onSwipeRight: () => setSwiped(false),
  })

  const longPress = useLongPress(() => onPin?.(track.name), 600)

  const color = ART_COLORS[index % ART_COLORS.length]
  const clip  = ART_CLIPS[index % ART_CLIPS.length]
  const textOnLight = color === '#CCFF00' || color === '#F2F2F2'

  const handleArtTap = (e) => {
    e.stopPropagation()
    onPreview?.(index)
  }

  return (
    <div className={`tc-wrapper${swiped ? ' tc-wrapper--swiped' : ''}`}>
      <div
        className={`track-card${previewing ? ' track-card--previewing' : ''}${pinned ? ' track-card--pinned' : ''}`}
        {...swipe}
        {...longPress}
      >
        {/* Album art — irregular SVG shape */}
        <div className="track-card__art-wrap" onClick={handleArtTap}>
          <div
            className="track-card__art"
            style={track.cover
              ? { backgroundImage: `url(${track.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', clipPath: clip }
              : { background: color, clipPath: clip }}
          />
          {previewing && (
            <svg className="track-card__progress-ring" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="#FF4D00"
                strokeWidth="2"
                strokeDasharray="125.7"
                strokeDashoffset="125.7"
                className="track-card__ring-fill"
              />
            </svg>
          )}
        </div>

        <div className="track-card__info">
          <p className="track-card__name">{track.name}</p>
          {previewing
            ? <Waveform speed="fast" bars={4} />
            : <p className="track-card__artist">{track.artist}</p>
          }
          {pinned && <span className="track-card__pinned-label">PINNED</span>}
        </div>

        <div className="track-card__meta">
          <span className="track-card__duration">{track.duration}</span>
          {showPinLabel && (
            <span className="track-card__pin-hint" onClick={(e) => { e.stopPropagation(); onPin?.(track.name) }}>
              PIN
            </span>
          )}
        </div>
      </div>

      <button
        className="tc-save-action"
        onClick={() => { onSave?.(); setSwiped(false) }}
      >
        SAVE
      </button>
    </div>
  )
}
