import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const ITEMS = [
  { to: '/home',    label: 'HOME',    symbol: '♪' },
  { to: '/home',    label: 'SEARCH',  symbol: '♫', search: true },
  { to: '/saved',   label: 'SAVED',   symbol: '♥' },
  { to: '/profile', label: 'PROFILE', symbol: '◉' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      {ITEMS.map(({ to, label, symbol, search }) => {
        const active = search
          ? pathname === '/home'
          : pathname.startsWith(to) && !search

        return (
          <NavLink
            key={label}
            to={to}
            className={`navbar__item${active ? ' navbar__item--active' : ''}`}
          >
            {active && <span className="navbar__pill" />}
            <span className="navbar__symbol">{symbol}</span>
            <span className="navbar__label">{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
