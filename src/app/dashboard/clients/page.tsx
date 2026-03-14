'use client'

import { useState } from 'react'
import { Users, UserPlus, Search, X, Loader2 } from 'lucide-react'
import { ClientList } from '@/components/ClientList'
import { ClientProfile } from '@/components/ClientProfile'
import api from '@/lib/api'
import locales from '@/locales/el.json'

export default function ClientsPage() {
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', afm: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/clients', newClient)
      setShowNewClientForm(false)
      setNewClient({ name: '', email: '', phone: '', afm: '' })
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error("Failed to create client", error)
      alert("Αποτυχία δημιουργίας πελάτη. Ίσως το email υπάρχει ήδη.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full relative">
      {/* Client List - 35% */}
      <div className="w-[35%] border-r border-border bg-surface/30 flex flex-col">
        <div className="p-4 border-b border-border space-y-4 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-primary">
              <Users className="w-4 h-4" />
              {locales.tabs.clients}
            </h2>
            <button 
              onClick={() => setShowNewClientForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-background text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {locales.clients.new_client}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={locales.clients.search}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
        
        <ClientList key={refreshKey} />
      </div>

      {/* Client Folder - 65% */}
      <div className="flex-1 bg-background/50 flex flex-col overflow-hidden">
        <ClientProfile />
      </div>

      {/* New Client Modal Overlay */}
      {showNewClientForm && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                <UserPlus className="w-5 h-5" />
                Νέος Πελάτης
              </h3>
              <button onClick={() => setShowNewClientForm(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">Ονοματεπώνυμο</label>
                <input 
                  required
                  autoFocus
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm transition-all"
                  placeholder="π.χ. Ιωάννης Παπαδόπουλος"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">Email</label>
                <input 
                  required
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm transition-all"
                  placeholder="π.χ. john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">Τηλέφωνο</label>
                  <input 
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm transition-all"
                    placeholder="69..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">ΑΦΜ</label>
                  <input 
                    value={newClient.afm}
                    onChange={(e) => setNewClient({...newClient, afm: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-sm transition-all"
                    placeholder="123..."
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-background font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Αποθήκευση Πελάτη'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
