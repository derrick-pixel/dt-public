import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Discounter SG — Up to 80% Off FMCG',
  description: 'Best deals on groceries, snacks, beverages and daily essentials. Weekly delivery to Singapore dormitories.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Discounter SG',
  },
  openGraph: {
    type: 'website',
    url: 'https://derrick-pixel.github.io/discounter/',
    title: 'Discounter SG — Up to 80% Off FMCG',
    description: 'Best deals on groceries, snacks, beverages and daily essentials. Weekly delivery to Singapore dormitories.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discounter SG — Up to 80% Off FMCG',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} min-h-full bg-gray-50`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
