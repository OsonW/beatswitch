import './VibeCard.css'

export default function VibeCard({ emoji, label, onClick }) {
  return (
    <button
      className="vibe-card"
      onClick={onClick}
      data-cursor-hover
    >
      <span className="vibe-card__emoji">{emoji}</span>
      <span className="vibe-card__label">{label}</span>
    </button>
  )
}
