export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  category: string
  priority: TaskPriority
  due_date?: string | null
  completed: boolean
  created_at?: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  category?: string
  priority?: TaskPriority
  due_date?: string | null
}
