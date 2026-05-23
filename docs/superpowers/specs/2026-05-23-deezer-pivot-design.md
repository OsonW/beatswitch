# Beatswitch — Deezer Pivot Design Spec

**Date:** 2026-05-23
**Stack:** React 19, Vite, pure CSS, Firebase (Auth + Firestore), React Router — fully client-side SPA, no backend
**Supersedes:** the Spotify integration (`2026-05-23-spotify-integration-design.md`) for the music-data layer

---

## Why this pivot

Spotify now requires the **developer account to have Spotify Premium** to enable Web API access (the "Web API" option is greyed out at app creation for free accounts, with an "Upgrade to Spotify Premium to access the Web API" banner). The entire Spotify integration depends on the Web API, so it cannot run without an ongoing Premium subscription. We pivot to **Deezer's free, no-auth API** for mood→tracks, and revert the Spotify-specific auth/save/identity features to Firebase.

## Goal

Keep the three things that matter, without Spotify:
1. **Real tracks from mood** — via Deezer's free Search API (no key, no auth).
2. **Real 30s preview playback** — Deezer returns preview URLs, so the existing preview UI becomes functional audio.
3. **Login + identity + save** — via Firebase (Google sign-in, profile name/photo, Firestore save) — restoring the app's original behavior.

**Not in scope:** real album-cover images (keep the v2 flat-SVG art aesthetic); any backend/proxy; saving to an external music library.

---

## Architecture decision: client-only via JSONP

Deezer's JSON endpoints do not send CORS headers, so a browser `fetch` is blocked cross-origin. Deezer supports **JSONP** (`&output=jsonp&callback=<fn>`), which works client-side without a backend. We use JSONP to honor the no-backend constraint.

**Trade-off (accepted):** JSONP injects and executes a `<script>` from `api.deezer.com`. Acceptable for a personal/portfolio app. The alternative (a small serverless proxy) is rejected to keep the app fully client-side.

No env vars and no OAuth are required — Deezer search is anonymous.

---

## Files removed

- `src/spotify/auth.js` + `src/spotify/auth.test.js`
- `src/spotify/client.js` + `src/spotify/client.test.js`
- `src/context/SpotifyContext.jsx`
- `src/pages/Callback.jsx`
- `src/spotify/moodQuery.js` + test → **moved** to `src/music/` (see below), not deleted

After removal, `src/spotify/` no longer exists.

---

## New / moved modules

### `src/music/deezer.js` (new)
Anonymous Deezer search via JSONP.

- **`buildSearchUrl(query, limit = 10)`** — pure; returns the Deezer search URL string with `q`, `limit`, `output=jsonp`, and a `callback` placeholder. Unit-tested.
- **`searchTracks(query, limit = 10)`** — performs the JSONP request: create a unique global callback, inject a `<script src=buildSearchUrl(...)>`, resolve with the response `data` array when the callback fires, reject/timeout after ~8s, and always clean up the script tag + global callback.
- Deezer track shape consumed: `{ id, title, duration (seconds), preview (mp3 URL), artist: { name }, album: { ... } }`.

### `src/music/moodQuery.js` (moved + simplified)
Moved out of `src/spotify/`. Pure function, now produces **plain keyword** query strings (Deezer `q` is free-text). Changes from the Spotify version:
- Remove the `genre:` filter syntax and the `seeds` parameter.
- Vibe map values become plain keyword phrases (e.g. `HYPE → 'hip hop hype'`).
- DESCRIBE mode → the user's text verbatim. DIAL mode → energy/valence keyword phrase. BLEND mode → one keyword phrase per vibe. Empty input → a default phrase (e.g. `'top hits'`).
- Tests updated to assert plain-string outputs (no `genre:`).

---

## `src/utils/generatePlaylist.js` (rewrite)

No token/guest distinction — Deezer needs no auth, so **everyone gets real tracks**.

1. Build queries via `moodQuery(params)`.
2. For each query, `await searchTracks(q, 10)`; collect, dedupe by track id.
3. Map each Deezer track → `{ id, name: title, artist: artist.name, duration: secToDuration, previewUrl: preview }`.
   - Deezer `duration` is in **seconds** → format `m:ss`.
4. Shuffle, slice to ~10.
5. If Deezer fails entirely or returns nothing → return the hardcoded **stub** (kept as offline/fallback). Stub tracks have no `previewUrl`.

Stays `async` (Results already awaits it).

---

## `src/pages/Results.jsx` (update)

- **Remove** Spotify imports (`useSpotify`, `createPlaylist`, `addTracks`).
- **Keep** the async generation + loading state and the reshuffle logic from the Spotify work (provider-agnostic).
- **Save reverts to Firestore-only:** restore the original `handleSave` (write `users/{uid}/playlists` with `{ name, mood, createdAt, tracks }`), show a `'SAVED'` toast on success, revert `saved` on failure. Remove all Spotify save logic and the `SAVED TO SPOTIFY`/`SPOTIFY SAVE FAILED` toasts.
- **Real preview playback:**
  - One `<audio>` element via `useRef`.
  - `handlePreview(index)` plays `tracks[index].previewUrl` (if present); tapping the same index stops; selecting a new index switches. Only one at a time.
  - Auto-stop after 30s using the `ended` event plus the existing `PREVIEW_DURATION` timer as a backup.
  - Catch and ignore `audio.play()` rejections (autoplay policy).
  - Clean up (pause + clear) on unmount.
  - `previewUrl` is passed to `TrackCard`; the existing ring/waveform UI is unchanged, now backed by real audio.
- Track art remains the existing flat generated SVG (no Deezer covers).

## `src/components/TrackCard.jsx` (minimal update)
Pass through `track.previewUrl`; no visual change. If a track has no `previewUrl` (stub fallback), the preview tap is a no-op (UI may still animate, but no audio).

---

## `src/pages/Login.jsx` (revert)

- Restore Google sign-in: button label **CONTINUE WITH GOOGLE**, handler does `signInWithPopup(auth, new GoogleAuthProvider())` (the original `handleGoogle`), loading key `'google'`.
- Remove the `beginLogin` import.
- Guest button unchanged.
- Rename the button's `--spotify` modifier class to `--google` (and update the matching CSS selector) for clarity; keep all other styling.

## `src/App.jsx` (revert)
- Remove the `/callback` route and the `Callback` import.
- Remove the `SpotifyProvider` import and wrapper; restore the original `<BrowserRouter><Routes>…` structure.

## `src/pages/Profile.jsx` (re-source identity from Firebase)
- Remove `useSpotify`.
- `displayName = user?.displayName ?? (user?.isAnonymous ? 'GUEST' : 'USER')`.
- `avatarUrl = user?.photoURL ?? null` (Google accounts include a photo).
- Keep the avatar-clipped-into-blob SVG built during the Spotify work, now sourced from `user.photoURL`; guests / no-photo → existing initial-in-blob fallback.
- `since` stays from Firebase `creationTime`. Radar/top-vibes/stats/bar-chart remain placeholders.

---

## Tooling changes
- `.env.example`: **delete it** — no env vars are needed anymore (Deezer is anonymous, Firebase config comes from the existing `VITE_FIREBASE_*` setup which is unchanged).
- `vite.config.js`: remove the `server: { host: '127.0.0.1', port: 5173 }` override (was only for the Spotify redirect URI); **keep** the Vitest `test` block and the type reference.

---

## Error handling

| Case | Handling |
|------|----------|
| JSONP query fails / times out | Skip that query; keep results from others |
| All queries fail / empty | Return the stub playlist |
| `audio.play()` rejected (autoplay policy) | Catch and ignore; preview UI still reflects state |
| Track has no `previewUrl` (stub) | Preview tap does not start audio |
| Deezer rate limit (≈50 req / 5s) | Unlikely with ~3 queries; no special handling |

---

## Testing

- **Unit (Vitest):**
  - `moodQuery` — plain-keyword outputs for DESCRIBE / BLEND / DIAL / empty.
  - `buildSearchUrl` — correct host, `q` encoding, `limit`, `output=jsonp`, `callback` params.
  - `generatePlaylist` — with a mocked `searchTracks`: maps Deezer results to the app track shape (incl. `previewUrl` and `m:ss` duration), dedupes, and falls back to the stub on empty/error.
- **Manual:** the JSONP round-trip (real Deezer response), 30s audio preview playback (play/stop/switch/auto-stop), Google login, Firestore save, Profile photo rendering.

---

## Data flow

```
Login (Google / guest) → Home (build mood)
  → Results: generatePlaylist(moodParams)
       → moodQuery → deezer.searchTracks (JSONP) → real tracks (with previewUrl)
  → tap preview → <audio> plays 30s preview
  → SAVE → Firestore users/{uid}/playlists
Saved / Profile → Firestore (+ Google name/photo on Profile)
```

---

## Implementation order

1. Remove Spotify files; move `moodQuery` to `src/music/` and simplify (+ update tests).
2. `src/music/deezer.js` — `buildSearchUrl` (+ tests) and `searchTracks` (JSONP).
3. `src/utils/generatePlaylist.js` — rewrite for Deezer (+ update tests).
4. `src/App.jsx` — remove `/callback` + provider.
5. `src/pages/Login.jsx` — revert to Google.
6. `src/pages/Profile.jsx` — re-source name/photo from Firebase.
7. `src/pages/Results.jsx` + `TrackCard.jsx` — Firestore-only save + real audio previews.
8. Tooling: `.env.example`, `vite.config.js`.
