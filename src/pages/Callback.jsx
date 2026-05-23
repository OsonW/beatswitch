// src/pages/Callback.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { handleCallback } from '../spotify/auth'
import { auth } from '../firebase'

export default function Callback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return   // guard against React StrictMode double-invoke
    ran.current = true
    let timer
    async function run() {
      try {
        await handleCallback()
        if (!auth.currentUser) await signInAnonymously(auth)
        navigate('/home', { replace: true })
      } catch (err) {
        console.error('[Callback] Spotify auth failed:', err)
        setError('Spotify sign-in failed. Returning to login.')
        timer = setTimeout(() => navigate('/login', { replace: true }), 2500)
      }
    }
    run()
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="loading-splash">
      <p className="loading-label">{error ?? 'CONNECTING TO SPOTIFY'}</p>
    </div>
  )
}
