'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { MOCK_APPLICATIONS } from '@/lib/applications'
import { ApplicationGrid } from '@/components/portal/application-grid'

interface ApplicationsViewProps {
  firstName: string
}

export function ApplicationsView({ firstName }: ApplicationsViewProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_APPLICATIONS
    return MOCK_APPLICATIONS.filter((app) =>
      [app.name, app.description, app.category]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select an application to continue. You&apos;re signed in once and
            trusted everywhere.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications"
            aria-label="Search applications"
            className="h-11 w-full rounded-xl border border-input bg-card pr-3.5 pl-10 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Your applications
          </h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} available
          </span>
        </div>
        <ApplicationGrid applications={filtered} />
      </div>
    </div>
  )
}
