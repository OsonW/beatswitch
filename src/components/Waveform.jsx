import './Waveform.css'

export default function Waveform({ color, speed = 'fast', bars = 5 }) {
  return (
    <div
      className={`waveform waveform--${speed}`}
      style={color ? { '--wf-color': color } : undefined}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="waveform__bar" style={{ '--i': i }} />
      ))}
    </div>
  )
}
