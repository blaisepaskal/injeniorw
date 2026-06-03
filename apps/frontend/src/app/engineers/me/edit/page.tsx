'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Save, Plus, Trash2, Award, GraduationCap,
  Briefcase, FolderOpen, ChevronLeft, Loader,
} from 'lucide-react'
import {
  useMyEngineerProfile, useUpdateEngineerProfile,
  useAddSkill, useRemoveSkill, useAddPortfolioItem,
  useAddCertification, useAddEducation,
} from '@/hooks'
import {
  DISCIPLINE_LABELS, EXPERIENCE_LABELS,
  RWANDA_PROVINCES, RWANDA_DISTRICTS,
} from '@/types'
import type { Discipline, ExperienceLevel, AvailabilityStatus } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Tab = 'basics' | 'skills' | 'portfolio' | 'certifications' | 'education'

export default function EditEngineerProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('basics')
  const [newSkill, setNewSkill]   = useState({ name: '', level: 3, yearsUsed: 0 })

  const { data: profileData, isLoading } = useMyEngineerProfile()
  const profile = (profileData as any)?.data

  const updateProfile    = useUpdateEngineerProfile()
  const addSkill         = useAddSkill()
  const removeSkill      = useRemoveSkill()
  const addPortfolio     = useAddPortfolioItem()
  const addCertification = useAddCertification()
  const addEducation     = useAddEducation()

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      headline:          '',
      bio:               '',
      discipline:        '' as Discipline,
      experienceLevel:   '' as ExperienceLevel,
      yearsOfExperience: 0,
      hourlyRate:        30,
      availability:      'AVAILABLE' as AvailabilityStatus,
      province:          '',
      district:          '',
      momoNumber:        '',
      momoName:          '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        headline:          profile.headline        ?? '',
        bio:               profile.bio             ?? '',
        discipline:        profile.discipline,
        experienceLevel:   profile.experienceLevel,
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        hourlyRate:        profile.hourlyRate       ?? 30,
        availability:      profile.availability,
        province:          profile.province         ?? '',
        district:          profile.district         ?? '',
        momoNumber:        profile.momoNumber       ?? '',
        momoName:          profile.momoName         ?? '',
      })
    }
  }, [profile])

  const province = watch('province')

  const onSaveBasics = async (values: any) => {
    try {
      await updateProfile.mutateAsync({
        ...values,
        yearsOfExperience: Number(values.yearsOfExperience),
        hourlyRate:        Number(values.hourlyRate),
      })
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    }
  }

  const onAddSkill = async () => {
    if (!newSkill.name.trim()) { toast.error('Skill name required'); return }
    try {
      await addSkill.mutateAsync(newSkill)
      setNewSkill({ name: '', level: 3, yearsUsed: 0 })
      toast.success('Skill added!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add skill')
    }
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'basics',         label: 'Basics',         icon: Briefcase },
    { id: 'skills',         label: 'Skills',          icon: Award },
    { id: 'portfolio',      label: 'Portfolio',       icon: FolderOpen },
    { id: 'certifications', label: 'Certifications',  icon: Award },
    { id: 'education',      label: 'Education',       icon: GraduationCap },
  ]

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Loader size={24} className="text-brand-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/engineer" className="btn-ghost py-2 px-3 gap-1.5 text-sm">
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <div>
            <h1 className="font-display text-2xl text-white">Edit Profile</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Keep your profile up to date to attract better projects.</p>
          </div>
        </div>

        <div className="flex gap-1 mb-8 bg-surface-card p-1 rounded-2xl border border-surface-border overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                activeTab === id ? 'bg-brand-500 text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-surface-hover'
              )}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'basics' && (
          <form onSubmit={handleSubmit(onSaveBasics)} className="space-y-6">
            <div className="card-dark p-6 space-y-5">
              <h2 className="font-display text-lg text-white">Professional Info</h2>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Headline</label>
                <input className="input-dark" placeholder="e.g. Senior Civil Engineer | Infrastructure Specialist" {...register('headline')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Bio</label>
                <textarea rows={5} className="input-dark resize-none" placeholder="Describe your background, expertise, and what you offer..." {...register('bio')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Discipline</label>
                  <select className="input-dark" {...register('discipline')}>
                    {(Object.entries(DISCIPLINE_LABELS) as [Discipline, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Experience Level</label>
                  <select className="input-dark" {...register('experienceLevel')}>
                    {(Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Years of experience</label>
                  <input type="number" min={0} max={50} className="input-dark" {...register('yearsOfExperience')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Hourly rate (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input type="number" min={5} className="input-dark pl-7" {...register('hourlyRate')} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Availability</label>
                <div className="flex gap-2">
                  {[{ value: 'AVAILABLE', label: 'Available' }, { value: 'BUSY', label: 'Busy' }, { value: 'UNAVAILABLE', label: 'Unavailable' }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setValue('availability', opt.value as AvailabilityStatus)}
                      className={cn('flex-1 py-2.5 rounded-xl text-sm border transition-all',
                        watch('availability') === opt.value ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-surface-border text-[var(--color-text-secondary)] hover:border-brand-500/40'
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-dark p-6 space-y-5">
              <h2 className="font-display text-lg text-white">Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Province</label>
                  <select className="input-dark" {...register('province')} onChange={e => { setValue('province', e.target.value); setValue('district', '') }}>
                    <option value="">Select province</option>
                    {RWANDA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">District</label>
                  <select className="input-dark" {...register('district')} disabled={!province}>
                    <option value="">Select district</option>
                    {(RWANDA_DISTRICTS[province] ?? []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card-dark p-6 space-y-5">
              <h2 className="font-display text-lg text-white">MTN Mobile Money</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Required to receive milestone payments from clients.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">MoMo Number</label>
                  <input className="input-dark" placeholder="+250 788 000 000" {...register('momoNumber')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Account Name</label>
                  <input className="input-dark" placeholder="Name on MoMo account" {...register('momoName')} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary gap-2">
                {updateProfile.isPending ? <><Loader size={14} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-5">
            <div className="card-dark p-6">
              <h2 className="font-display text-lg text-white mb-5">Your Skills</h2>
              {profile?.skills?.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] mb-4">No skills added yet.</p>
              )}
              <div className="space-y-2 mb-6">
                {profile?.skills?.map((skill: any) => (
                  <div key={skill.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover border border-surface-border">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{skill.name}</span>
                      <span className="text-xs text-[var(--color-text-muted)] ml-2">{skill.yearsUsed}y exp</span>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn('w-2 h-2 rounded-full', i <= skill.level ? 'bg-brand-500' : 'bg-surface-border')} />
                      ))}
                    </div>
                    <button onClick={() => removeSkill.mutate(skill.id)} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-5">
                <h3 className="text-sm font-medium text-white mb-3">Add a skill</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-2">
                    <input value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAddSkill())} className="input-dark text-sm" placeholder="e.g. AutoCAD, ETABS, HVAC Design" />
                  </div>
                  <div>
                    <input type="number" min={0} max={30} value={newSkill.yearsUsed} onChange={e => setNewSkill(p => ({ ...p, yearsUsed: Number(e.target.value) }))} className="input-dark text-sm" placeholder="Years used" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-[var(--color-text-muted)]">Proficiency:</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button" onClick={() => setNewSkill(p => ({ ...p, level: i }))}
                        className={cn('w-6 h-6 rounded-full border transition-all', i <= newSkill.level ? 'bg-brand-500 border-brand-500' : 'border-surface-border hover:border-brand-400')} />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][newSkill.level]}</span>
                </div>
                <button onClick={onAddSkill} disabled={addSkill.isPending} className="btn-primary text-sm gap-2">
                  <Plus size={14} /> Add Skill
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio'      && <PortfolioTab profile={profile} addPortfolio={addPortfolio} />}
        {activeTab === 'certifications' && <CertificationsTab profile={profile} addCertification={addCertification} />}
        {activeTab === 'education'      && <EducationTab profile={profile} addEducation={addEducation} />}
      </main>
    </div>
  )
}

function PortfolioTab({ profile, addPortfolio }: any) {
  const [show, setShow] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (values: any) => {
    try {
      await addPortfolio.mutateAsync({ ...values, highlights: values.highlights?.split('\n').filter(Boolean) ?? [] })
      toast.success('Portfolio item added!')
      reset(); setShow(false)
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="space-y-4">
      {profile?.portfolio?.map((item: any) => (
        <div key={item.id} className="card-dark p-5">
          <h3 className="font-medium text-white mb-1">{item.title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{item.description}</p>
        </div>
      ))}
      {!show ? (
        <button onClick={() => setShow(true)} className="btn-ghost gap-2 w-full justify-center"><Plus size={15} /> Add Portfolio Item</button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-white">New Portfolio Item</h3>
          <input className="input-dark" placeholder="Project title" {...register('title', { required: true })} />
          <textarea rows={4} className="input-dark resize-none" placeholder="Project description..." {...register('description', { required: true })} />
          <select className="input-dark" {...register('discipline', { required: true })}>
            {Object.entries(DISCIPLINE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input className="input-dark" placeholder="Client name (optional)" {...register('client')} />
          <input className="input-dark" placeholder="Project URL (optional)" {...register('projectUrl')} />
          <textarea rows={3} className="input-dark resize-none" placeholder="Key highlights (one per line)" {...register('highlights')} />
          <div className="flex gap-3">
            <button type="submit" disabled={addPortfolio.isPending} className="btn-primary gap-2"><Save size={14} /> Save Item</button>
            <button type="button" onClick={() => setShow(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function CertificationsTab({ profile, addCertification }: any) {
  const [show, setShow] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (values: any) => {
    try {
      await addCertification.mutateAsync(values)
      toast.success('Certification added!')
      reset(); setShow(false)
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="space-y-4">
      {profile?.certifications?.map((cert: any) => (
        <div key={cert.id} className="card-dark p-4 flex items-center gap-3">
          <Award size={16} className="text-earth-400 shrink-0" />
          <div>
            <p className="font-medium text-white text-sm">{cert.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{cert.issuer}</p>
          </div>
        </div>
      ))}
      {!show ? (
        <button onClick={() => setShow(true)} className="btn-ghost gap-2 w-full justify-center"><Plus size={15} /> Add Certification</button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-white">New Certification</h3>
          <input className="input-dark" placeholder="Certification name" {...register('name', { required: true })} />
          <input className="input-dark" placeholder="Issuing organization" {...register('issuer', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Issue date</label>
              <input type="date" className="input-dark" {...register('issueDate', { required: true })} />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Expiry date (optional)</label>
              <input type="date" className="input-dark" {...register('expiryDate')} />
            </div>
          </div>
          <input className="input-dark" placeholder="Credential URL (optional)" {...register('credentialUrl')} />
          <div className="flex gap-3">
            <button type="submit" disabled={addCertification.isPending} className="btn-primary gap-2"><Save size={14} /> Save</button>
            <button type="button" onClick={() => setShow(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function EducationTab({ profile, addEducation }: any) {
  const [show, setShow] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (values: any) => {
    try {
      await addEducation.mutateAsync({ ...values, startYear: Number(values.startYear), endYear: values.endYear ? Number(values.endYear) : undefined })
      toast.success('Education added!')
      reset(); setShow(false)
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="space-y-4">
      {profile?.education?.map((edu: any) => (
        <div key={edu.id} className="card-dark p-4">
          <p className="font-medium text-white text-sm">{edu.degree} in {edu.fieldOfStudy}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{edu.institution} · {edu.startYear}–{edu.current ? 'Present' : edu.endYear}</p>
        </div>
      ))}
      {!show ? (
        <button onClick={() => setShow(true)} className="btn-ghost gap-2 w-full justify-center"><Plus size={15} /> Add Education</button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="card-dark p-6 space-y-4">
          <h3 className="font-display text-lg text-white">Education</h3>
          <input className="input-dark" placeholder="Institution name" {...register('institution', { required: true })} />
          <input className="input-dark" placeholder="Degree (e.g. Bachelor of Science)" {...register('degree', { required: true })} />
          <input className="input-dark" placeholder="Field of study (e.g. Civil Engineering)" {...register('fieldOfStudy', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" className="input-dark" placeholder="Start year" {...register('startYear', { required: true })} />
            <input type="number" className="input-dark" placeholder="End year (leave blank if current)" {...register('endYear')} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={addEducation.isPending} className="btn-primary gap-2"><Save size={14} /> Save</button>
            <button type="button" onClick={() => setShow(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
