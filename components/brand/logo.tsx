import { cn } from '@/lib/utils'

interface LogoMarkProps {
  className?: string
  /** Renders a lighter mark suited for dark/navy backgrounds. */
  variant?: 'default' | 'inverse'
}

/**
 * Suite SimiSoluciones mark: a shield formed around a keyhole, signalling
 * protected, centralized access. Kept simple so it reads well at small sizes
 * and can later be swapped for the official corporate asset.
 */
export function LogoMark({ className, variant = 'default' }: LogoMarkProps) {
  const gradientId = `simi-logo-${variant}`
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Suite SimiSoluciones"
      className={cn('size-9', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          {variant === 'inverse' ? (
            <>
              <stop offset="0%" stopColor="oklch(0.92 0.05 236)" />
              <stop offset="100%" stopColor="oklch(0.8 0.09 250)" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="oklch(0.55 0.17 258)" />
              <stop offset="100%" stopColor="oklch(0.33 0.09 259)" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 5.5 8v11.2C5.5 28.4 11.6 35.4 20 37.5c8.4-2.1 14.5-9.1 14.5-18.3V8L20 2.5Z"
        fill={`url(#${gradientId})`}
      />
      <circle cx="20" cy="16.5" r="4.3" fill="white" fillOpacity="0.95" />
      <path
        d="M18.1 19h3.8l1.2 7.2a1 1 0 0 1-1 1.16h-4.4a1 1 0 0 1-1-1.16L18.1 19Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  )
}

interface LogoProps {
  className?: string
  variant?: 'default' | 'inverse'
  /** Hide the wordmark and render only the shield. */
  markOnly?: boolean
}

export function Logo({ className, variant = 'default', markOnly }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark variant={variant} />
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[15px] font-semibold tracking-tight',
              variant === 'inverse' ? 'text-white' : 'text-foreground',
            )}
          >
            Suite SimiSoluciones
          </span>
          <span
            className={cn(
              'mt-1 text-[11px] font-medium tracking-wide uppercase',
              variant === 'inverse' ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            Identity &amp; Access
          </span>
        </span>
      )}
    </span>
  )
}
