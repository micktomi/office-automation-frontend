'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Mail, Fingerprint, Shield, Mail as MailIcon, CheckSquare, FileText, Folder, Loader2 } from 'lucide-react'
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

export function ClientProfile() {
  const { selectedClientId } = useAppStore()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedClientId) {
      setClient(null)
      return
    }

    const fetchClientDetails = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/clients/${selectedClientId}`)
        setClient(response.data)
      } catch (error) {
        console.error("Failed to fetch client details", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientDetails()
  }, [selectedClientId])

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

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-6 pb-8 border-b border-border">
          <div className="w-24 h-24 rounded-3xl bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-accent shadow-2xl shadow-accent/10">
            <User className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-text">{client.name}</h1>
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
...
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Insurance Policies Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-primary mb-6">
              <Shield className="w-5 h-5" />
              {locales.clients.sections.insurance}
            </h3>
            <div className="space-y-3 opacity-60 italic text-sm">
              <p>Φορτώνονται τα ενεργά συμβόλαια...</p>
            </div>
          </div>

          {/* Emails Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-accent/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-accent mb-6">
              <MailIcon className="w-5 h-5" />
              {locales.clients.sections.emails}
            </h3>
            <div className="space-y-3 opacity-60 italic text-sm">
              <p>Φορτώνεται το ιστορικό επικοινωνίας...</p>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-warning/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-warning mb-6">
              <CheckSquare className="w-5 h-5" />
              {locales.clients.sections.tasks}
            </h3>
            <div className="space-y-3 opacity-60 italic text-sm">
              <p>Δεν υπάρχουν εκκρεμείς εργασίες.</p>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-surface/30 border border-border rounded-2xl p-6 hover:border-text/30 transition-all group">
            <h3 className="flex items-center gap-2 font-bold text-text-muted mb-6">
              <FileText className="w-5 h-5" />
              {locales.clients.sections.documents}
            </h3>
            <div className="space-y-3 opacity-60 italic text-sm text-center py-4 border-2 border-dashed border-border rounded-xl">
              <p>Σύρετε αρχεία εδώ για μεταφόρτωση</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
