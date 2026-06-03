'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HardHat, MapPin, DollarSign, BookOpen,
  CheckCircle, ArrowRight, ArrowLeft, Zap,
} from 'lucide-react'
import { useUpdateEngineerProfile, useAddSkill } from '@/hooks'
import { DISCIPLINE_LABELS, EXPERIENCE_LABELS, RWANDA_PROVINCES, RWANDA_DISTRICTS } from '@/types'
import type { Discipline, ExperienceLevel } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Discipline',   icon: HardHat,     title: 'Your Engineering Discipline' },
  { id: 2, label: 'Experience',   icon: BookOpen,     title: 'Your Experience Level' },
  { id: 3, label: 'Location',     icon: MapPin,       title: 'Where Are You Based?' },
  { id: 4, label: 'Rate & Bio',   icon: DollarSign,   title: 'Your Rate & Bio' },
  { id: 5, label: 'Skills',       icon: CheckCircle,  title: 'Your Top Skills' },
]

const COMMON_SKILLS: Record<string, string[]> = {
  CIVIL:          ['AutoCAD', 'Civil 3D', 'Infrastructure Design', 'Roads & Highways', 'Drainage Design', 'Site Supervision', 'BIM', 'QGIS'],
  STRUCTURAL:     ['ETABS', 'SAP2000', 'Steel Design', 'Concrete Design', 'Seismic Analysis', 'Revit Structure', 'AutoCAD', 'Foundation Design'],
  MECHANICAL:     ['SolidWorks', 'AutoCAD Mechanical', 'HVAC Systems', 'FEA Analysis', 'Thermal Analysis', 'ANSYS', 'Machine Design', 'Fluid Mechanics'],
  ELECTRICAL:     ['AutoCAD Electrical', 'Power Systems', 'PLC Programming', 'Solar PV Design', 'SCADA', 'Load Flow Analysis', 'Protection Systems', 'Lighting Design'],
  ENVIRONMENTAL:  ['Environmental Impact Assessment', 'Water Quality Analysis', 'GIS Mapping', 'WASH Design', 'ArcGIS', 'Waste Management', 'Air Quality', 'EIA Reports'],
  GEOTECHNICAL:   ['Soil Analysis', 'Foundation Design', 'Slope Stability', 'Ground Investigation', 'PLAXIS', 'Geotechnical Reports', 'Laboratory Testing'],
  TRANSPORTATION: ['Traffic Analysis', 'Road Design', 'Transport Planning', 'VISSIM', 'AutoCAD Civil 3D', 'Highway Design', 'Bridge Design'],
  WATER_RESOURCES:['Hydraulic Modelling', 'EPANET', 'HEC-RAS', 'Irrigation Design', 'Flood Analysis', 'Water Supply Design', 'Dam Design'],
  OTHER:          ['Project Management', 'Technical Writing', 'AutoCAD', 'MS Project', 'Cost Estimation', 'Quality Control'],
}

export default function EngineerOnboardingPage() {
  const router  = useRouter()
  const [step, setStep]               = useState(1)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill]       = useState('')
  const [isSubmitting, setIsSubmitting]     = useState(false)

  const updateProfile = useUpdateEngineerProfile()
  const addSkill      = useAddSkill()

  const form = useForm({
    defaultValues: {
      discipline:        '' as Discipline,
      otherDisciplines:  [] as Discipline[],
      experienceLevel:   '' as ExperienceLevel,
      yearsOfExperience: 0,
      province:          '',
      district:          '',
      hourlyRate:        30,
      headline:          '',
      bio:               '',
      momoNumber:        '',
      availability:      'AVAILABLE',
    },
  })

  const { watch, setValue, register } = form
  const province   = watch('province')
  const discipline = watch('discipline')
  const progress   = ((step - 1) / (STEPS.length - 1)) * 100

  const next = () => {
    if (step === 1 && !discipline)            { toast.error('Please select a discipline'); return }
    if (step === 2 && !watch('experienceLevel')) { toast.error('Please select your experience level'); return }
    if (step < STEPS.length) setStep(s => s + 1)
  }

  const back = () => { if (step > 1) setStep(s => s - 1) }

  const toggleSkill = (skill: string) =>
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()])
      setCustomSkill('')
    }
  }

  const onFinish = async () => {
    if (selectedSkills.length < 2) { toast.error('Please add at least 2 skills'); return }
    setIsSubmitting(true)
    try {
      const values = form.getValues()
      await updateProfile.mutateAsync({
        discipline:        values.discipline,
        experienceLevel:   values.experienceLevel,
        yearsOfExperience: Number(values.yearsOfExperience),
        province:          values.province,
        district:          values.district,
        hourlyRate:        Number(values.hourlyRate),
        headline:          values.headline,
        bio:               values.bio,
        momoNumber:        values.momoNumber,
        availability:      'AVAILABLE',
      })
      for (const skillName of selectedSkills) {
        await addSkill.mutateAsync({ name: skillName, level: 3, yearsUsed: 0 })
      }
      toast.success('Profile set up! Welcome to InjenioRw 🎉')
      router.push('/dashboard/engineer')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestedSkills = COMMON_SKILLS[discipline] || COMMON_SKILLS.OTHER

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-display text-lg"><span className="text-white">Injenio</span><span className="text-brand-400">Rw</span></span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] font-mono">Step {step} of {STEPS.length}</span>
      </div>

      <div className="h-1 bg-surface-border">
        <motion.div className="h-full bg-brand-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-10">
            {STEPS.map((s) => {
              const Icon = s.icon
              const isActive    = s.id === step
              const isCompleted = s.id < step
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    isCompleted ? 'bg-brand-500 text-white' :
                    isActive    ? 'bg-brand-500/20 border-2 border-brand-500 text-brand-400' :
                                  'bg-surface-card border border-surface-border text-[var(--color-text-muted)]'
                  )}>
                    {isCompleted ? <CheckCircle size={14} className="fill-white" /> : <Icon size={14} />}
                  </div>
                  {s.id < STEPS.length && <div className={cn('w-8 h-px', isCompleted ? 'bg-brand-500' : 'bg-surface-border')} />}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h1 className="font-display text-3xl text-white text-center mb-2">{STEPS[step - 1].title}</h1>
              <p className="text-[var(--color-text-secondary)] text-center mb-8 text-sm">
                {step === 1 && 'Select your primary engineering discipline — you can add more later.'}
                {step === 2 && 'Be honest — clients will match you based on this.'}
                {step === 3 && 'Help clients find local talent for in-person work.'}
                {step === 4 && 'Set your hourly rate in USD and write a compelling bio.'}
                {step === 5 && 'Select your key skills. These appear on your public profile.'}
              </p>

              {step === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.entries(DISCIPLINE_LABELS) as [Discipline, string][]).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setValue('discipline', value)}
                      className={cn('p-4 rounded-2xl border text-left transition-all duration-200 text-sm',
                        watch('discipline') === value
                          ? 'border-brand-500 bg-brand-500/10 text-white'
                          : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40 hover:text-white'
                      )}>
                      <span className="font-medium block leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {(Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][]).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setValue('experienceLevel', value)}
                      className={cn('w-full p-5 rounded-2xl border text-left transition-all duration-200',
                        watch('experienceLevel') === value ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-card hover:border-brand-500/40'
                      )}>
                      <span className={cn('font-semibold block mb-1', watch('experienceLevel') === value ? 'text-white' : 'text-[var(--color-text-secondary)]')}>{label}</span>
                    </button>
                  ))}
                  <div className="mt-4">
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Years of experience</label>
                    <input type="number" min={0} max={50} className="input-dark w-32" {...register('yearsOfExperience')} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Province</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {RWANDA_PROVINCES.map((p) => (
                        <button key={p} type="button" onClick={() => { setValue('province', p); setValue('district', '') }}
                          className={cn('p-3 rounded-xl border text-sm text-left transition-all',
                            watch('province') === p ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40'
                          )}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {province && RWANDA_DISTRICTS[province] && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">District</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {RWANDA_DISTRICTS[province].map((d) => (
                          <button key={d} type="button" onClick={() => setValue('district', d)}
                            className={cn('p-2.5 rounded-xl border text-xs text-center transition-all',
                              watch('district') === d ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40'
                            )}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Headline <span className="text-[var(--color-text-muted)]">(shown on your profile card)</span></label>
                    <input className="input-dark" placeholder="e.g. Senior Civil Engineer | Infrastructure & Roads Specialist" {...register('headline')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Hourly rate <span className="text-[var(--color-text-muted)]">(USD)</span></label>
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
                      <input type="number" min={5} max={500} className="input-dark pl-7" {...register('hourlyRate')} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">InjenioRw takes an 8% platform fee per milestone payment.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Professional bio</label>
                    <textarea rows={5} className="input-dark resize-none" placeholder="Describe your engineering background, specializations, notable projects, and what makes you great to work with..." {...register('bio')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">MTN Mobile Money number <span className="text-[var(--color-text-muted)]">(for receiving payments)</span></label>
                    <input className="input-dark" placeholder="+250 788 000 000" {...register('momoNumber')} />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">Suggested for <span className="text-brand-400">{DISCIPLINE_LABELS[discipline as Discipline]}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSkills.map((skill) => (
                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                          className={cn('px-3 py-1.5 rounded-xl text-sm border transition-all duration-150',
                            selectedSkills.includes(skill) ? 'bg-brand-500 border-brand-500 text-white' : 'bg-surface-card border-surface-border text-[var(--color-text-secondary)] hover:border-brand-500/40'
                          )}>
                          {selectedSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Add a custom skill</label>
                    <div className="flex gap-2">
                      <input value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())} className="input-dark flex-1" placeholder="e.g. Geospatial Analysis" />
                      <button type="button" onClick={addCustomSkill} className="btn-ghost px-4">Add</button>
                    </div>
                  </div>
                  {selectedSkills.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-2">Selected ({selectedSkills.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map(skill => (
                          <span key={skill} onClick={() => toggleSkill(skill)} className="px-3 py-1 rounded-xl text-xs bg-brand-500/15 text-brand-300 border border-brand-500/30 cursor-pointer hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30 transition-colors">
                            {skill} ×
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-10">
            <button type="button" onClick={back} disabled={step === 1} className={cn('btn-ghost gap-2', step === 1 && 'invisible')}>
              <ArrowLeft size={16} /> Back
            </button>
            {step < STEPS.length ? (
              <button type="button" onClick={next} className="btn-primary gap-2">Continue <ArrowRight size={16} /></button>
            ) : (
              <button type="button" onClick={onFinish} disabled={isSubmitting} className="btn-primary gap-2 px-8">
                {isSubmitting
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</>
                  : <>Complete Profile <CheckCircle size={16} /></>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
