import './VibeLeaderboard.css'

const LEADERBOARD = [
  { vibe: 'LATE NIGHT',  count: 4821, bars: [8, 18, 12, 22, 6]  },
  { vibe: 'HYPE',        count: 3654, bars: [20, 10, 24, 8, 18] },
  { vibe: 'FOCUS',       count: 2890, bars: [14, 22, 8, 18, 12] },
  { vibe: 'MELANCHOLIC', count: 2103, bars: [6, 14, 20, 10, 16] },
  { vibe: 'HEARTBREAK',  count: 1567, bars: [18, 8, 14, 20, 6]  },
  { vibe: 'ROAD TRIP',   count: 988,  bars: [10, 20, 6, 16, 22] },
]

const RANK_HEIGHTS = [40, 34, 28, 22, 16, 10]

function formatCount(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function VibeLeaderboard({ onVibeSelect }) {
  return (
    <section className="leaderboard">
      <h2 className="leaderboard__title">TRENDING NOW</h2>
      <div className="leaderboard__rows">
        {LEADERBOARD.map(({ vibe, count, bars }, i) => (
          <button
            key={vibe}
            className={`leaderboard__row${i === 0 ? ' leaderboard__row--top' : ''}`}
            style={{ '--stagger': `${i * 80}ms`, '--rank-h': `${RANK_HEIGHTS[i]}px` }}
            onClick={() => onVibeSelect?.(vibe)}
          >
            <span className="leaderboard__rank-line" />
            <span className="leaderboard__vibe">{vibe}</span>
            <svg className="leaderboard__wave" viewBox="0 0 50 24" preserveAspectRatio="none">
              {bars.map((h, bi) => (
                <rect
                  key={bi}
                  x={bi * 10 + 2}
                  y={24 - h}
                  width={bi % 2 === 0 ? 6 : 7}
                  height={h}
                  fill="#2A2A2A"
                />
              ))}
            </svg>
            <span className="leaderboard__count">{formatCount(count)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
