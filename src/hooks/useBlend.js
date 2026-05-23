// src/hooks/useBlend.js
import { useState, useCallback, useMemo } from 'react'

function evenWeights(vibes) {
  if (vibes.length === 0) return {}
  const share = Math.floor(100 / vibes.length)
  const rem   = 100 - share * vibes.length
  const result = {}
  vibes.forEach((v, i) => { result[v] = share + (i === 0 ? rem : 0) })
  return result
}

export function useBlend() {
  const [selectedVibes, setSelectedVibes] = useState([])
  const [weights, setWeights]             = useState({})

  const toggleVibe = useCallback((vibe) => {
    setSelectedVibes(prev => {
      let next
      if (prev.includes(vibe)) {
        next = prev.filter(v => v !== vibe)
      } else {
        if (prev.length >= 3) return prev
        next = [...prev, vibe]
      }
      setWeights(evenWeights(next))
      return next
    })
  }, [])

  const adjustWeight = useCallback((targetVibe, newWeight) => {
    setSelectedVibes(prev => {
      const others = prev.filter(v => v !== targetVibe)
      if (others.length === 0) return prev
      setWeights(prevW => {
        const clamped   = Math.max(10, Math.min(80, Math.round(newWeight)))
        const remainder = 100 - clamped
        const totalOthers = others.reduce((sum, v) => sum + (prevW[v] || 0), 0)
        const nw = { ...prevW, [targetVibe]: clamped }
        others.forEach(v => {
          nw[v] = totalOthers > 0
            ? Math.round((prevW[v] / totalOthers) * remainder)
            : Math.round(remainder / others.length)
        })
        const total = Object.values(nw).reduce((a, b) => a + b, 0)
        if (total !== 100 && others[0]) nw[others[0]] += (100 - total)
        return nw
      })
      return prev
    })
  }, [])

  const blendLabel = useMemo(() => {
    if (selectedVibes.length < 2) return ''
    return selectedVibes.map(v => `${v} ${weights[v] ?? 0}`).join(' — ')
  }, [selectedVibes, weights])

  return { selectedVibes, weights, toggleVibe, adjustWeight, blendLabel }
}
