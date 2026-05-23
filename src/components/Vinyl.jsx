import './Vinyl.css'

export default function Vinyl({ size = 'medium', active = false }) {
  const dim = size === 'small' ? 64 : size === 'large' ? 120 : 88
  return (
    <div className={`vinyl vinyl--${size}${active ? ' vinyl--active' : ''}`}>
      <svg width={dim} height={dim} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="39" fill="#0D0D0D" />
        <circle cx="40" cy="40" r="35" fill="none" stroke="#1A1A1A" strokeWidth="0.6" />
        <circle cx="40" cy="40" r="31" fill="none" stroke="#1A1A1A" strokeWidth="0.4" />
        <circle cx="40" cy="40" r="26" fill="none" stroke="#1A1A1A" strokeWidth="0.7" />
        <circle cx="40" cy="40" r="21" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="17" fill="none" stroke="#1A1A1A" strokeWidth="0.4" />
        <circle cx="40" cy="40" r="13" fill="none" stroke="#1A1A1A" strokeWidth="0.6" />
        <ellipse cx="41" cy="39" rx="7.5" ry="7.5" fill="#FF4D00" />
        <text
          x="41" y="42"
          textAnchor="middle"
          fontSize="4.5"
          fill="#080808"
          fontWeight="900"
          fontFamily="system-ui"
          letterSpacing="-0.5"
        >
          BS
        </text>
      </svg>
    </div>
  )
}
