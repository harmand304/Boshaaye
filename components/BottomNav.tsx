'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Wallet,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',         icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions',       icon: ArrowLeftRight  },
  { label: 'Add',          href: '/transactions/add',   icon: PlusCircle      },
  { label: 'Transfer',     href: '/transfers',          icon: Wallet          },
  { label: 'Settings',     href: '/settings',           icon: Settings        },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-muted)] flex items-center justify-around h-16 z-50">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 text-xs transition-colors ${
              active
                ? 'text-[var(--color-brand)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
