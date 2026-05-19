import './Vinyl.css'

export default function Vinyl({ size = 'medium', active = false }) {
  return (
    <div className={`vinyl vinyl--${size}${active ? ' vinyl--active' : ''}`}>
      <div className="vinyl__disc">
        <div className="vinyl__grooves" />
        <div className="vinyl__label">BS</div>
      </div>
    </div>
  )
}
