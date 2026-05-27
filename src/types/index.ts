export interface Task {
  id: string
  title: string
  date: string // YYYY-MM-DD
  completed: boolean
  color?: string
  created_at?: string
}

export interface Habit {
  id: string
  name: string
  emoji?: string
  color: string
  created_at?: string
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string // YYYY-MM-DD
  completed: boolean
}

export interface MindsetLog {
  id: string
  date: string // YYYY-MM-DD
  energy: number    // 1-10
  focus: number     // 1-10
  motivation: number // 1-10
  mood: number      // 1-10
  notes?: string
}
