"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Network,
  Search,
  UsersRound
} from 'lucide-react'
import { AccountSwitcher } from './account-switcher'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Teams', href: '/teams', icon: UsersRound },
  { name: 'Org Chart', href: '/org-chart', icon: Network },
  { name: 'Search', href: '/search', icon: Search },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200/80">
      {/* Logo/Title */}
      <div className="flex h-16 items-center border-b border-gray-200/80 px-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Echelon HRIS
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-gray-900" : "text-gray-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Account Switcher */}
      <div className="p-4">
        <AccountSwitcher />
      </div>
    </div>
  )
}
