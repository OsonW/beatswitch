// src/context/SpotifyContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { getStoredTokens } from '../spotify/auth'
import { getMe } from '../spotify/client'

const SpotifyContext = createContext({ connected: false, spotifyUser: null, ready: false })

export const useSpotify = () => useContext(SpotifyContext)

export function SpotifyProvider({ children }) {
  const [spotifyUser, setSpotifyUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (!getStoredTokens()) { setReady(true); return }
      try {
        const me = await getMe()
        if (active) setSpotifyUser(me)
      } catch { /* invalid/expired token → stays disconnected */ }
      if (active) setReady(true)
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <SpotifyContext.Provider value={{ connected: !!spotifyUser, spotifyUser, ready }}>
      {children}
    </SpotifyContext.Provider>
  )
}
