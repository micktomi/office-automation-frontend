'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  afm?: string
  phone?: string
}

export function ClientList({ searchTerm = '' }: { searchTerm?: string }) {
  const { selectedClientId, setSelectedClient } = useAppStore()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients')
        setClients(response.data)
      } catch (error) {
        console.error("Failed to fetch clients", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      (client.afm && client.afm.includes(search)) ||
      (client.phone && client.phone.includes(search))
    )
  })

  return (
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="p-8 text-center text-text-muted italic text-sm">Φόρτωση πελατών...</div>
      ) : filteredClients.length === 0 ? (
        <div className="p-8 text-center text-text-muted italic text-sm">
          {searchTerm ? 'Δεν βρέθηκαν αποτελέσματα.' : 'Δεν βρέθηκαν πελάτες.'}
        </div>
      ) : (
        filteredClients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client.id)}
            className={cn(
              "p-4 border-b border-border cursor-pointer transition-all hover:bg-white/5",
              selectedClientId === client.id ? "bg-accent/10 border-l-4 border-l-accent" : "border-l-4 border-l-transparent"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-text">{client.name}</p>
                <div className="flex items-center gap-3 mt-1 opacity-50 text-[10px] font-mono">
                  <span>{client.email}</span>
                  {client.afm && <span>• ΑΦΜ: {client.afm}</span>}
                </div>
              </div>
              {client.phone && (
                <div className="text-[10px] opacity-40">
                  {client.phone}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

