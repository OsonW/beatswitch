# Home/Saved UX + Functionality Batch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the DIAL tab and Mix-Your-Favourites actually work, show real Deezer album covers on track cards, replace the Home header with a personalized greeting (removing the daily-mood section), and add a visible delete for saved mixes.

**Architecture:** Small, mostly-isolated changes across Home, MoodDial, FavouritesMix, Results, TrackCard, Saved, plus two new pure utilities (`greeting`, an `artists` branch in `moodQuery`) and a new `cover` field threaded from Deezer through `generatePlaylist`. Fully client-side; no new deps.

**Tech Stack:** React 19, Vite, Firebase (Auth + Firestore), Deezer (JSONP), Vitest.

**Spec:** `docs/superpowers/specs/2026-05-23-home-saved-features-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/utils/greeting.js` (+test) | Create | Pure: first name + random casual greeting |
| `src/music/moodQuery.js` (+test) | Modify | Add `artists` query branch |
| `src/utils/generatePlaylist.js` (+test) | Modify | Add `cover` to mapped tracks |
| `src/components/MoodDial.jsx` | Modify | Report `moodDescriptor` via `onChange` |
| `src/pages/Home.jsx` + `Home.css` | Modify | Greeting, remove header + daily mood, wire DIAL |
| `src/components/MoodOfDay.jsx` + `.css` | Delete | Daily-mood system removed |
| `src/pages/Results.jsx` | Modify | Forward `artists` to generation |
| `src/components/FavouritesMix.jsx` | Modify | Build mix from saved artists |
| `src/components/TrackCard.jsx` | Modify | Fill the polygon with the album cover |
| `src/pages/Saved.jsx` + `Saved.css` | Modify | Visible delete button per row |

Dependency-safe order: pure utilities first, then the MoodDial signal, then the consumers, then deletion of `MoodOfDay`. Build stays green after each task.

---

## Task 1: `greeting.js` — first name + casual greeting

**Files:**
- Create: `src/utils/greeting.js`
- Test: `src/utils/greeting.test.js`

- [ ] **Step 1: Write the failing tests** — `src/utils/greeting.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { firstName, pickGreeting } from './greeting'

describe('firstName', () => {
  it('returns the first word of a display name', () => {
    expect(firstName({ displayName: 'Oson Wang' })).toBe('Oson')
  })
  it('falls back to "stranger" when there is no display name', () => {
    expect(firstName({ isAnonymous: true })).toBe('stranger')
    expect(firstName(null)).toBe('stranger')
  })
})

describe('pickGreeting', () => {
  it('interpolates the name into the chosen template', () => {
    expect(pickGreeting('Oson', () => 0)).toBe('Yo, Oson')
  })
  it('uses rand to pick the template and still includes the name', () => {
    expect(pickGreeting('Oson', () => 0.99)).toContain('Oson')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/utils/greeting.test.js`
Expected: FAIL — cannot resolve `./greeting`.

- [ ] **Step 3: Implement `src/utils/greeting.js`**
```js
// src/utils/greeting.js
const GREETINGS = [
  'Yo, {name}',
  'Great day, {name}',
  "What's good, {name}",
  'Back again, {name}',
  "Let's go, {name}",
  'Hey {name}',
]

export function firstName(user) {
  const dn = user?.displayName?.trim()
  if (dn) return dn.split(/\s+/)[0]
  return 'stranger'
}

export function pickGreeting(name, rand = Math.random) {
  const template = GREETINGS[Math.floor(rand() * GREETINGS.length)]
  return template.replace('{name}', name)
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/utils/greeting.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add src/utils/greeting.js src/utils/greeting.test.js
git commit -m "feat: add greeting utility (first name + casual greeting)"
```

---

## Task 2: `moodQuery` — add `artists` branch

**Files:**
- Modify: `src/music/moodQuery.js`
- Test: `src/music/moodQuery.test.js`

- [ ] **Step 1: Add failing tests** — append these two `it` blocks inside the existing `describe('moodQuery', ...)` in `src/music/moodQuery.test.js`:
```js
  it('returns one query per artist when artists are provided (highest priority)', () => {
    const q = moodQuery({ artists: ['Drake', 'SZA'], mood: 'chill', vibes: [{ name: 'HYPE' }] })
    expect(q).toEqual(['Drake', 'SZA'])
  })

  it('ignores an empty artists array and falls through to mood', () => {
    expect(moodQuery({ artists: [], mood: 'chill' })).toEqual(['chill'])
  })
```

- [ ] **Step 2: Run to verify the new tests fail**

Run: `npx vitest run src/music/moodQuery.test.js`
Expected: FAIL — the artists case currently falls through to the `vibes`/`mood` logic, not `['Drake','SZA']`.

- [ ] **Step 3: Implement the branch.** In `src/music/moodQuery.js`, change the destructure and add the `artists` check as the FIRST branch. Replace:
```js
export function moodQuery(params = {}) {
  const { mood, vibes, energy, valence } = params
  const queries = []

  if (Array.isArray(vibes) && vibes.length) {
```
with:
```js
export function moodQuery(params = {}) {
  const { mood, vibes, energy, valence, artists } = params
  const queries = []

  if (Array.isArray(artists) && artists.length) {
    return artists.map(a => `${a}`.trim()).filter(Boolean)
  }

  if (Array.isArray(vibes) && vibes.length) {
```

- [ ] **Step 4: Run to verify all pass**

Run: `npx vitest run src/music/moodQuery.test.js`
Expected: PASS (7 tests — 5 existing + 2 new).

- [ ] **Step 5: Commit**
```bash
git add src/music/moodQuery.js src/music/moodQuery.test.js
git commit -m "feat: add artists branch to moodQuery"
```

---

## Task 3: `generatePlaylist` — include album cover

**Files:**
- Modify: `src/utils/generatePlaylist.js`
- Test: `src/utils/generatePlaylist.test.js`

- [ ] **Step 1: Add a failing test** — append inside the existing `describe('generatePlaylist', ...)` in `src/utils/generatePlaylist.test.js`:
```js
  it('includes the album cover when present', async () => {
    searchTracks.mockResolvedValue([
      { id: 9, title: 'X', duration: 100, preview: 'p', artist: { name: 'A' }, album: { cover_medium: 'http://c/9.jpg' } },
    ])
    const tracks = await generatePlaylist({ mood: 'x' })
    expect(tracks[0].cover).toBe('http://c/9.jpg')
  })
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/utils/generatePlaylist.test.js`
Expected: FAIL — `tracks[0].cover` is `undefined` (mapTrack doesn't set it yet).

- [ ] **Step 3: Implement.** In `src/utils/generatePlaylist.js`, update `mapTrack`. Replace:
```js
function mapTrack(t) {
  return {
    id: t.id,
    name: t.title,
    artist: t.artist?.name ?? 'Unknown',
    duration: secToDuration(t.duration),
    previewUrl: t.preview ?? null,
  }
}
```
with:
```js
function mapTrack(t) {
  return {
    id: t.id,
    name: t.title,
    artist: t.artist?.name ?? 'Unknown',
    duration: secToDuration(t.duration),
    previewUrl: t.preview ?? null,
    cover: t.album?.cover_medium ?? t.album?.cover_big ?? null,
  }
}
```

- [ ] **Step 4: Run to verify all pass**

Run: `npx vitest run src/utils/generatePlaylist.test.js`
Expected: PASS (5 tests — 4 existing + 1 new).

- [ ] **Step 5: Commit**
```bash
git add src/utils/generatePlaylist.js src/utils/generatePlaylist.test.js
git commit -m "feat: thread Deezer album cover through generatePlaylist"
```

---

## Task 4: `MoodDial` — report the descriptor via onChange

**Files:**
- Modify: `src/components/MoodDial.jsx`

- [ ] **Step 1: Update the onChange effect.** In `src/components/MoodDial.jsx`, replace:
```jsx
  useEffect(() => {
    onChange?.({ energy: position.x, valence: position.y })
  }, [position, onChange])
```
with:
```jsx
  useEffect(() => {
    onChange?.({ energy: position.x, valence: position.y, moodDescriptor })
  }, [position, moodDescriptor, onChange])
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds. (`MoodDial` already destructures `moodDescriptor` from its `useMoodDial`, so no other change is needed.)

- [ ] **Step 3: Commit**
```bash
git add src/components/MoodDial.jsx
git commit -m "feat: MoodDial reports moodDescriptor via onChange"
```

---

## Task 5: `Home.jsx` + `Home.css` — greeting, remove header + daily mood, wire DIAL

**Files:**
- Modify: `src/pages/Home.jsx`, `src/pages/Home.css`
- Delete: `src/components/MoodOfDay.jsx`, `src/components/MoodOfDay.css`

- [ ] **Step 1: Update imports in `src/pages/Home.jsx`.** Replace:
```jsx
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
```
with:
```jsx
import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlend } from '../hooks/useBlend'
import { pickGreeting, firstName } from '../utils/greeting'
import Navbar from '../components/Navbar'
import VibeCard from '../components/VibeCard'
import BlendOrb from '../components/BlendOrb'
import MoodDial from '../components/MoodDial'
import VibeLeaderboard from '../components/VibeLeaderboard'
import './Home.css'
```
(Removes the unused `generatePlaylist` import, the `useMoodDial` import, and the `MoodOfDay` import; adds `useMemo` and the greeting helpers.)

- [ ] **Step 2: Replace the dial hook + add greeting/dial state.** Replace:
```jsx
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('DESCRIBE')
  const [mood, setMood] = useState('')
  const dialCanvasRef = useRef(null)

  const { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel } = useBlend()
  const { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd } = useMoodDial(300)
```
with:
```jsx
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('DESCRIBE')
  const [mood, setMood] = useState('')
  const [dial, setDial] = useState({ energy: 50, valence: 50, moodDescriptor: 'balanced, undefined' })

  const { selectedVibes, weights, toggleVibe, adjustWeight } = useBlend()

  const name = firstName(user)
  const greeting = useMemo(() => pickGreeting(name), [name])
  const [before, after] = greeting.split(name)
```

- [ ] **Step 3: Use the dial state in `handleGenerate`.** Replace:
```jsx
    } else {
      navigate('/results', { state: { mood: moodDescriptor, energy: position.x, valence: position.y } })
    }
```
with:
```jsx
    } else {
      navigate('/results', { state: { mood: dial.moodDescriptor, energy: dial.energy, valence: dial.valence } })
    }
```

- [ ] **Step 4: Remove the header + MoodOfDay, add the greeting.** Replace:
```jsx
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
```
with:
```jsx
    <div className="home page">
      <main className="home__main">
        <p className="home__greeting">{before}<span className="home__greeting-name">{name}</span>{after}</p>
        <h1 className="home__hero">WHAT'S<br />THE VIBE?</h1>
```

- [ ] **Step 5: Wire the DIAL component to state.** Replace:
```jsx
          <div className="home__dial">
            <MoodDial onChange={() => {}} />
          </div>
```
with:
```jsx
          <div className="home__dial">
            <MoodDial onChange={setDial} />
          </div>
```

- [ ] **Step 6: Add greeting styles + remove dead header rules in `src/pages/Home.css`.**

Append:
```css
.home__greeting {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--white);
  padding: 28px 24px 0;
}

.home__greeting-name { color: var(--coral); }
```
Then read `src/pages/Home.css` and delete the now-dead rule blocks `.home__header { … }`, `.home__logo { … }`, and `.home__avatar { … }` (and any `:active`/pseudo variants of those three selectors). If a selector isn't present, skip it.

- [ ] **Step 7: Delete the MoodOfDay component**
```bash
git rm src/components/MoodOfDay.jsx src/components/MoodOfDay.css
```

- [ ] **Step 8: Verify build + tests + lint**

Run: `npm run build && npm test`
Expected: build succeeds; all tests pass.
Run: `npm run lint 2>&1` and confirm NO errors in `Home.jsx` (the previously pre-existing unused-`generatePlaylist` error is now gone, and no new ones — `useMoodDial`, `dialCanvasRef`, `position`, `moodDescriptor`, `MoodOfDay` are all removed).

- [ ] **Step 9: Commit**
```bash
git add src/pages/Home.jsx src/pages/Home.css
git commit -m "feat: Home greeting, remove header + daily mood, wire DIAL"
```

---

## Task 6: `Results.jsx` — forward `artists`

**Files:**
- Modify: `src/pages/Results.jsx`

- [ ] **Step 1: Add `artists` to `moodParams`.** Replace:
```jsx
  const moodParams = {
    mood:    state?.mood,
    vibes:   state?.vibes,
    energy:  state?.energy,
    valence: state?.valence,
  }
```
with:
```jsx
  const moodParams = {
    mood:    state?.mood,
    vibes:   state?.vibes,
    energy:  state?.energy,
    valence: state?.valence,
    artists: state?.artists,
  }
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**
```bash
git add src/pages/Results.jsx
git commit -m "feat: forward artists from navigation state to generation"
```

---

## Task 7: `FavouritesMix.jsx` — build from saved artists

**Files:**
- Modify: `src/components/FavouritesMix.jsx`

- [ ] **Step 1: Replace the `handleGenerate` body.** Replace:
```jsx
  const handleGenerate = async () => {
    if (!uid || loading) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users', uid, 'playlists'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snap = await getDocs(q)
      const moods = snap.docs.map(d => d.data().mood).filter(Boolean)
      navigate('/results', { state: { mood: 'YOUR TASTE', fromHistory: true, vibes: moods } })
    } catch (err) {
      console.error('Mix failed:', err)
      setLoading(false)
    }
  }
```
with:
```jsx
  const handleGenerate = async () => {
    if (!uid || loading) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users', uid, 'playlists'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snap = await getDocs(q)

      // Frequency-rank the artists across saved tracks, take the top 4 distinct.
      const counts = {}
      snap.docs.forEach(d => {
        (d.data().tracks ?? []).forEach(t => {
          (t.artist ?? '').split(',').forEach(a => {
            const name = a.trim()
            if (name) counts[name] = (counts[name] ?? 0) + 1
          })
        })
      })
      const topArtists = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name]) => name)

      navigate('/results', { state: { mood: 'YOUR TASTE', fromHistory: true, artists: topArtists } })
    } catch (err) {
      console.error('Mix failed:', err)
      setLoading(false)
    }
  }
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build`
Expected: build succeeds.
Run: `npm run lint 2>&1` and confirm no new errors in `FavouritesMix.jsx` (`limit`, `getDocs`, etc. are still used).

- [ ] **Step 3: Commit**
```bash
git add src/components/FavouritesMix.jsx
git commit -m "feat: build Mix Your Favourites from saved artists"
```

---

## Task 8: `TrackCard.jsx` — album cover in the fragmented shape

**Files:**
- Modify: `src/components/TrackCard.jsx`

> No CSS change needed — `.track-card__art` only sets width/height; the background image + sizing are applied inline below.

- [ ] **Step 1: Fill the art polygon with the cover.** In `src/components/TrackCard.jsx`, replace:
```jsx
          <div
            className="track-card__art"
            style={{ background: color, clipPath: clip }}
          />
```
with:
```jsx
          <div
            className="track-card__art"
            style={track.cover
              ? { backgroundImage: `url(${track.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', clipPath: clip }
              : { background: color, clipPath: clip }}
          />
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**
```bash
git add src/components/TrackCard.jsx
git commit -m "feat: show real album cover in the track-card art shape"
```

---

## Task 9: `Saved.jsx` + `Saved.css` — visible delete button

**Files:**
- Modify: `src/pages/Saved.jsx`, `src/pages/Saved.css`

- [ ] **Step 1: Add a visible delete control in `PlaylistRow`.** In `src/pages/Saved.jsx`, replace:
```jsx
        <div className="pl-row__info">
          <p className="pl-row__name">{playlist.name}</p>
          <span className="pl-row__meta">{formatDate(playlist.createdAt)} · {playlist.tracks?.length ?? 0} tracks</span>
        </div>
        <span className="pl-row__chevron">{expanded ? '▲' : '▼'}</span>
```
with:
```jsx
        <div className="pl-row__info">
          <p className="pl-row__name">{playlist.name}</p>
          <span className="pl-row__meta">{formatDate(playlist.createdAt)} · {playlist.tracks?.length ?? 0} tracks</span>
        </div>
        <button
          className="pl-row__delete-x"
          onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
          aria-label="Delete mix"
        >✕</button>
        <span className="pl-row__chevron">{expanded ? '▲' : '▼'}</span>
```

- [ ] **Step 2: Style the control.** Append to `src/pages/Saved.css`:
```css
.pl-row__delete-x {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 16px;
  line-height: 1;
  padding: 4px 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.pl-row__delete-x:active { color: var(--coral); }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**
```bash
git add src/pages/Saved.jsx src/pages/Saved.css
git commit -m "feat: visible delete button for saved mixes"
```

---

## Final verification

- [ ] `npm test` → all suites pass (`greeting`, `music/moodQuery`, `music/deezer`, `generatePlaylist`).
- [ ] `npm run build` → succeeds.
- [ ] `npm run lint` → no new errors in touched files.
- [ ] Manual (`npm run dev`, log in with Google):
  - Home shows a casual greeting with your first name (guest → "stranger"); no top header, no daily-mood section.
  - **DIAL** tab: drag the point, generate → tracks reflect the dialed mood (not the same every time).
  - **Mix Your Favourites** (with some saved playlists): returns artist-driven results.
  - Track cards show **real album covers** in the fragmented shape; stub/cover-less tracks fall back to the flat color.
  - **Saved**: each mix has a visible ✕ → DELETE/CANCEL → the mix disappears from the list.

---

## Notes / out of scope (pre-existing follow-ups)
- VibeLeaderboard "TRENDING NOW" uses hardcoded data.
- MoodTimeline is always empty (`moodHistory` is never written).
- Pins are keyed by track name (same-name edge case).
