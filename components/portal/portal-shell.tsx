'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'
import { NAV_GROUPS } from '@/lib/navigation'
import { AppHeader } from '@/components/portal/app-header'
import type { PortalUser } from '@/components/portal/user-menu'

interface PortalShellProps {
  user: PortalUser
  activeNav: string
  onNavigate: (id: string) => void
  onSignOut: () => void
  children: ReactNode
}

export function PortalShell({
  user,
  activeNav,
  onNavigate,
  onSignOut,
  children,
}: PortalShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  function handleNavigate(id: string) {
    onNavigate(id)
    setDrawerOpen(false)
  }

  return (
    <div className="min-h-svh bg-muted/40">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar lg:block">
        <SidebarContent activeNav={activeNav} onNavigate={handleNavigate} />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-brand-navy-deep/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[82%] flex-col bg-sidebar shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-3 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <X className="size-4.5" aria-hidden="true" />
            </button>
            <SidebarContent activeNav={activeNav} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <AppHeader
          user={user}
          onSignOut={onSignOut}
          onOpenSidebar={() => setDrawerOpen(true)}
        />
        <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  activeNav,
  onNavigate,
}: {
  activeNav: string
  onNavigate: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>

      <nav
        aria-label="Portal navigation"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = item.id === activeNav
                const isUpcoming = item.upcoming
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => !isUpcoming && onNavigate(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-disabled={isUpcoming || undefined}
                      title={isUpcoming ? 'Coming soon' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                        isActive
                          ? 'bg-brand-navy text-white shadow-sm'
                          : isUpcoming
                            ? 'cursor-default text-muted-foreground/70'
                            : 'text-foreground hover:bg-accent',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-4.5 shrink-0',
                          isActive
                            ? 'text-white'
                            : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isUpcoming && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                          Soon
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-xl bg-accent/60 p-3">
          <p className="text-xs font-medium text-brand-navy">
            Single Sign-On active
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Your session is trusted across all connected applications.
          </p>
        </div>
      </div>
    </div>
  )
}
