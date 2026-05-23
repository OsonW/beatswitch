import { useEffect, useRef } from 'react'
import './RadarChart.css'

const AXES = ['ENERGY', 'WEIGHT', 'TEMPO', 'MOVEMENT', 'DEPTH', 'HEAT']
const VALUES = [72, 58, 85, 63, 79, 44]
const CENTER = 140
const MAX_R  = 100
const OUTER_OFFSETS = [3, -4, 5, -3, 4, -5]

function getPoint(angleRad, radius) {
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  }
}

export default function RadarChart() {
  const polygonRef = useRef(null)
  const fillRef    = useRef(null)

  const axisAngles = AXES.map((_, i) => (i * 60 - 90) * (Math.PI / 180))
  const dataPoints  = axisAngles.map((a, i) => getPoint(a, (VALUES[i] / 100) * MAX_R))
  const outerPoints = axisAngles.map((a, i) => getPoint(a, MAX_R + OUTER_OFFSETS[i]))

  const dataPolygon  = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const outerPolygon = outerPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  useEffect(() => {
    const poly = polygonRef.current
    if (!poly) return
    const len = poly.getTotalLength()
    poly.style.strokeDasharray  = len
    poly.style.strokeDashoffset = len
    requestAnimationFrame(() => {
      poly.style.transition       = 'stroke-dashoffset 1.2s ease-out'
      poly.style.strokeDashoffset = 0
    })
    if (fillRef.current) {
      fillRef.current.style.animation = 'fade-in 0.4s ease-out 1.2s forwards'
    }
  }, [])

  return (
    <div className="radar-chart">
      <svg width="280" height="280" viewBox="0 0 280 280">
        <polygon points={outerPolygon} fill="none" stroke="#2A2A2A" strokeWidth="1" />
        {axisAngles.map((a, i) => {
          const tip  = getPoint(a, MAX_R)
          const midX = CENTER + (tip.x - CENTER) / 2 + (i % 2 === 0 ? 1.5 : -1)
          const midY = CENTER + (tip.y - CENTER) / 2 + (i % 2 === 0 ? -1 : 1.5)
          return (
            <path
              key={AXES[i]}
              d={`M ${CENTER} ${CENTER} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`}
              stroke="#2A2A2A"
              strokeWidth="1"
              fill="none"
            />
          )
        })}
        <polygon ref={fillRef} points={dataPolygon} fill="#FF4D00" style={{ opacity: 0 }} />
        <polygon
          ref={polygonRef}
          points={dataPolygon}
          fill="none"
          stroke="#FF4D00"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {axisAngles.map((a, i) => {
          const tip = getPoint(a, MAX_R + 18)
          return (
            <text
              key={AXES[i]}
              x={tip.x.toFixed(1)}
              y={tip.y.toFixed(1)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#666"
              fontFamily="system-ui"
              fontWeight="700"
              letterSpacing="0.1"
            >
              {AXES[i]}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
