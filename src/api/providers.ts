import { apiClient } from './client'
import type {
  GetProvidersResponse,
  GetProviderResponse,
  InstallProviderRequest,
  InstallProviderResponse,
  UninstallProviderResponse,
  SetProviderEnabledRequest,
  SetProviderEnabledResponse,
  RefreshProviderCapabilitiesResponse,
  RefreshAllCapabilitiesResponse,
  CheckProviderHealthResponse,
  GetProviderSymbolsResponse,
} from '@/types/api'

export const providersApi = {
  // Get all providers
  getAll: () => apiClient.get<GetProvidersResponse>('/api/providers'),

  // Get provider by slug
  getBySlug: (slug: string) =>
    apiClient.get<GetProviderResponse>(`/api/providers/${slug}`),

  // Install a new provider
  install: (request: InstallProviderRequest) =>
    apiClient.post<InstallProviderResponse>('/api/providers', request),

  // Uninstall a provider
  uninstall: (slug: string) =>
    apiClient.delete<UninstallProviderResponse>(`/api/providers/${slug}`),

  // Enable/disable a provider
  setEnabled: (slug: string, request: SetProviderEnabledRequest) =>
    apiClient.patch<SetProviderEnabledResponse>(`/api/providers/${slug}/enabled`, request),

  // Refresh provider capabilities
  refreshCapabilities: (slug: string) =>
    apiClient.post<RefreshProviderCapabilitiesResponse>(`/api/providers/${slug}/capabilities`),

  // Refresh all provider capabilities
  refreshAllCapabilities: () =>
    apiClient.post<RefreshAllCapabilitiesResponse>('/api/providers/capabilities/refresh'),

  // Check provider health
  checkHealth: (slug: string) =>
    apiClient.get<CheckProviderHealthResponse>(`/api/providers/${slug}/health`),

  // Get provider symbols (optionally filtered by provider slug)
  getSymbols: (provider?: string) =>
    apiClient.get<GetProviderSymbolsResponse>('/api/providers/symbols', { provider }),
}
