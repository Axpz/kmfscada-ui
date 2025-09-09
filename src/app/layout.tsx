import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono as JetBrainsMono } from 'next/font/google'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/contexts'
import { QueryProvider, ThemeProvider, RealtimeProvider } from '@/providers'
import { Toaster } from 'sonner'
import './globals.css'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = JetBrainsMono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'KFM·Scada',
    template: '%s | KFM·Scada'
  },
  description: 'A modern, real-time industrial monitoring and data acquisition system.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'KFM·Scada',
    description: 'A modern, real-time industrial monitoring and data acquisition system.',
    siteName: 'KFM·Scada',
    images: [{ url: '/kfm-scada-logo-simple.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KFM·Scada',
    description: 'A modern, real-time industrial monitoring and data acquisition system.',
    images: ['/kfm-scada-logo-simple.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1E' }, // Slate 950
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {/* <RealtimeProvider> */}
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            {/* </RealtimeProvider> */}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}