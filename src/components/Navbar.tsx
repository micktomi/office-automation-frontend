'use client'

import { Settings, LogOut, ChevronDown } from 'lucide-react'
import locales from '@/locales/el.json'

export function Navbar() {
  return (
    <nav className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-primary">🏢 {locales.app.title}</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
          <span className="text-sm font-medium">{locales.app.user_placeholder}</span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-text" title={locales.app.settings}>
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-danger" title={locales.app.logout}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
