interface Props {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export default function DonutChart({
  percent,
  size = 80,
  strokeWidth = 8,
  color = '#7c6ef7',
  label,
}: Props) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2235" strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute text-center" style={{ transform: 'none' }}>
        <div className="font-bold text-white" style={{ fontSize: size * 0.18 }}>
          {Math.round(percent)}%
        </div>
        {label && (
          <div className="text-slate-400" style={{ fontSize: size * 0.12 }}>{label}</div>
        )}
      </div>
    </div>
  )
}
