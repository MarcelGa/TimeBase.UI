import { useEffect, useRef, useCallback } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData as LWCandlestickData,
  type HistogramData,
  type MouseEventParams,
  type Time,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts'
import type { TimeSeriesData } from '@/types/api'
import type { PriceInfo } from '@/types/chart'
import { DARK_CHART_THEME } from '@/types/chart'
import { useChartStore } from '@/stores/chartStore'

interface CandlestickChartProps {
  data: TimeSeriesData[]
  showVolume?: boolean
  onCrosshairMove?: (price: PriceInfo | null) => void
  className?: string
}

// Convert API data to chart format
function convertToChartData(data: TimeSeriesData[]): {
  candlesticks: LWCandlestickData<Time>[]
  volumes: HistogramData<Time>[]
} {
  const candlesticks: LWCandlestickData<Time>[] = []
  const volumes: HistogramData<Time>[] = []

  for (const item of data) {
    const time = (new Date(item.time).getTime() / 1000) as Time

    candlesticks.push({
      time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    })

    volumes.push({
      time,
      value: item.volume,
      color:
        item.close >= item.open
          ? DARK_CHART_THEME.volumeUpColor
          : DARK_CHART_THEME.volumeDownColor,
    })
  }

  return { candlesticks, volumes }
}

export function CandlestickChart({
  data,
  showVolume = true,
  onCrosshairMove,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const { setCurrentPrice } = useChartStore()

  // Handle crosshair move
  const handleCrosshairMove = useCallback(
    (param: MouseEventParams<Time>) => {
      if (!param.time || !candlestickSeriesRef.current) {
        onCrosshairMove?.(null)
        setCurrentPrice(null)
        return
      }

      const candlestickData = param.seriesData.get(
        candlestickSeriesRef.current
      ) as LWCandlestickData<Time> | undefined

      if (!candlestickData) {
        onCrosshairMove?.(null)
        setCurrentPrice(null)
        return
      }

      const volumeData = volumeSeriesRef.current
        ? (param.seriesData.get(volumeSeriesRef.current) as HistogramData<Time> | undefined)
        : undefined

      const change = candlestickData.close - candlestickData.open
      const changePercent = (change / candlestickData.open) * 100

      const priceInfo: PriceInfo = {
        open: candlestickData.open,
        high: candlestickData.high,
        low: candlestickData.low,
        close: candlestickData.close,
        volume: volumeData?.value ?? 0,
        change,
        changePercent,
        time: new Date((param.time as number) * 1000).toISOString(),
      }

      onCrosshairMove?.(priceInfo)
      setCurrentPrice(priceInfo)
    },
    [onCrosshairMove, setCurrentPrice]
  )

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: DARK_CHART_THEME.backgroundColor },
        textColor: DARK_CHART_THEME.textColor,
      },
      grid: {
        vertLines: { color: DARK_CHART_THEME.gridColor },
        horzLines: { color: DARK_CHART_THEME.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: DARK_CHART_THEME.crosshairColor,
          width: 1,
          style: 2,
          labelBackgroundColor: DARK_CHART_THEME.backgroundColor,
        },
        horzLine: {
          color: DARK_CHART_THEME.crosshairColor,
          width: 1,
          style: 2,
          labelBackgroundColor: DARK_CHART_THEME.backgroundColor,
        },
      },
      rightPriceScale: {
        borderColor: DARK_CHART_THEME.borderColor,
      },
      timeScale: {
        borderColor: DARK_CHART_THEME.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Create candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: DARK_CHART_THEME.upColor,
      downColor: DARK_CHART_THEME.downColor,
      borderUpColor: DARK_CHART_THEME.upColor,
      borderDownColor: DARK_CHART_THEME.downColor,
      wickUpColor: DARK_CHART_THEME.upColor,
      wickDownColor: DARK_CHART_THEME.downColor,
    })
    candlestickSeriesRef.current = candlestickSeries

    // Create volume series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume', // Create a separate price scale
    })
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Volume takes bottom 20%
        bottom: 0,
      },
    })
    volumeSeriesRef.current = volumeSeries

    // Subscribe to crosshair move
    chart.subscribeCrosshairMove(handleCrosshairMove)

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.unsubscribeCrosshairMove(handleCrosshairMove)
      chart.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [handleCrosshairMove])

  // Update data when it changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return

    const { candlesticks, volumes } = convertToChartData(data)

    candlestickSeriesRef.current.setData(candlesticks)
    volumeSeriesRef.current.setData(volumes)

    // Fit content to view
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  // Toggle volume visibility
  useEffect(() => {
    if (!volumeSeriesRef.current) return

    volumeSeriesRef.current.applyOptions({
      visible: showVolume,
    })
  }, [showVolume])

  return (
    <div ref={chartContainerRef} className={className} style={{ width: '100%', height: '100%' }} />
  )
}
