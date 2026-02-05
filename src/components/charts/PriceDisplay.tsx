import { cn } from '@/lib/utils'
import { formatNumber, formatVolume, formatPercentChange, formatDateTime } from '@/lib/utils'
import type { PriceInfo } from '@/types/chart'

interface PriceDisplayProps {
  symbol: string
  price: PriceInfo | null
  className?: string
}

export function PriceDisplay({ symbol, price, className }: PriceDisplayProps) {
  if (!price) {
    return (
      <div className={cn('flex items-center gap-4 px-4 py-2', className)}>
        <span className="text-xl font-bold">{symbol}</span>
        <span className="text-muted-foreground">--</span>
      </div>
    )
  }

  const isPositive = price.change >= 0

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2', className)}>
      {/* Symbol */}
      <span className="text-xl font-bold">{symbol}</span>

      {/* Current Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{formatNumber(price.close, 2)}</span>
        <span
          className={cn(
            'text-sm font-medium',
            isPositive ? 'text-[var(--color-chart-up)]' : 'text-[var(--color-chart-down)]'
          )}
        >
          {formatPercentChange(price.changePercent)}
        </span>
      </div>

      {/* OHLCV */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          O <span className="text-foreground">{formatNumber(price.open)}</span>
        </span>
        <span>
          H <span className="text-foreground">{formatNumber(price.high)}</span>
        </span>
        <span>
          L <span className="text-foreground">{formatNumber(price.low)}</span>
        </span>
        <span>
          C <span className="text-foreground">{formatNumber(price.close)}</span>
        </span>
        <span>
          Vol <span className="text-foreground">{formatVolume(price.volume)}</span>
        </span>
      </div>

      {/* Time */}
      <span className="text-xs text-muted-foreground ml-auto">
        {formatDateTime(price.time)}
      </span>
    </div>
  )
}
