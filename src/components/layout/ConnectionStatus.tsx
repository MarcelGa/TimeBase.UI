import { Activity, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { connectionStatus } = useUIStore()

  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      color: 'text-muted-foreground',
      label: 'Disconnected',
    },
    connecting: {
      icon: Activity,
      color: 'text-yellow-500',
      label: 'Connecting...',
    },
    connected: {
      icon: Wifi,
      color: 'text-[var(--color-chart-up)]',
      label: 'Connected',
    },
    error: {
      icon: AlertCircle,
      color: 'text-[var(--color-chart-down)]',
      label: 'Connection Error',
    },
  }

  const config = statusConfig[connectionStatus]
  const Icon = config.icon

  return (
    <div
      className={cn('flex items-center gap-1.5 text-xs', config.color, className)}
      title={config.label}
    >
      <Icon
        className={cn('h-3.5 w-3.5', connectionStatus === 'connecting' && 'animate-pulse')}
      />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  )
}
