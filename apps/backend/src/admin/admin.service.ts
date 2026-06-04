import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { VerificationStatus } from '@prisma/client'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Platform statistics ───────────────────────────────────────

  async getStats() {
    const [
      totalUsers, engineerCount, clientCount, newThisWeek,
      totalJobs, openJobs, inProgressJobs, completedJobs,
      totalContracts, activeContracts, completedContracts, disputedContracts,
      verifiedEngineers, pendingEngineers, unverifiedEngineers,
      payments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ENGINEER' } }),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'OPEN' } }),
      this.prisma.job.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.job.count({ where: { status: 'COMPLETED' } }),
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { status: 'COMPLETED' } }),
      this.prisma.contract.count({ where: { status: 'DISPUTED' } }),
      this.prisma.engineerProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      this.prisma.engineerProfile.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.engineerProfile.count({ where: { verificationStatus: 'UNVERIFIED' } }),
      this.prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, platformFee: true, netAmount: true, createdAt: true },
      }),
    ])

    const now          = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const totalVolume  = payments.reduce((s, p) => s + Number(p.amount), 0)
    const platformRev  = payments.reduce((s, p) => s + Number(p.platformFee), 0)
    const engineerPay  = payments.reduce((s, p) => s + Number(p.netAmount), 0)
    const monthPay     = payments.filter(p => p.createdAt >= startOfMonth)
    const thisMonth    = monthPay.reduce((s, p) => s + Number(p.amount), 0)

    const approvedMilestones = await this.prisma.milestone.findMany({
      where: { status: 'APPROVED' },
      select: { amount: true },
    })
    const pendingPayout = approvedMilestones.reduce((s, m) => s + Number(m.amount), 0)

    return {
      users:     { total: totalUsers, engineers: engineerCount, clients: clientCount, newThisWeek },
      jobs:      { total: totalJobs, open: openJobs, inProgress: inProgressJobs, completed: completedJobs },
      contracts: { total: totalContracts, active: activeContracts, completed: completedContracts, disputed: disputedContracts },
      payments:  { totalVolume, platformRevenue: platformRev, engineerPayouts: engineerPay, thisMonth, pendingPayout },
      engineers: { verified: verifiedEngineers, pending: pendingEngineers, unverified: unverifiedEngineers },
    }
  }

  // ── Users ────────────────────────────────────────────────────

  async getUsers({ search, role, page = 1, limit = 20 }: any) {
    const skip  = (page - 1) * limit
    const where: any = {}
    if (role && role !== 'ALL') where.role = role
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
      ]
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, isEmailVerified: true, lastLoginAt: true, createdAt: true },
      }),
      this.prisma.user.count({ where }),
    ])
    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }

  async updateUser(userId: string, data: { isActive?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')
    return this.prisma.user.update({ where: { id: userId }, data })
  }

  // ── Engineers ────────────────────────────────────────────────

  async getEngineers({ search, verificationStatus, page = 1, limit = 20 }: any) {
    const skip  = (page - 1) * limit
    const where: any = {}
    if (verificationStatus && verificationStatus !== 'ALL') where.verificationStatus = verificationStatus
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName:  { contains: search, mode: 'insensitive' } } },
        { user: { email:     { contains: search, mode: 'insensitive' } } },
      ]
    }
    const [engineers, total] = await Promise.all([
      this.prisma.engineerProfile.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, city: true } } },
      }),
      this.prisma.engineerProfile.count({ where }),
    ])
    return { engineers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }

  async updateEngineerVerification(engineerProfileId: string, status: VerificationStatus) {
    const profile = await this.prisma.engineerProfile.findUnique({ where: { id: engineerProfileId }, include: { user: true } })
    if (!profile) throw new NotFoundException('Engineer profile not found')

    const updated = await this.prisma.engineerProfile.update({
      where: { id: engineerProfileId },
      data: { verificationStatus: status, verifiedAt: status === 'VERIFIED' ? new Date() : null },
    })

    await this.prisma.notification.create({
      data: {
        userId: profile.userId,
        type:   'PROFILE_VERIFIED',
        title:  status === 'VERIFIED' ? '✅ Your profile has been verified!' : '❌ Verification not approved',
        body:   status === 'VERIFIED'
          ? 'Your InjenioRw engineer profile is now verified. A badge will appear on your public profile.'
          : 'Your verification was not approved at this time. Please ensure your profile is complete and accurate.',
      },
    })

    return updated
  }

  // ── Jobs ─────────────────────────────────────────────────────

  async getJobs({ search, status, page = 1, limit = 20 }: any) {
    const skip  = (page - 1) * limit
    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (search) {
      where.OR = [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          clientProfile: { select: { companyName: true, user: { select: { firstName: true, lastName: true } } } },
          _count: { select: { proposals: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ])
    return { jobs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }

  async updateJob(jobId: string, data: { status?: string }) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } })
    if (!job) throw new NotFoundException('Job not found')
    return this.prisma.job.update({ where: { id: jobId }, data: data as any })
  }

  // ── Payments ─────────────────────────────────────────────────

  async getPayments({ search, status, page = 1, limit = 20 }: any) {
    const skip  = (page - 1) * limit
    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (search) {
      where.OR = [
        { momoReference: { contains: search, mode: 'insensitive' } },
        { contract: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }
    const [payments, total, allCompleted] = await Promise.all([
      this.prisma.payment.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { contract: { select: { title: true } }, milestone: { select: { title: true } } },
      }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({ where: { status: 'COMPLETED' }, select: { amount: true, platformFee: true, netAmount: true } }),
    ])
    const summary = {
      totalVolume:     allCompleted.reduce((s, p) => s + Number(p.amount), 0),
      platformRevenue: allCompleted.reduce((s, p) => s + Number(p.platformFee), 0),
      engineerPayouts: allCompleted.reduce((s, p) => s + Number(p.netAmount), 0),
    }
    return { payments, summary, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }
}
