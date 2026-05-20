# Beatswitch v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Beatswitch from v1 to v2 by implementing 10 new features across all pages while enforcing a strict flat-color, organic-shape, no-emoji design system.

**Architecture:** Extend the existing React 19 + Vite + pure CSS + Firebase structure. New components are self-contained with paired JSX + CSS files. Page files orchestrate state and compose components. All generation is stubbed. No external animation or gesture libraries.

**Tech Stack:** React 19, Vite, pure CSS (@keyframes), Firebase Auth + Firestore, React Router, native touch events, inline SVG.

---

## File Map

**Create:**
- `src/utils/generatePlaylist.js`
- `src/hooks/useBlend.js`
- `src/hooks/useMoodDial.js`
- `src/components/Toast.jsx` + `Toast.css`
- `src/components/BottomSheet.jsx` + `BottomSheet.css`
- `src/components/BlendOrb.jsx` + `BlendOrb.css`
- `src/components/MoodDial.jsx` + `MoodDial.css`
- `src/components/RadarChart.jsx` + `RadarChart.css`
- `src/components/MoodOfDay.jsx` + `MoodOfDay.css`
- `src/components/VibeLeaderboard.jsx` + `VibeLeaderboard.css`
- `src/components/MoodTimeline.jsx` + `MoodTimeline.css`
- `src/components/FavouritesMix.jsx` + `FavouritesMix.css`
- `src/components/CollageGrid.jsx` + `CollageGrid.css`

**Modify:**
- `src/index.css` — v2 design tokens, new keyframes
- `src/hooks/useSwipe.js` — add vertical swipe support
- `src/components/Waveform.jsx` + `Waveform.css` — irregular bars
- `src/components/Vinyl.jsx` + `Vinyl.css` — SVG rewrite
- `src/components/Navbar.jsx` + `Navbar.css` — remove symbols, sliding indicator
- `src/components/VibeCard.jsx` + `VibeCard.css` — multi-select, no emoji/gradient
- `src/components/TrackCard.jsx` + `TrackCard.css` — preview, pin, flat SVG art
- `src/pages/Home.jsx` + `Home.css` — integrate MoodOfDay, tabs, Blend, Dial, Leaderboard
- `src/pages/Results.jsx` + `Results.css` — integrate preview, reshuffle, pin, VibeCheck
- `src/pages/Saved.jsx` + `Saved.css` — integrate FavouritesMix, Timeline, CollageGrid
- `src/pages/Profile.jsx` + `Profile.css` — full replacement with RadarChart, stats, bar chart

---

## Task 1: Design System — Update index.css

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the file entirely**

```css
/* src/index.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg:     #080808;
  --coral:  #FF4D00;
  --lime:   #CCFF00;
  --violet: #7B2FFF;
  --white:  #F2F2F2;
  --dim:    #2A2A2A;
  --muted:  #666666;
  --font:   system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
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

button:active { transform: scale(0.97); }

a { color: inherit; text-decoration: none; }

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
  width: 3px;
  background: var(--coral);
  animation: eq-bounce 0.9s ease-in-out infinite alternate;
  will-change: height;
}

.loading-eq__bar:nth-child(1) { animation-delay: 0s;    animation-duration: 0.9s;  height: 8px; }
.loading-eq__bar:nth-child(2) { animation-delay: 0.15s; animation-duration: 0.8s;  height: 18px; }
.loading-eq__bar:nth-child(3) { animation-delay: 0.3s;  animation-duration: 1.1s;  height: 12px; }
.loading-eq__bar:nth-child(4) { animation-delay: 0.45s; animation-duration: 0.75s; height: 26px; }
.loading-eq__bar:nth-child(5) { animation-delay: 0.6s;  animation-duration: 0.95s; height: 10px; }

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
  background: rgba(255,255,255,0.15);
  pointer-events: none;
  animation: ripple-expand 0.55s ease-out forwards;
}

/* ── Shared keyframes ─────────────────────────── */
@keyframes ripple-expand {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
  to   { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

@keyframes blob-morph {
  0%, 100% { border-radius: 71% 29% 70% 30% / 30% 30% 70% 70%; }
  25%       { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
  50%       { border-radius: 60% 40% 50% 50% / 45% 65% 35% 55%; }
  75%       { border-radius: 30% 70% 65% 35% / 55% 45% 55% 45%; }
}

@keyframes stroke-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes slide-in-top {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}

@keyframes slide-out-top {
  from { transform: translateY(0); }
  to   { transform: translateY(-100%); }
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

@keyframes pulse-point {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%       { transform: translate(-50%, -50%) scale(1.08); }
}

@keyframes track-slide-out {
  to { transform: translateX(-120%); opacity: 0; }
}

@keyframes track-slide-in {
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
```

- [ ] **Step 2: Verify app still boots**

```bash
npm run dev
```
Open `http://localhost:5173`. Expected: loading splash renders, login page loads. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: update design system to v2 tokens and keyframes"
```

---

## Task 2: useSwipe — Add Vertical Swipe Support

**Files:**
- Modify: `src/hooks/useSwipe.js`

- [ ] **Step 1: Update useSwipe to handle vertical swipes**

```js
// src/hooks/useSwipe.js
import { useRef, useCallback } from 'react'

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeDown, threshold = 50 } = {}) {
  const startX = useRef(null)
  const startY = useRef(null)

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    startX.current = null
    startY.current = null
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy > threshold) onSwipeDown?.()
    } else {
      if (dx < -threshold) onSwipeLeft?.()
      else if (dx > threshold) onSwipeRight?.()
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeDown, threshold])

  return { onTouchStart, onTouchEnd }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSwipe.js
git commit -m "feat: add vertical swipe support to useSwipe hook"
```

---

## Task 3: Waveform — Irregular Bars

**Files:**
- Modify: `src/components/Waveform.jsx`
- Modify: `src/components/Waveform.css`

- [ ] **Step 1: Update Waveform.jsx**

```jsx
// src/components/Waveform.jsx
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

- [ ] **Step 2: Update Waveform.css**

```css
/* src/components/Waveform.css */
.waveform {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
  --wf-color: var(--coral);
}

.waveform__bar {
  background: var(--wf-color);
  animation: eq-bounce var(--dur, 0.9s) ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * 0.12s);
}

/* Irregular widths and max heights per bar index */
.waveform__bar:nth-child(1) { width: 3px; --h: 40%; }
.waveform__bar:nth-child(2) { width: 4px; --h: 75%; }
.waveform__bar:nth-child(3) { width: 2px; --h: 55%; }
.waveform__bar:nth-child(4) { width: 4px; --h: 90%; }
.waveform__bar:nth-child(5) { width: 3px; --h: 48%; }

@keyframes eq-bounce {
  0%   { height: 3px; }
  100% { height: var(--h, 80%); }
}

.waveform--fast  .waveform__bar { --dur: 0.55s; }
.waveform--slow  .waveform__bar { --dur: 1.4s; }
```

- [ ] **Step 3: Verify in browser**

Navigate to `/home`. Waveform in header should show 5 bars of unequal widths and heights animating. No uniform bars.

- [ ] **Step 4: Commit**

```bash
git add src/components/Waveform.jsx src/components/Waveform.css
git commit -m "feat: make waveform bars irregular width and height"
```

---

## Task 4: Vinyl — SVG Rewrite

**Files:**
- Modify: `src/components/Vinyl.jsx`
- Modify: `src/components/Vinyl.css`

- [ ] **Step 1: Rewrite Vinyl.jsx as inline SVG**

```jsx
// src/components/Vinyl.jsx
import './Vinyl.css'

export default function Vinyl({ size = 'medium', active = false }) {
  const dim = size === 'small' ? 64 : size === 'large' ? 120 : 88
  return (
    <div className={`vinyl vinyl--${size}${active ? ' vinyl--active' : ''}`}>
      <svg width={dim} height={dim} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="39" fill="#0D0D0D" />
        {/* Irregular groove spacing — not uniform */}
        <circle cx="40" cy="40" r="35" fill="none" stroke="#1A1A1A" strokeWidth="0.6" />
        <circle cx="40" cy="40" r="31" fill="none" stroke="#1A1A1A" strokeWidth="0.4" />
        <circle cx="40" cy="40" r="26" fill="none" stroke="#1A1A1A" strokeWidth="0.7" />
        <circle cx="40" cy="40" r="21" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="17" fill="none" stroke="#1A1A1A" strokeWidth="0.4" />
        <circle cx="40" cy="40" r="13" fill="none" stroke="#1A1A1A" strokeWidth="0.6" />
        {/* Off-center label */}
        <ellipse cx="41" cy="39" rx="7.5" ry="7.5" fill="#FF4D00" />
        <text
          x="41" y="42"
          textAnchor="middle"
          fontSize="4.5"
          fill="#080808"
          fontWeight="900"
          fontFamily="system-ui"
          letterSpacing="-0.5"
        >
          BS
        </text>
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Vinyl.css**

```css
/* src/components/Vinyl.css */
.vinyl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.vinyl--active svg {
  animation: spin-slow 20s linear infinite;
}

.vinyl--small  { }
.vinyl--medium { }
.vinyl--large  { }
```

- [ ] **Step 3: Verify in browser**

Navigate to `/results`. Vinyl should render as a dark disc with off-center orange label, spinning. No div-based grooves.

- [ ] **Step 4: Commit**

```bash
git add src/components/Vinyl.jsx src/components/Vinyl.css
git commit -m "feat: rewrite Vinyl as inline SVG with irregular grooves"
```

---

## Task 5: Navbar — Remove Symbols, Sliding Indicator

**Files:**
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Navbar.css`

- [ ] **Step 1: Rewrite Navbar.jsx**

```jsx
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
```

- [ ] **Step 2: Rewrite Navbar.css**

```css
/* src/components/Navbar.css */
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg);
  border-top: 1px solid var(--dim);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 0 max(16px, env(safe-area-inset-bottom));
}

.navbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 16px;
  position: relative;
  text-decoration: none;
}

.navbar__item:active { transform: scale(0.97); }

.navbar__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  transition: color 0.15s ease;
}

.navbar__item--active .navbar__label {
  color: var(--coral);
}

.navbar__underline {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 1px;
  background: var(--coral);
}
```

- [ ] **Step 3: Verify in browser**

All three nav items show text labels only. Active item label is `--coral` with underline. No symbols.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.jsx src/components/Navbar.css
git commit -m "feat: redesign navbar with text labels and sliding underline indicator"
```

---

## Task 6: Toast Component

**Files:**
- Create: `src/components/Toast.jsx`
- Create: `src/components/Toast.css`

- [ ] **Step 1: Create Toast.jsx**

```jsx
// src/components/Toast.jsx
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

export default function Toast({ message, onDone }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!message) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onDone?.(), 2200)
    return () => clearTimeout(timerRef.current)
  }, [message, onDone])

  if (!message) return null

  return createPortal(
    <div className="toast">{message}</div>,
    document.body
  )
}
```

- [ ] **Step 2: Create Toast.css**

```css
/* src/components/Toast.css */
.toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--coral);
  color: #080808;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
  padding: 16px 24px max(16px, env(safe-area-inset-top));
  animation: slide-in-top 0.25s ease-out forwards;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.jsx src/components/Toast.css
git commit -m "feat: add Toast component with top slide-in animation"
```

---

## Task 7: BottomSheet Component

**Files:**
- Create: `src/components/BottomSheet.jsx`
- Create: `src/components/BottomSheet.css`

- [ ] **Step 1: Create BottomSheet.jsx**

```jsx
// src/components/BottomSheet.jsx
import { useSwipe } from '../hooks/useSwipe'
import './BottomSheet.css'

export default function BottomSheet({ visible, onDismiss, children }) {
  const swipe = useSwipe({ onSwipeDown: onDismiss })

  return (
    <div
      className={`bottom-sheet${visible ? ' bottom-sheet--visible' : ''}`}
      {...swipe}
    >
      {/* Irregular top wave */}
      <svg className="bottom-sheet__wave" viewBox="0 0 390 24" preserveAspectRatio="none">
        <path
          d="M0 24 C60 8, 120 20, 195 12 C270 4, 330 18, 390 10 L390 24 Z"
          fill="#0F0F0F"
        />
      </svg>
      <div className="bottom-sheet__body">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create BottomSheet.css**

```css
/* src/components/BottomSheet.css */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  transform: translateY(100%);
  transition: transform 0.35s ease-out;
}

.bottom-sheet--visible {
  transform: translateY(0);
}

.bottom-sheet__wave {
  display: block;
  width: 100%;
  height: 24px;
  margin-bottom: -1px;
}

.bottom-sheet__body {
  background: #0F0F0F;
  padding: 24px 24px max(32px, env(safe-area-inset-bottom));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BottomSheet.jsx src/components/BottomSheet.css
git commit -m "feat: add BottomSheet component with irregular wave top edge"
```

---

## Task 8: generatePlaylist Utility

**Files:**
- Create: `src/utils/generatePlaylist.js`

- [ ] **Step 1: Create generatePlaylist.js**

```js
// src/utils/generatePlaylist.js
const STUB_TRACKS = [
  { name: 'No Church in the Wild', artist: 'Jay-Z & Kanye West', duration: '4:32' },
  { name: 'Redbone',               artist: 'Childish Gambino',   duration: '5:26' },
  { name: 'Nights',                artist: 'Frank Ocean',        duration: '5:07' },
  { name: 'A$AP Forever',          artist: 'A$AP Rocky',         duration: '4:01' },
  { name: 'XO Tour Llif3',         artist: 'Lil Uzi Vert',       duration: '3:01' },
  { name: 'Numb Numb Juice',       artist: 'ScHoolboy Q',        duration: '3:48' },
  { name: 'PRIDE.',                artist: 'Kendrick Lamar',     duration: '4:36' },
  { name: 'Waves',                 artist: 'Frank Ocean',        duration: '1:03' },
  { name: 'Bad and Boujee',        artist: 'Migos',              duration: '5:43' },
  { name: 'Ivy',                   artist: 'Frank Ocean',        duration: '4:10' },
  { name: 'DNA.',                  artist: 'Kendrick Lamar',     duration: '3:05' },
  { name: 'Slide',                 artist: 'Calvin Harris',      duration: '3:53' },
]

export function generatePlaylist(params = {}) {
  const shuffled = [...STUB_TRACKS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 8)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/generatePlaylist.js
git commit -m "feat: add generatePlaylist stub returning 8 shuffled tracks"
```

---

## Task 9: useBlend Hook

**Files:**
- Create: `src/hooks/useBlend.js`

- [ ] **Step 1: Create useBlend.js**

```js
// src/hooks/useBlend.js
import { useState, useCallback, useMemo } from 'react'

export function useBlend() {
  const [selectedVibes, setSelectedVibes] = useState([])
  const [weights, setWeights] = useState({})

  const toggleVibe = useCallback((vibe) => {
    setSelectedVibes(prev => {
      if (prev.includes(vibe)) {
        const next = prev.filter(v => v !== vibe)
        setWeights(w => {
          const nw = { ...w }
          delete nw[vibe]
          if (next.length > 0) {
            const share = Math.floor(100 / next.length)
            const rem = 100 - share * next.length
            next.forEach((v, i) => { nw[v] = share + (i === 0 ? rem : 0) })
          }
          return nw
        })
        return next
      }
      if (prev.length >= 3) return prev
      const next = [...prev, vibe]
      setWeights(() => {
        const share = Math.floor(100 / next.length)
        const rem = 100 - share * next.length
        const nw = {}
        next.forEach((v, i) => { nw[v] = share + (i === 0 ? rem : 0) })
        return nw
      })
      return next
    })
  }, [])

  const adjustWeight = useCallback((targetVibe, newWeight) => {
    setSelectedVibes(prev => {
      const others = prev.filter(v => v !== targetVibe)
      if (others.length === 0) return prev
      const clamped = Math.max(10, Math.min(80, Math.round(newWeight)))
      const remainder = 100 - clamped
      const totalOthers = others.reduce((sum, v) => sum + (weights[v] || 0), 0)
      const nw = { ...weights, [targetVibe]: clamped }
      others.forEach(v => {
        nw[v] = totalOthers > 0
          ? Math.round((weights[v] / totalOthers) * remainder)
          : Math.round(remainder / others.length)
      })
      // Fix rounding drift
      const total = Object.values(nw).reduce((a, b) => a + b, 0)
      if (total !== 100 && others[0]) nw[others[0]] += (100 - total)
      setWeights(nw)
      return prev
    })
  }, [weights])

  const blendLabel = useMemo(() => {
    if (selectedVibes.length < 2) return ''
    return selectedVibes
      .map(v => `${v} ${weights[v] ?? 0}`)
      .join(' — ')
  }, [selectedVibes, weights])

  return { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useBlend.js
git commit -m "feat: add useBlend hook for multi-vibe selection with weight adjustment"
```

---

## Task 10: useMoodDial Hook

**Files:**
- Create: `src/hooks/useMoodDial.js`

- [ ] **Step 1: Create useMoodDial.js**

```js
// src/hooks/useMoodDial.js
import { useState, useCallback, useMemo } from 'react'

const DESCRIPTORS = {
  topRight:    'euphoric, high voltage',
  topLeft:     'warm, expansive',
  bottomRight: 'brooding, high voltage',
  bottomLeft:  'hollow, drifting',
  center:      'balanced, undefined',
}

function getDescriptor(x, y) {
  const cx = x - 50, cy = y - 50
  if (Math.abs(cx) < 15 && Math.abs(cy) < 15) return DESCRIPTORS.center
  const isTop   = cy > 0
  const isRight = cx > 0
  if (isTop   && isRight) return DESCRIPTORS.topRight
  if (isTop   && !isRight) return DESCRIPTORS.topLeft
  if (!isTop  && isRight) return DESCRIPTORS.bottomRight
  return DESCRIPTORS.bottomLeft
}

export function useMoodDial(canvasSize = 300) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)

  const updateFromTouch = useCallback((e, ref) => {
    if (!ref?.current) return
    const rect = ref.current.getBoundingClientRect()
    const rawX = e.touches[0].clientX - rect.left
    const rawY = e.touches[0].clientY - rect.top
    const x = Math.round(Math.max(0, Math.min(canvasSize, rawX)) / canvasSize * 100)
    const y = Math.round(100 - Math.max(0, Math.min(canvasSize, rawY)) / canvasSize * 100)
    setPosition({ x, y })
  }, [canvasSize])

  const handleTouchStart = useCallback((e, ref) => {
    setIsDragging(true)
    updateFromTouch(e, ref)
  }, [updateFromTouch])

  const handleTouchMove = useCallback((e, ref) => {
    e.preventDefault()
    updateFromTouch(e, ref)
  }, [updateFromTouch])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const moodDescriptor = useMemo(() => getDescriptor(position.x, position.y), [position])

  return { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useMoodDial.js
git commit -m "feat: add useMoodDial hook for 2-axis mood positioning"
```

---

## Task 11: VibeCard — Multi-Select, No Emoji/Gradient

**Files:**
- Modify: `src/components/VibeCard.jsx`
- Modify: `src/components/VibeCard.css`

- [ ] **Step 1: Rewrite VibeCard.jsx**

```jsx
// src/components/VibeCard.jsx
import './VibeCard.css'

const VIBE_COLORS = {
  HYPE:         { bg: '#FF4D00', text: '#080808' },
  MELANCHOLIC:  { bg: '#7B2FFF', text: '#F2F2F2' },
  FOCUS:        { bg: '#CCFF00', text: '#080808' },
  'LATE NIGHT': { bg: '#111111', text: '#F2F2F2' },
  HEARTBREAK:   { bg: '#3D0099', text: '#F2F2F2' },
  'ROAD TRIP':  { bg: '#CC3D00', text: '#080808' },
}

// Each card clips to a slightly different polygon
const CLIP_PATHS = [
  'polygon(0% 4%, 96% 0%, 100% 96%, 4% 100%)',
  'polygon(4% 0%, 100% 3%, 96% 100%, 0% 97%)',
  'polygon(0% 0%, 97% 4%, 100% 100%, 3% 96%)',
  'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)',
  'polygon(0% 3%, 98% 0%, 100% 97%, 2% 100%)',
  'polygon(2% 0%, 100% 2%, 98% 100%, 0% 98%)',
]

const VIBE_KEYS = Object.keys(VIBE_COLORS)

export default function VibeCard({ vibe, selected = false, onSelect }) {
  const { bg, text } = VIBE_COLORS[vibe] ?? { bg: '#2A2A2A', text: '#F2F2F2' }
  const clipIndex = VIBE_KEYS.indexOf(vibe) % CLIP_PATHS.length
  const clipPath = CLIP_PATHS[clipIndex]

  return (
    <button
      className={`vibe-card${selected ? ' vibe-card--selected' : ''}`}
      style={{ '--vc-bg': bg, '--vc-text': text, '--vc-clip': `"${clipPath}"` }}
      onClick={() => onSelect?.(vibe)}
    >
      <div className="vibe-card__inner" style={{ clipPath }}>
        <span className="vibe-card__label">{vibe}</span>
      </div>
      {selected && <span className="vibe-card__underline" />}
    </button>
  )
}
```

- [ ] **Step 2: Rewrite VibeCard.css**

```css
/* src/components/VibeCard.css */
.vibe-card {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.08s ease;
}

.vibe-card:active { transform: scale(0.97); }

.vibe-card__inner {
  width: 88px;
  height: 88px;
  background: var(--vc-bg, #2A2A2A);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.vibe-card__label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vc-text, #F2F2F2);
  text-align: center;
  line-height: 1.3;
}

.vibe-card--selected .vibe-card__label {
  color: var(--coral);
}

.vibe-card__underline {
  display: block;
  width: 100%;
  max-width: 88px;
  height: 1px;
  background: var(--coral);
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/home`. Vibe cards should show flat colored irregular polygon shapes with no emojis, no gradients. Cards are ~88×88px squares with clip-path skewing their corners.

- [ ] **Step 4: Commit**

```bash
git add src/components/VibeCard.jsx src/components/VibeCard.css
git commit -m "feat: redesign VibeCard for multi-select with flat colors and clip-path shapes"
```

---

## Task 12: BlendOrb Component

**Files:**
- Create: `src/components/BlendOrb.jsx`
- Create: `src/components/BlendOrb.css`

- [ ] **Step 1: Create BlendOrb.jsx**

```jsx
// src/components/BlendOrb.jsx
import './BlendOrb.css'

const VIBE_COLORS = {
  HYPE:         '#FF4D00',
  MELANCHOLIC:  '#7B2FFF',
  FOCUS:        '#CCFF00',
  'LATE NIGHT': '#333333',
  HEARTBREAK:   '#3D0099',
  'ROAD TRIP':  '#CC3D00',
}

export default function BlendOrb({ selectedVibes }) {
  if (selectedVibes.length < 2) return null

  return (
    <div className="blend-orb">
      {selectedVibes.map((vibe, i) => (
        <div
          key={vibe}
          className="blend-orb__layer"
          style={{
            background: VIBE_COLORS[vibe] ?? '#2A2A2A',
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create BlendOrb.css**

```css
/* src/components/BlendOrb.css */
.blend-orb {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 16px auto;
}

.blend-orb__layer {
  position: absolute;
  inset: 0;
  mix-blend-mode: screen;
  opacity: 0.35;
  animation: blob-morph 5s ease-in-out infinite;
}

.blend-orb__layer:nth-child(1) {
  animation-duration: 5s;
}
.blend-orb__layer:nth-child(2) {
  animation-duration: 6.5s;
  transform-origin: 60% 40%;
}
.blend-orb__layer:nth-child(3) {
  animation-duration: 4.2s;
  transform-origin: 40% 60%;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BlendOrb.jsx src/components/BlendOrb.css
git commit -m "feat: add BlendOrb component with layered blob morphing"
```

---

## Task 13: MoodDial Component

**Files:**
- Create: `src/components/MoodDial.jsx`
- Create: `src/components/MoodDial.css`

- [ ] **Step 1: Create MoodDial.jsx**

```jsx
// src/components/MoodDial.jsx
import { useRef } from 'react'
import { useMoodDial } from '../hooks/useMoodDial'
import './MoodDial.css'

const GRID_X = [37, 89, 141, 193, 245, 297]
const GRID_Y = [52, 104, 148, 196, 244]

export default function MoodDial({ onChange }) {
  const canvasRef = useRef(null)
  const { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd } = useMoodDial(300)

  const px = (position.x / 100) * 300
  const py = (1 - position.y / 100) * 300

  // Irregular cubic bezier from center to point
  const midX = 150 + (px - 150) / 2 + 8
  const midY = 150 + (py - 150) / 2 - 8
  const tracePath = `M 150 150 Q ${midX} ${midY} ${px} ${py}`

  const onStart  = (e) => { handleTouchStart(e, canvasRef); onChange?.({ energy: position.x, valence: position.y }) }
  const onMove   = (e) => { handleTouchMove(e, canvasRef);  onChange?.({ energy: position.x, valence: position.y }) }

  return (
    <div className="mood-dial">
      <div
        className="mood-dial__canvas"
        ref={canvasRef}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg className="mood-dial__svg" viewBox="0 0 300 300">
          {/* Irregular grid lines */}
          {GRID_X.map(x => (
            <line key={`vx${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#1A1A1A" strokeWidth="0.5" />
          ))}
          {GRID_Y.map(y => (
            <line key={`hy${y}`} x1="0" y1={y} x2="300" y2={y} stroke="#1A1A1A" strokeWidth="0.5" />
          ))}

          {/* Quadrant labels */}
          <text x="8"   y="16"  fontSize="9" fill="#222" fontFamily="system-ui" textTransform="uppercase">RADIANT CALM</text>
          <text x="162" y="16"  fontSize="9" fill="#222" fontFamily="system-ui">RADIANT ELECTRIC</text>
          <text x="8"   y="294" fontSize="9" fill="#222" fontFamily="system-ui">SHADOW CALM</text>
          <text x="158" y="294" fontSize="9" fill="#222" fontFamily="system-ui">SHADOW ELECTRIC</text>

          {/* Trace line */}
          <path d={tracePath} stroke="#FF4D00" strokeWidth="1" fill="none" opacity="0.5" />

          {/* Drag point */}
          <circle
            cx={px}
            cy={py}
            r="6"
            fill="#FF4D00"
            className={isDragging ? '' : 'mood-dial__point--idle'}
          />
        </svg>

        {/* Axis labels */}
        <span className="mood-dial__axis mood-dial__axis--left">CALM</span>
        <span className="mood-dial__axis mood-dial__axis--right">ELECTRIC</span>
        <span className="mood-dial__axis mood-dial__axis--top">RADIANT</span>
        <span className="mood-dial__axis mood-dial__axis--bottom">SHADOW</span>
      </div>

      <p className="mood-dial__descriptor">{moodDescriptor}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create MoodDial.css**

```css
/* src/components/MoodDial.css */
.mood-dial {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.mood-dial__canvas {
  position: relative;
  width: 300px;
  height: 300px;
  background: #0D0D0D;
  touch-action: none;
  flex-shrink: 0;
}

.mood-dial__svg {
  width: 100%;
  height: 100%;
}

.mood-dial__point--idle {
  animation: pulse-point 2s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}

.mood-dial__axis {
  position: absolute;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  pointer-events: none;
}

.mood-dial__axis--left   { top: 50%; left: 6px;  transform: translateY(-50%); }
.mood-dial__axis--right  { top: 50%; right: 6px; transform: translateY(-50%); }
.mood-dial__axis--top    { top: 6px; left: 50%;  transform: translateX(-50%); }
.mood-dial__axis--bottom { bottom: 6px; left: 50%; transform: translateX(-50%); }

.mood-dial__descriptor {
  font-size: 15px;
  font-style: italic;
  color: var(--muted);
  text-align: center;
  min-height: 20px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MoodDial.jsx src/components/MoodDial.css
git commit -m "feat: add MoodDial 2-axis interactive canvas component"
```

---

## Task 14: RadarChart Component

**Files:**
- Create: `src/components/RadarChart.jsx`
- Create: `src/components/RadarChart.css`

- [ ] **Step 1: Create RadarChart.jsx**

The chart is 280×280, center at (140,140), max radius 100. Six axes starting from top (−90°), 60° apart. Placeholder values: `[72, 58, 85, 63, 79, 44]`.

```jsx
// src/components/RadarChart.jsx
import { useEffect, useRef } from 'react'
import './RadarChart.css'

const AXES = ['ENERGY', 'WEIGHT', 'TEMPO', 'MOVEMENT', 'DEPTH', 'HEAT']
const VALUES = [72, 58, 85, 63, 79, 44]
const CENTER = 140
const MAX_R = 100

function getPoint(angleRad, radius) {
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  }
}

// Outer boundary — irregular hexagon with per-vertex offset
const OUTER_OFFSETS = [3, -4, 5, -3, 4, -5]

export default function RadarChart() {
  const polygonRef = useRef(null)
  const fillRef    = useRef(null)

  const axisAngles = AXES.map((_, i) => (i * 60 - 90) * (Math.PI / 180))

  const dataPoints = axisAngles.map((a, i) => getPoint(a, (VALUES[i] / 100) * MAX_R))
  const outerPoints = axisAngles.map((a, i) => getPoint(a, MAX_R + OUTER_OFFSETS[i]))

  const dataPolygon  = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const outerPolygon = outerPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  useEffect(() => {
    const poly = polygonRef.current
    if (!poly) return
    const len = poly.getTotalLength()
    poly.style.strokeDasharray = len
    poly.style.strokeDashoffset = len
    // Trigger draw animation
    requestAnimationFrame(() => {
      poly.style.transition = 'stroke-dashoffset 1.2s ease-out'
      poly.style.strokeDashoffset = 0
    })
    if (fillRef.current) {
      fillRef.current.style.animation = 'fade-in 0.4s ease-out 1.2s forwards'
    }
  }, [])

  return (
    <div className="radar-chart">
      <svg width="280" height="280" viewBox="0 0 280 280">
        {/* Outer boundary */}
        <polygon
          points={outerPolygon}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth="1"
        />

        {/* Axis lines with 1-2px wobble via quadratic bezier */}
        {axisAngles.map((a, i) => {
          const tip = getPoint(a, MAX_R)
          const midX = CENTER + (tip.x - CENTER) / 2 + (i % 2 === 0 ? 1.5 : -1)
          const midY = CENTER + (tip.y - CENTER) / 2 + (i % 2 === 0 ? -1 : 1.5)
          return (
            <path
              key={AXES[i]}
              d={`M ${CENTER} ${CENTER} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`}
              stroke="#2A2A2A"
              strokeWidth="1"
              fill="none"
            />
          )
        })}

        {/* Data fill */}
        <polygon
          ref={fillRef}
          points={dataPolygon}
          fill="#FF4D00"
          opacity="0"
          style={{ opacity: 0 }}
        />

        {/* Data stroke — animated */}
        <polygon
          ref={polygonRef}
          points={dataPolygon}
          fill="none"
          stroke="#FF4D00"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Axis labels */}
        {axisAngles.map((a, i) => {
          const tip = getPoint(a, MAX_R + 18)
          return (
            <text
              key={AXES[i]}
              x={tip.x.toFixed(1)}
              y={tip.y.toFixed(1)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#666"
              fontFamily="system-ui"
              fontWeight="700"
              letterSpacing="0.1"
            >
              {AXES[i]}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Create RadarChart.css**

```css
/* src/components/RadarChart.css */
.radar-chart {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RadarChart.jsx src/components/RadarChart.css
git commit -m "feat: add RadarChart pure SVG component with stroke-draw entrance animation"
```

---

## Task 15: MoodOfDay Component

**Files:**
- Create: `src/components/MoodOfDay.jsx`
- Create: `src/components/MoodOfDay.css`

- [ ] **Step 1: Create MoodOfDay.jsx**

```jsx
// src/components/MoodOfDay.jsx
import { useNavigate } from 'react-router-dom'
import Vinyl from './Vinyl'
import './MoodOfDay.css'

const DAILY_MOODS = [
  { name: 'GOLDEN HOUR',       desc: 'warm slow nostalgic like a polaroid fading' },
  { name: 'FOCUSED GRIND',     desc: 'sharp clean forward moving relentless' },
  { name: 'MELANCHOLIC DRIVE', desc: 'late roads wet asphalt and distance' },
  { name: 'MIDWEEK TENSION',   desc: 'restless urgent not quite there yet' },
  { name: 'DEEP CURRENT',      desc: 'slow heavy moving beneath the surface' },
  { name: 'EUPHORIC STATIC',   desc: 'loud bright electric dissolving' },
  { name: 'LATE WANDER',       desc: 'dark loose unraveling at the edges' },
]

export default function MoodOfDay() {
  const navigate = useNavigate()
  const today = DAILY_MOODS[new Date().getDay()]

  return (
    <section className="mod">
      {/* Background blob decoration */}
      <svg className="mod__blob" viewBox="0 0 390 160" preserveAspectRatio="none">
        <path
          d="M-20 80 C60 20, 150 140, 280 60 C350 20, 420 100, 430 80 L430 180 L-20 180 Z"
          fill="#FF4D00"
          opacity="0.04"
        />
      </svg>

      <div className="mod__content">
        <div className="mod__left">
          <span className="mod__today">TODAY</span>
          <h2 className="mod__name">{today.name}</h2>
          <p className="mod__desc">{today.desc}</p>
          <button className="mod__generate" onClick={() => navigate('/results', { state: { mood: today.name } })}>
            GENERATE
          </button>
        </div>
        <div className="mod__right">
          <Vinyl size="medium" active />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create MoodOfDay.css**

```css
/* src/components/MoodOfDay.css */
.mod {
  position: relative;
  padding: 32px 24px 28px;
  overflow: hidden;
}

.mod__blob {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mod__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.mod__left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mod__today {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.mod__name {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  line-height: 0.95;
  color: var(--coral);
}

.mod__desc {
  font-size: 13px;
  font-style: italic;
  color: var(--muted);
  line-height: 1.5;
}

.mod__generate {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--white);
  background: none;
  border: none;
  border-bottom: 1px solid var(--white);
  padding-bottom: 2px;
  width: fit-content;
  cursor: pointer;
  transition: transform 0.08s ease;
}

.mod__generate:active { transform: scale(0.97); }

.mod__right {
  flex-shrink: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MoodOfDay.jsx src/components/MoodOfDay.css
git commit -m "feat: add MoodOfDay component with 7 daily moods and spinning vinyl"
```

---

## Task 16: VibeLeaderboard Component

**Files:**
- Create: `src/components/VibeLeaderboard.jsx`
- Create: `src/components/VibeLeaderboard.css`

- [ ] **Step 1: Create VibeLeaderboard.jsx**

```jsx
// src/components/VibeLeaderboard.jsx
import './VibeLeaderboard.css'

const LEADERBOARD = [
  { vibe: 'LATE NIGHT',  count: 4821, bars: [8, 18, 12, 22, 6]  },
  { vibe: 'HYPE',        count: 3654, bars: [20, 10, 24, 8, 18] },
  { vibe: 'FOCUS',       count: 2890, bars: [14, 22, 8, 18, 12] },
  { vibe: 'MELANCHOLIC', count: 2103, bars: [6, 14, 20, 10, 16] },
  { vibe: 'HEARTBREAK',  count: 1567, bars: [18, 8, 14, 20, 6]  },
  { vibe: 'ROAD TRIP',   count: 988,  bars: [10, 20, 6, 16, 22] },
]

const RANK_HEIGHTS = [40, 34, 28, 22, 16, 10]

function formatCount(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function VibeLeaderboard({ onVibeSelect }) {
  return (
    <section className="leaderboard">
      <h2 className="leaderboard__title">TRENDING NOW</h2>
      <div className="leaderboard__rows">
        {LEADERBOARD.map(({ vibe, count, bars }, i) => (
          <button
            key={vibe}
            className={`leaderboard__row${i === 0 ? ' leaderboard__row--top' : ''}`}
            style={{ '--stagger': `${i * 80}ms`, '--rank-h': `${RANK_HEIGHTS[i]}px` }}
            onClick={() => onVibeSelect?.(vibe)}
          >
            <span className="leaderboard__rank-line" />
            <span className="leaderboard__vibe">{vibe}</span>
            <svg className="leaderboard__wave" viewBox="0 0 50 24" preserveAspectRatio="none">
              {bars.map((h, bi) => (
                <rect
                  key={bi}
                  x={bi * 10 + 2}
                  y={24 - h}
                  width={bi % 2 === 0 ? 6 : 7}
                  height={h}
                  fill="#2A2A2A"
                />
              ))}
            </svg>
            <span className="leaderboard__count">{formatCount(count)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create VibeLeaderboard.css**

```css
/* src/components/VibeLeaderboard.css */
.leaderboard {
  padding: 0 24px;
  margin-bottom: 40px;
}

.leaderboard__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
}

.leaderboard__rows {
  display: flex;
  flex-direction: column;
}

.leaderboard__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #1A1A1A;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  animation: slide-up 0.4s ease-out var(--stagger, 0ms) both;
}

.leaderboard__row:active { transform: scale(0.98); }

.leaderboard__rank-line {
  flex-shrink: 0;
  width: 2px;
  height: var(--rank-h, 10px);
  background: var(--coral);
}

.leaderboard__vibe {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
}

.leaderboard__row--top .leaderboard__vibe {
  font-size: 18px;
  color: var(--coral);
}

.leaderboard__wave {
  width: 50px;
  height: 24px;
  flex-shrink: 0;
}

.leaderboard__count {
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/VibeLeaderboard.jsx src/components/VibeLeaderboard.css
git commit -m "feat: add VibeLeaderboard with unique waveforms and stagger animation"
```

---

## Task 17: MoodTimeline Component

**Files:**
- Create: `src/components/MoodTimeline.jsx`
- Create: `src/components/MoodTimeline.css`

- [ ] **Step 1: Create MoodTimeline.jsx**

```jsx
// src/components/MoodTimeline.jsx
import { useState } from 'react'
import './MoodTimeline.css'

const ENTRY_W = 90

function formatDate(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MoodTimeline({ entries = [] }) {
  const [activeId, setActiveId] = useState(null)

  if (entries.length === 0) return null

  const svgWidth = Math.max(390, entries.length * ENTRY_W + 40)

  // Build connecting path
  const pathPoints = entries.map((_, i) => ({
    x: i * ENTRY_W + ENTRY_W / 2 + 20,
    y: 30,
  }))
  const pathD = pathPoints.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pathPoints[i - 1]
    const cpX = (prev.x + p.x) / 2
    return `C ${cpX + 8} ${p.y - 5}, ${cpX - 8} ${p.y + 5}, ${p.x} ${p.y}`
  }).join(' ')

  const activeEntry = entries.find(e => e.id === activeId)

  return (
    <div className="timeline">
      <h2 className="timeline__title">MOOD HISTORY</h2>
      <div className="timeline__scroll">
        <svg
          className="timeline__svg"
          width={svgWidth}
          height={60}
          viewBox={`0 0 ${svgWidth} 60`}
        >
          <path d={pathD} stroke="#2A2A2A" strokeWidth="1" fill="none" />
          {entries.map((entry, i) => {
            const x = i * ENTRY_W + ENTRY_W / 2 + 20
            const isActive = entry.id === activeId
            return (
              <g key={entry.id} style={{ cursor: 'pointer' }} onClick={() => setActiveId(isActive ? null : entry.id)}>
                {isActive && (
                  <polygon
                    points={`${x},10 ${x + 6},20 ${x + 2},22 ${x - 4},19 ${x - 7},14`}
                    fill="#FF4D00"
                  />
                )}
                <text
                  x={x}
                  y={38}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  letterSpacing="0.08"
                  fill={isActive ? '#FF4D00' : '#666'}
                  fontFamily="system-ui"
                  style={{ textTransform: 'uppercase' }}
                >
                  {entry.vibe}
                </text>
                <text
                  x={x}
                  y={52}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#444"
                  fontFamily="system-ui"
                >
                  {formatDate(entry.timestamp)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {activeEntry && (
        <div className="timeline__expanded">
          <p className="timeline__expanded-vibe">{activeEntry.vibe}</p>
          {(activeEntry.tracks ?? []).map((t, i) => (
            <div key={i} className="timeline__track">
              <span className="timeline__track-name">{t.name}</span>
              <span className="timeline__track-artist">{t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create MoodTimeline.css**

```css
/* src/components/MoodTimeline.css */
.timeline {
  padding: 0 0 24px;
}

.timeline__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 0 24px;
  margin-bottom: 8px;
}

.timeline__scroll {
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.timeline__scroll::-webkit-scrollbar { display: none; }

.timeline__svg {
  display: block;
}

.timeline__expanded {
  margin: 0 24px;
  padding-top: 12px;
  border-top: 1px solid var(--dim);
  animation: slide-up 0.25s ease-out;
}

.timeline__expanded-vibe {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--coral);
  margin-bottom: 8px;
}

.timeline__track {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #111;
}

.timeline__track-name {
  font-size: 12px;
  color: var(--white);
}

.timeline__track-artist {
  font-size: 11px;
  color: var(--muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MoodTimeline.jsx src/components/MoodTimeline.css
git commit -m "feat: add MoodTimeline horizontal scroll with SVG connecting line"
```

---

## Task 18: FavouritesMix Component

**Files:**
- Create: `src/components/FavouritesMix.jsx`
- Create: `src/components/FavouritesMix.css`

- [ ] **Step 1: Create FavouritesMix.jsx**

```jsx
// src/components/FavouritesMix.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { generatePlaylist } from '../utils/generatePlaylist'
import Vinyl from './Vinyl'
import './FavouritesMix.css'

export default function FavouritesMix({ uid }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users', uid, 'playlists'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snap = await getDocs(q)
      const moods = snap.docs.map(d => d.data().mood).filter(Boolean)
      generatePlaylist({ vibes: moods, source: 'history' })
      navigate('/results', { state: { mood: 'YOUR TASTE', fromHistory: true } })
    } catch (err) {
      console.error('Mix failed:', err)
      setLoading(false)
    }
  }

  return (
    <section className="fav-mix">
      {loading ? (
        <div className="fav-mix__loading">
          <Vinyl size="small" active />
          <p className="fav-mix__loading-text">reading your taste</p>
        </div>
      ) : (
        <>
          <h2 className="fav-mix__title">MIX YOUR FAVOURITES</h2>
          <p className="fav-mix__sub">we read your saved playlists and build something new</p>
          <button className="fav-mix__cta" onClick={handleGenerate}>
            GENERATE MIX
          </button>
        </>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Create FavouritesMix.css**

```css
/* src/components/FavouritesMix.css */
.fav-mix {
  padding: 40px 24px 32px;
}

.fav-mix__title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--white);
  margin-bottom: 10px;
}

.fav-mix__sub {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 20px;
}

.fav-mix__cta {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--coral);
  background: none;
  border: none;
  border-bottom: 1px solid var(--coral);
  padding-bottom: 2px;
  cursor: pointer;
  transition: transform 0.08s ease;
}

.fav-mix__cta:active { transform: scale(0.97); }

.fav-mix__loading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.fav-mix__loading-text {
  font-size: 13px;
  font-style: italic;
  color: var(--muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/FavouritesMix.jsx src/components/FavouritesMix.css
git commit -m "feat: add FavouritesMix component that reads Firestore and generates a history-based mix"
```

---

## Task 19: CollageGrid Component

**Files:**
- Create: `src/components/CollageGrid.jsx`
- Create: `src/components/CollageGrid.css`

- [ ] **Step 1: Create CollageGrid.jsx**

```jsx
// src/components/CollageGrid.jsx
import { useNavigate } from 'react-router-dom'
import './CollageGrid.css'

const VIBE_COLORS = {
  HYPE:         '#FF4D00',
  MELANCHOLIC:  '#7B2FFF',
  FOCUS:        '#CCFF00',
  'LATE NIGHT': '#111111',
  HEARTBREAK:   '#3D0099',
  'ROAD TRIP':  '#CC3D00',
}

const POLYGONS = [
  'polygon(0% 0%, 95% 0%, 100% 90%, 5% 100%)',
  'polygon(5% 0%, 100% 0%, 95% 100%, 0% 95%)',
  'polygon(0% 5%, 100% 0%, 95% 100%, 0% 100%)',
  'polygon(0% 0%, 100% 5%, 100% 100%, 5% 95%)',
  'polygon(3% 0%, 97% 3%, 100% 97%, 0% 100%)',
  'polygon(0% 3%, 100% 0%, 97% 100%, 3% 97%)',
  'polygon(5% 5%, 100% 0%, 95% 95%, 0% 100%)',
  'polygon(0% 0%, 95% 5%, 100% 100%, 5% 95%)',
  'polygon(3% 0%, 100% 3%, 97% 100%, 0% 97%)',
]

export default function CollageGrid({ playlists }) {
  const navigate = useNavigate()

  return (
    <div className="collage-grid">
      {playlists.map((pl, i) => {
        const bg = VIBE_COLORS[pl.mood?.toUpperCase()] ?? VIBE_COLORS[Object.keys(VIBE_COLORS).find(k => pl.mood?.toUpperCase().includes(k))] ?? '#2A2A2A'
        const clip = POLYGONS[i % POLYGONS.length]
        const nameColor = bg === '#CCFF00' ? '#080808' : '#F2F2F2'
        return (
          <button
            key={pl.id}
            className="collage-grid__cell"
            style={{ '--cell-bg': bg, '--cell-clip': clip, '--stagger': `${i * 60}ms` }}
            onClick={() => navigate('/results', { state: { mood: pl.mood ?? pl.name } })}
          >
            <div
              className="collage-grid__inner"
              style={{ clipPath: clip, background: bg }}
            >
              <span className="collage-grid__name" style={{ color: nameColor }}>
                {pl.name}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create CollageGrid.css**

```css
/* src/components/CollageGrid.css */
.collage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.collage-grid__cell {
  aspect-ratio: 1;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  animation: scale-in 0.35s ease-out var(--stagger, 0ms) both;
}

.collage-grid__cell:active { transform: scale(0.97); }

.collage-grid__inner {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.collage-grid__name {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1.3;
  max-width: calc(100% - 16px);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CollageGrid.jsx src/components/CollageGrid.css
git commit -m "feat: add CollageGrid with irregular polygon clip-path cells and stagger animation"
```

---

## Task 20: TrackCard — Preview, Pin, Flat SVG Art

**Files:**
- Modify: `src/components/TrackCard.jsx`
- Modify: `src/components/TrackCard.css`

- [ ] **Step 1: Rewrite TrackCard.jsx**

```jsx
// src/components/TrackCard.jsx
import { useState, useRef, useEffect } from 'react'
import { useSwipe } from '../hooks/useSwipe'
import { useLongPress } from '../hooks/useLongPress'
import Waveform from './Waveform'
import './TrackCard.css'

const ART_COLORS = ['#FF4D00', '#7B2FFF', '#CCFF00', '#2A2A2A', '#F2F2F2', '#0D0D0D', '#3D0099', '#CC3D00']

// Unique polygon clip per art slot
const ART_CLIPS = [
  'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)',
  'polygon(0% 8%, 100% 0%, 100% 92%, 0% 100%)',
  'polygon(0% 0%, 92% 8%, 100% 100%, 8% 92%)',
  'polygon(0% 0%, 100% 8%, 92% 100%, 0% 92%)',
  'polygon(8% 8%, 100% 0%, 92% 92%, 0% 100%)',
  'polygon(0% 0%, 92% 0%, 100% 92%, 8% 100%)',
  'polygon(4% 0%, 96% 4%, 100% 96%, 0% 100%)',
  'polygon(0% 4%, 100% 0%, 96% 100%, 4% 96%)',
]

const PREVIEW_DURATION = 30000

export default function TrackCard({
  track,
  index = 0,
  previewing = false,
  pinned = false,
  showPinLabel = false,
  onPreview,
  onPin,
  onSave,
}) {
  const [swiped, setSwiped] = useState(false)
  const timerRef = useRef(null)

  const swipe = useSwipe({
    onSwipeLeft:  () => setSwiped(true),
    onSwipeRight: () => setSwiped(false),
  })

  const longPress = useLongPress(() => onPin?.(track.name), 600)

  const color = ART_COLORS[index % ART_COLORS.length]
  const clip  = ART_CLIPS[index % ART_CLIPS.length]
  const textOnLight = color === '#CCFF00' || color === '#F2F2F2'

  const handleArtTap = (e) => {
    e.stopPropagation()
    onPreview?.(index)
  }

  return (
    <div className={`tc-wrapper${swiped ? ' tc-wrapper--swiped' : ''}`}>
      <div
        className={`track-card${previewing ? ' track-card--previewing' : ''}${pinned ? ' track-card--pinned' : ''}`}
        {...swipe}
        {...longPress}
      >
        {/* Album art — irregular SVG shape */}
        <div className="track-card__art-wrap" onClick={handleArtTap}>
          <div
            className="track-card__art"
            style={{ background: color, clipPath: clip }}
          />
          {previewing && (
            <svg className="track-card__progress-ring" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="#FF4D00"
                strokeWidth="2"
                strokeDasharray="125.7"
                strokeDashoffset="125.7"
                className="track-card__ring-fill"
              />
            </svg>
          )}
        </div>

        <div className="track-card__info">
          <p className="track-card__name">{track.name}</p>
          {previewing
            ? <Waveform speed="fast" bars={4} />
            : <p className="track-card__artist">{track.artist}</p>
          }
          {pinned && <span className="track-card__pinned-label">PINNED</span>}
        </div>

        <div className="track-card__meta">
          <span className="track-card__duration">{track.duration}</span>
          {showPinLabel && (
            <span className="track-card__pin-hint" onClick={(e) => { e.stopPropagation(); onPin?.(track.name) }}>
              PIN
            </span>
          )}
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

- [ ] **Step 2: Rewrite TrackCard.css**

```css
/* src/components/TrackCard.css */
.tc-wrapper {
  position: relative;
  overflow: hidden;
}

.track-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  border-bottom: 1px solid #111;
  background: var(--bg);
  position: relative;
  transition: transform 0.2s ease;
}

.track-card--pinned {
  border-left: 3px solid var(--coral);
  padding-left: 21px;
}

.track-card:active { transform: scale(0.98); }

/* Art */
.track-card__art-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  cursor: pointer;
}

.track-card__art {
  width: 44px;
  height: 44px;
}

.track-card__progress-ring {
  position: absolute;
  inset: -4px;
  width: 52px;
  height: 52px;
  pointer-events: none;
}

.track-card__ring-fill {
  animation: ring-fill 30s linear forwards;
  transform-origin: center;
  transform: rotate(-90deg);
}

@keyframes ring-fill {
  from { stroke-dashoffset: 125.7; }
  to   { stroke-dashoffset: 0; }
}

/* Info */
.track-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.track-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-card__artist {
  font-size: 12px;
  color: var(--muted);
}

.track-card__pinned-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--coral);
}

/* Meta */
.track-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.track-card__duration {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.05em;
}

.track-card__pin-hint {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
}

.track-card__pin-hint:active { color: var(--coral); }

/* Swipe */
.tc-wrapper--swiped .track-card {
  transform: translateX(-80px);
}

.tc-save-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: var(--coral);
  color: #080808;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/results`. Track cards show flat colored irregular polygon art shapes. No gradients. Tapping art should trigger preview state with progress ring. Long-press shows PIN option.

- [ ] **Step 4: Commit**

```bash
git add src/components/TrackCard.jsx src/components/TrackCard.css
git commit -m "feat: update TrackCard with flat SVG art, preview ring, and pin support"
```

---

## Task 21: Home Page — Integrate All Features

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/pages/Home.css`

- [ ] **Step 1: Rewrite Home.jsx**

```jsx
// src/pages/Home.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlend } from '../hooks/useBlend'
import { useMoodDial } from '../hooks/useMoodDial'
import { generatePlaylist } from '../utils/generatePlaylist'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import BlendOrb from '../components/BlendOrb'
import MoodDial from '../components/MoodDial'
import MoodOfDay from '../components/MoodOfDay'
import VibeLeaderboard from '../components/VibeLeaderboard'
import './Home.css'

const VIBES = ['HYPE', 'MELANCHOLIC', 'FOCUS', 'LATE NIGHT', 'HEARTBREAK', 'ROAD TRIP']
const TABS  = ['DESCRIBE', 'BLEND', 'DIAL']

export default function Home({ user }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('DESCRIBE')
  const [mood, setMood] = useState('')
  const dialCanvasRef = useRef(null)

  const { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel } = useBlend()
  const { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd } = useMoodDial(300)

  const canGenerate =
    (activeTab === 'DESCRIBE' && mood.trim()) ||
    (activeTab === 'BLEND'    && selectedVibes.length > 0) ||
    (activeTab === 'DIAL')

  const handleGenerate = () => {
    if (!canGenerate) return
    if (activeTab === 'DESCRIBE') {
      navigate('/results', { state: { mood: mood.trim() } })
    } else if (activeTab === 'BLEND') {
      navigate('/results', { state: { mood: selectedVibes[0] ?? 'BLEND', vibes: selectedVibes.map(v => ({ name: v, weight: weights[v] })) } })
    } else {
      navigate('/results', { state: { mood: moodDescriptor, energy: position.x, valence: position.y } })
    }
  }

  const tabIndex = TABS.indexOf(activeTab)

  return (
    <div className="home page">
      <header className="home__header">
        <span className="home__logo">BS</span>
        <button className="home__avatar" onClick={() => navigate('/profile')}>
          {(user?.displayName?.[0] ?? (user?.isAnonymous ? 'G' : 'U')).toUpperCase()}
        </button>
      </header>

      <MoodOfDay />

      <main className="home__main">
        <h1 className="home__hero">WHAT'S<br />THE VIBE?</h1>

        {/* Tab switcher */}
        <div className="home__tabs">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`home__tab${activeTab === tab ? ' home__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <span className="home__tab-indicator" style={{ left: `calc(${tabIndex} * 33.33%)` }} />
        </div>

        {/* DESCRIBE */}
        {activeTab === 'DESCRIBE' && (
          <div className="home__describe">
            <input
              className="home__input"
              placeholder="describe a feeling"
              value={mood}
              onChange={e => setMood(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>
        )}

        {/* BLEND */}
        {activeTab === 'BLEND' && (
          <div className="home__blend">
            <div className="home__vibes">
              {VIBES.map(v => (
                <VibeCard
                  key={v}
                  vibe={v}
                  selected={selectedVibes.includes(v)}
                  onSelect={toggleVibe}
                />
              ))}
            </div>

            {selectedVibes.length >= 2 && (
              <>
                <BlendOrb selectedVibes={selectedVibes} />
                <p className="home__blend-label">
                  {selectedVibes.map((v, i) => (
                    <span key={v}>
                      {v} <span className="home__blend-weight">{weights[v] ?? 0}</span>
                      {i < selectedVibes.length - 1 && ' — '}
                    </span>
                  ))}
                </p>
                <div className="home__scrubbers">
                  {selectedVibes.map(v => (
                    <WeightScrubber
                      key={v}
                      vibe={v}
                      weight={weights[v] ?? 0}
                      onAdjust={adjustWeight}
                    />
                  ))}
                </div>
              </>
            )}

            {selectedVibes.length === 1 && (
              <div className="home__vibes-hint">
                select up to 2 more to blend
              </div>
            )}
          </div>
        )}

        {/* DIAL */}
        {activeTab === 'DIAL' && (
          <div className="home__dial">
            <MoodDial onChange={() => {}} />
          </div>
        )}

        <button
          className="home__generate"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {activeTab === 'BLEND' && selectedVibes.length >= 2 ? 'BLEND + GENERATE' : 'GENERATE PLAYLIST'}
        </button>
      </main>

      <VibeLeaderboard onVibeSelect={(vibe) => { setActiveTab('BLEND'); toggleVibe(vibe) }} />

      <Navbar />
    </div>
  )
}

function WeightScrubber({ vibe, weight, onAdjust }) {
  const trackRef = useRef(null)

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const pct = Math.round(Math.max(0, Math.min(rect.width, x)) / rect.width * 100)
    onAdjust(vibe, pct)
  }

  return (
    <div className="scrubber">
      <span className="scrubber__label">{vibe}</span>
      <div
        className="scrubber__track"
        ref={trackRef}
        onTouchMove={handleTouchMove}
      >
        <div className="scrubber__fill" style={{ width: `${weight}%` }} />
        <div className="scrubber__thumb" style={{ left: `${weight}%` }} />
      </div>
      <span className="scrubber__value">{weight}</span>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Home.css**

```css
/* src/pages/Home.css */
.home__header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--dim);
}

.home__logo {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--white);
}

.home__avatar {
  width: 32px;
  height: 32px;
  background: var(--dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  clip-path: polygon(0% 8%, 92% 0%, 100% 92%, 8% 100%);
}

.home__avatar:active { transform: scale(0.97); }

.home__main {
  padding: 32px 24px 0;
}

.home__hero {
  font-size: clamp(52px, 14vw, 72px);
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  line-height: 0.95;
  color: var(--white);
  margin-bottom: 32px;
}

/* Tab switcher */
.home__tabs {
  position: relative;
  display: flex;
  gap: 0;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--dim);
}

.home__tab {
  flex: 1;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: none;
  padding: 10px 0;
  cursor: pointer;
  transition: color 0.15s ease;
}

.home__tab--active { color: var(--white); }
.home__tab:active  { transform: scale(0.97); }

.home__tab-indicator {
  position: absolute;
  bottom: -1px;
  width: 33.33%;
  height: 1px;
  background: var(--coral);
  transition: left 0.25s ease;
}

/* Describe tab */
.home__describe { margin-bottom: 24px; }

.home__input {
  width: 100%;
  background: var(--dim);
  border: none;
  color: var(--white);
  font-size: 16px;
  font-family: var(--font);
  padding: 16px 20px;
  outline: none;
  clip-path: polygon(0% 5%, 98% 0%, 100% 95%, 2% 100%);
}

.home__input::placeholder { color: var(--muted); }

/* Blend tab */
.home__blend { margin-bottom: 24px; }

.home__vibes {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin: 0 -24px;
  padding: 0 24px 8px;
  scrollbar-width: none;
}

.home__vibes::-webkit-scrollbar { display: none; }

.home__blend-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--white);
  margin: 16px 0 8px;
  text-align: center;
}

.home__blend-weight { color: var(--coral); }

.home__scrubbers {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.home__vibes-hint {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.1em;
  margin: 16px 0;
  text-align: center;
}

/* Scrubber */
.scrubber {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scrubber__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  width: 80px;
  flex-shrink: 0;
}

.scrubber__track {
  flex: 1;
  height: 1px;
  background: var(--dim);
  position: relative;
  touch-action: none;
  cursor: pointer;
  padding: 8px 0;
  margin: -8px 0;
}

.scrubber__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 1px;
  background: var(--coral);
}

.scrubber__thumb {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  background: var(--coral);
  transform: translate(-50%, -50%);
}

.scrubber__value {
  font-size: 13px;
  font-weight: 700;
  color: var(--coral);
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}

/* Dial tab */
.home__dial {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  overflow-x: auto;
}

/* Generate button */
.home__generate {
  width: 100%;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #080808;
  background: var(--coral);
  border: none;
  padding: 18px 24px;
  cursor: pointer;
  margin-bottom: 40px;
  transition: opacity 0.15s ease, transform 0.08s ease;
  clip-path: polygon(0% 5%, 99% 0%, 100% 95%, 1% 100%);
}

.home__generate:active   { transform: scale(0.97); }
.home__generate:disabled { opacity: 0.35; }
```

- [ ] **Step 3: Verify in browser**

Navigate to `/home`. Verify:
- MoodOfDay section renders below header with spinning vinyl
- Tab switcher shows DESCRIBE / BLEND / DIAL with sliding underline
- DESCRIBE tab shows skewed input field
- BLEND tab shows VibeCard grid, selecting 2+ shows BlendOrb + scrubbers
- DIAL tab shows 300×300 interactive canvas
- Generate button says "BLEND + GENERATE" with 2+ vibes selected
- VibeLeaderboard shows 6 rows with stagger animation below main content

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.css
git commit -m "feat: integrate MoodOfDay, tab switcher, Blend, Dial, and Leaderboard into Home page"
```

---

## Task 22: Results Page — Preview, Reshuffle, Pin, Vibe Check

**Files:**
- Modify: `src/pages/Results.jsx`
- Modify: `src/pages/Results.css`

- [ ] **Step 1: Rewrite Results.jsx**

```jsx
// src/pages/Results.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { generatePlaylist } from '../utils/generatePlaylist'
import Vinyl from '../components/Vinyl'
import TrackCard from '../components/TrackCard'
import BottomSheet from '../components/BottomSheet'
import Toast from '../components/Toast'
import './Results.css'

const MAX_PINS = 3

export default function Results({ user }) {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const mood      = state?.fromHistory ? 'BUILT FROM YOUR HISTORY' : (state?.mood ?? 'your vibe')

  const [tracks,       setTracks]       = useState(() => generatePlaylist({ mood }))
  const [saved,        setSaved]        = useState(false)
  const [pinnedNames,  setPinnedNames]  = useState(new Set())
  const [previewIndex, setPreviewIndex] = useState(null)
  const [showPinHint,  setShowPinHint]  = useState(null)
  const [shuffling,    setShuffling]    = useState(false)
  const [showVibeCheck,setShowVibeCheck]= useState(false)
  const [vibeRating,   setVibeRating]   = useState(null)
  const [toastMsg,     setToastMsg]     = useState(null)

  const previewTimerRef = useRef(null)

  // Show vibe check 800ms after mount — only once
  useEffect(() => {
    const t = setTimeout(() => setShowVibeCheck(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => clearTimeout(previewTimerRef.current), [])

  const handlePreview = useCallback((index) => {
    clearTimeout(previewTimerRef.current)
    if (previewIndex === index) { setPreviewIndex(null); return }
    setPreviewIndex(index)
    previewTimerRef.current = setTimeout(() => setPreviewIndex(null), PREVIEW_DURATION || 30000)
  }, [previewIndex])

  const handlePin = useCallback((name) => {
    setPinnedNames(prev => {
      if (prev.has(name)) {
        const next = new Set(prev)
        next.delete(name)
        setShowPinHint(null)
        return next
      }
      if (prev.size >= MAX_PINS) {
        setToastMsg('3 PINS MAXIMUM')
        return prev
      }
      setShowPinHint(null)
      return new Set([...prev, name])
    })
  }, [])

  const handleReshuffle = () => {
    if (shuffling) return
    setShuffling(true)
    setTimeout(() => {
      setTracks(prev => {
        const pinned   = prev.filter(t => pinnedNames.has(t.name))
        const unpinned = prev.filter(t => !pinnedNames.has(t.name))
        const fresh    = generatePlaylist({ mood }).filter(t => !pinnedNames.has(t.name))
        const reshuffled = fresh.length >= unpinned.length ? fresh.slice(0, unpinned.length) : [...fresh, ...unpinned].slice(0, unpinned.length)
        const result = []
        let ui = 0
        prev.forEach(t => {
          if (pinnedNames.has(t.name)) result.push(t)
          else result.push(reshuffled[ui++] ?? t)
        })
        return result
      })
      setShuffling(false)
    }, 220)
  }

  const handleVibeRating = async (rating) => {
    setVibeRating(rating)
    setShowVibeCheck(false)
    setToastMsg('NOTED')
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'vibeChecks'), {
          mood, rating, timestamp: serverTimestamp(),
        })
      } catch { /* non-critical */ }
    }
  }

  const handleSave = async () => {
    if (!user?.uid || saved) return
    setSaved(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood.toUpperCase()} MIX`,
        mood,
        createdAt: serverTimestamp(),
        tracks,
      })
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }

  return (
    <div className={`results page${shuffling ? ' results--shuffling' : ''}`}>
      <header className="results__header">
        <button className="results__back" onClick={() => navigate(-1)}>BACK</button>
        <span className="results__title">YOUR PLAYLIST</span>
        <div style={{ width: 48 }} />
      </header>

      <div className="results__mood-area">
        <p className="results__mood-label">"{mood}"</p>
        <Vinyl size="small" active />
      </div>

      {/* Toolbar */}
      <div className="results__toolbar">
        <button className="results__reshuffle" onClick={handleReshuffle}>RESHUFFLE</button>
        {pinnedNames.size > 0 && (
          <span className="results__pin-count">{pinnedNames.size} PINNED</span>
        )}
      </div>

      <div className="results__tracks">
        {tracks.map((track, i) => (
          <TrackCard
            key={`${track.name}-${i}`}
            track={track}
            index={i}
            previewing={previewIndex === i}
            pinned={pinnedNames.has(track.name)}
            showPinLabel={showPinHint === i}
            onPreview={handlePreview}
            onPin={handlePin}
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
          {saved ? 'SAVED' : 'SAVE'}
        </button>
      </div>

      {/* Vibe Check */}
      <BottomSheet visible={showVibeCheck} onDismiss={() => setShowVibeCheck(false)}>
        <p className="vibe-check__heading">HOW DID WE DO</p>
        <div className="vibe-check__options">
          {['PERFECT', 'CLOSE', 'MISS'].map(r => (
            <button
              key={r}
              className={`vibe-check__option${vibeRating === r ? ' vibe-check__option--selected' : ''}`}
              onClick={() => handleVibeRating(r.toLowerCase())}
            >
              {r}
            </button>
          ))}
        </div>
      </BottomSheet>

      <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
    </div>
  )
}

const PREVIEW_DURATION = 30000
```

- [ ] **Step 2: Rewrite Results.css**

```css
/* src/pages/Results.css */
.results__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--dim);
}

.results__back {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
}

.results__back:active { transform: scale(0.97); }

.results__title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.results__mood-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 24px 24px;
}

.results__mood-label {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--white);
  flex: 1;
  line-height: 1.1;
}

/* Toolbar */
.results__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px 16px;
}

.results__reshuffle {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--white);
  background: none;
  border: none;
  border-bottom: 1px solid var(--white);
  padding-bottom: 2px;
  cursor: pointer;
}

.results__reshuffle:active { transform: scale(0.97); }

.results__pin-count {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--coral);
}

/* Tracks */
.results__tracks {
  padding-bottom: 100px;
}

.results--shuffling .track-card {
  animation: track-slide-out 0.2s ease-in forwards;
}

/* Actions */
.results__actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px max(16px, env(safe-area-inset-bottom));
  background: var(--bg);
  border-top: 1px solid var(--dim);
  display: flex;
  gap: 12px;
}

.results__btn {
  flex: 1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 14px;
  cursor: pointer;
  border: none;
}

.results__btn--save {
  background: var(--coral);
  color: #080808;
  clip-path: polygon(0% 8%, 98% 0%, 100% 92%, 2% 100%);
}

.results__btn--saved {
  background: var(--dim);
  color: var(--muted);
}

.results__btn:active { transform: scale(0.97); }
.results__btn:disabled { opacity: 0.5; }

/* Vibe Check */
.vibe-check__heading {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 20px;
}

.vibe-check__options {
  display: flex;
  gap: 24px;
  align-items: center;
}

.vibe-check__option {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--white);
  background: none;
  border: none;
  cursor: pointer;
  padding-bottom: 3px;
}

.vibe-check__option--selected {
  border-bottom: 1px solid var(--coral);
  color: var(--coral);
}

.vibe-check__option:active { transform: scale(0.97); }
```

- [ ] **Step 3: Verify in browser**

Navigate to `/results`. Verify:
- 8 tracks render with flat polygon art shapes
- Vibe Check sheet slides up after 800ms
- Tapping PERFECT/CLOSE/MISS dismisses sheet and fires Toast "NOTED"
- RESHUFFLE reshuffles unpinned tracks
- Long-pressing a track for 600ms shows PIN option; tapping adds coral left border
- Attempting a 4th pin fires Toast "3 PINS MAXIMUM"
- Tapping album art shows progress ring animating over 30s

- [ ] **Step 4: Commit**

```bash
git add src/pages/Results.jsx src/pages/Results.css
git commit -m "feat: add track preview, reshuffle, pin, and vibe check to Results page"
```

---

## Task 23: Saved Page — FavouritesMix, Timeline, CollageGrid

**Files:**
- Modify: `src/pages/Saved.jsx`
- Modify: `src/pages/Saved.css`

- [ ] **Step 1: Rewrite Saved.jsx**

```jsx
// src/pages/Saved.jsx
import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useLongPress } from '../hooks/useLongPress'
import Navbar from '../components/Navbar'
import FavouritesMix from '../components/FavouritesMix'
import MoodTimeline from '../components/MoodTimeline'
import CollageGrid from '../components/CollageGrid'
import './Saved.css'

function PlaylistRow({ playlist, uid }) {
  const [expanded, setExpanded] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const longPress = useLongPress(() => setShowDelete(true))

  const handleDelete = async () => {
    try { await deleteDoc(doc(db, 'users', uid, 'playlists', playlist.id)) }
    catch (err) { console.error('Delete failed:', err) }
  }

  const formatDate = (ts) => {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`pl-row${showDelete ? ' pl-row--delete' : ''}`}>
      <div
        className="pl-row__main"
        onClick={() => { setExpanded(e => !e); setShowDelete(false) }}
        {...longPress}
      >
        <div className="pl-row__info">
          <p className="pl-row__name">{playlist.name}</p>
          <span className="pl-row__meta">{formatDate(playlist.createdAt)} · {playlist.tracks?.length ?? 0} tracks</span>
        </div>
        <span className="pl-row__chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {showDelete && (
        <div className="pl-row__delete-bar">
          <button className="pl-row__delete-btn" onClick={handleDelete}>DELETE</button>
          <button className="pl-row__cancel-btn" onClick={() => setShowDelete(false)}>CANCEL</button>
        </div>
      )}

      {expanded && (
        <div className="pl-row__tracks">
          {(playlist.tracks ?? []).map((t, i) => (
            <div key={i} className="pl-row__track">
              <span className="pl-row__track-name">{t.name}</span>
              <span className="pl-row__track-artist">{t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Saved({ user }) {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [moodHistory, setMoodHistory] = useState([])
  const [view, setView] = useState('LIST')
  const [pulling, setPulling] = useState(false)
  const pullStartY = useRef(null)

  useEffect(() => {
    if (!user?.uid) return
    const q = query(collection(db, 'users', user.uid, 'playlists'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) return
    const q = query(collection(db, 'users', user.uid, 'moodHistory'), orderBy('timestamp', 'desc'))
    return onSnapshot(q, snap => setMoodHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [user?.uid])

  const handleTouchStart = (e) => { pullStartY.current = e.touches[0].clientY }
  const handleTouchMove  = (e) => {
    if (pullStartY.current === null) return
    if (e.touches[0].clientY - pullStartY.current > 60 && window.scrollY === 0) setPulling(true)
  }
  const handleTouchEnd = () => {
    if (pulling) { setTimeout(() => setPulling(false), 800) }
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
        <div className="saved__pull">
          <div className="loading-eq">
            {[...Array(5)].map((_, i) => <div key={i} className="loading-eq__bar" />)}
          </div>
        </div>
      )}

      <header className="saved__header">
        <span className="saved__watermark">SAVED</span>
        <div className="saved__view-toggle">
          <button
            className={`saved__view-btn${view === 'LIST' ? ' saved__view-btn--active' : ''}`}
            onClick={() => setView('LIST')}
          >LIST</button>
          <span className="saved__view-sep">—</span>
          <button
            className={`saved__view-btn${view === 'GRID' ? ' saved__view-btn--active' : ''}`}
            onClick={() => setView('GRID')}
          >GRID</button>
        </div>
      </header>

      <FavouritesMix uid={user?.uid} />

      <MoodTimeline entries={moodHistory} />

      <main className="saved__main">
        {playlists.length === 0 ? (
          <div className="saved__empty">
            <p className="saved__empty-text">nothing saved yet</p>
            <a className="saved__empty-link" href="/home">generate your first playlist</a>
          </div>
        ) : view === 'LIST' ? (
          playlists.map(pl => (
            <PlaylistRow key={pl.id} playlist={pl} uid={user.uid} />
          ))
        ) : (
          <CollageGrid playlists={playlists} />
        )}
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Saved.css**

```css
/* src/pages/Saved.css */
.saved__pull {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.saved__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 24px 0;
}

.saved__watermark {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--dim);
}

.saved__view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.saved__view-btn {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
}

.saved__view-btn--active {
  color: var(--white);
  border-bottom: 1px solid var(--white);
}

.saved__view-btn:active { transform: scale(0.97); }

.saved__view-sep {
  color: var(--dim);
  font-size: 12px;
}

.saved__main { padding-bottom: 24px; }

/* Playlist row */
.pl-row {
  border-bottom: 1px solid var(--dim);
}

.pl-row__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  cursor: pointer;
}

.pl-row__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.pl-row__name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-row__meta {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.05em;
}

.pl-row__chevron {
  font-size: 10px;
  color: var(--muted);
  margin-left: 12px;
}

.pl-row__delete-bar {
  display: flex;
  gap: 0;
  border-top: 1px solid var(--dim);
}

.pl-row__delete-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--coral);
  cursor: pointer;
}

.pl-row__cancel-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-left: 1px solid var(--dim);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
}

.pl-row__tracks { padding: 0 24px 16px; }

.pl-row__track {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #111;
}

.pl-row__track-name   { font-size: 13px; color: var(--white); }
.pl-row__track-artist { font-size: 12px; color: var(--muted); }

/* Empty */
.saved__empty {
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved__empty-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: -0.02em;
}

.saved__empty-link {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--coral);
  border-bottom: 1px solid var(--coral);
  width: fit-content;
  padding-bottom: 2px;
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/saved`. Verify:
- FavouritesMix section renders at top with "MIX YOUR FAVOURITES" heading
- MoodTimeline renders below (empty if no history yet — component returns null)
- LIST/GRID toggle in header switches between playlist rows and CollageGrid
- CollageGrid shows fragmented polygon cells with flat colors

- [ ] **Step 4: Commit**

```bash
git add src/pages/Saved.jsx src/pages/Saved.css
git commit -m "feat: integrate FavouritesMix, MoodTimeline, and CollageGrid into Saved page"
```

---

## Task 24: Profile Page — Full Replacement

**Files:**
- Modify: `src/pages/Profile.jsx`
- Modify: `src/pages/Profile.css`

- [ ] **Step 1: Rewrite Profile.jsx**

```jsx
// src/pages/Profile.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import Navbar from '../components/Navbar'
import RadarChart from '../components/RadarChart'
import './Profile.css'

const TOP_VIBES    = ['LATE NIGHT', 'FOCUS', 'HYPE', 'MELANCHOLIC', 'ROAD TRIP']
const VIBE_SIZES   = [24, 20, 16, 13, 11]
const DAY_LABELS   = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const BAR_HEIGHTS  = [40, 65, 30, 80, 55, 90, 45]
const BAR_WIDTHS   = [8, 11, 9, 13, 10, 12, 9]

export default function Profile({ user }) {
  const navigate = useNavigate()
  const [error, setError]   = useState(null)

  const displayName = user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const initial     = displayName[0]?.toUpperCase() ?? '?'
  const since       = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/login') }
    catch { setError('Sign out failed. Try again.') }
  }

  return (
    <div className="profile page">
      <main className="profile__main">

        {/* Header */}
        <div className="profile__header">
          <div className="profile__blob-wrap">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <path
                d="M60 8 C88 4, 116 28, 112 58 C108 90, 82 116, 52 112 C22 108, 4 82, 8 54 C12 26, 32 12, 60 8 Z"
                fill="#FF4D00"
              />
              <text
                x="60" y="66"
                textAnchor="middle"
                fontSize="36"
                fontWeight="900"
                fontFamily="system-ui"
                fill="#080808"
                letterSpacing="-2"
              >
                {initial}
              </text>
            </svg>
          </div>
          <div>
            <p className="profile__name">{displayName.toUpperCase()}</p>
            <p className="profile__since">since {since}</p>
          </div>
        </div>

        {/* Your Sound section */}
        <div className="profile__section-header">
          <span className="profile__section-label">YOUR SOUND</span>
          <svg className="profile__section-line" height="1" viewBox="0 0 200 1" preserveAspectRatio="none">
            <path d="M0 0.5 C50 0.3, 100 0.7, 200 0.5" stroke="#FF4D00" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <RadarChart />

        {/* Top vibes */}
        <div className="profile__section-header">
          <span className="profile__section-label">TOP VIBES</span>
        </div>
        <div className="profile__vibes">
          {TOP_VIBES.map((v, i) => (
            <span
              key={v}
              className="profile__vibe-item"
              style={{
                fontSize: `${VIBE_SIZES[i]}px`,
                color: i === 0 ? 'var(--coral)' : 'var(--muted)',
              }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="profile__stats">
          <div className="profile__stat">
            <span className="profile__stat-num">24</span>
            <span className="profile__stat-label">PLAYLISTS</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-num">187</span>
            <span className="profile__stat-label">TRACKS</span>
          </div>
        </div>

        {/* 7-day mood bar chart */}
        <div className="profile__section-header">
          <span className="profile__section-label">THIS WEEK</span>
        </div>
        <div className="profile__barchart">
          {DAY_LABELS.map((day, i) => (
            <div key={day} className="profile__bar-col">
              <div
                className="profile__bar"
                style={{
                  height: `${BAR_HEIGHTS[i]}%`,
                  width: `${BAR_WIDTHS[i]}px`,
                }}
              />
              <span className="profile__bar-label">{day}</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button className="profile__signout" onClick={handleSignOut}>
          sign out
        </button>
        {error && <p className="profile__error">{error}</p>}
      </main>

      <Navbar />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Profile.css**

```css
/* src/pages/Profile.css */
.profile__main {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Header */
.profile__header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 48px;
}

.profile__blob-wrap {
  flex-shrink: 0;
}

.profile__name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--white);
  line-height: 1;
  margin-bottom: 6px;
}

.profile__since {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.05em;
}

/* Section header */
.profile__section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  margin-top: 40px;
}

.profile__section-header:first-of-type { margin-top: 0; }

.profile__section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
  flex-shrink: 0;
}

.profile__section-line {
  flex: 1;
  overflow: visible;
}

/* Top vibes */
.profile__vibes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.profile__vibe-item {
  font-weight: 800;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  line-height: 1.2;
}

/* Stats */
.profile__stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.profile__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile__stat-num {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--white);
  line-height: 1;
}

.profile__stat-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Bar chart */
.profile__barchart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 80px;
  margin-bottom: 8px;
}

.profile__bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  justify-content: flex-end;
}

.profile__bar {
  background: var(--coral);
  flex-shrink: 0;
}

.profile__bar-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Sign out */
.profile__signout {
  margin-top: 48px;
  font-size: 13px;
  color: var(--muted);
  background: none;
  border: none;
  border-bottom: 1px solid var(--muted);
  padding-bottom: 2px;
  cursor: pointer;
  width: fit-content;
  letter-spacing: 0.05em;
}

.profile__signout:active { transform: scale(0.97); }

.profile__error {
  font-size: 12px;
  color: var(--coral);
  margin-top: 12px;
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/profile`. Verify:
- Large irregular organic SVG blob with user initial in `--coral`
- Name below in heavy uppercase
- "YOUR SOUND" section with RadarChart — polygon strokes in on page load, fill fades in
- TOP VIBES as sized plain text list (24px → 11px), top in coral
- Stats: two large numbers, no boxes
- 7-day bar chart with irregular bar widths, flat coral bars
- "sign out" as plain lowercase muted text with underline

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.jsx src/pages/Profile.css
git commit -m "feat: replace Profile page with radar chart, vibes list, stats, and bar chart"
```

---

## Self-Review

**Spec coverage check:**

| Feature | Task(s) |
|---|---|
| Mood Blending (Feature 1) | Tasks 9, 11, 21 |
| Mood Dial (Feature 2) | Tasks 10, 13, 21 |
| Taste Profile Page (Feature 3) | Tasks 14, 24 |
| Mood Timeline (Feature 4) | Tasks 17, 23 |
| Vibe Leaderboard (Feature 5) | Tasks 16, 21 |
| Mood of the Day (Feature 6) | Tasks 15, 21 |
| Favourites Mix (Feature 7) | Tasks 18, 23 |
| Track Preview + Vibe Check (Feature 8) | Tasks 6, 7, 20, 22 |
| Shuffle + Pin (Feature 9) | Task 22 |
| Collage View (Feature 10) | Tasks 19, 23 |
| Design System | Task 1 |
| Waveform irregular bars | Task 3 |
| Vinyl SVG | Task 4 |
| Navbar cleanup | Task 5 |

**Naming consistency check:**
- `useBlend` returns `{ selectedVibes, weights, toggleVibe, adjustWeight, blendLabel }` — used consistently in Task 21
- `useMoodDial` returns `{ position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd }` — used in Task 13 (MoodDial) and Task 21 (Home); note Task 13 receives a canvas ref while Task 21's MoodDial manages its own ref internally
- `generatePlaylist(params)` — called consistently across Tasks 8, 22, 18
- `onPin(name)` — TrackCard calls with `track.name` (string), Results handles with `pinnedNames` Set of strings — consistent
- `onPreview(index)` — TrackCard calls with `index`, Results tracks `previewIndex` — consistent
- `BottomSheet` props: `visible`, `onDismiss`, `children` — used in Task 22 Results — consistent

**Placeholder scan:** No TBD, TODO, or vague steps found.

**No-gradient audit:** All CSS uses flat `background: var(--coral)` / `background: #FF4D00` etc. No `linear-gradient` or `radial-gradient` on any UI element. SVG paths in `MoodOfDay` and `BottomSheet` use solid fills.

**No-emoji audit:** No emoji characters in any JSX, CSS, or string literals. Unicode music notes removed from Navbar.

**No-rounded-card audit:** No `border-radius` on any card, panel, or container. `clip-path: polygon()` used instead for all irregular shapes. Only the drag point in MoodDial uses `border-radius: 50%` (a 12px circle — not a card).

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-20-beatswitch-v2.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
