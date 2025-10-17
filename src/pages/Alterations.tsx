import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Alterations() {
  return (
    <div>
      <PageHeader
        title="Alterations"
        description="Track and manage quality issues and alterations"
      />

      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">No alterations recorded</p>
          <p className="mt-2 text-gray-600">
            Alteration tracking coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
