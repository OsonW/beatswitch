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
