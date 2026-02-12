import { useState, useCallback, useMemo, useEffect, type FormEvent } from 'react'
import { Search, X, Clock, Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useChartStore } from '@/stores/chartStore'
import { useProviderSymbols } from '@/hooks/useProviders'
import { cn } from '@/lib/utils'

interface SymbolSearchProps {
  className?: string
}

export function SymbolSearch({ className }: SymbolSearchProps) {
  const { symbol, setSymbol, recentSymbols } = useChartStore()
  const [inputValue, setInputValue] = useState(symbol)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const { data: providerSymbols } = useProviderSymbols()

  const symbolOptions = useMemo(() => {
    const map = new Map<string, { symbol: string; providers: string[] }>()
    const providers = providerSymbols?.providers ?? []

    for (const provider of providers) {
      const providerName = provider.name || provider.slug
      const seenInProvider = new Set<string>()
      for (const item of provider.symbols) {
        const normalized = item.symbol.trim().toUpperCase()
        if (!normalized || seenInProvider.has(normalized)) continue
        seenInProvider.add(normalized)
        const existing = map.get(normalized)
        if (existing) {
          if (!existing.providers.includes(providerName)) {
            existing.providers.push(providerName)
          }
        } else {
          map.set(normalized, { symbol: normalized, providers: [providerName] })
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [providerSymbols])

  const filteredSymbols = useMemo(() => {
    const value = inputValue.trim().toUpperCase()
    if (!value) return []
    return symbolOptions.filter((option) => option.symbol.startsWith(value)).slice(0, 20)
  }, [inputValue, symbolOptions])

  const navigableItems = useMemo(() => {
    const recentItems = recentSymbols.slice(0, 5).map((value) => ({
      key: `recent-${value}`,
      label: value,
      providers: [] as string[],
    }))
    const matchItems = filteredSymbols.map((option) => ({
      key: `match-${option.symbol}`,
      label: option.symbol,
      providers: option.providers,
    }))
    return [...recentItems, ...matchItems]
  }, [filteredSymbols, recentSymbols])

  useEffect(() => {
    if (!showDropdown || navigableItems.length === 0) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex((current) => {
      if (current < 0) return 0
      if (current >= navigableItems.length) return navigableItems.length - 1
      return current
    })
  }, [showDropdown, navigableItems.length])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmedValue = inputValue.trim().toUpperCase()
      if (trimmedValue) {
        setSymbol(trimmedValue)
        setShowDropdown(false)
      }
    },
    [inputValue, setSymbol]
  )

  const handleSelectSymbol = useCallback(
    (selected: string) => {
      setInputValue(selected)
      setSymbol(selected)
      setShowDropdown(false)
    },
    [setSymbol]
  )

  const handleClear = useCallback(() => {
    setInputValue('')
  }, [])

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase())
              setShowDropdown(true)
            }}
            onKeyDown={(e) => {
              if (!showDropdown || navigableItems.length === 0) return

              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((current) =>
                  current < navigableItems.length - 1 ? current + 1 : 0
                )
              }

              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((current) =>
                  current > 0 ? current - 1 : navigableItems.length - 1
                )
              }

              if (e.key === 'Enter' && activeIndex >= 0) {
                e.preventDefault()
                const selected = navigableItems[activeIndex]
                if (selected) handleSelectSymbol(selected.label)
              }

              if (e.key === 'Escape') {
                e.preventDefault()
                setShowDropdown(false)
              }
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Search symbol (e.g., AAPL)"
            className="pl-9 pr-8 h-9 font-mono"
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button type="submit" size="sm" className="h-9">
          Go
        </Button>
      </form>

      {showDropdown && (recentSymbols.length > 0 || filteredSymbols.length > 0) && (
        <div className="absolute top-full left-0 right-12 mt-1 z-50 rounded-md border bg-popover shadow-md">
          <div className="p-2">
            {recentSymbols.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                {recentSymbols.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-sm font-mono',
                      activeIndex === navigableItems.findIndex((item) => item.key === `recent-${s}`)
                        ? 'bg-accent'
                        : ''
                    )}
                    onMouseDown={() => handleSelectSymbol(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {filteredSymbols.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Matches
                </div>
                {filteredSymbols.map((option) => {
                  const providerLabel =
                    option.providers.length > 1 ? ` — ${option.providers.join(', ')}` : ''
                  const isActive =
                    activeIndex ===
                    navigableItems.findIndex((item) => item.key === `match-${option.symbol}`)
                  return (
                    <button
                      key={option.symbol}
                      type="button"
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-sm font-mono',
                        isActive ? 'bg-accent' : ''
                      )}
                      onMouseDown={() => handleSelectSymbol(option.symbol)}
                    >
                      {option.symbol}
                      {providerLabel && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {providerLabel}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
