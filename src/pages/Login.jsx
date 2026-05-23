import { useState } from 'react'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import { beginLogin } from '../spotify/auth'
import Vinyl from '../components/Vinyl'
import './Login.css'

export default function Login() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null)

  const handleSpotify = async () => {
    setLoading('spotify')
    setError(null)
    try {
      await beginLogin()   // redirects away to Spotify
    } catch {
      setError('Could not start Spotify sign in. Please try again.')
      setLoading(null)
    }
  }

  const handleGuest = async () => {
    setLoading('guest')
    setError(null)
    try {
      await signInAnonymously(auth)
    } catch (err) {
      setError('Could not continue as guest. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="login">
      <div className="login__blob login__blob--1" />
      <div className="login__blob login__blob--2" />

      <div className="login__vinyl-area">
        <div className="login__note login__note--1">♪</div>
        <div className="login__note login__note--2">♫</div>
        <div className="login__note login__note--3">♪</div>
        <Vinyl size="large" active />
      </div>

      <div className="login__content">
        <h1 className="login__wordmark">
          <span className="login__beat">BEAT</span>
          <span className="login__switch">SWITCH</span>
        </h1>
        <p className="login__tagline">drop a feeling. get a playlist.</p>
      </div>

      <div className="login__actions">
        <button
          className="login__btn login__btn--spotify ripple-host"
          onClick={handleSpotify}
          disabled={loading !== null}
        >
          {loading === 'spotify' ? '···' : 'CONTINUE WITH SPOTIFY'}
        </button>
        <button
          className="login__btn login__btn--guest ripple-host"
          onClick={handleGuest}
          disabled={loading !== null}
        >
          {loading === 'guest' ? '···' : 'BROWSE AS GUEST'}
        </button>
        {error && <p className="login__error">{error}</p>}
      </div>

      <div className="login__features">
        <span>♪ mood-aware curation</span>
        <span>♪ editorial taste</span>
        <span>♪ no algorithm bs</span>
      </div>
    </div>
  )
}
