// src/music/deezer.js
// Anonymous Deezer search. Deezer's REST API has no CORS for browsers,
// so we use JSONP (its supported `output=jsonp&callback=` mode).

const SEARCH_ENDPOINT = 'https://api.deezer.com/search'
const TIMEOUT_MS = 8000

export function buildSearchUrl(query, limit = 10, callbackName = 'cb') {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    output: 'jsonp',
    callback: callbackName,
  })
  return `${SEARCH_ENDPOINT}?${params.toString()}`
}

export function searchTracks(query, limit = 10) {
  return new Promise((resolve, reject) => {
    const callbackName = `__deezerCb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
    const script = document.createElement('script')
    let timer

    function cleanup() {
      clearTimeout(timer)
      delete window[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    window[callbackName] = (payload) => {
      cleanup()
      resolve(payload?.data ?? [])
    }

    script.onerror = () => { cleanup(); reject(new Error('Deezer request failed')) }
    timer = setTimeout(() => { cleanup(); reject(new Error('Deezer request timed out')) }, TIMEOUT_MS)

    script.src = buildSearchUrl(query, limit, callbackName)
    document.head.appendChild(script)
  })
}
