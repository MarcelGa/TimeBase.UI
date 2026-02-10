import { useMemo, useCallback, useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout'
import { CandlestickChart, ChartToolbar, PriceDisplay } from '@/components/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useChartStore } from '@/stores/chartStore'
import { useHistoricalData } from '@/hooks/useHistoricalData'
import { useSignalRConnection, useSymbolSubscription } from '@/hooks/useSignalR'
import { AlertCircle } from 'lucide-react'
import type { TimeSeriesData } from '@/types/api'

export function Dashboard() {
  const { symbol, interval, showVolume, currentPrice, selectedProviderSlug } = useChartStore()
  const [realtimeData, setRealtimeData] = useState<TimeSeriesData | null>(null)

  // Initialize SignalR connection
  useSignalRConnection()

  // Calculate date range based on interval
  const dateRange = useMemo(() => {
    const end = new Date()
    const start = new Date()

    // Set appropriate range based on interval
    switch (interval) {
      case '1m':
      case '5m':
        start.setDate(start.getDate() - 1) // 1 day for minute intervals
        break
      case '15m':
      case '30m':
        start.setDate(start.getDate() - 7) // 1 week
        break
      case '1h':
      case '4h':
        start.setDate(start.getDate() - 30) // 1 month
        break
      case '1d':
        start.setFullYear(start.getFullYear() - 1) // 1 year
        break
      case '1wk':
        start.setFullYear(start.getFullYear() - 3) // 3 years
        break
      case '1mo':
        start.setFullYear(start.getFullYear() - 10) // 10 years
        break
      default:
        start.setDate(start.getDate() - 30) // Default 30 days
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }, [interval])

  // Fetch historical data (only when providerSlug is selected)
  const {
    data: historicalData,
    isLoading,
    isError,
    error,
    refetch,
  } = useHistoricalData({
    symbol,
    interval,
    start: dateRange.start,
    end: dateRange.end,
    providerSlug: selectedProviderSlug,
  })

  // Handle real-time price updates
  const handlePriceUpdate = useCallback((data: TimeSeriesData) => {
    if (data.interval === interval) {
      setRealtimeData(data)
    }
  }, [interval])

  // Subscribe to real-time updates for the current symbol
  useSymbolSubscription(symbol, handlePriceUpdate)

  // Clear realtime data when symbol changes - this is intentional to prevent stale data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentionally clearing stale data on symbol change
    setRealtimeData(null)
  }, [symbol])

  // Merge historical and realtime data
  const chartData = useMemo(() => {
    const historical = historicalData?.data ?? []
    
    if (!realtimeData) {
      return historical
    }

    // Check if realtime data is newer than the last historical point
    const lastHistorical = historical[historical.length - 1]
    if (lastHistorical) {
      const lastTime = new Date(lastHistorical.time).getTime()
      const realtimeTime = new Date(realtimeData.time).getTime()
      
      if (realtimeTime > lastTime) {
        // Append realtime data
        return [...historical, realtimeData]
      } else if (realtimeTime === lastTime) {
        // Update the last candle
        return [...historical.slice(0, -1), realtimeData]
      }
    }
    
    return historical
  }, [historicalData, realtimeData])

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Price Display */}
        <PriceDisplay
          symbol={symbol}
          price={currentPrice}
          className="border-b border-border bg-card"
        />

        {/* Chart Toolbar */}
        <ChartToolbar onRefresh={() => refetch()} isLoading={isLoading} />

        {/* Chart Area */}
        <Card className="flex-1 m-2 overflow-hidden rounded-lg">
          <CardContent className="p-0 h-full relative">
            {!selectedProviderSlug && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <span className="text-sm font-medium">No provider selected</span>
                  <span className="text-xs">Please select a data provider from the toolbar above</span>
                </div>
              </div>
            )}

            {selectedProviderSlug && isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-sm text-muted-foreground">Loading data...</span>
                </div>
              </div>
            )}

            {selectedProviderSlug && isError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-2 text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <span className="text-sm font-medium">Failed to load data</span>
                  <span className="text-xs text-muted-foreground">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </span>
                </div>
              </div>
            )}

            {selectedProviderSlug && !isLoading && !isError && chartData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <span className="text-sm">No data available for {symbol}</span>
                  <span className="text-xs">The selected provider has no data for this symbol</span>
                </div>
              </div>
            )}

            <CandlestickChart
              data={chartData}
              showVolume={showVolume}
              className="h-full"
            />
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border flex items-center justify-between">
          <span>
            {chartData.length > 0 && `${chartData.length} data points`}
          </span>
          <span>
            Interval: {interval} | Symbol: {symbol}
          </span>
        </div>
      </div>
    </MainLayout>
  )
}
