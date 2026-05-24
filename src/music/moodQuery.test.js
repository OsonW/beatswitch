import { describe, it, expect } from 'vitest'
import { moodQuery } from './moodQuery'

describe('moodQuery', () => {
  it('uses free text directly in describe mode', () => {
    expect(moodQuery({ mood: 'rainy sunday' })).toEqual(['rainy sunday'])
  })

  it('maps each vibe to a plain keyword phrase in blend mode (no genre: syntax)', () => {
    const q = moodQuery({ vibes: [{ name: 'HYPE', weight: 50 }, { name: 'FOCUS', weight: 50 }] })
    expect(q).toHaveLength(2)
    expect(q.join(' ')).not.toContain('genre:')
  })

  it('maps high energy + valence to upbeat keywords in dial mode', () => {
    expect(moodQuery({ energy: 90, valence: 90 })[0]).toMatch(/upbeat|high energy|happy/)
  })

  it('maps low energy + valence to chill/moody keywords', () => {
    expect(moodQuery({ energy: 10, valence: 10 })[0]).toMatch(/chill|moody|sad/)
  })

  it('falls back to a default query when nothing matches', () => {
    expect(moodQuery({})).toEqual(['top hits'])
  })

  it('returns one query per artist when artists are provided (highest priority)', () => {
    const q = moodQuery({ artists: ['Drake', 'SZA'], mood: 'chill', vibes: [{ name: 'HYPE' }] })
    expect(q).toEqual(['Drake', 'SZA'])
  })

  it('ignores an empty artists array and falls through to mood', () => {
    expect(moodQuery({ artists: [], mood: 'chill' })).toEqual(['chill'])
  })
})
