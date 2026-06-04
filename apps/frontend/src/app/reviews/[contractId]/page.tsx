'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Send, ChevronLeft } from 'lucide-react'
import { useContract } from '@/hooks'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface RatingCategory {
  key: string
  label: string
  description: string
}

const ENGINEER_CATEGORIES: RatingCategory[] = [
  { key: 'qualityRating',       label: 'Quality of Work',   description: 'Technical quality of deliverables' },
  { key: 'communicationRating', label: 'Communication',     description: 'Responsiveness and clarity' },
  { key: 'timelinessRating',    label: 'Timeliness',        description: 'Met deadlines and milestones' },
  { key: 'valueRating',         label: 'Value for Money',   description: 'Worth the rate charged' },
]

const CLIENT_CATEGORIES: RatingCategory[] = [
  { key: 'qualityRating',       label: 'Clear Requirements', description: 'Provided clear project specs' },
  { key: 'communicationRating', label: 'Communication',      description: 'Responsive and organised' },
  { key: 'timelinessRating',    label: 'Timely Feedback',    description: 'Reviewed deliverables promptly' },
  { key: 'valueRating',         label: 'Payment',            description: 'Released payments on time' },
]

function StarRatingInput({ value, onChange, label, description }: { value: number; onChange: (v: number) => void; label: string; description: string }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surface-hover border border-surface-border">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110">
            <Star size={24} className={cn('transition-colors', (hovered || value) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-surface-border')} />
          </button>
        ))}
      </div>
    </div>
  )
}

const OVERALL_LABELS = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent']

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const contractId = params.contractId as string

  const { data: contractData } = useContract(contractId)
  const contract = (contractData as any)?.data

  const [overallRating,       setOverallRating]       = useState(0)
  const [qualityRating,       setQualityRating]       = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [timelinessRating,    setTimelinessRating]    = useState(0)
  const [valueRating,         setValueRating]         = useState(0)
  const [comment,             setComment]             = useState('')
  const [isSubmitting,        setIsSubmitting]        = useState(false)
  const [hovered,             setHovered]             = useState(0)

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user])

  const isEngineer = user?.role === 'ENGINEER'
  const categories = isEngineer ? CLIENT_CATEGORIES : ENGINEER_CATEGORIES

  const reviewTargetName = (() => {
    if (!contract || !user) return '...'
    if (isEngineer) {
      const c = contract.clientProfile
      return c?.companyName || `${c?.user?.firstName} ${c?.user?.lastName}`
    }
    const e = contract.engineerProfile
    return `${e?.user?.firstName} ${e?.user?.lastName}`
  })()

  const handleSubmit = async () => {
    if (overallRating === 0) { toast.error('Please give an overall rating'); return }
    if (comment.trim().length < 20) { toast.error('Please write at least 20 characters in your review'); return }

    setIsSubmitting(true)
    try {
      await api.post('/reviews', {
        contractId,
        rating:              overallRating,
        comment:             comment.trim(),
        qualityRating:       qualityRating       || undefined,
        communicationRating: communicationRating || undefined,
        timelinessRating:    timelinessRating    || undefined,
        valueRating:         valueRating         || undefined,
      })
      toast.success('Review submitted! Thank you for your feedback.')
      router.push(`/contracts/${contractId}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        <Link href={`/contracts/${contractId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-white mb-8 transition-colors">
          <ChevronLeft size={14} /> Back to contract
        </Link>

        <div className="mb-8">
          <p className="section-label">Review</p>
          <h1 className="font-display text-3xl text-white mb-2">Leave a Review for {reviewTargetName}</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Your honest feedback helps build trust in Rwanda's engineering community.
            Reviews are public and cannot be edited after submission.
          </p>
        </div>

        <div className="space-y-6">
          <div className="card-dark p-6">
            <h2 className="font-display text-lg text-white mb-4">Overall Rating</h2>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setOverallRating(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110">
                    <Star size={36} className={cn('transition-colors', (hovered || overallRating) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-surface-border')} />
                  </button>
                ))}
              </div>
              {(hovered || overallRating) > 0 && (
                <p className="text-sm font-medium text-white animate-fade-in">{OVERALL_LABELS[hovered || overallRating]}</p>
              )}
            </div>
          </div>

          <div className="card-dark p-6">
            <h2 className="font-display text-lg text-white mb-4">Rate Specific Areas</h2>
            <div className="space-y-3">
              <StarRatingInput value={qualityRating}       onChange={setQualityRating}       label={categories[0].label} description={categories[0].description} />
              <StarRatingInput value={communicationRating} onChange={setCommunicationRating} label={categories[1].label} description={categories[1].description} />
              <StarRatingInput value={timelinessRating}    onChange={setTimelinessRating}    label={categories[2].label} description={categories[2].description} />
              <StarRatingInput value={valueRating}         onChange={setValueRating}         label={categories[3].label} description={categories[3].description} />
            </div>
          </div>

          <div className="card-dark p-6">
            <h2 className="font-display text-lg text-white mb-2">Written Review</h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">Minimum 20 characters. Be specific about the work done and your experience.</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={5}
              className="input-dark resize-none w-full"
              placeholder={isEngineer
                ? 'Describe your experience working with this client. Were requirements clear? Was communication good? Were payments released on time?'
                : 'Describe the quality of work delivered. Was the engineer professional, timely, and technically skilled?'
              }
            />
            <div className="flex justify-end mt-1.5">
              <span className={cn('text-xs font-mono', comment.length < 20 ? 'text-[var(--color-text-muted)]' : 'text-brand-400')}>
                {comment.length} / 20 min
              </span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || overallRating === 0}
            className="btn-primary w-full justify-center py-4 gap-2 text-base"
          >
            {isSubmitting
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Submitting…</>
              : <><Send size={18} /> Submit Review</>
            }
          </button>

          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Reviews are permanent and will appear publicly on {reviewTargetName}'s profile.
          </p>
        </div>
      </main>
    </div>
  )
}
