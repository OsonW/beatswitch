// src/components/BottomSheet.jsx
import { useSwipe } from '../hooks/useSwipe'
import './BottomSheet.css'

export default function BottomSheet({ visible, onDismiss, children }) {
  const swipe = useSwipe({ onSwipeDown: onDismiss })

  return (
    <div
      className={`bottom-sheet${visible ? ' bottom-sheet--visible' : ''}`}
      {...swipe}
    >
      <svg className="bottom-sheet__wave" viewBox="0 0 390 24" preserveAspectRatio="none">
        <path
          d="M0 24 C60 8, 120 20, 195 12 C270 4, 330 18, 390 10 L390 24 Z"
          fill="#0F0F0F"
        />
      </svg>
      <div className="bottom-sheet__body">
        {children}
      </div>
    </div>
  )
}
