import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'

export default function Inspections() {
  return (
    <div>
      <PageHeader
        title="Inspections"
        description="View and manage quality inspections"
      />

      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">No inspections yet</p>
          <p className="mt-2 text-gray-600">
            Inspection reports will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
