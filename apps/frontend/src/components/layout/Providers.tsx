'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b24',
            color: '#f0f6fc',
            border: '1px solid #21262d',
            borderRadius: '12px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#1f9963', secondary: '#f0f6fc' },
          },
          error: {
            iconTheme: { primary: '#f85149', secondary: '#f0f6fc' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
