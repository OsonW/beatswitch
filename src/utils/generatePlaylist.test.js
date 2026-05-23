import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../spotify/auth', () => ({ getStoredTokens: vi.fn() }))
vi.mock('../spotify/client', () => ({ getTopArtists: vi.fn(), searchTracks: vi.fn() }))

import { getStoredTokens } from '../spotify/auth'
import { getTopArtists, searchTracks } from '../spotify/client'
import { generatePlaylist } from './generatePlaylist'

beforeEach(() => vi.clearAllMocks())

describe('generatePlaylist', () => {
  it('returns stub tracks when not connected to Spotify', async () => {
    getStoredTokens.mockReturnValue(null)
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks[0]).toHaveProperty('name')
    expect(searchTracks).not.toHaveBeenCalled()
  })

  it('maps Spotify search results when connected', async () => {
    getStoredTokens.mockReturnValue({ access_token: 'a' })
    getTopArtists.mockResolvedValue({ items: [{ genres: ['lo-fi'] }] })
    searchTracks.mockResolvedValue({ tracks: { items: [
      { id: '1', uri: 'spotify:track:1', name: 'Song', duration_ms: 200000, artists: [{ name: 'Artist' }] },
    ] } })
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks[0]).toMatchObject({ name: 'Song', artist: 'Artist', uri: 'spotify:track:1' })
    expect(tracks[0].duration).toBe('3:20')
  })

  it('falls back to stub when search yields nothing', async () => {
    getStoredTokens.mockReturnValue({ access_token: 'a' })
    getTopArtists.mockResolvedValue({ items: [] })
    searchTracks.mockResolvedValue({ tracks: { items: [] } })
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks[0]).toHaveProperty('artist')
  })
})
