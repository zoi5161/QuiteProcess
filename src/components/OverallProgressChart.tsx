import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DataPoint {
  name: string
  completed: number
  total: number
  color: string
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { payload: DataPoint }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const pct = d.total === 0 ? 0 : Math.round((d.completed / d.total) * 100)

  return (
    <div style={{
      background: '#1a2235', border: `1px solid ${d.color}40`,
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: d.color, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#64748b' }}>Completed</span>
          <span style={{ color: 'white', fontWeight: 600 }}>{d.completed} / {d.total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#64748b' }}>Progress</span>
          <span style={{ color: d.color, fontWeight: 700 }}>{pct}%</span>
        </div>
      </div>
    </div>
  )
}

export default function OverallProgressChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={130}>
      <BarChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: -35 }} barCategoryGap="25%">
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#1e2a3a" />
        <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
