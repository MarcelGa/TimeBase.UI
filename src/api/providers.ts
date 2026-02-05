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
} from '@/types/api'

export const providersApi = {
  // Get all providers
  getAll: (enabled?: boolean) =>
    apiClient.get<GetProvidersResponse>('/api/providers', { enabled }),

  // Get provider by ID
  getById: (id: string) =>
    apiClient.get<GetProviderResponse>(`/api/providers/${id}`),

  // Install a new provider
  install: (request: InstallProviderRequest) =>
    apiClient.post<InstallProviderResponse>('/api/providers', request),

  // Uninstall a provider
  uninstall: (id: string) =>
    apiClient.delete<UninstallProviderResponse>(`/api/providers/${id}`),

  // Enable/disable a provider
  setEnabled: (id: string, request: SetProviderEnabledRequest) =>
    apiClient.patch<SetProviderEnabledResponse>(`/api/providers/${id}/enabled`, request),

  // Refresh provider capabilities
  refreshCapabilities: (id: string) =>
    apiClient.post<RefreshProviderCapabilitiesResponse>(`/api/providers/${id}/capabilities`),

  // Refresh all provider capabilities
  refreshAllCapabilities: () =>
    apiClient.post<RefreshAllCapabilitiesResponse>('/api/providers/capabilities/refresh'),

  // Check provider health
  checkHealth: (id: string) =>
    apiClient.get<CheckProviderHealthResponse>(`/api/providers/${id}/health`),
}
