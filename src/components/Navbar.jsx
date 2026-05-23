// src/components/Navbar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const ITEMS = [
  { to: '/home',    label: 'HOME'    },
  { to: '/saved',   label: 'SAVED'   },
  { to: '/profile', label: 'PROFILE' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      {ITEMS.map(({ to, label }) => {
        const active = pathname.startsWith(to)
        return (
          <NavLink
            key={label}
            to={to}
            className={`navbar__item${active ? ' navbar__item--active' : ''}`}
          >
            <span className="navbar__label">{label}</span>
            {active && <span className="navbar__underline" />}
          </NavLink>
        )
      })}
    </nav>
  )
}
