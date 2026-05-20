// src/pages/Results.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { generatePlaylist } from '../utils/generatePlaylist'
import Vinyl from '../components/Vinyl'
import TrackCard from '../components/TrackCard'
import BottomSheet from '../components/BottomSheet'
import Toast from '../components/Toast'
import './Results.css'

const MAX_PINS = 3
const PREVIEW_DURATION = 30000

export default function Results({ user }) {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const mood      = state?.fromHistory ? 'BUILT FROM YOUR HISTORY' : (state?.mood ?? 'your vibe')

  const [tracks,       setTracks]       = useState(() => generatePlaylist({ mood }))
  const [saved,        setSaved]        = useState(false)
  const [pinnedNames,  setPinnedNames]  = useState(new Set())
  const [previewIndex, setPreviewIndex] = useState(null)
  const [showPinHint,  setShowPinHint]  = useState(null)
  const [shuffling,    setShuffling]    = useState(false)
  const [showVibeCheck,setShowVibeCheck]= useState(false)
  const [vibeRating,   setVibeRating]   = useState(null)
  const [toastMsg,     setToastMsg]     = useState(null)

  const previewTimerRef = useRef(null)

  // Show vibe check 800ms after mount — only once
  useEffect(() => {
    const t = setTimeout(() => setShowVibeCheck(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => clearTimeout(previewTimerRef.current), [])

  const handlePreview = useCallback((index) => {
    clearTimeout(previewTimerRef.current)
    if (previewIndex === index) { setPreviewIndex(null); return }
    setPreviewIndex(index)
    previewTimerRef.current = setTimeout(() => setPreviewIndex(null), PREVIEW_DURATION)
  }, [previewIndex])

  const handlePin = useCallback((name) => {
    setPinnedNames(prev => {
      if (prev.has(name)) {
        const next = new Set(prev)
        next.delete(name)
        setShowPinHint(null)
        return next
      }
      if (prev.size >= MAX_PINS) {
        setToastMsg('3 PINS MAXIMUM')
        return prev
      }
      setShowPinHint(null)
      return new Set([...prev, name])
    })
  }, [])

  const handleReshuffle = () => {
    if (shuffling) return
    setShuffling(true)
    setTimeout(() => {
      setTracks(prev => {
        const pinned   = prev.filter(t => pinnedNames.has(t.name))
        const unpinned = prev.filter(t => !pinnedNames.has(t.name))
        const fresh    = generatePlaylist({ mood }).filter(t => !pinnedNames.has(t.name))
        const reshuffled = fresh.length >= unpinned.length ? fresh.slice(0, unpinned.length) : [...fresh, ...unpinned].slice(0, unpinned.length)
        const result = []
        let ui = 0
        prev.forEach(t => {
          if (pinnedNames.has(t.name)) result.push(t)
          else result.push(reshuffled[ui++] ?? t)
        })
        return result
      })
      setShuffling(false)
    }, 220)
  }

  const handleVibeRating = async (rating) => {
    setVibeRating(rating)
    setShowVibeCheck(false)
    setToastMsg('NOTED')
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'vibeChecks'), {
          mood, rating, timestamp: serverTimestamp(),
        })
      } catch { /* non-critical */ }
    }
  }

  const handleSave = async () => {
    if (!user?.uid || saved) return
    setSaved(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood.toUpperCase()} MIX`,
        mood,
        createdAt: serverTimestamp(),
        tracks,
      })
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }

  return (
    <div className={`results page${shuffling ? ' results--shuffling' : ''}`}>
      <header className="results__header">
        <button className="results__back" onClick={() => navigate(-1)}>BACK</button>
        <span className="results__title">YOUR PLAYLIST</span>
        <div style={{ width: 48 }} />
      </header>

      <div className="results__mood-area">
        <p className="results__mood-label">"{mood}"</p>
        <Vinyl size="small" active />
      </div>

      {/* Toolbar */}
      <div className="results__toolbar">
        <button className="results__reshuffle" onClick={handleReshuffle}>RESHUFFLE</button>
        {pinnedNames.size > 0 && (
          <span className="results__pin-count">{pinnedNames.size} PINNED</span>
        )}
      </div>

      <div className="results__tracks">
        {tracks.map((track, i) => (
          <TrackCard
            key={`${track.name}-${i}`}
            track={track}
            index={i}
            previewing={previewIndex === i}
            pinned={pinnedNames.has(track.name)}
            showPinLabel={showPinHint === i}
            onPreview={handlePreview}
            onPin={handlePin}
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
          {saved ? 'SAVED' : 'SAVE'}
        </button>
      </div>

      {/* Vibe Check */}
      <BottomSheet visible={showVibeCheck} onDismiss={() => setShowVibeCheck(false)}>
        <p className="vibe-check__heading">HOW DID WE DO</p>
        <div className="vibe-check__options">
          {['PERFECT', 'CLOSE', 'MISS'].map(r => (
            <button
              key={r}
              className={`vibe-check__option${vibeRating === r ? ' vibe-check__option--selected' : ''}`}
              onClick={() => handleVibeRating(r.toLowerCase())}
            >
              {r}
            </button>
          ))}
        </div>
      </BottomSheet>

      <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
    </div>
  )
}
