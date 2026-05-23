import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import Vinyl from './Vinyl'
import './FavouritesMix.css'

export default function FavouritesMix({ uid }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!uid || loading) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users', uid, 'playlists'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snap = await getDocs(q)
      const moods = snap.docs.map(d => d.data().mood).filter(Boolean)
      navigate('/results', { state: { mood: 'YOUR TASTE', fromHistory: true, vibes: moods } })
    } catch (err) {
      console.error('Mix failed:', err)
      setLoading(false)
    }
  }

  return (
    <section className="fav-mix">
      {loading ? (
        <div className="fav-mix__loading">
          <Vinyl size="small" active />
          <p className="fav-mix__loading-text">reading your taste</p>
        </div>
      ) : (
        <>
          <h2 className="fav-mix__title">MIX YOUR FAVOURITES</h2>
          <p className="fav-mix__sub">we read your saved playlists and build something new</p>
          <button className="fav-mix__cta" onClick={handleGenerate}>
            GENERATE MIX
          </button>
        </>
      )}
    </section>
  )
}
