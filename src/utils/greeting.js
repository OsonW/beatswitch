// src/utils/greeting.js
const GREETINGS = [
  'Yo, {name}',
  'Great day, {name}',
  "What's good, {name}",
  'Back again, {name}',
  "Let's go, {name}",
  'Hey {name}',
]

export function firstName(user) {
  const dn = user?.displayName?.trim()
  if (dn) return dn.split(/\s+/)[0]
  return 'stranger'
}

export function pickGreeting(name, rand = Math.random) {
  const template = GREETINGS[Math.floor(rand() * GREETINGS.length)]
  return template.replace('{name}', name)
}
