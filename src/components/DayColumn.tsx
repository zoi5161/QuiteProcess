import { useState } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import DonutChart from './DonutChart'
import ConfirmModal from './ConfirmModal'
import { useLang } from '../lib/i18n'
import type { Task } from '../types'

const EMPTY_SLOTS = 10

interface Props {
  date: string
  tasks: Task[]
  onAdd: (task: { title: string; date: string; completed: boolean }) => void
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  color: string
}

export default function DayColumn({ date, tasks, onAdd, onToggle, onDelete, color }: Props) {
  const { t, lang } = useLang()
  const locale = lang === 'vi' ? vi : enUS

  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const dayTasks = tasks.filter(t => t.date === date)
  const completed = dayTasks.filter(t => t.completed).length
  const total = dayTasks.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const today = isToday(parseISO(date))

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAdd({ title: newTitle.trim(), date, completed: false })
      setNewTitle('')
      setAdding(false)
    }
  }

  const emptyCount = Math.max(0, EMPTY_SLOTS - dayTasks.length - (adding ? 1 : 0))

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden',
      background: '#131929', border: `1px solid ${today ? color + '70' : '#1e2a3a'}`, minHeight: 0,
    }}>
      {/* Day name + date */}
      <div style={{ padding: '14px 12px 8px', textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontWeight: 900, color: 'white', fontSize: 17, letterSpacing: '-0.3px' }}>
          {format(parseISO(date), 'EEEE', { locale })}
        </div>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
          {format(parseISO(date), 'dd.MM.yyyy')}
        </div>
      </div>

      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px', flexShrink: 0 }}>
        <DonutChart percent={percent} size={88} strokeWidth={9} color={color} />
      </div>

      {/* Tasks label */}
      <div style={{ textAlign: 'center', color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, flexShrink: 0 }}>
        {t.tasks}
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 8px', gap: 3, minHeight: 0 }}>
        {dayTasks.map(task => (
          <div
            key={task.id}
            className="task-row"
            style={{ background: task.completed ? color + '15' : color + '30' }}
          >
            <span
              onClick={() => onToggle(task.id, !task.completed)}
              style={{
                flex: 1, fontSize: 11, lineHeight: 1.3, cursor: 'pointer',
                color: task.completed ? '#475569' : 'white',
                textDecoration: task.completed ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {task.title}
            </span>
            <button
              className="delete-btn"
              onClick={() => setConfirmId(task.id)}
            >
              −
            </button>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={e => onToggle(task.id, e.target.checked)}
              style={{ accentColor: color, width: 13, height: 13, flexShrink: 0, cursor: 'pointer' }}
            />
          </div>
        ))}

        {adding ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, background: color + '18', flexShrink: 0 }}>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
              }}
              onBlur={() => { if (!newTitle.trim()) setAdding(false) }}
              placeholder={t.taskPlaceholder}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 11, minWidth: 0 }}
            />
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="add-btn">
            <Plus size={11} /> {t.add}
          </button>
        )}

        {Array.from({ length: emptyCount }).map((_, i) => (
          <div key={i} className="empty-slot">
            <div style={{ width: 13, height: 13, borderRadius: 3, border: '1px solid #1e3248' }} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid #1e2a3a', flexShrink: 0 }}>
        <div>
          <div style={{ color: '#475569', fontSize: 10 }}>{t.completed}</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{completed}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#475569', fontSize: 10 }}>{t.notCompleted}</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{total - completed}</div>
        </div>
      </div>

      {confirmId && (
        <ConfirmModal
          message={t.deleteTask}
          onConfirm={() => { onDelete(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}
