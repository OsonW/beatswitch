import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import Waveform from '../components/Waveform'
import './Home.css'

const VIBES = ['HYPE', 'MELANCHOLIC', 'FOCUS', 'LATE NIGHT', 'HEARTBREAK', 'ROAD TRIP']

const TRENDING = [
  { mood: 'late night driving alone',  plays: '24.3k' },
  { mood: 'pre-game energy',           plays: '18.1k' },
  { mood: 'studying but make it dark', plays: '15.7k' },
]

export default function Home({ user }) {
  const navigate = useNavigate()
  const [mood, setMood] = useState('')
  const [activeVibe, setActiveVibe] = useState(null)

  const displayName = user?.displayName ?? (user?.isAnonymous ? 'G' : 'U')
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const handleGenerate = () => {
    const query = mood.trim() || activeVibe
    if (!query) return
    navigate('/results', { state: { mood: query } })
  }

  const handleVibeSelect = (vibe) => {
    setActiveVibe(v => v === vibe ? null : vibe)
    setMood('')
  }

  const handleTrendingTap = (trendMood) => {
    navigate('/results', { state: { mood: trendMood } })
  }

  return (
    <div className="home page">
      <header className="home__header">
        <span className="home__logo">BS</span>
        <Waveform speed="slow" color="var(--coral)" />
        <div className="home__avatar" onClick={() => navigate('/profile')}>
          {initial}
        </div>
      </header>

      <main className="home__main">
        <h1 className="home__hero">
          WHAT'S<br />THE VIBE?
        </h1>

        <div className="home__input-group">
          <input
            className="home__input"
            placeholder="describe a feeling..."
            value={mood}
            onChange={e => { setMood(e.target.value); setActiveVibe(null) }}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
          <button
            className="home__generate ripple-host"
            onClick={handleGenerate}
            disabled={!mood.trim() && !activeVibe}
          >
            GENERATE PLAYLIST →
          </button>
        </div>

        <div className="home__divider">
          <span className="home__divider-text">— or pick a vibe —</span>
        </div>

        <div className="home__vibes">
          {VIBES.map(v => (
            <VibeCard
              key={v}
              vibe={v}
              active={activeVibe === v}
              onSelect={handleVibeSelect}
            />
          ))}
        </div>

        <section className="home__trending">
          <h2 className="home__section-title">TRENDING VIBES</h2>
          {TRENDING.map(({ mood: tm, plays }) => (
            <button
              key={tm}
              className="home__trend-row"
              onClick={() => handleTrendingTap(tm)}
            >
              <span className="home__trend-mood">{tm}</span>
              <div className="home__trend-right">
                <Waveform speed="slow" bars={4} color="var(--muted)" />
                <span className="home__trend-plays">{plays}</span>
              </div>
            </button>
          ))}
        </section>
      </main>

      <Navbar />
    </div>
  )
}
