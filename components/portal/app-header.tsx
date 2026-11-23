'use client'

import { Menu, LifeBuoy } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo'
import { UserMenu, type PortalUser } from '@/components/portal/user-menu'
import { SettingsButton } from '@/components/portal/settings-button'

interface AppHeaderProps {
  user: PortalUser
  onSignOut: () => void
  onOpenSidebar: () => void
}

export function AppHeader({ user, onSignOut, onOpenSidebar }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation menu"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* Compact brand mark for mobile where the sidebar is hidden */}
      <div className="flex items-center lg:hidden">
        <LogoMark className="size-8" />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <a
          href="#"
          className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:inline-flex"
        >
          <LifeBuoy className="size-4" aria-hidden="true" />
          Help
        </a>
        <SettingsButton />
        <div className="hidden h-6 w-px bg-border sm:block" />
        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  )
}
