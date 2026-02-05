import { TrendingUp } from 'lucide-react'
import { SymbolSearch } from './SymbolSearch'
import { ConnectionStatus } from './ConnectionStatus'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-border bg-card',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold hidden sm:inline">TimeBase</span>
      </div>

      {/* Search */}
      <SymbolSearch className="flex-1 max-w-md" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Connection Status */}
      <ConnectionStatus />
    </header>
  )
}
