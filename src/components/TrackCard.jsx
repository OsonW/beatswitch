import { useState } from 'react'
import { useSwipe } from '../hooks/useSwipe'
import Waveform from './Waveform'
import './TrackCard.css'

const ART_GRADIENTS = [
  'linear-gradient(135deg, #FF6B35, #A259FF)',
  'linear-gradient(135deg, #C8FF00, #00D4AA)',
  'linear-gradient(135deg, #A259FF, #4B0082)',
  'linear-gradient(135deg, #FF6B9D, #FF6B35)',
  'linear-gradient(135deg, #FFB347, #C8FF00)',
]

export default function TrackCard({ track, index = 0, playing = false, onSave }) {
  const [swiped, setSwiped] = useState(false)
  const [liked, setLiked] = useState(false)

  const swipe = useSwipe({
    onSwipeLeft:  () => setSwiped(true),
    onSwipeRight: () => setSwiped(false),
  })

  const gradient = ART_GRADIENTS[index % ART_GRADIENTS.length]

  return (
    <div className={`tc-wrapper${swiped ? ' tc-wrapper--swiped' : ''}`}>
      <div
        className={`track-card${playing ? ' track-card--playing' : ''}`}
        {...swipe}
      >
        {playing && <div className="track-card__bar" />}
        <div className="track-card__art" style={{ background: gradient }} />
        <div className="track-card__info">
          <p className={`track-card__name${playing ? ' track-card__name--playing' : ''}`}>
            {track.name}
          </p>
          {playing && <Waveform speed="fast" bars={4} />}
          {!playing && <p className="track-card__artist">{track.artist}</p>}
        </div>
        <div className="track-card__meta">
          <span className="track-card__duration">{track.duration}</span>
          <button
            className={`track-card__heart${liked ? ' track-card__heart--liked' : ''}`}
            onClick={() => setLiked(l => !l)}
          >
            ♥
          </button>
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
