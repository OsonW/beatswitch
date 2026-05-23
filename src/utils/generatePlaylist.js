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
