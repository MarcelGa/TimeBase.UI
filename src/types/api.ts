// Provider types - matching backend TimeBase.Core.Infrastructure.Entities.Provider
export interface Provider {
  id: string
  slug: string
  name: string
  version: string
  enabled: boolean
  repositoryUrl: string
  imageUrl: string | null
  grpcEndpoint: string | null
  config: string | null
  capabilities: string | null
  createdAt: string
  updatedAt: string
}

export interface ProviderCapabilities {
  name: string
  version: string
  slug: string
  supportsHistorical: boolean
  supportsRealtime: boolean
  dataTypes: string[]
  intervals: string[]
}

export interface ProviderHealthInfo {
  id: string
  slug: string
  name: string
}

// Time series data types - matching backend TimeBase.Core.Infrastructure.Entities.TimeSeriesData
export interface TimeSeriesData {
  time: string // ISO date string
  symbol: string
  providerId: string
  interval: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  metadata: string | null
}

export interface DataSummary {
  symbol: string
  totalDataPoints: number
  earliestDate: string
  latestDate: string
  providers: number
  intervals: string[]
}

// API Response types - matching backend TimeBase.Core.Models
export interface GetProvidersResponse {
  providers: Provider[]
}

export interface GetProviderResponse {
  provider: Provider
}

export interface InstallProviderRequest {
  repository: string
}

export interface InstallProviderResponse {
  message: string
  provider: Provider
}

export interface UninstallProviderResponse {
  message: string
}

export interface SetProviderEnabledRequest {
  enabled: boolean
}

export interface SetProviderEnabledResponse {
  message: string
  provider: Provider
}

export interface RefreshProviderCapabilitiesResponse {
  message: string
  provider: Provider
  capabilities: ProviderCapabilities | null
}

export interface RefreshAllCapabilitiesResponse {
  message: string
  count: number
  providers: Provider[]
}

export interface CheckProviderHealthResponse {
  provider: ProviderHealthInfo
  healthy: boolean
  checkedAt: string
}

export interface GetHistoricalDataResponse {
  symbol: string
  interval: string
  start: string
  end: string
  count: number
  data: TimeSeriesData[]
}

export interface GetDataSummaryResponse {
  summary: DataSummary
}

export interface GetProvidersForSymbolResponse {
  symbol: string
  count: number
  providers: Provider[]
}

export interface ErrorResponse {
  error: string
}

// Query parameters
export interface GetHistoricalDataParams {
  symbol: string
  interval?: string
  start?: string
  end?: string
  providerId: string // Required - must specify which provider to fetch from
}
