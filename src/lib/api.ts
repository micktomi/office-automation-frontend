import axios from 'axios'
import type { CreateTaskPayload } from '@/types/task'

export const EXPIRING_POLICIES_DAYS = 15

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }

  if (typeof window !== 'undefined') {
    const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    if (isLocalHost) {
      return 'http://localhost:3001'
    }

    console.warn('NEXT_PUBLIC_API_URL is not set. Falling back to same-origin API requests.')
  }

  return ''
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export interface ChatRequest {
  message: string
  context: {
    currentTab: string
    selectedEmailId: string | null
    selectedClientId: string | null
    selectedPolicyId: string | null
    lastActionPerformed?: string | null
    lastActionData?: unknown
    recentMessages?: Array<{
      role: 'user' | 'assistant'
      content: string
    }>
  }
}

export interface ActionResponse {
  response: string
  action_performed?: string
  data?: unknown
}

export interface DashboardSummary {
  expiring_soon: number
  expired: number
  emails_pending: number
  sms_pending: number
}

export const apiService = {
  // Backend compatibility dispatcher
  callAction: async (action: string, payload: Record<string, unknown> = {}): Promise<ActionResponse> => {
    const response = await api.post('/agent/action', { action, payload })
    return response.data
  },

  // Assistant compatibility endpoint
  chat: async (data: ChatRequest) => {
    const response = await api.post('/assistant/chat', data)
    return response.data
  },

  // Dev auth compatibility
  devLogin: async () => {
    const response = await api.post('/auth/dev-login', {
      email: 'admin@test-agent.app',
      password: 'password123',
    })
    return response.data
  },

  // Google OAuth start URL
  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google/start')
    return response.data
  },

  // Upload utility for insurance files
  uploadDocument: async (fileOrFormData: File | FormData) => {
    let formData: FormData
    if (fileOrFormData instanceof File) {
      formData = new FormData()
      formData.append('file', fileOrFormData)
    } else {
      formData = fileOrFormData
    }

    const response = await api.post('/insurance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  uploadInsuranceExcel: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/insurance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  uploadInsurancePDF: async (file: File, warningDays = 90) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(`/insurance/upload-pdf?warning_days=${warningDays}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getDashboardSummary: async (days = EXPIRING_POLICIES_DAYS): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary', {
      params: {
        days,
        _: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        Pragma: 'no-cache',
      },
    })
    return response.data
  },

  getInsuranceAlertsByTab: async (tab: 'expiring' | 'expired', days = EXPIRING_POLICIES_DAYS) => {
    const response = await api.get('/insurance/alerts', {
      params: { tab, days },
    })
    return response.data
  },
}

export const getEmails = () => apiService.callAction('email.list')
export const syncEmails = () => apiService.callAction('email.sync')
export const getInsuranceAlerts = (status?: string) =>
  apiService.callAction('insurance.alerts', status ? { status } : {})
export const scanPolicies = () => apiService.callAction('insurance.scan')
export const approveInsuranceAlert = (id: string, draft?: string) =>
  apiService.callAction('insurance.approve', { alert_id: id, edited_draft: draft })
export const dismissInsuranceAlert = (id: string) =>
  apiService.callAction('insurance.dismiss', { alert_id: id })
export const createTask = (data: CreateTaskPayload) =>
  apiService.callAction('tasks.create', { ...data })
export const updateTaskStatus = (id: string, completed: boolean) =>
  apiService.callAction('tasks.complete', { task_id: id, completed })
export const callAction = apiService.callAction
export const uploadDocument = apiService.uploadDocument

export default api
