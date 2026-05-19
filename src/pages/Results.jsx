import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import TrackCard from '../components/TrackCard'
import './Results.css'

const PLACEHOLDER_TRACKS = [
  { title: 'Silver Lining', artist: 'MITSKI', duration: '3:42' },
  { title: 'Motion Sickness', artist: 'PHOEBE BRIDGERS', duration: '4:01' },
  { title: 'Dissolve', artist: 'ABSOFACTO', duration: '3:18' },
  { title: 'Garden Song', artist: 'PHOEBE BRIDGERS', duration: '2:33' },
  { title: 'Nobody', artist: 'MITSKI', duration: '2:42' },
]

const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}

export default function Results({ user }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const mood = state?.mood ?? 'UNKNOWN'
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!user?.uid || saved) return
    setSaved(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood} MIX`,
        mood,
        createdAt: serverTimestamp(),
        tracks: PLACEHOLDER_TRACKS,
      })
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }

  return (
    <div className="results page">
      <header className="results__header">
        <button
          className="results__back"
          onClick={() => navigate(-1)}
          data-cursor-hover
        >
          ←
        </button>
      </header>

      <main className="results__main">
        <p className="results__mood">"{mood}"</p>
        <p className="results__subtitle">— GENERATED FOR YOU —</p>

        <div className="results__tracks">
          {PLACEHOLDER_TRACKS.map((track, i) => (
            <TrackCard
              key={i}
              number={i + 1}
              title={track.title}
              artist={track.artist}
              duration={track.duration}
            />
          ))}
        </div>

        <div className="results__actions">
          <button
            className="results__btn results__btn--save"
            onClick={handleSave}
            onMouseMove={trackAmber}
            disabled={saved}
            data-cursor-hover
            data-cursor-amber
          >
            {saved ? 'SAVED ✓' : 'SAVE PLAYLIST'}
          </button>
          <button
            className="results__btn results__btn--export"
            data-cursor-hover
          >
            EXPORT TO SPOTIFY
          </button>
        </div>
      </main>

      <Navbar />
    </div>
  )
}
