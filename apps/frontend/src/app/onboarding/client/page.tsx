'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, ArrowRight, Building2 } from 'lucide-react'
import { clientsApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

const INDUSTRIES = [
  'Construction & Infrastructure', 'Real Estate', 'Energy & Utilities',
  'Mining & Resources', 'Manufacturing', 'Transportation & Logistics',
  'Water & Sanitation', 'Telecommunications', 'Government & Public Sector',
  'NGO / Development', 'Agriculture', 'Other',
]

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+']

const schema = z.object({
  companyName:  z.string().min(2, 'Required'),
  industry:     z.string().min(1, 'Select an industry'),
  companySize:  z.string().min(1, 'Select company size'),
  website:      z.string().url('Enter a valid URL (https://…)').optional().or(z.literal('')),
  description:  z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

export default function ClientOnboarding() {
  const router = useRouter()
  const { initialize } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await clientsApi.updateMe({
        companyName:  data.companyName,
        industry:     data.industry,
        companySize:  data.companySize,
        website:      data.website || undefined,
        description:  data.description || undefined,
      })
      await initialize()
      toast.success('Profile set up!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-border px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <Zap size={16} className="text-white fill-white" />
        </div>
        <span className="font-display text-lg">
          <span className="text-white">Injenio</span>
          <span className="text-brand-400">Rw</span>
        </span>
        <span className="ml-2 text-sm text-[var(--color-text-muted)]">· Client Setup</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
              <Building2 size={22} className="text-brand-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-white">Set up your profile</h1>
              <p className="text-[var(--color-text-secondary)] text-sm">Help engineers understand who you are</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Company / organisation name <span className="text-red-400">*</span>
              </label>
              <input {...register('companyName')} placeholder="Rwanda Infrastructure Ltd" className="input-dark" />
              {errors.companyName && <p className="text-xs text-red-400 mt-1">{errors.companyName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Industry <span className="text-red-400">*</span>
                </label>
                <select {...register('industry')} className="input-dark">
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {errors.industry && <p className="text-xs text-red-400 mt-1">{errors.industry.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Company size <span className="text-red-400">*</span>
                </label>
                <select {...register('companySize')} className="input-dark">
                  <option value="">Select…</option>
                  {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                </select>
                {errors.companySize && <p className="text-xs text-red-400 mt-1">{errors.companySize.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Website <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
              </label>
              <input {...register('website')} type="url" placeholder="https://yourcompany.rw" className="input-dark" />
              {errors.website && <p className="text-xs text-red-400 mt-1">{errors.website.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                About your organisation <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Brief description of what your company does and the kinds of engineering projects you typically need help with…"
                className="input-dark resize-none"
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving…
                </span>
              ) : (
                <>Go to dashboard <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
