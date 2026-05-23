import { describe, it, expect } from 'vitest'
import { buildSearchUrl } from './deezer'

describe('buildSearchUrl', () => {
  it('targets the Deezer search endpoint with jsonp output and callback', () => {
    const url = buildSearchUrl('chill', 10, 'cb1')
    expect(url).toContain('https://api.deezer.com/search')
    expect(url).toContain('output=jsonp')
    expect(url).toContain('callback=cb1')
    expect(url).toContain('limit=10')
  })

  it('url-encodes the query', () => {
    expect(buildSearchUrl('high energy upbeat', 5, 'cb')).toContain('q=high+energy+upbeat')
  })
})
