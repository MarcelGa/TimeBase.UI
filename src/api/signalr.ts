import * as signalR from '@microsoft/signalr'
import { useUIStore } from '@/stores/uiStore'
import type { TimeSeriesData } from '@/types/api'

const HUB_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/hubs/market`
  : '/hubs/market'

export type PriceUpdateHandler = (data: TimeSeriesData) => void

class SignalRClient {
  private connection: signalR.HubConnection | null = null
  private priceUpdateHandlers: Map<string, Set<PriceUpdateHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    const setConnectionStatus = useUIStore.getState().setConnectionStatus
    setConnectionStatus('connecting')

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000)
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Set up connection event handlers
      this.connection.onreconnecting(() => {
        console.log('[SignalR] Reconnecting...')
        setConnectionStatus('connecting')
      })

      this.connection.onreconnected(() => {
        console.log('[SignalR] Reconnected')
        setConnectionStatus('connected')
        this.reconnectAttempts = 0
        // Re-subscribe to all symbols
        this.resubscribeAll()
      })

      this.connection.onclose((error) => {
        console.log('[SignalR] Connection closed', error)
        setConnectionStatus('disconnected')
        // Try manual reconnect if auto-reconnect failed
        this.handleConnectionClose()
      })

      // Set up message handlers
      this.connection.on('ReceivePriceUpdate', (data: TimeSeriesData) => {
        this.handlePriceUpdate(data)
      })

      // Start the connection
      await this.connection.start()
      console.log('[SignalR] Connected')
      setConnectionStatus('connected')
      this.reconnectAttempts = 0
    } catch (error) {
      console.error('[SignalR] Connection failed:', error)
      setConnectionStatus('error')
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      useUIStore.getState().setConnectionStatus('disconnected')
    }
  }

  async subscribeToSymbol(symbol: string, handler: PriceUpdateHandler): Promise<void> {
    // Add handler to map
    if (!this.priceUpdateHandlers.has(symbol)) {
      this.priceUpdateHandlers.set(symbol, new Set())
    }
    this.priceUpdateHandlers.get(symbol)!.add(handler)

    // Subscribe on server if connected
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SubscribeToSymbol', symbol)
        console.log(`[SignalR] Subscribed to ${symbol}`)
      } catch (error) {
        console.error(`[SignalR] Failed to subscribe to ${symbol}:`, error)
      }
    }
  }

  async unsubscribeFromSymbol(symbol: string, handler: PriceUpdateHandler): Promise<void> {
    const handlers = this.priceUpdateHandlers.get(symbol)
    if (handlers) {
      handlers.delete(handler)
      
      // If no more handlers, unsubscribe from server
      if (handlers.size === 0) {
        this.priceUpdateHandlers.delete(symbol)
        
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
          try {
            await this.connection.invoke('UnsubscribeFromSymbol', symbol)
            console.log(`[SignalR] Unsubscribed from ${symbol}`)
          } catch (error) {
            console.error(`[SignalR] Failed to unsubscribe from ${symbol}:`, error)
          }
        }
      }
    }
  }

  private handlePriceUpdate(data: TimeSeriesData): void {
    const handlers = this.priceUpdateHandlers.get(data.symbol)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error('[SignalR] Handler error:', error)
        }
      })
    }
  }

  private async resubscribeAll(): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      return
    }

    for (const symbol of this.priceUpdateHandlers.keys()) {
      try {
        await this.connection.invoke('SubscribeToSymbol', symbol)
        console.log(`[SignalR] Resubscribed to ${symbol}`)
      } catch (error) {
        console.error(`[SignalR] Failed to resubscribe to ${symbol}:`, error)
      }
    }
  }

  private handleConnectionClose(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[SignalR] Max reconnect attempts reached')
      useUIStore.getState().setConnectionStatus('error')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    console.log(`[SignalR] Attempting manual reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[SignalR] Manual reconnect failed:', error)
      })
    }, delay)
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }
}

// Singleton instance
export const signalRClient = new SignalRClient()
