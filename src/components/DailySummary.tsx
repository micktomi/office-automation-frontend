'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, Mail, MessageSquare, AlertCircle, Send, CheckSquare, ExternalLink, RefreshCw, LucideIcon } from 'lucide-react'
import api, { apiService, EXPIRING_POLICIES_DAYS, type DashboardSummary } from '@/lib/api'
import { useAppStore } from '@/store/appStore'

const ROUTES = {
  emails: "/emails?status=pending",
  sms: "/sms?status=pending",
  expiring: "/policies?status=expiring",
  expired: "/policies?status=expired",
} as const

interface SummaryData {
  expiring_soon: number
  expired: number
  emails_pending: number
  sms_pending: number
}

interface SummaryCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  badge: string
  color: string
  href: string
}

interface ActionButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => Promise<void> | void
  loading?: boolean
  loadingLabel?: string
  variant?: 'primary' | 'secondary'
  hidden?: boolean
  href?: string
}

export function DailySummary() {
  const { dashboardRefreshTick, requestDashboardRefresh } = useAppStore()
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true)
      try {
        const response: DashboardSummary = await apiService.getDashboardSummary()
        setData(response)
      } catch (error) {
        console.error('Failed to fetch summary:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [dashboardRefreshTick])

  const handleBulkSMS = async () => {
    if (!confirm('Θέλετε να στείλετε SMS υπενθύμισης σε όλους όσους λήγουν σε 10 ημέρες;')) return
    
    setIsSending(true)
    try {
      const res = await api.post('/insurance/batch-sms-reminders', null, { params: { days: 10 } })
      alert(`Στάλθηκαν ${res.data.sent} SMS επιτυχώς!`)
      requestDashboardRefresh()
    } catch (error) {
      console.error('Batch SMS failed:', error)
      alert('Η αποστολή απέτυχε.')
    } finally {
      setIsSending(false)
    }
  }

  if (loading) return <div className="p-8 animate-pulse text-text-muted">Φόρτωση περίληψης...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-text mb-2">Σήμερα στο γραφείο</h1>
        <p className="text-text-muted italic">Αυτές είναι οι εκκρεμότητες της ημέρας</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <SummaryCard 
          icon={ShieldAlert} 
          title={formatExpiringTitle(data?.expiring_soon || 0)} 
          subtitle={`0-${EXPIRING_POLICIES_DAYS} ημέρες`} 
          badge="Απαιτεί ενέργεια"
          color="text-primary"
          href={ROUTES.expiring}
        />
        <SummaryCard 
          icon={AlertCircle} 
          title={formatExpiredTitle(data?.expired || 0)} 
          subtitle="λήξη < σήμερα" 
          badge="Καθυστέρηση"
          color="text-red-400"
          href={ROUTES.expired}
        />
        <SummaryCard 
          icon={MessageSquare} 
          title={formatEmailsTitle(data?.emails_pending || 0)} 
          subtitle="θέλουν απάντηση" 
          badge="Νέα"
          color="text-yellow-400"
          href={ROUTES.emails}
        />
        <SummaryCard 
          icon={Mail} 
          title={formatSmsTitle(data?.sms_pending || 0)} 
          subtitle={`λήξη έως ${EXPIRING_POLICIES_DAYS} ημέρες και 0 υπενθυμίσεις`} 
          badge="Απαιτεί ενέργεια"
          color="text-blue-400"
          href={ROUTES.sms}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <ActionButton 
          icon={Send} 
          label="Αποστολή SMS σε λήξεις 10 ημερών" 
          onClick={handleBulkSMS}
          loading={isSending}
          loadingLabel="Γίνεται αποστολή..."
          variant="primary"
        />
        <ActionButton 
          icon={RefreshCw} 
          label="Ανανέωση dashboard" 
          onClick={requestDashboardRefresh}
          loading={loading}
          variant="secondary"
        />
        <ActionButton 
          icon={CheckSquare} 
          label="Δημιούργησε εργασίες" 
          onClick={() => {}}
          hidden
        />
        <ActionButton 
          icon={ExternalLink} 
          label="Άνοιξε emails" 
          onClick={() => {}}
          href={ROUTES.emails}
        />
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, title, subtitle, color, badge, href }: SummaryCardProps) {
  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface p-6 rounded-xl border border-border flex items-center gap-6 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className={`p-4 rounded-full bg-white/5 ${color}`}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text">{title}</h3>
          <p className="text-sm text-text-muted">{subtitle}</p>
          <span className="mt-3 inline-flex items-center rounded-full border border-border bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {badge}
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

function ActionButton({ icon: Icon, label, onClick, loading, loadingLabel, variant, hidden, href }: ActionButtonProps) {
  if (hidden) {
    return null
  }

  const className = `flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all ${
    variant === 'primary'
      ? 'bg-primary text-black hover:bg-primary/90'
      : 'bg-surface border border-border text-text hover:bg-white/5'
  } disabled:opacity-50`

  const content = (
    <>
      <Icon size={18} />
      <span>{loading ? (loadingLabel ?? label) : label}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={className}
    >
      {content}
    </button>
  )
}

function formatExpiringTitle(count: number) {
  return `${count} ${count === 1 ? 'συμβόλαιο λήγει' : 'συμβόλαια λήγουν'}`
}

function formatExpiredTitle(count: number) {
  return `${count} ${count === 1 ? 'συμβόλαιο έχει λήξει' : 'συμβόλαια έχουν λήξει'}`
}

function formatEmailsTitle(count: number) {
  return `${count} ${count === 1 ? 'email περιμένει απάντηση' : 'emails περιμένουν απάντηση'}`
}

function formatSmsTitle(count: number) {
  return `${count} ${count === 1 ? 'SMS περιμένει απάντηση' : 'SMS περιμένουν απάντηση'}`
}
