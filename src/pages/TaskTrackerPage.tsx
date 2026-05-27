import { useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, parseISO } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react'
import { useTasks, useMindsetLogs } from '../hooks/useSupabase'
import { useLang } from '../lib/i18n'
import { useMobile } from '../hooks/useMobile'
import DayColumn from '../components/DayColumn'
import MindsetChart from '../components/MindsetChart'
import OverallProgressChart from '../components/OverallProgressChart'
import DonutChart from '../components/DonutChart'
import MindsetModal from '../components/MindsetModal'

const DAY_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#94a3b8', '#eab308', '#f97316']

export default function TaskTrackerPage() {
  const { t, lang } = useLang()
  const locale = lang === 'vi' ? vi : enUS
  const isMobile = useMobile()

  const [weekBase, setWeekBase] = useState(new Date())
  const [mindsetOpen, setMindsetOpen] = useState(false)
  const [mindsetDate, setMindsetDate] = useState('')

  const weekStart = format(startOfWeek(weekBase, { weekStartsOn: 0 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(weekBase, { weekStartsOn: 0 }), 'yyyy-MM-dd')
  const days = eachDayOfInterval({ start: parseISO(weekStart), end: parseISO(weekEnd) })
    .map(d => format(d, 'yyyy-MM-dd'))

  const { tasks, addTask, toggleTask, deleteTask } = useTasks(weekStart, weekEnd)
  const { logs: mindsetLogs, upsertLog } = useMindsetLogs(weekStart, weekEnd)

  const allCompleted = tasks.filter(t => t.completed).length
  const allTotal = tasks.length
  const overallPercent = allTotal === 0 ? 0 : (allCompleted / allTotal) * 100

  const chartData = days.map((day, i) => ({
    name: format(parseISO(day), 'EEE', { locale }),
    completed: tasks.filter(t => t.date === day && t.completed).length,
    total: tasks.filter(t => t.date === day).length,
    color: DAY_COLORS[i],
  }))

  return (
    <div style={{ height: isMobile ? 'auto' : '100%', display: 'flex', flexDirection: 'column', padding: 12, gap: 10, background: '#0d1117' }}>

      {/* ── Top 3 panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '190px 1fr 1fr', gap: 10, flexShrink: 0 }}>

        {/* Panel 1: Title + Week date */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 18px', borderRadius: 14, background: '#131929', border: '1px solid #1e2a3a' }}>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 22, lineHeight: 1.2 }}>
            {lang === 'vi' ? <>Quản lý<br />Task</> : <>Task<br />Tracker</>}
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              {t.weekStartDate}
            </div>
            <div style={{ background: '#10b981', borderRadius: 8, padding: '8px 12px', color: 'white', fontWeight: 700, fontSize: 16, textAlign: 'center', letterSpacing: '0.5px' }}>
              {format(parseISO(weekStart), 'dd.MM.yyyy')}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 10, alignItems: 'center' }}>
              <button onClick={() => setWeekBase(subWeeks(weekBase, 1))}
                style={{ padding: '4px 8px', borderRadius: 6, background: 'none', border: '1px solid #1e2a3a', color: '#64748b', cursor: 'pointer' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setWeekBase(new Date())}
                style={{ flex: 1, padding: 4, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 11 }}>
                {t.thisWeek}
              </button>
              <button onClick={() => setWeekBase(addWeeks(weekBase, 1))}
                style={{ padding: '4px 8px', borderRadius: 6, background: 'none', border: '1px solid #1e2a3a', color: '#64748b', cursor: 'pointer' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Overall Progress */}
        <div style={{ padding: '16px 18px', borderRadius: 14, background: '#131929', border: '1px solid #1e2a3a' }}>
          <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, marginBottom: 10, textAlign: 'center' }}>
            {t.overallProgress}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <OverallProgressChart data={chartData} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <DonutChart percent={overallPercent} size={100} strokeWidth={11} color="#10b981" />
              <div style={{ color: '#64748b', fontSize: 11 }}>{allCompleted} / {allTotal} {t.completed}</div>
            </div>
          </div>
        </div>

        {/* Panel 3: Mindset */}
        <div style={{ padding: '16px 18px', borderRadius: 14, background: '#131929', border: '1px solid #1e2a3a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>{t.mindsetTracker}</div>
            <button
              onClick={() => { setMindsetDate(format(new Date(), 'yyyy-MM-dd')); setMindsetOpen(true) }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 10px', borderRadius: 6, background: '#7c6ef720', color: '#7c6ef7', border: '1px solid #7c6ef740', cursor: 'pointer' }}
            >
              <Brain size={11} /> {t.log}
            </button>
          </div>
          <MindsetChart logs={mindsetLogs} days={days} />
        </div>
      </div>

      {/* ── 7 Day Columns ── */}
      <div className="no-scrollbar" style={{ flex: isMobile ? 'none' : 1, minHeight: 0, height: isMobile ? 520 : undefined, overflowX: isMobile ? 'auto' : 'visible', overflowY: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(7, 150px)' : 'repeat(7, minmax(0, 1fr))', gap: 10, height: '100%' }}>
        {days.map((day, i) => (
          <DayColumn
            key={day}
            date={day}
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            color={DAY_COLORS[i]}
          />
        ))}
      </div>
      </div>

      {mindsetOpen && (
        <MindsetModal
          date={mindsetDate}
          existing={mindsetLogs.find(l => l.date === mindsetDate)}
          onSave={upsertLog}
          onClose={() => setMindsetOpen(false)}
        />
      )}
    </div>
  )
}
