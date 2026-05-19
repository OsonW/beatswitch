import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import Navbar from '../components/Navbar'
import './Profile.css'

const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}

export default function Profile({ user }) {
  const navigate = useNavigate()

  const displayName =
    user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const uid = user?.uid?.slice(0, 8).toUpperCase() ?? '—'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const handleSignOut = async () => {
    await signOut(auth)
    navigate('/login')
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
          onMouseMove={trackAmber}
          data-cursor-hover
          data-cursor-amber
        >
          SIGN OUT
        </button>
      </main>

      <Navbar />
    </div>
  )
}
