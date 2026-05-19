import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

const HEADLINE = 'BEATSWITCH'

const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}

export default function Login() {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState(null)
  const letterRefs = useRef([])

  const handleHeadlineMove = (e) => {
    letterRefs.current.forEach((ref) => {
      if (!ref) return
      const rect = ref.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const dist = Math.abs(e.clientX - cx)
      const maxDist = 140
      const shift = Math.max(0, (1 - dist / maxDist)) * -14
      ref.style.transform = `translateY(${shift}px)`
    })
  }

  const handleSpotify = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/home')
    } catch (err) {
      setAuthError('Sign in failed. Please try again.')
    }
  }

  const handleGuest = async () => {
    try {
      await signInAnonymously(auth)
      navigate('/home')
    } catch (err) {
      setAuthError('Could not continue as guest. Please try again.')
    }
  }

  return (
    <div className="login">
      <header className="login__header">
        <h1 className="login__headline" onMouseMove={handleHeadlineMove}>
          {HEADLINE.split('').map((ch, i) => (
            <span
              key={i}
              ref={(el) => { letterRefs.current[i] = el }}
              className="login__letter"
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="login__tagline">MUSIC THAT READS YOUR MOOD</p>
      </header>

      <div className="login__divider" />

      <div className="login__actions">
        <button
          className="login__btn login__btn--spotify"
          onClick={handleSpotify}
          onMouseMove={trackAmber}
          data-cursor-hover
          data-cursor-amber
        >
          ENTER WITH SPOTIFY
        </button>
        <button
          className="login__btn login__btn--guest"
          onClick={handleGuest}
          data-cursor-hover
        >
          CONTINUE AS GUEST
        </button>
      </div>

      {authError && (
        <p className="login__error">{authError}</p>
      )}

      <div className="login__features">
        <span>MOOD-AWARE CURATION</span>
        <span>EDITORIAL TASTE</span>
        <span>NO ALGORITHM BS</span>
      </div>
    </div>
  )
}
