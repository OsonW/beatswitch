import { useRef } from 'react'
import { useMouseTilt } from '../hooks/useMouseTilt'
import './VibeCard.css'

export default function VibeCard({ emoji, label, onClick }) {
  const ref = useRef(null)
  const { rotateX, rotateY } = useMouseTilt(ref)

  return (
    <button
      ref={ref}
      className="vibe-card"
      onClick={onClick}
      data-cursor-hover
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      <span className="vibe-card__emoji">{emoji}</span>
      <span className="vibe-card__label">{label}</span>
    </button>
  )
}
