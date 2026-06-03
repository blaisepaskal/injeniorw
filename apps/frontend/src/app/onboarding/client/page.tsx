'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Building2, Globe, ArrowRight, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

const INDUSTRIES = [
  'Construction & Infrastructure', 'Real Estate Development', 'Energy & Utilities',
  'Mining & Resources', 'Manufacturing & Industrial', 'Government & Public Sector',
  'NGO & Development', 'Consulting & Engineering Firms', 'Agriculture & Environment', 'Other',
]

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+']

export default function ClientOnboardingPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { companyName: '', industry: '', companySize: '', website: '', description: '' },
  })

  const onSubmit = async (values: any) => {
    try {
      await api.put('/clients/me', values)
      toast.success('Profile set up! Welcome to InjenioRw 🎉')
      router.push('/dashboard/client')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-display text-lg"><span className="text-white">Injenio</span><span className="text-brand-400">Rw</span></span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-3xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-brand-400" />
            </div>
            <h1 className="font-display text-3xl text-white mb-2">Set Up Your Client Profile</h1>
            <p className="text-[var(--color-text-secondary)] text-sm">Tell engineers about your organisation so they know who they're working with.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Company / Organisation name <span className="text-[var(--color-text-muted)]">(or your name if freelancing)</span>
              </label>
              <input className="input-dark" placeholder="e.g. Rwanda Infrastructure Ltd" {...register('companyName')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Industry</label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} type="button" onClick={() => setValue('industry', ind)}
                    className={cn('p-3 rounded-xl border text-xs text-left transition-all',
                      watch('industry') === ind ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40'
                    )}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Company size</label>
              <div className="flex gap-2 flex-wrap">
                {COMPANY_SIZES.map(size => (
                  <button key={size} type="button" onClick={() => setValue('companySize', size)}
                    className={cn('px-4 py-2 rounded-xl border text-sm transition-all',
                      watch('companySize') === size ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40'
                    )}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Website <span className="text-[var(--color-text-muted)]">(optional)</span></label>
              <div className="relative">
                <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input className="input-dark pl-10" placeholder="https://yourcompany.rw" {...register('website')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">About your organisation <span className="text-[var(--color-text-muted)]">(optional)</span></label>
              <textarea rows={3} className="input-dark resize-none" placeholder="Brief description of what your organisation does and the type of engineering projects you typically run..." {...register('description')} />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2 gap-2">
              {isSubmitting
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</>
                : <>Go to Dashboard <ArrowRight size={16} /></>
              }
            </button>

            <button type="button" onClick={() => router.push('/dashboard/client')} className="w-full text-center text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              Skip for now →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
