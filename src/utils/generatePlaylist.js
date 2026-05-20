// src/utils/generatePlaylist.js
const STUB_TRACKS = [
  { name: 'No Church in the Wild', artist: 'Jay-Z & Kanye West', duration: '4:32' },
  { name: 'Redbone',               artist: 'Childish Gambino',   duration: '5:26' },
  { name: 'Nights',                artist: 'Frank Ocean',        duration: '5:07' },
  { name: 'A$AP Forever',          artist: 'A$AP Rocky',         duration: '4:01' },
  { name: 'XO Tour Llif3',         artist: 'Lil Uzi Vert',       duration: '3:01' },
  { name: 'Numb Numb Juice',       artist: 'ScHoolboy Q',        duration: '3:48' },
  { name: 'PRIDE.',                artist: 'Kendrick Lamar',     duration: '4:36' },
  { name: 'Waves',                 artist: 'Frank Ocean',        duration: '1:03' },
  { name: 'Bad and Boujee',        artist: 'Migos',              duration: '5:43' },
  { name: 'Ivy',                   artist: 'Frank Ocean',        duration: '4:10' },
  { name: 'DNA.',                  artist: 'Kendrick Lamar',     duration: '3:05' },
  { name: 'Slide',                 artist: 'Calvin Harris',      duration: '3:53' },
]

export function generatePlaylist(params = {}) {
  const shuffled = [...STUB_TRACKS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 8)
}
