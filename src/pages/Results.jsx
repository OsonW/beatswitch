import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Vinyl from '../components/Vinyl'
import Waveform from '../components/Waveform'
import TrackCard from '../components/TrackCard'
import './Results.css'

const PLACEHOLDER_TRACKS = [
  { name: 'Nights',         artist: 'Frank Ocean',   duration: '5:07' },
  { name: 'After Hours',    artist: 'The Weeknd',    duration: '6:01' },
  { name: 'Motion Picture', artist: 'Bryson Tiller', duration: '4:22' },
  { name: 'Pyramids',       artist: 'Frank Ocean',   duration: '9:52' },
  { name: 'Self Control',   artist: 'Frank Ocean',   duration: '4:10' },
  { name: 'Do Not Disturb', artist: 'Drake',         duration: '3:46' },
  { name: 'Slow Dancing',   artist: 'V',             duration: '3:59' },
]

export default function Results({ user }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const mood = state?.mood ?? 'your vibe'

  const [saved, setSaved] = useState(false)
  const [playingIndex, setPlayingIndex] = useState(0)

  const handleSave = async () => {
    if (!user?.uid || saved) return
    setSaved(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood.toUpperCase()} MIX`,
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
        <button className="results__back" onClick={() => navigate(-1)}>←</button>
        <span className="results__title">YOUR PLAYLIST</span>
        <div style={{ width: 40 }} />
      </header>

      <div className="results__mood-area">
        <p className="results__mood-label">"{mood}"</p>
        <Vinyl size="small" active />
        <Waveform speed="fast" />
      </div>

      <div className="results__tracks">
        {PLACEHOLDER_TRACKS.map((track, i) => (
          <TrackCard
            key={i}
            track={track}
            index={i}
            playing={i === playingIndex}
            onSave={handleSave}
          />
        ))}
      </div>

      <div className="results__actions">
        <button
          className={`results__btn results__btn--save${saved ? ' results__btn--saved' : ''}`}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '✓ SAVED' : 'SAVE'}
        </button>
        <button className="results__btn results__btn--spotify">
          SPOTIFY
        </button>
      </div>
    </div>
  )
}
