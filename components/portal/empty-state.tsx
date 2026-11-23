import { PackageOpen } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-brand-navy">
        <PackageOpen className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-base font-semibold text-foreground">
        No applications yet
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        You don&apos;t have access to any applications right now. Once your
        administrator grants access, they&apos;ll appear here automatically.
      </p>
      <a
        href="#"
        className="mt-6 inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Request access
      </a>
    </div>
  )
}
