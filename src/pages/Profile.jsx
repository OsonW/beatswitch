// src/pages/Profile.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import Navbar from '../components/Navbar'
import RadarChart from '../components/RadarChart'
import { useSpotify } from '../context/SpotifyContext'
import './Profile.css'

const TOP_VIBES    = ['LATE NIGHT', 'FOCUS', 'HYPE', 'MELANCHOLIC', 'ROAD TRIP']
const VIBE_SIZES   = [24, 20, 16, 13, 11]
const DAY_LABELS   = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const BAR_HEIGHTS  = [40, 65, 30, 80, 55, 90, 45]
const BAR_WIDTHS   = [8, 11, 9, 13, 10, 12, 9]

export default function Profile({ user }) {
  const navigate = useNavigate()
  const [error, setError]   = useState(null)

  const { spotifyUser } = useSpotify()
  const displayName = spotifyUser?.display_name ?? user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const avatarUrl   = spotifyUser?.images?.[0]?.url ?? null
  const initial     = displayName[0]?.toUpperCase() ?? '?'
  const since       = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/login') }
    catch { setError('Sign out failed. Try again.') }
  }

  return (
    <div className="profile page">
      <main className="profile__main">

        {/* Header */}
        <div className="profile__header">
          <div className="profile__blob-wrap">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <clipPath id="profile-blob">
                  <path d="M60 8 C88 4, 116 28, 112 58 C108 90, 82 116, 52 112 C22 108, 4 82, 8 54 C12 26, 32 12, 60 8 Z" />
                </clipPath>
              </defs>
              {avatarUrl ? (
                <image
                  href={avatarUrl}
                  x="0" y="0" width="120" height="120"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#profile-blob)"
                />
              ) : (
                <>
                  <path
                    d="M60 8 C88 4, 116 28, 112 58 C108 90, 82 116, 52 112 C22 108, 4 82, 8 54 C12 26, 32 12, 60 8 Z"
                    fill="#FF4D00"
                  />
                  <text
                    x="60" y="66"
                    textAnchor="middle"
                    fontSize="36"
                    fontWeight="900"
                    fontFamily="system-ui"
                    fill="#080808"
                    letterSpacing="-2"
                  >
                    {initial}
                  </text>
                </>
              )}
            </svg>
          </div>
          <div>
            <p className="profile__name">{displayName.toUpperCase()}</p>
            <p className="profile__since">since {since}</p>
          </div>
        </div>

        {/* Your Sound section */}
        <div className="profile__section-header">
          <span className="profile__section-label">YOUR SOUND</span>
          <svg className="profile__section-line" height="1" viewBox="0 0 200 1" preserveAspectRatio="none">
            <path d="M0 0.5 C50 0.3, 100 0.7, 200 0.5" stroke="#FF4D00" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <RadarChart />

        {/* Top vibes */}
        <div className="profile__section-header">
          <span className="profile__section-label">TOP VIBES</span>
        </div>
        <div className="profile__vibes">
          {TOP_VIBES.map((v, i) => (
            <span
              key={v}
              className="profile__vibe-item"
              style={{
                fontSize: `${VIBE_SIZES[i]}px`,
                color: i === 0 ? 'var(--coral)' : 'var(--muted)',
              }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-num">24</span>
            <span className="profile__stat-label">PLAYLISTS</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-num">187</span>
            <span className="profile__stat-label">TRACKS</span>
          </div>
        </div>

        {/* 7-day mood bar chart */}
        <div className="profile__section-header">
          <span className="profile__section-label">THIS WEEK</span>
        </div>
        <div className="profile__barchart">
          {DAY_LABELS.map((day, i) => (
            <div key={day} className="profile__bar-col">
              <div
                className="profile__bar"
                style={{
                  height: `${BAR_HEIGHTS[i]}%`,
                  width: `${BAR_WIDTHS[i]}px`,
                }}
              />
              <span className="profile__bar-label">{day}</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button className="profile__signout" onClick={handleSignOut}>
          sign out
        </button>
        {error && <p className="profile__error">{error}</p>}
      </main>

      <Navbar />
    </div>
  )
}
