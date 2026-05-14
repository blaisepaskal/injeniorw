'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { initialize } = useAuthStore()

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      await initialize()
      const { user: hydratedUser } = useAuthStore.getState()

      toast.success('Welcome back!')

      if (hydratedUser?.role === 'ENGINEER' && !hydratedUser?.engineerProfile?.headline) {
        router.push('/onboarding/engineer')
      } else if (hydratedUser?.role === 'CLIENT' && !hydratedUser?.clientProfile?.companyName) {
        router.push('/onboarding/client')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 group w-fit">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-display text-xl">
            <span className="text-white">Injenio</span>
            <span className="text-brand-400">Rw</span>
          </span>
        </Link>

        <div className="max-w-sm w-full">
          <h1 className="font-display text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Sign in to your InjenioRw account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-dark"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Password
                </label>
                <Link href={"/auth/forgot-password" as any} className="text-xs text-brand-400 hover:text-brand-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-dark pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 rounded-xl mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-sm text-[var(--color-text-secondary)] mt-8 text-center">
            No account yet?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Join InjenioRw
            </Link>
          </p>

          {/* Dev test credentials */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 rounded-xl bg-surface-card border border-surface-border">
              <p className="text-xs font-mono text-[var(--color-text-muted)] mb-2">DEV — Test credentials</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Engineer: marie.uwimana@injeniorw.dev</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Client: infrastructure@rwandan-dev.rw</p>
              <p className="text-xs text-brand-400">Password: Password123!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Decorative panel */}
      <div className="hidden lg:flex flex-1 bg-surface-card border-l border-surface-border relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 text-center px-12">
          <p className="section-label mb-4">Trusted by 2,400+ engineers</p>
          <h2 className="font-display text-4xl text-white mb-4 leading-tight">
            Rwanda's engineering<br />
            <span className="text-gradient-brand">talent marketplace</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-xs mx-auto">
            Civil, structural, mechanical, electrical — connect with Rwanda's best engineers for your next project.
          </p>
        </div>
      </div>
    </div>
  )
}
