'use client'

import { useState, type FormEvent } from 'react'
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSuccess: (identifier: string) => void
}

type Status = 'idle' | 'loading' | 'error'

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string
    password?: string
  }>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errors: typeof fieldErrors = {}
    if (!identifier.trim()) errors.identifier = 'Enter your corporate email or username.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setStatus('idle')
      return
    }

    setStatus('loading')
    // Demo only — real authentication is handled by Keycloak.
    window.setTimeout(() => {
      if (password.toLowerCase() === 'wrong') {
        setStatus('error')
        return
      }
      onSuccess(identifier.trim())
    }, 1200)
  }

  const isLoading = status === 'loading'

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your corporate credentials to access Suite SimiSoluciones.
        </p>
      </header>

      {status === 'error' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">We couldn&apos;t sign you in</p>
            <p className="mt-0.5 text-destructive/80">
              The email or password is incorrect. Please try again.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field
          id="identifier"
          label="Corporate email or username"
          error={fieldErrors.identifier}
        >
          <div className="relative">
            <AtSign
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="identifier"
              name="identifier"
              type="text"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="name@simisoluciones.com"
              value={identifier}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.identifier)}
              aria-describedby={
                fieldErrors.identifier ? 'identifier-error' : undefined
              }
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputClass(Boolean(fieldErrors.identifier), true)}
            />
          </div>
        </Field>

        <Field id="password" label="Password" error={fieldErrors.password}>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? 'password-error' : undefined
              }
              onChange={(e) => setPassword(e.target.value)}
              className={cn(inputClass(Boolean(fieldErrors.password), true), 'pr-11')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <a
            href="#"
            className="rounded-md text-sm font-medium text-brand-blue underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Forgot your password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-navy-deep focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        Accounts are provisioned by your administrator. Need access?{' '}
        <a
          href="#"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Contact IT support
        </a>
        .
      </p>

      <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-center text-[11px] text-muted-foreground">
        Demo: any email works. Use password <code className="font-mono">wrong</code> to preview the error state.
      </p>
    </div>
  )
}

function inputClass(hasError: boolean, hasLeadingIcon: boolean) {
  return cn(
    'h-11 w-full rounded-xl border bg-card text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-60',
    hasLeadingIcon ? 'pl-10 pr-3.5' : 'px-3.5',
    hasError
      ? 'border-destructive/50 ring-3 ring-destructive/15'
      : 'border-input',
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
