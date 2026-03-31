'use client'

import { useAppStore } from '@/store/appStore'
import { motion, AnimatePresence } from 'framer-motion'
import { InboxView } from '@/components/InboxView'
import ClientsPage from './clients/page'
import { InsuranceView } from '@/components/InsuranceView'
import TasksPage from './tasks/page'
import ActivityPage from './activity/page'
import { DailySummary } from '@/components/DailySummary'

export default function Dashboard() {
  const { currentTab } = useAppStore()

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <DailySummary key="home" />
      case 'inbox':
        return <InboxView key="inbox" />
      case 'clients':
        return <ClientsPage key="clients" />
      case 'insurance':
        return <InsuranceView key="insurance" />
      case 'tasks':
        return <TasksPage key="tasks" />
      case 'activity':
        return <ActivityPage key="activity" />
      default:
        return <InboxView key="inbox" />
    }
  }

  return (
    <div className="h-full overflow-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
