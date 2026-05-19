import { useState, useEffect } from 'react'

// Available for components needing cursor position in non-performance-critical contexts.
// The Cursor component itself uses refs + rAF directly to avoid per-pixel React state updates.
export function useCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })

  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY })
    document.addEventListener('mousemove', handler, { passive: true })
    return () => document.removeEventListener('mousemove', handler)
  }, [])

  return pos
}
