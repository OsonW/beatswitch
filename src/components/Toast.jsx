// src/components/Toast.jsx
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

export default function Toast({ message, onDone }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!message) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onDone?.(), 2200)
    return () => clearTimeout(timerRef.current)
  }, [message, onDone])

  if (!message) return null

  return createPortal(
    <div className="toast">{message}</div>,
    document.body
  )
}
