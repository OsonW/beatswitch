// src/hooks/useBlend.js
import { useState, useCallback, useMemo } from 'react'

export function useBlend() {
  const [selectedVibes, setSelectedVibes] = useState([])
  const [weights, setWeights] = useState({})

  const toggleVibe = useCallback((vibe) => {
    setSelectedVibes(prev => {
      if (prev.includes(vibe)) {
        const next = prev.filter(v => v !== vibe)
        setWeights(w => {
          const nw = { ...w }
          delete nw[vibe]
          if (next.length > 0) {
            const share = Math.floor(100 / next.length)
            const rem = 100 - share * next.length
            next.forEach((v, i) => { nw[v] = share + (i === 0 ? rem : 0) })
          }
          return nw
        })
        return next
      }
      if (prev.length >= 3) return prev
      const next = [...prev, vibe]
      setWeights(() => {
        const share = Math.floor(100 / next.length)
        const rem = 100 - share * next.length
        const nw = {}
        next.forEach((v, i) => { nw[v] = share + (i === 0 ? rem : 0) })
        return nw
      })
      return next
    })
  }, [])

  const adjustWeight = useCallback((targetVibe, newWeight) => {
    setSelectedVibes(prev => {
      const others = prev.filter(v => v !== targetVibe)
      if (others.length === 0) return prev
      const clamped = Math.max(10, Math.min(80, Math.round(newWeight)))
      const remainder = 100 - clamped
      const totalOthers = others.reduce((sum, v) => sum + (weights[v] || 0), 0)
      const nw = { ...weights, [targetVibe]: clamped }
      others.forEach(v => {
        nw[v] = totalOthers > 0
          ? Math.round((weights[v] / totalOthers) * remainder)
          : Math.round(remainder / others.length)
      })
      const total = Object.values(nw).reduce((a, b) => a + b, 0)
      if (total !== 100 && others[0]) nw[others[0]] += (100 - total)
      setWeights(nw)
      return prev
    })
  }, [weights])

  const blendLabel = useMemo(() => {
    if (selectedVibes.length < 2) return ''
    return selectedVibes
      .map(v => `${v} ${weights[v] ?? 0}`)
      .join(' — ')
  }, [selectedVibes, weights])

  return { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel }
}
