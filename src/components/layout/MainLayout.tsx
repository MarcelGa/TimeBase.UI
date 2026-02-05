import type { ReactNode } from 'react'
import { Header } from './Header'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn('flex flex-col h-screen bg-background', className)}>
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
