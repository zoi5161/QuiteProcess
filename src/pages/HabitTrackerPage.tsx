import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  getDaysInMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useHabits, useHabitLogs, useMindsetLogs } from '../hooks/useSupabase'
import { useLang } from '../lib/i18n'
import ConfirmModal from '../components/ConfirmModal'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'

const PRESET_COLORS = ['#7c6ef7', '#4ecdc4', '#ff6b9d', '#ffd93d', '#6bcb77', '#f472b6', '#fb923c', '#60a5fa']
const PRESET_EMOJIS = [
  // Health & Fitness
  '🏃', '🏋️', '🚴', '🏊', '🤸', '🧘', '🚶', '⛹️', '🤾', '🏇',
  '🥊', '🤼', '🏄', '🧗', '⛷️', '🏂', '🤺', '🎽', '🦵', '💪',
  // Food & Diet
  '🥗', '🍎', '🥤', '💧', '🍳', '🥦', '🥑', '🍇', '🥕', '🍓',
  '🫐', '🍵', '☕', '🧃', '🥛', '🍱', '🫙', '🥜', '🌽', '🍋',
  // Mind & Study
  '📚', '📖', '✍️', '📝', '🧠', '🎯', '💡', '🔬', '🧪', '📐',
  '🗒️', '📓', '📒', '📔', '🖊️', '📌', '🗂️', '📊', '🔭', '🧮',
  // Sleep & Rest
  '🛌', '😴', '🌙', '⭐', '🌟', '💤', '🛏️', '🌛', '🌜', '🌚',
  // Personal Care
  '🚿', '🧴', '🦷', '🪥', '💊', '🧹', '🧺', '🪞', '✂️', '🧼',
  // Money & Finance
  '💰', '💳', '📈', '💵', '🏦', '🪙', '💎', '🤑', '📉', '💸',
  // Creative & Hobby
  '🎨', '🎵', '🎸', '🎹', '📷', '🎬', '✏️', '🖌️', '🎭', '🎤',
  '🎧', '🎺', '🥁', '🎻', '🎲', '🧩', '🎮', '🃏', '♟️', '🎯',
  // Social & Life
  '💬', '📱', '🤝', '❤️', '🙏', '👨‍👩‍👧', '🫂', '📞', '✉️', '🎁',
  // Nature & Outdoors
  '🌿', '☀️', '🌱', '🌳', '🐾', '🦋', '🌸', '🍀', '🌊', '⛰️',
  // Productivity
  '🚫', '⏰', '📅', '✅', '🔔', '🗓️', '⚡', '🔑', '🏆', '🎖️',
]

const WEEK_COLORS = ['#5b4fcf', '#0d9488', '#059669', '#db2777', '#ea580c']
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const card: React.CSSProperties = {
  background: '#131929',
  border: '1px solid #1e2a3a',
  borderRadius: 14,
  padding: 16,
}

export default function HabitTrackerPage() {
  const { t, lang } = useLang()
  const locale = lang === 'vi' ? vi : enUS

  const [monthBase, setMonthBase] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [confirmHabitId, setConfirmHabitId] = useState<string | null>(null)
  const [showMoreEmojis, setShowMoreEmojis] = useState(false)

  const monthStr = format(monthBase, 'yyyy-MM')
  const { habits, addHabit, deleteHabit } = useHabits()
  const { logs, toggleHabitLog } = useHabitLogs(monthStr)

  const monthStart = startOfMonth(monthBase)
  const monthEnd = endOfMonth(monthBase)
  const daysInMonth = getDaysInMonth(monthBase)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(d => format(d, 'yyyy-MM-dd'))

  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStartStr = format(monthStart, 'yyyy-MM-dd')
  const monthEndStr = format(monthEnd, 'yyyy-MM-dd')

  const { logs: mindsetLogs } = useMindsetLogs(monthStartStr, monthEndStr)

  const getLog = (habitId: string, date: string) =>
    logs.find(l => l.habit_id === habitId && l.date === date)

  const habitPercent = (habitId: string) => {
    const passedDays = days.filter(d => d <= today)
    if (passedDays.length === 0) return 0
    const done = passedDays.filter(d => getLog(habitId, d)?.completed).length
    return Math.round((done / passedDays.length) * 100)
  }

  const totalCompleted = logs.filter(l => l.completed).length
  const totalPossible = days.filter(d => d <= today).length * habits.length
  const overallProgress = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

  const weeklyData = [1, 2, 3, 4, 5].map(w => {
    const weekDays = days.slice((w - 1) * 7, w * 7)
    if (weekDays.length === 0) return null
    const total = weekDays.length * habits.length
    if (total === 0) return null
    const done = weekDays.reduce(
      (acc, d) => acc + habits.filter(h => getLog(h.id, d)?.completed).length,
      0
    )
    return { week: `W${w}`, score: total > 0 ? Math.round((done / total) * 100) : 0 }
  }).filter(Boolean) as { week: string; score: number }[]

  // Daily completion % data for area chart
  const dailyCompletionData = days.map((d, i) => {
    if (d > today || habits.length === 0) return { day: i + 1, pct: null }
    const done = habits.filter(h => getLog(h.id, d)?.completed).length
    return { day: i + 1, pct: Math.round((done / habits.length) * 100) }
  })

  // Mindset chart data
  const mindsetData = mindsetLogs.map(ml => ({
    date: format(parseISO(ml.date), 'd'),
    mood: ml.mood,
    motivation: ml.motivation,
  }))

  // Build week structure: each week = { weekIdx, days[] }
  // weeks are calendar weeks (Sun-Sat) but clipped to the month
  type WeekGroup = { weekIdx: number; days: string[] }
  const weekGroups: WeekGroup[] = []
  let currentWeekIdx = 0
  let currentGroup: WeekGroup | null = null

  for (const d of days) {
    const dow = getDay(parseISO(d)) // 0=Sun
    if (dow === 0 || currentGroup === null) {
      if (currentGroup !== null) weekGroups.push(currentGroup)
      currentGroup = { weekIdx: currentWeekIdx++, days: [d] }
    } else {
      currentGroup.days.push(d)
    }
  }
  if (currentGroup) weekGroups.push(currentGroup)

  // Per-day cumulative completed count (across all habits)
  const dayTotals = days.map(d => {
    if (d > today) return null
    return habits.filter(h => getLog(h.id, d)?.completed).length
  })

  const handleAddHabit = async () => {
    if (!newName.trim()) return
    await addHabit({ name: newName.trim(), emoji: newEmoji, color: newColor })
    setNewName('')
    setShowAdd(false)
  }

  const LEFT_COL_WIDTH = 160
  const DAY_COL_WIDTH = 26
  const PCT_COL_WIDTH = 50

  return (
    <div style={{ background: '#0d1117', minHeight: '100%', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

        {/* Month nav card */}
        <div style={{ ...card, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 22 }}>
            {format(monthBase, 'MMMM', { locale }).replace(/^\w/, c => c.toUpperCase())}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
            <button
              onClick={() => setMonthBase(subMonths(monthBase, 1))}
              style={{ padding: '4px 8px', borderRadius: 6, background: 'none', border: '1px solid #1e2a3a', color: '#64748b', cursor: 'pointer' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setMonthBase(addMonths(monthBase, 1))}
              style={{ padding: '4px 8px', borderRadius: 6, background: 'none', border: '1px solid #1e2a3a', color: '#64748b', cursor: 'pointer' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Number of habits stat */}
        <div style={{ ...card, minWidth: 110, flex: '0 0 auto' }}>
          <div style={{ color: '#64748b', fontSize: 11 }}>{t.numberOfHabits}</div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 28, marginTop: 4 }}>{habits.length}</div>
        </div>

        {/* Completed habits stat */}
        <div style={{ ...card, minWidth: 110, flex: '0 0 auto' }}>
          <div style={{ color: '#64748b', fontSize: 11 }}>{t.completedHabits}</div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 28, marginTop: 4 }}>{totalCompleted}</div>
        </div>

        {/* Progress % with bar */}
        <div style={{ ...card, minWidth: 160, flex: '0 0 auto' }}>
          <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8 }}>{t.progressPct}</div>
          <div style={{ height: 6, borderRadius: 3, background: '#1e2a3a', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, width: `${overallProgress}%`, background: 'linear-gradient(90deg, #7c6ef7, #4ecdc4)' }} />
          </div>
          <div style={{ color: 'white', fontWeight: 700, marginTop: 6 }}>{overallProgress}%</div>
        </div>

        {/* Weekly trend line chart */}
        <div style={{ ...card, minWidth: 200, flex: 1 }}>
          <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, marginBottom: 8 }}>{t.weeklyTrend}</div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="score" stroke="#4ecdc4" strokeWidth={2} dot={{ fill: '#4ecdc4', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis panel: habit % bars */}
        {habits.length > 0 && (
          <div style={{ ...card, minWidth: 220, flex: 1 }}>
            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, marginBottom: 10 }}>{t.analysis}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {habits.map(h => {
                const pct = habitPercent(h.id)
                return (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{h.emoji}</span>
                    <span style={{ fontSize: 11, color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                    <div style={{ width: 56, height: 5, borderRadius: 3, background: '#1e2a3a', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: h.color }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: h.color, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Main habit grid ── */}
      <div style={{ ...card, padding: 16 }}>
        {/* Grid toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>{t.myHabits}</div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 8, background: '#7c6ef720', color: '#7c6ef7', border: '1px solid #7c6ef740', cursor: 'pointer' }}
          >
            <Plus size={12} /> {t.addHabit}
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, padding: 12, borderRadius: 10, background: '#0d1520', border: '1px solid #1e2a3a' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreEmojis(v => !v)}
                style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: showMoreEmojis ? '#1e2a3a' : '#0d1520', border: `1px solid ${showMoreEmojis ? '#2d3f55' : '#1e2a3a'}` }}
              >
                {newEmoji}
              </button>
              {showMoreEmojis && (
                <>
                  <div onClick={() => setShowMoreEmojis(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                  <div style={{
                    position: 'absolute', top: 40, left: 0, zIndex: 1000,
                    display: 'grid', gridTemplateColumns: 'repeat(10, 28px)',
                    gap: 3, padding: 8, borderRadius: 10,
                    maxHeight: 130, overflowY: 'auto',
                    background: '#0d1520', border: '1px solid #2d3f55',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }} className="no-scrollbar">
                    {PRESET_EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => { setNewEmoji(e); setShowMoreEmojis(false) }}
                        style={{ width: 28, height: 28, borderRadius: 6, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: newEmoji === e ? '#7c6ef730' : 'transparent', border: `1px solid ${newEmoji === e ? '#7c6ef7' : 'transparent'}` }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
              placeholder={t.habitPlaceholder}
              style={{ flex: 1, minWidth: 120, fontSize: 13, background: '#1a2235', border: '1px solid #1e2a3a', borderRadius: 8, padding: '6px 12px', color: 'white', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: `2px solid ${newColor === c ? 'white' : 'transparent'}`, cursor: 'pointer' }}
                />
              ))}
            </div>
            <button
              onClick={handleAddHabit}
              style={{ padding: '6px 16px', borderRadius: 8, background: '#7c6ef7', color: 'white', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              {t.add}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{ padding: '6px 12px', borderRadius: 8, background: 'none', color: '#64748b', fontSize: 13, border: '1px solid #1e2a3a', cursor: 'pointer' }}
            >
              {t.cancel}
            </button>
          </div>
        )}

        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '48px 0', fontSize: 14 }}>{t.noHabits}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'block', width: '100%', minWidth: LEFT_COL_WIDTH + daysInMonth * 20 + PCT_COL_WIDTH + 24, fontSize: 11 }}>

              {/* ── Week header row ── */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: LEFT_COL_WIDTH, flexShrink: 0, color: '#475569', fontWeight: 600, fontSize: 12, padding: '0 0 4px 0' }}>
                  {t.myHabits}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 2 }}>
                  {weekGroups.map((wg) => {
                    const wColor = WEEK_COLORS[wg.weekIdx % WEEK_COLORS.length]
                    return (
                      <div
                        key={wg.weekIdx}
                        style={{
                          flex: wg.days.length,
                          background: wColor,
                          borderRadius: 6,
                          textAlign: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '3px 0',
                        }}
                      >
                        {t.week} {wg.weekIdx + 1}
                      </div>
                    )
                  })}
                </div>
                <div style={{ width: PCT_COL_WIDTH + 24, flexShrink: 0 }} />
              </div>

              {/* ── Day-of-week labels + date number row ── */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <div style={{ width: LEFT_COL_WIDTH, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex' }}>
                  {days.map(d => {
                    const dow = getDay(parseISO(d))
                    const wgIdx = weekGroups.findIndex(wg => wg.days.includes(d))
                    const wColor = wgIdx >= 0 ? WEEK_COLORS[wgIdx % WEEK_COLORS.length] : '#334155'
                    const dayNum = parseInt(d.slice(8), 10)
                    const isToday = d === today
                    return (
                      <div
                        key={d}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          paddingBottom: 3,
                          background: isToday ? 'rgba(255,255,255,0.1)' : 'transparent',
                          borderRadius: 4,
                          outline: isToday ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        }}
                      >
                        <span style={{ color: wColor, fontWeight: 600, fontSize: 9, lineHeight: 1 }}>
                          {DAY_LABELS[dow]}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, lineHeight: 1, marginTop: 2,
                          color: isToday ? 'white' : '#475569',
                          background: isToday ? wColor : 'transparent',
                          borderRadius: 3, padding: isToday ? '1px 3px' : '1px 0',
                        }}>
                          {dayNum}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ width: PCT_COL_WIDTH, flexShrink: 0, textAlign: 'center', color: '#475569', fontWeight: 500, fontSize: 11 }}>%</div>
                <div style={{ width: 24, flexShrink: 0 }} />
              </div>

              {/* ── Habit rows ── */}
              {habits.map(habit => (
                <div key={habit.id} style={{ display: 'flex', alignItems: 'center', marginTop: 3 }}>
                  <div style={{ width: LEFT_COL_WIDTH, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontWeight: 500, paddingRight: 8, overflow: 'hidden' }}>
                    <span style={{ fontSize: 14 }}>{habit.emoji}</span>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{habit.name}</div>
                      {habit.created_at && (
                        <div style={{ fontSize: 10, color: '#334155', marginTop: 1 }}>
                          {format(new Date(habit.created_at), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex' }}>
                    {days.map(d => {
                      const log = getLog(habit.id, d)
                      const done = log?.completed ?? false
                      const future = d > today
                      const isToday = d === today
                      return (
                        <div key={d} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                          <button
                            disabled={future}
                            onClick={() => toggleHabitLog(habit.id, d, !done)}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: done ? habit.color : future ? '#0d1520' : '#1e2a3a',
                              border: `1px solid ${done ? habit.color : '#2d3f55'}`,
                              opacity: future ? 0.25 : 1,
                              cursor: future ? 'not-allowed' : 'pointer',
                              color: 'white',
                              fontSize: 10,
                              padding: 0,
                            }}
                          >
                            {done && '✓'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ width: PCT_COL_WIDTH, flexShrink: 0, textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: habit.color, fontSize: 11 }}>{habitPercent(habit.id)}%</span>
                  </div>
                  <div style={{ width: 24, flexShrink: 0 }}>
                    <button
                      onClick={() => setConfirmHabitId(habit.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px', fontSize: 15, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* ── Bottom totals row ── */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6, borderTop: '1px solid #1e2a3a', paddingTop: 5 }}>
                <div style={{ width: LEFT_COL_WIDTH, flexShrink: 0, color: '#475569', fontSize: 11, fontWeight: 600 }}>{t.total}</div>
                <div style={{ flex: 1, display: 'flex' }}>
                  {dayTotals.map((count, i) => {
                    const d = days[i]
                    const isToday = d === today
                    return (
                      <div
                        key={i}
                        style={{ flex: 1, textAlign: 'center', color: count !== null ? '#94a3b8' : '#334155', fontSize: 10, fontWeight: 600 }}
                      >
                        {count !== null ? count : ''}
                      </div>
                    )
                  })}
                </div>
                <div style={{ width: PCT_COL_WIDTH + 24, flexShrink: 0 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Daily completion area chart ── */}
      {habits.length > 0 && (
        <div style={{ ...card }}>
          <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{t.dailyCompletion}</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={dailyCompletionData} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#131929', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 11 }}
                formatter={(value: unknown) => [`${value}%`, t.completion]}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#areaGrad)"
                connectNulls={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Mental State chart ── */}
      {mindsetData.length > 0 && (
        <div style={{ ...card }}>
          <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{t.mentalState}</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={mindsetData} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 10]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#131929', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={2} dot={false} name="Mood" />
              <Line type="monotone" dataKey="motivation" stroke="#60a5fa" strokeWidth={2} dot={false} name="Motivation" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {confirmHabitId && (
        <ConfirmModal
          message={t.deleteHabit}
          onConfirm={() => { deleteHabit(confirmHabitId); setConfirmHabitId(null) }}
          onCancel={() => setConfirmHabitId(null)}
        />
      )}
    </div>
  )
}
