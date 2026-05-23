# Beatswitch UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely replace Beatswitch's existing editorial-fashion UI with a bubbly, music-obsessed, mobile-first design featuring coral/lime/violet palette, vinyl records, waveform animations, organic blob shapes, and tactile touch interactions.

**Architecture:** 13 tasks in strict dependency order — foundation first (global CSS + App.jsx), primitive components (Waveform, Vinyl), utility hooks, Ripple component, composite components (Navbar, VibeCard, TrackCard), then all five pages. Each task is fully self-contained with complete file content.

**Tech Stack:** React 19, Vite, Firebase Auth + Firestore, React Router v7, pure CSS only (no libraries), mobile-first at 390px

---

## File Map

**DELETE (old design — no longer needed):**
- `src/App.css`
- `src/components/Cursor.jsx` + `Cursor.css`
- `src/hooks/useCursor.js`
- `src/hooks/useMouseTilt.js`
- `src/utils/trackAmber.js`

**REWRITE (same path, completely new content):**
- `src/index.css`
- `src/App.jsx`
- `src/components/Navbar.jsx` + `Navbar.css`
- `src/components/VibeCard.jsx` + `VibeCard.css`
- `src/components/TrackCard.jsx` + `TrackCard.css`
- `src/pages/Login.jsx` + `Login.css`
- `src/pages/Home.jsx` + `Home.css`
- `src/pages/Results.jsx` + `Results.css`
- `src/pages/Saved.jsx` + `Saved.css`
- `src/pages/Profile.jsx` + `Profile.css`

**CREATE (new files):**
- `src/components/Vinyl.jsx` + `Vinyl.css`
- `src/components/Waveform.jsx` + `Waveform.css`
- `src/components/Ripple.jsx` + `Ripple.css`
- `src/hooks/useRipple.js`
- `src/hooks/useSwipe.js`
- `src/hooks/useLongPress.js`

**KEEP UNCHANGED:**
- `src/firebase.js`
- `src/main.jsx`
- `firestore.rules`

---

### Task 1: Foundation — global CSS, App.jsx loading screen, delete old files

**Files:**
- Rewrite: `src/index.css`
- Rewrite: `src/App.jsx`
- Delete: `src/App.css`, `src/components/Cursor.jsx`, `src/components/Cursor.css`, `src/hooks/useCursor.js`, `src/hooks/useMouseTilt.js`, `src/utils/trackAmber.js`

- [ ] **Step 1: Delete old files**

In the project root (`c:\Users\osonw\Documents\github-workspace\beatswitch`), remove files that belong to the old design:

```powershell
Remove-Item src/App.css
Remove-Item src/components/Cursor.jsx
Remove-Item src/components/Cursor.css
Remove-Item src/hooks/useCursor.js
Remove-Item src/hooks/useMouseTilt.js
Remove-Item src/utils/trackAmber.js
```

- [ ] **Step 2: Write new `src/index.css`**

Replace the entire file with:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0A0A0A;
  --bg-card: #1A1A1A;
  --bg-muted: #333333;
  --coral: #FF6B35;
  --lime: #C8FF00;
  --violet: #A259FF;
  --white: #F5F5F5;
  --muted: #555555;
  --font: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --radius-pill: 999px;
  --radius-card: 24px;
  --radius-lg: 32px;
  --radius-xl: 48px;
  color-scheme: dark;
}

html, body {
  background: var(--bg);
  color: var(--white);
  font-family: var(--font);
  overflow-x: hidden;
  min-height: 100vh;
  scrollbar-width: none;
  -webkit-tap-highlight-color: transparent;
}

::-webkit-scrollbar { display: none; }

::selection {
  background: var(--coral);
  color: #000;
}

button {
  font-family: var(--font);
  cursor: pointer;
  border: none;
  background: none;
}

button:active {
  transform: scale(0.95);
  transition: transform 0.08s ease;
}

.page {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 80px;
}

/* ── Loading splash ───────────────────────────── */
.loading-splash {
  position: fixed;
  inset: 0;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 10000;
}

.loading-eq {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 36px;
}

.loading-eq__bar {
  width: 4px;
  border-radius: 2px;
  background: var(--coral);
  animation: eq-bounce 0.9s ease-in-out infinite alternate;
}

.loading-eq__bar:nth-child(1) { animation-delay: 0s;    animation-duration: 0.9s; }
.loading-eq__bar:nth-child(2) { animation-delay: 0.15s; animation-duration: 0.8s; }
.loading-eq__bar:nth-child(3) { animation-delay: 0.3s;  animation-duration: 1.1s; }
.loading-eq__bar:nth-child(4) { animation-delay: 0.45s; animation-duration: 0.75s; }
.loading-eq__bar:nth-child(5) { animation-delay: 0.6s;  animation-duration: 0.95s; }

@keyframes eq-bounce {
  0%   { height: 4px; }
  100% { height: 36px; }
}

.loading-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ── Shared keyframes ─────────────────────────── */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

@keyframes blob-morph {
  0%, 100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
  33%       { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
  66%       { border-radius: 70% 30% 50% 50% / 40% 60% 50% 60%; }
}

@keyframes ripple-expand {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
  to   { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}

/* ── Ripple host ──────────────────────────────── */
.ripple-host {
  position: relative;
  overflow: hidden;
}

.ripple-circle {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  animation: ripple-expand 0.55s ease-out forwards;
}
```

- [ ] **Step 3: Rewrite `src/App.jsx`**

Replace the entire file with the following. Key changes from old version: Cursor component removed, LoadingSplash uses equalizer bars, auth logic is unchanged.

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
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
      <Routes>
        <Route path="/login"   element={<AuthRoute user={user}><Login /></AuthRoute>} />
        <Route path="/home"    element={<ProtectedRoute user={user}><Home user={user} /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute user={user}><Results user={user} /></ProtectedRoute>} />
        <Route path="/saved"   element={<ProtectedRoute user={user}><Saved user={user} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
        <Route path="*"        element={<Navigate to={user ? '/home' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Verify build is clean**

```powershell
npm run build
```

Expected: build succeeds with no errors (chunk size warnings are fine).

- [ ] **Step 5: Commit**

```powershell
git add src/index.css src/App.jsx
git rm src/App.css src/components/Cursor.jsx src/components/Cursor.css src/hooks/useCursor.js src/hooks/useMouseTilt.js src/utils/trackAmber.js
git commit -m "refactor: new design foundation — global CSS, loading screen, remove old cursor system"
```

---

### Task 2: Waveform component

**Files:**
- Create: `src/components/Waveform.jsx`
- Create: `src/components/Waveform.css`

- [ ] **Step 1: Create `src/components/Waveform.jsx`**

```jsx
import './Waveform.css'

export default function Waveform({ color, speed = 'fast', bars = 5 }) {
  return (
    <div
      className={`waveform waveform--${speed}`}
      style={color ? { '--wf-color': color } : undefined}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="waveform__bar" style={{ '--i': i }} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/Waveform.css`**

```css
.waveform {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
  flex-shrink: 0;
}

.waveform__bar {
  width: 3px;
  border-radius: 2px;
  background: var(--wf-color, var(--coral));
  height: 4px;
  animation: wf-bounce 0.8s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * 0.12s);
}

.waveform--slow .waveform__bar {
  animation-duration: 2s;
}

.waveform--fast .waveform__bar {
  animation-duration: 0.6s;
}

@keyframes wf-bounce {
  0%   { height: 4px; }
  100% { height: 20px; }
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Waveform.jsx src/components/Waveform.css
git commit -m "feat: add Waveform component with staggered bar animation"
```

---

### Task 3: Vinyl component

**Files:**
- Create: `src/components/Vinyl.jsx`
- Create: `src/components/Vinyl.css`

- [ ] **Step 1: Create `src/components/Vinyl.jsx`**

Props:
- `size`: `'small'` (80px) | `'medium'` (160px) | `'large'` (240px), default `'medium'`
- `active`: boolean — when true, the record spins

```jsx
import './Vinyl.css'

export default function Vinyl({ size = 'medium', active = false }) {
  return (
    <div className={`vinyl vinyl--${size}${active ? ' vinyl--active' : ''}`}>
      <div className="vinyl__disc">
        <div className="vinyl__grooves" />
        <div className="vinyl__label">BS</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/Vinyl.css`**

```css
.vinyl {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl--small  { width: 80px;  height: 80px; }
.vinyl--medium { width: 160px; height: 160px; }
.vinyl--large  { width: 240px; height: 240px; }

.vinyl__disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    #2a2a2a 0%,
    #1a1a1a 25%,
    #222    40%,
    #1a1a1a 55%,
    #222    70%,
    #1a1a1a 85%,
    #111    100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vinyl--active .vinyl__disc {
  animation: spin-slow 4s linear infinite;
}

.vinyl__grooves {
  position: absolute;
  inset: 15%;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.04),
    0 0 0 5px rgba(255,255,255,0.03),
    0 0 0 10px rgba(255,255,255,0.02),
    0 0 0 16px rgba(255,255,255,0.015),
    0 0 0 22px rgba(255,255,255,0.01);
}

.vinyl__label {
  width: 34%;
  height: 34%;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35 0%, #FF9500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(8px, 3.5cqi, 18px);
  font-weight: 900;
  color: #000;
  letter-spacing: -0.02em;
  z-index: 1;
  position: relative;
}

.vinyl--small  .vinyl__label { font-size: 10px; }
.vinyl--medium .vinyl__label { font-size: 18px; }
.vinyl--large  .vinyl__label { font-size: 28px; }
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Vinyl.jsx src/components/Vinyl.css
git commit -m "feat: add Vinyl component with groove rings and spin animation"
```

---

### Task 4: Utility hooks — useRipple, useSwipe, useLongPress

**Files:**
- Create: `src/hooks/useRipple.js`
- Create: `src/hooks/useSwipe.js`
- Create: `src/hooks/useLongPress.js`

- [ ] **Step 1: Create `src/hooks/useRipple.js`**

The hook appends a `.ripple-circle` span to the element referenced by `ref`, then removes it after the animation ends. The `.ripple-circle` style is in `index.css`.

```js
import { useCallback } from 'react'

export function useRipple(ref) {
  return useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const touch = e.changedTouches?.[0] ?? e
    const x = (touch.clientX - rect.left)
    const y = (touch.clientY - rect.top)
    const span = document.createElement('span')
    span.className = 'ripple-circle'
    span.style.left = `${x}px`
    span.style.top = `${y}px`
    el.appendChild(span)
    span.addEventListener('animationend', () => span.remove(), { once: true })
  }, [ref])
}
```

- [ ] **Step 2: Create `src/hooks/useSwipe.js`**

Returns touch event handlers to attach to a container element. `onSwipeLeft` fires when the user swipes left more than `threshold` pixels.

```js
import { useRef, useCallback } from 'react'

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 } = {}) {
  const startX = useRef(null)

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return
    const delta = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (delta < -threshold) onSwipeLeft?.()
    else if (delta > threshold) onSwipeRight?.()
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchEnd }
}
```

- [ ] **Step 3: Create `src/hooks/useLongPress.js`**

Returns touch event handlers that fire `callback` after `duration` ms of uninterrupted press.

```js
import { useRef, useCallback } from 'react'

export function useLongPress(callback, duration = 600) {
  const timer = useRef(null)

  const start = useCallback((e) => {
    e.preventDefault()
    timer.current = setTimeout(() => callback(e), duration)
  }, [callback, duration])

  const cancel = useCallback(() => {
    clearTimeout(timer.current)
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
  }
}
```

- [ ] **Step 4: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 5: Commit**

```powershell
git add src/hooks/useRipple.js src/hooks/useSwipe.js src/hooks/useLongPress.js
git commit -m "feat: add useRipple, useSwipe, useLongPress hooks"
```

---

### Task 5: Ripple component

**Files:**
- Create: `src/components/Ripple.jsx`
- Create: `src/components/Ripple.css`

The `Ripple` component wraps a `<button>` and adds ripple-on-tap via `useRipple`. Use it wherever a major action button needs the ripple effect. The `.ripple-host` and `.ripple-circle` base styles live in `index.css` — `Ripple.css` only adds the button's visual style defaults.

- [ ] **Step 1: Create `src/components/Ripple.jsx`**

```jsx
import { useRef } from 'react'
import { useRipple } from '../hooks/useRipple'
import './Ripple.css'

export default function Ripple({ children, className = '', onClick, disabled, ...props }) {
  const ref = useRef(null)
  const triggerRipple = useRipple(ref)

  const handleInteraction = (e) => {
    if (!disabled) {
      triggerRipple(e)
      onClick?.(e)
    }
  }

  return (
    <button
      ref={ref}
      className={`ripple-host ripple-btn ${className}`}
      onTouchEnd={handleInteraction}
      onClick={handleInteraction}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Create `src/components/Ripple.css`**

```css
.ripple-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: var(--radius-pill);
  padding: 18px 24px;
  width: 100%;
  transition: transform 0.08s ease, opacity 0.15s ease;
  user-select: none;
}

.ripple-btn:active {
  transform: scale(0.97);
}

.ripple-btn:disabled {
  opacity: 0.5;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Ripple.jsx src/components/Ripple.css
git commit -m "feat: add Ripple button component with tap ripple effect"
```

---

### Task 6: Navbar component (new design)

**Files:**
- Rewrite: `src/components/Navbar.jsx`
- Rewrite: `src/components/Navbar.css`

The new Navbar is fixed bottom, coral top border, four items (HOME, SEARCH, SAVED, PROFILE), active item gets coral color + pill background indicator + bouncy scale animation on tap.

SEARCH maps to `/home`. Active state is determined by `useLocation`.

- [ ] **Step 1: Write `src/components/Navbar.jsx`**

```jsx
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
```

- [ ] **Step 2: Write `src/components/Navbar.css`**

```css
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: #0A0A0A;
  border-top: 1.5px solid var(--coral);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.navbar__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--muted);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  transition: color 0.15s ease, transform 0.1s ease;
  min-width: 64px;
}

.navbar__item:active {
  transform: scale(0.88);
}

.navbar__item--active {
  color: var(--coral);
}

.navbar__pill {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-pill);
  background: rgba(255, 107, 53, 0.12);
  pointer-events: none;
}

.navbar__symbol {
  font-size: 20px;
  line-height: 1;
}

.navbar__label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/Navbar.jsx src/components/Navbar.css
git commit -m "feat: redesign Navbar with coral active indicator and pill highlight"
```

---

### Task 7: VibeCard component (3D flip)

**Files:**
- Rewrite: `src/components/VibeCard.jsx`
- Rewrite: `src/components/VibeCard.css`

VibeCard is a pill-shaped card that flips 180° on tap to show a poetic description. Each vibe has a unique gradient and emoji. Active vibe gets a coral glow border.

- [ ] **Step 1: Write `src/components/VibeCard.jsx`**

```jsx
import { useState } from 'react'
import './VibeCard.css'

const VIBE_DATA = {
  HYPE:        { emoji: '🔥', back: 'pure energy released',   gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF9500 100%)' },
  MELANCHOLIC: { emoji: '🌙', back: 'beautifully broken',     gradient: 'linear-gradient(135deg, #A259FF 0%, #1A1A3E 100%)' },
  FOCUS:       { emoji: '🎯', back: 'locked in flow',         gradient: 'linear-gradient(135deg, #C8FF00 0%, #00D4AA 100%)' },
  'LATE NIGHT':{ emoji: '🌃', back: 'city lights & silence',  gradient: 'linear-gradient(135deg, #4B0082 0%, #0A0A0A 100%)' },
  HEARTBREAK:  { emoji: '💔', back: 'feels that heal',        gradient: 'linear-gradient(135deg, #FF6B9D 0%, #A259FF 100%)' },
  'ROAD TRIP': { emoji: '🚗', back: 'windows down, no plans', gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 100%)' },
}

export default function VibeCard({ vibe, active = false, onSelect }) {
  const [flipped, setFlipped] = useState(false)
  const { emoji, back, gradient } = VIBE_DATA[vibe] ?? VIBE_DATA.HYPE

  const handleTap = () => {
    setFlipped(f => !f)
    onSelect?.(vibe)
  }

  return (
    <div
      className={`vibe-card${flipped ? ' vibe-card--flipped' : ''}${active ? ' vibe-card--active' : ''}`}
      style={{ '--vc-gradient': gradient }}
      onClick={handleTap}
    >
      <div className="vibe-card__inner">
        <div className="vibe-card__front">
          <span className="vibe-card__emoji">{emoji}</span>
          <span className="vibe-card__label">{vibe}</span>
        </div>
        <div className="vibe-card__back">
          <span className="vibe-card__desc">{back}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/VibeCard.css`**

```css
.vibe-card {
  flex-shrink: 0;
  width: 160px;
  height: 80px;
  border-radius: var(--radius-pill);
  perspective: 600px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  user-select: none;
}

.vibe-card--active {
  box-shadow: 0 0 0 2px var(--coral), 0 0 12px rgba(255,107,53,0.3);
}

.vibe-card:active {
  transform: scale(0.95);
  transition: transform 0.08s ease;
}

.vibe-card__inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-pill);
}

.vibe-card--flipped .vibe-card__inner {
  transform: rotateY(180deg);
}

.vibe-card__front,
.vibe-card__back {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-pill);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: var(--vc-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
}

.vibe-card__back {
  transform: rotateY(180deg);
}

.vibe-card__emoji {
  font-size: 22px;
}

.vibe-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.95);
  white-space: nowrap;
}

.vibe-card__desc {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.9);
  text-align: center;
  line-height: 1.4;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/VibeCard.jsx src/components/VibeCard.css
git commit -m "feat: redesign VibeCard with 3D flip and vibe-specific gradients"
```

---

### Task 8: TrackCard component (swipe-to-save)

**Files:**
- Rewrite: `src/components/TrackCard.jsx`
- Rewrite: `src/components/TrackCard.css`

TrackCard shows album art placeholder, song name, artist, duration, and heart button. Swipe left reveals a coral SAVE action. Active/playing state shows a coral left bar and waveform animation.

- [ ] **Step 1: Write `src/components/TrackCard.jsx`**

`track` prop shape: `{ name: string, artist: string, duration: string }`
`index` prop: number (0-based) — used to pick a unique album art gradient
`playing` prop: boolean

```jsx
import { useState } from 'react'
import { useSwipe } from '../hooks/useSwipe'
import Waveform from './Waveform'
import './TrackCard.css'

const ART_GRADIENTS = [
  'linear-gradient(135deg, #FF6B35, #A259FF)',
  'linear-gradient(135deg, #C8FF00, #00D4AA)',
  'linear-gradient(135deg, #A259FF, #4B0082)',
  'linear-gradient(135deg, #FF6B9D, #FF6B35)',
  'linear-gradient(135deg, #FFB347, #C8FF00)',
]

export default function TrackCard({ track, index = 0, playing = false, onSave }) {
  const [swiped, setSwiped] = useState(false)
  const [liked, setLiked] = useState(false)

  const swipe = useSwipe({
    onSwipeLeft:  () => setSwiped(true),
    onSwipeRight: () => setSwiped(false),
  })

  const gradient = ART_GRADIENTS[index % ART_GRADIENTS.length]

  return (
    <div className={`tc-wrapper${swiped ? ' tc-wrapper--swiped' : ''}`}>
      <div
        className={`track-card${playing ? ' track-card--playing' : ''}`}
        {...swipe}
      >
        {playing && <div className="track-card__bar" />}
        <div className="track-card__art" style={{ background: gradient }} />
        <div className="track-card__info">
          <p className={`track-card__name${playing ? ' track-card__name--playing' : ''}`}>
            {track.name}
          </p>
          {playing && <Waveform speed="fast" bars={4} />}
          {!playing && <p className="track-card__artist">{track.artist}</p>}
        </div>
        <div className="track-card__meta">
          <span className="track-card__duration">{track.duration}</span>
          <button
            className={`track-card__heart${liked ? ' track-card__heart--liked' : ''}`}
            onClick={() => setLiked(l => !l)}
          >
            ♥
          </button>
        </div>
      </div>
      <button
        className="tc-save-action"
        onClick={() => { onSave?.(); setSwiped(false) }}
      >
        SAVE
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/components/TrackCard.css`**

```css
.tc-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 10px;
}

.track-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--bg-card);
  border-radius: 16px;
  position: relative;
  z-index: 1;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.tc-wrapper--swiped .track-card {
  transform: translateX(-80px);
}

.track-card--playing {
  border-left: none;
}

.track-card__bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--coral);
  border-radius: 16px 0 0 16px;
}

.track-card__art {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  flex-shrink: 0;
}

.track-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-card__name--playing {
  color: var(--coral);
}

.track-card__artist {
  font-size: 12px;
  color: var(--muted);
}

.track-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.track-card__duration {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.05em;
}

.track-card__heart {
  font-size: 16px;
  color: var(--muted);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.15s ease, transform 0.1s ease;
}

.track-card__heart--liked {
  color: var(--coral);
}

.track-card__heart:active {
  transform: scale(1.3);
}

.tc-save-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: var(--coral);
  color: #000;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  border-radius: 0 16px 16px 0;
  transition: opacity 0.15s ease;
}

.tc-save-action:active {
  opacity: 0.8;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/components/TrackCard.jsx src/components/TrackCard.css
git commit -m "feat: redesign TrackCard with swipe-to-reveal save action and playing state"
```

---

### Task 9: Login page

**Files:**
- Rewrite: `src/pages/Login.jsx`
- Rewrite: `src/pages/Login.css`

Login shows an animated vinyl record (large, spinning), floating music notes, the BEATSWITCH wordmark (BEAT white / SWITCH coral), tagline, two pill buttons (Spotify = coral, Guest = violet), and three feature lines. Two large blob shapes sit in the background.

Firebase: `signInWithPopup` with `GoogleAuthProvider` for Spotify button; `signInAnonymously` for Guest. Navigation to `/home` is handled automatically by `AuthRoute` in App.jsx when `onAuthStateChanged` fires — do NOT call `navigate` after sign-in.

- [ ] **Step 1: Write `src/pages/Login.jsx`**

```jsx
import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import Vinyl from '../components/Vinyl'
import './Login.css'

export default function Login() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(null)

  const handleGoogle = async () => {
    setLoading('google')
    setError(null)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign in failed. Please try again.')
      }
      setLoading(null)
    }
  }

  const handleGuest = async () => {
    setLoading('guest')
    setError(null)
    try {
      await signInAnonymously(auth)
    } catch (err) {
      setError('Could not continue as guest. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="login">
      <div className="login__blob login__blob--1" />
      <div className="login__blob login__blob--2" />

      <div className="login__vinyl-area">
        <div className="login__note login__note--1">♪</div>
        <div className="login__note login__note--2">♫</div>
        <div className="login__note login__note--3">♪</div>
        <Vinyl size="large" active />
      </div>

      <div className="login__content">
        <h1 className="login__wordmark">
          <span className="login__beat">BEAT</span>
          <span className="login__switch">SWITCH</span>
        </h1>
        <p className="login__tagline">drop a feeling. get a playlist.</p>
      </div>

      <div className="login__actions">
        <button
          className="login__btn login__btn--spotify ripple-host"
          onClick={handleGoogle}
          disabled={loading !== null}
        >
          {loading === 'google' ? '···' : 'CONTINUE WITH SPOTIFY'}
        </button>
        <button
          className="login__btn login__btn--guest ripple-host"
          onClick={handleGuest}
          disabled={loading !== null}
        >
          {loading === 'guest' ? '···' : 'BROWSE AS GUEST'}
        </button>
        {error && <p className="login__error">{error}</p>}
      </div>

      <div className="login__features">
        <span>♪ mood-aware curation</span>
        <span>♪ editorial taste</span>
        <span>♪ no algorithm bs</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/Login.css`**

```css
.login {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 48px;
  position: relative;
  overflow: hidden;
}

/* Background blobs */
.login__blob {
  position: absolute;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  pointer-events: none;
  animation: blob-morph 8s ease-in-out infinite;
}

.login__blob--1 {
  width: 320px;
  height: 320px;
  background: var(--coral);
  opacity: 0.07;
  top: -80px;
  right: -80px;
  animation-delay: 0s;
}

.login__blob--2 {
  width: 280px;
  height: 280px;
  background: var(--violet);
  opacity: 0.06;
  bottom: 100px;
  left: -80px;
  animation-delay: -4s;
}

/* Vinyl area */
.login__vinyl-area {
  position: relative;
  margin-top: 80px;
  margin-bottom: 40px;
}

.login__note {
  position: absolute;
  font-size: 32px;
  color: var(--white);
  opacity: 0.15;
  animation: float 3s ease-in-out infinite;
  user-select: none;
}

.login__note--1 {
  top: -20px;
  left: -40px;
  animation-duration: 2.8s;
  animation-delay: 0s;
  font-size: 28px;
}

.login__note--2 {
  top: 20px;
  right: -50px;
  animation-duration: 3.5s;
  animation-delay: -1s;
  font-size: 36px;
}

.login__note--3 {
  bottom: -10px;
  left: -20px;
  animation-duration: 4s;
  animation-delay: -2s;
  font-size: 20px;
}

/* Wordmark */
.login__content {
  text-align: center;
  margin-bottom: 48px;
}

.login__wordmark {
  font-size: clamp(52px, 16vw, 80px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.login__beat {
  color: var(--white);
}

.login__switch {
  color: var(--coral);
}

.login__tagline {
  margin-top: 12px;
  font-size: 14px;
  color: var(--muted);
  font-style: italic;
  letter-spacing: 0.02em;
}

/* Buttons */
.login__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 48px;
}

.login__btn {
  width: 100%;
  padding: 18px 24px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  transition: opacity 0.2s ease, transform 0.08s ease;
}

.login__btn:active {
  transform: scale(0.97);
}

.login__btn:disabled {
  opacity: 0.5;
}

.login__btn--spotify {
  background: var(--coral);
  color: #000;
}

.login__btn--guest {
  background: var(--violet);
  color: #fff;
}

.login__error {
  font-size: 12px;
  color: rgba(255, 80, 80, 0.9);
  text-align: center;
  letter-spacing: 0.05em;
}

/* Feature lines */
.login__features {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.08em;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/Login.jsx src/pages/Login.css
git commit -m "feat: redesign Login page with vinyl, floating notes, blob background"
```

---

### Task 10: Home page

**Files:**
- Rewrite: `src/pages/Home.jsx`
- Rewrite: `src/pages/Home.css`

Home has: sticky header (BS wordmark + waveform + profile circle), hero "WHAT'S THE VIBE?" text, mood input pill + generate button, divider "or pick a vibe", horizontally scrollable VibeCard row, "TRENDING VIBES" section with three placeholder rows, and bottom Navbar.

Navigation: clicking Generate calls `navigate('/results', { state: { mood } })`. Clicking a VibeCard sets it as the active mood and also navigates.

Placeholder trending data is hardcoded — no API call yet.

- [ ] **Step 1: Write `src/pages/Home.jsx`**

```jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import Waveform from '../components/Waveform'
import './Home.css'

const VIBES = ['HYPE', 'MELANCHOLIC', 'FOCUS', 'LATE NIGHT', 'HEARTBREAK', 'ROAD TRIP']

const TRENDING = [
  { mood: 'late night driving alone',  plays: '24.3k' },
  { mood: 'pre-game energy',           plays: '18.1k' },
  { mood: 'studying but make it dark', plays: '15.7k' },
]

export default function Home({ user }) {
  const navigate = useNavigate()
  const [mood, setMood] = useState('')
  const [activeVibe, setActiveVibe] = useState(null)

  const displayName = user?.displayName ?? (user?.isAnonymous ? 'G' : 'U')
  const initial = displayName[0]?.toUpperCase() ?? '?'

  const handleGenerate = () => {
    const query = mood.trim() || activeVibe
    if (!query) return
    navigate('/results', { state: { mood: query } })
  }

  const handleVibeSelect = (vibe) => {
    setActiveVibe(v => v === vibe ? null : vibe)
    setMood('')
  }

  const handleTrendingTap = (trendMood) => {
    navigate('/results', { state: { mood: trendMood } })
  }

  return (
    <div className="home page">
      <header className="home__header">
        <span className="home__logo">BS</span>
        <Waveform speed="slow" color="var(--coral)" />
        <div className="home__avatar" onClick={() => navigate('/profile')}>
          {initial}
        </div>
      </header>

      <main className="home__main">
        <h1 className="home__hero">
          WHAT'S<br />THE VIBE?
        </h1>

        <div className="home__input-group">
          <input
            className="home__input"
            placeholder="describe a feeling..."
            value={mood}
            onChange={e => { setMood(e.target.value); setActiveVibe(null) }}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
          <button
            className="home__generate ripple-host"
            onClick={handleGenerate}
            disabled={!mood.trim() && !activeVibe}
          >
            GENERATE PLAYLIST →
          </button>
        </div>

        <div className="home__divider">
          <span className="home__divider-text">— or pick a vibe —</span>
        </div>

        <div className="home__vibes">
          {VIBES.map(v => (
            <VibeCard
              key={v}
              vibe={v}
              active={activeVibe === v}
              onSelect={handleVibeSelect}
            />
          ))}
        </div>

        <section className="home__trending">
          <h2 className="home__section-title">TRENDING VIBES</h2>
          {TRENDING.map(({ mood: tm, plays }) => (
            <button
              key={tm}
              className="home__trend-row"
              onClick={() => handleTrendingTap(tm)}
            >
              <span className="home__trend-mood">{tm}</span>
              <div className="home__trend-right">
                <Waveform speed="slow" bars={4} color="var(--muted)" />
                <span className="home__trend-plays">{plays}</span>
              </div>
            </button>
          ))}
        </section>
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/Home.css`**

```css
/* Header */
.home__header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.home__logo {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--white);
}

.home__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1.5px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.home__avatar:active {
  transform: scale(0.92);
}

/* Main */
.home__main {
  padding: 40px 24px 0;
}

.home__hero {
  font-size: clamp(52px, 14vw, 72px);
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  line-height: 0.95;
  color: var(--white);
  margin-bottom: 40px;
}

/* Input group */
.home__input-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 40px;
}

.home__input {
  background: var(--bg-card);
  border: 1.5px solid transparent;
  border-radius: var(--radius-pill);
  color: var(--white);
  font-size: 16px;
  font-family: var(--font);
  padding: 18px 24px;
  outline: none;
  transition: border-color 0.2s ease;
}

.home__input::placeholder {
  color: var(--muted);
}

.home__input:focus {
  border-color: var(--coral);
}

.home__generate {
  background: linear-gradient(135deg, #FF6B35 0%, #FF9500 100%);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: var(--radius-pill);
  padding: 18px 24px;
  width: 100%;
  border: none;
  transition: opacity 0.2s ease, transform 0.08s ease;
}

.home__generate:active {
  transform: scale(0.97);
}

.home__generate:disabled {
  opacity: 0.4;
}

/* Divider */
.home__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.home__divider-text {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Vibe cards row */
.home__vibes {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
  scrollbar-width: none;
  margin-bottom: 48px;
}

.home__vibes::-webkit-scrollbar { display: none; }

/* Trending */
.home__trending {
  margin-top: 0;
}

.home__section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 16px;
}

.home__trend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  text-align: left;
  cursor: pointer;
  transition: padding-left 0.15s ease;
}

.home__trend-row:active {
  padding-left: 8px;
  transform: none;
}

.home__trend-row:first-of-type {
  border-top: 1px solid rgba(255,255,255,0.05);
}

.home__trend-mood {
  font-size: 14px;
  font-weight: 500;
  color: var(--white);
  text-transform: lowercase;
  font-style: italic;
  flex: 1;
}

.home__trend-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.home__trend-plays {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.05em;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/Home.jsx src/pages/Home.css
git commit -m "feat: redesign Home page with mood input, vibe cards row, trending section"
```

---

### Task 11: Results page

**Files:**
- Rewrite: `src/pages/Results.jsx`
- Rewrite: `src/pages/Results.css`

Results shows: back arrow header, mood text in large coral italic, spinning vinyl (small), animated waveform while "loading", then a track list of placeholder TrackCards. Bottom sticky bar has SAVE (coral) and SPOTIFY (violet outlined) pill buttons. Save writes to Firestore `users/{uid}/playlists`.

Placeholder tracks are hardcoded. `useLocation` provides the `mood` from state.

- [ ] **Step 1: Write `src/pages/Results.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Vinyl from '../components/Vinyl'
import Waveform from '../components/Waveform'
import TrackCard from '../components/TrackCard'
import './Results.css'

const PLACEHOLDER_TRACKS = [
  { name: 'Nights',              artist: 'Frank Ocean',        duration: '5:07' },
  { name: 'After Hours',         artist: 'The Weeknd',         duration: '6:01' },
  { name: 'Motion Picture',      artist: 'Bryson Tiller',      duration: '4:22' },
  { name: 'Pyramids',            artist: 'Frank Ocean',        duration: '9:52' },
  { name: 'Self Control',        artist: 'Frank Ocean',        duration: '4:10' },
  { name: 'Do Not Disturb',      artist: 'Drake',              duration: '3:46' },
  { name: 'Slow Dancing',        artist: 'V',                  duration: '3:59' },
]

export default function Results({ user }) {
  const navigate = useNavigate()
  const { state } = useLocation()
  const mood = state?.mood ?? 'your vibe'

  const [saved, setSaved] = useState(false)
  const [playingIndex, setPlayingIndex] = useState(0)

  const handleSave = async () => {
    if (!user?.uid || saved) return
    setSaved(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood.toUpperCase()} MIX`,
        mood,
        createdAt: serverTimestamp(),
        tracks: PLACEHOLDER_TRACKS,
      })
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }

  return (
    <div className="results page">
      <header className="results__header">
        <button className="results__back" onClick={() => navigate(-1)}>←</button>
        <span className="results__title">YOUR PLAYLIST</span>
        <div style={{ width: 40 }} />
      </header>

      <div className="results__mood-area">
        <p className="results__mood-label">"{mood}"</p>
        <Vinyl size="small" active />
        <Waveform speed="fast" />
      </div>

      <div className="results__tracks">
        {PLACEHOLDER_TRACKS.map((track, i) => (
          <TrackCard
            key={i}
            track={track}
            index={i}
            playing={i === playingIndex}
            onSave={handleSave}
          />
        ))}
      </div>

      <div className="results__actions">
        <button
          className={`results__btn results__btn--save${saved ? ' results__btn--saved' : ''}`}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '✓ SAVED' : 'SAVE'}
        </button>
        <button className="results__btn results__btn--spotify">
          SPOTIFY
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/Results.css`**

```css
/* Header */
.results__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.results__back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--white);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s ease, transform 0.08s ease;
}

.results__back:active {
  background: var(--bg-card);
  transform: scale(0.9);
}

.results__title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Mood + vinyl area */
.results__mood-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 32px 24px 24px;
}

.results__mood-label {
  font-size: 28px;
  font-style: italic;
  font-weight: 700;
  color: var(--coral);
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* Tracks */
.results__tracks {
  padding: 8px 16px 120px;
}

/* Bottom actions */
.results__actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, #0A0A0A 60%, transparent);
  display: flex;
  gap: 12px;
}

.results__btn {
  flex: 1;
  padding: 16px 20px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.08s ease;
}

.results__btn:active {
  transform: scale(0.96);
}

.results__btn--save {
  background: var(--coral);
  color: #000;
}

.results__btn--saved {
  background: rgba(255,107,53,0.3);
  color: var(--coral);
}

.results__btn--save:disabled {
  cursor: default;
}

.results__btn--spotify {
  background: transparent;
  color: var(--violet);
  border: 1.5px solid var(--violet);
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/Results.jsx src/pages/Results.css
git commit -m "feat: redesign Results page with vinyl, track list, swipe-to-save, sticky action bar"
```

---

### Task 12: Saved page

**Files:**
- Rewrite: `src/pages/Saved.jsx`
- Rewrite: `src/pages/Saved.css`

Saved shows a real-time Firestore subscription (`onSnapshot`) of the user's playlists. Each playlist card expands inline on tap to show tracks. Long-press a card to reveal a delete option. Empty state shows a large ♪ symbol. The "SAVED" watermark text sits behind the header.

Pull-to-refresh is a simple indicator — track `touchstart`/`touchmove` Y delta, if > 60px show a brief equalizer-bars indicator then trigger a manual state refresh (re-run the snapshot by toggling a key).

- [ ] **Step 1: Write `src/pages/Saved.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useLongPress } from '../hooks/useLongPress'
import Navbar from '../components/Navbar'
import Waveform from '../components/Waveform'
import './Saved.css'

function PlaylistCard({ playlist, uid, onDeleted }) {
  const [expanded, setExpanded] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const longPress = useLongPress(() => setShowDelete(true))

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'playlists', playlist.id))
      onDeleted?.()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const formatDate = (ts) => {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`pl-card${showDelete ? ' pl-card--delete-mode' : ''}`}>
      <div
        className="pl-card__row"
        onClick={() => { setExpanded(e => !e); setShowDelete(false) }}
        {...longPress}
      >
        <div className="pl-card__info">
          <p className="pl-card__name">{playlist.name}</p>
          <div className="pl-card__meta">
            <span className="pl-card__date">{formatDate(playlist.createdAt)}</span>
            <span className="pl-card__dot">·</span>
            <Waveform speed="slow" bars={4} color="var(--muted)" />
            <span className="pl-card__count">{playlist.tracks?.length ?? 0} tracks</span>
          </div>
        </div>
        <span className="pl-card__chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {showDelete && (
        <div className="pl-card__delete-bar">
          <button className="pl-card__delete-btn" onClick={handleDelete}>DELETE PLAYLIST</button>
          <button className="pl-card__cancel-btn" onClick={() => setShowDelete(false)}>CANCEL</button>
        </div>
      )}

      {expanded && (
        <div className="pl-card__tracks">
          {(playlist.tracks ?? []).map((t, i) => (
            <div key={i} className="pl-card__track">
              <span className="pl-card__track-name">{t.name}</span>
              <span className="pl-card__track-artist">{t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Saved({ user }) {
  const [playlists, setPlaylists] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [pulling, setPulling] = useState(false)
  const pullStartY = useRef(null)

  useEffect(() => {
    if (!user?.uid) return
    const q = query(
      collection(db, 'users', user.uid, 'playlists'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
      setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user?.uid, refreshKey])

  const handleTouchStart = (e) => { pullStartY.current = e.touches[0].clientY }
  const handleTouchMove = (e) => {
    if (pullStartY.current === null) return
    if (e.touches[0].clientY - pullStartY.current > 60 && window.scrollY === 0) {
      setPulling(true)
    }
  }
  const handleTouchEnd = () => {
    if (pulling) {
      setRefreshKey(k => k + 1)
      setTimeout(() => setPulling(false), 800)
    }
    pullStartY.current = null
  }

  return (
    <div
      className="saved page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pulling && (
        <div className="saved__pull-indicator">
          <div className="loading-eq">
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
            <div className="loading-eq__bar" />
          </div>
        </div>
      )}

      <header className="saved__header">
        <div className="saved__watermark">SAVED</div>
        <p className="saved__subtitle">YOUR PLAYLISTS</p>
      </header>

      <main className="saved__main">
        {playlists.length === 0 ? (
          <div className="saved__empty">
            <span className="saved__empty-note">♪</span>
            <p className="saved__empty-text">nothing saved yet</p>
            <a className="saved__empty-link" href="/home">generate your first playlist →</a>
          </div>
        ) : (
          playlists.map(pl => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              uid={user.uid}
            />
          ))
        )}
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 2: Write `src/pages/Saved.css`**

```css
/* Pull indicator */
.saved__pull-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: var(--bg);
  z-index: 200;
  border-bottom: 1px solid var(--coral);
}

/* Header */
.saved__header {
  position: relative;
  padding: 24px 24px 0;
  overflow: hidden;
}

.saved__watermark {
  font-size: clamp(80px, 22vw, 120px);
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  color: var(--white);
  opacity: 0.06;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.saved__subtitle {
  position: absolute;
  bottom: 8px;
  left: 24px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Main */
.saved__main {
  padding: 24px 16px;
}

/* Empty state */
.saved__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  gap: 16px;
}

.saved__empty-note {
  font-size: 72px;
  color: var(--muted);
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;
}

.saved__empty-text {
  font-size: 16px;
  color: var(--muted);
}

.saved__empty-link {
  font-size: 14px;
  color: var(--coral);
  text-decoration: none;
  font-weight: 600;
}

/* Playlist card */
.pl-card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  margin-bottom: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.pl-card--delete-mode {
  box-shadow: 0 0 0 1.5px rgba(255, 80, 80, 0.5);
}

.pl-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  user-select: none;
}

.pl-card__row:active {
  background: rgba(255,255,255,0.03);
}

.pl-card__info {
  flex: 1;
  min-width: 0;
}

.pl-card__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pl-card__date,
.pl-card__count {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.05em;
}

.pl-card__dot {
  color: var(--muted);
  font-size: 11px;
}

.pl-card__chevron {
  font-size: 10px;
  color: var(--muted);
  margin-left: 12px;
  flex-shrink: 0;
}

/* Delete bar */
.pl-card__delete-bar {
  display: flex;
  gap: 0;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.pl-card__delete-btn,
.pl-card__cancel-btn {
  flex: 1;
  padding: 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.pl-card__delete-btn {
  background: rgba(255, 80, 80, 0.15);
  color: rgba(255, 80, 80, 0.9);
}

.pl-card__delete-btn:active {
  background: rgba(255, 80, 80, 0.25);
}

.pl-card__cancel-btn {
  background: rgba(255,255,255,0.04);
  color: var(--muted);
}

/* Track list */
.pl-card__tracks {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 8px 0;
}

.pl-card__track {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.pl-card__track:last-child {
  border-bottom: none;
}

.pl-card__track-name {
  font-size: 13px;
  color: var(--white);
  font-weight: 500;
}

.pl-card__track-artist {
  font-size: 12px;
  color: var(--muted);
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/Saved.jsx src/pages/Saved.css
git commit -m "feat: redesign Saved page with playlist cards, long-press delete, pull to refresh"
```

---

### Task 13: Profile page (new design)

**Files:**
- Rewrite: `src/pages/Profile.jsx`
- Rewrite: `src/pages/Profile.css`

Profile shows user identity (initial box, display name, truncated UID), a stats section (placeholder: playlists count = "—"), and a Sign Out button. Style matches the new design system.

Sign-out navigates to `/login` after `signOut(auth)` resolves. `onAuthStateChanged` then fires null, App.jsx sets user to null, and AuthRoute shows Login — so `navigate` after signOut is belt-and-suspenders but fine.

- [ ] **Step 1: Write `src/pages/Profile.jsx`**

```jsx
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
```

- [ ] **Step 2: Write `src/pages/Profile.css`**

```css
.profile__main {
  padding: 48px 24px 32px;
}

.profile__identity {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.profile__initial-box {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--coral) 0%, #FF9500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 900;
  color: #000;
  flex-shrink: 0;
}

.profile__name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin-bottom: 6px;
  color: var(--white);
}

.profile__uid {
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}

.profile__stats {
  display: flex;
  gap: 24px;
  margin-bottom: 40px;
}

.profile__stat {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  padding: 20px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.profile__stat-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--white);
}

.profile__stat-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}

.profile__divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin-bottom: 40px;
}

.profile__signout {
  width: 100%;
  padding: 18px 24px;
  border-radius: var(--radius-pill);
  background: var(--coral);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.08s ease;
}

.profile__signout:active {
  transform: scale(0.97);
  opacity: 0.85;
}

.profile__error {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255, 80, 80, 0.9);
  text-align: center;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 3: Verify build**

```powershell
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```powershell
git add src/pages/Profile.jsx src/pages/Profile.css
git commit -m "feat: redesign Profile page with coral initial box, stats cards, new sign-out button"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in |
|---|---|
| #0A0A0A background, coral/lime/violet palette | Task 1 index.css |
| Large border-radius, pill shapes | Task 1 CSS vars |
| Blob morph background animation | Task 1 (keyframe), Task 9 (login blobs) |
| Floating music notes | Task 9 (login) |
| Vinyl record component (CSS only) | Task 3 |
| Waveform component, 5 bars, staggered | Task 2 |
| Equalizer loading screen | Task 1 App.jsx |
| useRipple, useSwipe, useLongPress hooks | Task 4 |
| Ripple component | Task 5 |
| Navbar: 4 items, coral active, pill indicator | Task 6 |
| VibeCard: 6 vibes, 3D flip, unique gradients | Task 7 |
| TrackCard: art placeholder, swipe-to-save | Task 8 |
| Login: vinyl + notes + blobs + pill buttons | Task 9 |
| Home: sticky header + waveform + mood input + vibes row + trending | Task 10 |
| Results: mood label + vinyl + track list + sticky action bar | Task 11 |
| Saved: watermark + playlist cards + long-press delete + pull-to-refresh | Task 12 |
| Profile: initial box + stats + sign out | Task 13 |
| active:scale(0.95) on interactive elements | Task 1 global CSS |
| `scrollbar-width: none` | Task 1 |
| `::selection` coral color | Task 1 |

**Gaps resolved:** None found.

**Placeholder scan:** No TBD or TODO placeholders. All code blocks are complete.

**Type consistency check:** `track` prop shape `{ name, artist, duration }` used consistently in Tasks 8, 11. `user` prop `{ uid, displayName, isAnonymous }` used consistently in Tasks 9, 10, 11, 12, 13.
