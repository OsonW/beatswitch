import { useEffect, useRef, useState } from 'react'
import './Cursor.css'

export default function Cursor() {
  const dotRef = useRef(null)
  const followerRef = useRef(null)
  const mouse = useRef({ x: -100, y: -100 })
  const follower = useRef({ x: -100, y: -100 })
  const rafId = useRef(null)
  const isHoverRef = useRef(false)
  const isAmberRef = useRef(false)
  const [isHover, setIsHover] = useState(false)
  const [isAmber, setIsAmber] = useState(false)

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
      const target = e.target
      const newHover = !!target.closest('[data-cursor-hover]')
      const newAmber = !!target.closest('[data-cursor-amber]')
      if (newHover !== isHoverRef.current) {
        isHoverRef.current = newHover
        setIsHover(newHover)
      }
      if (newAmber !== isAmberRef.current) {
        isAmberRef.current = newAmber
        setIsAmber(newAmber)
      }
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const tick = () => {
      follower.current.x += (mouse.current.x - follower.current.x) * 0.1
      follower.current.y += (mouse.current.y - follower.current.y) * 0.1
      if (followerRef.current) {
        followerRef.current.style.left = `${follower.current.x}px`
        followerRef.current.style.top = `${follower.current.y}px`
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot${isAmber ? ' cursor-dot--amber' : ''}`}
      />
      <div
        ref={followerRef}
        className={`cursor-follower${isHover ? ' cursor-follower--hover' : ''}`}
      />
    </>
  )
}
