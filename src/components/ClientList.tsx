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
}

export function ClientList() {
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

  return (
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="p-8 text-center text-text-muted italic text-sm">Φόρτωση πελατών...</div>
      ) : clients.length === 0 ? (
        <div className="p-8 text-center text-text-muted italic text-sm">Δεν βρέθηκαν πελάτες.</div>
      ) : (
        clients.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client.id)}
            className={cn(
              "p-4 border-b border-border cursor-pointer transition-all hover:bg-white/5",
              selectedClientId === client.id ? "bg-accent/10 border-l-4 border-l-accent" : "border-l-4 border-l-transparent"
            )}
          >
            <p className="font-semibold text-text">{client.name}</p>
            <div className="flex items-center gap-3 mt-1 opacity-50 text-xs font-mono">
               <span>{client.email}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
