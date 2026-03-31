'use client'

import { useRef, useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { Shield, FileUp, Scan, RefreshCw, FileText } from 'lucide-react'
import { InsuranceCard } from '@/components/InsuranceCard'
import { apiService } from '@/lib/api'
import type { ActionResponse } from '@/lib/api'
import locales from '@/locales/el.json'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

interface InsuranceAlertApi {
  id?: string
  insurer?: string
  policy_number?: string
  policy_holder?: string
  expiry_date?: string
  days_until_expiry?: number
  status?: string
  last_notified_at?: string | null
}

interface PolicyCard {
  id: string
  type: string
  policyNumber: string
  client: string
  expiryDate: string
  daysLeft: number
  status?: string
  lastNotifiedAt?: string | null
}

interface UploadExcelResponse {
  imported?: number
  skipped_duplicates?: number
  skipped_invalid_rows?: number
  total_rows_in_file?: number
  mapping_used?: Record<string, string | null>
}

interface InsuranceScanResponse {
  scanned?: number
  alerts_created?: number
  already_processed?: number
}

type BannerTone = 'info' | 'success' | 'error'

interface BannerState {
  tone: BannerTone
  text: string
}

interface InsuranceViewProps {
  initialTab?: 'expiring' | 'expired'
}

export function InsuranceView({ initialTab = 'expiring' }: InsuranceViewProps) {
  const { requestDashboardRefresh } = useAppStore()
  const [activeTab, setActiveTab] = useState<'expiring' | 'expired'>(initialTab)
  const [policies, setPolicies] = useState<PolicyCard[]>([])
  const [counts, setCounts] = useState({ expiring: 0, expired: 0 })
  const [loading, setLoading] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [uploadingPDF, setUploadingPDF] = useState(false)
  const [actionLoadingIds, setActionLoadingIds] = useState<Record<string, boolean>>({})
  const [banner, setBanner] = useState<BannerState | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pdfInputRef = useRef<HTMLInputElement | null>(null)

  const fetchCounts = async () => {
    try {
      const summary = await apiService.getDashboardSummary()
      setCounts({
        expiring: summary.expiring_soon || 0,
        expired: summary.expired || 0,
      })
    } catch (error) {
      console.error('Failed to fetch counts', error)
    }
  }

  const fetchPolicies = async (options?: { silent?: boolean; successMessage?: string }) => {
    setLoading(true)
    try {
      const data = await apiService.getInsuranceAlertsByTab(activeTab)
      const alerts: InsuranceAlertApi[] = Array.isArray(data) ? data as InsuranceAlertApi[] : []
      setPolicies(alerts.map((p, index) => ({
        id: p.id || `policy-${index}`,
        type: p.insurer || 'Ασφάλεια',
        policyNumber: p.policy_number || 'N/A',
        client: p.policy_holder || 'Άγνωστος',
        expiryDate: p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('el-GR') : 'N/A',
        daysLeft: p.days_until_expiry || 0,
        status: p.status,
        lastNotifiedAt: p.last_notified_at
      })))
      if (options?.successMessage) {
        setBanner({ tone: 'success', text: options.successMessage })
      }
    } catch (error) {
      console.error("Failed to fetch policies", error)
      if (!options?.silent) {
        setBanner({ tone: 'error', text: 'Αποτυχία φόρτωσης ασφαλιστηρίων. Δοκίμασε ξανά.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const setPolicyLoading = (id: string, value: boolean) => {
    setActionLoadingIds((prev) => ({ ...prev, [id]: value }))
  }

  const handleApprove = async (id: string) => {
    setPolicyLoading(id, true)
    setBanner(null)
    console.log(`Approving policy with ID: ${id}`)
    try {
      const result = await apiService.callAction('insurance.approve', { alert_id: id })
      console.log('Approve result:', result)
      // Force refresh from server to be 100% sure
      await fetchCounts()
      await fetchPolicies({ silent: true })
      requestDashboardRefresh()
      setBanner({ tone: 'success', text: 'Το ασφαλιστήριο σημειώθηκε ως ανανεωμένο.' })
    } catch (error) {
      console.error('Approve alert failed', error)
      setBanner({ tone: 'error', text: 'Αποτυχία ενημέρωσης κατάστασης. Δοκίμασε ξανά.' })
    } finally {
      setPolicyLoading(id, false)
    }
  }

  const handleDismiss = async (id: string) => {
    setPolicyLoading(id, true)
    setBanner(null)
    console.log(`Dismissing policy with ID: ${id}`)
    try {
      const result = await apiService.callAction('insurance.dismiss', { alert_id: id })
      console.log('Dismiss result:', result)
      // Force refresh from server to be 100% sure
      await fetchCounts()
      await fetchPolicies({ silent: true })
      requestDashboardRefresh()
      setBanner({ tone: 'success', text: 'Το ασφαλιστήριο απορρίφθηκε και αφαιρέθηκε από τη λίστα.' })
    } catch (error) {
      console.error('Dismiss alert failed', error)
      setBanner({ tone: 'error', text: 'Αποτυχία ενημέρωσης κατάστασης. Δοκίμασε ξανά.' })
    } finally {
      setPolicyLoading(id, false)
    }
  }

  const handleSendSms = async (id: string) => {
    const policy = policies.find(p => p.id === id)
    if (!policy) return

    setPolicyLoading(id, true)
    setBanner(null)
    try {
      await apiService.callAction('messaging.send', {
        to: '6900000000', // This should ideally come from client data
        message: `Υπενθύμιση: Το συμβόλαιο ${policy.policyNumber} λήγει στις ${policy.expiryDate}.`,
        provider: 'sms',
        client_name: policy.client,
        policy_number: policy.policyNumber
      })
      setBanner({ tone: 'success', text: `Το SMS στάλθηκε επιτυχώς στον/στην ${policy.client}` })
    } catch (error) {
      console.error("Failed to send SMS", error)
      setBanner({ tone: 'error', text: 'Αποτυχία αποστολής SMS. Βεβαιωθείτε ότι οι ρυθμίσεις Twilio είναι σωστές.' })
    } finally {
      setPolicyLoading(id, false)
    }
  }

  const handleNotify = async (id: string) => {
    setPolicyLoading(id, true)
    setBanner({ tone: 'info', text: 'Αποστολή ειδοποίησης σε εξέλιξη...' })
    console.log(`Notifying policy with ID: ${id}`)
    try {
      await apiService.callAction('insurance.notify', { alert_id: id })
      // Refresh list to show 'notified' status
      await fetchCounts()
      await fetchPolicies({ silent: true })
      requestDashboardRefresh()
      setBanner({ tone: 'success', text: 'Η ειδοποίηση στάλθηκε επιτυχώς στον πελάτη.' })
    } catch (error) {
      console.error('Notify alert failed', error)
      setBanner({ tone: 'error', text: 'Αποτυχία αποστολής ειδοποίησης. Έλεγξε το email setup και δοκίμασε ξανά.' })
    } finally {
      setPolicyLoading(id, false)
    }
  }

  const handleScan = async () => {
    setLoading(true)
    setBanner({ tone: 'info', text: 'Σάρωση email σε εξέλιξη...' })
    try {
      const result = await apiService.callAction('insurance.scan') as ActionResponse
      await fetchCounts()
      await fetchPolicies({ silent: true })
      requestDashboardRefresh()

      const payload = (result?.data as InsuranceScanResponse | undefined) ?? {}
      const scanned = typeof payload?.scanned === 'number' ? payload.scanned : 0
      const alertsCreated = typeof payload?.alerts_created === 'number' ? payload.alerts_created : 0

      if (alertsCreated > 0) {
        setBanner({
          tone: 'success',
          text: `Η σάρωση ολοκληρώθηκε. Σαρώθηκαν ${scanned} email και δημιουργήθηκαν ${alertsCreated} νέες ειδοποιήσεις.`,
        })
      } else {
        setBanner({
          tone: 'info',
          text: `Η σάρωση ολοκληρώθηκε. Σαρώθηκαν ${scanned} email αλλά δεν βρέθηκαν νέες λήξεις.`,
        })
      }
    } catch (error) {
      console.error("Scan failed", error)
      setBanner({ tone: 'error', text: 'Αποτυχία σάρωσης email. Δοκιμάστε ξανά.' })
    } finally {
      setLoading(false)
    }
  }

  const handleExcelButtonClick = () => {
    if (loading || uploadingExcel) return
    fileInputRef.current?.click()
  }

  const handleExcelChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBanner(null)
    setUploadingExcel(true)
    try {
      const result = await apiService.uploadInsuranceExcel(file) as UploadExcelResponse
      await fetchCounts()
      await fetchPolicies({ silent: true })
      requestDashboardRefresh()

      const totalRows = typeof result.total_rows_in_file === 'number' ? result.total_rows_in_file : 0
      const imported = typeof result.imported === 'number' ? result.imported : 0
      const duplicates = typeof result.skipped_duplicates === 'number' ? result.skipped_duplicates : 0
      const invalidRows = typeof result.skipped_invalid_rows === 'number' ? result.skipped_invalid_rows : 0

      if (imported > 0) {
        setBanner({
          tone: 'success',
          text: `Το αρχείο "${file.name}" φορτώθηκε. Γραμμές: ${totalRows}, εισαγωγές: ${imported}, duplicates: ${duplicates}, άκυρες: ${invalidRows}.`,
        })
      } else {
        setBanner({
          tone: 'info',
          text: `Το αρχείο "${file.name}" αναλύθηκε. Γραμμές: ${totalRows}, εισαγωγές: ${imported}, duplicates: ${duplicates}, άκυρες: ${invalidRows}.`,
        })
      }
    } catch (error) {
      console.error('Excel upload failed', error)
      setBanner({ tone: 'error', text: 'Αποτυχία φόρτωσης Excel. Ελέγξτε endpoint ή format αρχείου.' })
    } finally {
      setUploadingExcel(false)
      event.target.value = ''
    }
  }

  const handlePdfButtonClick = () => {
    if (loading || uploadingPDF) return
    pdfInputRef.current?.click()
  }

  const handlePdfChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBanner(null)
    setUploadingPDF(true)
    try {
      const result = await apiService.uploadInsurancePDF(file)
      await fetchCounts()
      await fetchPolicies({ silent: true })
      requestDashboardRefresh()

      // Check if it was imported or already exists or not expiring soon
      if (result.policy_id && result.message?.includes('εισήχθη')) {
        setBanner({
          tone: 'success',
          text: `Το PDF "${file.name}" αναλύθηκε επιτυχώς. Εξάχθηκαν: ${result.extracted?.client_name || 'N/A'}, Policy: ${result.extracted?.policy_number || 'N/A'}, Λήξη: ${result.extracted?.expiry_date || 'N/A'}.`,
        })
      } else if (result.message?.includes('υπάρχει')) {
        setBanner({
          tone: 'info',
          text: `Το ασφαλιστήριο από το PDF υπάρχει ήδη στη βάση.`,
        })
      } else if (result.message?.includes('δεν λήγει')) {
        setBanner({
          tone: 'info',
          text: `Το ασφαλιστήριο δεν λήγει σύντομα (${result.days_until_expiry} ημέρες).`,
        })
      } else {
        setBanner({
          tone: 'info',
          text: result.message || 'Το PDF αναλύθηκε.',
        })
      }
    } catch (error) {
      console.error('PDF upload failed', error)
      const errorMsg =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail)
          : undefined
      setBanner({
        tone: 'error',
        text: errorMsg || 'Αποτυχία φόρτωσης PDF. Ελέγξτε το αρχείο.',
      })
    } finally {
      setUploadingPDF(false)
      event.target.value = ''
    }
  }

  const handleRefresh = async () => {
    await fetchCounts()
    await fetchPolicies({ successMessage: 'Η λίστα ασφαλιστηρίων ανανεώθηκε.' })
    requestDashboardRefresh()
  }

  useEffect(() => {
    fetchCounts()
    fetchPolicies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchPolicies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-10 pb-6 border-b border-white/5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/10">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{locales.tabs.insurance}</h2>
            <p className="text-text-muted text-sm italic">Διαχείριση λήξεων και ειδοποιήσεων</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExcelButtonClick}
            disabled={loading || uploadingExcel || uploadingPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-white/5 transition-all shadow-lg disabled:opacity-50"
          >
            <FileUp className="w-4 h-4" />
            {uploadingExcel ? "..." : locales.insurance.actions.load_excel}
          </button>
          <button
            onClick={handlePdfButtonClick}
            disabled={loading || uploadingExcel || uploadingPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-white/5 transition-all shadow-lg disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {uploadingPDF ? "..." : "Φόρτωση PDF"}
          </button>
          <button
            onClick={handleScan}
            disabled={loading || uploadingExcel || uploadingPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-white/5 transition-all shadow-lg disabled:opacity-50"
          >
            <Scan className={cn("w-4 h-4", loading && "animate-pulse")} />
            {loading ? "..." : locales.insurance.actions.scan_email}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || uploadingExcel || uploadingPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            {loading ? "..." : locales.insurance.actions.refresh}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        onChange={handleExcelChange}
        className="hidden"
      />

      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handlePdfChange}
        className="hidden"
      />

      <div className="mb-6 flex gap-2 p-1 bg-surface border border-border rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('expiring')}
          className={cn(
            'px-6 py-2.5 rounded-lg text-sm font-bold transition-all',
            activeTab === 'expiring'
              ? 'bg-primary text-black shadow-lg shadow-primary/20'
              : 'text-text-muted hover:text-text hover:bg-white/5'
          )}
        >
          🟡 Λήγουν ({counts.expiring})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={cn(
            'px-6 py-2.5 rounded-lg text-sm font-bold transition-all',
            activeTab === 'expired'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-text-muted hover:text-text hover:bg-white/5'
          )}
        >
          🔴 Ληγμένα ({counts.expired})
        </button>
      </div>

      {banner && (
        <div
          className={cn(
            'mb-6 rounded-2xl border px-4 py-3 text-sm',
            banner.tone === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
            banner.tone === 'error' && 'border-danger/30 bg-danger/10 text-red-200',
            banner.tone === 'info' && 'border-primary/20 bg-primary/10 text-text'
          )}
        >
          {banner.text}
        </div>
      )}

      {policies.length === 0 && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-surface/20 border border-dashed border-border rounded-3xl text-center">
          <Shield className="w-12 h-12 text-primary opacity-20 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{locales.insurance.empty}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {policies.map((policy) => (
            <InsuranceCard
              key={policy.id}
              policy={policy}
              busy={actionLoadingIds[policy.id]}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
              onNotify={handleNotify}
              onSms={handleSendSms}
            />

          ))}
        </div>
      )}
    </div>
  )
}
