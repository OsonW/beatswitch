import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Login from './pages/Login'
import Home from './pages/Home'
import Results from './pages/Results'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import Callback from './pages/Callback'
import { SpotifyProvider } from './context/SpotifyContext'

function ProtectedRoute({ user, children }) {
  if (user === undefined) return null
  return user ? children : <Navigate to="/login" replace />
}

function AuthRoute({ user, children }) {
  if (user === undefined) return null
  return user ? <Navigate to="/home" replace /> : children
}

function LoadingSplash() {
  return (
    <div className="loading-splash">
      <div className="loading-eq">
        <div className="loading-eq__bar" />
        <div className="loading-eq__bar" />
        <div className="loading-eq__bar" />
        <div className="loading-eq__bar" />
        <div className="loading-eq__bar" />
      </div>
      <p className="loading-label">BEATSWITCH</p>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u ?? null))
  }, [])

  if (user === undefined) return <LoadingSplash />

  return (
    <BrowserRouter>
      <SpotifyProvider>
        <Routes>
          <Route path="/login"    element={<AuthRoute user={user}><Login /></AuthRoute>} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/home"     element={<ProtectedRoute user={user}><Home user={user} /></ProtectedRoute>} />
          <Route path="/results"  element={<ProtectedRoute user={user}><Results user={user} /></ProtectedRoute>} />
          <Route path="/saved"    element={<ProtectedRoute user={user}><Saved user={user} /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
          <Route path="*"         element={<Navigate to={user ? '/home' : '/login'} replace />} />
        </Routes>
      </SpotifyProvider>
    </BrowserRouter>
  )
}
