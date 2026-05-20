import { useState } from 'react'
import './MoodTimeline.css'

const ENTRY_W = 90

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MoodTimeline({ entries = [] }) {
  const [activeId, setActiveId] = useState(null)

  if (entries.length === 0) return null

  const svgWidth = Math.max(390, entries.length * ENTRY_W + 40)

  const pathPoints = entries.map((_, i) => ({
    x: i * ENTRY_W + ENTRY_W / 2 + 20,
    y: 30,
  }))
  const pathD = pathPoints.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pathPoints[i - 1]
    const cpX = (prev.x + p.x) / 2
    return `C ${cpX + 8} ${p.y - 5}, ${cpX - 8} ${p.y + 5}, ${p.x} ${p.y}`
  }).join(' ')

  const activeEntry = entries.find(e => e.id === activeId)

  return (
    <div className="timeline">
      <h2 className="timeline__title">MOOD HISTORY</h2>
      <div className="timeline__scroll">
        <svg
          className="timeline__svg"
          width={svgWidth}
          height={60}
          viewBox={`0 0 ${svgWidth} 60`}
        >
          <path d={pathD} stroke="#2A2A2A" strokeWidth="1" fill="none" />
          {entries.map((entry, i) => {
            const x = i * ENTRY_W + ENTRY_W / 2 + 20
            const isActive = entry.id === activeId
            return (
              <g
                key={entry.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveId(isActive ? null : entry.id)}
              >
                {isActive && (
                  <polygon
                    points={`${x},10 ${x + 6},20 ${x + 2},22 ${x - 4},19 ${x - 7},14`}
                    fill="#FF4D00"
                  />
                )}
                <text
                  x={x} y={38}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  letterSpacing="0.08"
                  fill={isActive ? '#FF4D00' : '#666'}
                  fontFamily="system-ui"
                >
                  {(entry.vibe ?? '').toUpperCase()}
                </text>
                <text
                  x={x} y={52}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#444"
                  fontFamily="system-ui"
                >
                  {formatDate(entry.timestamp)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {activeEntry && (
        <div className="timeline__expanded">
          <p className="timeline__expanded-vibe">{(activeEntry.vibe ?? '').toUpperCase()}</p>
          {(activeEntry.tracks ?? []).map((t, i) => (
            <div key={i} className="timeline__track">
              <span className="timeline__track-name">{t.name}</span>
              <span className="timeline__track-artist">{t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
