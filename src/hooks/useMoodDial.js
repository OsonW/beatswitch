// src/hooks/useMoodDial.js
import { useState, useCallback, useMemo } from 'react'

const DESCRIPTORS = {
  topRight:    'euphoric, high voltage',
  topLeft:     'warm, expansive',
  bottomRight: 'brooding, high voltage',
  bottomLeft:  'hollow, drifting',
  center:      'balanced, undefined',
}

function getDescriptor(x, y) {
  const cx = x - 50, cy = y - 50
  if (Math.abs(cx) < 15 && Math.abs(cy) < 15) return DESCRIPTORS.center
  const isTop   = cy > 0
  const isRight = cx > 0
  if (isTop   && isRight) return DESCRIPTORS.topRight
  if (isTop   && !isRight) return DESCRIPTORS.topLeft
  if (!isTop  && isRight) return DESCRIPTORS.bottomRight
  return DESCRIPTORS.bottomLeft
}

export function useMoodDial(canvasSize = 300) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)

  const updateFromTouch = useCallback((e, ref) => {
    if (!ref?.current) return
    const rect = ref.current.getBoundingClientRect()
    const rawX = e.touches[0].clientX - rect.left
    const rawY = e.touches[0].clientY - rect.top
    const x = Math.round(Math.max(0, Math.min(canvasSize, rawX)) / canvasSize * 100)
    const y = Math.round(100 - Math.max(0, Math.min(canvasSize, rawY)) / canvasSize * 100)
    setPosition({ x, y })
  }, [canvasSize])

  const handleTouchStart = useCallback((e, ref) => {
    setIsDragging(true)
    updateFromTouch(e, ref)
  }, [updateFromTouch])

  const handleTouchMove = useCallback((e, ref) => {
    e.preventDefault()
    updateFromTouch(e, ref)
  }, [updateFromTouch])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const moodDescriptor = useMemo(() => getDescriptor(position.x, position.y), [position])

  return { position, isDragging, moodDescriptor, handleTouchStart, handleTouchMove, handleTouchEnd }
}
