import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { MindsetLog } from '../types'
import { format, parseISO } from 'date-fns'
import { useLang } from '../lib/i18n'

interface Props {
  logs: MindsetLog[]
  days: string[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const notes = payload[0]?.payload?.notes
  return (
    <div style={{ background: '#0f1623', border: '1px solid #2d3f55', borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.9)', position: 'relative', zIndex: 100 }}>
      <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name} : {p.value}
        </div>
      ))}
      {notes && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #2d3f55', color: '#94a3b8', fontStyle: 'italic', maxWidth: 180 }}>
          {notes}
        </div>
      )}
    </div>
  )
}

export default function MindsetChart({ logs, days }: Props) {
  const { t } = useLang()

  const LINES = [
    { key: 'energy',     label: t.energy,     color: '#ff6b9d' },
    { key: 'focus',      label: t.focus,      color: '#06b6d4' },
    { key: 'motivation', label: t.motivation, color: '#10b981' },
    { key: 'mood',       label: t.mood,       color: '#ffd93d' },
  ]

  const data = days.map(day => {
    const log = logs.find(l => l.date === day)
    return {
      name: format(parseISO(day), 'EEE'),
      energy: log?.energy ?? null,
      focus: log?.focus ?? null,
      motivation: log?.motivation ?? null,
      mood: log?.mood ?? null,
      notes: log?.notes ?? '',
    }
  })

  return (
    <div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -35 }}>
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff15' }} isAnimationActive={false} />
          {LINES.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} strokeWidth={2} dot={{ r: 3, fill: l.color, strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
        {LINES.map(l => (
          <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 10, color: l.color }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
