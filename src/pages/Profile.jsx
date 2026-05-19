import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import Navbar from '../components/Navbar'
import './Profile.css'

export default function Profile({ user }) {
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState(null)

  const displayName =
    user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const uid = user?.uid?.slice(0, 8).toUpperCase() ?? '—'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (err) {
      console.error('Sign out failed:', err)
      setSignOutError('Sign out failed. Please try again.')
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

        <div className="profile__divider" />

        <button
          className="profile__signout"
          onClick={handleSignOut}
          data-cursor-hover
          data-cursor-amber
        >
          SIGN OUT
        </button>
        {signOutError && (
          <p className="profile__error">{signOutError}</p>
        )}
      </main>

      <Navbar />
    </div>
  )
}
