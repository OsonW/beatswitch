import { describe, it, expect, beforeEach } from 'vitest'
import { isTokenExpired, saveTokens, getStoredTokens } from './auth'

describe('isTokenExpired', () => {
  it('is true when expiry is in the past', () => {
    expect(isTokenExpired(1000, 2000)).toBe(true)
  })
  it('is false when expiry is comfortably in the future', () => {
    expect(isTokenExpired(100000, 2000)).toBe(false)
  })
  it('treats the final 60s safety window as expired', () => {
    // 30s of life left (< 60s buffer)
    expect(isTokenExpired(1_030_000, 1_000_000)).toBe(true)
  })
})

describe('token storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips tokens and computes expires_at', () => {
    saveTokens({ access_token: 'a', refresh_token: 'r', expires_in: 3600 }, 1000)
    const t = getStoredTokens()
    expect(t.access_token).toBe('a')
    expect(t.refresh_token).toBe('r')
    expect(t.expires_at).toBe(1000 + 3600 * 1000)
  })

  it('preserves an existing refresh token when a refresh response omits it', () => {
    saveTokens({ access_token: 'a', refresh_token: 'r', expires_in: 3600 }, 1000)
    saveTokens({ access_token: 'a2', expires_in: 3600 }, 5000)
    expect(getStoredTokens().refresh_token).toBe('r')
    expect(getStoredTokens().access_token).toBe('a2')
  })
})
