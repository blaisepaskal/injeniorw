import { PrismaClient, Role, Discipline, ExperienceLevel, AvailabilityStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ENGINEERS = [
  {
    email: 'marie.uwimana@injeniorw.dev',
    firstName: 'Marie Claire', lastName: 'Uwimana',
    city: 'Kigali',
    profile: {
      headline: 'Senior Civil Engineer | Infrastructure & Roads Specialist',
      bio: 'Over 10 years designing and supervising road, bridge, and drainage infrastructure projects across Rwanda and East Africa. Passionate about building the infrastructure that connects communities.',
      discipline: Discipline.CIVIL,
      otherDisciplines: [Discipline.STRUCTURAL],
      experienceLevel: ExperienceLevel.SENIOR,
      yearsOfExperience: 10,
      hourlyRate: 45,
      availability: AvailabilityStatus.AVAILABLE,
      avgRating: 4.97,
      totalReviews: 43,
      completedProjects: 67,
      province: 'Kigali City',
      district: 'Gasabo',
    },
    skills: [
      { name: 'AutoCAD', level: 5, yearsUsed: 9 },
      { name: 'Civil 3D', level: 5, yearsUsed: 7 },
      { name: 'Infrastructure Design', level: 5, yearsUsed: 10 },
      { name: 'Roads & Highways', level: 5, yearsUsed: 10 },
      { name: 'BIM', level: 4, yearsUsed: 4 },
      { name: 'Drainage Design', level: 5, yearsUsed: 8 },
      { name: 'Site Supervision', level: 5, yearsUsed: 10 },
    ],
  },
  {
    email: 'emmanuel.nkurunziza@injeniorw.dev',
    firstName: 'Emmanuel', lastName: 'Nkurunziza',
    city: 'Kigali',
    profile: {
      headline: 'Structural Engineer | High-Rise & Bridge Design',
      bio: 'Specialized in structural analysis and design for multi-story buildings, bridges, and industrial structures. Experienced with ETABS, SAP2000, and BIM workflows.',
      discipline: Discipline.STRUCTURAL,
      otherDisciplines: [Discipline.CIVIL],
      experienceLevel: ExperienceLevel.SENIOR,
      yearsOfExperience: 8,
      hourlyRate: 50,
      availability: AvailabilityStatus.AVAILABLE,
      avgRating: 4.92,
      totalReviews: 28,
      completedProjects: 41,
      province: 'Kigali City',
      district: 'Nyarugenge',
    },
    skills: [
      { name: 'ETABS', level: 5, yearsUsed: 7 },
      { name: 'SAP2000', level: 5, yearsUsed: 6 },
      { name: 'Steel Design', level: 5, yearsUsed: 8 },
      { name: 'Seismic Analysis', level: 4, yearsUsed: 5 },
      { name: 'Revit Structure', level: 4, yearsUsed: 4 },
      { name: 'AutoCAD', level: 5, yearsUsed: 8 },
    ],
  },
  {
    email: 'diane.mukamana@injeniorw.dev',
    firstName: 'Diane', lastName: 'Mukamana',
    city: 'Musanze',
    profile: {
      headline: 'Mechanical Engineer | HVAC & Industrial Systems',
      bio: 'Experienced in HVAC system design, industrial machinery, and thermal analysis. Strong background in SolidWorks and FEA simulation for complex mechanical systems.',
      discipline: Discipline.MECHANICAL,
      otherDisciplines: [],
      experienceLevel: ExperienceLevel.MID,
      yearsOfExperience: 5,
      hourlyRate: 40,
      availability: AvailabilityStatus.BUSY,
      avgRating: 4.89,
      totalReviews: 31,
      completedProjects: 52,
      province: 'Northern Province',
      district: 'Musanze',
    },
    skills: [
      { name: 'SolidWorks', level: 5, yearsUsed: 5 },
      { name: 'HVAC Systems', level: 5, yearsUsed: 4 },
      { name: 'FEA Analysis', level: 4, yearsUsed: 4 },
      { name: 'Thermal Analysis', level: 4, yearsUsed: 3 },
      { name: 'AutoCAD Mechanical', level: 5, yearsUsed: 5 },
    ],
  },
  {
    email: 'patrick.habimana@injeniorw.dev',
    firstName: 'Patrick', lastName: 'Habimana',
    city: 'Kigali',
    profile: {
      headline: 'Electrical Engineer | Power Systems & Solar Energy',
      bio: 'Expert in power system design, PLC programming, and solar energy installations. Delivered 20+ solar projects across Rwanda, supporting rural electrification goals.',
      discipline: Discipline.ELECTRICAL,
      otherDisciplines: [],
      experienceLevel: ExperienceLevel.EXPERT,
      yearsOfExperience: 12,
      hourlyRate: 48,
      availability: AvailabilityStatus.AVAILABLE,
      avgRating: 4.95,
      totalReviews: 57,
      completedProjects: 89,
      province: 'Kigali City',
      district: 'Kicukiro',
    },
    skills: [
      { name: 'Power Systems Design', level: 5, yearsUsed: 12 },
      { name: 'PLC Programming', level: 5, yearsUsed: 10 },
      { name: 'AutoCAD Electrical', level: 5, yearsUsed: 11 },
      { name: 'Solar PV Design', level: 5, yearsUsed: 7 },
      { name: 'SCADA Systems', level: 4, yearsUsed: 6 },
      { name: 'Load Flow Analysis', level: 5, yearsUsed: 10 },
    ],
  },
  {
    email: 'alice.ingabire@injeniorw.dev',
    firstName: 'Alice', lastName: 'Ingabire',
    city: 'Huye',
    profile: {
      headline: 'Environmental Engineer | Water & Sanitation',
      bio: 'Dedicated to sustainable water resource management and environmental impact assessments. Strong experience working with NGOs and government agencies on WASH projects.',
      discipline: Discipline.ENVIRONMENTAL,
      otherDisciplines: [Discipline.WATER_RESOURCES],
      experienceLevel: ExperienceLevel.MID,
      yearsOfExperience: 6,
      hourlyRate: 38,
      availability: AvailabilityStatus.AVAILABLE,
      avgRating: 4.88,
      totalReviews: 22,
      completedProjects: 34,
      province: 'Southern Province',
      district: 'Huye',
    },
    skills: [
      { name: 'Environmental Impact Assessment', level: 5, yearsUsed: 6 },
      { name: 'Water Quality Analysis', level: 5, yearsUsed: 5 },
      { name: 'GIS Mapping', level: 4, yearsUsed: 4 },
      { name: 'WASH Design', level: 5, yearsUsed: 6 },
      { name: 'ArcGIS', level: 4, yearsUsed: 3 },
    ],
  },
]

const CLIENTS = [
  {
    email: 'infrastructure@rwandan-dev.rw',
    firstName: 'Rwanda', lastName: 'Infrastructure Ltd',
    city: 'Kigali',
    company: {
      companyName: 'Rwanda Infrastructure Development Ltd',
      industry: 'Construction & Infrastructure',
      companySize: '51-200',
      website: 'https://ridl.rw',
      isVerified: true,
    },
  },
  {
    email: 'projects@kigalibuilds.rw',
    firstName: 'Kigali', lastName: 'Builds',
    city: 'Kigali',
    company: {
      companyName: 'Kigali Builds Ltd',
      industry: 'Real Estate & Construction',
      companySize: '11-50',
      website: 'https://kigalibuilds.rw',
      isVerified: true,
    },
  },
]

async function main() {
  console.log('🌱 Seeding InjenioRw database...')

  const passwordHash = await bcrypt.hash('Password123!', 12)

  // Seed engineers
  for (const eng of ENGINEERS) {
    const user = await prisma.user.upsert({
      where: { email: eng.email },
      update: {},
      create: {
        email: eng.email,
        passwordHash,
        role: Role.ENGINEER,
        firstName: eng.firstName,
        lastName: eng.lastName,
        city: eng.city,
        isEmailVerified: true,
      },
    })

    const profile = await prisma.engineerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...eng.profile,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        isPublic: true,
        isFeatured: true,
      },
    })

    // Add skills
    for (const skill of eng.skills) {
      await prisma.engineerSkill.upsert({
        where: { engineerProfileId_name: { engineerProfileId: profile.id, name: skill.name } },
        update: {},
        create: { engineerProfileId: profile.id, ...skill },
      })
    }

    console.log(`  ✅ Engineer: ${eng.firstName} ${eng.lastName}`)
  }

  // Seed clients
  for (const client of CLIENTS) {
    const user = await prisma.user.upsert({
      where: { email: client.email },
      update: {},
      create: {
        email: client.email,
        passwordHash,
        role: Role.CLIENT,
        firstName: client.firstName,
        lastName: client.lastName,
        city: client.city,
        isEmailVerified: true,
      },
    })

    await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, ...client.company },
    })

    console.log(`  ✅ Client: ${client.company.companyName}`)
  }

  console.log('\n✨ Seed complete!')
  console.log('\n📋 Test credentials (all share password: Password123!)')
  console.log('   Engineers:', ENGINEERS.map(e => e.email).join(', '))
  console.log('   Clients:  ', CLIENTS.map(c => c.email).join(', '))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
