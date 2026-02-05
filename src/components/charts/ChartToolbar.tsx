import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { BarChart3, RefreshCw } from 'lucide-react'
import { useChartStore } from '@/stores/chartStore'
import { INTERVAL_OPTIONS, type ChartInterval } from '@/types/chart'
import { ProviderSelector } from './ProviderSelector'
import { cn } from '@/lib/utils'

interface ChartToolbarProps {
  onRefresh?: () => void
  isLoading?: boolean
  className?: string
}

export function ChartToolbar({ onRefresh, isLoading, className }: ChartToolbarProps) {
  const { interval, setInterval, showVolume, setShowVolume } = useChartStore()

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 border-b border-border bg-card',
        className
      )}
    >
      {/* Provider Selector */}
      <ProviderSelector />

      <Separator orientation="vertical" className="h-6" />

      {/* Interval Selector */}
      <div className="flex items-center gap-1">
        {INTERVAL_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={interval === option.value ? 'secondary' : 'ghost'}
            size="sm"
            className="px-2 h-7 text-xs"
            onClick={() => setInterval(option.value as ChartInterval)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Interval Dropdown (mobile) */}
      <Select value={interval} onValueChange={(value) => setInterval(value as ChartInterval)}>
        <SelectTrigger className="w-24 h-8 md:hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INTERVAL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Volume Toggle */}
      <Button
        variant={showVolume ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7"
        onClick={() => setShowVolume(!showVolume)}
        title="Toggle Volume"
      >
        <BarChart3 className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Vol</span>
      </Button>

      <div className="flex-1" />

      {/* Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        <span className="ml-1 hidden sm:inline">Refresh</span>
      </Button>
    </div>
  )
}
