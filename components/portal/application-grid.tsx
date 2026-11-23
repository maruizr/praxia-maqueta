import type { Application } from '@/lib/applications'
import { ApplicationCard } from '@/components/portal/application-card'
import { EmptyState } from '@/components/portal/empty-state'

interface ApplicationGridProps {
  applications: Application[]
}

export function ApplicationGrid({ applications }: ApplicationGridProps) {
  if (applications.length === 0) {
    return <EmptyState />
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {applications.map((application) => (
        <li key={application.id}>
          <ApplicationCard application={application} />
        </li>
      ))}
    </ul>
  )
}
