import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturedEngineers } from '@/components/sections/FeaturedEngineers'
import { HowItWorks } from '@/components/sections/HowItWorks'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedEngineers />
      <HowItWorks />
      <Footer />
    </main>
  )
}
