import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../music/deezer', () => ({ searchTracks: vi.fn() }))

import { searchTracks } from '../music/deezer'
import { generatePlaylist } from './generatePlaylist'

beforeEach(() => vi.clearAllMocks())

describe('generatePlaylist', () => {
  it('maps Deezer results to the app track shape', async () => {
    searchTracks.mockResolvedValue([
      { id: 1, title: 'Song', duration: 200, preview: 'http://p/1.mp3', artist: { name: 'Artist' } },
    ])
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks[0]).toMatchObject({ name: 'Song', artist: 'Artist', previewUrl: 'http://p/1.mp3' })
    expect(tracks[0].duration).toBe('3:20')
  })

  it('dedupes by track id', async () => {
    searchTracks.mockResolvedValue([
      { id: 1, title: 'A', duration: 60, preview: 'x', artist: { name: 'Z' } },
      { id: 1, title: 'A', duration: 60, preview: 'x', artist: { name: 'Z' } },
    ])
    expect(await generatePlaylist({ mood: 'x' })).toHaveLength(1)
  })

  it('falls back to stub tracks when search yields nothing', async () => {
    searchTracks.mockResolvedValue([])
    const tracks = await generatePlaylist({ mood: 'chill' })
    expect(tracks.length).toBeGreaterThan(0)
    expect(tracks[0]).toHaveProperty('name')
  })

  it('falls back to stub when search throws', async () => {
    searchTracks.mockRejectedValue(new Error('network'))
    expect((await generatePlaylist({ mood: 'chill' })).length).toBeGreaterThan(0)
  })
})
