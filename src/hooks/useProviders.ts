import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '@/api/providers'
import type { InstallProviderRequest, SetProviderEnabledRequest } from '@/types/api'

// Query keys
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (enabled?: boolean) => [...providerKeys.lists(), { enabled }] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
  health: (id: string) => [...providerKeys.all, 'health', id] as const,
}

// Get all providers
export function useProviders(enabled?: boolean) {
  return useQuery({
    queryKey: providerKeys.list(enabled),
    queryFn: () => providersApi.getAll(enabled),
    select: (data) => data.providers,
  })
}

// Get provider by ID
export function useProvider(id: string) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: () => providersApi.getById(id),
    select: (data) => data.provider,
    enabled: !!id,
  })
}

// Check provider health
export function useProviderHealth(id: string) {
  return useQuery({
    queryKey: providerKeys.health(id),
    queryFn: () => providersApi.checkHealth(id),
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Install provider mutation
export function useInstallProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: InstallProviderRequest) => providersApi.install(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })
}

// Uninstall provider mutation
export function useUninstallProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => providersApi.uninstall(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })
}

// Set provider enabled mutation
export function useSetProviderEnabled() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: SetProviderEnabledRequest }) =>
      providersApi.setEnabled(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(id) })
    },
  })
}

// Refresh provider capabilities mutation
export function useRefreshProviderCapabilities() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => providersApi.refreshCapabilities(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(id) })
    },
  })
}

// Refresh all capabilities mutation
export function useRefreshAllCapabilities() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => providersApi.refreshAllCapabilities(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all })
    },
  })
}
