# Beatswitch × Spotify Integration — Design Spec

**Date:** 2026-05-23
**Stack:** React 19, Vite, pure CSS, Firebase (Auth + Firestore), React Router — fully client-side SPA, no backend
**Builds on:** `2026-05-20-beatswitch-v2-design.md`

---

## Goal

Make Beatswitch a real Spotify app. Four capabilities, fully client-side:

1. **Spotify login** — replace the placeholder "CONTINUE WITH SPOTIFY" button (currently wired to Google) with real Spotify OAuth.
2. **Real tracks from mood** — replace the hardcoded stub with real Spotify catalog results driven by the existing mood / energy / valence inputs.
3. **Save to Spotify** — the Results "SAVE" button creates a real playlist in the user's Spotify library.
4. **Profile identity** — show the user's real Spotify display name and avatar.

**Not in scope:** playback / previews; replacing Firebase Auth with a true Spotify Firebase identity (needs a backend); deep Profile personalization (radar / top-vibes / stats from listening history).

---

## Critical constraint: deprecated endpoints

As of **2024-11-27**, Spotify removed these Web API endpoints for apps that did not already have extended-quota access (i.e. all new apps): `/recommendations`, audio-features, audio-analysis, related-artists, featured/category playlists, and 30-second `preview_url`. These are exactly the endpoints a naive "mood → playlist" feature would use; a new app gets `403`.

**Consequence:** the mood engine is built on the **Search API** (still live) plus `/me/top/*` (still live), not on recommendations or audio features. No design element may depend on a deprecated endpoint.

---

## Architecture decision: fully client-side

- Spotify **Authorization Code + PKCE** runs entirely in the browser — no client secret, no server.
- Firebase Auth + Firestore are **kept unchanged**. After a successful Spotify login we additionally call `signInAnonymously(auth)`, so the existing Firebase `uid` remains the Firestore key and all existing security rules + Firestore code keep working untouched.
- The Spotify identity (name / avatar / user id) comes from the Spotify Web API, layered on top of the anonymous Firebase identity.
- **Guests** ("BROWSE AS GUEST") get a Firebase-anonymous session with no Spotify token. Every Spotify call requires a user token (client-credentials would need a secret = a backend), so guests fall back to the existing local stub for generation and cannot save to Spotify.

### Security trade-off (accepted)
Client-only means tokens live in `localStorage`, readable by JS (XSS exposure). Acceptable for a personal / development-mode app. Mitigation if this ever goes public = move the token exchange/refresh to a backend.

---

## Manual prerequisites (developer, outside the codebase)

1. Create an app at the Spotify Developer Dashboard → copy the **Client ID** (no secret needed for PKCE).
2. Add **Redirect URIs**:
   - Dev: `http://127.0.0.1:5173/callback` (Spotify requires loopback `127.0.0.1`, **not** `localhost`).
   - Prod: `https://<domain>/callback`.
3. App starts in **Development Mode** — add allowlisted users (≤25) by Spotify account email, including your own. Non-allowlisted users receive `403`.
4. Create `.env` with:
   - `VITE_SPOTIFY_CLIENT_ID=<client id>`
   - `VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback`
5. **Run/open the dev app via `http://127.0.0.1:5173`** (not `localhost`) so the origin matches the registered redirect URI.

### Required scopes
```
user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private
```

---

## New modules

### `src/spotify/auth.js`
PKCE auth lifecycle. Pure-ish, token storage isolated here.

- `generateCodeVerifier()` — random high-entropy string.
- `generateCodeChallenge(verifier)` — SHA-256 → base64url.
- `beginLogin()` — store verifier in `sessionStorage`, build the `/authorize` URL with scopes + challenge, redirect.
- `handleCallback()` — read `code` from the URL, exchange at the token endpoint using the stored verifier, persist tokens, clear the verifier.
- `refreshToken()` — refresh-token grant (PKCE supports refresh without a secret).
- `getValidToken()` — return a non-expired access token, refreshing first if expired.
- `logout()` — clear stored tokens.
- Storage shape in `localStorage`: `{ access_token, refresh_token, expires_at }`.

### `src/spotify/client.js`
- `spotifyFetch(path, opts)` — injects the bearer token from `getValidToken()`; on `401`, refresh once and retry; surfaces `403` / `429` distinctly.
- Helpers: `getMe()`, `getTopArtists()`, `searchTracks(query)`, `createPlaylist(userId, name, description)`, `addTracks(playlistId, uris)`.

### `src/spotify/moodQuery.js`
Pure function — the heart of the mood engine, unit-testable.

- Input: `{ vibes?: [{name, weight}], mood?: string, energy?: number, valence?: number }`.
- Output: an array of Spotify Search query strings (with `genre:` / `year:` filters and mood keywords).
- Holds the **vibe → genre/keyword map** and the **energy/valence → modifier** rules (e.g. high energy → high-tempo genres + keywords; low valence → melancholy/minor keywords).
- For logged-in users, seeds queries with the user's top artists/genres (caller passes them in, so the function stays pure).

### `src/context/SpotifyContext.jsx`
- Provider exposing `{ connected, spotifyUser, ready }`.
- On mount: if a valid token exists, fetch `getMe()` once and expose the profile; otherwise `connected = false`.
- Consumed by Login (redirect handling), Results (generation + save), and Profile (identity).

---

## Auth flow

1. `CONTINUE WITH SPOTIFY` → `beginLogin()` → browser redirects to Spotify `/authorize`.
2. Spotify redirects back to the new **`/callback`** route.
3. `/callback` runs `handleCallback()` → exchanges `code` for tokens → `signInAnonymously(auth)` (so Firestore works) → navigate `/home`.
4. `App.jsx`'s existing `onAuthStateChanged` gate then sees the Firebase user and renders protected routes.
5. `BROWSE AS GUEST` → `signInAnonymously(auth)` only, no Spotify token.

### File changes
- `src/App.jsx` — add a `/callback` route; wrap the tree in `SpotifyContext` provider.
- `src/pages/Login.jsx` — rewire the Spotify button from `signInWithPopup(Google)` to `beginLogin()`; guest button unchanged.

---

## Mood → tracks (Strategy A: Search + personalization)

`src/utils/generatePlaylist.js` becomes **async**:

1. If no Spotify token → return the existing `STUB_TRACKS` (guest path), unchanged.
2. If a token exists:
   - Fetch the user's top artists/genres (`getTopArtists`) — used as seeds.
   - Build queries via `moodQuery(params, seeds)`.
   - Run `searchTracks()` for each query, collect results.
   - Dedupe by track id, shuffle, slice to ~8–12 tracks.
3. Map each result to the existing track shape, extended: `{ name, artist, duration, id, uri }`.

### Notable refactor
`generatePlaylist` is currently **synchronous** and called inside `useState` initializers in `Results.jsx` (line 21) and `handleReshuffle` (line 72). Both move to an async pattern:
- Initial load → `useEffect` that sets a `loading` state, awaits generation, then sets tracks. Loading state reuses the spinning `Vinyl` component.
- `handleReshuffle` → async; keeps the existing pinned/unpinned merge logic but awaits a fresh async fetch.
- The shuffle exit/enter animation timing is preserved.

---

## Save to Spotify

`Results.handleSave`:

1. If Spotify connected:
   - `createPlaylist(spotifyUser.id, "<MOOD> MIX", "Generated by Beatswitch")`.
   - `addTracks(playlistId, tracks.map(t => t.uri))`.
   - Write the existing Firestore doc, now including `spotifyPlaylistId` and `spotifyUrl`.
2. If guest (no Spotify): existing Firestore-only write, unchanged.
3. On Spotify failure → revert the `saved` state (as it already does on Firestore failure) and surface a Toast.

Saved / Timeline / Collage pages keep reading Firestore unchanged.

### File changes
- `src/pages/Results.jsx` — async generation + loading state; Spotify-aware save; tracks now carry `uri`.

---

## Profile identity

`src/pages/Profile.jsx`:

- Pull `spotifyUser` from `SpotifyContext`.
- **Display name:** `spotifyUser.display_name` when connected; else current fallback (`GUEST` / `USER`).
- **Avatar:** clip `spotifyUser.images[0]?.url` into the existing 120px SVG blob using an SVG `<clipPath>` with the blob `d` path + an `<image>`. No avatar (some Spotify users have none) → current initial-in-blob fallback.
- **"since":** keep Firebase `creationTime` — Spotify's API exposes no signup date.
- Radar / top-vibes / stats / weekly bar chart remain placeholders (out of scope).

---

## Error handling

| Case | Handling |
|------|----------|
| Redirect / token-exchange failure | Show error on Login, allow retry |
| Expired token | Auto-refresh via `getValidToken()` |
| Revoked / invalid refresh token | Clear tokens, route to Login |
| `403` (not allowlisted in dev mode) | Clear message: account not allowlisted for this app |
| `429` (rate limit) | Respect `Retry-After`, back off |
| Empty search results | Widen / relax query, retry; last resort fall back to stub |
| Save failure | Revert `saved` state, Toast |

---

## Testing

No test runner exists yet — add **Vitest**.

- **Unit (Vitest):** `moodQuery` mapping (vibes/energy/valence → expected query shape); token-expiry math in `auth.js` (`getValidToken` returns/refreshes correctly given a mocked clock); `spotifyFetch` 401-retry logic with a mocked fetch.
- **Manual:** the full OAuth redirect round-trip, real save-to-Spotify, and avatar rendering (redirect-based OAuth can't be meaningfully unit-tested).

---

## Data flow summary

```
Login → Spotify PKCE → /callback → tokens + Firebase anon → /home
Home  → user builds mood (vibes / blend / dial) → GENERATE → /results (mood params)
Results → useEffect → generatePlaylist(params)
            → moodQuery + getTopArtists → searchTracks → real tracks (with uri)
        → SAVE → createPlaylist + addTracks (Spotify) + Firestore doc (with spotify ids)
Saved / Profile → Firestore (+ Spotify profile for identity)
```

---

## Implementation order

1. `.env` + `src/spotify/auth.js` (PKCE) + Vitest setup
2. `src/spotify/client.js` (fetch wrapper + helpers)
3. `src/spotify/moodQuery.js` (+ unit tests)
4. `src/context/SpotifyContext.jsx`
5. `src/App.jsx` — `/callback` route + provider
6. `src/pages/Login.jsx` — rewire Spotify button
7. `src/utils/generatePlaylist.js` — async + Spotify path
8. `src/pages/Results.jsx` — async generation, loading, Spotify save
9. `src/pages/Profile.jsx` — real name + avatar
