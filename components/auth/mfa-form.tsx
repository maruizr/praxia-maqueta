'use client'

import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MfaFormProps {
  onSuccess: () => void
  onCancel: () => void
}

type Status = 'idle' | 'loading' | 'error'

const LENGTH = 6

export function MfaForm({ onSuccess, onCancel }: MfaFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const [status, setStatus] = useState<Status>('idle')
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const code = digits.join('')
  const isLoading = status === 'loading'
  const isComplete = code.length === LENGTH

  function focusInput(index: number) {
    inputsRef.current[index]?.focus()
    inputsRef.current[index]?.select()
  }

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }
    setDigits((prev) => {
      const next = [...prev]
      // Support fast typing / multi-char by spilling across fields.
      let cursor = index
      for (const char of clean) {
        if (cursor >= LENGTH) break
        next[cursor] = char
        cursor += 1
      }
      return next
    })
    const nextIndex = Math.min(index + clean.length, LENGTH - 1)
    focusInput(nextIndex)
    if (status === 'error') setStatus('idle')
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '')
      } else if (index > 0) {
        focusInput(index - 1)
        setDigits((prev) => {
          const next = [...prev]
          next[index - 1] = ''
          return next
        })
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      e.preventDefault()
      focusInput(index + 1)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!pasted) return
    const next = Array(LENGTH).fill('')
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i]
    setDigits(next)
    focusInput(Math.min(pasted.length, LENGTH - 1))
    if (status === 'error') setStatus('idle')
  }

  function verify() {
    if (!isComplete || isLoading) return
    setStatus('loading')
    // Demo only — Keycloak validates the real TOTP challenge.
    window.setTimeout(() => {
      if (code === '123456') {
        onSuccess()
      } else {
        setStatus('error')
        setDigits(Array(LENGTH).fill(''))
        focusInput(0)
      }
    }, 1100)
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to sign in
      </button>

      <header className="mb-8">
        <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-accent text-brand-navy ring-1 ring-brand-blue/20">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Two-step verification
        </h2>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <Smartphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Enter the 6-digit code from your authenticator app to finish signing
            in.
          </span>
        </p>
      </header>

      {status === 'error' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Incorrect code</p>
            <p className="mt-0.5 text-destructive/80">
              That code didn&apos;t match. Enter the current code from your app.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          verify()
        }}
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">
            Verification code
          </legend>
          <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                disabled={isLoading}
                aria-label={`Digit ${index + 1} of ${LENGTH}`}
                aria-invalid={status === 'error'}
                onChange={(e) => setDigit(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                className={cn(
                  'h-14 w-full min-w-0 rounded-xl border bg-card text-center text-xl font-semibold text-foreground shadow-sm transition-colors',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  status === 'error'
                    ? 'border-destructive/50'
                    : digit
                      ? 'border-brand-blue/50'
                      : 'border-input',
                )}
              />
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!isComplete || isLoading}
          className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-navy-deep focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Verifying…
            </>
          ) : (
            'Verify'
          )}
        </button>
      </form>

      <button
        type="button"
        className="mt-5 w-full rounded-md text-center text-sm font-medium text-brand-blue underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Didn&apos;t receive a code? Try another way
      </button>

      <p className="mt-6 rounded-lg bg-muted/60 px-3 py-2 text-center text-[11px] text-muted-foreground">
        Demo: enter <code className="font-mono">123456</code> to continue, or any other code to preview the error state.
      </p>
    </div>
  )
}
