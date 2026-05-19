import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import { trackAmber } from '../utils/trackAmber'
import './Home.css'

const VIBES = [
  { emoji: '🌧️', label: 'MELANCHOLIC' },
  { emoji: '⚡', label: 'EUPHORIC' },
  { emoji: '🔥', label: 'RAGE' },
  { emoji: '🕯️', label: 'TENDER' },
  { emoji: '🌫️', label: 'NUMB' },
  { emoji: '🧪', label: 'WIRED' },
]

export default function Home({ user }) {
  const [mood, setMood] = useState('')
  const navigate = useNavigate()

  const initial =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    'G'

  const handleGenerate = () => {
    if (!mood.trim()) return
    navigate('/results', { state: { mood: mood.trim() } })
  }

  return (
    <div className="home page">
      <header className="home__topbar">
        <span className="home__logo">BS</span>
        <span className="home__profile-initial" data-cursor-hover>
          {initial}
        </span>
      </header>

      <main className="home__main">
        <h1 className="home__hero">
          WHAT ARE YOU<br />FEELING?
        </h1>

        <div className="home__input-group">
          <input
            className="home__input"
            type="text"
            placeholder="describe your mood..."
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            className="home__generate-btn"
            onClick={handleGenerate}
            onMouseMove={trackAmber}
            data-cursor-hover
            data-cursor-amber
          >
            GENERATE
          </button>
        </div>

        <div className="home__divider">
          <span className="home__divider-text">OR CHOOSE A VIBE</span>
        </div>

        <div className="home__vibes">
          {VIBES.map((v) => (
            <VibeCard
              key={v.label}
              emoji={v.emoji}
              label={v.label}
              onClick={() => navigate('/results', { state: { mood: v.label } })}
            />
          ))}
        </div>
      </main>

      <Navbar />
    </div>
  )
}
