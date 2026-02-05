import type { Time } from 'lightweight-charts'

// Chart data types for TradingView Lightweight Charts
export interface CandlestickData {
  time: Time
  open: number
  high: number
  low: number
  close: number
}

export interface VolumeData {
  time: Time
  value: number
  color: string
}

// Supported intervals for the chart
export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

export interface IntervalOption {
  value: ChartInterval
  label: string
  description: string
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { value: '1m', label: '1m', description: '1 Minute' },
  { value: '5m', label: '5m', description: '5 Minutes' },
  { value: '15m', label: '15m', description: '15 Minutes' },
  { value: '30m', label: '30m', description: '30 Minutes' },
  { value: '1h', label: '1H', description: '1 Hour' },
  { value: '4h', label: '4H', description: '4 Hours' },
  { value: '1d', label: '1D', description: '1 Day' },
  { value: '1w', label: '1W', description: '1 Week' },
  { value: '1M', label: '1M', description: '1 Month' },
]

// Chart theme colors
export interface ChartTheme {
  backgroundColor: string
  textColor: string
  gridColor: string
  crosshairColor: string
  upColor: string
  downColor: string
  volumeUpColor: string
  volumeDownColor: string
  borderColor: string
}

export const DARK_CHART_THEME: ChartTheme = {
  backgroundColor: 'hsl(240, 10%, 3.9%)',
  textColor: 'hsl(0, 0%, 98%)',
  gridColor: 'hsl(240, 3.7%, 15.9%)',
  crosshairColor: 'hsl(240, 5%, 64.9%)',
  upColor: '#22c55e',
  downColor: '#ef4444',
  volumeUpColor: 'rgba(34, 197, 94, 0.5)',
  volumeDownColor: 'rgba(239, 68, 68, 0.5)',
  borderColor: 'hsl(240, 3.7%, 15.9%)',
}

// Price display info
export interface PriceInfo {
  open: number
  high: number
  low: number
  close: number
  volume: number
  change: number
  changePercent: number
  time: string
}
