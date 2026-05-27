// Circular SVG countdown timer — Kahoot style
export default function TimerCircle({ timeLeft, total }) {
  const r = 26
  const circ = 2 * Math.PI * r        // ≈ 163.36
  const progress = timeLeft / total
  const offset   = circ * (1 - progress)
  const danger   = timeLeft <= 5
  const stroke   = danger ? '#E21B3C' : '#5B2BA6'

  return (
    <div className="w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 60 60" width="60" height="60">
        {/* Track */}
        <circle
          cx="30" cy="30" r={r}
          fill="none" stroke="#E8E8F0" strokeWidth="5"
        />
        {/* Ring */}
        <circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s',
          }}
        />
        {/* Number */}
        <text
          x="30" y="30"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 17,
            fill: danger ? '#E21B3C' : '#46178F',
          }}
        >
          {timeLeft}
        </text>
      </svg>
    </div>
  )
}
