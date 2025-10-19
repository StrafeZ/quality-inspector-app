import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  QrCode,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  User,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Scan Job Card', href: '/scan', icon: QrCode },
  { name: 'Inspections', href: '/inspections', icon: ClipboardList },
  { name: 'Alterations', href: '/alterations', icon: AlertTriangle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-gray-900" />
          <h1 className="text-lg font-bold tracking-tight text-gray-900">MAC QUALITY</h1>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Settings
          </p>
          <Link
            to="/settings/alteration-templates"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/settings/alteration-templates'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Alteration Templates</span>
          </Link>
        </div>

        {/* Profile Section */}
        <div className="mt-8">
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/profile'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
