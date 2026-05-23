import { useCallback } from 'react'

export function useRipple(ref) {
  return useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const touch = e.changedTouches?.[0] ?? e
    const x = (touch.clientX - rect.left)
    const y = (touch.clientY - rect.top)
    const span = document.createElement('span')
    span.className = 'ripple-circle'
    span.style.left = `${x}px`
    span.style.top = `${y}px`
    el.appendChild(span)
    span.addEventListener('animationend', () => span.remove(), { once: true })
  }, [ref])
}
