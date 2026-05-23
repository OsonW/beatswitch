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
