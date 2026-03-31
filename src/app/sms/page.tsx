'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BellRing, RefreshCw, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface ReminderRow {
  id: string
  policy_holder?: string
  policy_number?: string
  email?: string
  expiry_date?: string
  days_until_expiry?: number
  insurer?: string
}

export default function SmsPage() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<ReminderRow[]>([])

  useEffect(() => {
    let active = true

    async function fetchPendingSms() {
      setLoading(true)
      try {
        const response = await api.get('/reminders/pending')
        if (!active) return
        setRows(Array.isArray(response.data) ? (response.data as ReminderRow[]) : [])
      } catch (error) {
        console.error('Failed to fetch pending SMS reminders:', error)
        if (active) {
          setRows([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchPendingSms()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-text-muted">
            <BellRing className="h-3.5 w-3.5" />
            Pending SMS
          </div>
          <h1 className="mt-4 text-3xl font-bold text-text">SMS που περιμένουν αποστολή</h1>
          <p className="mt-2 text-text-muted">Αυτά είναι τα επόμενα reminders που μπορείς να στείλεις.</p>
        </div>

        <Link
          href="/policies?status=expiring"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-white/5"
        >
          <ArrowRight className="h-4 w-4" />
          Άνοιξε λήξεις
        </Link>
      </header>

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-surface/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <BellRing className="h-4 w-4" />
          {loading ? 'Φόρτωση pending SMS...' : `${rows.length} pending SMS reminders`}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Ανανέωση
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface/30 p-12 text-center text-text-muted">
          Φόρτωση...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface/30 p-12 text-center">
          <p className="text-lg font-semibold text-text">Δεν υπάρχουν pending SMS</p>
          <p className="mt-2 text-sm text-text-muted">Δεν βρέθηκαν πελάτες που να περιμένουν reminder αυτή τη στιγμή.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <article key={row.id} className="rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-text">{row.policy_holder || 'Άγνωστος πελάτης'}</h2>
                  <p className="text-sm text-text-muted">
                    {row.policy_number || 'N/A'} {row.insurer ? `• ${row.insurer}` : ''}
                  </p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {row.days_until_expiry ?? '—'} days
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-text-muted">
                <p>Expiry: {row.expiry_date || 'N/A'}</p>
                <p>Email: {row.email || 'N/A'}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
