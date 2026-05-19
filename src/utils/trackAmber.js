export const trackAmber = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  e.currentTarget.style.setProperty('--bx', `${x}%`)
  e.currentTarget.style.setProperty('--by', `${y}%`)
}
