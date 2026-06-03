'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle, Zap, DollarSign, FileText, Settings } from 'lucide-react'
import { useCreateJob } from '@/hooks'
import { DISCIPLINE_LABELS, EXPERIENCE_LABELS } from '@/types'
import type { Discipline, ExperienceLevel, JobType } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Basics',       icon: FileText,    title: 'Describe your project' },
  { id: 2, label: 'Requirements', icon: Settings,    title: 'Skills & requirements' },
  { id: 3, label: 'Budget',       icon: DollarSign,  title: 'Set your budget' },
  { id: 4, label: 'Review',       icon: CheckCircle, title: 'Review & publish' },
]

const COMMON_SKILLS: Record<string, string[]> = {
  CIVIL:          ['AutoCAD', 'Civil 3D', 'Roads & Highways', 'Drainage Design', 'Site Supervision', 'Infrastructure Design'],
  STRUCTURAL:     ['ETABS', 'SAP2000', 'Steel Design', 'Concrete Design', 'Seismic Analysis', 'Foundation Design'],
  MECHANICAL:     ['SolidWorks', 'HVAC Systems', 'FEA Analysis', 'Thermal Analysis', 'AutoCAD Mechanical'],
  ELECTRICAL:     ['AutoCAD Electrical', 'Power Systems', 'PLC Programming', 'Solar PV Design', 'Load Flow Analysis'],
  ENVIRONMENTAL:  ['Environmental Impact Assessment', 'Water Quality Analysis', 'GIS Mapping', 'WASH Design'],
  GEOTECHNICAL:   ['Soil Analysis', 'Foundation Design', 'Slope Stability', 'Ground Investigation'],
  TRANSPORTATION: ['Traffic Analysis', 'Road Design', 'Highway Design', 'Transport Planning'],
  WATER_RESOURCES:['Hydraulic Modelling', 'EPANET', 'HEC-RAS', 'Water Supply Design'],
  OTHER:          ['Project Management', 'Technical Writing', 'AutoCAD', 'Cost Estimation'],
}

export default function PostJobPage() {
  const router = useRouter()
  const [step, setStep]           = useState(1)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill]       = useState('')
  const createJob = useCreateJob()

  const { register, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title:           '',
      description:     '',
      discipline:      '' as Discipline,
      experienceLevel: '' as ExperienceLevel,
      jobType:         'FIXED' as JobType,
      isRemote:        true,
      location:        '',
      province:        '',
      duration:        '',
      budgetMin:       '',
      budgetMax:       '',
      hourlyRateMin:   '',
      hourlyRateMax:   '',
      deadline:        '',
    },
  })

  const discipline     = watch('discipline')
  const jobType        = watch('jobType')
  const values         = watch()
  const progress       = ((step - 1) / (STEPS.length - 1)) * 100
  const suggestedSkills = COMMON_SKILLS[discipline] || COMMON_SKILLS.OTHER

  const toggleSkill = (s: string) =>
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const addCustom = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()])
      setCustomSkill('')
    }
  }

  const next = () => {
    if (step === 1) {
      if (!values.title.trim())       { toast.error('Project title is required'); return }
      if (!values.description.trim()) { toast.error('Project description is required'); return }
      if (!values.discipline)         { toast.error('Please select a discipline'); return }
    }
    if (step === 2 && !values.experienceLevel) { toast.error('Please select experience level'); return }
    if (step < STEPS.length) setStep(s => s + 1)
  }

  const onSubmit = async () => {
    try {
      const payload: any = {
        title:           values.title,
        description:     values.description,
        discipline:      values.discipline,
        experienceLevel: values.experienceLevel,
        jobType:         values.jobType,
        isRemote:        values.isRemote,
        requiredSkills:  selectedSkills,
        ...(values.location && { location: values.location }),
        ...(values.province && { province: values.province }),
        ...(values.duration && { duration: values.duration }),
        ...(values.deadline && { deadline: values.deadline }),
      }
      if (jobType === 'HOURLY') {
        if (values.hourlyRateMin) payload.hourlyRateMin = Number(values.hourlyRateMin)
        if (values.hourlyRateMax) payload.hourlyRateMax = Number(values.hourlyRateMax)
      } else {
        if (values.budgetMin) payload.budgetMin = Number(values.budgetMin)
        if (values.budgetMax) payload.budgetMax = Number(values.budgetMax)
      }
      const res: any = await createJob.mutateAsync(payload)
      toast.success('Project posted successfully! Engineers can now apply.')
      router.push(`/jobs/${res.data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to post project')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="fixed top-16 left-0 right-0 h-0.5 bg-surface-border z-40">
        <motion.div className="h-full bg-brand-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isActive    = s.id === step
            const isCompleted = s.id < step
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button onClick={() => s.id < step && setStep(s.id)}
                  className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                    isCompleted ? 'bg-brand-500 text-white cursor-pointer' :
                    isActive    ? 'bg-brand-500/20 border-2 border-brand-500 text-brand-400' :
                                  'bg-surface-card border border-surface-border text-[var(--color-text-muted)] cursor-default'
                  )}>
                  {isCompleted ? <CheckCircle size={15} className="fill-white" /> : <Icon size={15} />}
                </button>
                <span className={cn('text-xs hidden sm:block', isActive ? 'text-white' : 'text-[var(--color-text-muted)]')}>{s.label}</span>
                {s.id < STEPS.length && <div className={cn('w-8 h-px hidden sm:block', isCompleted ? 'bg-brand-500' : 'bg-surface-border')} />}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h1 className="font-display text-3xl text-white mb-2">{STEPS[step - 1].title}</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mb-8">
              {step === 1 && 'Give engineers enough detail to understand your project.'}
              {step === 2 && 'Define what skills and experience level you need.'}
              {step === 3 && 'Set a budget that attracts quality engineers.'}
              {step === 4 && 'Review your posting before it goes live.'}
            </p>

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Project title *</label>
                  <input className="input-dark" placeholder="e.g. Structural Assessment for Kigali Office Building" {...register('title', { required: true })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Discipline *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(DISCIPLINE_LABELS) as [Discipline, string][]).map(([value, label]) => (
                      <button key={value} type="button" onClick={() => setValue('discipline', value)}
                        className={cn('p-3 rounded-xl border text-sm text-left transition-all',
                          watch('discipline') === value ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40'
                        )}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Project description *</label>
                  <textarea rows={7} className="input-dark resize-none" placeholder="Describe the project scope, objectives, deliverables, site conditions, and any specific requirements..." {...register('description', { required: true, minLength: 50 })} />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Minimum 50 characters. More detail = better proposals.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Duration</label>
                    <input className="input-dark" placeholder="e.g. 2 weeks, 3 months" {...register('duration')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Deadline</label>
                    <input type="date" className="input-dark" {...register('deadline')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Location</label>
                  <div className="flex gap-3 mb-3">
                    {[{ label: 'Remote', value: true }, { label: 'On-site / Hybrid', value: false }].map(opt => (
                      <button key={String(opt.value)} type="button" onClick={() => setValue('isRemote', opt.value)}
                        className={cn('flex-1 py-2.5 rounded-xl text-sm border transition-all',
                          watch('isRemote') === opt.value ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border text-[var(--color-text-secondary)] hover:border-brand-500/40'
                        )}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {!watch('isRemote') && <input className="input-dark" placeholder="e.g. Kigali, Gasabo District" {...register('location')} />}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Experience level *</label>
                  <div className="space-y-2">
                    {(Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][]).map(([value, label]) => (
                      <button key={value} type="button" onClick={() => setValue('experienceLevel', value)}
                        className={cn('w-full p-4 rounded-xl border text-left transition-all',
                          watch('experienceLevel') === value ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-card hover:border-brand-500/30'
                        )}>
                        <span className={cn('font-medium text-sm', watch('experienceLevel') === value ? 'text-white' : 'text-[var(--color-text-secondary)]')}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Required skills</label>
                  {discipline && (
                    <div className="mb-3">
                      <p className="text-xs text-[var(--color-text-muted)] mb-2">Suggested for {DISCIPLINE_LABELS[discipline as Discipline]}</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkills.map(s => (
                          <button key={s} type="button" onClick={() => toggleSkill(s)}
                            className={cn('px-3 py-1.5 rounded-xl text-xs border transition-all',
                              selectedSkills.includes(s) ? 'bg-brand-500 border-brand-500 text-white' : 'bg-surface-card border-surface-border text-[var(--color-text-secondary)] hover:border-brand-500/40'
                            )}>
                            {selectedSkills.includes(s) ? '✓ ' : '+ '}{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())} className="input-dark flex-1 text-sm" placeholder="Add a custom skill requirement" />
                    <button type="button" onClick={addCustom} className="btn-ghost px-4 text-sm">Add</button>
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSkills.map(s => (
                        <span key={s} onClick={() => toggleSkill(s)} className="px-3 py-1 rounded-xl text-xs bg-brand-500/15 text-brand-300 border border-brand-500/30 cursor-pointer hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30 transition-colors">
                          {s} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Contract type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['FIXED', 'HOURLY', 'MILESTONE'] as JobType[]).map(type => (
                      <button key={type} type="button" onClick={() => setValue('jobType', type)}
                        className={cn('p-4 rounded-xl border text-center transition-all',
                          watch('jobType') === type ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-card hover:border-brand-500/30'
                        )}>
                        <span className={cn('text-sm font-medium', watch('jobType') === type ? 'text-white' : 'text-[var(--color-text-secondary)]')}>
                          {type === 'FIXED' ? 'Fixed Price' : type === 'HOURLY' ? 'Hourly Rate' : 'Milestone'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {jobType === 'HOURLY' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Min rate ($/hr)</label>
                      <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span><input type="number" min={1} className="input-dark pl-7" placeholder="20" {...register('hourlyRateMin')} /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Max rate ($/hr)</label>
                      <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span><input type="number" min={1} className="input-dark pl-7" placeholder="80" {...register('hourlyRateMax')} /></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Budget min ($)</label>
                      <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span><input type="number" min={1} className="input-dark pl-7" placeholder="500" {...register('budgetMin')} /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Budget max ($)</label>
                      <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span><input type="number" min={1} className="input-dark pl-7" placeholder="5000" {...register('budgetMax')} /></div>
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-surface-hover border border-surface-border text-sm text-[var(--color-text-secondary)]">
                  <p className="font-medium text-white mb-1">💡 Budget tips</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Set a realistic range to attract experienced engineers</li>
                    <li>• InjenioRw charges an 8% platform fee on payments</li>
                    <li>• Funds are held in escrow and released per milestone</li>
                    <li>• Payments are disbursed via MTN Mobile Money</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="card-dark p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      {jobType === 'FIXED' ? 'Fixed Price' : jobType === 'HOURLY' ? 'Hourly' : 'Milestone'}
                    </span>
                    {values.discipline && <span className="text-xs px-2.5 py-1 rounded-full bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">{DISCIPLINE_LABELS[values.discipline as Discipline]}</span>}
                    {values.isRemote && <span className="text-xs px-2.5 py-1 rounded-full bg-surface-hover border border-surface-border text-[var(--color-text-muted)]">Remote</span>}
                  </div>
                  <h2 className="font-display text-2xl text-white mb-2">{values.title || 'Untitled Project'}</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">{values.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-dark p-4">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Experience needed</p>
                    <p className="text-sm font-medium text-white">{values.experienceLevel ? EXPERIENCE_LABELS[values.experienceLevel as ExperienceLevel] : '—'}</p>
                  </div>
                  <div className="card-dark p-4">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Budget</p>
                    <p className="text-sm font-medium text-white">
                      {jobType === 'HOURLY'
                        ? values.hourlyRateMin ? `$${values.hourlyRateMin}–$${values.hourlyRateMax || '?'}/hr` : 'Not set'
                        : values.budgetMin ? `$${Number(values.budgetMin).toLocaleString()}–$${Number(values.budgetMax || 0).toLocaleString()}` : 'Not set'
                      }
                    </p>
                  </div>
                </div>
                {selectedSkills.length > 0 && (
                  <div className="card-dark p-4">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">Required skills ({selectedSkills.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-xl bg-surface-hover border border-surface-border text-[var(--color-text-secondary)]">{s}</span>)}
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 text-sm text-[var(--color-text-secondary)]">
                  Once published, engineers can browse and submit proposals. You'll receive notifications for each new proposal.
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-10">
          <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="btn-ghost gap-2">
            <ArrowLeft size={16} /> Back
          </button>
          {step < STEPS.length ? (
            <button type="button" onClick={next} className="btn-primary gap-2">Continue <ArrowRight size={16} /></button>
          ) : (
            <button type="button" onClick={onSubmit} disabled={createJob.isPending} className="btn-primary gap-2 px-8">
              {createJob.isPending
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Publishing…</>
                : <><CheckCircle size={16} /> Publish Project</>
              }
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
