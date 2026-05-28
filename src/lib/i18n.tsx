import { createContext, useContext, useState } from 'react'

export type Lang = 'en' | 'vi'

const translations = {
  en: {
    // Nav
    taskTracker: 'Task Tracker',
    habitTracker: 'Habit Tracker',

    // Task page - top panels
    weekStartDate: 'Week Start Date',
    thisWeek: 'This week',
    overallProgress: 'Overall Progress',
    completed: 'Completed',
    notCompleted: 'Not Completed',
    mindsetTracker: 'Mindset Tracker',
    log: 'Log',

    // Day column
    tasks: 'Tasks',
    add: 'Add',
    taskPlaceholder: 'Task name...',

    // Mindset modal
    mindsetCheckin: 'Mindset Check-in',
    energy: 'Energy',
    focus: 'Focus',
    motivation: 'Motivation',
    mood: 'Mood',
    notes: 'Notes (optional)...',
    save: 'Save',

    // Habit page
    myHabits: 'My Habits',
    addHabit: 'Add Habit',
    cancel: 'Cancel',
    numberOfHabits: 'Number of habits',
    completedHabits: 'Completed habits',
    progressPct: 'Progress in %',
    weeklyTrend: 'Weekly Trend',
    analysis: 'Analysis',
    thisMonth: 'This month',
    habitPlaceholder: 'Habit name...',
    noHabits: 'No habits yet. Add one above!',
    deleteTask: 'Delete this task?',
    deleteHabit: 'Delete this habit?',
    delete: 'Delete',
    dailyCompletion: 'Daily Completion',
    mentalState: 'Mental State',
    total: 'Total',
    week: 'Week',
    completion: 'Completion',
  },
  vi: {
    // Nav
    taskTracker: 'Quản lý Task',
    habitTracker: 'Theo dõi Habit',

    // Task page - top panels
    weekStartDate: 'Ngày đầu tuần',
    thisWeek: 'Tuần này',
    overallProgress: 'Tiến độ tổng',
    completed: 'Hoàn thành',
    notCompleted: 'Chưa xong',
    mindsetTracker: 'Tâm trạng',
    log: 'Ghi',

    // Day column
    tasks: 'Công việc',
    add: 'Thêm',
    taskPlaceholder: 'Tên task...',

    // Mindset modal
    mindsetCheckin: 'Check-in tâm trạng',
    energy: 'Năng lượng',
    focus: 'Tập trung',
    motivation: 'Động lực',
    mood: 'Tâm trạng',
    notes: 'Ghi chú (tuỳ chọn)...',
    save: 'Lưu',

    // Habit page
    myHabits: 'Thói quen của tôi',
    addHabit: 'Thêm thói quen',
    cancel: 'Huỷ',
    numberOfHabits: 'Số thói quen',
    completedHabits: 'Đã hoàn thành',
    progressPct: 'Tiến độ %',
    weeklyTrend: 'Xu hướng tuần',
    analysis: 'Phân tích',
    thisMonth: 'Tháng này',
    habitPlaceholder: 'Tên thói quen...',
    noHabits: 'Chưa có thói quen. Thêm ngay!',
    deleteTask: 'Xoá công việc này?',
    deleteHabit: 'Xoá thói quen này?',
    delete: 'Xoá',
    dailyCompletion: 'Hoàn thành hàng ngày',
    mentalState: 'Trạng thái tinh thần',
    total: 'Tổng',
    week: 'Tuần',
    completion: 'Hoàn thành',
  },
} as const

type T = typeof translations.en

interface LangCtx {
  lang: Lang
  t: T
  toggle: () => void
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  t: translations.en,
  toggle: () => {},
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem('lang') as Lang) ?? 'en'
  )

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'vi' : 'en'
    localStorage.setItem('lang', next)
    setLang(next)
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang] as T, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
