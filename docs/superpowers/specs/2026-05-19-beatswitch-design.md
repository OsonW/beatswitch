# Beatswitch — Full App Structure Design

**Date:** 2026-05-19  
**Status:** Approved

---

## Overview

Beatswitch is a music mood web app with an editorial fashion aesthetic — stark, high-end, alive. The visual direction is Loewe / A-COLD-WALL campaign sites: asymmetric layouts, extreme typography, deliberate whitespace, sharp edges, aggressive cursor interactions.

---

## Tech Stack

- React 19 + Vite
- Firebase (auth + Firestore) — `firebase.js` already exists, exports `auth` and `db`
- React Router v6 — must be installed (`npm install react-router-dom`)
- Pure CSS — no Tailwind, no component libraries

---

## Design Language

| Token | Value |
|---|---|
| Background | `#080808` |
| Foreground | `#FFFFFF` |
| Accent | `#F5A623` (violent amber) |
| Headline font | `system-ui`, 80–120px, `letter-spacing: -0.05em`, uppercase |
| Body font | `system-ui`, 12–13px, `letter-spacing: 0.15em`, uppercase |
| Border radius | 0 (never more than 2px) |
| Borders | 1px solid white or amber — used as layout dividers |

Layout is asymmetric and intentional. Text bleeds off edges. Elements overlap. Nothing is centered unless deliberate. Whitespace swings between aggressive emptiness and sudden density.

---

## Auth

| Button | Action |
|---|---|
| ENTER WITH SPOTIFY | `signInWithPopup(new GoogleAuthProvider())` — swap in Spotify SDK later |
| CONTINUE AS GUEST | `signInAnonymously()` |

Auth state is managed via `onAuthStateChanged` in `App.jsx`. While resolving, a full-screen loading splash shows "BS" in massive fading type. After resolution: unauthenticated → `/login`, authenticated → `/home` (redirect away from `/login` if already logged in).

---

## Routing

```
/ → redirects to /home or /login based on auth state
/login → public; redirects to /home if already logged in
/home → protected
/results → protected
/saved → protected
```

A `ProtectedRoute` component wraps authenticated pages. It renders children if `user` is set, otherwise redirects to `/login`.

---

## File Structure

```
src/
  firebase.js          (exists — exports auth, db)
  main.jsx             (update: add BrowserRouter)
  App.jsx              (replace: auth state + routing)
  index.css            (replace: global resets, cursor: none, CSS vars)
  hooks/
    useCursor.js       (global mousemove → {x, y})
    useMouseTilt.js    (ref → {rotateX, rotateY} ±15deg)
  pages/
    Login.jsx + Login.css
    Home.jsx + Home.css
    Results.jsx + Results.css
    Saved.jsx + Saved.css
  components/
    Cursor.jsx + Cursor.css
    VibeCard.jsx + VibeCard.css
    TrackCard.jsx + TrackCard.css
    Navbar.jsx + Navbar.css
```

---

## Cursor System

### `useCursor.js`
Single `mousemove` listener on `document`. Returns `{ x, y }` as pixel coordinates. Used by `Cursor.jsx` and any component needing raw cursor position.

### `useMouseTilt.js`
Accepts a React `ref`. On each `mousemove` over the element, calculates offset from element center and maps to `rotateX` / `rotateY` in the range `[-15, 15]` degrees. Returns `{ rotateX, rotateY }`.

### `Cursor.jsx`
Two fixed-position divs, `pointer-events: none`, `z-index: 9999`.

- **Dot**: 8px × 8px, `background: #FFFFFF`, instantly follows cursor
- **Follower**: 40px × 40px, `border: 1px solid #FFFFFF`, `border-radius: 50%`, lerp at factor 0.1 via `requestAnimationFrame`

Hoverable elements add class `.cursor-hover`. When follower target has `.cursor-hover`:
- Follower scales to 80px × 80px
- `mix-blend-mode: difference`

Dot turns amber (`#F5A623`) when over amber elements (class `.cursor-amber`).

`body` has `cursor: none` via `index.css`.

---

## Cursor Interactions (per-component)

| Component | Interaction |
|---|---|
| Login headline "BEATSWITCH" | Letters shift `translateY` based on cursor Y proximity — JS inline transforms |
| VibeCard | 3D tilt via `useMouseTilt` — `perspective(800px) rotateX() rotateY()` |
| Buttons | Amber fill chases cursor — `radial-gradient` reposition on `mousemove` |
| Navbar links | Text split on hover — CSS `clip-path` reveals duplicate text sliding in from below |
| TrackCard | Subtle parallax — inner content shifts opposite cursor direction on hover |

---

## Pages

### Login (`/login`)

- Full `#080808` background
- "BEATSWITCH" — 100px+, top-left, bleeds right edge, letters react to cursor Y
- Tagline — 12px tracked uppercase: "MUSIC THAT READS YOUR MOOD"
- 1px white horizontal rule at ~40% from top
- Below rule, left-aligned:
  - "ENTER WITH SPOTIFY" — amber filled, black text, 0 border-radius
  - "CONTINUE AS GUEST" — no fill, 1px white border
- Bottom-right: three feature lines in 11px right-aligned text

### Home (`/home`)

- Top bar: "BS" far left, 1px bottom border, profile initial far right
- Hero: "WHAT ARE YOU FEELING?" — 60px
- Bare text input — 1px bottom border only (underline style), 24px white text
- "GENERATE" button — amber, sharp, full width of input
- 1px divider with "OR CHOOSE A VIBE" tiny text centered on line
- Horizontal scroll row of `VibeCard` components
- Bottom `Navbar`

### Results (`/results`)

- Back arrow "←" top-left
- Mood query displayed in amber italic, 32px
- "— GENERATED FOR YOU —" in tiny tracked uppercase
- Full-width `TrackCard` list separated by 1px lines (no backgrounds)
- "SAVE PLAYLIST" (amber filled) + "EXPORT TO SPOTIFY" (outlined) — side by side

### Saved (`/saved`)

- "SAVED" in massive type — faded watermark background
- Playlist rows separated by 1px lines: name left, date center, track count right
- Click row to expand and show tracks inline
- Empty state: "NO SAVED PLAYLISTS YET" tiny tracked text, amber line above and below

---

## Components

### `VibeCard`

~140×180px, sharp rectangle, 1px white border, black fill.  
- Emoji at top (32px)  
- Vibe name in tiny tracked uppercase at bottom  
- `useMouseTilt` hook for 3D perspective tilt  
- Hover: border → amber, `box-shadow: 0 0 20px rgba(245,166,35,0.4)`

### `TrackCard`

Full-width row on black, separated by 1px lines.  
- Track number far left  
- Song name large, artist small below  
- Duration far right  
- Hover: entire row shifts right 8px (CSS transition), amber left-edge accent appears

### `Navbar`

Fixed bottom, full width, `#080808`, 1px top border white.  
- Items: HOME, SAVED, PROFILE — 11px tracked uppercase, no icons  
- Active: amber text + thin amber `border-top`  
- Hover: text slides up 2px, duplicate text slides in from below via `clip-path`

---

## Data Shape (Firestore)

```
users/{uid}/playlists/{playlistId}
  name: string
  mood: string
  createdAt: timestamp
  tracks: [{ title: string, artist: string, duration: string }]
```

Saved page reads from `users/{uid}/playlists`. Save action on Results page writes to this path. No Spotify API calls in this phase — all track data is placeholder.

---

## Placeholder Content

All pages ship with hardcoded placeholder data:

- **Vibes**: Melancholic, Euphoric, Rage, Tender, Numb, Wired (with emojis)
- **Tracks**: 5 placeholder track objects (title, artist, duration)
- **Saved playlists**: 2 placeholder entries in the empty state bypass

No external API calls. `GENERATE` button on Home navigates to `/results` with the mood query via React Router `state`.

---

## What Is NOT in Scope

- Real Spotify API integration
- Real music generation / recommendation engine
- Full user profile page (PROFILE navbar item navigates to `/profile` which shows a minimal page: uid truncated, display name if available, and a "SIGN OUT" amber button that calls `auth.signOut()`)
- Push notifications
- Mobile breakpoints (desktop-first; mobile can be addressed later)
