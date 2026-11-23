'use client'

import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsButtonProps {
  onClick?: () => void
  className?: string
}

export function SettingsButton({ onClick, className }: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open settings"
      className={cn(
        'flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        className,
      )}
    >
      <Settings className="size-4.5" aria-hidden="true" />
    </button>
  )
}
