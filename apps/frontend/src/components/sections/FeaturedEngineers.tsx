'use client'

import Link from 'next/link'
import { Star, MapPin, Briefcase, ChevronRight, Award } from 'lucide-react'

const ENGINEERS = [
  {
    id: '1',
    name: 'Marie Claire Uwimana',
    title: 'Senior Civil Engineer',
    discipline: 'Civil',
    rating: 4.97,
    reviews: 43,
    hourlyRate: 45,
    location: 'Kigali, Rwanda',
    availability: 'available',
    completedProjects: 67,
    skills: ['Infrastructure', 'Roads & Highways', 'AutoCAD', 'BIM'],
    badge: 'Top Rated',
    initials: 'MCU',
    color: '#1f9963',
  },
  {
    id: '2',
    name: 'Emmanuel Nkurunziza',
    title: 'Structural Engineer',
    discipline: 'Structural',
    rating: 4.92,
    reviews: 28,
    hourlyRate: 50,
    location: 'Kigali, Rwanda',
    availability: 'available',
    completedProjects: 41,
    skills: ['Steel Design', 'Seismic Analysis', 'ETABS', 'SAP2000'],
    badge: 'Expert',
    initials: 'EN',
    color: '#0057A4',
  },
  {
    id: '3',
    name: 'Diane Mukamana',
    title: 'Mechanical Engineer',
    discipline: 'Mechanical',
    rating: 4.89,
    reviews: 31,
    hourlyRate: 40,
    location: 'Musanze, Rwanda',
    availability: 'busy',
    completedProjects: 52,
    skills: ['HVAC Systems', 'SolidWorks', 'FEA', 'Thermal Analysis'],
    badge: 'Rising Talent',
    initials: 'DM',
    color: '#d97f27',
  },
  {
    id: '4',
    name: 'Patrick Habimana',
    title: 'Electrical Engineer',
    discipline: 'Electrical',
    rating: 4.95,
    reviews: 57,
    hourlyRate: 48,
    location: 'Kigali, Rwanda',
    availability: 'available',
    completedProjects: 89,
    skills: ['Power Systems', 'PLC Programming', 'AutoCAD Electrical', 'Solar'],
    badge: 'Top Rated',
    initials: 'PH',
    color: '#FAD201',
  },
]

function EngineerCard({ engineer }: { engineer: typeof ENGINEERS[0] }) {
  return (
    <Link
      href={`/engineers/${engineer.id}`}
      className="group block card-dark p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display text-lg font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${engineer.color}cc, ${engineer.color}66)`, border: `1px solid ${engineer.color}44` }}
          >
            {engineer.initials}
          </div>
          <div>
            <h3 className="font-body font-semibold text-white text-sm group-hover:text-brand-400 transition-colors">
              {engineer.name}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">{engineer.title}</p>
          </div>
        </div>

        {/* Badge */}
        <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full ${
          engineer.badge === 'Top Rated'
            ? 'bg-earth-500/15 text-earth-300 border border-earth-500/30'
            : engineer.badge === 'Expert'
            ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
            : 'bg-rwandan-blue/15 text-blue-300 border border-rwandan-blue/30'
        }`}>
          {engineer.badge === 'Top Rated' && <Award size={10} className="inline mr-1" />}
          {engineer.badge}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-4 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <MapPin size={11} className="text-brand-500" />
          {engineer.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={11} className="text-brand-500" />
          {engineer.completedProjects} projects
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <Star size={14} className="text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-semibold text-white">{engineer.rating}</span>
        <span className="text-xs text-[var(--color-text-muted)]">({engineer.reviews} reviews)</span>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
            engineer.availability === 'available' ? 'badge-available' : 'badge-busy'
          }`}
        >
          {engineer.availability === 'available' ? '● Available' : '● Busy'}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {engineer.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="text-xs px-2.5 py-1 rounded-lg bg-surface-hover border border-surface-border text-[var(--color-text-secondary)]"
          >
            {skill}
          </span>
        ))}
        {engineer.skills.length > 3 && (
          <span className="text-xs px-2.5 py-1 rounded-lg text-[var(--color-text-muted)]">
            +{engineer.skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <div>
          <span className="text-lg font-display font-bold text-white">${engineer.hourlyRate}</span>
          <span className="text-xs text-[var(--color-text-muted)]">/hr</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
          View Profile <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  )
}

export function FeaturedEngineers() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <p className="section-label">Featured Talent</p>
          <h2 className="font-display text-4xl md:text-5xl text-white">
            Rwanda's Best Engineers,<br />
            <span className="text-gradient-brand">Ready to Deliver.</span>
          </h2>
        </div>
        <Link
          href="/engineers"
          className="flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors whitespace-nowrap"
        >
          View all engineers <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ENGINEERS.map((engineer) => (
          <EngineerCard key={engineer.id} engineer={engineer} />
        ))}
      </div>
    </section>
  )
}
