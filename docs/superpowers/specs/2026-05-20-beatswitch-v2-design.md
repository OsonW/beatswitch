# Beatswitch v2 — Design Spec
**Date:** 2026-05-20  
**Stack:** React 19, Vite, pure CSS, Firebase (Auth + Firestore), React Router, mobile-first 390px

---

## Design System

### Color Palette (flat, no gradients on UI elements)
```
--bg:      #080808   background
--coral:   #FF4D00   primary accent (burnt orange)
--lime:    #CCFF00   secondary accent (acid lime)
--violet:  #7B2FFF   tertiary
--white:   #F2F2F2
--dim:     #2A2A2A
--muted:   #666666
```
*Remove:* `--bg-card`, `--bg-muted`, `--radius-pill`, `--radius-card`, `--radius-lg`, `--radius-xl`

### Typography
- Display: `system-ui`, weight 700–900, `-0.04em` tracking, uppercase
- Sizes: 88px hero, 56px mood-of-day, 48px section, 36px mix header, 24px subsection, 16px body, 15px vibe name, 13px label, 11px micro, 10px axis/day
- Labels: `0.18em` letter-spacing, uppercase

### Shape Language
- No `border-radius` on cards or panels
- Decorative shapes: irregular SVG polygons and CSS blob shapes (`border-radius` with 8 independent values)
- UI sections divided by thin irregular SVG lines
- Album art: flat solid color irregular SVG shapes, unique per track

### Animation Rules
- All CSS keyframes only — no external libraries
- All touch interactions use native touch events
- Every interactive element: `active { transform: scale(0.97) }`
- List entrance: `delay = index * 80ms`, `translateY(12px)` → 0 + fade in

---

## Hard Rules
- Zero emojis anywhere in the codebase
- Zero `linear-gradient` / `radial-gradient` on UI elements (SVG decorative shapes only)
- Zero rectangular cards with `border-radius`
- Content sits directly on `#080808` — no panel backgrounds
- Sections divided by thin irregular SVG lines, not `<hr>`

---

## Global File Changes

### `src/index.css`
- Update CSS variables to v2 palette
- Remove card/pill radius variables
- Add shared keyframes: `blob-morph`, `spin-slow`, `stroke-draw`, `slide-up`, `slide-in-top`, `scale-in`
- Keep `ripple-expand`, `eq-bounce`

### `src/App.jsx`
- No routing changes needed (`/profile` already exists)
- No changes required

### `src/components/Navbar.jsx + Navbar.css`
- Remove unicode symbols (♪ ♫ ♥ ◉) — replace with plain text labels only
- Sliding underline indicator instead of pill shape
- Active state: label gets `--coral` color + underline

### `src/components/Waveform.jsx + Waveform.css`
- Make bar heights and widths irregular using `nth-child` with different `--h` values
- 5 bars with unique heights: 40%, 70%, 55%, 85%, 45%
- Widths: 3px, 4px, 2px, 4px, 3px

### `src/components/Vinyl.jsx + Vinyl.css`
- Rewrite as inline SVG
- Concentric circles with irregular groove spacing (not uniform)
- Off-center label ellipse
- `spin-slow` animation (20s linear infinite) when `active`

---

## Feature 1 — Mood Blending

### Files
- `src/components/VibeCard.jsx + VibeCard.css` (update)
- `src/hooks/useBlend.js` (new)
- `src/components/BlendOrb.jsx + BlendOrb.css` (new)
- `src/pages/Home.jsx + Home.css` (update)

### VibeCard changes
- Remove: emoji, gradient background, flip animation, `VIBE_DATA` with emojis/gradients
- Add: `selected` prop (bool), `onSelect(vibe)` callback
- Selected state: label turns `--coral`, thin `--coral` underline below text
- Unselected: label `--white`, no border, no box
- Flat solid background colors per vibe (no gradient):
  ```
  HYPE:        #FF4D00
  MELANCHOLIC: #7B2FFF
  FOCUS:       #CCFF00  (text: #080808)
  LATE NIGHT:  #0D0D0D  (border: 1px #2A2A2A)
  HEARTBREAK:  #7B2FFF
  ROAD TRIP:   #FF4D00
  ```
- Card shape: clip-path irregular polygon, different per card

### useBlend.js
```js
// State: selectedVibes (array, max 3), weights (object vibe→number summing to 100)
// Actions: toggleVibe(vibe), adjustWeight(vibe, newWeight) — redistributes others proportionally
// Returns: { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel }
// blendLabel: "LATE NIGHT 60 — HYPE 40" uppercase string
```

### BlendOrb
- Irregular SVG blob shape, morphs path via CSS keyframes on `d` attribute (use `clip-path` + `border-radius` morphing fallback since SVG path morphing via CSS is limited)
- Layers flat colors of selected vibes using `mix-blend-mode: screen` at 0.3 opacity
- Slowly morphs via `blob-morph` keyframe on `border-radius`
- Only renders when 2+ vibes selected

### Home tab switcher
- Three tabs: DESCRIBE / BLEND / DIAL
- Plain text, 13px tracked uppercase
- Sliding underline indicator (absolutely positioned `--coral` line, CSS `left` transition)
- No pill, no box

### Blend ratio display
- Horizontal text strip: `"LATE NIGHT 60 — HYPE 40"` 
- 13px tracked uppercase, numbers in `--coral`
- Below selected vibe labels

### Weight scrubber
- Thin horizontal line (1px `--dim`) below each selected vibe label
- Draggable thumb (6px circle, `--coral`) on touch events
- Weights always sum to 100 — adjusting one redistributes remainder proportionally

### Generate button
- When 1 vibe: `"GENERATE PLAYLIST"`
- When 2–3 vibes: `"BLEND + GENERATE"`
- Plain text with thin underline, not a button box

### Data passed to generation stub
```js
{ vibes: [{ name: 'LATE NIGHT', weight: 60 }, { name: 'HYPE', weight: 40 }] }
```

---

## Feature 2 — Mood Dial (2-axis)

### Files
- `src/hooks/useMoodDial.js` (new)
- `src/components/MoodDial.jsx + MoodDial.css` (new)

### useMoodDial.js
```js
// State: position { x: 0-100, y: 0-100 } (50,50 = center default)
// isDragging: bool
// moodDescriptor: string derived from quadrant + distance from center
// Returns: { position, isDragging, handleTouchStart, handleTouchMove, handleTouchEnd, moodDescriptor }
```

### Mood descriptor mapping
```
RADIANT + ELECTRIC (top-right):  "euphoric, high voltage"
RADIANT + CALM (top-left):       "warm, expansive"
SHADOW + ELECTRIC (bottom-right):"brooding, high voltage"
SHADOW + CALM (bottom-left):     "hollow, drifting"
Center zone (±15):               "balanced, undefined"
```
Interpolate between descriptors based on quadrant and distance.

### MoodDial canvas
- 300×300px, `#0D0D0D` background
- Grid lines: thin `#1A1A1A`, irregular spacing (not uniform — e.g. 37px, 52px, 44px, 61px, 48px)
- Axis labels at edges: CALM (left), ELECTRIC (right), RADIANT (top), SHADOW (bottom) — 11px micro `--muted`
- Quadrant labels faint in corners: 10px, `#222222`
- Draggable point: 12px circle, flat `#FF4D00`, no border
- Idle pulse: `scale(1)` → `scale(1.08)` → `scale(1)`, 2s ease-in-out, stops on drag
- SVG path from center to current point: irregular cubic bezier (control points offset ±8px from midpoint), redrawn on every move
- Live mood descriptor below canvas: 16px italic `--muted`

### Data passed
```js
{ energy: position.x, valence: position.y }  // both 0-100
```

---

## Feature 3 — Taste Profile Page

### Files
- `src/pages/Profile.jsx + Profile.css` (full replacement)
- `src/components/RadarChart.jsx + RadarChart.css` (new)

### Layout
Content directly on `#080808`. No panels.

### Header
- User initial in large (120px) irregular SVG blob shape — asymmetric, flat `#FF4D00`
- Name: 48px, weight 800, uppercase
- "since [date]" — 11px `--muted`, user `metadata.creationTime`

### "YOUR SOUND" section
- 13px tracked uppercase header
- Thin `--coral` line extending right off-screen (SVG `<line>` with irregular endpoints)

### RadarChart (pure SVG, 6 axes)
- Axes: ENERGY, WEIGHT, TEMPO, MOVEMENT, DEPTH, HEAT
- SVG size: 280×280, center at 140,140, max radius 100px
- Axis lines: slightly irregular paths (add 1-2px wobble via quadratic bezier with tiny control point offset)
- Outer boundary: irregular hexagon (vertices at max radius ± 3-5px random offset each)
- Filled polygon: flat `#FF4D00` at 0.25 opacity, `#FF4D00` stroke 1px
- Axis labels: 10px uppercase tracked at each tip + 16px padding
- Entrance animation: `stroke-dashoffset` from full length to 0 over 1.2s (`stroke-dasharray` = path length), then fill fades in at 1.2s
- Placeholder values: fixed realistic set e.g. `[72, 58, 85, 63, 79, 44]`

### Top Vibes
- Plain text list, left-aligned
- Sizes: most used = 24px, 2nd = 20px, 3rd = 16px, 4th+ = 12px
- Colors: top vibe = `--coral`, rest = `--muted`
- Placeholder: `['LATE NIGHT', 'FOCUS', 'HYPE', 'MELANCHOLIC', 'ROAD TRIP']`

### Stats
- Two plain text columns: large number (48px 800 weight) above, small label (11px tracked) below
- Placeholder: `24 PLAYLISTS`, `187 TRACKS`

### Mood Bar Chart
- 7 vertical bars, one per day (last 7 days)
- Bars: flat `#FF4D00`, irregular widths (8px, 11px, 9px, 13px, 10px, 12px, 9px)
- Heights: proportional to placeholder generation counts (40%, 65%, 30%, 80%, 55%, 90%, 45%)
- Day labels below: 10px `--muted`

### Sign Out
- Plain text, 13px, `--muted`, underline on tap
- No button box

---

## Feature 4 — Mood Timeline

### Files
- `src/components/MoodTimeline.jsx + MoodTimeline.css` (new)
- `src/pages/Saved.jsx + Saved.css` (update)

### Firestore
- Collection: `users/{uid}/moodHistory`
- Document shape: `{ vibe: string, timestamp: Timestamp, playlistId: string, tracks: array }`
- Read: `orderBy('timestamp', 'desc')`, limit 20

### Timeline strip
- Horizontal scroll, `overflow-x: scroll`, `scrollbar-width: none`
- Each entry: vibe name 13px uppercase + date 10px `--muted` below
- Entries connected by thin irregular hand-drawn SVG line (cubic bezier path spanning all entries)
- Active/selected entry: vibe name turns `--coral`, small irregular SVG polygon appears above it (5-sided, ~10px)
- Tap entry: expands compact track list below strip for that session
- Track list: vibe name, thin divider, track rows (name + artist, 12px)

### Interaction
- Only one entry expanded at a time
- Expanded tracks slide down (max-height animation)

---

## Feature 5 — Vibe Leaderboard

### Files
- `src/components/VibeLeaderboard.jsx + VibeLeaderboard.css` (new)
- `src/pages/Home.jsx + Home.css` (update)

### Data (hardcoded placeholder)
```js
[
  { vibe: 'LATE NIGHT',  count: 4821 },
  { vibe: 'HYPE',        count: 3654 },
  { vibe: 'FOCUS',       count: 2890 },
  { vibe: 'MELANCHOLIC', count: 2103 },
  { vibe: 'HEARTBREAK',  count: 1567 },
  { vibe: 'ROAD TRIP',   count: 988  },
]
```

### Layout
- Section header: "TRENDING NOW" — 13px tracked uppercase
- 6 rows, no background
- Each row: vibe name left (15px uppercase) — unique irregular waveform SVG center — count right (13px `--muted`)
- Left edge: thin vertical `--coral` line, height proportional to rank (rank 1 = 40px, rank 6 = 8px)
- Top vibe: name in `--coral`, 18px
- Row separator: 1px `#1A1A1A`
- Stagger entrance: `translateY(12px)` + `opacity: 0` → normal, `delay = index * 80ms`
- Each vibe has a unique waveform bar pattern (5 bars with different fixed heights)

### Interaction
- Tap row: selects that vibe in BLEND tab, scrolls to vibe cards section

---

## Feature 6 — Mood of the Day

### Files
- `src/components/MoodOfDay.jsx + MoodOfDay.css` (new)
- `src/pages/Home.jsx + Home.css` (update)

### Daily moods (by `new Date().getDay()`)
```js
const DAILY_MOODS = [
  { name: 'GOLDEN HOUR',      desc: 'warm slow nostalgic like a polaroid fading' },         // 0 Sun
  { name: 'FOCUSED GRIND',    desc: 'sharp clean forward moving relentless' },               // 1 Mon
  { name: 'MELANCHOLIC DRIVE',desc: 'late roads wet asphalt and distance' },                 // 2 Tue
  { name: 'MIDWEEK TENSION',  desc: 'restless urgent not quite there yet' },                 // 3 Wed
  { name: 'DEEP CURRENT',     desc: 'slow heavy moving beneath the surface' },               // 4 Thu
  { name: 'EUPHORIC STATIC',  desc: 'loud bright electric dissolving' },                     // 5 Fri
  { name: 'LATE WANDER',      desc: 'dark loose unraveling at the edges' },                  // 6 Sat
]
```

### Layout
- Full-width section below sticky header
- Background decoration: large irregular SVG blob shape behind text (low opacity `#FF4D00` at 0.04)
- "TODAY" — 11px tracked micro `--muted`
- Mood name — 56px 900 weight uppercase `--coral`
- Descriptor — 14px italic `--muted`
- Vinyl SVG component (right-aligned, small, `active` = spinning)
- "GENERATE" — 13px tracked uppercase, thin underline, plain text

### Interaction
- Tap GENERATE: navigate to Results with `{ mood: dailyMood.name }`

---

## Feature 7 — Favourites Mix

### Files
- `src/components/FavouritesMix.jsx + FavouritesMix.css` (new)
- `src/pages/Saved.jsx + Saved.css` (update)

### Layout
- Top of Saved page (above MoodTimeline)
- No card, no panel
- "MIX YOUR FAVOURITES" — 36px 800 uppercase
- Subtext — 13px `--muted`
- "GENERATE MIX" — 15px uppercase `--coral` with underline, plain text link

### Interaction
1. Tap GENERATE MIX → set `loading = true`
2. Loading state: Vinyl SVG spins, "reading your taste" 13px italic
3. Read Firestore `users/{uid}/playlists` (limit 10, orderBy createdAt desc)
4. Extract vibe names from playlist `mood` field
5. Pass blend to generation stub: `{ vibes: extractedVibes, source: 'history' }`
6. Navigate to Results with `{ mood: 'YOUR TASTE', fromHistory: true }`
7. Results page: when `fromHistory` is true, show "BUILT FROM YOUR HISTORY" instead of mood text

---

## Feature 8 — Track Preview and Vibe Check

### Files
- `src/components/TrackCard.jsx + TrackCard.css` (update)
- `src/components/BottomSheet.jsx + BottomSheet.css` (new)
- `src/components/Toast.jsx + Toast.css` (new)
- `src/pages/Results.jsx + Results.css` (update)

### TrackCard album art
- Replace gradient `div` with irregular SVG shape
- Each track gets a unique flat color from palette: cycle through `['#FF4D00', '#7B2FFF', '#CCFF00', '#2A2A2A', '#F2F2F2', '#0D0D0D', '#3D0099', '#CC3D00']`
- SVG `clip-path` polygon with unique asymmetric points per art slot

### Track preview
- Tap album art area → `previewIndex` state in Results
- Only one preview at a time — setting new index stops previous
- Preview state per track:
  - SVG circle progress ring animates around art (stroke-dashoffset, 30s CSS animation)
  - Irregular waveform SVG below track name, bars animate
- After 30s: preview auto-stops (clear via `setTimeout`)
- No actual audio

### Vibe Check bottom sheet
- Slides up 800ms after Results page mounts (single trigger, not on re-render)
- `BottomSheet` component: `translateY(100%)` → `translateY(0)`, 0.35s ease-out
- Top edge: irregular SVG wave path (not straight line), flat `#0F0F0F` background
- "HOW DID WE DO" — 13px tracked uppercase
- Three options: "PERFECT — CLOSE — MISS" on one line, 15px uppercase
- Tap option: underline appears, panel slides down, Toast fires
- Swipe down gesture: `useSwipe` hook `onSwipeDown` → dismiss
- Firestore write: `users/{uid}/vibeChecks` collection: `{ playlistId, rating: 'perfect'|'close'|'miss', timestamp }`

### Toast
- Slides in from top: `translateY(-100%)` → `translateY(0)`, 0.25s ease
- Flat `#FF4D00` background, "NOTED" 13px tracked uppercase `#080808` text
- Auto-dismiss after 2s: `translateY(-100%)`
- Renders in a portal at document root

---

## Feature 9 — Shuffle and Pin

### Files
- `src/pages/Results.jsx + Results.css` (update)
- `src/components/TrackCard.jsx + TrackCard.css` (update)

### Shuffle (RESHUFFLE)
- Toolbar between mood display and track list
- "RESHUFFLE" — 13px tracked uppercase, thin underline
- Tap: unpinned tracks animate `translateX(0)` → `translateX(-120%)` + `opacity: 0` (0.2s), then new tracks animate in from right `translateX(120%)` → `translateX(0)` (0.3s)
- Pinned tracks stay fixed, not re-ordered
- Generation stub returns new set of 8 tracks (shuffle the PLACEHOLDER_TRACKS array)

### Pin
- Long press any track row (600ms, uses `useLongPress` hook): "PIN" appears at right edge, 11px uppercase `--muted`
- Tap PIN: track gets thin `--coral` left border (3px), "PINNED" 10px `--coral` label, added to `pinnedIds` state
- Tap again (PINNED label): unpin
- Max 3 pins: if 4th attempted, fire Toast: "3 PINS MAXIMUM"
- `pinnedIds` is a `Set` in Results state

### Toolbar layout
```
[RESHUFFLE]                    [pin count label]
```

---

## Feature 10 — Collage View

### Files
- `src/components/CollageGrid.jsx + CollageGrid.css` (new)
- `src/pages/Saved.jsx + Saved.css` (update)

### Toggle
- "LIST — GRID" — plain text, 13px uppercase, top-right of Saved main
- Active view has underline, inactive is `--muted`

### Grid
- 3 columns, cells touch (no gap)
- Each cell: flat solid color unique to playlist vibe (same vibe color map as VibeCard)
- Playlist name overlaid: bottom-left, 11px uppercase `--white`
- Each cell uses a different `clip-path: polygon(...)` with asymmetric points to create fragmented collage look
- 9 polygon presets — cycle through them per cell
- Entrance animation: `scale(0.9)` → `scale(1)`, `delay = index * 60ms`
- Tap: navigate to Results with that playlist's mood

### Vibe color map (flat, no gradient)
```js
const VIBE_COLORS = {
  HYPE:        '#FF4D00',
  MELANCHOLIC: '#7B2FFF',
  FOCUS:       '#CCFF00',
  'LATE NIGHT':'#0D0D0D',
  HEARTBREAK:  '#7B2FFF',
  'ROAD TRIP': '#CC3D00',
  default:     '#2A2A2A',
}
```

---

## Generation Stub

Used everywhere generation is triggered. Returns consistent placeholder data.

```js
// src/utils/generatePlaylist.js (new)
const STUB_TRACKS = [
  { name: 'No Church in the Wild', artist: 'Jay-Z & Kanye West', duration: '4:32' },
  { name: 'Redbone',               artist: 'Childish Gambino',   duration: '5:26' },
  { name: 'Nights',                artist: 'Frank Ocean',        duration: '5:07' },
  { name: 'A$AP Forever',          artist: 'A$AP Rocky',        duration: '4:01' },
  { name: 'XO Tour Llif3',         artist: 'Lil Uzi Vert',      duration: '3:01' },
  { name: 'Numb Numb Juice',       artist: 'ScHoolboy Q',       duration: '3:48' },
  { name: 'PRIDE.',                artist: 'Kendrick Lamar',    duration: '4:36' },
  { name: 'Waves',                 artist: 'Frank Ocean',        duration: '1:03' },
]
export function generatePlaylist(params) {
  // params: { vibes?, mood?, energy?, valence?, source? }
  const shuffled = [...STUB_TRACKS].sort(() => Math.random() - 0.5)
  return shuffled
}
```

---

## New Hook Summary

### useBlend.js
- `selectedVibes`: string[] (max 3)
- `weights`: `{ [vibe]: number }` summing to 100
- `toggleVibe(vibe)`: add/remove, enforce max 3, initialize weight evenly
- `adjustWeight(vibe, delta)`: clamp 10–80, redistribute remainder
- `blendLabel`: computed string

### useMoodDial.js
- `position`: `{ x: number, y: number }` 0–100
- `isDragging`: bool
- `moodDescriptor`: string from quadrant mapping
- Touch handlers bound to canvas element

---

## Implementation Order

1. `index.css` — update variables and shared keyframes
2. `Waveform`, `Vinyl`, `Navbar` — updated shared components
3. `Toast`, `BottomSheet` — utility components (no dependencies)
4. `src/utils/generatePlaylist.js` — stub utility
5. `useBlend`, `useMoodDial` — hooks
6. `VibeCard` — updated (no emojis/gradients/flip)
7. `BlendOrb`, `MoodDial` — new interactive components
8. `RadarChart` — pure SVG chart
9. `MoodOfDay`, `VibeLeaderboard` — new Home components
10. `MoodTimeline`, `FavouritesMix`, `CollageGrid` — new Saved components
11. `TrackCard` — updated (preview, pin, flat art)
12. `Home.jsx + Home.css` — integrate all Home features
13. `Results.jsx + Results.css` — integrate all Results features
14. `Saved.jsx + Saved.css` — integrate all Saved features
15. `Profile.jsx + Profile.css` — full replacement
