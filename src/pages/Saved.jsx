import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useLongPress } from '../hooks/useLongPress'
import Navbar from '../components/Navbar'
import Waveform from '../components/Waveform'
import './Saved.css'

function PlaylistCard({ playlist, uid }) {
  const [expanded, setExpanded] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const longPress = useLongPress(() => setShowDelete(true))

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'playlists', playlist.id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const formatDate = (ts) => {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`pl-card${showDelete ? ' pl-card--delete-mode' : ''}`}>
      <div
        className="pl-card__row"
        onClick={() => { setExpanded(e => !e); setShowDelete(false) }}
        {...longPress}
      >
        <div className="pl-card__info">
          <p className="pl-card__name">{playlist.name}</p>
          <div className="pl-card__meta">
            <span className="pl-card__date">{formatDate(playlist.createdAt)}</span>
            <span className="pl-card__dot">·</span>
            <Waveform speed="slow" bars={4} color="var(--muted)" />
            <span className="pl-card__count">{playlist.tracks?.length ?? 0} tracks</span>
          </div>
        </div>
        <span className="pl-card__chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {showDelete && (
        <div className="pl-card__delete-bar">
          <button className="pl-card__delete-btn" onClick={handleDelete}>DELETE PLAYLIST</button>
          <button className="pl-card__cancel-btn" onClick={() => setShowDelete(false)}>CANCEL</button>
        </div>
      )}

      {expanded && (
        <div className="pl-card__tracks">
          {(playlist.tracks ?? []).map((t, i) => (
            <div key={i} className="pl-card__track">
              <span className="pl-card__track-name">{t.name}</span>
              <span className="pl-card__track-artist">{t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Saved({ user }) {
  const [playlists, setPlaylists] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [pulling, setPulling] = useState(false)
  const pullStartY = useRef(null)

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user?.uid, refreshKey])

  const handleTouchStart = (e) => { pullStartY.current = e.touches[0].clientY }
  const handleTouchMove = (e) => {
    if (pullStartY.current === null) return
    if (e.touches[0].clientY - pullStartY.current > 60 && window.scrollY === 0) {
      setPulling(true)
    }
  }
  const handleTouchEnd = () => {
    if (pulling) {
      setRefreshKey(k => k + 1)
      setTimeout(() => setPulling(false), 800)
    }
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
        <div className="saved__pull-indicator">
          <div className="loading-eq">
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
          </div>
        </div>
      )}

      <header className="saved__header">
        <div className="saved__watermark">SAVED</div>
        <p className="saved__subtitle">YOUR PLAYLISTS</p>
      </header>

      <main className="saved__main">
        {playlists.length === 0 ? (
          <div className="saved__empty">
            <span className="saved__empty-note">♪</span>
            <p className="saved__empty-text">nothing saved yet</p>
            <a className="saved__empty-link" href="/home">generate your first playlist →</a>
          </div>
        ) : (
          playlists.map(pl => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              uid={user.uid}
            />
          ))
        )}
      </main>

      <Navbar />
    </div>
  )
}
