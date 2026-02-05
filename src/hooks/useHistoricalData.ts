import { useQuery } from '@tanstack/react-query'
import { dataApi } from '@/api/data'
import type { GetHistoricalDataParams } from '@/types/api'

// Query keys
export const dataKeys = {
  all: ['data'] as const,
  historical: () => [...dataKeys.all, 'historical'] as const,
  historicalData: (params: GetHistoricalDataParams) => [...dataKeys.historical(), params] as const,
  summaries: () => [...dataKeys.all, 'summary'] as const,
  summary: (symbol: string) => [...dataKeys.summaries(), symbol] as const,
  providers: () => [...dataKeys.all, 'providers'] as const,
  providersForSymbol: (symbol: string) => [...dataKeys.providers(), symbol] as const,
}

// Parameters for the hook - providerId can be null/undefined when not yet selected
export interface UseHistoricalDataParams {
  symbol: string
  interval?: string
  start?: string
  end?: string
  providerId: string | null | undefined
}

// Get historical data
export function useHistoricalData(params: UseHistoricalDataParams, options?: { enabled?: boolean }) {
  const hasProviderId = !!params.providerId
  
  return useQuery({
    queryKey: dataKeys.historicalData(params as GetHistoricalDataParams),
    queryFn: () => dataApi.getHistorical({
      symbol: params.symbol,
      interval: params.interval,
      start: params.start,
      end: params.end,
      providerId: params.providerId!, // Safe - only called when enabled
    }),
    enabled: options?.enabled !== false && !!params.symbol && hasProviderId,
    staleTime: 60000, // Consider data stale after 1 minute
  })
}

// Get data summary for a symbol
export function useDataSummary(symbol: string) {
  return useQuery({
    queryKey: dataKeys.summary(symbol),
    queryFn: () => dataApi.getSummary(symbol),
    select: (data) => data.summary,
    enabled: !!symbol,
  })
}

// Get available providers for a symbol
export function useProvidersForSymbol(symbol: string) {
  return useQuery({
    queryKey: dataKeys.providersForSymbol(symbol),
    queryFn: () => dataApi.getProvidersForSymbol(symbol),
    select: (data) => data.providers,
    enabled: !!symbol,
  })
}
