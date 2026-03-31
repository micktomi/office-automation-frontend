'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, RefreshCw, Filter } from 'lucide-react'
import { EmailList } from '@/components/EmailList'
import { EmailPreview } from '@/components/EmailPreview'
import { apiService } from '@/lib/api'
import { cn } from '@/lib/utils'
import locales from '@/locales/el.json'
import { useAppStore } from '@/store/appStore'
import type { Email } from '@/types/email'

interface InboxPageProps {
  mode?: 'pending' | 'all'
}

export default function InboxPage({ mode = 'pending' }: InboxPageProps) {
  const { selectedEmailId, setSelectedEmail, requestDashboardRefresh } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState<Email[]>([])
  const [showAll, setShowAll] = useState(mode === 'all')
  const pendingOnly = mode === 'pending'

  const fetchEmails = useCallback(async (includeNoise = showAll) => {
    setLoading(true)
    try {
      const action = pendingOnly ? 'email.needs_reply' : 'email.list'
      const payload = pendingOnly ? {} : { include_noise: includeNoise }
      const data = await apiService.callAction(action, payload)
      setEmails(Array.isArray(data.data) ? data.data as Email[] : [])
    } catch (error) {
      console.error("Failed to fetch emails", error)
    } finally {
      setLoading(false)
    }
  }, [pendingOnly, showAll])

  const handleSync = async () => {
    setLoading(true)
    try {
      await apiService.callAction('email.sync')
      // Always refetch after sync to get updated cache
      await fetchEmails(showAll)
      requestDashboardRefresh()
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails(showAll)
  }, [fetchEmails, showAll])

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
            {pendingOnly ? 'Emails που περιμένουν απάντηση' : locales.tabs.inbox}
          </h2>
          <div className="flex items-center gap-2">
            {!pendingOnly && (
              <button
                onClick={() => setShowAll((current) => !current)}
                className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors"
                title={showAll ? 'Δείξε σημαντικά' : 'Δείξε όλα'}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
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
