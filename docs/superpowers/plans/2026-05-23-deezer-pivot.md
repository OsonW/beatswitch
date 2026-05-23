# Deezer Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Spotify music layer (which now requires developer Premium) with Deezer's free no-auth API for mood→tracks, add real 30s preview playback, and revert auth/save/identity to Firebase.

**Architecture:** Fully client-side. Deezer search runs in the browser via **JSONP** (Deezer's JSON API has no CORS). No env vars, no OAuth. Firebase (Google sign-in + Firestore) is restored for login, save, and Profile identity. The Spotify modules are removed once all consumers are migrated.

**Tech Stack:** React 19, Vite, React Router, Firebase Auth + Firestore, Deezer API (JSONP), Vitest.

**Spec:** `docs/superpowers/specs/2026-05-23-deezer-pivot-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/music/moodQuery.js` (+test) | Create (move + simplify) | Pure mood → plain keyword queries |
| `src/music/deezer.js` (+test) | Create | Anonymous Deezer search via JSONP |
| `src/utils/generatePlaylist.js` (+test) | Rewrite | Async: Deezer tracks, stub fallback |
| `src/pages/Results.jsx` | Modify | Drop Spotify; Firestore-only save; real audio previews |
| `src/pages/Profile.jsx` | Modify | Identity from Firebase (name + `photoURL`) |
| `src/pages/Login.jsx` + `Login.css` | Modify | Revert button to Google sign-in |
| `src/App.jsx` | Modify | Remove `/callback` route + provider |
| `src/spotify/*`, `src/context/SpotifyContext.jsx`, `src/pages/Callback.jsx` | Delete | Remove Spotify code |
| `.env.example`, `vite.config.js` | Modify/Delete | Remove Spotify-only tooling |

**Ordering is dependency-safe:** new modules first, then migrate each consumer off Spotify, then delete the now-unused Spotify files last. The build stays green after every task.

`src/components/TrackCard.jsx` needs **no change** — it only calls `onPreview(index)`; Results owns the `<audio>` element and reads `tracks[index].previewUrl`.

---

## Task 1: `src/music/moodQuery.js` — simplified, plain-keyword queries

**Files:**
- Create: `src/music/moodQuery.js`
- Test: `src/music/moodQuery.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/music/moodQuery.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { moodQuery } from './moodQuery'

describe('moodQuery', () => {
  it('uses free text directly in describe mode', () => {
    expect(moodQuery({ mood: 'rainy sunday' })).toEqual(['rainy sunday'])
  })

  it('maps each vibe to a plain keyword phrase in blend mode (no genre: syntax)', () => {
    const q = moodQuery({ vibes: [{ name: 'HYPE', weight: 50 }, { name: 'FOCUS', weight: 50 }] })
    expect(q).toHaveLength(2)
    expect(q.join(' ')).not.toContain('genre:')
  })

  it('maps high energy + valence to upbeat keywords in dial mode', () => {
    expect(moodQuery({ energy: 90, valence: 90 })[0]).toMatch(/upbeat|high energy|happy/)
  })

  it('maps low energy + valence to chill/moody keywords', () => {
    expect(moodQuery({ energy: 10, valence: 10 })[0]).toMatch(/chill|moody|sad/)
  })

  it('falls back to a default query when nothing matches', () => {
    expect(moodQuery({})).toEqual(['top hits'])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/music/moodQuery.test.js`
Expected: FAIL — cannot resolve `./moodQuery`.

- [ ] **Step 3: Implement `src/music/moodQuery.js`**

```js
// src/music/moodQuery.js
// Pure: turn mood inputs into plain-keyword search queries for Deezer.

const VIBE_QUERY = {
  HYPE:         'hip hop hype',
  MELANCHOLIC:  'melancholy indie',
  FOCUS:        'instrumental focus',
  'LATE NIGHT': 'late night r&b',
  HEARTBREAK:   'heartbreak pop',
  'ROAD TRIP':  'road trip rock',
}

function dialQuery(energy, valence) {
  const e = energy > 66 ? 'high energy' : energy < 33 ? 'chill' : 'mid tempo'
  const v = valence > 66 ? 'upbeat happy' : valence < 33 ? 'moody sad' : 'mellow'
  return `${e} ${v}`
}

export function moodQuery(params = {}) {
  const { mood, vibes, energy, valence } = params
  const queries = []

  if (Array.isArray(vibes) && vibes.length) {
    for (const v of vibes) {
      const q = VIBE_QUERY[v.name?.toUpperCase()]
      if (q) queries.push(q)
    }
  } else if (typeof energy === 'number' && typeof valence === 'number') {
    queries.push(dialQuery(energy, valence))
  } else if (mood && mood.trim()) {
    queries.push(mood.trim())
  }

  if (!queries.length) queries.push('top hits')
  return queries
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/music/moodQuery.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/music/moodQuery.js src/music/moodQuery.test.js
git commit -m "feat: add plain-keyword moodQuery for Deezer in src/music"
```

---

## Task 2: `src/music/deezer.js` — anonymous search via JSONP

**Files:**
- Create: `src/music/deezer.js`
- Test: `src/music/deezer.test.js`

> Only the pure `buildSearchUrl` is unit-tested. `searchTracks` performs real DOM script injection + network and is verified manually.

- [ ] **Step 1: Write the failing tests**

Create `src/music/deezer.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { buildSearchUrl } from './deezer'

describe('buildSearchUrl', () => {
  it('targets the Deezer search endpoint with jsonp output and callback', () => {
    const url = buildSearchUrl('chill', 10, 'cb1')
    expect(url).toContain('https://api.deezer.com/search')
    expect(url).toContain('output=jsonp')
    expect(url).toContain('callback=cb1')
    expect(url).toContain('limit=10')
  })

  it('url-encodes the query', () => {
    expect(buildSearchUrl('high energy upbeat', 5, 'cb')).toContain('q=high+energy+upbeat')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/music/deezer.test.js`
Expected: FAIL — cannot resolve `./deezer`.

- [ ] **Step 3: Implement `src/music/deezer.js`**

```js
// src/music/deezer.js
// Anonymous Deezer search. Deezer's REST API has no CORS for browsers,
// so we use JSONP (its supported `output=jsonp&callback=` mode).

const SEARCH_ENDPOINT = 'https://api.deezer.com/search'
const TIMEOUT_MS = 8000

export function buildSearchUrl(query, limit = 10, callbackName = 'cb') {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    output: 'jsonp',
    callback: callbackName,
  })
  return `${SEARCH_ENDPOINT}?${params.toString()}`
}

export function searchTracks(query, limit = 10) {
  return new Promise((resolve, reject) => {
    const callbackName = `__deezerCb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
    const script = document.createElement('script')
    let timer

    function cleanup() {
      clearTimeout(timer)
      delete window[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    window[callbackName] = (payload) => {
      cleanup()
      resolve(payload?.data ?? [])
    }

    script.onerror = () => { cleanup(); reject(new Error('Deezer request failed')) }
    timer = setTimeout(() => { cleanup(); reject(new Error('Deezer request timed out')) }, TIMEOUT_MS)

    script.src = buildSearchUrl(query, limit, callbackName)
    document.head.appendChild(script)
  })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/music/deezer.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/music/deezer.js src/music/deezer.test.js
git commit -m "feat: add Deezer JSONP search client"
```

---

## Task 3: Rewrite `src/utils/generatePlaylist.js` for Deezer

**Files:**
- Modify (full replacement): `src/utils/generatePlaylist.js`
- Test (full replacement): `src/utils/generatePlaylist.test.js`

- [ ] **Step 1: Replace the test file** with `src/utils/generatePlaylist.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../music/deezer', () => ({ searchTracks: vi.fn() }))

import { searchTracks } from '../music/deezer'
import { generatePlaylist } from './generatePlaylist'

beforeEach(() => vi.clearAllMocks())

describe('generatePlaylist', () => {
  it('maps Deezer results to the app track shape', async () => {
    searchTracks.mockResolvedValue([
      { id: 1, title: 'Song', duration: 200, preview: 'http://p/1.mp3', artist: { name: 'Artist' } },
    ])
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks[0]).toMatchObject({ name: 'Song', artist: 'Artist', previewUrl: 'http://p/1.mp3' })
    expect(tracks[0].duration).toBe('3:20')
  })

  it('dedupes by track id', async () => {
    searchTracks.mockResolvedValue([
      { id: 1, title: 'A', duration: 60, preview: 'x', artist: { name: 'Z' } },
      { id: 1, title: 'A', duration: 60, preview: 'x', artist: { name: 'Z' } },
    ])
    expect(await generatePlaylist({ mood: 'x' })).toHaveLength(1)
  })

  it('falls back to stub tracks when search yields nothing', async () => {
    searchTracks.mockResolvedValue([])
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks[0]).toHaveProperty('name')
  })

  it('falls back to stub when search throws', async () => {
    searchTracks.mockRejectedValue(new Error('network'))
    expect((await generatePlaylist({ mood: 'chill' })).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/utils/generatePlaylist.test.js`
Expected: FAIL — the current file imports `../spotify/*`; the new test mocks `../music/deezer`, and the mapping/`previewUrl` expectations don't match the Spotify implementation.

- [ ] **Step 3: Replace `src/utils/generatePlaylist.js`** entirely with:
```js
// src/utils/generatePlaylist.js
import { searchTracks } from '../music/deezer'
import { moodQuery } from '../music/moodQuery'

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

function stub() {
  return [...STUB_TRACKS].sort(() => Math.random() - 0.5).slice(0, 8)
}

function secToDuration(sec) {
  const total = Math.round(sec ?? 0)
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function mapTrack(t) {
  return {
    id: t.id,
    name: t.title,
    artist: t.artist?.name ?? 'Unknown',
    duration: secToDuration(t.duration),
    previewUrl: t.preview ?? null,
  }
}

export async function generatePlaylist(params = {}) {
  const queries = moodQuery(params)
  const seen = new Set()
  const collected = []
  for (const q of queries) {
    try {
      const items = await searchTracks(q, 10)
      for (const t of items ?? []) {
        if (t?.id && !seen.has(t.id)) { seen.add(t.id); collected.push(mapTrack(t)) }
      }
    } catch { /* skip a failed query, keep others */ }
  }
  if (!collected.length) return stub()
  return collected.sort(() => Math.random() - 0.5).slice(0, 10)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/utils/generatePlaylist.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: PASS (music/moodQuery, music/deezer, generatePlaylist, plus the still-present spotify tests).

- [ ] **Step 6: Commit**

```bash
git add src/utils/generatePlaylist.js src/utils/generatePlaylist.test.js
git commit -m "feat: rewrite generatePlaylist to use Deezer"
```

---

## Task 4: Update `src/pages/Results.jsx` — drop Spotify, Firestore-only save, real previews

**Files:**
- Modify: `src/pages/Results.jsx`

- [ ] **Step 1: Remove the Spotify imports**

Delete these two lines:
```jsx
import { useSpotify } from '../context/SpotifyContext'
import { createPlaylist, addTracks } from '../spotify/client'
```

- [ ] **Step 2: Remove the Spotify context destructure**

Replace:
```jsx
  const { connected, spotifyUser } = useSpotify()
  const moodParams = {
```
with:
```jsx
  const moodParams = {
```

- [ ] **Step 3: Add an audio ref**

Replace:
```jsx
  const previewTimerRef = useRef(null)
```
with:
```jsx
  const previewTimerRef = useRef(null)
  const audioRef = useRef(null)
```

- [ ] **Step 4: Stop audio on unmount**

Replace:
```jsx
  useEffect(() => () => clearTimeout(previewTimerRef.current), [])
```
with:
```jsx
  useEffect(() => () => {
    clearTimeout(previewTimerRef.current)
    if (audioRef.current) audioRef.current.pause()
  }, [])
```

- [ ] **Step 5: Update the generation effect comment**

Replace:
```jsx
  // Generate the playlist on mount (async — Spotify search or stub fallback).
```
with:
```jsx
  // Generate the playlist on mount (async — Deezer search or stub fallback).
```

- [ ] **Step 6: Make `handlePreview` play real audio**

Replace the whole `handlePreview`:
```jsx
  const handlePreview = useCallback((index) => {
    clearTimeout(previewTimerRef.current)
    if (previewIndex === index) { setPreviewIndex(null); return }
    setPreviewIndex(index)
    previewTimerRef.current = setTimeout(() => setPreviewIndex(null), PREVIEW_DURATION)
  }, [previewIndex])
```
with:
```jsx
  const handlePreview = useCallback((index) => {
    clearTimeout(previewTimerRef.current)
    const audio = audioRef.current
    if (previewIndex === index) {
      setPreviewIndex(null)
      if (audio) audio.pause()
      return
    }
    setPreviewIndex(index)
    const url = tracks[index]?.previewUrl
    if (audio && url) {
      audio.src = url
      audio.currentTime = 0
      audio.play().catch(() => {})   // ignore autoplay-policy rejections
    }
    previewTimerRef.current = setTimeout(() => {
      setPreviewIndex(null)
      if (audioRef.current) audioRef.current.pause()
    }, PREVIEW_DURATION)
  }, [previewIndex, tracks])
```

- [ ] **Step 7: Revert `handleSave` to Firestore-only**

Replace the whole `handleSave`:
```jsx
  const handleSave = async () => {
    if (!user?.uid || saved) return
    setSaved(true)

    let spotify = {}
    let spotifyFailed = false
    try {
      if (connected && spotifyUser?.id && tracks.some(t => t.uri)) {
        const playlist = await createPlaylist(spotifyUser.id, `${mood.toUpperCase()} MIX`, 'Generated by Beatswitch')
        await addTracks(playlist.id, tracks.filter(t => t.uri).map(t => t.uri))
        spotify = {
          spotifyPlaylistId: playlist.id,
          spotifyUrl: playlist.external_urls?.spotify ?? null,
        }
      }
    } catch (err) {
      console.error('Spotify save failed:', err)
      spotifyFailed = true
      setToastMsg('SPOTIFY SAVE FAILED')
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'playlists'), {
        name: `${mood.toUpperCase()} MIX`,
        mood,
        createdAt: serverTimestamp(),
        tracks,
        ...spotify,
      })
      // Confirm the save; keep the Spotify-failure toast visible if that step failed.
      if (spotify.spotifyUrl) setToastMsg('SAVED TO SPOTIFY')
      else if (!spotifyFailed) setToastMsg('SAVED')
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }
```
with:
```jsx
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
      setToastMsg('SAVED')
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }
```

- [ ] **Step 8: Render the audio element**

Replace:
```jsx
      <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
```
with:
```jsx
      <audio ref={audioRef} onEnded={() => setPreviewIndex(null)} />

      <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
```

- [ ] **Step 9: Verify build + tests + lint**

Run: `npm run build && npm test`
Expected: build succeeds; all tests pass.
Run: `npm run lint 2>&1` and confirm NO errors in `Results.jsx` (the `useSpotify`/`createPlaylist`/`addTracks`/`connected`/`spotifyUser` references must all be gone).

- [ ] **Step 10: Commit**

```bash
git add src/pages/Results.jsx
git commit -m "feat: Firestore-only save and real 30s audio previews in Results"
```

---

## Task 5: Update `src/pages/Profile.jsx` — identity from Firebase

**Files:**
- Modify: `src/pages/Profile.jsx`

- [ ] **Step 1: Remove the Spotify context import**

Delete this line:
```jsx
import { useSpotify } from '../context/SpotifyContext'
```

- [ ] **Step 2: Source name + avatar from Firebase**

Replace:
```jsx
  const { spotifyUser } = useSpotify()
  const displayName = spotifyUser?.display_name ?? user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const avatarUrl   = spotifyUser?.images?.[0]?.url ?? null
  const initial     = displayName[0]?.toUpperCase() ?? '?'
```
with:
```jsx
  const displayName = user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const avatarUrl   = user?.photoURL ?? null
  const initial     = displayName[0]?.toUpperCase() ?? '?'
```

> The avatar-clipped-into-blob `<svg>` block is unchanged — it already reads `avatarUrl`, now sourced from the Google `photoURL`.

- [ ] **Step 3: Verify build + lint**

Run: `npm run build`
Expected: build succeeds.
Run: `npm run lint 2>&1` and confirm no errors in `Profile.jsx` (no `useSpotify` reference remains).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.jsx
git commit -m "feat: source Profile name and avatar from Firebase"
```

---

## Task 6: Update `src/pages/Login.jsx` + `Login.css` — revert to Google sign-in

**Files:**
- Modify: `src/pages/Login.jsx`
- Modify: `src/pages/Login.css`

- [ ] **Step 1: Fix imports**

Replace:
```jsx
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import { beginLogin } from '../spotify/auth'
```
with:
```jsx
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
```

- [ ] **Step 2: Replace `handleSpotify` with `handleGoogle`**

Replace:
```jsx
  const handleSpotify = async () => {
    setLoading('spotify')
    setError(null)
    try {
      await beginLogin()   // redirects away to Spotify
    } catch {
      setError('Could not start Spotify sign in. Please try again.')
      setLoading(null)
    }
  }
```
with:
```jsx
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
```

- [ ] **Step 3: Update the button**

Replace:
```jsx
        <button
          className="login__btn login__btn--spotify ripple-host"
          onClick={handleSpotify}
          disabled={loading !== null}
        >
          {loading === 'spotify' ? '···' : 'CONTINUE WITH SPOTIFY'}
        </button>
```
with:
```jsx
        <button
          className="login__btn login__btn--google ripple-host"
          onClick={handleGoogle}
          disabled={loading !== null}
        >
          {loading === 'google' ? '···' : 'CONTINUE WITH GOOGLE'}
        </button>
```

- [ ] **Step 4: Rename the CSS selector**

In `src/pages/Login.css`, replace:
```css
.login__btn--spotify {
  background: var(--coral);
  color: #000;
}
```
with:
```css
.login__btn--google {
  background: var(--coral);
  color: #000;
}
```

- [ ] **Step 5: Verify build + lint**

Run: `npm run build`
Expected: build succeeds (no unused-import error for `beginLogin`).
Run: `npm run lint 2>&1` and confirm no new errors in `Login.jsx`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Login.jsx src/pages/Login.css
git commit -m "feat: revert login button to Google sign-in"
```

---

## Task 7: Update `src/App.jsx` — remove `/callback` route + provider

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Remove the Spotify imports**

Delete these two lines:
```jsx
import Callback from './pages/Callback'
import { SpotifyProvider } from './context/SpotifyContext'
```

- [ ] **Step 2: Restore the original router block**

Replace:
```jsx
  return (
    <BrowserRouter>
      <SpotifyProvider>
        <Routes>
          <Route path="/login"    element={<AuthRoute user={user}><Login /></AuthRoute>} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/home"     element={<ProtectedRoute user={user}><Home user={user} /></ProtectedRoute>} />
          <Route path="/results"  element={<ProtectedRoute user={user}><Results user={user} /></ProtectedRoute>} />
          <Route path="/saved"    element={<ProtectedRoute user={user}><Saved user={user} /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
          <Route path="*"         element={<Navigate to={user ? '/home' : '/login'} replace />} />
        </Routes>
      </SpotifyProvider>
    </BrowserRouter>
  )
```
with:
```jsx
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove /callback route and Spotify provider"
```

---

## Task 8: Delete the now-unused Spotify files

**Files:**
- Delete: `src/spotify/auth.js`, `src/spotify/auth.test.js`, `src/spotify/client.js`, `src/spotify/client.test.js`, `src/spotify/moodQuery.js`, `src/spotify/moodQuery.test.js`, `src/context/SpotifyContext.jsx`, `src/pages/Callback.jsx`

- [ ] **Step 1: Confirm nothing imports Spotify anymore**

Run: `git grep -nE "\.\./spotify|context/SpotifyContext|pages/Callback" -- src`
Expected: the only matches are *inside the files about to be deleted* (e.g. `client.js` ↔ `auth.js` referencing each other, `SpotifyContext.jsx` importing `../spotify/*`, `Callback.jsx` importing `../spotify/auth`). No match in `App.jsx`, `Login.jsx`, `Profile.jsx`, `Results.jsx`, or `generatePlaylist.js`.

- [ ] **Step 2: Delete the files**

```bash
git rm src/spotify/auth.js src/spotify/auth.test.js src/spotify/client.js src/spotify/client.test.js src/spotify/moodQuery.js src/spotify/moodQuery.test.js src/context/SpotifyContext.jsx src/pages/Callback.jsx
```

- [ ] **Step 3: Verify build + full test suite**

Run: `npm run build && npm test`
Expected: build succeeds; tests pass (now: `music/moodQuery`, `music/deezer`, `generatePlaylist` — the Spotify test files are gone).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove Spotify modules after Deezer pivot"
```

---

## Task 9: Tooling cleanup

**Files:**
- Delete: `.env.example`
- Modify: `vite.config.js`

- [ ] **Step 1: Delete `.env.example`**

```bash
git rm .env.example
```
(No env vars are needed anymore — Deezer is anonymous; Firebase config still comes from the developer's existing `.env` `VITE_FIREBASE_*` values, which are unaffected.)

- [ ] **Step 2: Remove the dev-host override in `vite.config.js`**

Replace the file contents with:
```js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
})
```

- [ ] **Step 3: Verify build + tests**

Run: `npm run build && npm test`
Expected: build succeeds; tests pass.

- [ ] **Step 4: Commit**

```bash
git add vite.config.js
git commit -m "chore: drop Spotify-only env template and dev-host override"
```

---

## Final verification

- [ ] `npm test` → all suites pass (`music/moodQuery`, `music/deezer`, `generatePlaylist`).
- [ ] `npm run build` → succeeds.
- [ ] `npm run lint` → no new errors in changed files (`src/spotify` is gone).
- [ ] Manual (dev server, `npm run dev`):
  - Log in with **Google** (and guest).
  - Generate a playlist (DESCRIBE / BLEND / DIAL) → **real Deezer tracks** appear.
  - Tap a track's art → **30s preview audio plays**; tap again or wait 30s → stops; tapping another switches.
  - **SAVE** → `SAVED` toast; the playlist appears in the Saved page (Firestore).
  - **Profile** → Google display name + photo (clipped into the blob); guest → initial fallback.

---

## Notes / known limitations (unchanged from before, still out of scope)

- **DIAL tab isn't wired** to `useMoodDial` (`Home.jsx`) — it still sends the default energy/valence. Pre-existing; a separate follow-up.
- **Pins keyed by track name** — same-name edge case remains.
- **JSONP trust:** `searchTracks` executes a script from `api.deezer.com`. Accepted for a client-only personal app.
- **No real album covers** — track art stays the flat generated SVG by design.
