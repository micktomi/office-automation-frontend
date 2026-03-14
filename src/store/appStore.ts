import { create } from 'zustand'

export type TabType = 'inbox' | 'clients' | 'insurance' | 'tasks' | 'activity'

interface AppState {
  currentTab: TabType
  selectedEmailId: string | null
  selectedClientId: string | null
  selectedPolicyId: string | null
  isAssistantOpen: boolean
  assistantMessage: string
  
  // Actions
  setTab: (tab: TabType) => void
  setSelectedEmail: (id: string | null) => void
  setSelectedClient: (id: string | null) => void
  setSelectedPolicy: (id: string | null) => void
  toggleAssistant: (open?: boolean) => void
  setAssistantMessage: (msg: string) => void
  
  // Get Context
  getContext: () => {
    currentTab: TabType
    selectedEmailId: string | null
    selectedClientId: string | null
    selectedPolicyId: string | null
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  currentTab: 'inbox',
  selectedEmailId: null,
  selectedClientId: null,
  selectedPolicyId: null,
  isAssistantOpen: false,
  assistantMessage: '',

  setTab: (tab) => set({ currentTab: tab }),
  setSelectedEmail: (id) => set({ selectedEmailId: id }),
  setSelectedClient: (id) => set({ selectedClientId: id }),
  setSelectedPolicy: (id) => set({ selectedPolicyId: id }),
  toggleAssistant: (open) => set((state) => ({ 
    isAssistantOpen: open !== undefined ? open : !state.isAssistantOpen 
  })),
  setAssistantMessage: (msg) => set({ assistantMessage: msg }),
  
  getContext: () => ({
    currentTab: get().currentTab,
    selectedEmailId: get().selectedEmailId,
    selectedClientId: get().selectedClientId,
    selectedPolicyId: get().selectedPolicyId,
  })
}))
