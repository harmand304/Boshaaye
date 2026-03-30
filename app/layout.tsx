import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boshaaye Finance',
  description: 'Agency finance tracker for Harmand and Bako',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="flex min-h-screen">
          {/* Left sidebar — desktop only */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 pb-16 md:pb-0">
            {children}
          </div>
        </div>

        {/* Bottom nav — mobile only */}
        <BottomNav />
      </body>
    </html>
  )
}
