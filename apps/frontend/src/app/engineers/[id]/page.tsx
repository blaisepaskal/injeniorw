'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Star, MapPin, Briefcase, Clock, Award, Shield,
  ChevronLeft, ExternalLink, CheckCircle, Globe,
} from 'lucide-react'
import { useEngineer } from '@/hooks'
import { DISCIPLINE_LABELS, EXPERIENCE_LABELS } from '@/types'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { format } from 'date-fns'

function SkillBar({ name, level }: { name: string; level: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[var(--color-text-secondary)] min-w-0 truncate">{name}</span>
      <div className="flex gap-1 shrink-0">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full ${i <= level ? 'bg-brand-500' : 'bg-surface-border'}`} />
        ))}
      </div>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-surface-border'} />
      ))}
    </div>
  )
}

export default function EngineerProfilePage() {
  const params = useParams()
  const { data, isLoading, error } = useEngineer(params.id as string)

  if (isLoading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-[var(--color-text-secondary)] mb-4">Engineer not found</p>
        <Link href="/engineers" className="btn-primary">Browse Engineers</Link>
      </div>
    </div>
  )

  const engineer = (data as any).data
  const user = engineer.user
  const fullName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName[0]}${user.lastName[0]}`
  const memberSince = format(new Date(user.createdAt), 'MMMM yyyy')

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Breadcrumb */}
        <Link href="/engineers" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors mb-8">
          <ChevronLeft size={14} /> Back to engineers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left sidebar ── */}
          <div className="space-y-5">

            {/* Profile card */}
            <div className="card-dark p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-2xl font-display text-brand-300 mx-auto mb-4">
                {initials}
              </div>
              <h1 className="font-display text-xl text-white mb-1">{fullName}</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{engineer.headline || DISCIPLINE_LABELS[engineer.discipline]}</p>

              {/* Verification badge */}
              {engineer.verificationStatus === 'VERIFIED' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-medium mb-4">
                  <Shield size={11} /> Verified Engineer
                </div>
              )}

              {/* Availability */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5 ${
                engineer.availability === 'AVAILABLE' ? 'badge-available' : 'badge-busy'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {engineer.availability === 'AVAILABLE' ? 'Available for work' : 'Currently busy'}
              </div>

              {/* Rate */}
              {engineer.hourlyRate && (
                <div className="mb-5 p-3 rounded-xl bg-surface-hover border border-surface-border">
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Hourly Rate</p>
                  <p className="font-display text-2xl text-white">${engineer.hourlyRate}<span className="text-sm text-[var(--color-text-muted)]">/hr</span></p>
                </div>
              )}

              <Link href={`/jobs?proposal=${engineer.id}`} className="btn-primary w-full justify-center">
                Hire {user.firstName}
              </Link>
            </div>

            {/* Stats */}
            <div className="card-dark p-5 space-y-4">
              <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)]">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2"><Star size={13} className="text-yellow-400" /> Rating</span>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={engineer.avgRating} />
                    <span className="text-sm font-semibold text-white">{engineer.avgRating.toFixed(1)}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">({engineer.totalReviews})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2"><Briefcase size={13} className="text-brand-400" /> Projects</span>
                  <span className="text-sm font-semibold text-white">{engineer.completedProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2"><Clock size={13} className="text-brand-400" /> Member since</span>
                  <span className="text-sm text-white">{memberSince}</span>
                </div>
                {(user.city || engineer.province) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2"><MapPin size={13} className="text-brand-400" /> Location</span>
                    <span className="text-sm text-white">{engineer.district || user.city}, Rwanda</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {engineer.skills?.length > 0 && (
              <div className="card-dark p-5 space-y-3">
                <h3 className="text-xs font-mono font-medium tracking-widest uppercase text-[var(--color-text-muted)]">Skills</h3>
                <div className="space-y-2.5">
                  {engineer.skills.map((skill: any) => (
                    <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="card-dark p-6">
              <h2 className="font-display text-xl text-white mb-4">About</h2>
              {engineer.bio ? (
                <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{engineer.bio}</p>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">No bio added yet.</p>
              )}
              <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Discipline</p>
                  <p className="text-sm font-medium text-white">{DISCIPLINE_LABELS[engineer.discipline]}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Experience</p>
                  <p className="text-sm font-medium text-white">{EXPERIENCE_LABELS[engineer.experienceLevel]}</p>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            {engineer.portfolio?.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-white mb-5">Portfolio</h2>
                <div className="space-y-5">
                  {engineer.portfolio.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-xl bg-surface-hover border border-surface-border hover:border-brand-500/30 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        {item.projectUrl && (
                          <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 shrink-0">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">{item.description}</p>
                      {item.highlights?.length > 0 && (
                        <ul className="space-y-1">
                          {item.highlights.map((h: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                              <CheckCircle size={11} className="text-brand-400 shrink-0" /> {h}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.client && (
                        <p className="mt-2 text-xs text-[var(--color-text-muted)]">Client: {item.client}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {engineer.certifications?.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-white mb-5">Certifications</h2>
                <div className="space-y-3">
                  {engineer.certifications.map((cert: any) => (
                    <div key={cert.id} className="flex items-start gap-3 p-4 rounded-xl bg-surface-hover border border-surface-border">
                      <Award size={18} className="text-earth-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-white text-sm">{cert.name}</h3>
                          {cert.verified && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">Verified</span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)]">{cert.issuer} · {format(new Date(cert.issueDate), 'MMM yyyy')}</p>
                      </div>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 shrink-0">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {engineer.education?.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-white mb-5">Education</h2>
                <div className="space-y-4">
                  {engineer.education.map((edu: any) => (
                    <div key={edu.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center shrink-0">
                        <Globe size={16} className="text-brand-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-sm">{edu.degree} in {edu.fieldOfStudy}</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">{edu.institution}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{edu.startYear} — {edu.current ? 'Present' : edu.endYear}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {engineer.reviews?.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-white mb-5">
                  Reviews <span className="text-[var(--color-text-muted)] text-base font-body">({engineer.totalReviews})</span>
                </h2>
                <div className="space-y-4">
                  {engineer.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-xl bg-surface-hover border border-surface-border">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-medium text-brand-300">
                            {review.author.firstName[0]}{review.author.lastName[0]}
                          </div>
                          <span className="text-sm font-medium text-white">{review.author.firstName} {review.author.lastName}</span>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  ))}
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
