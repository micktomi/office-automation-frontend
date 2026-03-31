'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Fingerprint, Shield, Mail as MailIcon, CheckSquare, FileText, Folder, Loader2, Trash2, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import locales from '@/locales/el.json'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  afm?: string
}

interface Policy {
  id: number
  policy_number: string | null
  insurer: string | null
  expiry_date: string
  status: string
  days_left: number
}

interface Email {
  id: number
  subject: string
  sent_at: string | null
  status: string
}

export function ClientProfile() {
  const { selectedClientId, setSelectedClient } = useAppStore()
  const [client, setClient] = useState<Client | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    if (!selectedClientId) {
      setClient(null)
      setPolicies([])
      setEmails([])
      return
    }

    const fetchAllData = async () => {
      setLoading(true)
      try {
        const [clientRes, policiesRes, emailsRes] = await Promise.all([
          api.get(`/clients/${selectedClientId}`),
          api.get(`/clients/${selectedClientId}/policies`),
          api.get(`/clients/${selectedClientId}/emails`)
        ])
        
        setClient(clientRes.data)
        setPolicies(policiesRes.data)
        setEmails(emailsRes.data)
      } catch (error) {
        console.error("Failed to fetch client data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [selectedClientId])

  const handleDeleteClient = async () => {
    if (!selectedClientId) return
    setIsDeleting(true)
    try {
      await api.delete(`/clients/${selectedClientId}`)
      setSelectedClient(null)
      setShowConfirmDelete(false)
      window.location.reload() 
    } catch (error) {
      console.error("Failed to delete client", error)
      alert("Αποτυχία διαγραφής πελάτη.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!selectedClientId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20">
        <Folder className="w-24 h-24 mb-6" />
        <p className="text-xl font-medium italic">Επιλέξτε έναν πελάτη για να δείτε τον φάκελο</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin opacity-20" />
      </div>
    )
  }

  if (!client) return null

  const getClientStatus = () => {
    if (policies.length === 0) return { label: 'Χωρίς Συμβόλαια', color: 'text-text-muted bg-text-muted/10' }
    const soonExpiring = policies.some(p => p.days_left >= 0 && p.days_left <= 15)
    if (soonExpiring) return { label: 'Λήγει Σύντομα', color: 'text-red-400 bg-red-400/10 border-red-400/20' }
    return { label: 'Ενεργός', color: 'text-green-400 bg-green-400/10 border-green-400/20' }
  }

  const status = getClientStatus()

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-8 border-b border-border">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-accent shadow-2xl shadow-accent/10">
              <User className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-text">{client.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-text-muted">
                <span className="flex items-center gap-1.5 text-sm font-mono">
                  <Fingerprint className="w-4 h-4" /> ΑΦΜ: {client.afm || '-'}
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Phone className="w-4 h-4" /> {client.phone || '-'}
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Mail className="w-4 h-4" /> {client.email}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowConfirmDelete(true)}
            className="p-3 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all border border-transparent hover:border-red-400/20"
            title="Διαγραφή Πελάτη"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        {/* Delete Confirmation Overlay */}
        {showConfirmDelete && (
          <div className="p-6 bg-red-400/5 border border-red-400/20 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-red-400">Είστε σίγουροι;</p>
                <p className="text-sm text-red-400/70">Η διαγραφή θα αφαιρέσει τον πελάτη και όλα τα συμβόλαιά του.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-white/5 rounded-xl transition-colors"
              >
                Ακύρωση
              </button>
              <button 
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-400 text-background text-sm font-bold rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Διαγραφή...' : 'Ναι, Διαγραφή'}
              </button>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Policies Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-primary mb-6">
              <Shield className="w-5 h-5" />
              {locales.clients.sections.insurance}
            </h3>
            {policies.length > 0 ? (
              <div className="space-y-3">
                {policies.map(p => (
                  <div key={p.id} className="p-3 bg-background/50 rounded-xl border border-border/50 text-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold">{p.insurer || 'Συμβόλαιο'}</p>
                      <p className="text-xs text-text-muted">{p.policy_number || 'Χωρίς αρ.'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${p.days_left >= 0 && p.days_left <= 15 ? 'text-red-400 animate-pulse' : p.days_left < 30 ? 'text-orange-400' : 'text-green-400'}`}>
                        Λήξη: {new Date(p.expiry_date).toLocaleDateString('el-GR')}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                         {p.days_left >= 0 && p.days_left <= 15 && (
                           <span className="text-[8px] px-1 bg-red-400 text-background font-bold rounded">ΛΗΓΕΙ ΣΥΝΤΟΜΑ</span>
                         )}
                         <p className="text-[10px] opacity-50 uppercase tracking-tighter">{p.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-40 italic">Δεν βρέθηκαν συμβόλαια</p>
            )}
          </div>

          {/* Emails Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-accent/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-accent mb-6">
              <MailIcon className="w-5 h-5" />
              {locales.clients.sections.emails}
            </h3>
            {emails.length > 0 ? (
              <div className="space-y-3">
                {emails.map(e => (
                  <div key={e.id} className="p-3 bg-background/50 rounded-xl border border-border/50 text-sm">
                    <p className="font-medium truncate">{e.subject}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] opacity-50">{e.sent_at ? new Date(e.sent_at).toLocaleString('el-GR') : '-'}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-full border border-accent/20 uppercase font-bold">
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                <div className="p-3 bg-background/50 rounded-xl border border-border/50 text-sm">
                   <p className="font-medium">Ενημέρωση Ανανέωσης Συμβολαίου</p>
                   <p className="text-[10px] mt-1 italic">Demo Entry</p>
                </div>
                <div className="p-3 bg-background/50 rounded-xl border border-border/50 text-sm">
                   <p className="font-medium">Προσφορά Ασφάλισης Υγείας</p>
                   <p className="text-[10px] mt-1 italic">Demo Entry</p>
                </div>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-warning/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-warning mb-6">
              <CheckSquare className="w-5 h-5" />
              {locales.clients.sections.tasks}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-background/50 rounded-xl border border-border/50 text-sm flex items-center gap-3">
                <div className="w-5 h-5 rounded border border-warning/50 flex items-center justify-center text-warning">
                  <CheckSquare className="w-3 h-3 opacity-0" />
                </div>
                <div>
                  <p className="font-medium">Επικοινωνία για ανανέωση αυτοκινήτου</p>
                  <p className="text-[10px] text-text-muted">Υψηλή Προτεραιότητα • Λήξη σε 2 μέρες</p>
                </div>
              </div>
              <p className="text-xs text-text-muted italic px-2">Δεν υπάρχουν άλλες εκκρεμότητες.</p>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-text/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-text-muted mb-6">
              <FileText className="w-5 h-5" />
              {locales.clients.sections.documents}
            </h3>
            <div className="space-y-4 text-center py-6 border-2 border-dashed border-border rounded-2xl bg-background/20 group-hover:bg-background/40 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Folder className="w-8 h-8 text-text-muted/40" />
                <p className="text-sm font-medium">Σύρετε αρχεία εδώ</p>
                <p className="text-[10px] text-text-muted px-6 leading-relaxed">
                  Το σύστημα αναγνωρίζει αυτόματα τον πελάτη και ενημερώνει το ιστορικό του.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

