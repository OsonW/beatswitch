import { useState, useEffect } from 'react'

export function useMouseTilt(ref) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rotateY = ((e.clientX - cx) / (rect.width / 2)) * 15
      const rotateX = -((e.clientY - cy) / (rect.height / 2)) * 15
      setTilt({ rotateX, rotateY })
    }

    const onLeave = () => setTilt({ rotateX: 0, rotateY: 0 })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, []) // ref object is stable — effect runs once on mount

  return tilt
}
