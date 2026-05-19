# Beatswitch App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Beatswitch music mood web app — all pages, components, hooks, routing, and Firebase auth.

**Architecture:** React Router v6 wraps all routes; `App.jsx` subscribes to `onAuthStateChanged` and blocks render until auth resolves. Each page is a standalone module with colocated CSS. Cursor interactions are driven by two custom hooks (`useCursor`, `useMouseTilt`) and a global `Cursor` component.

**Tech Stack:** React 19, Vite, Firebase (Auth + Firestore), React Router v6, pure CSS

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Install | — | `react-router-dom` package |
| Rewrite | `src/index.css` | Global reset, CSS vars, loading splash, `cursor: none` |
| Unchanged | `src/main.jsx` | Entry point (no changes needed) |
| Rewrite | `src/App.jsx` | Auth state, routing, loading splash, ProtectedRoute |
| Create | `src/hooks/useCursor.js` | Global mouse position `{x, y}` |
| Create | `src/hooks/useMouseTilt.js` | Per-element 3D tilt `{rotateX, rotateY}` |
| Create | `src/components/Cursor.jsx` | Dot + follower custom cursor |
| Create | `src/components/Cursor.css` | Cursor styles |
| Create | `src/components/Navbar.jsx` | Fixed-bottom nav with split-text hover |
| Create | `src/components/Navbar.css` | Navbar styles |
| Create | `src/components/VibeCard.jsx` | Tilt card with emoji + label |
| Create | `src/components/VibeCard.css` | VibeCard styles |
| Create | `src/components/TrackCard.jsx` | Track row — number, title, artist, duration |
| Create | `src/components/TrackCard.css` | TrackCard styles |
| Create | `src/pages/Login.jsx` | Login with Google OAuth + anonymous auth |
| Create | `src/pages/Login.css` | Login styles |
| Create | `src/pages/Home.jsx` | Mood input + vibe picker |
| Create | `src/pages/Home.css` | Home styles |
| Create | `src/pages/Results.jsx` | Track list + save action |
| Create | `src/pages/Results.css` | Results styles |
| Create | `src/pages/Saved.jsx` | Saved playlists from Firestore |
| Create | `src/pages/Saved.css` | Saved styles |
| Create | `src/pages/Profile.jsx` | User identity + sign out |
| Create | `src/pages/Profile.css` | Profile styles |

---

## Task 1: Install React Router and rewrite global CSS

**Files:**
- Modify: `package.json` (via npm install)
- Rewrite: `src/index.css`

- [ ] **Step 1: Install react-router-dom**

```bash
cd c:\Users\osonw\Documents\github-workspace\beatswitch
npm install react-router-dom
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Rewrite `src/index.css`**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --black: #080808;
  --white: #ffffff;
  --amber: #F5A623;
  --font: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

html,
body {
  background-color: var(--black);
  color: var(--white);
  font-family: var(--font);
  cursor: none;
  overflow-x: hidden;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-track { background: var(--black); }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }

.loading-splash {
  position: fixed;
  inset: 0;
  background: var(--black);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.loading-splash__text {
  font-size: clamp(80px, 15vw, 140px);
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  animation: splash-pulse 1.4s ease-in-out infinite;
}

@keyframes splash-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.12; }
}

.page {
  min-height: 100vh;
  background: var(--black);
  padding-bottom: 60px;
}
```

- [ ] **Step 3: Start dev server and verify black screen with no console errors**

```bash
npm run dev
```

Open `http://localhost:5173` — should show the existing stub app on a black background.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/index.css
git commit -m "feat: install react-router-dom, set global CSS foundation"
```

---

## Task 2: Create cursor hooks

**Files:**
- Create: `src/hooks/useCursor.js`
- Create: `src/hooks/useMouseTilt.js`

- [ ] **Step 1: Create `src/hooks/useCursor.js`**

```js
import { useState, useEffect } from 'react'

export function useCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })

  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY })
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [])

  return pos
}
```

- [ ] **Step 2: Create `src/hooks/useMouseTilt.js`**

```js
import { useState, useEffect } from 'react'

export function useMouseTilt(ref) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rotateY = ((e.clientX - cx) / (rect.width / 2)) * 15
      const rotateX = -((e.clientY - cy) / (rect.height / 2)) * 15
      setTilt({ rotateX, rotateY })
    }

    const onLeave = () => setTilt({ rotateX: 0, rotateY: 0 })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])

  return tilt
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCursor.js src/hooks/useMouseTilt.js
git commit -m "feat: add useCursor and useMouseTilt hooks"
```

---

## Task 3: Create Cursor component

**Files:**
- Create: `src/components/Cursor.jsx`
- Create: `src/components/Cursor.css`

- [ ] **Step 1: Create `src/components/Cursor.css`**

```css
.cursor-dot {
  position: fixed;
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: background 0.15s ease;
  top: -100px;
  left: -100px;
}

.cursor-dot--amber {
  background: #F5A623;
}

.cursor-follower {
  position: fixed;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.25s ease, height 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  top: -100px;
  left: -100px;
}

.cursor-follower--hover {
  width: 80px;
  height: 80px;
  background: white;
  border-color: white;
  mix-blend-mode: difference;
}
```

- [ ] **Step 2: Create `src/components/Cursor.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react'
import './Cursor.css'

export default function Cursor() {
  const dotRef = useRef(null)
  const followerRef = useRef(null)
  const mouse = useRef({ x: -100, y: -100 })
  const follower = useRef({ x: -100, y: -100 })
  const rafId = useRef(null)
  const [isHover, setIsHover] = useState(false)
  const [isAmber, setIsAmber] = useState(false)

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
      const target = e.target
      setIsHover(!!target.closest('[data-cursor-hover]'))
      setIsAmber(!!target.closest('[data-cursor-amber]'))
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const tick = () => {
      follower.current.x += (mouse.current.x - follower.current.x) * 0.1
      follower.current.y += (mouse.current.y - follower.current.y) * 0.1
      if (followerRef.current) {
        followerRef.current.style.left = `${follower.current.x}px`
        followerRef.current.style.top = `${follower.current.y}px`
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot${isAmber ? ' cursor-dot--amber' : ''}`}
      />
      <div
        ref={followerRef}
        className={`cursor-follower${isHover ? ' cursor-follower--hover' : ''}`}
      />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Cursor.jsx src/components/Cursor.css
git commit -m "feat: add custom cursor component with lerp follower"
```

---

## Task 4: Rewrite App.jsx with auth routing

**Files:**
- Rewrite: `src/App.jsx`

- [ ] **Step 1: Rewrite `src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Cursor from './components/Cursor'
import Login from './pages/Login'
import Home from './pages/Home'
import Results from './pages/Results'
import Saved from './pages/Saved'
import Profile from './pages/Profile'

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
      <span className="loading-splash__text">BS</span>
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
      <Cursor />
      <Routes>
        <Route
          path="/login"
          element={<AuthRoute user={user}><Login /></AuthRoute>}
        />
        <Route
          path="/home"
          element={<ProtectedRoute user={user}><Home user={user} /></ProtectedRoute>}
        />
        <Route
          path="/results"
          element={<ProtectedRoute user={user}><Results user={user} /></ProtectedRoute>}
        />
        <Route
          path="/saved"
          element={<ProtectedRoute user={user}><Saved user={user} /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>}
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/home' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Verify — dev server should show the loading splash "BS" then redirect to `/login`**

Because `/login` page doesn't exist yet, you'll see a blank screen or an import error. That's expected — the routing is wired, pages are next.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire auth routing with Firebase onAuthStateChanged"
```

---

## Task 5: Create Navbar component

**Files:**
- Create: `src/components/Navbar.jsx`
- Create: `src/components/Navbar.css`

- [ ] **Step 1: Create `src/components/Navbar.css`**

```css
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #080808;
  border-top: 1px solid #ffffff;
  display: flex;
  z-index: 200;
  height: 60px;
}

.navbar__item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  letter-spacing: 0.15em;
  font-family: system-ui, sans-serif;
  font-weight: 500;
  border-top: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
}

.navbar__item--active {
  color: #F5A623;
  border-top-color: #F5A623;
}

.navbar__item:hover {
  color: #ffffff;
}

.navbar__label {
  position: relative;
  display: block;
  overflow: hidden;
  height: 1.4em;
}

.navbar__label-inner {
  display: block;
  transition: transform 0.2s ease;
}

.navbar__label::after {
  content: attr(data-text);
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 11px;
  letter-spacing: 0.15em;
  transition: transform 0.2s ease;
}

.navbar__item:hover .navbar__label-inner,
.navbar__item:hover .navbar__label::after {
  transform: translateY(-100%);
}
```

- [ ] **Step 2: Create `src/components/Navbar.jsx`**

```jsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.jsx src/components/Navbar.css
git commit -m "feat: add Navbar with split-text hover effect"
```

---

## Task 6: Create VibeCard component

**Files:**
- Create: `src/components/VibeCard.jsx`
- Create: `src/components/VibeCard.css`

- [ ] **Step 1: Create `src/components/VibeCard.css`**

```css
.vibe-card {
  width: 140px;
  height: 180px;
  flex-shrink: 0;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 16px;
  cursor: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  transform-style: preserve-3d;
  will-change: transform;
}

.vibe-card:hover {
  border-color: #F5A623;
  box-shadow: 0 0 20px rgba(245, 166, 35, 0.35);
}

.vibe-card__emoji {
  font-size: 32px;
  line-height: 1;
}

.vibe-card__label {
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 2: Create `src/components/VibeCard.jsx`**

```jsx
import { useRef } from 'react'
import { useMouseTilt } from '../hooks/useMouseTilt'
import './VibeCard.css'

export default function VibeCard({ emoji, label, onClick }) {
  const ref = useRef(null)
  const { rotateX, rotateY } = useMouseTilt(ref)

  return (
    <button
      ref={ref}
      className="vibe-card"
      onClick={onClick}
      data-cursor-hover
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
    >
      <span className="vibe-card__emoji">{emoji}</span>
      <span className="vibe-card__label">{label}</span>
    </button>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/VibeCard.jsx src/components/VibeCard.css
git commit -m "feat: add VibeCard with 3D tilt on hover"
```

---

## Task 7: Create TrackCard component

**Files:**
- Create: `src/components/TrackCard.jsx`
- Create: `src/components/TrackCard.css`

- [ ] **Step 1: Create `src/components/TrackCard.css`**

```css
.track-card {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 24px;
  transition: transform 0.2s ease;
  position: relative;
  cursor: none;
}

.track-card::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #F5A623;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-card:hover {
  transform: translateX(8px);
}

.track-card:hover::before {
  opacity: 1;
}

.track-card__number {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.25);
  width: 24px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.track-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.track-card__title {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-card__artist {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.track-card__duration {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: Create `src/components/TrackCard.jsx`**

```jsx
import './TrackCard.css'

export default function TrackCard({ number, title, artist, duration }) {
  return (
    <div className="track-card" data-cursor-hover>
      <span className="track-card__number">
        {String(number).padStart(2, '0')}
      </span>
      <div className="track-card__info">
        <span className="track-card__title">{title}</span>
        <span className="track-card__artist">{artist}</span>
      </div>
      <span className="track-card__duration">{duration}</span>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TrackCard.jsx src/components/TrackCard.css
git commit -m "feat: add TrackCard with slide-right hover accent"
```

---

## Task 8: Create Login page

**Files:**
- Create: `src/pages/Login.jsx`
- Create: `src/pages/Login.css`

- [ ] **Step 1: Create `src/pages/Login.css`**

```css
.login {
  position: relative;
  min-height: 100vh;
  background: #080808;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.login__header {
  padding: 48px 40px 0;
}

.login__headline {
  font-size: clamp(64px, 11vw, 110px);
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  line-height: 0.9;
  color: #ffffff;
  white-space: nowrap;
  display: flex;
  margin-left: -3px;
}

.login__letter {
  display: inline-block;
  transition: transform 0.08s ease-out;
  will-change: transform;
}

.login__tagline {
  margin-top: 20px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.login__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin-top: 40px;
}

.login__actions {
  padding: 40px 40px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.login__btn {
  font-family: system-ui, sans-serif;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 16px 36px;
  border-radius: 0;
  cursor: none;
  font-weight: 700;
  transition: opacity 0.2s ease;
  border: none;
}

.login__btn:hover {
  opacity: 0.85;
}

.login__btn--spotify {
  background: radial-gradient(circle at var(--bx, 50%) var(--by, 50%), #ffca5e 0%, #F5A623 65%);
  color: #080808;
}

.login__btn--guest {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.login__features {
  position: absolute;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 2: Create `src/pages/Login.jsx`**

```jsx
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

const HEADLINE = 'BEATSWITCH'

const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}

export default function Login() {
  const navigate = useNavigate()
  const letterRefs = useRef([])

  const handleHeadlineMove = (e) => {
    letterRefs.current.forEach((ref) => {
      if (!ref) return
      const rect = ref.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const dist = Math.abs(e.clientX - cx)
      const maxDist = 140
      const shift = Math.max(0, (1 - dist / maxDist)) * -14
      ref.style.transform = `translateY(${shift}px)`
    })
  }

  const handleSpotify = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/home')
    } catch (err) {
      console.error('Sign in failed:', err)
    }
  }

  const handleGuest = async () => {
    try {
      await signInAnonymously(auth)
      navigate('/home')
    } catch (err) {
      console.error('Guest sign in failed:', err)
    }
  }

  return (
    <div className="login">
      <header className="login__header">
        <h1 className="login__headline" onMouseMove={handleHeadlineMove}>
          {HEADLINE.split('').map((ch, i) => (
            <span
              key={i}
              ref={(el) => { letterRefs.current[i] = el }}
              className="login__letter"
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="login__tagline">MUSIC THAT READS YOUR MOOD</p>
      </header>

      <div className="login__divider" />

      <div className="login__actions">
        <button
          className="login__btn login__btn--spotify"
          onClick={handleSpotify}
          onMouseMove={trackAmber}
          data-cursor-hover
          data-cursor-amber
        >
          ENTER WITH SPOTIFY
        </button>
        <button
          className="login__btn login__btn--guest"
          onClick={handleGuest}
          data-cursor-hover
        >
          CONTINUE AS GUEST
        </button>
      </div>

      <div className="login__features">
        <span>MOOD-AWARE CURATION</span>
        <span>EDITORIAL TASTE</span>
        <span>NO ALGORITHM BS</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify — navigate to `http://localhost:5173/login`**

Expect: black screen, large "BEATSWITCH" headline, tagline, divider, two buttons, feature lines bottom-right. Move mouse across headline — letters should ripple vertically. Custom cursor dot + follower visible.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login.jsx src/pages/Login.css
git commit -m "feat: build Login page with headline letter ripple and Google auth"
```

---

## Task 9: Create Home page

**Files:**
- Create: `src/pages/Home.jsx`
- Create: `src/pages/Home.css`

- [ ] **Step 1: Create `src/pages/Home.css`**

```css
.home__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.home__logo {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.home__profile-initial {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.home__main {
  padding: 48px 32px 0;
}

.home__hero {
  font-size: clamp(36px, 7vw, 60px);
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  line-height: 0.95;
  margin-bottom: 48px;
}

.home__input-group {
  display: flex;
  flex-direction: column;
  max-width: 480px;
}

.home__input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 24px;
  font-family: system-ui, sans-serif;
  padding: 10px 0;
  outline: none;
  letter-spacing: -0.01em;
  transition: border-color 0.2s ease;
}

.home__input::placeholder {
  color: rgba(255, 255, 255, 0.18);
}

.home__input:focus {
  border-bottom-color: rgba(255, 255, 255, 0.8);
}

.home__generate-btn {
  background: radial-gradient(circle at var(--bx, 50%) var(--by, 50%), #ffca5e 0%, #F5A623 65%);
  color: #080808;
  border: none;
  border-radius: 0;
  padding: 15px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 700;
  font-family: system-ui, sans-serif;
  cursor: none;
  width: 100%;
  transition: opacity 0.2s ease;
  margin-top: 0;
}

.home__generate-btn:hover {
  opacity: 0.9;
}

.home__divider {
  position: relative;
  max-width: 480px;
  margin: 48px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.home__divider-text {
  position: absolute;
  background: #080808;
  padding: 0 14px;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}

.home__vibes {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}

.home__vibes::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Create `src/pages/Home.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import './Home.css'

const VIBES = [
  { emoji: '🌧️', label: 'MELANCHOLIC' },
  { emoji: '⚡', label: 'EUPHORIC' },
  { emoji: '🔥', label: 'RAGE' },
  { emoji: '🕯️', label: 'TENDER' },
  { emoji: '🌫️', label: 'NUMB' },
  { emoji: '🧪', label: 'WIRED' },
]

const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}

export default function Home({ user }) {
  const [mood, setMood] = useState('')
  const navigate = useNavigate()

  const initial =
    user?.displayName?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    'G'

  const handleGenerate = () => {
    if (!mood.trim()) return
    navigate('/results', { state: { mood: mood.trim() } })
  }

  return (
    <div className="home page">
      <header className="home__topbar">
        <span className="home__logo">BS</span>
        <span className="home__profile-initial" data-cursor-hover>
          {initial}
        </span>
      </header>

      <main className="home__main">
        <h1 className="home__hero">
          WHAT ARE YOU<br />FEELING?
        </h1>

        <div className="home__input-group">
          <input
            className="home__input"
            type="text"
            placeholder="describe your mood..."
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            className="home__generate-btn"
            onClick={handleGenerate}
            onMouseMove={trackAmber}
            data-cursor-hover
            data-cursor-amber
          >
            GENERATE
          </button>
        </div>

        <div className="home__divider">
          <span className="home__divider-text">OR CHOOSE A VIBE</span>
        </div>

        <div className="home__vibes">
          {VIBES.map((v) => (
            <VibeCard
              key={v.label}
              emoji={v.emoji}
              label={v.label}
              onClick={() => navigate('/results', { state: { mood: v.label } })}
            />
          ))}
        </div>
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 3: Verify — navigate to `/home` after logging in**

Expect: top bar with "BS" + initial, large hero text, underline input, amber GENERATE button, divider, horizontal vibe card row. Typing in input and pressing Enter navigates to `/results`. Vibe cards tilt in 3D on hover.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.css
git commit -m "feat: build Home page with mood input and vibe card row"
```

---

## Task 10: Create Results page

**Files:**
- Create: `src/pages/Results.jsx`
- Create: `src/pages/Results.css`

- [ ] **Step 1: Create `src/pages/Results.css`**

```css
.results__header {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.results__back {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 22px;
  cursor: none;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
}

.results__back:hover {
  color: #ffffff;
}

.results__main {
  padding: 32px 32px 0;
}

.results__mood {
  font-size: 32px;
  font-style: italic;
  color: #F5A623;
  letter-spacing: -0.02em;
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.1;
}

.results__subtitle {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 36px;
}

.results__tracks {
  margin-bottom: 48px;
}

.results__actions {
  display: flex;
  gap: 12px;
}

.results__btn {
  flex: 1;
  padding: 16px;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 700;
  font-family: system-ui, sans-serif;
  border-radius: 0;
  cursor: none;
  transition: opacity 0.2s ease;
}

.results__btn:hover:not(:disabled) {
  opacity: 0.85;
}

.results__btn--save {
  background: radial-gradient(circle at var(--bx, 50%) var(--by, 50%), #ffca5e 0%, #F5A623 65%);
  color: #080808;
  border: none;
}

.results__btn--save:disabled {
  opacity: 0.45;
  cursor: default;
}

.results__btn--export {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 2: Create `src/pages/Results.jsx`**

```jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import TrackCard from '../components/TrackCard'
import './Results.css'

const PLACEHOLDER_TRACKS = [
  { title: 'Silver Lining', artist: 'MITSKI', duration: '3:42' },
  { title: 'Motion Sickness', artist: 'PHOEBE BRIDGERS', duration: '4:01' },
  { title: 'Dissolve', artist: 'ABSOFACTO', duration: '3:18' },
  { title: 'Garden Song', artist: 'PHOEBE BRIDGERS', duration: '2:33' },
  { title: 'Nobody', artist: 'MITSKI', duration: '2:42' },
]

const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}

export default function Results({ user }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const mood = state?.mood ?? 'UNKNOWN'
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!user?.uid) return
    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood} MIX`,
        mood,
        createdAt: serverTimestamp(),
        tracks: PLACEHOLDER_TRACKS,
      })
      setSaved(true)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <div className="results page">
      <header className="results__header">
        <button
          className="results__back"
          onClick={() => navigate(-1)}
          data-cursor-hover
        >
          ←
        </button>
      </header>

      <main className="results__main">
        <p className="results__mood">"{mood}"</p>
        <p className="results__subtitle">— GENERATED FOR YOU —</p>

        <div className="results__tracks">
          {PLACEHOLDER_TRACKS.map((track, i) => (
            <TrackCard
              key={i}
              number={i + 1}
              title={track.title}
              artist={track.artist}
              duration={track.duration}
            />
          ))}
        </div>

        <div className="results__actions">
          <button
            className="results__btn results__btn--save"
            onClick={handleSave}
            onMouseMove={trackAmber}
            disabled={saved}
            data-cursor-hover
            data-cursor-amber
          >
            {saved ? 'SAVED ✓' : 'SAVE PLAYLIST'}
          </button>
          <button
            className="results__btn results__btn--export"
            data-cursor-hover
          >
            EXPORT TO SPOTIFY
          </button>
        </div>
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 3: Verify — enter a mood on Home and submit**

Expect: back arrow, mood query in amber italic, subtitle, 5 track rows (hover = shift right + amber accent), two action buttons at bottom. "SAVE PLAYLIST" writes to Firestore for authenticated users.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Results.jsx src/pages/Results.css
git commit -m "feat: build Results page with track list and Firestore save"
```

---

## Task 11: Create Saved page

**Files:**
- Create: `src/pages/Saved.jsx`
- Create: `src/pages/Saved.css`

- [ ] **Step 1: Create `src/pages/Saved.css`**

```css
.saved {
  position: relative;
  overflow: hidden;
}

.saved__watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(100px, 20vw, 200px);
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.025);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  white-space: nowrap;
}

.saved__main {
  position: relative;
  z-index: 1;
  padding: 48px 32px 0;
}

.saved__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 100px 0;
}

.saved__empty-line {
  width: 48px;
  height: 1px;
  background: #F5A623;
}

.saved__empty-text {
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
}

.saved__playlist {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.saved__playlist-row {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  background: none;
  border: none;
  color: #ffffff;
  cursor: none;
  text-align: left;
  gap: 16px;
  transition: opacity 0.2s ease;
}

.saved__playlist-row:hover {
  opacity: 0.75;
}

.saved__playlist-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-align: left;
  text-transform: uppercase;
}

.saved__playlist-date {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.28);
  text-transform: uppercase;
  flex-shrink: 0;
}

.saved__playlist-count {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.22);
  text-transform: uppercase;
  min-width: 70px;
  text-align: right;
  flex-shrink: 0;
}

.saved__playlist-tracks {
  padding: 0 0 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.saved__track {
  display: flex;
  align-items: center;
  padding: 10px 0;
  gap: 16px;
}

.saved__track-num {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  width: 20px;
  flex-shrink: 0;
}

.saved__track-title {
  flex: 1;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

.saved__track-artist {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.28);
  flex-shrink: 0;
}

.saved__track-dur {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Create `src/pages/Saved.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import './Saved.css'

const formatDate = (ts) => {
  if (!ts?.seconds) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Saved({ user }) {
  const [playlists, setPlaylists] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  const toggle = (id) =>
    setExpanded((prev) => (prev === id ? null : id))

  return (
    <div className="saved page">
      <div className="saved__watermark" aria-hidden="true">SAVED</div>

      <main className="saved__main">
        {playlists.length === 0 ? (
          <div className="saved__empty">
            <div className="saved__empty-line" />
            <p className="saved__empty-text">NO SAVED PLAYLISTS YET</p>
            <div className="saved__empty-line" />
          </div>
        ) : (
          <div className="saved__list">
            {playlists.map((pl) => (
              <div key={pl.id} className="saved__playlist">
                <button
                  className="saved__playlist-row"
                  onClick={() => toggle(pl.id)}
                  data-cursor-hover
                >
                  <span className="saved__playlist-name">{pl.name}</span>
                  <span className="saved__playlist-date">
                    {formatDate(pl.createdAt)}
                  </span>
                  <span className="saved__playlist-count">
                    {pl.tracks?.length ?? 0} TRACKS
                  </span>
                </button>

                {expanded === pl.id && (
                  <div className="saved__playlist-tracks">
                    {(pl.tracks ?? []).map((t, i) => (
                      <div key={i} className="saved__track">
                        <span className="saved__track-num">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="saved__track-title">{t.title}</span>
                        <span className="saved__track-artist">{t.artist}</span>
                        <span className="saved__track-dur">{t.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 3: Verify — navigate to `/saved`**

Expect: faint "SAVED" watermark, empty state with amber lines and message (if no playlists saved yet). After saving from Results, rows appear with name / date / count. Click a row to expand tracks inline.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Saved.jsx src/pages/Saved.css
git commit -m "feat: build Saved page with Firestore subscription and expand/collapse"
```

---

## Task 12: Create Profile page

**Files:**
- Create: `src/pages/Profile.jsx`
- Create: `src/pages/Profile.css`

- [ ] **Step 1: Create `src/pages/Profile.css`**

```css
.profile__main {
  padding: 64px 32px;
}

.profile__identity {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 56px;
}

.profile__initial-box {
  width: 64px;
  height: 64px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  flex-shrink: 0;
}

.profile__name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.profile__uid {
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.28);
}

.profile__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin-bottom: 56px;
}

.profile__signout {
  background: radial-gradient(circle at var(--bx, 50%) var(--by, 50%), #ffca5e 0%, #F5A623 65%);
  color: #080808;
  border: none;
  border-radius: 0;
  padding: 16px 36px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 700;
  font-family: system-ui, sans-serif;
  cursor: none;
  transition: opacity 0.2s ease;
}

.profile__signout:hover {
  opacity: 0.85;
}
```

- [ ] **Step 2: Create `src/pages/Profile.jsx`**

```jsx
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
```

- [ ] **Step 3: Verify — navigate to `/profile`**

Expect: large initial box, display name + truncated UID, divider, amber SIGN OUT button. Clicking SIGN OUT calls `auth.signOut()` and redirects to `/login`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.jsx src/pages/Profile.css
git commit -m "feat: build Profile page with sign out"
```

---

## Final Verification

- [ ] **Full flow test**

1. Open `http://localhost:5173` — loading splash "BS" pulses, then `/login` appears
2. Click "CONTINUE AS GUEST" — navigates to `/home`
3. Type a mood, press Enter — navigates to `/results` with mood in amber
4. Hover track rows — shift right + amber left accent
5. Click "SAVE PLAYLIST" — button shows "SAVED ✓"
6. Navigate to `/saved` — playlist row appears, click to expand
7. Navigate to `/profile` — shows "GUEST" identity, sign out works
8. Vibe cards on Home tilt in 3D on hover
9. Cursor dot + follower visible everywhere, follower expands + inverts on hover targets
10. Navbar active state updates with amber on each page
11. Refreshing any protected page redirects to `/login` when signed out

- [ ] **Final commit**

```bash
git add .
git commit -m "feat: complete Beatswitch app structure — all pages, components, hooks"
```
