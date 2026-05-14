import type { Metadata } from 'next'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'InjenioRw — Rwanda\'s Engineering Talent, Delivered',
    template: '%s | InjenioRw',
  },
  description: 'Connect with Rwanda\'s finest engineers — civil, mechanical, structural, electrical and beyond. World-class talent, locally rooted.',
  keywords: ['Rwanda engineers', 'engineering jobs Rwanda', 'civil engineer Kigali', 'freelance engineer Africa', 'InjenioRw'],
  authors: [{ name: 'InjenioRw' }],
  creator: 'InjenioRw',
  openGraph: {
    type: 'website',
    locale: 'en_RW',
    url: 'https://injeniorw.com',
    siteName: 'InjenioRw',
    title: 'InjenioRw — Rwanda\'s Engineering Talent',
    description: 'The premier engineering talent marketplace for Rwanda and beyond.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InjenioRw',
    description: 'Rwanda\'s premier engineering talent marketplace.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1f9963',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
