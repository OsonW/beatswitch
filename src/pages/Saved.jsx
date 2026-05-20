// src/pages/Saved.jsx
import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useLongPress } from '../hooks/useLongPress'
import Navbar from '../components/Navbar'
import FavouritesMix from '../components/FavouritesMix'
import MoodTimeline from '../components/MoodTimeline'
import CollageGrid from '../components/CollageGrid'
import './Saved.css'

function PlaylistRow({ playlist, uid }) {
  const [expanded, setExpanded] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const longPress = useLongPress(() => setShowDelete(true))

  const handleDelete = async () => {
    try { await deleteDoc(doc(db, 'users', uid, 'playlists', playlist.id)) }
    catch (err) { console.error('Delete failed:', err) }
  }

  const formatDate = (ts) => {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`pl-row${showDelete ? ' pl-row--delete' : ''}`}>
      <div
        className="pl-row__main"
        onClick={() => { setExpanded(e => !e); setShowDelete(false) }}
        {...longPress}
      >
        <div className="pl-row__info">
          <p className="pl-row__name">{playlist.name}</p>
          <span className="pl-row__meta">{formatDate(playlist.createdAt)} · {playlist.tracks?.length ?? 0} tracks</span>
        </div>
        <span className="pl-row__chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {showDelete && (
        <div className="pl-row__delete-bar">
          <button className="pl-row__delete-btn" onClick={handleDelete}>DELETE</button>
          <button className="pl-row__cancel-btn" onClick={() => setShowDelete(false)}>CANCEL</button>
        </div>
      )}

      {expanded && (
        <div className="pl-row__tracks">
          {(playlist.tracks ?? []).map((t, i) => (
            <div key={i} className="pl-row__track">
              <span className="pl-row__track-name">{t.name}</span>
              <span className="pl-row__track-artist">{t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Saved({ user }) {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [moodHistory, setMoodHistory] = useState([])
  const [view, setView] = useState('LIST')
  const [pulling, setPulling] = useState(false)
  const pullStartY = useRef(null)

  useEffect(() => {
    if (!user?.uid) return
    const q = query(collection(db, 'users', user.uid, 'playlists'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(collection(db, 'users', user.uid, 'moodHistory'), orderBy('timestamp', 'desc'))
    return onSnapshot(q, snap => setMoodHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [user?.uid])

  const handleTouchStart = (e) => { pullStartY.current = e.touches[0].clientY }
  const handleTouchMove  = (e) => {
    if (pullStartY.current === null) return
    if (e.touches[0].clientY - pullStartY.current > 60 && window.scrollY === 0) setPulling(true)
  }
  const handleTouchEnd = () => {
    if (pulling) { setTimeout(() => setPulling(false), 800) }
    pullStartY.current = null
  }

  return (
    <div
      className="saved page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pulling && (
        <div className="saved__pull">
          <div className="loading-eq">
            {[...Array(5)].map((_, i) => <div key={i} className="loading-eq__bar" />)}
          </div>
        </div>
      )}

      <header className="saved__header">
        <span className="saved__watermark">SAVED</span>
        <div className="saved__view-toggle">
          <button
            className={`saved__view-btn${view === 'LIST' ? ' saved__view-btn--active' : ''}`}
            onClick={() => setView('LIST')}
          >LIST</button>
          <span className="saved__view-sep">—</span>
          <button
            className={`saved__view-btn${view === 'GRID' ? ' saved__view-btn--active' : ''}`}
            onClick={() => setView('GRID')}
          >GRID</button>
        </div>
      </header>

      <FavouritesMix uid={user?.uid} />

      <MoodTimeline entries={moodHistory} />

      <main className="saved__main">
        {playlists.length === 0 ? (
          <div className="saved__empty">
            <p className="saved__empty-text">nothing saved yet</p>
            <a className="saved__empty-link" href="/home">generate your first playlist</a>
          </div>
        ) : view === 'LIST' ? (
          playlists.map(pl => (
            <PlaylistRow key={pl.id} playlist={pl} uid={user.uid} />
          ))
        ) : (
          <CollageGrid playlists={playlists} />
        )}
      </main>

      <Navbar />
    </div>
  )
}
