'use client'

import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import locales from '@/locales/el.json'
import type { Email } from '@/types/email'

interface EmailListProps {
  emails: Email[]
}

export function EmailList({ emails }: EmailListProps) {
  const { selectedEmailId, setSelectedEmail } = useAppStore()

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
        <p className="text-sm">{locales.inbox.empty}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => setSelectedEmail(email.id)}
          className={cn(
            "p-4 border-b border-border cursor-pointer transition-all hover:bg-white/5",
            selectedEmailId === email.id ? "bg-primary/10 border-l-4 border-l-primary" : "border-l-4 border-l-transparent",
            email.unread ? "bg-white/[0.02]" : "opacity-70"
          )}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn("text-sm font-semibold", email.unread ? "text-text" : "text-text-muted")}>
              {email.sender}
            </span>
            <span className="text-xs text-text-muted">
              {email.received_at ? new Date(email.received_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
          <p className="text-sm text-text-muted truncate mb-2">{email.subject}</p>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              email.priority === 'high' ? "bg-danger" : email.priority === 'medium' ? "bg-warning" : "bg-slate-400"
            )} />
            <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">
              {locales.inbox.priority[email.priority as keyof typeof locales.inbox.priority] || email.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
