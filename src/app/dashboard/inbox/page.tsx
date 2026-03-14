'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw, Filter } from 'lucide-react'
import { EmailList } from '@/components/EmailList'
import { EmailPreview } from '@/components/EmailPreview'
import { apiService } from '@/lib/api'
import { cn } from '@/lib/utils'
import locales from '@/locales/el.json'
import { useAppStore } from '@/store/appStore'
import type { Email } from '@/types/email'

export default function InboxPage() {
  const { selectedEmailId, setSelectedEmail } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState<Email[]>([])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const data = await apiService.callAction('email.list')
      setEmails(Array.isArray(data.data) ? data.data as Email[] : [])
    } catch (error) {
      console.error("Failed to fetch emails", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setLoading(true)
    try {
      await apiService.callAction('email.sync')
      // Always refetch after sync to get updated cache
      await fetchEmails()
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  useEffect(() => {
    if (selectedEmailId && !emails.some((email) => email.id === selectedEmailId)) {
      setSelectedEmail(null)
    }
  }, [emails, selectedEmailId, setSelectedEmail])

  const selectedEmail = emails.find((email) => email.id === selectedEmailId) ?? null

  return (
    <div className="flex h-full">
      <div className="w-[35%] border-r border-border bg-surface/30 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
          <h2 className="font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {locales.tabs.inbox}
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              {loading ? "..." : locales.inbox.actions.sync}
            </button>
          </div>
        </div>

        <EmailList emails={emails} />
      </div>

      <div className="flex-1 bg-background/50 flex flex-col overflow-hidden">
        <EmailPreview email={selectedEmail} />
      </div>
    </div>
  )
}
