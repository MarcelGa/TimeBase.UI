import { apiClient } from './client'
import type {
  GetHistoricalDataResponse,
  GetHistoricalDataParams,
  GetDataSummaryResponse,
  GetProvidersForSymbolResponse,
} from '@/types/api'

export const dataApi = {
  // Get historical data for a symbol
  getHistorical: (params: GetHistoricalDataParams) =>
    apiClient.get<GetHistoricalDataResponse>(`/api/data/${params.symbol}`, {
      interval: params.interval,
      start: params.start,
      end: params.end,
      provider: params.provider,
    }),

  // Get data summary for a symbol
  getSummary: (symbol: string) =>
    apiClient.get<GetDataSummaryResponse>(`/api/data/${symbol}/summary`),

  // Get available providers for a symbol
  getProvidersForSymbol: (symbol: string) =>
    apiClient.get<GetProvidersForSymbolResponse>(`/api/data/${symbol}/providers`),
}
