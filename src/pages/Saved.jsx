import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import './Saved.css'

const formatDate = (ts) => {
  if (!ts?.seconds) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Saved({ user }) {
  const [playlists, setPlaylists] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [user?.uid])

  const toggle = (id) =>
    setExpanded((prev) => (prev === id ? null : id))

  return (
    <div className="saved page">
      <div className="saved__watermark" aria-hidden="true">SAVED</div>

      <main className="saved__main">
        {playlists.length === 0 ? (
          <div className="saved__empty">
            <div className="saved__empty-line" />
            <p className="saved__empty-text">NO SAVED PLAYLISTS YET</p>
            <div className="saved__empty-line" />
          </div>
        ) : (
          <div className="saved__list">
            {playlists.map((pl) => (
              <div key={pl.id} className="saved__playlist">
                <button
                  className="saved__playlist-row"
                  onClick={() => toggle(pl.id)}
                  data-cursor-hover
                >
                  <span className="saved__playlist-name">{pl.name}</span>
                  <span className="saved__playlist-date">
                    {formatDate(pl.createdAt)}
                  </span>
                  <span className="saved__playlist-count">
                    {pl.tracks?.length ?? 0} TRACKS
                  </span>
                </button>

                {expanded === pl.id && (
                  <div className="saved__playlist-tracks">
                    {(pl.tracks ?? []).map((t, i) => (
                      <div key={i} className="saved__track">
                        <span className="saved__track-num">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="saved__track-title">{t.title}</span>
                        <span className="saved__track-artist">{t.artist}</span>
                        <span className="saved__track-dur">{t.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  )
}
