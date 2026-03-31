'use client'

import { LayoutDashboard, Mail, Users, Shield, CheckSquare, History } from 'lucide-react'
import { useAppStore, TabType } from '@/store/appStore'
import { cn } from '@/lib/utils'
import locales from '@/locales/el.json'

const tabs = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: locales.tabs.inbox, icon: Mail },
  { id: 'clients', label: locales.tabs.clients, icon: Users },
  { id: 'insurance', label: locales.tabs.insurance, icon: Shield },
  { id: 'tasks', label: locales.tabs.tasks, icon: CheckSquare },
  { id: 'activity', label: 'Ιστορικό', icon: History },
] as const

export function TabBar() {
  const { currentTab, setTab } = useAppStore()

  return (
    <div className="bg-surface border-b border-border px-6">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id as TabType)}
              className={cn(
                "group flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all relative overflow-hidden",
                isActive 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-text-muted hover:text-text hover:bg-white/5 border-b-2 border-transparent"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-text-muted"
              )} />
              <span>{tab.label}</span>
              
              {isActive && (
                <div className="absolute inset-0 bg-primary/5 -z-10" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
