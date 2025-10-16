import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className={cn(
      'mb-8 flex items-start justify-between',
      'flex-col gap-4 sm:flex-row sm:items-start'
    )}>
      {/* Left side: Title and Description */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base text-gray-600">
            {description}
          </p>
        )}
      </div>

      {/* Right side: Actions */}
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}
