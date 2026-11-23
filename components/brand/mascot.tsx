import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MascotProps {
  className?: string
  /** Decorative by default; provide a label only when it conveys meaning. */
  label?: string
  priority?: boolean
}

/**
 * "Simi", the optional corporate mascot. Purely decorative and intentionally
 * understated so it never competes with the primary user actions.
 */
export function Mascot({ className, label, priority }: MascotProps) {
  return (
    <Image
      src="/simi-mascot-badge.png"
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={320}
      height={320}
      priority={priority}
      className={cn('select-none object-contain', className)}
      draggable={false}
    />
  )
}
