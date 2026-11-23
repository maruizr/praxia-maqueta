'use client'

import { useState } from 'react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'
import { MfaForm } from '@/components/auth/mfa-form'
import { PortalShell } from '@/components/portal/portal-shell'
import { ApplicationsView } from '@/components/portal/applications-view'
import type { PortalUser } from '@/components/portal/user-menu'

type Stage = 'login' | 'mfa' | 'portal'

function deriveUser(identifier: string): PortalUser {
  const local = identifier.includes('@')
    ? identifier.slice(0, identifier.indexOf('@'))
    : identifier
  const name = local
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Team Member'
  const email = identifier.includes('@')
    ? identifier
    : `${identifier}@simisoluciones.com`
  return { name, email }
}

export default function Page() {
  const [stage, setStage] = useState<Stage>('login')
  const [identifier, setIdentifier] = useState('')

  const user = deriveUser(identifier)
  const firstName = user.name.split(' ')[0]

  if (stage === 'portal') {
    return (
      <PortalShell
        user={user}
        activeNav="applications"
        onNavigate={() => {}}
        onSignOut={() => {
          setIdentifier('')
          setStage('login')
        }}
      >
        <ApplicationsView firstName={firstName} />
      </PortalShell>
    )
  }

  return (
    <AuthLayout>
      {stage === 'login' ? (
        <LoginForm
          onSuccess={(value) => {
            setIdentifier(value)
            setStage('mfa')
          }}
        />
      ) : (
        <MfaForm
          onSuccess={() => setStage('portal')}
          onCancel={() => setStage('login')}
        />
      )}
    </AuthLayout>
  )
}
