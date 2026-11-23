import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APPLICATION_ICONS, type Application } from '@/lib/applications'

interface ApplicationCardProps {
  application: Application
}

const TONE_STYLES: Record<NonNullable<Application['tone']>, string> = {
  blue: 'bg-brand-blue/12 text-brand-blue ring-brand-blue/15',
  indigo: 'bg-[oklch(0.45_0.13_265)]/12 text-[oklch(0.45_0.13_265)] ring-[oklch(0.45_0.13_265)]/15',
  teal: 'bg-[oklch(0.6_0.11_190)]/14 text-[oklch(0.48_0.1_190)] ring-[oklch(0.6_0.11_190)]/20',
  sky: 'bg-[oklch(0.68_0.13_235)]/14 text-[oklch(0.5_0.12_240)] ring-[oklch(0.68_0.13_235)]/20',
  slate: 'bg-[oklch(0.55_0.04_260)]/12 text-[oklch(0.42_0.05_260)] ring-[oklch(0.55_0.04_260)]/18',
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const Icon = APPLICATION_ICONS[application.icon ?? ''] ?? APPLICATION_ICONS.portal
  const tone = TONE_STYLES[application.tone ?? 'blue']

  return (
    <a
      href={application.url}
      aria-label={`Open ${application.name}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-md hover:shadow-brand-navy/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-12 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105',
            tone,
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="size-5 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-blue"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {application.name}
      </h3>
      {application.category && (
        <span className="mt-1 text-xs font-medium text-brand-blue">
          {application.category}
        </span>
      )}
      {application.description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {application.description}
        </p>
      )}

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors group-hover:text-brand-navy">
        Open application
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          &rarr;
        </span>
      </span>
    </a>
  )
}
