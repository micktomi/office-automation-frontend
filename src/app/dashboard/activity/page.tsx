'use client'

import { useState, useEffect } from 'react'
import { History, RefreshCw, CheckCircle2, XCircle, Mail, MessageSquare, Calendar as CalendarIcon } from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface ActivityLog {
  id: number
  action_type: string
  client_name: string
  policy_number: string
  channel: string
  status: string
  created_at: string
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const response = await api.get('/activity')
      setLogs(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Failed to fetch activity logs", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [])

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      case 'calendar': return <CalendarIcon className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-success" />
    return <XCircle className="w-4 h-4 text-danger" />
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <History className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ιστορικό Ενεργειών</h1>
            <p className="text-text-muted text-sm">Παρακολούθηση όλων των αυτοματοποιημένων ενεργειών του γραφείου</p>
          </div>
        </div>
        <button 
          onClick={fetchActivity}
          className="p-3 hover:bg-white/5 rounded-xl transition-colors border border-border"
          disabled={loading}
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-surface/30 border border-border rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Ώρα</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Πελάτης</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Συμβόλαιο</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Ενέργεια</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Κανάλι</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Κατάσταση</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted italic">
                    Φόρτωση δεδομένων...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted italic">
                    Δεν βρέθηκαν ενέργειες στο ιστορικό.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono whitespace-nowrap opacity-60">
                      {new Date(log.created_at).toLocaleString('el-GR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold group-hover:text-primary transition-colors">
                      {log.client_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono opacity-60">
                      {log.policy_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.action_type}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 opacity-80 uppercase tracking-tighter text-xs font-bold">
                        {getChannelIcon(log.channel)}
                        {log.channel}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={cn(
                          "text-xs font-bold uppercase",
                          log.status === 'success' ? "text-success" : "text-danger"
                        )}>
                          {log.status === 'success' ? 'Επιτυχία' : 'Αποτυχία'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
