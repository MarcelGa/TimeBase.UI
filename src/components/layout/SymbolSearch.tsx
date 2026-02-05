import { useState, useCallback, type FormEvent } from 'react'
import { Search, X, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useChartStore } from '@/stores/chartStore'
import { cn } from '@/lib/utils'

interface SymbolSearchProps {
  className?: string
}

export function SymbolSearch({ className }: SymbolSearchProps) {
  const { symbol, setSymbol, recentSymbols } = useChartStore()
  const [inputValue, setInputValue] = useState(symbol)
  const [showDropdown, setShowDropdown] = useState(false)

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

  const handleSelectRecent = useCallback(
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
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
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

      {/* Recent symbols dropdown */}
      {showDropdown && recentSymbols.length > 0 && (
        <div className="absolute top-full left-0 right-12 mt-1 z-50 rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Recent
            </div>
            {recentSymbols.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-sm font-mono"
                onMouseDown={() => handleSelectRecent(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
