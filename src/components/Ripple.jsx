import { useRef } from 'react'
import { useRipple } from '../hooks/useRipple'
import './Ripple.css'

export default function Ripple({ children, className = '', onClick, disabled, ...props }) {
  const ref = useRef(null)
  const triggerRipple = useRipple(ref)

  const handleInteraction = (e) => {
    if (!disabled) {
      triggerRipple(e)
      onClick?.(e)
    }
  }

  return (
    <button
      ref={ref}
      className={`ripple-host ripple-btn ${className}`}
      onTouchEnd={handleInteraction}
      onClick={handleInteraction}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
