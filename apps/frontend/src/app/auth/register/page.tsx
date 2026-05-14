'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, ArrowRight, HardHat, Building2, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName:  z.string().min(2, 'Last name required'),
  email:     z.string().email('Valid email required'),
  password:  z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  phone:     z.string().optional(),
  role:      z.enum(['ENGINEER', 'CLIENT']),
})

type FormData = z.infer<typeof schema>

function RegisterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const defaultRole = (searchParams.get('role')?.toUpperCase() === 'CLIENT' ? 'CLIENT' : 'ENGINEER') as 'ENGINEER' | 'CLIENT'

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data)
      toast.success('Account created! Welcome to InjenioRw 🎉')
      router.push(data.role === 'ENGINEER' ? '/onboarding/engineer' : '/onboarding/client')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center px-4 py-16">
      <div className="max-w-lg mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 group w-fit">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="font-display text-xl">
            <span className="text-white">Injenio</span>
            <span className="text-brand-400">Rw</span>
          </span>
        </Link>

        <h1 className="font-display text-3xl text-white mb-2">Create your account</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Join Rwanda's premier engineering talent marketplace
        </p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { role: 'ENGINEER' as const, label: "I'm an Engineer", desc: 'Find projects & contracts', Icon: HardHat },
            { role: 'CLIENT' as const, label: "I'm Hiring", desc: 'Post jobs & find talent', Icon: Building2 },
          ].map(({ role, label, desc, Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => setValue('role', role)}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                selectedRole === role
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-surface-border bg-surface-card hover:border-brand-500/40'
              }`}
            >
              {selectedRole === role && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
              )}
              <Icon size={20} className={`mb-2 ${selectedRole === role ? 'text-brand-400' : 'text-[var(--color-text-muted)]'}`} />
              <p className={`text-sm font-semibold ${selectedRole === role ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                {label}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                First name
              </label>
              <input {...register('firstName')} placeholder="Marie" className="input-dark" />
              {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Last name
              </label>
              <input {...register('lastName')} placeholder="Uwimana" className="input-dark" />
              {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Email address
            </label>
            <input {...register('email')} type="email" placeholder="you@example.com" className="input-dark" />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Phone (optional — for MTN MoMo payments)
            </label>
            <input {...register('phone')} type="tel" placeholder="+250 788 123 456" className="input-dark" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                className="input-dark pr-11"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 rounded-xl mt-2">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Creating account…
              </span>
            ) : (
              <>Create account <ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-brand-400 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
          </p>
        </form>

        <p className="text-sm text-[var(--color-text-secondary)] mt-6 text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
