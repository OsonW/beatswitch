# Beatswitch — Home/Saved UX + Functionality Batch — Design Spec

**Date:** 2026-05-23
**Stack:** React 19, Vite, pure CSS, Firebase (Auth + Firestore), React Router, Deezer (JSONP) — fully client-side
**Builds on:** the Deezer pivot (`2026-05-23-deezer-pivot-design.md`)

---

## Goal

Five changes, grouped: make the broken generation paths actually work, modernize track art, personalize the Home top, and make deleting saved mixes discoverable.

1. **Home greeting** replaces the top header; remove the daily-mood system.
2. **DIAL** tab actually drives generation (fix the duplicate-hook bug).
3. **Mix Your Favourites** builds from the user's saved **artists**.
4. **Album covers** (real, from Deezer) replace placeholder art on track cards.
5. **Delete saved mix** via a visible button.

**Out of scope:** VibeLeaderboard "TRENDING NOW" (hardcoded placeholder) and the empty MoodTimeline (`moodHistory` is never written) — pre-existing, flagged as future follow-ups, not touched here.

---

## Feature 1 — Home greeting; remove header + daily mood

### Files
- `src/pages/Home.jsx` + `src/pages/Home.css` (update)
- `src/utils/greeting.js` + `src/utils/greeting.test.js` (new)
- Delete: `src/components/MoodOfDay.jsx`, `src/components/MoodOfDay.css`

### Changes
- Remove the top header block (`<header className="home__header">` — the `BS` logo + avatar→profile button). Profile remains reachable via the bottom `Navbar` (HOME / SAVED / PROFILE).
- Remove `<MoodOfDay />` and its import; delete the component + its CSS (no other consumer).
- Add a **greeting** line at the very top of Home, above the existing `WHAT'S THE VIBE?` hero (the hero and tabs stay).

### `src/utils/greeting.js`
Pure, testable greeting builder.
```
const GREETINGS = [
  'Yo, {name}',
  'Great day, {name}',
  "What's good, {name}",
  'Back again, {name}',
  "Let's go, {name}",
  'Hey {name}',
]
```
- `firstName(user)` → `user.displayName?.trim().split(/\s+/)[0]` or `'stranger'` when absent (guests / no displayName).
- `pickGreeting(name, rand = Math.random)` → choose a template via `rand()` and interpolate `{name}`. The injectable `rand` makes it deterministic in tests.
- Home calls `useMemo(() => pickGreeting(firstName(user)), [user])` so the greeting is stable for the visit but refreshes per navigation.

### Layout / CSS
- Greeting rendered as a personal line at the top of `home__main` (or just above it): ~24–28px, weight 700, rendered **as written in the templates** (mixed/sentence case — not forced uppercase, since "Yo, Oson" reads better than "YO, OSON"), color `--white` with the `{name}` portion in `--coral`.
- Remove now-unused `home__header` / `home__logo` / `home__avatar` CSS rules.

---

## Feature 2 — DIAL actually drives generation

### Files
- `src/components/MoodDial.jsx` (update)
- `src/pages/Home.jsx` (update)

### The bug
`Home` instantiates its own `useMoodDial(300)` (whose `position` never changes from the default `{x:50,y:50}`) and passes `onChange={() => {}}` to `<MoodDial>`, which instantiates a *second*, independent `useMoodDial`. The dragged values live in MoodDial's copy and never reach Home's `handleGenerate`, so DIAL always sends `energy:50, valence:50` and descriptor `'balanced, undefined'`.

### Fix
- `MoodDial`: extend the reported payload to include the descriptor:
  ```jsx
  useEffect(() => {
    onChange?.({ energy: position.x, valence: position.y, moodDescriptor })
  }, [position, moodDescriptor, onChange])
  ```
- `Home`:
  - Remove the local `useMoodDial` usage (and its now-unused import + destructure).
  - Add `const [dial, setDial] = useState({ energy: 50, valence: 50, moodDescriptor: 'balanced, undefined' })`.
  - Render `<MoodDial onChange={setDial} />`.
  - In `handleGenerate`, the DIAL branch navigates with `{ mood: dial.moodDescriptor, energy: dial.energy, valence: dial.valence }`.

`setDial` is a stable setter, so MoodDial's `onChange` effect won't loop.

---

## Feature 3 — Mix Your Favourites from saved artists

### Files
- `src/components/FavouritesMix.jsx` (update)
- `src/music/moodQuery.js` (update)
- `src/music/moodQuery.test.js` (update)
- `src/pages/Results.jsx` (update — forward `artists`)

### The bug
`FavouritesMix` navigates with `vibes: moods` where `moods` is an array of raw mood strings, but `moodQuery` expects `vibes: [{name}]` (reads `v.name`). Result: no queries match → `'top hits'` fallback every time.

### Fix
- `FavouritesMix.handleGenerate`: after `getDocs` of the latest 10 saved playlists, flatten their `tracks`, take each `track.artist`, split on `,` and trim to get individual artist names, frequency-rank, take the top **4** distinct, and:
  ```js
  navigate('/results', { state: { mood: 'YOUR TASTE', fromHistory: true, artists: topArtists } })
  ```
  If no saved tracks/artists exist, still navigate (generation falls back to stub/"top hits"); the loading state is cleared on error as today.
- `moodQuery(params)`: add an **`artists`** branch with highest priority:
  ```js
  if (Array.isArray(artists) && artists.length) {
    return artists.map(a => `${a}`.trim()).filter(Boolean)
  }
  ```
  (Deezer free-text search on an artist name returns that artist's tracks and close matches.) Falls through to the existing vibes/dial/mood/`top hits` logic otherwise.
- `Results`: add `artists: state?.artists` to `moodParams` so it reaches `generatePlaylist` → `moodQuery`.

---

## Feature 4 — Real album covers on track cards

### Files
- `src/utils/generatePlaylist.js` (update)
- `src/utils/generatePlaylist.test.js` (update)
- `src/components/TrackCard.jsx` + `src/components/TrackCard.css` (update)

### Changes
- `generatePlaylist.mapTrack`: add `cover: t.album?.cover_medium ?? t.album?.cover_big ?? null` to the returned track shape `{ id, name, artist, duration, previewUrl, cover }`.
- `TrackCard`: fill the **existing irregular polygon** with the album cover instead of a flat color:
  - When `track.cover` exists: the `track-card__art` element uses `backgroundImage: url(cover)`, `backgroundSize: cover`, `backgroundPosition: center`, and keeps the same `clipPath` polygon.
  - When absent (stub tracks, old saved playlists): fall back to the current flat `ART_COLORS[index]` background.
  - The progress ring overlay during preview is unchanged.
- Covers are scoped to track cards (Results). `CollageGrid` keeps its per-vibe colors (playlist-level, no per-track cover stored historically).

---

## Feature 5 — Visible delete for saved mixes

### Files
- `src/pages/Saved.jsx` (update `PlaylistRow`)
- `src/pages/Saved.css` (update)

### Current state
`PlaylistRow` already has a hidden **long-press** → DELETE/CANCEL bar that calls `deleteDoc(doc(db,'users',uid,'playlists',id))`. `onSnapshot` live-refreshes the list after deletion.

### Changes
- Add an always-visible delete affordance to each row (a small `✕` button at the row's right edge, beside the expand chevron) that opens the existing confirm step (`setShowDelete(true)` → DELETE/CANCEL bar). Keep long-press as a secondary trigger.
- The `✕` button must `stopPropagation` so it doesn't toggle the row's expand/collapse.
- Reuse the existing `handleDelete` and the `pl-row__delete-bar` markup. Add minimal CSS for the `✕` control.

---

## Testing

- **Unit (Vitest):**
  - `greeting.js`: `firstName` (full name → first; missing → `'stranger'`); `pickGreeting('Oson', () => 0)` returns the first template interpolated; the name is substituted.
  - `moodQuery`: new `artists` branch returns one query per artist and takes priority over `mood`/`vibes`/`dial`; existing behavior unchanged when `artists` is absent/empty.
  - `generatePlaylist`: mapped track now includes `cover` from `album.cover_medium`.
- **Manual:** DIAL drag changes the resulting tracks; FavouritesMix returns artist-based results for an account with saved playlists; album covers render in the fragmented shape (and fall back to color for stub tracks); the visible `✕` deletes a saved mix and the list updates; greeting shows the first name (and "stranger" for guests).

---

## Implementation order

1. `src/utils/greeting.js` (+tests).
2. `moodQuery` artists branch (+tests).
3. `generatePlaylist` cover field (+tests).
4. `MoodDial` onChange payload + `Home.jsx` (greeting, remove header/MoodOfDay, DIAL wiring) + `Home.css`; delete `MoodOfDay.*`.
5. `Results.jsx` forward `artists`.
6. `FavouritesMix.jsx` saved-artists logic.
7. `TrackCard.jsx` + `.css` covers.
8. `Saved.jsx` + `.css` visible delete.
