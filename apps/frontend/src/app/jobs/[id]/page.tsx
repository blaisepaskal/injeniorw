'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Clock, Users, MapPin, DollarSign,
  CheckCircle, AlertCircle, Calendar, Building2,
  Send, Plus, Trash2,
} from 'lucide-react'
import { useJob, useCreateProposal } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import { DISCIPLINE_LABELS, EXPERIENCE_LABELS } from '@/types'
import type { JobType } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useForm, useFieldArray } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'

const JOB_TYPE_LABELS: Record<JobType, string> = {
  HOURLY: 'Hourly', FIXED: 'Fixed Price', MILESTONE: 'Milestone',
}

export default function JobDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const { user } = useAuthStore()
  const [showProposalForm, setShowProposalForm] = useState(false)

  const { data, isLoading } = useJob(params.id as string)
  const createProposal = useCreateProposal()

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      coverLetter:       '',
      proposedRate:      '',
      estimatedDuration: '',
      milestones: [{ title: '', description: '', amount: '', order: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' })

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-text-secondary)] mb-4">Project not found</p>
        <Link href="/jobs" className="btn-primary">Browse Projects</Link>
      </div>
    </div>
  )

  const job = (data as any).data
  const client = job.clientProfile

  const formatBudget = () => {
    if (job.jobType === 'HOURLY' && job.hourlyRateMin)
      return job.hourlyRateMax ? `$${job.hourlyRateMin}–$${job.hourlyRateMax}/hr` : `From $${job.hourlyRateMin}/hr`
    if (job.budgetMin)
      return job.budgetMax ? `$${job.budgetMin.toLocaleString()}–$${job.budgetMax.toLocaleString()}` : `From $${job.budgetMin.toLocaleString()}`
    return 'Budget to be discussed'
  }

  const onSubmitProposal = async (values: any) => {
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'ENGINEER') { toast.error('Only engineers can submit proposals'); return }
    try {
      await createProposal.mutateAsync({
        jobId:             job.id,
        coverLetter:       values.coverLetter,
        proposedRate:      Number(values.proposedRate),
        estimatedDuration: values.estimatedDuration,
        milestones: values.milestones.map((m: any, i: number) => ({
          title:       m.title,
          description: m.description,
          amount:      Number(m.amount),
          order:       i + 1,
        })),
      })
      toast.success('Proposal submitted! The client will review it shortly.')
      setShowProposalForm(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit proposal')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white mb-8 transition-colors">
          <ChevronLeft size={14} /> Back to projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            <div className="card-dark p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-mono">
                  {JOB_TYPE_LABELS[job.jobType as JobType]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">
                  {DISCIPLINE_LABELS[job.discipline]}
                </span>
                {job.isRemote && <span className="text-xs px-2.5 py-1 rounded-full bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">Remote</span>}
              </div>
              <h1 className="font-display text-3xl text-white mb-3">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5"><Clock size={12} /> Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                <span className="flex items-center gap-1.5"><Users size={12} /> {job._count?.proposals ?? job.proposalCount} proposals</span>
                {job.location && <span className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</span>}
                {job.deadline && <span className="flex items-center gap-1.5"><Calendar size={12} /> Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}</span>}
              </div>
            </div>

            <div className="card-dark p-6">
              <h2 className="font-display text-xl text-white mb-4">Project Description</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {job.requiredSkills?.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-white mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 rounded-xl text-sm bg-surface-hover border border-surface-border text-[var(--color-text-secondary)]">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {showProposalForm && user?.role === 'ENGINEER' && (
              <div className="card-dark p-6 border-brand-500/30">
                <h2 className="font-display text-xl text-white mb-5">Submit Your Proposal</h2>
                <form onSubmit={handleSubmit(onSubmitProposal)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Cover Letter <span className="text-[var(--color-text-muted)]">(min. 100 characters)</span></label>
                    <textarea rows={6} className="input-dark resize-none" placeholder="Introduce yourself, explain your relevant experience, and why you're the best fit for this project..." {...register('coverLetter', { required: true, minLength: 100 })} />
                    {errors.coverLetter && <p className="text-xs text-red-400 mt-1">Cover letter must be at least 100 characters</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Your Rate ({job.jobType === 'HOURLY' ? '$/hr' : 'total $'})</label>
                      <input type="number" min={1} className="input-dark" placeholder="e.g. 45" {...register('proposedRate', { required: true, min: 1 })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Estimated Duration</label>
                      <input className="input-dark" placeholder="e.g. 2 weeks, 3 months" {...register('estimatedDuration', { required: true })} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-[var(--color-text-secondary)]">Milestones</label>
                      <button type="button" onClick={() => append({ title: '', description: '', amount: '', order: fields.length + 1 })} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        <Plus size={12} /> Add milestone
                      </button>
                    </div>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-4 rounded-xl bg-surface-hover border border-surface-border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Milestone {index + 1}</span>
                            {fields.length > 1 && (
                              <button type="button" onClick={() => remove(index)} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <input className="input-dark text-sm" placeholder="Milestone title" {...register(`milestones.${index}.title`, { required: true })} />
                            </div>
                            <div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
                                <input type="number" min={1} className="input-dark pl-7 text-sm" placeholder="Amount" {...register(`milestones.${index}.amount`, { required: true, min: 1 })} />
                              </div>
                            </div>
                            <div className="sm:col-span-3">
                              <textarea rows={2} className="input-dark text-sm resize-none" placeholder="What will be delivered in this milestone?" {...register(`milestones.${index}.description`, { required: true })} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={createProposal.isPending} className="btn-primary gap-2 flex-1 justify-center">
                      {createProposal.isPending ? 'Submitting…' : <><Send size={15} /> Submit Proposal</>}
                    </button>
                    <button type="button" onClick={() => setShowProposalForm(false)} className="btn-ghost px-6">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="card-dark p-6">
              <div className="text-center mb-5">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Budget</p>
                <p className="font-display text-3xl text-white">{formatBudget()}</p>
              </div>
              {user?.role === 'ENGINEER' ? (
                <button onClick={() => setShowProposalForm(true)} disabled={showProposalForm} className="btn-primary w-full justify-center">
                  {showProposalForm ? 'Proposal form open ↓' : 'Submit Proposal'}
                </button>
              ) : !user ? (
                <Link href="/auth/register?role=engineer" className="btn-primary w-full justify-center block text-center">Sign up to Apply</Link>
              ) : (
                <div className="text-center text-sm text-[var(--color-text-muted)]">You posted this project</div>
              )}
            </div>

            <div className="card-dark p-5 space-y-4">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)]">Project Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-secondary)]">Experience</span>
                  <span className="text-white text-right">{EXPERIENCE_LABELS[job.experienceLevel]}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-secondary)]">Contract type</span>
                  <span className="text-white">{JOB_TYPE_LABELS[job.jobType as JobType]}</span>
                </div>
                {job.duration && <div className="flex justify-between gap-2"><span className="text-[var(--color-text-secondary)]">Duration</span><span className="text-white">{job.duration}</span></div>}
                {job.startDate && <div className="flex justify-between gap-2"><span className="text-[var(--color-text-secondary)]">Start date</span><span className="text-white">{format(new Date(job.startDate), 'MMM d, yyyy')}</span></div>}
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--color-text-secondary)]">Location</span>
                  <span className="text-white">{job.isRemote ? 'Remote' : job.location || 'On-site'}</span>
                </div>
              </div>
            </div>

            {client && (
              <div className="card-dark p-5">
                <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)] mb-4">About the Client</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center">
                    <Building2 size={16} className="text-[var(--color-text-muted)]" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{client.companyName || `${client.user?.firstName} ${client.user?.lastName}`}</p>
                    {client.industry && <p className="text-xs text-[var(--color-text-secondary)]">{client.industry}</p>}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                  {client.isVerified && <div className="flex items-center gap-1.5 text-brand-400"><CheckCircle size={11} /> Verified client</div>}
                  {client.totalJobs > 0 && <div>{client.totalJobs} projects posted</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
