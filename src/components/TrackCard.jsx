import './TrackCard.css'

export default function TrackCard({ number, title, artist, duration }) {
  return (
    <div className="track-card" data-cursor-hover>
      <span className="track-card__number">
        {String(number).padStart(2, '0')}
      </span>
      <div className="track-card__info">
        <span className="track-card__title">{title}</span>
        <span className="track-card__artist">{artist}</span>
      </div>
      <span className="track-card__duration">{duration}</span>
    </div>
  )
}
