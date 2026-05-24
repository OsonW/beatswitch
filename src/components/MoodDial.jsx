import { useRef, useEffect } from 'react'
import { useMoodDial } from '../hooks/useMoodDial'
import './MoodDial.css'

const GRID_X = [28, 71, 130, 175, 231, 282]
const GRID_Y = [44, 98, 148, 205, 258]

export default function MoodDial({ onChange }) {
  const canvasRef = useRef(null)
  const { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd } = useMoodDial(300)

  useEffect(() => {
    onChange?.({ energy: position.x, valence: position.y, moodDescriptor })
  }, [position, moodDescriptor, onChange])

  const px = (position.x / 100) * 300
  const py = (1 - position.y / 100) * 300

  const midX = 150 + (px - 150) / 2 + 8
  const midY = 150 + (py - 150) / 2 - 8
  const tracePath = `M 150 150 Q ${midX} ${midY} ${px} ${py}`

  const onStart = (e) => handleTouchStart(e, canvasRef)
  const onMove  = (e) => handleTouchMove(e, canvasRef)

  return (
    <div className="mood-dial">
      <div
        className="mood-dial__canvas"
        ref={canvasRef}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg className="mood-dial__svg" viewBox="0 0 300 300">
          {GRID_X.map(x => (
            <line key={`vx${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#1A1A1A" strokeWidth="0.5" />
          ))}
          {GRID_Y.map(y => (
            <line key={`hy${y}`} x1="0" y1={y} x2="300" y2={y} stroke="#1A1A1A" strokeWidth="0.5" />
          ))}
          <text x="8"   y="16"  fontSize="9" fill="#222" fontFamily="system-ui">RADIANT CALM</text>
          <text x="162" y="16"  fontSize="9" fill="#222" fontFamily="system-ui">RADIANT ELECTRIC</text>
          <text x="8"   y="294" fontSize="9" fill="#222" fontFamily="system-ui">SHADOW CALM</text>
          <text x="158" y="294" fontSize="9" fill="#222" fontFamily="system-ui">SHADOW ELECTRIC</text>
          <path d={tracePath} stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.5" />
          <circle
            cx={px}
            cy={py}
            r="6"
            fill="#FF4D00"
            className={isDragging ? '' : 'mood-dial__point--idle'}
          />
        </svg>
        <span className="mood-dial__axis mood-dial__axis--left">CALM</span>
        <span className="mood-dial__axis mood-dial__axis--right">ELECTRIC</span>
        <span className="mood-dial__axis mood-dial__axis--top">RADIANT</span>
        <span className="mood-dial__axis mood-dial__axis--bottom">SHADOW</span>
      </div>
      <p className="mood-dial__descriptor">{moodDescriptor}</p>
    </div>
  )
}
