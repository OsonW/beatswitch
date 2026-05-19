import { useRef, useCallback } from 'react'

export function useLongPress(callback, duration = 600) {
  const timer = useRef(null)

  const start = useCallback((e) => {
    e.preventDefault()
    timer.current = setTimeout(() => callback(e), duration)
  }, [callback, duration])

  const cancel = useCallback(() => {
    clearTimeout(timer.current)
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
  }
}
