import { useNavigate } from 'react-router-dom'
import Vinyl from './Vinyl'
import './MoodOfDay.css'

const DAILY_MOODS = [
  { name: 'GOLDEN HOUR',       desc: 'warm slow nostalgic like a polaroid fading' },
  { name: 'FOCUSED GRIND',     desc: 'sharp clean forward moving relentless' },
  { name: 'MELANCHOLIC DRIVE', desc: 'late roads wet asphalt and distance' },
  { name: 'MIDWEEK TENSION',   desc: 'restless urgent not quite there yet' },
  { name: 'DEEP CURRENT',      desc: 'slow heavy moving beneath the surface' },
  { name: 'EUPHORIC STATIC',   desc: 'loud bright electric dissolving' },
  { name: 'LATE WANDER',       desc: 'dark loose unraveling at the edges' },
]

export default function MoodOfDay() {
  const navigate = useNavigate()
  const today = DAILY_MOODS[new Date().getDay()]

  return (
    <section className="mod">
      <svg className="mod__blob" viewBox="0 0 390 160" preserveAspectRatio="none">
        <path
          d="M-20 80 C60 20, 150 140, 280 60 C350 20, 420 100, 430 80 L430 180 L-20 180 Z"
          fill="#FF4D00"
          opacity="0.04"
        />
      </svg>
      <div className="mod__content">
        <div className="mod__left">
          <span className="mod__today">TODAY</span>
          <h2 className="mod__name">{today.name}</h2>
          <p className="mod__desc">{today.desc}</p>
          <button
            className="mod__generate"
            onClick={() => navigate('/results', { state: { mood: today.name } })}
          >
            GENERATE
          </button>
        </div>
        <div className="mod__right">
          <Vinyl size="medium" active />
        </div>
      </div>
    </section>
  )
}
