import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, Habit, HabitLog, MindsetLog } from '../types'

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? ''
}

// ──── Tasks ────

export function useTasks(weekStart: string, weekEnd: string) {
  const [tasks, setTasks] = useState<Task[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('created_at', { ascending: true })
    setTasks(data ?? [])
  }, [weekStart, weekEnd])

  useEffect(() => { load() }, [load])

  const addTask = async (task: { title: string; date: string; completed: boolean }) => {
    const user_id = await uid()
    const { data, error } = await supabase.from('tasks').insert({ ...task, user_id }).select().single()
    if (!error && data) setTasks(prev => [...prev, data])
  }

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    await supabase.from('tasks').update({ completed }).eq('id', id)
  }

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('tasks').delete().eq('id', id)
  }

  return { tasks, addTask, toggleTask, deleteTask }
}

// ──── Habits ────

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])

  useEffect(() => {
    supabase.from('habits').select('*').order('created_at').then(({ data }) => {
      setHabits(data ?? [])
    })
  }, [])

  const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>) => {
    const user_id = await uid()
    const { data, error } = await supabase.from('habits').insert({ ...habit, user_id }).select().single()
    if (!error && data) setHabits(prev => [...prev, data])
  }

  const deleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    await supabase.from('habits').delete().eq('id', id)
  }

  return { habits, addHabit, deleteHabit }
}

// ──── Habit Logs ────

export function useHabitLogs(month: string) {
  const [logs, setLogs] = useState<HabitLog[]>([])

  const load = useCallback(async () => {
    // Use date range instead of LIKE — works correctly on PostgreSQL date columns
    const [year, mon] = month.split('-').map(Number)
    const lastDay = new Date(year, mon, 0).getDate()
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .gte('date', `${month}-01`)
      .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
    setLogs(data ?? [])
  }, [month])

  useEffect(() => { load() }, [load])

  const toggleHabitLog = async (habit_id: string, date: string, completed: boolean) => {
    const existing = logs.find(l => l.habit_id === habit_id && l.date === date)

    if (existing) {
      // Optimistic update
      setLogs(prev => prev.map(l =>
        l.habit_id === habit_id && l.date === date ? { ...l, completed } : l
      ))
      const { error } = await supabase.from('habit_logs').update({ completed }).eq('id', existing.id)
      // Revert on error
      if (error) setLogs(prev => prev.map(l =>
        l.habit_id === habit_id && l.date === date ? { ...l, completed: !completed } : l
      ))
    } else {
      // Optimistic: add temp entry so UI responds instantly
      const tempId = `temp-${habit_id}-${date}`
      setLogs(prev => [...prev, { id: tempId, habit_id, date, completed }])
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id, date, completed })
        .select().single()
      if (!error && data) {
        // Replace temp with real DB row
        setLogs(prev => prev.map(l => l.id === tempId ? data : l))
      } else {
        // Revert temp on error
        setLogs(prev => prev.filter(l => l.id !== tempId))
      }
    }
  }

  return { logs, toggleHabitLog }
}

// ──── Mindset Logs ────

export function useMindsetLogs(weekStart: string, weekEnd: string) {
  const [logs, setLogs] = useState<MindsetLog[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('mindset_logs')
      .select('*')
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date')
    setLogs(data ?? [])
  }, [weekStart, weekEnd])

  useEffect(() => { load() }, [load])

  const upsertLog = async (log: Omit<MindsetLog, 'id'>) => {
    const user_id = await uid()
    const { data, error } = await supabase
      .from('mindset_logs')
      .upsert({ ...log, user_id }, { onConflict: 'date,user_id' })
      .select().single()
    if (!error && data) {
      setLogs(prev => {
        const idx = prev.findIndex(l => l.date === data.date)
        return idx >= 0 ? prev.map((l, i) => i === idx ? data : l) : [...prev, data]
      })
    }
  }

  return { logs, upsertLog }
}
