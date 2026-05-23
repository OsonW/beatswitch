// src/spotify/auth.js
// Spotify Authorization Code + PKCE, fully client-side.

const CLIENT_ID    = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private'
const AUTH_URL  = 'https://accounts.spotify.com/authorize'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'

export const TOKEN_KEY  = 'beatswitch.spotify.tokens'
const VERIFIER_KEY      = 'beatswitch.spotify.verifier'
const EXPIRY_BUFFER_MS  = 60_000

// --- token storage / expiry (pure-ish, unit tested) ---

export function isTokenExpired(expiresAt, now = Date.now()) {
  return now >= expiresAt - EXPIRY_BUFFER_MS
}

export function getStoredTokens() {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function saveTokens(tokenResponse, now = Date.now()) {
  const existing = getStoredTokens()
  const tokens = {
    access_token:  tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token ?? existing?.refresh_token ?? null,
    expires_at:    now + tokenResponse.expires_in * 1000,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
  return tokens
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

// --- PKCE helpers ---

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateCodeVerifier() {
  const arr = new Uint8Array(64)
  crypto.getRandomValues(arr)
  return base64url(arr)
}

export async function generateCodeChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64url(digest)
}

// --- flow ---

export async function beginLogin() {
  const verifier = generateCodeVerifier()
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const challenge = await generateCodeChallenge(verifier)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  })
  window.location.assign(`${AUTH_URL}?${params.toString()}`)
}

export async function handleCallback() {
  const code = new URLSearchParams(window.location.search).get('code')
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  if (!code || !verifier) throw new Error('Missing authorization code or verifier')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  saveTokens(await res.json())
  sessionStorage.removeItem(VERIFIER_KEY)
}

export async function refreshToken() {
  const tokens = getStoredTokens()
  if (!tokens?.refresh_token) throw new Error('No refresh token')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
    }),
  })
  if (!res.ok) { logout(); throw new Error('Token refresh failed') }
  return saveTokens(await res.json()).access_token
}

export async function getValidToken() {
  const tokens = getStoredTokens()
  if (!tokens) throw new Error('Not authenticated with Spotify')
  if (isTokenExpired(tokens.expires_at)) return refreshToken()
  return tokens.access_token
}
