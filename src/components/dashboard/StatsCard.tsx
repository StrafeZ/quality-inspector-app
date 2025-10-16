import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  iconColor?: string
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-gray-400'
}: StatsCardProps) {
  return (
    <Card className="relative p-6 border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div
          className={cn(
            'absolute top-4 right-4 flex items-center gap-1 text-xs font-medium',
            trend.positive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {trend.positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </Card>
  )
}
