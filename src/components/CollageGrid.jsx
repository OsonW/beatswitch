import { useNavigate } from 'react-router-dom'
import './CollageGrid.css'

const VIBE_COLORS = {
  HYPE:         '#FF4D00',
  MELANCHOLIC:  '#7B2FFF',
  FOCUS:        '#CCFF00',
  'LATE NIGHT': '#111111',
  HEARTBREAK:   '#3D0099',
  'ROAD TRIP':  '#CC3D00',
}

const POLYGONS = [
  'polygon(0% 0%, 95% 0%, 100% 90%, 5% 100%)',
  'polygon(5% 0%, 100% 0%, 95% 100%, 0% 95%)',
  'polygon(0% 5%, 100% 0%, 95% 100%, 0% 100%)',
  'polygon(0% 0%, 100% 5%, 100% 100%, 5% 95%)',
  'polygon(3% 0%, 97% 3%, 100% 97%, 0% 100%)',
  'polygon(0% 3%, 100% 0%, 97% 100%, 3% 97%)',
  'polygon(5% 5%, 100% 0%, 95% 95%, 0% 100%)',
  'polygon(0% 0%, 95% 5%, 100% 100%, 5% 95%)',
  'polygon(3% 0%, 100% 3%, 97% 100%, 0% 97%)',
]

export default function CollageGrid({ playlists }) {
  const navigate = useNavigate()

  return (
    <div className="collage-grid">
      {playlists.map((pl, i) => {
        const moodKey = Object.keys(VIBE_COLORS).find(
          k => (pl.mood ?? '').toUpperCase().includes(k)
        )
        const bg = moodKey ? VIBE_COLORS[moodKey] : '#2A2A2A'
        const clip = POLYGONS[i % POLYGONS.length]
        const nameColor = bg === '#CCFF00' ? '#080808' : '#F2F2F2'
        return (
          <button
            key={pl.id}
            className="collage-grid__cell"
            style={{ '--stagger': `${i * 60}ms` }}
            onClick={() => navigate('/results', { state: { mood: pl.mood ?? pl.name } })}
          >
            <div
              className="collage-grid__inner"
              style={{ clipPath: clip, background: bg }}
            >
              <span className="collage-grid__name" style={{ color: nameColor }}>
                {pl.name}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
