'use client'

import { Circle, CheckCircle2, Clock, Tag, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/task'

interface TaskItemProps {
  task: Task
  dueLabel: string
  busy?: boolean
  onToggle: (id: string, completed: boolean) => void
}

export function TaskItem({ task, dueLabel, busy = false, onToggle }: TaskItemProps) {
  return (
    <div className={cn(
      "p-5 bg-surface/30 border border-border rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm hover:shadow-lg",
      task.completed && "opacity-50 grayscale bg-white/[0.01]"
    )}>
      <div className="flex items-center gap-5">
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          disabled={busy}
          className="text-text-muted hover:text-primary transition-colors disabled:opacity-40"
        >
          {task.completed ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <Circle className="w-6 h-6" />}
        </button>
        <div className="space-y-1">
          <p className={cn("font-semibold text-lg", task.completed && "line-through text-text-muted")}>
            {task.title}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-text-muted bg-white/5 px-2.5 py-1 rounded-lg">
              <Tag className="w-3 h-3" /> {task.category}
            </span>
            <span className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
              task.priority === 'high' ? "bg-danger/10 text-danger" : 
              task.priority === 'medium' ? "bg-warning/10 text-warning" : "bg-slate-500/10 text-slate-400"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                task.priority === 'high' ? "bg-danger" : task.priority === 'medium' ? "bg-warning" : "bg-slate-400"
              )} />
              {task.priority === 'high' ? 'Υψηλή' : task.priority === 'medium' ? 'Μεσαία' : 'Χαμηλή'}
            </span>
            <span className="flex items-center gap-1.5 text-text-muted italic">
              <Clock className="w-3.5 h-3.5" /> {dueLabel}
            </span>
          </div>
        </div>
      </div>
      
      <button
        disabled={busy}
        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/5 rounded-xl transition-all disabled:opacity-40"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  )
}
