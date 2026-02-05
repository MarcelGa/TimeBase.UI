import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface UIState {
  // Sidebar state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // WebSocket connection status
  connectionStatus: ConnectionStatus
  setConnectionStatus: (status: ConnectionStatus) => void

  // Error message display
  errorMessage: string | null
  setErrorMessage: (message: string | null) => void
  clearError: () => void

  // Loading states
  isChartLoading: boolean
  setChartLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Connection status
      connectionStatus: 'disconnected',
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

      // Error handling
      errorMessage: null,
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      clearError: () => set({ errorMessage: null }),

      // Loading
      isChartLoading: false,
      setChartLoading: (isChartLoading) => set({ isChartLoading }),
    }),
    {
      name: 'timebase-ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
