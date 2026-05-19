import { useState } from 'react'
import './VibeCard.css'

const VIBE_DATA = {
  HYPE:         { emoji: '🔥', back: 'pure energy released',   gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF9500 100%)' },
  MELANCHOLIC:  { emoji: '🌙', back: 'beautifully broken',     gradient: 'linear-gradient(135deg, #A259FF 0%, #1A1A3E 100%)' },
  FOCUS:        { emoji: '🎯', back: 'locked in flow',         gradient: 'linear-gradient(135deg, #C8FF00 0%, #00D4AA 100%)' },
  'LATE NIGHT': { emoji: '🌃', back: 'city lights & silence',  gradient: 'linear-gradient(135deg, #4B0082 0%, #0A0A0A 100%)' },
  HEARTBREAK:   { emoji: '💔', back: 'feels that heal',        gradient: 'linear-gradient(135deg, #FF6B9D 0%, #A259FF 100%)' },
  'ROAD TRIP':  { emoji: '🚗', back: 'windows down, no plans', gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 100%)' },
}

export default function VibeCard({ vibe, active = false, onSelect }) {
  const [flipped, setFlipped] = useState(false)
  const { emoji, back, gradient } = VIBE_DATA[vibe] ?? VIBE_DATA.HYPE

  const handleTap = () => {
    setFlipped(f => !f)
    onSelect?.(vibe)
  }

  return (
    <div
      className={`vibe-card${flipped ? ' vibe-card--flipped' : ''}${active ? ' vibe-card--active' : ''}`}
      style={{ '--vc-gradient': gradient }}
      onClick={handleTap}
    >
      <div className="vibe-card__inner">
        <div className="vibe-card__front">
          <span className="vibe-card__emoji">{emoji}</span>
          <span className="vibe-card__label">{vibe}</span>
        </div>
        <div className="vibe-card__back">
          <span className="vibe-card__desc">{back}</span>
        </div>
      </div>
    </div>
  )
}
