import './BlendOrb.css'

const VIBE_COLORS = {
  HYPE:         '#FF4D00',
  MELANCHOLIC:  '#7B2FFF',
  FOCUS:        '#CCFF00',
  'LATE NIGHT': '#333333',
  HEARTBREAK:   '#3D0099',
  'ROAD TRIP':  '#CC3D00',
}

export default function BlendOrb({ selectedVibes }) {
  if (selectedVibes.length < 2) return null

  return (
    <div className="blend-orb">
      {selectedVibes.map((vibe, i) => (
        <div
          key={vibe}
          className="blend-orb__layer"
          style={{
            background: VIBE_COLORS[vibe] ?? '#2A2A2A',
            animationDelay: `${i * 1.3}s`,
          }}
        />
      ))}
    </div>
  )
}
