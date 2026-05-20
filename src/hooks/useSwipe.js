// src/hooks/useSwipe.js
import { useRef, useCallback } from 'react'

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeDown, threshold = 50 } = {}) {
  const startX = useRef(null)
  const startY = useRef(null)

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    startX.current = null
    startY.current = null
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy > threshold) onSwipeDown?.()
    } else {
      if (dx < -threshold) onSwipeLeft?.()
      else if (dx > threshold) onSwipeRight?.()
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeDown, threshold])

  return { onTouchStart, onTouchEnd }
}
