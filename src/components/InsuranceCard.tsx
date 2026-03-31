'use client'

import { Shield, Calendar, User, CheckCircle2, XCircle, Bell, Smartphone } from 'lucide-react'
import locales from '@/locales/el.json'
import { cn } from '@/lib/utils'

interface InsuranceCardProps {
  policy: {
    id: string
    type: string
    policyNumber: string
    client: string
    expiryDate: string
    daysLeft: number
    status?: string
    lastNotifiedAt?: string | null
  }
  busy?: boolean
  onApprove: (id: string) => void
  onDismiss: (id: string) => void
  onNotify: (id: string) => void
  onSms: (id: string) => void
}

export function InsuranceCard({ policy, busy = false, onApprove, onDismiss, onNotify, onSms }: InsuranceCardProps) {
  const isUrgent = policy.daysLeft < 15
  const isWarning = policy.daysLeft >= 15 && policy.daysLeft <= 30
  const isNotified = policy.status === 'notified'

  return (
    <div className={cn(
      "bg-surface/30 border rounded-2xl p-6 transition-all hover:shadow-xl group",
      isUrgent ? "border-danger/40 bg-danger/5 shadow-danger/5" : 
      isWarning ? "border-warning/40 bg-warning/5 shadow-warning/5" : 
      isNotified ? "border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/5" :
      "border-border hover:border-primary/30"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            isUrgent ? "bg-danger text-white" : 
            isWarning ? "bg-warning text-background" : 
            isNotified ? "bg-emerald-500 text-white" :
            "bg-primary text-background"
          )}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{policy.type}</h3>
            <p className="text-xs font-mono opacity-50 uppercase tracking-widest">{policy.policyNumber}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-sm",
            isUrgent ? "bg-danger/20 text-danger border-danger/30 animate-pulse" : 
            isWarning ? "bg-warning/20 text-warning border-warning/30" : 
            isNotified ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" :
            "bg-white/5 text-text-muted border-border"
          )}>
            {policy.daysLeft} {policy.daysLeft === 1 ? 'μέρα' : 'μέρες'}
          </div>
          {isNotified && (
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Ήδη ειδοποιήθηκε
             </span>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 opacity-40" />
          <span className="font-medium">{policy.client}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 opacity-40" />
          <span className="font-mono text-xs">{policy.expiryDate}</span>
        </div>
        {isNotified && policy.lastNotifiedAt && (
          <div className="text-[10px] text-emerald-500/60 italic">
            Τελευταία ειδοποίηση: {new Date(policy.lastNotifiedAt).toLocaleString('el-GR')}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onApprove(policy.id)}
            disabled={busy}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-text-muted disabled:opacity-40"
            title={locales.insurance.actions.renewed}
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDismiss(policy.id)}
            disabled={busy}
            className="p-2 hover:bg-danger/10 hover:text-danger rounded-lg transition-all text-text-muted disabled:opacity-40"
            title={locales.insurance.actions.reject}
          >
            <XCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => onSms(policy.id)}
            disabled={busy}
            className="p-2 hover:bg-success/10 hover:text-success rounded-lg transition-all text-text-muted disabled:opacity-40"
            title="Αποστολή SMS υπενθύμισης"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onNotify(policy.id)}
          disabled={busy || isNotified}
          title={locales.insurance.actions.notify}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-black/20 disabled:opacity-40",
            isNotified 
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
              : "bg-white/5 hover:bg-white/10 group-hover:bg-primary group-hover:text-background"
          )}
        >
          <Bell className="w-4 h-4" />
          {isNotified ? "Ξαναστείλε" : locales.insurance.actions.notify}
        </button>
      </div>
    </div>
  )
}
