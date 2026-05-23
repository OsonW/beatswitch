import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./auth', () => ({
  getValidToken: vi.fn(),
  refreshToken: vi.fn(),
}))

import { getValidToken, refreshToken } from './auth'
import { spotifyFetch } from './client'

beforeEach(() => {
  vi.clearAllMocks()
  getValidToken.mockResolvedValue('tok')
})

describe('spotifyFetch', () => {
  it('returns parsed JSON on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, json: async () => ({ id: 'me' }),
    })
    await expect(spotifyFetch('/me')).resolves.toEqual({ id: 'me' })
    expect(globalThis.fetch).toHaveBeenCalledOnce()
  })

  it('refreshes once and retries on 401', async () => {
    refreshToken.mockResolvedValueOnce('fresh')
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 'me' }) })
    await expect(spotifyFetch('/me')).resolves.toEqual({ id: 'me' })
    expect(refreshToken).toHaveBeenCalledOnce()
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('throws a 403 error without retrying', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 403, json: async () => ({}), headers: { get: () => null },
    })
    await expect(spotifyFetch('/me')).rejects.toMatchObject({ status: 403 })
    expect(refreshToken).not.toHaveBeenCalled()
  })
})
