import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChartInterval, PriceInfo } from '@/types/chart'

interface ChartState {
  // Current symbol being viewed
  symbol: string
  setSymbol: (symbol: string) => void

  // Current interval
  interval: ChartInterval
  setInterval: (interval: ChartInterval) => void

  // Date range
  startDate: Date | null
  endDate: Date | null
  setDateRange: (start: Date | null, end: Date | null) => void

  // Current price info (from crosshair or latest)
  currentPrice: PriceInfo | null
  setCurrentPrice: (price: PriceInfo | null) => void

  // Selected provider slug (optional filter)
  selectedProviderSlug: string | null
  setSelectedProviderSlug: (slug: string | null) => void

  // Recent symbols (history)
  recentSymbols: string[]
  addRecentSymbol: (symbol: string) => void

  // Chart settings
  showVolume: boolean
  setShowVolume: (show: boolean) => void
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      // Default symbol
      symbol: 'AAPL',
      setSymbol: (symbol) =>
        set((state) => {
          // Add to recent symbols when changing
          const recentSymbols = [
            symbol,
            ...state.recentSymbols.filter((s) => s !== symbol),
          ].slice(0, 10)
          return { symbol, recentSymbols }
        }),

      // Default interval
      interval: '1d',
      setInterval: (interval) => set({ interval }),

      // Date range (null = use defaults)
      startDate: null,
      endDate: null,
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),

      // Current price
      currentPrice: null,
      setCurrentPrice: (currentPrice) => set({ currentPrice }),

      // Provider filter
      selectedProviderSlug: null,
      setSelectedProviderSlug: (selectedProviderSlug) => set({ selectedProviderSlug }),

      // Recent symbols
      recentSymbols: [],
      addRecentSymbol: (symbol) =>
        set((state) => ({
          recentSymbols: [
            symbol,
            ...state.recentSymbols.filter((s) => s !== symbol),
          ].slice(0, 10),
        })),

      // Chart settings
      showVolume: true,
      setShowVolume: (showVolume) => set({ showVolume }),
    }),
    {
      name: 'timebase-chart-store',
      partialize: (state) => ({
        symbol: state.symbol,
        interval: state.interval,
        recentSymbols: state.recentSymbols,
        showVolume: state.showVolume,
        selectedProviderSlug: state.selectedProviderSlug,
      }),
    }
  )
)
