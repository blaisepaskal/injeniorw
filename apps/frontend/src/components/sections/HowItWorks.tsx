'use client'

import { Search, FileText, Handshake, CreditCard } from 'lucide-react'

const CLIENT_STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Post Your Project',
    desc: 'Describe your engineering need — scope, timeline, budget. Our smart matching surfaces the right talent within hours.',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Review Proposals',
    desc: 'Engineers submit detailed proposals with portfolios, timelines, and pricing. Compare, chat, and shortlist.',
  },
  {
    icon: Handshake,
    step: '03',
    title: 'Award the Contract',
    desc: 'Select your engineer, define milestones, and kick off the project with a protected escrow contract.',
  },
  {
    icon: CreditCard,
    step: '04',
    title: 'Pay via MTN MoMo',
    desc: 'Release milestone payments directly via MTN Mobile Money. Funds held in escrow until you approve each deliverable.',
  },
]

const ENGINEER_STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Build Your Profile',
    desc: 'Showcase your discipline, certifications, portfolio, and past projects. Verification adds a trust badge to your profile.',
  },
  {
    icon: FileText,
    step: '02',
    title: 'Browse & Propose',
    desc: 'Browse active projects matching your discipline. Submit tailored proposals that highlight your expertise.',
  },
  {
    icon: Handshake,
    step: '03',
    title: 'Win & Deliver',
    desc: 'Get hired, work within structured milestones, and communicate directly with clients on the platform.',
  },
  {
    icon: CreditCard,
    step: '04',
    title: 'Get Paid Instantly',
    desc: 'Milestone approvals trigger immediate MTN Mobile Money payouts. No delays, no middlemen.',
  },
]

function StepCard({ icon: Icon, step, title, desc, index }: any) {
  return (
    <div
      className="relative"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      {/* Connector line */}
      {index < 3 && (
        <div className="hidden lg:block absolute top-8 left-[calc(100%+0px)] w-full h-px bg-gradient-to-r from-brand-500/30 to-transparent z-0 pointer-events-none" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }} />
      )}

      <div className="card-dark p-6 relative z-10 hover:border-brand-500/30 transition-all duration-300 group">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
              <Icon size={20} className="text-brand-400" />
            </div>
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-surface-border flex items-center justify-center text-[10px] font-mono font-bold text-[var(--color-text-muted)]">
              {step}
            </span>
          </div>
          <div>
            <h3 className="font-body font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="py-24 bg-surface-card/40 border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-label">Simple Process</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
            How <span className="text-gradient-brand">InjenioRw</span> Works
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Whether you're hiring an engineer or looking for your next project — we've built a streamlined process that respects your time.
          </p>
        </div>

        {/* Tabs */}
        <div className="space-y-16">
          {/* For Clients */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs font-mono font-medium tracking-[0.15em] uppercase text-earth-400">For Clients</span>
              <div className="h-px flex-1 bg-surface-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CLIENT_STEPS.map((step, i) => (
                <StepCard key={step.step} {...step} index={i} />
              ))}
            </div>
          </div>

          {/* For Engineers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs font-mono font-medium tracking-[0.15em] uppercase text-brand-400">For Engineers</span>
              <div className="h-px flex-1 bg-surface-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ENGINEER_STEPS.map((step, i) => (
                <StepCard key={step.step} {...step} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
