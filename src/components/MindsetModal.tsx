import { useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../lib/i18n'
import type { MindsetLog } from '../types'

interface Props {
  date: string
  existing?: MindsetLog
  onSave: (log: Omit<MindsetLog, 'id'>) => void
  onClose: () => void
}

function Slider({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span style={{ color: '#cbd5e1' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}/10</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
      />
    </div>
  )
}

export default function MindsetModal({ date, existing, onSave, onClose }: Props) {
  const { t } = useLang()
  const [energy, setEnergy] = useState(existing?.energy ?? 5)
  const [focus, setFocus] = useState(existing?.focus ?? 5)
  const [motivation, setMotivation] = useState(existing?.motivation ?? 5)
  const [mood, setMood] = useState(existing?.mood ?? 5)
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const handleSave = () => {
    onSave({ date, energy, focus, motivation, mood, notes })
    onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}
    >
      <div style={{ width: '100%', maxWidth: 360, borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 18, background: '#131929', border: '1px solid #1e2a3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: 0 }}>{t.mindsetCheckin}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: -12 }}>{date}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Slider label={t.energy} value={energy} onChange={setEnergy} color="#4ecdc4" />
          <Slider label={t.focus} value={focus} onChange={setFocus} color="#a78bfa" />
          <Slider label={t.motivation} value={motivation} onChange={setMotivation} color="#ff6b9d" />
          <Slider label={t.mood} value={mood} onChange={setMood} color="#ffd93d" />
        </div>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t.notes}
          rows={3}
          style={{ fontSize: 13, background: '#0d1520', border: '1px solid #1e2a3a', borderRadius: 10, padding: '10px 12px', color: 'white', outline: 'none', resize: 'none' }}
        />

        <button
          onClick={handleSave}
          style={{ padding: '10px', borderRadius: 10, fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c6ef7, #4ecdc4)', fontSize: 14 }}
        >
          {t.save}
        </button>
      </div>
    </div>
  )
}
