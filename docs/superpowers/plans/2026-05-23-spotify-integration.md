# Spotify Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Beatswitch a real Spotify app — Spotify OAuth login, real catalog tracks driven by mood, save-to-Spotify, and a real Spotify identity on the Profile page — all fully client-side.

**Architecture:** Spotify Authorization Code + PKCE runs entirely in the browser (no secret, no server). Firebase anonymous auth is layered underneath so existing Firestore code + security rules keep working unchanged. The mood engine uses the Search API (the `/recommendations` + audio-features endpoints are deprecated for new apps), seeded with the user's top artists for personalization.

**Tech Stack:** React 19, Vite, React Router, Firebase Auth + Firestore, Spotify Web API, Vitest (new) + jsdom.

**Spec:** `docs/superpowers/specs/2026-05-23-spotify-integration-design.md`

---

## File Structure

| File | Responsibility | New/Modify |
|------|----------------|------------|
| `.env.example` | Document required env vars | New |
| `vite.config.js` | Add Vitest config + bind dev server to `127.0.0.1` | Modify |
| `package.json` | Add `test` scripts + dev deps | Modify |
| `src/spotify/auth.js` | PKCE login, token storage, refresh, expiry | New |
| `src/spotify/client.js` | Authed fetch wrapper + Web API helpers | New |
| `src/spotify/moodQuery.js` | Pure: mood params → Search queries | New |
| `src/utils/generatePlaylist.js` | Async generation: Spotify path + guest stub fallback | Modify |
| `src/context/SpotifyContext.jsx` | Provide `{ connected, spotifyUser, ready }` | New |
| `src/pages/Callback.jsx` | Handle OAuth redirect, then Firebase anon sign-in | New |
| `src/App.jsx` | `/callback` route + wrap tree in provider | Modify |
| `src/pages/Login.jsx` | Rewire Spotify button to real OAuth | Modify |
| `src/pages/Results.jsx` | Async generation + loading + Spotify save | Modify |
| `src/pages/Profile.jsx` | Real Spotify name + avatar | Modify |

---

## Task 0: Manual Spotify Dashboard setup (developer — do this first)

> Not code. Nothing works end-to-end until this is done. Do it before Task 8 (Login) onward; Tasks 1–7 can be built and unit-tested without it.

- [ ] **Step 1: Create the app**

Go to https://developer.spotify.com/dashboard → **Create app**. Name it anything. App type: Web API. Copy the **Client ID** (you do NOT need the client secret for PKCE).

- [ ] **Step 2: Register redirect URIs**

In the app's **Settings → Redirect URIs**, add both:
```
http://127.0.0.1:5173/callback
https://<your-prod-domain>/callback
```
Spotify requires the loopback literal `127.0.0.1` (NOT `localhost`), and HTTPS for any non-loopback URL.

- [ ] **Step 3: Allowlist your account**

The app starts in **Development Mode** (max 25 users). Under **Settings → User Management**, add the Spotify account email(s) that will log in — including your own. Non-allowlisted accounts get `403`.

- [ ] **Step 4: Confirm**

You should now have a Client ID and at least one allowlisted user. You'll paste the Client ID into `.env` in Task 1.

---

## Task 1: Tooling — Vitest, env, dev-server host

**Files:**
- Create: `.env.example`
- Modify: `vite.config.js`
- Modify: `package.json`
- Modify: `.gitignore` (ensure `.env` is ignored)

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D vitest jsdom
```
Expected: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Update `vite.config.js`**

Replace the file contents with:
```js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173 },
  test: { environment: 'jsdom' },
})
```

- [ ] **Step 4: Create `.env.example`**

```
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

- [ ] **Step 5: Create your real `.env`** (developer)

Copy `.env.example` to `.env` and paste the Client ID from Task 0. Ensure `.env` is listed in `.gitignore` (add the line `.env` if missing). Do NOT commit `.env`.

- [ ] **Step 6: Verify the test runner installs**

Run:
```bash
npx vitest --version
```
Expected: prints a version number (e.g. `vitest/3.x`).

- [ ] **Step 7: Commit**

```bash
git add .env.example vite.config.js package.json package-lock.json .gitignore
git commit -m "chore: add Vitest, env template, and 127.0.0.1 dev host for Spotify"
```

---

## Task 2: `moodQuery` — pure mood → Search queries

**Files:**
- Create: `src/spotify/moodQuery.js`
- Test: `src/spotify/moodQuery.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/spotify/moodQuery.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { moodQuery } from './moodQuery'

describe('moodQuery', () => {
  it('uses free text directly in describe mode', () => {
    expect(moodQuery({ mood: 'rainy sunday' })).toEqual(['rainy sunday'])
  })

  it('builds one genre query per selected vibe in blend mode', () => {
    const q = moodQuery({ vibes: [{ name: 'HYPE', weight: 50 }, { name: 'FOCUS', weight: 50 }] })
    expect(q).toHaveLength(2)
    expect(q[0]).toContain('genre:')
  })

  it('maps high energy + high valence to upbeat keywords in dial mode', () => {
    const q = moodQuery({ energy: 90, valence: 90 })
    expect(q[0]).toMatch(/upbeat|high energy|happy/)
  })

  it('maps low energy + low valence to chill/moody keywords in dial mode', () => {
    const q = moodQuery({ energy: 10, valence: 10 })
    expect(q[0]).toMatch(/chill|moody|sad/)
  })

  it('falls back to a default query when nothing matches', () => {
    expect(moodQuery({})).toEqual(['genre:pop'])
  })

  it('appends a seed genre when one is provided', () => {
    expect(moodQuery({ mood: 'chill' }, { genres: ['lo-fi'] })[0]).toContain('lo-fi')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
npx vitest run src/spotify/moodQuery.test.js
```
Expected: FAIL — `Failed to resolve import "./moodQuery"` / `moodQuery is not a function`.

- [ ] **Step 3: Implement `moodQuery`**

Create `src/spotify/moodQuery.js`:
```js
// src/spotify/moodQuery.js
// Pure: turn mood inputs into Spotify Search query strings.
// No deprecated endpoints — Search API only.

const VIBE_QUERY = {
  HYPE:         { genre: 'hip-hop', keyword: 'hype' },
  MELANCHOLIC:  { genre: 'indie',   keyword: 'melancholy' },
  FOCUS:        { genre: 'ambient', keyword: 'instrumental' },
  'LATE NIGHT': { genre: 'r-n-b',   keyword: 'late night' },
  HEARTBREAK:   { genre: 'pop',     keyword: 'heartbreak' },
  'ROAD TRIP':  { genre: 'rock',    keyword: 'driving' },
}

function seedSuffix(seeds) {
  const seed = seeds?.genres?.[0]
  return seed ? ` genre:${seed}` : ''
}

function vibeQuery(name, seeds) {
  const entry = VIBE_QUERY[name?.toUpperCase()]
  if (!entry) return null
  return `genre:${entry.genre} ${entry.keyword}${seedSuffix(seeds)}`.trim()
}

function dialQuery(energy, valence, seeds) {
  const e = energy > 66 ? 'high energy' : energy < 33 ? 'chill' : 'mid tempo'
  const v = valence > 66 ? 'upbeat happy' : valence < 33 ? 'moody sad' : 'mellow'
  return `${e} ${v}${seedSuffix(seeds)}`.trim()
}

function textQuery(text, seeds) {
  return `${text}${seedSuffix(seeds)}`.trim()
}

export function moodQuery(params = {}, seeds = {}) {
  const { mood, vibes, energy, valence } = params
  const queries = []

  if (Array.isArray(vibes) && vibes.length) {
    for (const v of vibes) {
      const q = vibeQuery(v.name, seeds)
      if (q) queries.push(q)
    }
  } else if (typeof energy === 'number' && typeof valence === 'number') {
    queries.push(dialQuery(energy, valence, seeds))
  } else if (mood && mood.trim()) {
    queries.push(textQuery(mood.trim(), seeds))
  }

  if (!queries.length) queries.push('genre:pop')
  return queries
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
npx vitest run src/spotify/moodQuery.test.js
```
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/moodQuery.js src/spotify/moodQuery.test.js
git commit -m "feat: add moodQuery search-query builder with tests"
```

---

## Task 3: `auth.js` — PKCE login, token storage, expiry

**Files:**
- Create: `src/spotify/auth.js`
- Test: `src/spotify/auth.test.js`

- [ ] **Step 1: Write the failing tests** (pure, deterministic parts only)

Create `src/spotify/auth.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { isTokenExpired, saveTokens, getStoredTokens } from './auth'

describe('isTokenExpired', () => {
  it('is true when expiry is in the past', () => {
    expect(isTokenExpired(1000, 2000)).toBe(true)
  })
  it('is false when expiry is comfortably in the future', () => {
    expect(isTokenExpired(100000, 2000)).toBe(false)
  })
  it('treats the final 60s safety window as expired', () => {
    // 30s of life left (< 60s buffer)
    expect(isTokenExpired(1_030_000, 1_000_000)).toBe(true)
  })
})

describe('token storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips tokens and computes expires_at', () => {
    saveTokens({ access_token: 'a', refresh_token: 'r', expires_in: 3600 }, 1000)
    const t = getStoredTokens()
    expect(t.access_token).toBe('a')
    expect(t.refresh_token).toBe('r')
    expect(t.expires_at).toBe(1000 + 3600 * 1000)
  })

  it('preserves an existing refresh token when a refresh response omits it', () => {
    saveTokens({ access_token: 'a', refresh_token: 'r', expires_in: 3600 }, 1000)
    saveTokens({ access_token: 'a2', expires_in: 3600 }, 5000)
    expect(getStoredTokens().refresh_token).toBe('r')
    expect(getStoredTokens().access_token).toBe('a2')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
npx vitest run src/spotify/auth.test.js
```
Expected: FAIL — cannot resolve `./auth`.

- [ ] **Step 3: Implement `auth.js`**

Create `src/spotify/auth.js`:
```js
// src/spotify/auth.js
// Spotify Authorization Code + PKCE, fully client-side.

const CLIENT_ID    = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private'
const AUTH_URL  = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'

export const TOKEN_KEY  = 'beatswitch.spotify.tokens'
const VERIFIER_KEY      = 'beatswitch.spotify.verifier'
const EXPIRY_BUFFER_MS  = 60_000

// --- token storage / expiry (pure-ish, unit tested) ---

export function isTokenExpired(expiresAt, now = Date.now()) {
  return now >= expiresAt - EXPIRY_BUFFER_MS
}

export function getStoredTokens() {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveTokens(tokenResponse, now = Date.now()) {
  const existing = getStoredTokens()
  const tokens = {
    access_token:  tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token ?? existing?.refresh_token ?? null,
    expires_at:    now + tokenResponse.expires_in * 1000,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  return tokens
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

// --- PKCE helpers ---

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateCodeVerifier() {
  const arr = new Uint8Array(64)
  crypto.getRandomValues(arr)
  return base64url(arr)
}

export async function generateCodeChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64url(digest)
}

// --- flow ---

export async function beginLogin() {
  const verifier = generateCodeVerifier()
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const challenge = await generateCodeChallenge(verifier)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  })
  window.location.assign(`${AUTH_URL}?${params.toString()}`)
}

export async function handleCallback() {
  const code = new URLSearchParams(window.location.search).get('code')
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  if (!code || !verifier) throw new Error('Missing authorization code or verifier')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  saveTokens(await res.json())
  sessionStorage.removeItem(VERIFIER_KEY)
}

export async function refreshToken() {
  const tokens = getStoredTokens()
  if (!tokens?.refresh_token) throw new Error('No refresh token')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    }),
  })
  if (!res.ok) { logout(); throw new Error('Token refresh failed') }
  return saveTokens(await res.json()).access_token
}

export async function getValidToken() {
  const tokens = getStoredTokens()
  if (!tokens) throw new Error('Not authenticated with Spotify')
  if (isTokenExpired(tokens.expires_at)) return refreshToken()
  return tokens.access_token
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
npx vitest run src/spotify/auth.test.js
```
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/auth.js src/spotify/auth.test.js
git commit -m "feat: add Spotify PKCE auth with token storage and tests"
```

---

## Task 4: `client.js` — authed fetch wrapper + API helpers

**Files:**
- Create: `src/spotify/client.js`
- Test: `src/spotify/client.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/spotify/client.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./auth', () => ({
  getValidToken: vi.fn(),
  refreshToken: vi.fn(),
}))

import { getValidToken, refreshToken } from './auth'
import { spotifyFetch } from './client'

beforeEach(() => {
  vi.clearAllMocks()
  getValidToken.mockResolvedValue('tok')
})

describe('spotifyFetch', () => {
  it('returns parsed JSON on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ id: 'me' }),
    })
    await expect(spotifyFetch('/me')).resolves.toEqual({ id: 'me' })
    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('refreshes once and retries on 401', async () => {
    refreshToken.mockResolvedValueOnce('fresh')
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 'me' }) })
    await expect(spotifyFetch('/me')).resolves.toEqual({ id: 'me' })
    expect(refreshToken).toHaveBeenCalledOnce()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('throws a 403 error without retrying', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 403, json: async () => ({}), headers: { get: () => null },
    })
    await expect(spotifyFetch('/me')).rejects.toMatchObject({ status: 403 })
    expect(refreshToken).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
npx vitest run src/spotify/client.test.js
```
Expected: FAIL — cannot resolve `./client`.

- [ ] **Step 3: Implement `client.js`**

Create `src/spotify/client.js`:
```js
// src/spotify/client.js
import { getValidToken, refreshToken } from './auth'

const API = 'https://api.spotify.com/v1'

export class SpotifyError extends Error {
  constructor(message, status, retryAfter = null) {
    super(message)
    this.name = 'SpotifyError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

export async function spotifyFetch(path, opts = {}, _retried = false) {
  const token = await getValidToken()
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  })

  if (res.status === 401 && !_retried) {
    await refreshToken()
    return spotifyFetch(path, opts, true)
  }
  if (res.status === 403) throw new SpotifyError('Spotify account not allowlisted for this app', 403)
  if (res.status === 429) throw new SpotifyError('Rate limited by Spotify', 429, res.headers.get('Retry-After'))
  if (!res.ok) throw new SpotifyError(`Spotify request failed (${res.status})`, res.status)
  if (res.status === 204) return null
  return res.json()
}

// --- API helpers ---
export const getMe         = () => spotifyFetch('/me')
export const getTopArtists = (limit = 5) => spotifyFetch(`/me/top/artists?limit=${limit}`)
export const searchTracks  = (q, limit = 10) =>
  spotifyFetch(`/search?type=track&limit=${limit}&q=${encodeURIComponent(q)}`)
export const createPlaylist = (userId, name, description = '') =>
  spotifyFetch(`/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name, description, public: false }),
  })
export const addTracks = (playlistId, uris) =>
  spotifyFetch(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ uris }),
  })
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
npx vitest run src/spotify/client.test.js
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/spotify/client.js src/spotify/client.test.js
git commit -m "feat: add Spotify API client with 401-retry and helpers"
```

---

## Task 5: `generatePlaylist` — async Spotify path + guest fallback

**Files:**
- Modify: `src/utils/generatePlaylist.js`
- Test: `src/utils/generatePlaylist.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/generatePlaylist.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../spotify/auth', () => ({ getStoredTokens: vi.fn() }))
vi.mock('../spotify/client', () => ({ getTopArtists: vi.fn(), searchTracks: vi.fn() }))

import { getStoredTokens } from '../spotify/auth'
import { getTopArtists, searchTracks } from '../spotify/client'
import { generatePlaylist } from './generatePlaylist'

beforeEach(() => vi.clearAllMocks())

describe('generatePlaylist', () => {
  it('returns stub tracks when not connected to Spotify', async () => {
    getStoredTokens.mockReturnValue(null)
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks[0]).toHaveProperty('name')
    expect(searchTracks).not.toHaveBeenCalled()
  })

  it('maps Spotify search results when connected', async () => {
    getStoredTokens.mockReturnValue({ access_token: 'a' })
    getTopArtists.mockResolvedValue({ items: [{ genres: ['lo-fi'] }] })
    searchTracks.mockResolvedValue({ tracks: { items: [
      { id: '1', uri: 'spotify:track:1', name: 'Song', duration_ms: 200000, artists: [{ name: 'Artist' }] },
    ] } })
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks[0]).toMatchObject({ name: 'Song', artist: 'Artist', uri: 'spotify:track:1' })
    expect(tracks[0].duration).toBe('3:20')
  })

  it('falls back to stub when search yields nothing', async () => {
    getStoredTokens.mockReturnValue({ access_token: 'a' })
    getTopArtists.mockResolvedValue({ items: [] })
    searchTracks.mockResolvedValue({ tracks: { items: [] } })
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks[0]).toHaveProperty('artist')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
npx vitest run src/utils/generatePlaylist.test.js
```
Expected: FAIL — current `generatePlaylist` is sync and ignores Spotify; the connected-mapping test fails.

- [ ] **Step 3: Replace `src/utils/generatePlaylist.js`**

```js
// src/utils/generatePlaylist.js
import { getStoredTokens } from '../spotify/auth'
import { getTopArtists, searchTracks } from '../spotify/client'
import { moodQuery } from '../spotify/moodQuery'

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

function msToDuration(ms) {
  const total = Math.round((ms ?? 0) / 1000)
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function mapTrack(t) {
  return {
    id: t.id,
    uri: t.uri,
    name: t.name,
    artist: t.artists?.map(a => a.name).join(', ') ?? 'Unknown',
    duration: msToDuration(t.duration_ms),
  }
}

export async function generatePlaylist(params = {}) {
  // Guests (no Spotify token) get the local stub.
  if (!getStoredTokens()) return stub()

  // Personalization seeds from the user's top artists (optional).
  let seeds = {}
  try {
    const top = await getTopArtists(5)
    seeds = { genres: [...new Set((top.items ?? []).flatMap(a => a.genres ?? []))].slice(0, 3) }
  } catch { /* personalization is best-effort */ }

  const queries = moodQuery(params, seeds)
  const seen = new Set()
  const collected = []
  for (const q of queries) {
    try {
      const res = await searchTracks(q, 10)
      for (const t of res?.tracks?.items ?? []) {
        if (t?.id && !seen.has(t.id)) { seen.add(t.id); collected.push(mapTrack(t)) }
      }
    } catch { /* skip a failed query, keep others */ }
  }

  if (!collected.length) return stub()
  return collected.sort(() => Math.random() - 0.5).slice(0, 10)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
npx vitest run src/utils/generatePlaylist.test.js
```
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite to confirm nothing broke**

Run:
```bash
npm test
```
Expected: PASS (all files: moodQuery, auth, client, generatePlaylist).

- [ ] **Step 6: Commit**

```bash
git add src/utils/generatePlaylist.js src/utils/generatePlaylist.test.js
git commit -m "feat: make generatePlaylist async with Spotify search + guest fallback"
```

---

## Task 6: `SpotifyContext` — connection + profile provider

**Files:**
- Create: `src/context/SpotifyContext.jsx`

> No unit test — this is a thin React provider over already-tested modules; verified via the app in Task 10.

- [ ] **Step 1: Create `src/context/SpotifyContext.jsx`**

```jsx
// src/context/SpotifyContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { getStoredTokens } from '../spotify/auth'
import { getMe } from '../spotify/client'

const SpotifyContext = createContext({ connected: false, spotifyUser: null, ready: false })

export const useSpotify = () => useContext(SpotifyContext)

export function SpotifyProvider({ children }) {
  const [spotifyUser, setSpotifyUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (!getStoredTokens()) { setReady(true); return }
      try {
        const me = await getMe()
        if (active) setSpotifyUser(me)
      } catch { /* invalid/expired token → stays disconnected */ }
      if (active) setReady(true)
    }
    load()
    return () => { active = false }
  }, [])

  return (
    <SpotifyContext.Provider value={{ connected: !!spotifyUser, spotifyUser, ready }}>
      {children}
    </SpotifyContext.Provider>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run build
```
Expected: build succeeds (no import/syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/context/SpotifyContext.jsx
git commit -m "feat: add SpotifyContext provider for connection state and profile"
```

---

## Task 7: `/callback` route + provider wiring

**Files:**
- Create: `src/pages/Callback.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/pages/Callback.jsx`**

```jsx
// src/pages/Callback.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { handleCallback } from '../spotify/auth'
import { auth } from '../firebase'

export default function Callback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return   // guard against React StrictMode double-invoke
    ran.current = true
    async function run() {
      try {
        await handleCallback()
        if (!auth.currentUser) await signInAnonymously(auth)
        navigate('/home', { replace: true })
      } catch {
        setError('Spotify sign-in failed. Returning to login.')
        setTimeout(() => navigate('/login', { replace: true }), 2500)
      }
    }
    run()
  }, [navigate])

  return (
    <div className="loading-splash">
      <p className="loading-label">{error ?? 'CONNECTING TO SPOTIFY'}</p>
    </div>
  )
}
```

- [ ] **Step 2: Update `src/App.jsx`**

Add these imports near the existing page imports:
```jsx
import Callback from './pages/Callback'
import { SpotifyProvider } from './context/SpotifyContext'
```

Replace the returned `<BrowserRouter>...</BrowserRouter>` block with:
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

- [ ] **Step 3: Verify it compiles**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Callback.jsx src/App.jsx
git commit -m "feat: add /callback route and wrap app in SpotifyProvider"
```

---

## Task 8: Rewire the Login button to real Spotify OAuth

**Files:**
- Modify: `src/pages/Login.jsx`

- [ ] **Step 1: Update imports in `src/pages/Login.jsx`**

Replace:
```jsx
import { signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
```
with:
```jsx
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import { beginLogin } from '../spotify/auth'
```

- [ ] **Step 2: Replace `handleGoogle` with `handleSpotify`**

Replace the whole `handleGoogle` function:
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
with:
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

- [ ] **Step 3: Point the Spotify button at the new handler**

In the JSX, change the Spotify button's `onClick` and loading check:
```jsx
        <button
          className="login__btn login__btn--spotify ripple-host"
          onClick={handleSpotify}
          disabled={loading !== null}
        >
          {loading === 'spotify' ? '···' : 'CONTINUE WITH SPOTIFY'}
        </button>
```
Leave the guest button (`handleGuest`) unchanged.

- [ ] **Step 4: Verify it compiles**

Run:
```bash
npm run build
```
Expected: build succeeds, no unused-import lint errors for `GoogleAuthProvider`/`signInWithPopup`.

- [ ] **Step 5: Manual verification** (requires Task 0 + `.env`)

Run `npm run dev`, open **`http://127.0.0.1:5173`** (not `localhost`). Click **CONTINUE WITH SPOTIFY** → you should be redirected to Spotify's consent screen → after approving, you land back on `/home`. If you see Spotify's "INVALID_CLIENT" or a redirect-URI error, re-check Task 0 Step 2. If you get `403`, re-check Task 0 Step 3 (allowlist).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Login.jsx
git commit -m "feat: wire CONTINUE WITH SPOTIFY button to real OAuth"
```

---

## Task 9: Results — async generation, loading, Spotify save

**Files:**
- Modify: `src/pages/Results.jsx`
- Modify: `src/pages/Results.css` (add loading styles)

- [ ] **Step 1: Update imports and derive mood params**

In `src/pages/Results.jsx`, add to the imports:
```jsx
import { useSpotify } from '../context/SpotifyContext'
import { createPlaylist, addTracks } from '../spotify/client'
```

Just inside the component, after `const mood = ...`, add:
```jsx
  const { connected, spotifyUser } = useSpotify()
  const moodParams = {
    mood:    state?.mood,
    vibes:   state?.vibes,
    energy:  state?.energy,
    valence: state?.valence,
  }
```

- [ ] **Step 2: Replace synchronous track init with async load + loading state**

Replace:
```jsx
  const [tracks,       setTracks]       = useState(() => generatePlaylist({ mood }))
```
with:
```jsx
  const [tracks,       setTracks]       = useState([])
  const [loading,      setLoading]      = useState(true)
```

Add this effect alongside the other `useEffect`s:
```jsx
  // Generate the playlist on mount (async — Spotify search or stub fallback)
  useEffect(() => {
    let active = true
    setLoading(true)
    generatePlaylist(moodParams).then(t => {
      if (active) { setTracks(t); setLoading(false) }
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

- [ ] **Step 3: Make reshuffle async**

Replace the entire `handleReshuffle` function:
```jsx
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
```
with:
```jsx
  const handleReshuffle = async () => {
    if (shuffling) return
    setShuffling(true)
    const fresh = (await generatePlaylist(moodParams)).filter(t => !pinnedNames.has(t.name))
    setTimeout(() => {
      setTracks(prev => {
        const result = []
        let ui = 0
        prev.forEach(t => {
          if (pinnedNames.has(t.name)) result.push(t)
          else result.push(fresh[ui++] ?? t)
        })
        return result
      })
      setShuffling(false)
    }, 220)
  }
```

- [ ] **Step 4: Make save create a real Spotify playlist**

Replace the entire `handleSave` function:
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

    let spotify = {}
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
      if (spotify.spotifyUrl) setToastMsg('SAVED TO SPOTIFY')
    } catch (err) {
      console.error('Save failed:', err)
      setSaved(false)
    }
  }
```

- [ ] **Step 5: Render a loading state for the track list**

Replace the track list block:
```jsx
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
```
with:
```jsx
      {loading ? (
        <div className="results__loading">
          <Vinyl size="medium" active />
          <p className="results__loading-label">building your playlist</p>
        </div>
      ) : (
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
      )}
```

- [ ] **Step 6: Add loading styles**

Append to `src/pages/Results.css`:
```css
.results__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 0;
}

.results__loading-label {
  font-size: 13px;
  font-style: italic;
  color: var(--muted);
}
```

- [ ] **Step 7: Verify build + full test suite**

Run:
```bash
npm run build && npm test
```
Expected: build succeeds; all tests still pass.

- [ ] **Step 8: Manual verification** (requires Spotify login)

`npm run dev` → log in with Spotify → from Home, generate a playlist → confirm the loading vinyl shows, then **real tracks** appear. Tap **SAVE** → a "SAVED TO SPOTIFY" toast appears → confirm the new playlist exists in your Spotify account. As a guest, generation still shows the stub tracks and SAVE writes Firestore only.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Results.jsx src/pages/Results.css
git commit -m "feat: async playlist generation with loading and save-to-Spotify"
```

---

## Task 10: Profile — real Spotify name + avatar

**Files:**
- Modify: `src/pages/Profile.jsx`

- [ ] **Step 1: Read the Spotify profile from context**

In `src/pages/Profile.jsx`, add the import:
```jsx
import { useSpotify } from '../context/SpotifyContext'
```

Replace:
```jsx
  const displayName = user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const initial     = displayName[0]?.toUpperCase() ?? '?'
```
with:
```jsx
  const { spotifyUser } = useSpotify()
  const displayName = spotifyUser?.display_name ?? user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')
  const avatarUrl   = spotifyUser?.images?.[0]?.url ?? null
  const initial     = displayName[0]?.toUpperCase() ?? '?'
```

- [ ] **Step 2: Render the avatar clipped into the blob (with initial fallback)**

Replace the existing header `<svg>` block:
```jsx
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
```
with:
```jsx
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <clipPath id="profile-blob">
                  <path d="M60 8 C88 4, 116 28, 112 58 C108 90, 82 116, 52 112 C22 108, 4 82, 8 54 C12 26, 32 12, 60 8 Z" />
                </clipPath>
              </defs>
              {avatarUrl ? (
                <image
                  href={avatarUrl}
                  x="0" y="0" width="120" height="120"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#profile-blob)"
                />
              ) : (
                <>
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
                </>
              )}
            </svg>
```

- [ ] **Step 3: Verify build + full test suite**

Run:
```bash
npm run build && npm test
```
Expected: build succeeds; all tests pass.

- [ ] **Step 4: Manual verification**

`npm run dev` → log in with Spotify → open Profile → your real Spotify **display name** (uppercased) and **avatar** (clipped into the blob) show. Log in as guest → falls back to `GUEST` + the initial-in-blob. (Radar / top-vibes / stats / weekly bar chart remain placeholders by design.)

- [ ] **Step 5: Commit**

```bash
git add src/pages/Profile.jsx
git commit -m "feat: show real Spotify name and avatar on Profile"
```

---

## Final verification

- [ ] Run `npm test` → all suites pass (moodQuery, auth, client, generatePlaylist).
- [ ] Run `npm run build` → succeeds.
- [ ] Run `npm run lint` → no new errors.
- [ ] End-to-end (manual, requires Task 0 + `.env`): Spotify login → generate (real tracks) → save (appears in Spotify) → Profile (real name + avatar). Guest path → stub tracks, Firestore-only save, guest Profile.

---

## Notes / known limitations

- **Tokens in `localStorage`** — readable by JS (XSS exposure). Accepted for a dev-mode/personal app; a backend would be the mitigation for a public launch.
- **Development Mode caps at 25 allowlisted users.** Public access requires Spotify's quota-extension review (and an associated organization) — and even then will NOT restore the deprecated recommendations/audio-features endpoints.
- **Mood matching is keyword/genre heuristic**, not acoustic — a direct consequence of the deprecated audio-features endpoint. Tune the maps in `src/spotify/moodQuery.js`.
- **Profile deeper personalization** (radar, top-vibes, stats from real listening history via `/me/top/*`) is intentionally deferred — a natural follow-up plan.
