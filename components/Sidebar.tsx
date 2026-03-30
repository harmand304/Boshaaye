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

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-[var(--color-surface-border)] bg-[var(--color-surface-muted)] px-3 py-6 gap-1">
      {/* Logo */}
      <div className="px-3 mb-6">
        <span className="text-sm font-bold tracking-wide text-[var(--color-brand)]">
          Boshaaye Finance
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[var(--color-surface-raised)] text-[var(--color-brand)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
