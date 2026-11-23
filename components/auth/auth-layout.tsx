import type { ReactNode } from 'react'
import { ShieldCheck, KeyRound, Fingerprint } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Mascot } from '@/components/brand/mascot'

interface AuthLayoutProps {
  children: ReactNode
}

const HIGHLIGHTS = [
  {
    icon: KeyRound,
    title: 'Single Sign-On',
    body: 'One secure session unlocks every application you are authorized to use.',
  },
  {
    icon: Fingerprint,
    title: 'Multi-factor by design',
    body: 'Time-based one-time codes add a second layer without slowing you down.',
  },
  {
    icon: ShieldCheck,
    title: 'Centrally governed',
    body: 'Access is provisioned by your organization and continuously protected.',
  },
]

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      {/* Branding panel — full experience on large screens */}
      <aside className="relative hidden overflow-hidden bg-brand-navy-deep text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(120% 90% at 12% 0%, oklch(0.42 0.13 259) 0%, transparent 55%), radial-gradient(130% 100% at 100% 100%, oklch(0.5 0.15 250) 0%, transparent 50%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative">
          <Logo variant="inverse" />
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight text-balance xl:text-4xl">
            Secure access to your entire workplace.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Suite SimiSoluciones centralizes identity and access management so
            your team reaches every corporate application from a single,
            trusted place.
          </p>

          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-5 text-brand-sky" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-white/60">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-end justify-between">
          <p className="text-xs text-white/45">
            Protected by corporate identity policies.
          </p>
          <Mascot
            className="size-28 rounded-full opacity-95 shadow-lg shadow-black/30 ring-1 ring-white/10"
            priority
          />
        </div>
      </aside>

      {/* Form area — the primary focus */}
      <main className="flex min-h-svh flex-col">
        {/* Compact branding for tablet / mobile */}
        <div className="relative overflow-hidden bg-brand-navy-deep px-6 pt-8 pb-10 text-white lg:hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 120% at 100% 0%, oklch(0.48 0.15 252) 0%, transparent 60%)',
            }}
          />
          <div className="relative flex items-center justify-between">
            <Logo variant="inverse" />
            <Mascot className="size-14 rounded-full opacity-95 ring-1 ring-white/10" />
          </div>
          <p className="relative mt-6 max-w-sm text-sm leading-relaxed text-white/70">
            Sign in with your corporate credentials to reach every application
            you are authorized to use.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  )
}
