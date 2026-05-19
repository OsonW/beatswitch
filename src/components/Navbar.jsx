import { NavLink } from 'react-router-dom'
import './Navbar.css'

const LINKS = [
  { to: '/home', label: 'HOME' },
  { to: '/saved', label: 'SAVED' },
  { to: '/profile', label: 'PROFILE' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      {LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `navbar__item${isActive ? ' navbar__item--active' : ''}`
          }
          data-cursor-hover
        >
          <span className="navbar__label" data-text={label}>
            <span className="navbar__label-inner">{label}</span>
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
