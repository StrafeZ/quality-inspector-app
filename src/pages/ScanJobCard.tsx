import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { QrCode } from 'lucide-react'

export default function ScanJobCard() {
  return (
    <div>
      <PageHeader
        title="Scan Job Card"
        description="QR code scanning for quality inspection"
      />

      <Card>
        <CardContent className="py-12 text-center">
          <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">QR Scanner coming soon</p>
          <p className="mt-2 text-gray-600">
            Scan job card QR codes to start inspection
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
