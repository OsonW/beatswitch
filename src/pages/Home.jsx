// src/pages/Home.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlend } from '../hooks/useBlend'
import { useMoodDial } from '../hooks/useMoodDial'
import { generatePlaylist } from '../utils/generatePlaylist'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import BlendOrb from '../components/BlendOrb'
import MoodDial from '../components/MoodDial'
import MoodOfDay from '../components/MoodOfDay'
import VibeLeaderboard from '../components/VibeLeaderboard'
import './Home.css'

const VIBES = ['HYPE', 'MELANCHOLIC', 'FOCUS', 'LATE NIGHT', 'HEARTBREAK', 'ROAD TRIP']
const TABS  = ['DESCRIBE', 'BLEND', 'DIAL']

export default function Home({ user }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('DESCRIBE')
  const [mood, setMood] = useState('')
  const dialCanvasRef = useRef(null)

  const { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel } = useBlend()
  const { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd } = useMoodDial(300)

  const canGenerate =
    (activeTab === 'DESCRIBE' && mood.trim()) ||
    (activeTab === 'BLEND'    && selectedVibes.length > 0) ||
    (activeTab === 'DIAL')

  const handleGenerate = () => {
    if (!canGenerate) return
    if (activeTab === 'DESCRIBE') {
      navigate('/results', { state: { mood: mood.trim() } })
    } else if (activeTab === 'BLEND') {
      navigate('/results', { state: { mood: selectedVibes[0] ?? 'BLEND', vibes: selectedVibes.map(v => ({ name: v, weight: weights[v] })) } })
    } else {
      navigate('/results', { state: { mood: moodDescriptor, energy: position.x, valence: position.y } })
    }
  }

  const tabIndex = TABS.indexOf(activeTab)

  return (
    <div className="home page">
      <header className="home__header">
        <span className="home__logo">BS</span>
        <button className="home__avatar" onClick={() => navigate('/profile')}>
          {(user?.displayName?.[0] ?? (user?.isAnonymous ? 'G' : 'U')).toUpperCase()}
        </button>
      </header>

      <MoodOfDay />

      <main className="home__main">
        <h1 className="home__hero">WHAT'S<br />THE VIBE?</h1>

        {/* Tab switcher */}
        <div className="home__tabs">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`home__tab${activeTab === tab ? ' home__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <span className="home__tab-indicator" style={{ left: `calc(${tabIndex} * 33.33%)` }} />
        </div>

        {/* DESCRIBE */}
        {activeTab === 'DESCRIBE' && (
          <div className="home__describe">
            <input
              className="home__input"
              placeholder="describe a feeling"
              value={mood}
              onChange={e => setMood(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>
        )}

        {/* BLEND */}
        {activeTab === 'BLEND' && (
          <div className="home__blend">
            <div className="home__vibes">
              {VIBES.map(v => (
                <VibeCard
                  key={v}
                  vibe={v}
                  selected={selectedVibes.includes(v)}
                  onSelect={toggleVibe}
                />
              ))}
            </div>

            {selectedVibes.length >= 2 && (
              <>
                <BlendOrb selectedVibes={selectedVibes} />
                <p className="home__blend-label">
                  {selectedVibes.map((v, i) => (
                    <span key={v}>
                      {v} <span className="home__blend-weight">{weights[v] ?? 0}</span>
                      {i < selectedVibes.length - 1 && ' — '}
                    </span>
                  ))}
                </p>
                <div className="home__scrubbers">
                  {selectedVibes.map(v => (
                    <WeightScrubber
                      key={v}
                      vibe={v}
                      weight={weights[v] ?? 0}
                      onAdjust={adjustWeight}
                    />
                  ))}
                </div>
              </>
            )}

            {selectedVibes.length === 1 && (
              <div className="home__vibes-hint">
                select up to 2 more to blend
              </div>
            )}
          </div>
        )}

        {/* DIAL */}
        {activeTab === 'DIAL' && (
          <div className="home__dial">
            <MoodDial onChange={() => {}} />
          </div>
        )}

        <button
          className="home__generate"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {activeTab === 'BLEND' && selectedVibes.length >= 2 ? 'BLEND + GENERATE' : 'GENERATE PLAYLIST'}
        </button>
      </main>

      <VibeLeaderboard onVibeSelect={(vibe) => { setActiveTab('BLEND'); toggleVibe(vibe) }} />

      <Navbar />
    </div>
  )
}

function WeightScrubber({ vibe, weight, onAdjust }) {
  const trackRef = useRef(null)

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const pct = Math.round(Math.max(0, Math.min(rect.width, x)) / rect.width * 100)
    onAdjust(vibe, pct)
  }

  return (
    <div className="scrubber">
      <span className="scrubber__label">{vibe}</span>
      <div
        className="scrubber__track"
        ref={trackRef}
        onTouchMove={handleTouchMove}
      >
        <div className="scrubber__fill" style={{ width: `${weight}%` }} />
        <div className="scrubber__thumb" style={{ left: `${weight}%` }} />
      </div>
      <span className="scrubber__value">{weight}</span>
    </div>
  )
}
