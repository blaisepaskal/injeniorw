'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Zap, ArrowRight, ArrowLeft, Check, Plus, X,
  Briefcase, GraduationCap, Wrench, Star, MapPin,
} from 'lucide-react'
import { engineersApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

// ── Constants ─────────────────────────────────────────────────────

const DISCIPLINES = [
  { value: 'CIVIL',            label: 'Civil Engineering' },
  { value: 'STRUCTURAL',       label: 'Structural Engineering' },
  { value: 'MECHANICAL',       label: 'Mechanical Engineering' },
  { value: 'ELECTRICAL',       label: 'Electrical Engineering' },
  { value: 'ENVIRONMENTAL',    label: 'Environmental Engineering' },
  { value: 'GEOTECHNICAL',     label: 'Geotechnical Engineering' },
  { value: 'TRANSPORTATION',   label: 'Transportation Engineering' },
  { value: 'WATER_RESOURCES',  label: 'Water Resources Engineering' },
  { value: 'INDUSTRIAL',       label: 'Industrial Engineering' },
  { value: 'CHEMICAL',         label: 'Chemical Engineering' },
  { value: 'MINING',           label: 'Mining Engineering' },
  { value: 'OTHER',            label: 'Other Discipline' },
]

const EXPERIENCE_LEVELS = [
  { value: 'JUNIOR', label: 'Junior',  desc: '0–2 years' },
  { value: 'MID',    label: 'Mid-level', desc: '3–5 years' },
  { value: 'SENIOR', label: 'Senior',  desc: '6–10 years' },
  { value: 'EXPERT', label: 'Expert',  desc: '10+ years' },
]

const PROVINCES = [
  'Kigali City', 'Eastern Province', 'Western Province',
  'Northern Province', 'Southern Province',
]

const STEPS = [
  { id: 1, label: 'Expertise',   Icon: Briefcase },
  { id: 2, label: 'Skills',      Icon: Wrench },
  { id: 3, label: 'Education',   Icon: GraduationCap },
  { id: 4, label: 'Rate',        Icon: Star },
  { id: 5, label: 'Done',        Icon: Check },
]

// ── Zod schemas ───────────────────────────────────────────────────

const step1Schema = z.object({
  discipline:       z.string().min(1, 'Select your primary discipline'),
  experienceLevel:  z.enum(['JUNIOR', 'MID', 'SENIOR', 'EXPERT']),
  yearsOfExperience: z.coerce.number().min(0).max(50),
  headline:         z.string().min(10, 'At least 10 characters').max(150),
  bio:              z.string().min(50, 'At least 50 characters').max(2000),
})

const step3Schema = z.object({
  institution:  z.string().min(2, 'Required'),
  degree:       z.string().min(2, 'Required'),
  fieldOfStudy: z.string().min(2, 'Required'),
  startYear:    z.coerce.number().min(1970).max(new Date().getFullYear()),
  endYear:      z.coerce.number().optional(),
  current:      z.boolean().optional(),
})

const step4Schema = z.object({
  hourlyRate:   z.coerce.number().min(5, 'Minimum $5/hr'),
  availability: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']),
  province:     z.string().optional(),
  district:     z.string().optional(),
  momoNumber:   z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step3Data = z.infer<typeof step3Schema>
type Step4Data = z.infer<typeof step4Schema>

// ── Component ─────────────────────────────────────────────────────

export default function EngineerOnboarding() {
  const router    = useRouter()
  const { initialize } = useAuthStore()

  const [step, setStep]       = useState(1)
  const [saving, setSaving]   = useState(false)

  // Skill state
  const [skills, setSkills]   = useState<{ name: string; level: number }[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [skillLevel, setSkillLevel] = useState(3)

  // Step 1 form
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { experienceLevel: 'MID', yearsOfExperience: 3 },
  })

  // Step 3 form
  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { startYear: 2019, current: false },
  })

  // Step 4 form
  const form4 = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: { availability: 'AVAILABLE', hourlyRate: 25 },
  })

  // Stored step data
  const [data1, setData1] = useState<Step1Data | null>(null)
  const [educations, setEducations] = useState<Step3Data[]>([])

  // ── Step handlers ──────────────────────────────────────────────

  const submitStep1 = form1.handleSubmit((data) => {
    setData1(data)
    setStep(2)
  })

  const addSkill = () => {
    const name = skillInput.trim()
    if (!name) return
    if (skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Skill already added')
      return
    }
    setSkills(prev => [...prev, { name, level: skillLevel }])
    setSkillInput('')
    setSkillLevel(3)
  }

  const removeSkill = (name: string) => setSkills(prev => prev.filter(s => s.name !== name))

  const addEducation = form3.handleSubmit((data) => {
    setEducations(prev => [...prev, data])
    form3.reset({ startYear: 2019, current: false })
    toast.success('Education entry added')
  })

  const submitStep4 = form4.handleSubmit(async (data4) => {
    if (!data1) return
    setSaving(true)

    try {
      // 1. Update core profile
      await engineersApi.updateProfile({
        headline:         data1.headline,
        bio:              data1.bio,
        discipline:       data1.discipline,
        experienceLevel:  data1.experienceLevel,
        yearsOfExperience: data1.yearsOfExperience,
        hourlyRate:       data4.hourlyRate,
        availability:     data4.availability,
        province:         data4.province || undefined,
        district:         data4.district || undefined,
        momoNumber:       data4.momoNumber || undefined,
      })

      // 2. Add skills
      for (const skill of skills) {
        try {
          await engineersApi.addSkill({ name: skill.name, level: skill.level })
        } catch {}
      }

      // 3. Add education entries
      for (const edu of educations) {
        try {
          await engineersApi.addEducation(edu)
        } catch {}
      }

      // 4. Refresh user in store
      await initialize()

      setStep(5)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  })

  // ── UI helpers ────────────────────────────────────────────────

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )

  // ── Render ────────────────────────────────────────────────────

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
        <span className="ml-2 text-sm text-[var(--color-text-muted)]">· Engineer Onboarding</span>
      </header>

      {/* Progress */}
      <div className="border-b border-surface-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all ${
                step > s.id  ? 'bg-brand-500 text-white' :
                step === s.id ? 'bg-brand-500/20 border-2 border-brand-500 text-brand-400' :
                                'bg-surface-card border border-surface-border text-[var(--color-text-muted)]'
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <span className={`text-xs hidden sm:block ${step === s.id ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 ${step > s.id ? 'bg-brand-500' : 'bg-surface-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* ── STEP 1: Expertise ── */}
          {step === 1 && (
            <form onSubmit={submitStep1} className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-white mb-1">Your engineering expertise</h1>
                <p className="text-[var(--color-text-secondary)]">Tell clients what you specialise in</p>
              </div>

              {/* Discipline grid */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                  Primary discipline <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DISCIPLINES.map(d => {
                    const selected = form1.watch('discipline') === d.value
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => form1.setValue('discipline', d.value, { shouldValidate: true })}
                        className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                          selected
                            ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                            : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)] hover:border-brand-500/40'
                        }`}
                      >
                        {d.label}
                      </button>
                    )
                  })}
                </div>
                {form1.formState.errors.discipline && (
                  <p className="text-xs text-red-400 mt-1">{form1.formState.errors.discipline.message}</p>
                )}
              </div>

              {/* Experience level */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                  Experience level <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXPERIENCE_LEVELS.map(lvl => {
                    const selected = form1.watch('experienceLevel') === lvl.value
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => form1.setValue('experienceLevel', lvl.value as any)}
                        className={`px-3 py-3 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-surface-border bg-surface-card hover:border-brand-500/40'
                        }`}
                      >
                        <p className={`text-sm font-semibold ${selected ? 'text-brand-300' : 'text-white'}`}>{lvl.label}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{lvl.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Years of experience */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Years of experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  className="input-dark w-32"
                  {...form1.register('yearsOfExperience')}
                />
              </div>

              {/* Headline */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Professional headline <span className="text-red-400">*</span>
                </label>
                <input
                  {...form1.register('headline')}
                  placeholder="e.g. Senior Civil Engineer | Roads & Infrastructure Specialist"
                  className="input-dark"
                />
                {form1.formState.errors.headline && (
                  <p className="text-xs text-red-400 mt-1">{form1.formState.errors.headline.message}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Professional bio <span className="text-red-400">*</span>
                </label>
                <textarea
                  {...form1.register('bio')}
                  rows={5}
                  placeholder="Describe your background, expertise, and what kinds of projects you enjoy working on…"
                  className="input-dark resize-none"
                />
                {form1.formState.errors.bio && (
                  <p className="text-xs text-red-400 mt-1">{form1.formState.errors.bio.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Skills ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-white mb-1">Your skills</h1>
                <p className="text-[var(--color-text-secondary)]">Add the tools and techniques you work with</p>
              </div>

              {/* Add skill */}
              <div className="card-dark p-5 space-y-4">
                <div className="flex gap-3">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                    placeholder="e.g. AutoCAD, ETABS, SolidWorks…"
                    className="input-dark flex-1"
                  />
                  <button type="button" onClick={addSkill} className="btn-primary px-4 py-2">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Level selector */}
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-2">Proficiency level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setSkillLevel(l)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          skillLevel >= l
                            ? 'bg-brand-500/20 border-brand-500/60 text-brand-300'
                            : 'border-surface-border text-[var(--color-text-muted)]'
                        }`}
                      >
                        {['Beginner', 'Basic', 'Proficient', 'Advanced', 'Expert'][l - 1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Added skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <div
                      key={s.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border"
                    >
                      <span className="text-sm text-white">{s.name}</span>
                      <span className="text-xs text-brand-400">
                        {'★'.repeat(s.level)}{'☆'.repeat(5 - s.level)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSkill(s.name)}
                        className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {skills.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                  No skills added yet — you can add them now or from your profile later.
                </p>
              )}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Education ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-white mb-1">Education</h1>
                <p className="text-[var(--color-text-secondary)]">Add your academic qualifications (optional — you can skip)</p>
              </div>

              {/* Add education form */}
              <div className="card-dark p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Institution</label>
                    <input {...form3.register('institution')} placeholder="University of Rwanda" className="input-dark" />
                    {form3.formState.errors.institution && (
                      <p className="text-xs text-red-400 mt-1">{form3.formState.errors.institution.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Degree</label>
                    <input {...form3.register('degree')} placeholder="BSc, MSc, BEng…" className="input-dark" />
                    {form3.formState.errors.degree && (
                      <p className="text-xs text-red-400 mt-1">{form3.formState.errors.degree.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Field of Study</label>
                    <input {...form3.register('fieldOfStudy')} placeholder="Civil Engineering" className="input-dark" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Start year</label>
                      <input type="number" {...form3.register('startYear')} className="input-dark" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">End year</label>
                      <input
                        type="number"
                        {...form3.register('endYear')}
                        disabled={form3.watch('current')}
                        className="input-dark disabled:opacity-40"
                        placeholder={form3.watch('current') ? 'Present' : ''}
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
                  <input type="checkbox" {...form3.register('current')} className="accent-brand-500 w-4 h-4" />
                  Currently studying here
                </label>
                <button type="button" onClick={addEducation} className="btn-ghost text-sm py-2">
                  <Plus size={14} /> Add education entry
                </button>
              </div>

              {/* Added entries */}
              {educations.map((edu, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-surface-card border border-surface-border">
                  <div>
                    <p className="text-sm font-medium text-white">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{edu.institution} · {edu.startYear}–{edu.current ? 'Present' : edu.endYear}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducations(prev => prev.filter((_, j) => j !== i))}
                    className="text-[var(--color-text-muted)] hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-ghost">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Rate & Location ── */}
          {step === 4 && (
            <form onSubmit={submitStep4} className="space-y-6">
              <div>
                <h1 className="font-display text-3xl text-white mb-1">Rate & availability</h1>
                <p className="text-[var(--color-text-secondary)]">Set your hourly rate and how clients can find you</p>
              </div>

              {/* Hourly rate */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Hourly rate (USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">$</span>
                  <input
                    type="number"
                    min={5}
                    {...form4.register('hourlyRate')}
                    className="input-dark pl-7"
                    placeholder="25"
                  />
                </div>
                {form4.formState.errors.hourlyRate && (
                  <p className="text-xs text-red-400 mt-1">{form4.formState.errors.hourlyRate.message}</p>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">Availability</label>
                <div className="flex gap-3">
                  {[
                    { value: 'AVAILABLE',   label: 'Available',    color: 'brand' },
                    { value: 'BUSY',        label: 'Busy',         color: 'earth' },
                    { value: 'UNAVAILABLE', label: 'Unavailable',  color: 'red' },
                  ].map(opt => {
                    const selected = form4.watch('availability') === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form4.setValue('availability', opt.value as any)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          selected
                            ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                            : 'border-surface-border bg-surface-card text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                    <MapPin size={13} className="inline mr-1" />Province
                  </label>
                  <select {...form4.register('province')} className="input-dark">
                    <option value="">Select province…</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">District</label>
                  <input {...form4.register('district')} placeholder="e.g. Gasabo" className="input-dark" />
                </div>
              </div>

              {/* MoMo */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  MTN MoMo number <span className="text-[var(--color-text-muted)] font-normal">(optional — for receiving payments)</span>
                </label>
                <input
                  {...form4.register('momoNumber')}
                  placeholder="+250 788 123 456"
                  className="input-dark w-64"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setStep(3)} className="btn-ghost">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <><Spinner /> Saving…</> : <>Finish & go live <Check size={16} /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 5: Done ── */}
          {step === 5 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center mx-auto">
                <Check size={36} className="text-brand-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl text-white mb-2">You're live on InjenioRw! 🎉</h1>
                <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
                  Your engineer profile is set up. Clients can now find you.
                  Head to your dashboard to track opportunities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary"
                >
                  Go to dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
