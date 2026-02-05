import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProviders } from '@/hooks/useProviders'
import { useChartStore } from '@/stores/chartStore'
import { Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProviderSelectorProps {
  className?: string
}

export function ProviderSelector({ className }: ProviderSelectorProps) {
  const { selectedProviderId, setSelectedProviderId } = useChartStore()
  const { data: providers, isLoading } = useProviders(true) // Only fetch enabled providers

  // Auto-select first provider if none is selected and providers are available
  useEffect(() => {
    if (!selectedProviderId && providers && providers.length > 0) {
      setSelectedProviderId(providers[0].id)
    }
  }, [selectedProviderId, providers, setSelectedProviderId])

  const handleValueChange = (value: string) => {
    setSelectedProviderId(value)
  }

  // Find selected provider name for display
  const selectedProvider = providers?.find((p) => p.id === selectedProviderId)

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Database className="h-4 w-4 text-muted-foreground" />
        <div className="w-[180px] h-8 bg-muted animate-pulse rounded-md" />
      </div>
    )
  }

  // Show message if no providers available
  if (!providers || providers.length === 0) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No providers available</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Database className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedProviderId ?? ''} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Select provider">
            {selectedProvider?.name ?? 'Select provider'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center gap-2">
                <span>{provider.name}</span>
                <span className="text-xs text-muted-foreground">v{provider.version}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
