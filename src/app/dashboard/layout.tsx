'use client'

import { Navbar } from '@/components/Navbar'
import { TabBar } from '@/components/TabBar'
import { FloatingAssistant } from '@/components/FloatingAssistant'
// Removed unused imports

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary/30">
      <Navbar />
      <TabBar />
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
      <FloatingAssistant />
    </div>
  )
}
