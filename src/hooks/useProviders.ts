import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '@/api/providers'
import type { InstallProviderRequest, SetProviderEnabledRequest } from '@/types/api'

// Query keys
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: () => [...providerKeys.lists()] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...providerKeys.details(), slug] as const,
  health: (slug: string) => [...providerKeys.all, 'health', slug] as const,
  symbols: () => [...providerKeys.all, 'symbols'] as const,
  symbolsForProvider: (slug?: string) => [...providerKeys.symbols(), { slug }] as const,
}

// Get all providers
export function useProviders() {
  return useQuery({
    queryKey: providerKeys.list(),
    queryFn: () => providersApi.getAll(),
    select: (data) => data.providers,
  })
}

// Get provider by slug
export function useProvider(slug: string) {
  return useQuery({
    queryKey: providerKeys.detail(slug),
    queryFn: () => providersApi.getBySlug(slug),
    select: (data) => data.provider,
    enabled: !!slug,
  })
}

// Check provider health
export function useProviderHealth(slug: string) {
  return useQuery({
    queryKey: providerKeys.health(slug),
    queryFn: () => providersApi.checkHealth(slug),
    enabled: !!slug,
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
    mutationFn: (slug: string) => providersApi.uninstall(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
    },
  })
}

// Set provider enabled mutation
export function useSetProviderEnabled() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, request }: { slug: string; request: SetProviderEnabledRequest }) =>
      providersApi.setEnabled(slug, request),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(slug) })
    },
  })
}

// Refresh provider capabilities mutation
export function useRefreshProviderCapabilities() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => providersApi.refreshCapabilities(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(slug) })
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

// Get provider symbols (optionally filtered by provider slug)
export function useProviderSymbols(provider?: string) {
  return useQuery({
    queryKey: providerKeys.symbolsForProvider(provider),
    queryFn: () => providersApi.getSymbols(provider),
  })
}
