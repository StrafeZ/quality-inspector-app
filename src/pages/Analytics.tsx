import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function Analytics() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Quality metrics and performance insights"
      />

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Analytics coming soon</p>
          <p className="mt-2 text-gray-600">
            Quality analytics and trends will be displayed here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
