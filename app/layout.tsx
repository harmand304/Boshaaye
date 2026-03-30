import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boshaaye Finance',
  description: 'Agency finance tracker for Harmand and Bako',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className={inter.className}>
      <body>
        {!user ? (
           children
        ) : (
          <div className="flex min-h-screen">
            {/* Left sidebar — desktop only */}
            <Sidebar />
  
            {/* Main content */}
            <div className="flex-1 pb-16 md:pb-0">
              {children}
            </div>
            
            {/* Bottom nav — mobile only */}
            <BottomNav />
          </div>
        )}
      </body>
    </html>
  )
}
