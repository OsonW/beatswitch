import { describe, it, expect } from 'vitest'
import { firstName, pickGreeting } from './greeting'

describe('firstName', () => {
  it('returns the first word of a display name', () => {
    expect(firstName({ displayName: 'Oson Wang' })).toBe('Oson')
  })
  it('falls back to "stranger" when there is no display name', () => {
    expect(firstName({ isAnonymous: true })).toBe('stranger')
    expect(firstName(null)).toBe('stranger')
  })
})

describe('pickGreeting', () => {
  it('interpolates the name into the chosen template', () => {
    expect(pickGreeting('Oson', () => 0)).toBe('Yo, Oson')
  })
  it('uses rand to pick the template and still includes the name', () => {
    expect(pickGreeting('Oson', () => 0.99)).toContain('Oson')
  })
})
