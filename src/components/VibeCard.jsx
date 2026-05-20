import './VibeCard.css'

const VIBE_COLORS = {
  HYPE:         { bg: '#FF4D00', text: '#080808' },
  MELANCHOLIC:  { bg: '#7B2FFF', text: '#F2F2F2' },
  FOCUS:        { bg: '#CCFF00', text: '#080808' },
  'LATE NIGHT': { bg: '#111111', text: '#F2F2F2' },
  HEARTBREAK:   { bg: '#3D0099', text: '#F2F2F2' },
  'ROAD TRIP':  { bg: '#CC3D00', text: '#080808' },
}

const CLIP_PATHS = [
  'polygon(0% 4%, 96% 0%, 100% 96%, 4% 100%)',
  'polygon(4% 0%, 100% 3%, 96% 100%, 0% 97%)',
  'polygon(0% 0%, 97% 4%, 100% 100%, 3% 96%)',
  'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)',
  'polygon(0% 3%, 98% 0%, 100% 97%, 2% 100%)',
  'polygon(2% 0%, 100% 2%, 98% 100%, 0% 98%)',
]

const VIBE_KEYS = Object.keys(VIBE_COLORS)

export default function VibeCard({ vibe, selected = false, onSelect }) {
  const { bg, text } = VIBE_COLORS[vibe] ?? { bg: '#2A2A2A', text: '#F2F2F2' }
  const clipIndex = VIBE_KEYS.indexOf(vibe) % CLIP_PATHS.length
  const clipPath = CLIP_PATHS[clipIndex]

  return (
    <button
      className={`vibe-card${selected ? ' vibe-card--selected' : ''}`}
      onClick={() => onSelect?.(vibe)}
    >
      <div className="vibe-card__inner" style={{ clipPath, background: bg }}>
        <span className="vibe-card__label" style={{ color: selected ? 'var(--coral)' : text }}>
          {vibe}
        </span>
      </div>
      {selected && <span className="vibe-card__underline" />}
    </button>
  )
}
