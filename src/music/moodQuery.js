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
  const { mood, vibes, energy, valence, artists } = params
  const queries = []

  if (Array.isArray(artists) && artists.length) {
    return artists.map(a => `${a}`.trim()).filter(Boolean)
  }

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
