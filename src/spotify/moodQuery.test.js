import { describe, it, expect } from 'vitest'
import { moodQuery } from './moodQuery'

describe('moodQuery', () => {
  it('uses free text directly in describe mode', () => {
    expect(moodQuery({ mood: 'rainy sunday' })).toEqual(['rainy sunday'])
  })

  it('builds one genre query per selected vibe in blend mode', () => {
    const q = moodQuery({ vibes: [{ name: 'HYPE', weight: 50 }, { name: 'FOCUS', weight: 50 }] })
    expect(q).toHaveLength(2)
    expect(q[0]).toContain('genre:')
  })

  it('maps high energy + high valence to upbeat keywords in dial mode', () => {
    const q = moodQuery({ energy: 90, valence: 90 })
    expect(q[0]).toMatch(/upbeat|high energy|happy/)
  })

  it('maps low energy + low valence to chill/moody keywords in dial mode', () => {
    const q = moodQuery({ energy: 10, valence: 10 })
    expect(q[0]).toMatch(/chill|moody|sad/)
  })

  it('falls back to a default query when nothing matches', () => {
    expect(moodQuery({})).toEqual(['genre:pop'])
  })

  it('appends a seed genre when one is provided', () => {
    expect(moodQuery({ mood: 'chill' }, { genres: ['lo-fi'] })[0]).toContain('lo-fi')
  })
})
