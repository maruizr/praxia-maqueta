'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  ChevronDown,
  UserCircle,
  ShieldCheck,
  MonitorSmartphone,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PortalUser {
  name: string
  email: string
  avatarUrl?: string
}

interface UserMenuProps {
  user: PortalUser
  onSignOut: () => void
}

const MENU_ITEMS = [
  { id: 'profile', label: 'My Profile', icon: UserCircle },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'sessions', label: 'Active Sessions', icon: MonitorSmartphone },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-2 rounded-xl border border-transparent py-1 pr-2 pl-1 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:border-border sm:bg-card sm:shadow-sm sm:hover:bg-muted"
      >
        <Avatar user={user} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[9rem] truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="block max-w-[9rem] truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'hidden size-4 text-muted-foreground transition-transform sm:block',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lg shadow-brand-navy/10"
        >
          <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
            <Avatar user={user} large />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <div className="my-1 h-px bg-border" role="separator" />

          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              {label}
            </button>
          ))}

          <div className="my-1 h-px bg-border" role="separator" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

function Avatar({ user, large }: { user: PortalUser; large?: boolean }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-navy font-semibold text-white',
        large ? 'size-10 text-sm' : 'size-8 text-xs',
      )}
      aria-hidden="true"
    >
      {initials(user.name)}
    </span>
  )
}
