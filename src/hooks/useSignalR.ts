import { useEffect, useCallback } from 'react'
import { signalRClient, type PriceUpdateHandler } from '@/api/signalr'
import { useUIStore } from '@/stores/uiStore'

/**
 * Hook to manage SignalR connection lifecycle
 */
export function useSignalRConnection() {
  const { connectionStatus, setConnectionStatus } = useUIStore()

  useEffect(() => {
    // Connect on mount
    signalRClient.connect().catch((error) => {
      console.error('Failed to connect to SignalR:', error)
      setConnectionStatus('error')
    })

    // Disconnect on unmount
    return () => {
      // Don't disconnect on component unmount, keep connection alive
      // signalRClient.disconnect()
    }
  }, [setConnectionStatus])

  const reconnect = useCallback(async () => {
    try {
      setConnectionStatus('connecting')
      await signalRClient.disconnect()
      await signalRClient.connect()
    } catch (error) {
      console.error('Failed to reconnect:', error)
      setConnectionStatus('error')
    }
  }, [setConnectionStatus])

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    reconnect,
  }
}

/**
 * Hook to subscribe to real-time price updates for a symbol
 */
export function useSymbolSubscription(symbol: string, onUpdate: PriceUpdateHandler) {
  useEffect(() => {
    if (!symbol) return

    // Subscribe to symbol
    signalRClient.subscribeToSymbol(symbol, onUpdate)

    // Unsubscribe on cleanup
    return () => {
      signalRClient.unsubscribeFromSymbol(symbol, onUpdate)
    }
  }, [symbol, onUpdate])
}
