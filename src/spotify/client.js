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
