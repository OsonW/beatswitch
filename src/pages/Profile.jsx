import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import Navbar from '../components/Navbar'
import './Profile.css'

export default function Profile({ user }) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const displayName = user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const uid = user?.uid?.slice(0, 8).toUpperCase() ?? '—'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (err) {
      console.error('Sign out failed:', err)
      setError('Sign out failed. Please try again.')
    }
  }

  return (
    <div className="profile page">
      <main className="profile__main">
        <div className="profile__identity">
          <div className="profile__initial-box">{initial}</div>
          <div>
            <p className="profile__name">{displayName}</p>
            <p className="profile__uid">ID: {uid}</p>
          </div>
        </div>

        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-value">—</span>
            <span className="profile__stat-label">PLAYLISTS</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-value">♪</span>
            <span className="profile__stat-label">MEMBER</span>
          </div>
        </div>

        <div className="profile__divider" />

        <button className="profile__signout" onClick={handleSignOut}>
          SIGN OUT
        </button>
        {error && <p className="profile__error">{error}</p>}
      </main>

      <Navbar />
    </div>
  )
}
