'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckSquare, Plus, Calendar, Clock } from 'lucide-react'
import { TaskItem } from '@/components/TaskItem'
import type { Task, TaskPriority } from '@/types/task'
import { apiService } from '@/lib/api'
import locales from '@/locales/el.json'

interface ApiTask {
  id?: string
  title?: string
  category?: string
  priority?: string
  due_date?: string | null
  completed?: boolean
  created_at?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({})
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Γενικά')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [newDueDate, setNewDueDate] = useState('')

  const mapTask = (task: ApiTask, index: number): Task => {
    const priority: TaskPriority =
      task.priority === 'high' || task.priority === 'low' ? task.priority : 'medium'
    return {
      id: task.id || `task-${index}`,
      title: task.title || 'Χωρίς τίτλο',
      category: task.category || 'Γενικά',
      priority,
      due_date: task.due_date || null,
      completed: Boolean(task.completed),
      created_at: task.created_at,
    }
  }

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiService.callAction('tasks.list')
      const list = Array.isArray(data.data) ? data.data : []
      setTasks(list.map((task, index) => mapTask(task as ApiTask, index)))
    } catch (error) {
      console.error('Failed to fetch tasks', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const parseDueDate = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const formatDueLabel = (task: Task) => {
    const due = parseDueDate(task.due_date)
    if (!due) return 'Χωρίς προθεσμία'
    const now = new Date()
    const isToday = due.toDateString() === now.toDateString()
    if (isToday) {
      return due.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    }
    return due.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const grouped = useMemo(() => {
    const today: Task[] = []
    const pending: Task[] = []
    const completed: Task[] = []
    const now = new Date()

    for (const task of tasks) {
      if (task.completed) {
        completed.push(task)
        continue
      }

      const due = parseDueDate(task.due_date)
      if (due && due.toDateString() === now.toDateString()) {
        today.push(task)
      } else {
        pending.push(task)
      }
    }

    return { today, pending, completed }
  }, [tasks])

  const setToggleBusy = (id: string, value: boolean) => {
    setTogglingIds((prev) => ({ ...prev, [id]: value }))
  }

  const handleToggle = async (id: string, completed: boolean) => {
    setToggleBusy(id, true)
    try {
      const updated = await apiService.callAction('tasks.complete', { task_id: id, completed })
      setTasks((prev) =>
        prev.map((task) => (task.id === id && updated.data ? mapTask(updated.data as ApiTask, 0) : task))
      )
    } catch (error) {
      console.error('Failed to update task status', error)
    } finally {
      setToggleBusy(id, false)
    }
  }

  const handleCreateTask = async () => {
    const title = newTitle.trim()
    if (!title || creating) return

    setCreating(true)
    try {
      const created = await apiService.callAction('tasks.create', {
        title,
        category: newCategory.trim() || 'Γενικά',
        priority: newPriority,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
      })
      if (created.data) {
        setTasks((prev) => [mapTask(created.data as ApiTask, 0), ...prev])
      }
      setNewTitle('')
      setNewCategory('Γενικά')
      setNewPriority('medium')
      setNewDueDate('')
    } catch (error) {
      console.error('Failed to create task', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center text-warning shadow-2xl shadow-warning/10">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{locales.tabs.tasks}</h2>
            <p className="text-text-muted text-sm italic">Ημερήσια οργάνωση και εκκρεμότητες</p>
          </div>
        </div>

        <button
          onClick={handleCreateTask}
          disabled={creating || !newTitle.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-background font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 scale-100 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100"
        >
          <Plus className="w-5 h-5" />
          {creating ? '...' : locales.tasks.new_task}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Τίτλος εργασίας"
          className="md:col-span-2 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Κατηγορία"
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="high">Υψηλή</option>
          <option value="medium">Μεσαία</option>
          <option value="low">Χαμηλή</option>
        </select>
        <input
          type="datetime-local"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 items-start">
        {/* Today */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-3 text-primary">
            <Calendar className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-widest text-sm">{locales.tasks.today}</h3>
          </div>
          <div className="space-y-4">
            {grouped.today.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                dueLabel={formatDueLabel(task)}
                busy={Boolean(togglingIds[task.id])}
                onToggle={handleToggle}
              />
            ))}
            {grouped.today.length === 0 && (
              <p className="text-sm text-text-muted px-3">{loading ? '...' : locales.tasks.empty}</p>
            )}
          </div>
        </div>

        {/* Pending */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-3 text-warning">
            <Clock className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-widest text-sm">{locales.tasks.pending}</h3>
          </div>
          <div className="space-y-4">
            {grouped.pending.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                dueLabel={formatDueLabel(task)}
                busy={Boolean(togglingIds[task.id])}
                onToggle={handleToggle}
              />
            ))}
            {grouped.pending.length === 0 && (
              <p className="text-sm text-text-muted px-3">{loading ? '...' : locales.tasks.empty}</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-3 text-text-muted">
            <CheckSquare className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-widest text-sm">{locales.tasks.completed}</h3>
          </div>
          <div className="space-y-4">
            {grouped.completed.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                dueLabel={formatDueLabel(task)}
                busy={Boolean(togglingIds[task.id])}
                onToggle={handleToggle}
              />
            ))}
            {grouped.completed.length === 0 && (
              <p className="text-sm text-text-muted px-3">{loading ? '...' : locales.tasks.empty}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
