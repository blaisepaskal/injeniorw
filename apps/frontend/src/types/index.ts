// ─── Core Types for InjenioRw Phase 2 ────────────────────────

export type Role = 'ENGINEER' | 'CLIENT' | 'ADMIN'

export type Discipline =
  | 'CIVIL' | 'STRUCTURAL' | 'MECHANICAL' | 'ELECTRICAL'
  | 'ENVIRONMENTAL' | 'GEOTECHNICAL' | 'TRANSPORTATION'
  | 'WATER_RESOURCES' | 'INDUSTRIAL' | 'AEROSPACE'
  | 'CHEMICAL' | 'MINING' | 'OTHER'

export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT'
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
export type JobType = 'HOURLY' | 'FIXED' | 'MILESTONE'
export type JobStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ProposalStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
export type ContractStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  avatarUrl?: string
  phone?: string
  city?: string
  country: string
  timezone: string
  isEmailVerified: boolean
  createdAt: string
  engineerProfile?: EngineerProfile
  clientProfile?: ClientProfile
}

export interface EngineerProfile {
  id: string
  userId: string
  user?: User
  headline?: string
  bio?: string
  discipline: Discipline
  otherDisciplines: Discipline[]
  experienceLevel: ExperienceLevel
  yearsOfExperience: number
  hourlyRate?: number
  availability: AvailabilityStatus
  isPublic: boolean
  isFeatured: boolean
  verificationStatus: VerificationStatus
  avgRating: number
  totalReviews: number
  completedProjects: number
  momoNumber?: string
  momoName?: string
  province?: string
  district?: string
  skills: EngineerSkill[]
  portfolio?: PortfolioItem[]
  certifications?: Certification[]
  education?: Education[]
  workHistory?: WorkHistory[]
  reviews?: Review[]
  _count?: { portfolio: number; reviews: number; contracts: number }
  createdAt: string
}

export interface EngineerSkill {
  id: string
  name: string
  level: number
  yearsUsed: number
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  discipline: Discipline
  imageUrls: string[]
  projectUrl?: string
  client?: string
  highlights: string[]
  completedAt?: string
  createdAt: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialUrl?: string
  verified: boolean
}

export interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: number
  endYear?: number
  current: boolean
  description?: string
}

export interface WorkHistory {
  id: string
  company: string
  title: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

export interface ClientProfile {
  id: string
  userId: string
  user?: User
  companyName?: string
  companySize?: string
  industry?: string
  website?: string
  description?: string
  logoUrl?: string
  isVerified: boolean
  totalSpent: number
  totalJobs: number
  avgRating: number
  createdAt: string
}

export interface Job {
  id: string
  clientProfileId: string
  clientProfile?: ClientProfile
  title: string
  description: string
  discipline: Discipline
  otherDisciplines: Discipline[]
  requiredSkills: string[]
  experienceLevel: ExperienceLevel
  jobType: JobType
  status: JobStatus
  budgetMin?: number
  budgetMax?: number
  hourlyRateMin?: number
  hourlyRateMax?: number
  isRemote: boolean
  location?: string
  province?: string
  duration?: string
  startDate?: string
  deadline?: string
  viewCount: number
  proposalCount: number
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  _count?: { proposals: number }
}

export interface Proposal {
  id: string
  jobId: string
  job?: Job
  engineerProfileId: string
  engineerProfile?: EngineerProfile
  coverLetter: string
  proposedRate: number
  estimatedDuration: string
  status: ProposalStatus
  milestones: ProposedMilestone[]
  attachmentUrls: string[]
  isShortlisted: boolean
  clientViewed: boolean
  createdAt: string
}

export interface ProposedMilestone {
  id: string
  title: string
  description: string
  amount: number
  order: number
  dueDate?: string
}

export interface Milestone {
  id: string
  contractId: string
  title: string
  description: string
  amount: number
  status: MilestoneStatus
  order: number
  dueDate?: string
  submittedAt?: string
  approvedAt?: string
  paidAt?: string
  deliverables: string[]
  feedback?: string
}

export interface Contract {
  id: string
  jobId: string
  job?: Job
  proposalId: string
  engineerProfileId: string
  engineerProfile?: EngineerProfile
  clientProfileId: string
  clientProfile?: ClientProfile
  title: string
  description: string
  status: ContractStatus
  jobType: JobType
  totalAmount: number
  paidAmount: number
  milestones: Milestone[]
  startDate: string
  endDate?: string
  completedAt?: string
  createdAt: string
}

export interface Review {
  id: string
  contractId: string
  authorId: string
  author?: { firstName: string; lastName: string; avatarUrl?: string }
  rating: number
  comment: string
  qualityRating?: number
  communicationRating?: number
  timelinessRating?: number
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

// ─── API Response envelope ────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── UI helpers ───────────────────────────────────────────────

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  CIVIL:          'Civil Engineering',
  STRUCTURAL:     'Structural Engineering',
  MECHANICAL:     'Mechanical Engineering',
  ELECTRICAL:     'Electrical Engineering',
  ENVIRONMENTAL:  'Environmental Engineering',
  GEOTECHNICAL:   'Geotechnical Engineering',
  TRANSPORTATION: 'Transportation Engineering',
  WATER_RESOURCES:'Water Resources',
  INDUSTRIAL:     'Industrial Engineering',
  AEROSPACE:      'Aerospace Engineering',
  CHEMICAL:       'Chemical Engineering',
  MINING:         'Mining Engineering',
  OTHER:          'Other',
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  JUNIOR: 'Junior (0–2 years)',
  MID:    'Mid-level (3–5 years)',
  SENIOR: 'Senior (6–10 years)',
  EXPERT: 'Expert (10+ years)',
}

export const RWANDA_PROVINCES = [
  'Kigali City',
  'Eastern Province',
  'Western Province',
  'Northern Province',
  'Southern Province',
]

export const RWANDA_DISTRICTS: Record<string, string[]> = {
  'Kigali City':       ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province':  ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province':  ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rutsiro', 'Rusizi'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
}
